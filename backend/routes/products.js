/**
 * Products routes
 * GET /products - list products (public or filtered by country)
 * POST /products - create product (admin only)
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

const router = express.Router();

/**
 * GET /products
 * Query: ?country=CA (optional - filter by country)
 * FUTURE GROK: AI product recommendations can query this endpoint.
 * Consider adding /products/recommend endpoint that calls GROK for personalization.
 */
router.get('/', async (req, res, next) => {
  try {
    const { supabaseAdmin } = require('../config/supabase');

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const country = req.query.country;
    if (country) {
      query = query.contains('countries_available', [country]);
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
 * GET /products/:id - single product by UUID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { supabaseAdmin } = require('../config/supabase');
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ error: true, message: 'Product not found' });
    }
    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /products (admin only)
 * Body: { name, description, countries_available }
 */
router.post('/', authMiddleware, requireAdmin(), async (req, res, next) => {
  try {
    const { name, description, countries_available, image_url, price, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: true, message: 'Name required' });
    }

    const { data, error } = await req.supabase
      .from('products')
      .insert({
        name,
        description: description || null,
        countries_available: countries_available || [],
        image_url: image_url || null,
        price: price != null ? parseFloat(price) : null,
        category: category || null,
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

module.exports = router;
