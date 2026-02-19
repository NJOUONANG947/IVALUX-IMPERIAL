/**
 * Tracking routes - product placement analytics
 * POST /track/product-placement - record AI-driven product display
 * FUTURE GROK: This data feeds into AI training/analytics.
 * GROK can use placement history to improve recommendations.
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * POST /track/product-placement
 * Body: { productId, placementType, reason, confidence }
 * placementType: chat | prescription | product_page
 * Requires authenticated user (or allow anonymous - track by session)
 */
router.post('/product-placement', authMiddleware, async (req, res, next) => {
  try {
    const { productId, placementType, reason, confidence } = req.body;

    if (!productId || !placementType) {
      return res.status(400).json({ error: true, message: 'productId and placementType required' });
    }

    const validTypes = ['chat', 'prescription', 'product_page'];
    if (!validTypes.includes(placementType)) {
      return res.status(400).json({ error: true, message: 'Invalid placementType' });
    }

    const { data, error } = await req.supabase
      .from('product_placements')
      .insert({
        user_id: req.user.id,
        product_id: productId,
        placement_type: placementType,
        reason: reason || null,
        confidence: confidence ?? null,
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
