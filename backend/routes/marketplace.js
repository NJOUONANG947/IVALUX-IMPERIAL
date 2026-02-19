/**
 * Marketplace B2B2C routes
 * Marketplace pour distributeurs, retailers, influenceurs
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /marketplace/sellers
 * List marketplace sellers
 */
router.get('/sellers', async (req, res, next) => {
  try {
    const { seller_type, country, is_verified } = req.query;

    let query = req.supabase
      .from('marketplace_sellers')
      .select('*')
      .order('created_at', { ascending: false });

    if (seller_type) {
      query = query.eq('seller_type', seller_type);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (is_verified !== undefined) {
      query = query.eq('is_verified', is_verified === 'true');
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
 * POST /marketplace/sellers
 * Register as marketplace seller (admin approval required)
 */
router.post('/sellers', async (req, res, next) => {
  try {
    const { seller_name, seller_type, contact_email, country, metadata } = req.body;

    if (!seller_name || !seller_type || !contact_email) {
      return res.status(400).json({ error: true, message: 'seller_name, seller_type, and contact_email required' });
    }

    const { data, error } = await req.supabase
      .from('marketplace_sellers')
      .insert({
        seller_name,
        seller_type,
        contact_email,
        country: country || null,
        is_verified: false, // Requires admin approval
        metadata: metadata || {},
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
 * PATCH /marketplace/sellers/:id/verify
 * Verify seller (admin only)
 */
router.patch('/sellers/:id/verify', requireAdmin(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commission_rate } = req.body;

    const updates = { is_verified: true };
    if (commission_rate !== undefined) {
      updates.commission_rate = parseFloat(commission_rate);
    }

    const { data, error } = await supabaseAdmin
      .from('marketplace_sellers')
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
 * GET /marketplace/products
 * List marketplace products
 */
router.get('/products', async (req, res, next) => {
  try {
    const { seller_id, product_id, is_active, limit = 100 } = req.query;

    let query = req.supabase
      .from('marketplace_products')
      .select(`
        *,
        products (id, name, description, image_url, category),
        marketplace_sellers (id, seller_name, seller_type, is_verified)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (seller_id) {
      query = query.eq('seller_id', seller_id);
    }
    if (product_id) {
      query = query.eq('product_id', product_id);
    }
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
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
 * POST /marketplace/products
 * Add product to marketplace (seller only)
 */
router.post('/products', async (req, res, next) => {
  try {
    const { product_id, seller_id, price, stock_quantity, metadata } = req.body;

    if (!product_id || !seller_id || !price) {
      return res.status(400).json({ error: true, message: 'product_id, seller_id, and price required' });
    }

    // Verify seller exists and is verified
    const { data: seller } = await req.supabase
      .from('marketplace_sellers')
      .select('*')
      .eq('id', seller_id)
      .eq('is_verified', true)
      .single();

    if (!seller) {
      return res.status(403).json({ error: true, message: 'Seller not found or not verified' });
    }

    const { data, error } = await req.supabase
      .from('marketplace_products')
      .insert({
        product_id,
        seller_id,
        price: parseFloat(price),
        stock_quantity: stock_quantity || 0,
        metadata: metadata || {},
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
 * PATCH /marketplace/products/:id
 * Update marketplace product
 */
router.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, stock_quantity, is_active } = req.body;

    const updates = {};
    if (price !== undefined) updates.price = parseFloat(price);
    if (stock_quantity !== undefined) updates.stock_quantity = parseInt(stock_quantity, 10);
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await req.supabase
      .from('marketplace_products')
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
