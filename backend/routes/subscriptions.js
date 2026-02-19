/**
 * Subscriptions routes
 * GET  /subscriptions - list subscriptions
 * POST /subscriptions - create subscription
 * PATCH /subscriptions/:id - update subscription
 * POST /subscriptions/:id/pause - pause subscription
 * POST /subscriptions/:id/resume - resume subscription
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /subscriptions
 * List subscriptions
 */
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const isAdmin = req.userRole === 'admin';

    let query = req.supabase
      .from('subscriptions')
      .select(`
        *,
        products (id, name, image_url, price)
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('client_id', req.user.id);
    }

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
 * POST /subscriptions
 * Create subscription
 */
router.post('/', async (req, res, next) => {
  try {
    const { product_id, plan_type, amount, billing_cycle_start, customization } = req.body;

    if (!plan_type || !amount || !billing_cycle_start) {
      return res.status(400).json({ error: true, message: 'plan_type, amount, and billing_cycle_start required' });
    }

    const startDate = new Date(billing_cycle_start);
    let endDate = new Date(startDate);
    let nextBilling = new Date(startDate);

    switch (plan_type) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        nextBilling.setMonth(nextBilling.getMonth() + 3);
        break;
      case 'biannual':
        endDate.setMonth(endDate.getMonth() + 6);
        nextBilling.setMonth(nextBilling.getMonth() + 6);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
    }

    const { data, error } = await req.supabase
      .from('subscriptions')
      .insert({
        client_id: req.user.id,
        product_id: product_id || null,
        plan_type,
        amount: Number(amount),
        billing_cycle_start: startDate.toISOString().split('T')[0],
        billing_cycle_end: endDate.toISOString().split('T')[0],
        next_billing_date: nextBilling.toISOString().split('T')[0],
        customization: customization || null,
        status: 'active',
        auto_renew: true,
      })
      .select(`
        *,
        products (id, name, image_url, price)
      `)
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
 * PATCH /subscriptions/:id
 * Update subscription
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { auto_renew, customization } = req.body;
    const isAdmin = req.userRole === 'admin';

    const { data: subscription } = await req.supabase
      .from('subscriptions')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: true, message: 'Subscription not found' });
    }

    if (!isAdmin && subscription.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const updates = {};
    if (auto_renew !== undefined) updates.auto_renew = auto_renew;
    if (customization !== undefined) updates.customization = customization;

    const { data, error } = await req.supabase
      .from('subscriptions')
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

/**
 * POST /subscriptions/:id/pause
 * Pause subscription
 */
router.post('/:id/pause', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: subscription } = await req.supabase
      .from('subscriptions')
      .select('client_id, status')
      .eq('id', id)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: true, message: 'Subscription not found' });
    }

    if (subscription.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const { data, error } = await req.supabase
      .from('subscriptions')
      .update({ status: 'paused' })
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

/**
 * POST /subscriptions/:id/resume
 * Resume subscription
 */
router.post('/:id/resume', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: subscription } = await req.supabase
      .from('subscriptions')
      .select('client_id, status')
      .eq('id', id)
      .single();

    if (!subscription) {
      return res.status(404).json({ error: true, message: 'Subscription not found' });
    }

    if (subscription.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const { data, error } = await req.supabase
      .from('subscriptions')
      .update({ status: 'active' })
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
