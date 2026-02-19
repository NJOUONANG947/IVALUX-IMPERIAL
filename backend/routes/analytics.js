/**
 * Analytics & Behavioral Analysis routes
 * Analyse comportementale avancée et psychologie du consommateur
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /analytics/behavior
 * Track user behavior event
 */
router.post('/behavior', async (req, res, next) => {
  try {
    const { event_type, event_data, product_id, category, session_id } = req.body;

    if (!event_type) {
      return res.status(400).json({ error: true, message: 'event_type required' });
    }

    // AI-powered analysis (simulated - in production use ML model)
    const motivation = analyzePurchaseMotivation(event_type, event_data);
    const emotionalState = detectEmotionalState(event_data);
    const segment = predictSegment(req.user.id, event_type, event_data);
    const predictedNeed = predictFutureNeed(req.user.id, event_type, event_data);

    const { data, error } = await req.supabase
      .from('user_behavior_analytics')
      .insert({
        user_id: req.user.id,
        session_id: session_id || null,
        event_type,
        event_data: event_data || {},
        product_id: product_id || null,
        category: category || null,
        motivation,
        emotional_state: emotionalState,
        segment,
        predicted_need: predictedNeed,
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
 * GET /analytics/behavior
 * Get user behavior analytics
 */
router.get('/behavior', async (req, res, next) => {
  try {
    const { user_id, event_type, start_date, end_date, limit = 100 } = req.query;
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin && user_id ? user_id : req.user.id;

    let query = req.supabase
      .from('user_behavior_analytics')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    if (end_date) {
      query = query.lte('created_at', end_date);
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
 * GET /analytics/segments
 * Get user behavioral segments
 */
router.get('/segments', async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin && user_id ? user_id : req.user.id;

    const { data, error } = await req.supabase
      .from('user_segments')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      // Auto-generate segment if doesn't exist
      const segment = await generateUserSegment(targetUserId);
      return res.json(segment);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /analytics/predictions
 * Get AI predictions for user
 */
router.get('/predictions', async (req, res, next) => {
  try {
    const { user_id, prediction_type } = req.query;
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin && user_id ? user_id : req.user.id;

    let query = req.supabase
      .from('ai_predictions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (prediction_type) {
      query = query.eq('prediction_type', prediction_type);
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
 * POST /analytics/predictions/generate
 * Generate new AI prediction
 */
router.post('/predictions/generate', async (req, res, next) => {
  try {
    const { user_id, prediction_type } = req.body;
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin && user_id ? user_id : req.user.id;

    const prediction = await generateAIPrediction(targetUserId, prediction_type);

    const { data, error } = await req.supabase
      .from('ai_predictions')
      .insert(prediction)
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
 * GET /analytics/dashboard
 * Analytics dashboard data (admin only)
 */
router.get('/dashboard', requireAdmin(), async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startIso = startDate.toISOString();

    const [
      { count: totalEvents },
      { data: segments },
      { data: topMotivations },
      { data: recentPredictions },
    ] = await Promise.all([
      supabaseAdmin.from('user_behavior_analytics').select('*', { count: 'exact', head: true }).gte('created_at', startIso),
      supabaseAdmin.from('user_segments').select('segment_type').gte('last_updated', startIso),
      supabaseAdmin.from('user_behavior_analytics').select('motivation').gte('created_at', startIso).not('motivation', 'is', null).limit(100),
      supabaseAdmin.from('ai_predictions').select('*').gte('created_at', startIso).order('created_at', { ascending: false }).limit(10),
    ]);

    // Count segments
    const segmentCounts = {};
    (segments || []).forEach((s) => {
      segmentCounts[s.segment_type] = (segmentCounts[s.segment_type] || 0) + 1;
    });

    // Count motivations
    const motivationCounts = {};
    (topMotivations || []).forEach((m) => {
      if (m.motivation) {
        motivationCounts[m.motivation] = (motivationCounts[m.motivation] || 0) + 1;
      }
    });

    res.json({
      period,
      stats: {
        totalEvents: totalEvents || 0,
        segmentDistribution: segmentCounts,
        topMotivations: Object.entries(motivationCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([motivation, count]) => ({ motivation, count })),
      },
      recentPredictions: recentPredictions || [],
    });
  } catch (err) {
    next(err);
  }
});

// Helper functions (simulated AI - in production use ML models)

function analyzePurchaseMotivation(eventType, eventData) {
  const motivations = {
    purchase: 'need_satisfaction',
    product_view: 'exploration',
    add_to_cart: 'intent_to_buy',
    consultation: 'seeking_advice',
    review: 'sharing_experience',
  };
  return motivations[eventType] || 'general_interest';
}

function detectEmotionalState(eventData) {
  // Simulated emotion detection
  if (eventData?.rating >= 4) return 'satisfied';
  if (eventData?.rating <= 2) return 'disappointed';
  return 'neutral';
}

async function predictSegment(userId, eventType, eventData) {
  // Simulated segment prediction
  const segments = ['price_sensitive', 'quality_focused', 'trend_follower', 'loyal_customer'];
  return segments[Math.floor(Math.random() * segments.length)];
}

function predictFutureNeed(userId, eventType, eventData) {
  const needs = {
    purchase: 'replenishment',
    consultation: 'personalized_advice',
    review: 'product_feedback',
  };
  return needs[eventType] || 'exploration';
}

async function generateUserSegment(userId) {
  // Fetch user behavior data
  const { data: behaviors } = await supabaseAdmin
    .from('user_behavior_analytics')
    .select('*')
    .eq('user_id', userId)
    .limit(100);

  // Analyze and determine segment
  const segmentType = determineSegment(behaviors || []);
  const confidence = 0.7;

  const { data, error } = await supabaseAdmin
    .from('user_segments')
    .insert({
      user_id: userId,
      segment_type: segmentType,
      confidence,
      attributes: {},
    })
    .select()
    .single();

  return data || { user_id: userId, segment_type: segmentType, confidence };
}

function determineSegment(behaviors) {
  if (behaviors.length === 0) return 'explorer';

  const purchaseCount = behaviors.filter((b) => b.event_type === 'purchase').length;
  const viewCount = behaviors.filter((b) => b.event_type === 'product_view').length;

  if (purchaseCount > 5) return 'loyal_customer';
  if (viewCount > purchaseCount * 3) return 'researcher';
  return 'trend_follower';
}

async function generateAIPrediction(userId, predictionType) {
  // Simulated AI prediction generation
  const predictions = {
    purchase_intent: { score: 0.75, next_purchase_days: 14, recommended_products: [] },
    churn_risk: { risk_score: 0.2, factors: [], mitigation: [] },
    product_recommendation: { products: [], reasons: [] },
    lifetime_value: { predicted_value: 500, confidence: 0.8 },
  };

  return {
    user_id: userId,
    prediction_type: predictionType,
    predicted_value: predictions[predictionType] || {},
    confidence: 0.75,
    model_version: '1.0',
    input_data: {},
  };
}

module.exports = router;
