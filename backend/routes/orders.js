/**
 * Orders routes
 * GET  /orders - list orders
 * POST /orders - create order
 * GET  /orders/:id - get order details
 * PATCH /orders/:id - update order status
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /orders
 * List orders for current user (client sees own, admin sees all)
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const isAdmin = req.userRole === 'admin';
    
    let query = req.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (id, name, image_url, category)
        ),
        profiles:client_id (id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

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
 * POST /orders
 * Create new order
 */
router.post('/', async (req, res, next) => {
  try {
    const { items, country, shipping_address, billing_address, payment_method, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: true, message: 'items array required' });
    }

    if (!country) {
      return res.status(400).json({ error: true, message: 'country required' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product } = await req.supabase
        .from('products')
        .select('id, name, price')
        .eq('id', item.product_id)
        .single();

      if (!product) {
        return res.status(400).json({ error: true, message: `Product ${item.product_id} not found` });
      }

      const price = Number(product.price) || 0;
      const quantity = parseInt(item.quantity, 10) || 1;
      const itemTotal = price * quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity,
        price,
        total: itemTotal,
      });
    }

    const tax = subtotal * 0.13; // 13% tax (adjust as needed)
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create order
    const { data: order, error: orderError } = await req.supabase
      .from('orders')
      .insert({
        client_id: req.user.id,
        employee_id: req.body.employee_id || null,
        total,
        subtotal,
        tax,
        shipping,
        country,
        shipping_address: shipping_address || null,
        billing_address: billing_address || null,
        payment_method: payment_method || null,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      return res.status(500).json({ error: true, message: orderError.message });
    }

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await req.supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      return res.status(500).json({ error: true, message: itemsError.message });
    }

    // Track analytics
    await supabaseAdmin.from('analytics_events').insert({
      user_id: req.user.id,
      event_type: 'order_created',
      event_category: 'ecommerce',
      value: total,
      metadata: { order_id: order.id, country },
    });

    // Get full order with items
    const { data: fullOrder } = await req.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (id, name, image_url, category)
        )
      `)
      .eq('id', order.id)
      .single();

    res.status(201).json(fullOrder);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /orders/:id
 * Get order details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    let query = req.supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (id, name, image_url, category, price)
        ),
        profiles:client_id (id, full_name, email),
        profiles:employee_id (id, full_name)
      `)
      .eq('id', id)
      .single();

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: true, message: 'Order not found' });
    }

    if (!isAdmin && data.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /orders/:id
 * Update order status (admin only or own order)
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isAdmin = req.userRole === 'admin';

    if (!status) {
      return res.status(400).json({ error: true, message: 'status required' });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: true, message: 'Invalid status' });
    }

    // Check order exists and user has access
    const { data: order } = await req.supabase
      .from('orders')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!order) {
      return res.status(404).json({ error: true, message: 'Order not found' });
    }

    if (!isAdmin && order.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const { data, error } = await req.supabase
      .from('orders')
      .update({ status })
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
