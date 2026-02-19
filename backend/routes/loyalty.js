/**
 * Loyalty & Gamification routes
 * GET  /loyalty/points - get client points
 * POST /loyalty/points/earn - earn points (admin/system)
 * POST /loyalty/points/redeem - redeem points
 * GET  /loyalty/quests - list available quests
 * GET  /loyalty/quests/my - get client quests
 * POST /loyalty/quests/:id/complete - complete quest
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /loyalty/points
 * Get client loyalty points
 */
router.get('/points', async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('loyalty_points')
      .select('*')
      .eq('client_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      // Initialize if doesn't exist
      const { data: newData } = await req.supabase
        .from('loyalty_points')
        .insert({ client_id: req.user.id, points: 0, tier: 'bronze' })
        .select()
        .single();
      return res.json(newData || { client_id: req.user.id, points: 0, tier: 'bronze' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /loyalty/points/earn
 * Earn points (admin or system)
 */
router.post('/points/earn', async (req, res, next) => {
  try {
    const { client_id, points, source_type, source_id, description, expires_at } = req.body;
    const isAdmin = req.userRole === 'admin';
    const targetClientId = isAdmin ? client_id : req.user.id;

    if (!targetClientId || !points) {
      return res.status(400).json({ error: true, message: 'client_id and points required' });
    }

    if (!isAdmin && targetClientId !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    // Get or create loyalty points
    let { data: loyalty } = await req.supabase
      .from('loyalty_points')
      .select('*')
      .eq('client_id', targetClientId)
      .single();

    if (!loyalty) {
      const { data: newLoyalty } = await req.supabase
        .from('loyalty_points')
        .insert({ client_id: targetClientId, points: 0, tier: 'bronze' })
        .select()
        .single();
      loyalty = newLoyalty;
    }

    const newPoints = Number(loyalty.points) + Number(points);
    const newLifetime = Number(loyalty.lifetime_points || 0) + Number(points);

    // Update tier based on lifetime points
    let newTier = 'bronze';
    if (newLifetime >= 10000) newTier = 'diamond';
    else if (newLifetime >= 5000) newTier = 'platinum';
    else if (newLifetime >= 2000) newTier = 'gold';
    else if (newLifetime >= 500) newTier = 'silver';

    await req.supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        lifetime_points: newLifetime,
        tier: newTier,
        last_activity: new Date().toISOString(),
      })
      .eq('client_id', targetClientId);

    // Create transaction record
    await req.supabase.from('point_transactions').insert({
      client_id: targetClientId,
      points: Number(points),
      transaction_type: 'earned',
      source_type: source_type || null,
      source_id: source_id || null,
      description: description || 'Points earned',
      expires_at: expires_at || null,
    });

    res.json({ success: true, points: newPoints, tier: newTier });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /loyalty/quests
 * List available quests
 */
router.get('/quests', async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /loyalty/quests/my
 * Get client's quests
 */
router.get('/quests/my', async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('client_quests')
      .select(`
        *,
        quests (*)
      `)
      .eq('client_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /loyalty/quests/:id/complete
 * Complete quest
 */
router.post('/quests/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: quest } = await req.supabase
      .from('quests')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (!quest) {
      return res.status(404).json({ error: true, message: 'Quest not found' });
    }

    // Get or create client quest
    let { data: clientQuest } = await req.supabase
      .from('client_quests')
      .select('*')
      .eq('client_id', req.user.id)
      .eq('quest_id', id)
      .single();

    if (!clientQuest) {
      const { data: newCQ } = await req.supabase
        .from('client_quests')
        .insert({
          client_id: req.user.id,
          quest_id: id,
          status: 'in_progress',
          progress: {},
        })
        .select()
        .single();
      clientQuest = newCQ;
    }

    if (clientQuest.status === 'completed') {
      return res.status(400).json({ error: true, message: 'Quest already completed' });
    }

    // Mark as completed
    await req.supabase
      .from('client_quests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', clientQuest.id);

    // Award points
    if (quest.points_reward > 0) {
      await req.supabase.from('point_transactions').insert({
        client_id: req.user.id,
        points: quest.points_reward,
        transaction_type: 'earned',
        source_type: 'quest',
        source_id: id,
        description: `Completed quest: ${quest.name}`,
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

    res.json({ success: true, points_earned: quest.points_reward });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
