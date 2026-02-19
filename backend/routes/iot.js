/**
 * IoT Devices routes
 * Produits IoT connectés (smart mirror, skin scanner, etc.)
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /iot/devices
 * List user's IoT devices
 */
router.get('/devices', async (req, res, next) => {
  try {
    const { device_type, is_connected } = req.query;

    let query = req.supabase
      .from('iot_devices')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (device_type) {
      query = query.eq('device_type', device_type);
    }
    if (is_connected !== undefined) {
      query = query.eq('is_connected', is_connected === 'true');
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
 * POST /iot/devices
 * Register IoT device
 */
router.post('/devices', async (req, res, next) => {
  try {
    const { device_type, device_name, device_serial, metadata } = req.body;

    if (!device_type || !device_name || !device_serial) {
      return res.status(400).json({ error: true, message: 'device_type, device_name, and device_serial required' });
    }

    const { data, error } = await req.supabase
      .from('iot_devices')
      .insert({
        user_id: req.user.id,
        device_type,
        device_name,
        device_serial,
        is_connected: true,
        last_sync_at: new Date().toISOString(),
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
 * POST /iot/devices/:id/data
 * Submit IoT device data
 */
router.post('/devices/:id/data', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data_type, data_value } = req.body;

    if (!data_type || !data_value) {
      return res.status(400).json({ error: true, message: 'data_type and data_value required' });
    }

    // Verify device ownership
    const { data: device } = await req.supabase
      .from('iot_devices')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!device) {
      return res.status(404).json({ error: true, message: 'Device not found' });
    }

    const { data, error } = await req.supabase
      .from('iot_device_data')
      .insert({
        device_id: id,
        data_type,
        data_value,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    // Update device last sync
    await req.supabase
      .from('iot_devices')
      .update({ last_sync_at: new Date().toISOString(), is_connected: true })
      .eq('id', id);

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /iot/devices/:id/data
 * Get IoT device data
 */
router.get('/devices/:id/data', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data_type, start_date, end_date, limit = 100 } = req.query;

    // Verify device ownership
    const { data: device } = await req.supabase
      .from('iot_devices')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!device) {
      return res.status(404).json({ error: true, message: 'Device not found' });
    }

    let query = req.supabase
      .from('iot_device_data')
      .select('*')
      .eq('device_id', id)
      .order('recorded_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (data_type) {
      query = query.eq('data_type', data_type);
    }
    if (start_date) {
      query = query.gte('recorded_at', start_date);
    }
    if (end_date) {
      query = query.lte('recorded_at', end_date);
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

module.exports = router;
