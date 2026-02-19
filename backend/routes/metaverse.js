/**
 * Metaverse & Digital Beauty routes
 * Boutique virtuelle, avatars, looks digitaux, événements virtuels
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /metaverse/stores
 * List metaverse stores
 */
router.get('/stores', async (req, res, next) => {
  try {
    const { platform, is_active } = req.query;

    let query = req.supabase
      .from('metaverse_stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
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
 * POST /metaverse/stores
 * Create metaverse store (admin only)
 */
router.post('/stores', requireAdmin(), async (req, res, next) => {
  try {
    const { platform, store_name, world_coordinates, store_url, metadata } = req.body;

    if (!platform || !store_name) {
      return res.status(400).json({ error: true, message: 'platform and store_name required' });
    }

    const { data, error } = await supabaseAdmin
      .from('metaverse_stores')
      .insert({
        platform,
        store_name,
        world_coordinates: world_coordinates || null,
        store_url: store_url || null,
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
 * GET /metaverse/avatars
 * Get user avatars
 */
router.get('/avatars', async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const isAdmin = req.userRole === 'admin';
    const targetUserId = isAdmin && user_id ? user_id : req.user.id;

    const { data, error } = await req.supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', targetUserId)
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
 * POST /metaverse/avatars
 * Create or update user avatar
 */
router.post('/avatars', async (req, res, next) => {
  try {
    const { avatar_name, avatar_data, skin_tone, hair_style, hair_color, eye_color } = req.body;

    if (!avatar_data) {
      return res.status(400).json({ error: true, message: 'avatar_data required' });
    }

    // Check if user has active avatar
    const { data: existing } = await req.supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    let result;
    if (existing) {
      const { data, error } = await req.supabase
        .from('user_avatars')
        .update({
          avatar_name: avatar_name || existing.avatar_name,
          avatar_data,
          skin_tone: skin_tone || existing.skin_tone,
          hair_style: hair_style || existing.hair_style,
          hair_color: hair_color || existing.hair_color,
          eye_color: eye_color || existing.eye_color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      result = data;
      if (error) throw error;
    } else {
      const { data, error } = await req.supabase
        .from('user_avatars')
        .insert({
          user_id: req.user.id,
          avatar_name: avatar_name || 'My Avatar',
          avatar_data,
          skin_tone: skin_tone || null,
          hair_style: hair_style || null,
          hair_color: hair_color || null,
          eye_color: eye_color || null,
        })
        .select()
        .single();
      result = data;
      if (error) throw error;
    }

    res.status(existing ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /metaverse/looks
 * Get digital looks
 */
router.get('/looks', async (req, res, next) => {
  try {
    const { user_id, avatar_id, is_public, is_nft, limit = 50 } = req.query;
    const isAdmin = req.userRole === 'admin';

    let query = req.supabase
      .from('digital_looks')
      .select(`
        *,
        user_avatars (id, avatar_name),
        profiles:user_id (id, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (!isAdmin && !user_id) {
      query = query.eq('user_id', req.user.id);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (avatar_id) {
      query = query.eq('avatar_id', avatar_id);
    }
    if (is_public !== undefined) {
      query = query.eq('is_public', is_public === 'true');
    }
    if (is_nft !== undefined) {
      query = query.eq('is_nft', is_nft === 'true');
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
 * POST /metaverse/looks
 * Create digital look
 */
router.post('/looks', async (req, res, next) => {
  try {
    const { avatar_id, look_name, products_used, look_data, preview_image_url, is_public } = req.body;

    if (!avatar_id || !look_name || !look_data) {
      return res.status(400).json({ error: true, message: 'avatar_id, look_name, and look_data required' });
    }

    const { data, error } = await req.supabase
      .from('digital_looks')
      .insert({
        user_id: req.user.id,
        avatar_id,
        look_name,
        products_used: products_used || [],
        look_data,
        preview_image_url: preview_image_url || null,
        is_public: is_public || false,
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
 * POST /metaverse/looks/:id/mint-nft
 * Mint look as NFT
 */
router.post('/looks/:id/mint-nft', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nft_token_id, nft_contract_address } = req.body;

    // Verify ownership
    const { data: look } = await req.supabase
      .from('digital_looks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!look) {
      return res.status(404).json({ error: true, message: 'Look not found' });
    }

    const { data, error } = await req.supabase
      .from('digital_looks')
      .update({
        is_nft: true,
        nft_token_id: nft_token_id || null,
        nft_contract_address: nft_contract_address || null,
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
 * GET /metaverse/events
 * List virtual events
 */
router.get('/events', async (req, res, next) => {
  try {
    const { platform, event_type, is_public, upcoming_only } = req.query;

    let query = req.supabase
      .from('virtual_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (platform) {
      query = query.eq('platform', platform);
    }
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (is_public !== undefined) {
      query = query.eq('is_public', is_public === 'true');
    }
    if (upcoming_only === 'true') {
      query = query.gte('event_date', new Date().toISOString());
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
 * POST /metaverse/events
 * Create virtual event (admin only)
 */
router.post('/events', requireAdmin(), async (req, res, next) => {
  try {
    const { event_name, event_type, platform, event_date, duration_minutes, description, max_attendees, is_public, metadata } = req.body;

    if (!event_name || !event_type || !platform || !event_date) {
      return res.status(400).json({ error: true, message: 'event_name, event_type, platform, and event_date required' });
    }

    const { data, error } = await supabaseAdmin
      .from('virtual_events')
      .insert({
        event_name,
        event_type,
        platform,
        event_date,
        duration_minutes: duration_minutes || 60,
        description: description || null,
        max_attendees: max_attendees || null,
        is_public: is_public !== false,
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
 * POST /metaverse/events/:id/attend
 * Register for virtual event
 */
router.post('/events/:id/attend', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { avatar_id } = req.body;

    // Check event exists
    const { data: event } = await req.supabase
      .from('virtual_events')
      .select('*')
      .eq('id', id)
      .single();

    if (!event) {
      return res.status(404).json({ error: true, message: 'Event not found' });
    }

    // Check if already registered
    const { data: existing } = await req.supabase
      .from('event_attendances')
      .select('*')
      .eq('event_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: true, message: 'Already registered for this event' });
    }

    const { data, error } = await req.supabase
      .from('event_attendances')
      .insert({
        event_id: id,
        user_id: req.user.id,
        avatar_id: avatar_id || null,
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
