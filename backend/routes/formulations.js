/**
 * Personalized Formulations routes
 * Formulations personnalisées sur mesure
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /formulations
 * List personalized formulations
 */
router.get('/', async (req, res, next) => {
  try {
    const { user_id, status, limit = 50 } = req.query;
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin && user_id ? user_id : req.user.id;

    let query = req.supabase
      .from('personalized_formulations')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

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
 * POST /formulations
 * Create personalized formulation
 */
router.post('/', async (req, res, next) => {
  try {
    const { formulation_name, skin_type, skin_concerns, ingredients, formulation_data } = req.body;

    if (!formulation_name || !ingredients || !formulation_data) {
      return res.status(400).json({ error: true, message: 'formulation_name, ingredients, and formulation_data required' });
    }

    const { data, error } = await req.supabase
      .from('personalized_formulations')
      .insert({
        user_id: req.user.id,
        formulation_name,
        skin_type: skin_type || null,
        skin_concerns: skin_concerns || [],
        ingredients,
        formulation_data,
        status: 'draft',
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
 * PATCH /formulations/:id/status
 * Update formulation status (admin only for approval/manufacturing)
 */
router.patch('/:id/status', requireAdmin(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, order_id } = req.body;

    if (!status) {
      return res.status(400).json({ error: true, message: 'status required' });
    }

    const updates = { status };
    if (order_id) updates.order_id = order_id;

    const { data, error } = await supabaseAdmin
      .from('personalized_formulations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
