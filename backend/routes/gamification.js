/**
 * Advanced Gamification routes
 * Quêtes beauté avancées
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /gamification/quests
 * List beauty quests
 */
router.get('/quests', async (req, res, next) => {
  try {
    const { quest_type, difficulty, is_active, limit = 50 } = req.query;

    let query = req.supabase
      .from('beauty_quests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (quest_type) {
      query = query.eq('quest_type', quest_type);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gamification/quests
 * Create beauty quest (admin only)
 */
router.post('/quests', requireAdmin(), async (req, res, next) => {
  try {
    const { quest_name, quest_type, description, points_reward, badge_reward, nft_reward, requirements, difficulty } = req.body;

    if (!quest_name || !quest_type) {
      return res.status(400).json({ error: true, message: 'quest_name and quest_type required' });
    }

    const { data, error } = await supabaseAdmin
      .from('beauty_quests')
      .insert({
        quest_name,
        quest_type,
        description: description || null,
        points_reward: points_reward || 0,
        badge_reward: badge_reward || null,
        nft_reward: nft_reward || false,
        requirements: requirements || {},
        difficulty: difficulty || 'medium',
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /gamification/my-quests
 * Get user's quest progress
 */
router.get('/my-quests', async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = req.supabase
      .from('user_quest_progress')
      .select(`
        *,
        beauty_quests (*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gamification/quests/:id/start
 * Start a quest
 */
router.post('/quests/:id/start', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check quest exists and is active
    const { data: quest } = await req.supabase
      .from('beauty_quests')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (!quest) {
      return res.status(404).json({ error: true, message: 'Quest not found or inactive' });
    }

    // Check if already started
    const { data: existing } = await req.supabase
      .from('user_quest_progress')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('quest_id', id)
      .single();

    if (existing) {
      return res.json(existing);
    }

    const { data, error } = await req.supabase
      .from('user_quest_progress')
      .insert({
        user_id: req.user.id,
        quest_id: id,
        status: 'in_progress',
        progress: {},
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /gamification/quests/:id/complete
 * Complete a quest
 */
router.post('/quests/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: progress } = await req.supabase
      .from('user_quest_progress')
      .select(`
        *,
        beauty_quests (*)
      `)
      .eq('user_id', req.user.id)
      .eq('quest_id', id)
      .single();

    if (!progress) {
      return res.status(404).json({ error: true, message: 'Quest progress not found' });
    }

    if (progress.status === 'completed') {
      return res.status(400).json({ error: true, message: 'Quest already completed' });
    }

    const quest = progress.beauty_quests;

    // Update progress
    await req.supabase
      .from('user_quest_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', progress.id);

    // Award points
    if (quest.points_reward > 0) {
      await req.supabase.from('point_transactions').insert({
        client_id: req.user.id,
        points: quest.points_reward,
        transaction_type: 'earned',
        source_type: 'beauty_quest',
        source_id: id,
        description: `Completed quest: ${quest.quest_name}`,
      });

      // Update loyalty points
      const { data: loyalty } = await req.supabase
        .from('loyalty_points')
        .select('points, lifetime_points')
        .eq('client_id', req.user.id)
        .single();

      if (loyalty) {
        await req.supabase
          .from('loyalty_points')
          .update({
            points: Number(loyalty.points) + quest.points_reward,
            lifetime_points: Number(loyalty.lifetime_points || 0) + quest.points_reward,
          })
          .eq('client_id', req.user.id);
      }
    }

    res.json({ success: true, points_earned: quest.points_reward, badge: quest.badge_reward });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
