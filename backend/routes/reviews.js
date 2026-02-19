/**
 * Reviews routes
 * GET    /reviews - list reviews (with filters)
 * POST   /reviews - create review
 * GET    /reviews/:id - get review
 * PATCH  /reviews/:id - update review (own or admin)
 * DELETE /reviews/:id - delete review (own or admin)
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /reviews
 * List reviews with optional filters
 */
router.get('/', async (req, res, next) => {
  try {
    const { product_id, client_id, rating, limit = 50, offset = 0 } = req.query;
    let query = req.supabase.from('reviews').select(`
      *,
      profiles!reviews_client_id_fkey(id, full_name, email),
      products!reviews_product_id_fkey(id, name, image_url)
    `);

    if (product_id) query = query.eq('product_id', product_id);
    if (client_id) query = query.eq('client_id', client_id);
    if (rating) query = query.eq('rating', rating);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

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
 * POST /reviews
 * Create a new review
 */
router.post('/', async (req, res, next) => {
  try {
    const { product_id, rating, title, content, photos } = req.body;

    if (!product_id || !rating || !title || !content) {
      return res.status(400).json({ error: true, message: 'product_id, rating, title, and content required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: true, message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this product
    const { data: existing } = await req.supabase
      .from('reviews')
      .select('id')
      .eq('client_id', req.user.id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: true, message: 'You have already reviewed this product' });
    }

    const { data, error } = await req.supabase
      .from('reviews')
      .insert({
        client_id: req.user.id,
        product_id,
        rating: Number(rating),
        title,
        content,
        photos: photos || [],
        is_verified_purchase: false, // Could check order history
      })
      .select(`
        *,
        profiles!reviews_client_id_fkey(id, full_name, email),
        products!reviews_product_id_fkey(id, name, image_url)
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
 * GET /reviews/:id
 * Get a single review
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_client_id_fkey(id, full_name, email),
        products!reviews_product_id_fkey(id, name, image_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: true, message: 'Review not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /reviews/:id
 * Update review (own or admin)
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, content, photos } = req.body;

    // Check ownership or admin
    const { data: review } = await req.supabase
      .from('reviews')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!review) {
      return res.status(404).json({ error: true, message: 'Review not found' });
    }

    const isAdmin = req.userRole === 'admin';
    if (review.client_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const updates = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: true, message: 'Rating must be between 1 and 5' });
      }
      updates.rating = Number(rating);
    }
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (photos !== undefined) updates.photos = photos;

    const { data, error } = await req.supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles!reviews_client_id_fkey(id, full_name, email),
        products!reviews_product_id_fkey(id, name, image_url)
      `)
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
 * DELETE /reviews/:id
 * Delete review (own or admin)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership or admin
    const { data: review } = await req.supabase
      .from('reviews')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!review) {
      return res.status(404).json({ error: true, message: 'Review not found' });
    }

    const isAdmin = req.userRole === 'admin';
    if (review.client_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const { error } = await req.supabase.from('reviews').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
