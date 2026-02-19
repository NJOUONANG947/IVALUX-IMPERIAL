/**
 * Appointments routes
 * GET  /appointments - list appointments
 * POST /appointments - create appointment
 * PATCH /appointments/:id - update appointment
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /appointments
 * List appointments
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, start_date, end_date } = req.query;
    const isAdmin = req.userRole === 'admin';
    const isEmployee = req.userRole === 'employee' || req.userRole === 'admin';

    let query = req.supabase
      .from('appointments')
      .select(`
        *,
        profiles:client_id (id, full_name, email),
        profiles:employee_id (id, full_name, email)
      `)
      .order('datetime', { ascending: true });

    if (!isAdmin) {
      if (isEmployee) {
        query = query.eq('employee_id', req.user.id);
      } else {
        query = query.eq('client_id', req.user.id);
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (start_date) {
      query = query.gte('datetime', start_date);
    }

    if (end_date) {
      query = query.lte('datetime', end_date);
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
 * POST /appointments
 * Create appointment
 */
router.post('/', async (req, res, next) => {
  try {
    const { employee_id, datetime, duration_minutes, type, notes } = req.body;

    if (!employee_id || !datetime) {
      return res.status(400).json({ error: true, message: 'employee_id and datetime required' });
    }

    // Check if employee exists and is actually an employee
    const { data: employee } = await req.supabase
      .from('profiles')
      .select('role')
      .eq('id', employee_id)
      .single();

    if (!employee || !['employee', 'admin'].includes(employee.role)) {
      return res.status(400).json({ error: true, message: 'Invalid employee_id' });
    }

    // Check for conflicts
    const endTime = new Date(new Date(datetime).getTime() + (duration_minutes || 60) * 60000);
    const { data: conflicts } = await req.supabase
      .from('appointments')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('status', 'scheduled')
      .or(`datetime.lte.${datetime},datetime.gte.${datetime}`)
      .limit(1);

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({ error: true, message: 'Time slot already booked' });
    }

    const { data, error } = await req.supabase
      .from('appointments')
      .insert({
        client_id: req.user.id,
        employee_id,
        datetime,
        duration_minutes: duration_minutes || 60,
        type: type || 'consultation',
        notes: notes || null,
        status: 'scheduled',
      })
      .select(`
        *,
        profiles:client_id (id, full_name, email),
        profiles:employee_id (id, full_name, email)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    // Create notification for employee
    await req.supabase.from('notifications').insert({
      user_id: employee_id,
      type: 'appointment',
      title: 'New Appointment',
      message: `New appointment scheduled with ${req.user.full_name || req.user.email}`,
      link: `/dashboard/employee`,
      metadata: { appointment_id: data.id },
    });

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /appointments/:id
 * Update appointment
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, datetime } = req.body;
    const isAdmin = req.userRole === 'admin';

    const { data: appointment } = await req.supabase
      .from('appointments')
      .select('client_id, employee_id')
      .eq('id', id)
      .single();

    if (!appointment) {
      return res.status(404).json({ error: true, message: 'Appointment not found' });
    }

    if (!isAdmin && appointment.client_id !== req.user.id && appointment.employee_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (datetime) updates.datetime = datetime;

    const { data, error } = await req.supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles:client_id (id, full_name, email),
        profiles:employee_id (id, full_name, email)
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

module.exports = router;
