/**
 * Notifications routes
 * GET  /notifications - list notifications
 * PATCH /notifications/:id/read - mark as read
 * PATCH /notifications/read-all - mark all as read
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /notifications
 * List user notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const { unread_only, limit = 50 } = req.query;

    let query = req.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (unread_only === 'true') {
      query = query.eq('is_read', false);
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
 * PATCH /notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await req.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: true, message: 'Notification not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', async (req, res, next) => {
  try {
    const { error } = await req.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
