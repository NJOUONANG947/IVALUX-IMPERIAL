/**
 * Sentiment Analysis routes
 * Analyse des avis clients et détection de satisfaction
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /sentiment/analyze/:review_id
 * Analyze review sentiment
 */
router.post('/analyze/:review_id', async (req, res, next) => {
  try {
    const { review_id } = req.params;

    // Get review
    const { data: review, error: revError } = await req.supabase
      .from('reviews')
      .select('*')
      .eq('id', review_id)
      .single();

    if (revError || !review) {
      return res.status(404).json({ error: true, message: 'Review not found' });
    }

    // Analyze sentiment (simulated - in production use NLP API)
    const analysis = analyzeSentiment(review);

    // Check if analysis already exists
    const { data: existing } = await req.supabase
      .from('sentiment_analysis')
      .select('*')
      .eq('review_id', review_id)
      .single();

    let result;
    if (existing) {
      const { data, error } = await req.supabase
        .from('sentiment_analysis')
        .update({
          ...analysis,
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      result = data;
      if (error) throw error;
    } else {
      const { data, error } = await req.supabase
        .from('sentiment_analysis')
        .insert({
          review_id,
          ...analysis,
        })
        .select()
        .single();
      result = data;
      if (error) throw error;
    }

    // Check if alert needed
    if (analysis.alert_level !== 'none') {
      await createSatisfactionAlert(review, analysis);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /sentiment/reviews
 * Get sentiment analysis for reviews
 */
router.get('/reviews', async (req, res, next) => {
  try {
    const { product_id, start_date, end_date, sentiment, limit = 50 } = req.query;
    const isAdmin = req.userRole === 'admin';

    let query = supabaseAdmin
      .from('sentiment_analysis')
      .select(`
        *,
        reviews (
          id,
          product_id,
          client_id,
          rating,
          title,
          content,
          profiles:client_id (full_name, email)
        )
      `)
      .order('analyzed_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (sentiment) {
      query = query.eq('sentiment', sentiment);
    }
    if (start_date) {
      query = query.gte('analyzed_at', start_date);
    }
    if (end_date) {
      query = query.lte('analyzed_at', end_date);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    // Filter by product_id if needed
    let filtered = data || [];
    if (product_id) {
      filtered = filtered.filter((s) => s.reviews?.product_id === product_id);
    }

    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /sentiment/alerts
 * Get satisfaction alerts
 */
router.get('/alerts', requireAdmin(), async (req, res, next) => {
  try {
    const { severity, resolved, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('satisfaction_alerts')
      .select(`
        *,
        profiles:user_id (full_name, email),
        reviews (id, rating, title),
        consultations (id, client_name)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (severity) {
      query = query.eq('severity', severity);
    }
    if (resolved !== undefined) {
      query = query.eq('resolved', resolved === 'true');
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
 * PATCH /sentiment/alerts/:id/resolve
 * Resolve satisfaction alert
 */
router.patch('/alerts/:id/resolve', requireAdmin(), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('satisfaction_alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
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
 * GET /sentiment/dashboard
 * Sentiment analysis dashboard (admin)
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
      { data: allSentiments },
      { count: totalAlerts },
      { count: unresolvedAlerts },
    ] = await Promise.all([
      supabaseAdmin.from('sentiment_analysis').select('sentiment, sentiment_score').gte('analyzed_at', startIso),
      supabaseAdmin.from('satisfaction_alerts').select('*', { count: 'exact', head: true }).gte('created_at', startIso),
      supabaseAdmin.from('satisfaction_alerts').select('*', { count: 'exact', head: true }).eq('resolved', false),
    ]);

    const sentimentCounts = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
    let avgScore = 0;
    let scoreCount = 0;

    (allSentiments || []).forEach((s) => {
      sentimentCounts[s.sentiment] = (sentimentCounts[s.sentiment] || 0) + 1;
      if (s.sentiment_score != null) {
        avgScore += s.sentiment_score;
        scoreCount++;
      }
    });

    res.json({
      period,
      sentimentDistribution: sentimentCounts,
      averageSentimentScore: scoreCount > 0 ? avgScore / scoreCount : 0,
      alerts: {
        total: totalAlerts || 0,
        unresolved: unresolvedAlerts || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Helper functions

function analyzeSentiment(review) {
  const content = `${review.title || ''} ${review.content || ''}`.toLowerCase();
  const rating = review.rating || 0;

  // Simple sentiment analysis (in production use NLP API like OpenAI, AWS Comprehend, etc.)
  const positiveWords = ['excellent', 'amazing', 'love', 'great', 'perfect', 'wonderful', 'best', 'fantastic'];
  const negativeWords = ['terrible', 'awful', 'hate', 'bad', 'worst', 'disappointed', 'poor', 'waste'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (content.includes(word)) positiveCount++;
  });
  negativeWords.forEach((word) => {
    if (content.includes(word)) negativeCount++;
  });

  let sentiment = 'neutral';
  let sentimentScore = 0;
  let alertLevel = 'none';

  if (rating >= 4 && positiveCount > negativeCount) {
    sentiment = 'positive';
    sentimentScore = 0.7 + (rating - 4) * 0.1;
  } else if (rating <= 2 || negativeCount > positiveCount) {
    sentiment = 'negative';
    sentimentScore = -0.5 - (3 - rating) * 0.2;
    alertLevel = rating === 1 ? 'critical' : rating === 2 ? 'high' : 'medium';
  } else if (positiveCount > 0 && negativeCount > 0) {
    sentiment = 'mixed';
    sentimentScore = 0;
  }

  const emotions = {
    joy: rating >= 4 ? 0.7 : 0.2,
    trust: rating >= 3 ? 0.6 : 0.3,
    anger: rating <= 2 ? 0.6 : 0.1,
    sadness: rating <= 2 ? 0.5 : 0.1,
  };

  return {
    sentiment,
    sentiment_score: sentimentScore,
    emotions,
    topics: extractTopics(content),
    keywords: extractKeywords(content),
    alert_level: alertLevel,
  };
}

function extractTopics(content) {
  const topics = [];
  if (content.includes('skin') || content.includes('acne')) topics.push('skin_health');
  if (content.includes('price') || content.includes('cost')) topics.push('pricing');
  if (content.includes('delivery') || content.includes('shipping')) topics.push('shipping');
  if (content.includes('quality') || content.includes('ingredient')) topics.push('product_quality');
  return topics;
}

function extractKeywords(content) {
  const words = content.split(/\s+/).filter((w) => w.length > 4);
  return words.slice(0, 5);
}

async function createSatisfactionAlert(review, analysis) {
  await supabaseAdmin.from('satisfaction_alerts').insert({
    user_id: review.client_id,
    review_id: review.id,
    alert_type: analysis.sentiment === 'negative' ? 'negative_sentiment' : 'low_rating',
    severity: analysis.alert_level,
    message: `Review #${review.id.slice(0, 8)} has ${analysis.sentiment} sentiment`,
    metadata: { sentiment_score: analysis.sentiment_score },
  });
}

module.exports = router;
