/**
 * Messages routes (Client-Employee Chat)
 * GET  /messages - list conversations
 * GET  /messages/:userId - get messages with specific user
 * POST /messages - send message
 * PATCH /messages/:id/read - mark as read
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /messages
 * List all conversations (unique users)
 */
router.get('/', async (req, res, next) => {
  try {
    const { data: conversations, error } = await req.supabase
      .from('messages')
      .select(`
        sender_id,
        receiver_id,
        profiles:sender_id (id, full_name, email),
        profiles:receiver_id (id, full_name, email)
      `)
      .or(`sender_id.eq.${req.user.id},receiver_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    // Get unique conversations
    const uniqueConvos = new Map();
    conversations.forEach(msg => {
      const otherUserId = msg.sender_id === req.user.id ? msg.receiver_id : msg.sender_id;
      const otherUser = msg.sender_id === req.user.id ? msg.profiles_receiver_id : msg.profiles_sender_id;
      if (!uniqueConvos.has(otherUserId)) {
        uniqueConvos.set(otherUserId, {
          user_id: otherUserId,
          user: otherUser,
          last_message_at: msg.created_at,
        });
      }
    });

    res.json(Array.from(uniqueConvos.values()));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /messages/:userId
 * Get messages with specific user
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await req.supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id (id, full_name, email)
      `)
      .or(`and(sender_id.eq.${req.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${req.user.id})`)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json((data || []).reverse());
  } catch (err) {
    next(err);
  }
});

/**
 * POST /messages
 * Send message
 */
router.post('/', async (req, res, next) => {
  try {
    const { receiver_id, consultation_id, appointment_id, content, attachments } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ error: true, message: 'receiver_id and content required' });
    }

    // Verify receiver exists
    const { data: receiver } = await req.supabase
      .from('profiles')
      .select('id')
      .eq('id', receiver_id)
      .single();

    if (!receiver) {
      return res.status(400).json({ error: true, message: 'Invalid receiver_id' });
    }

    const { data, error } = await req.supabase
      .from('messages')
      .insert({
        sender_id: req.user.id,
        receiver_id,
        consultation_id: consultation_id || null,
        appointment_id: appointment_id || null,
        content: String(content).trim(),
        attachments: attachments || null,
      })
      .select(`
        *,
        profiles:sender_id (id, full_name, email)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    // Create notification for receiver
    await req.supabase.from('notifications').insert({
      user_id: receiver_id,
      type: 'message',
      title: 'New Message',
      message: `New message from ${req.user.full_name || req.user.email}`,
      link: `/messages/${req.user.id}`,
      metadata: { message_id: data.id },
    });

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /messages/:id/read
 * Mark message as read
 */
router.patch('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: message } = await req.supabase
      .from('messages')
      .select('receiver_id')
      .eq('id', id)
      .single();

    if (!message) {
      return res.status(404).json({ error: true, message: 'Message not found' });
    }

    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const { data, error } = await req.supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
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
