/**
 * Admin routes - full access
 * GET /admin/product-handlings - all employee product assignments
 * GET /admin/distributors - list distributors
 * POST /admin/distributors - create distributor
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin());

/**
 * GET /admin/product-handlings
 * Returns all employee-product-country assignments
 * FUTURE GROK: AI could analyze handling patterns for optimization.
 */
router.get('/product-handlings', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('employee_product_handling')
      .select(`
        *,
        products (id, name),
        profiles:employee_id (id, full_name, role)
      `)
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
 * GET /admin/clients
 * List clients (for invoice creation etc.)
 */
router.get('/clients', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client')
      .order('full_name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/distributors
 */
router.get('/distributors', async (req, res, next) => {
  try {
    const country = req.query.country;
    let query = supabaseAdmin.from('distributors').select('*').order('country');

    if (country) {
      query = query.eq('country', country);
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
 * POST /admin/distributors
 * Body: { name, country, photo_url, contact_info }
 */
router.post('/distributors', async (req, res, next) => {
  try {
    const { name, country, photo_url, contact_info } = req.body;

    if (!name || !country) {
      return res.status(400).json({ error: true, message: 'name and country required' });
    }

    const { data, error } = await supabaseAdmin
      .from('distributors')
      .insert({ name, country, photo_url: photo_url || null, contact_info: contact_info || null })
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
 * GET /admin/users
 * List all users with profiles
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, country, created_at')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (role) {
      query = query.eq('role', role);
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
 * PATCH /admin/users/:id
 * Update user role
 */
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['client', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({ error: true, message: 'Valid role required' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/consultations
 * List all consultations
 */
router.get('/consultations', async (req, res, next) => {
  try {
    const { status, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('consultations')
      .select('*')
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
 * GET /admin/appointments
 * List all appointments
 */
router.get('/appointments', async (req, res, next) => {
  try {
    const { status, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        profiles:client_id (id, full_name, email),
        profiles:employee_id (id, full_name, email)
      `)
      .order('datetime', { ascending: false })
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
 * GET /admin/reviews
 * List all reviews
 */
router.get('/reviews', async (req, res, next) => {
  try {
    const { rating, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        *,
        products (id, name),
        profiles:client_id (id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (rating) {
      query = query.eq('rating', parseInt(rating, 10));
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
 * DELETE /admin/reviews/:id
 * Delete review (admin only)
 */
router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/subscriptions
 * List all subscriptions
 */
router.get('/subscriptions', async (req, res, next) => {
  try {
    const { status, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        products (id, name),
        profiles:client_id (id, full_name, email)
      `)
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
 * GET /admin/dashboard
 * Admin dashboard stats
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: totalProducts },
      { data: todayOrders },
      { data: recentOrders },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total').gte('created_at', todayStart),
      supabaseAdmin.from('orders').select('id, total, status, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const todayRevenue = (todayOrders || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        todayOrders: todayOrders?.length || 0,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
      },
      recentOrders: recentOrders || [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /admin/quests
 * List all quests (admin only - includes inactive)
 */
router.get('/quests', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('quests')
      .select('*')
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
 * POST /admin/quests
 * Create quest
 */
router.post('/quests', async (req, res, next) => {
  try {
    const { name, description, quest_type, points_reward, is_active } = req.body;

    if (!name || !quest_type || !points_reward) {
      return res.status(400).json({ error: true, message: 'name, quest_type, and points_reward required' });
    }

    const { data, error } = await supabaseAdmin
      .from('quests')
      .insert({
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        quest_type,
        points_reward: parseInt(points_reward, 10),
        is_active: is_active !== false,
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
 * PATCH /admin/quests/:id
 * Update quest
 */
router.patch('/quests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, quest_type, points_reward, is_active } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (description !== undefined) updates.description = description ? String(description).trim() : null;
    if (quest_type !== undefined) updates.quest_type = quest_type;
    if (points_reward !== undefined) updates.points_reward = parseInt(points_reward, 10);
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('quests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: true, message: 'Quest not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /admin/quests/:id
 * Delete quest
 */
router.delete('/quests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('quests').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
