/**
 * Employee routes
 * GET  /employee/dashboard       - stats, recent consultations, product handlings
 * GET  /employee/consultations   - list consultations
 * POST /employee/consultations   - create consultation
 * PATCH /employee/consultations/:id - update consultation
 * POST /employee/handle-product  - register product handling
 * GET  /employee/my-products     - list products assigned to employee
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireEmployeeOrAdmin } = require('../middleware/role');

const router = express.Router();

router.use(authMiddleware);
router.use(requireEmployeeOrAdmin());

const employeeId = (req) => req.user.id;

/**
 * GET /employee/dashboard
 * Returns aggregated stats and recent data for employee dashboard
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const eid = employeeId(req);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartIso = weekStart.toISOString();

    // Today's consultations count
    const { count: todayCount, error: errToday } = await req.supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', eid)
      .gte('created_at', todayStart);

    if (errToday) {
      return res.status(500).json({ error: true, message: errToday.message });
    }

    // Weekly sales (sum of amount for completed consultations this week)
    const { data: weeklyData, error: errWeekly } = await req.supabase
      .from('consultations')
      .select('amount')
      .eq('employee_id', eid)
      .eq('status', 'completed')
      .gte('created_at', weekStartIso);

    if (errWeekly) {
      return res.status(500).json({ error: true, message: errWeekly.message });
    }

    const weeklySales = (weeklyData || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    // Client satisfaction (avg of satisfaction_rating for completed consultations)
    const { data: satData, error: errSat } = await req.supabase
      .from('consultations')
      .select('satisfaction_rating')
      .eq('employee_id', eid)
      .eq('status', 'completed')
      .not('satisfaction_rating', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (errSat) {
      return res.status(500).json({ error: true, message: errSat.message });
    }

    const ratings = (satData || []).map((r) => Number(r.satisfaction_rating)).filter(Boolean);
    const clientSatisfaction = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    // Recent consultations (last 10)
    const { data: recentConsultations, error: errRec } = await req.supabase
      .from('consultations')
      .select('id, client_name, consultation_type, status, amount, created_at')
      .eq('employee_id', eid)
      .order('created_at', { ascending: false })
      .limit(10);

    if (errRec) {
      return res.status(500).json({ error: true, message: errRec.message });
    }

    // Product handlings (products assigned to this employee)
    const { data: handlings, error: errHand } = await req.supabase
      .from('employee_product_handling')
      .select('*, products (id, name, image_url, category)')
      .eq('employee_id', eid);

    if (errHand) {
      return res.status(500).json({ error: true, message: errHand.message });
    }

    const profile = req.profile || {};
    const employeeIdStr = eid.slice(0, 8).toUpperCase();

    res.json({
      stats: {
        todayConsultations: todayCount || 0,
        weeklySales: Math.round(weeklySales * 100) / 100,
        clientSatisfaction: clientSatisfaction ?? '—',
        employeeId: `EMP-${employeeIdStr}`,
      },
      recentConsultations: recentConsultations || [],
      productHandlings: handlings || [],
      profile: {
        role: profile.role || 'employee',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /employee/consultations
 * List consultations with optional filters
 */
router.get('/consultations', async (req, res, next) => {
  try {
    const status = req.query.status;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    let query = req.supabase
      .from('consultations')
      .select('*')
      .eq('employee_id', employeeId(req))
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
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
 * POST /employee/consultations
 * Body: { client_name, consultation_type, status?, notes? }
 */
router.post('/consultations', async (req, res, next) => {
  try {
    const { client_name, consultation_type, status, notes } = req.body;

    if (!client_name || !consultation_type) {
      return res.status(400).json({ error: true, message: 'client_name and consultation_type required' });
    }

    const validTypes = ['Skin Analysis', 'Product Recommendation', 'Beauty Diagnostic', 'General'];
    if (!validTypes.includes(consultation_type)) {
      return res.status(400).json({ error: true, message: 'Invalid consultation_type' });
    }

    const row = {
      employee_id: employeeId(req),
      client_name: String(client_name).trim(),
      consultation_type,
      status: status || 'scheduled',
      notes: notes ? String(notes).trim() : null,
    };

    if (row.status && !['scheduled', 'in_progress', 'completed'].includes(row.status)) {
      row.status = 'scheduled';
    }

    const { data, error } = await req.supabase
      .from('consultations')
      .insert(row)
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
 * PATCH /employee/consultations/:id
 * Body: { status?, notes?, amount?, satisfaction_rating? }
 */
router.patch('/consultations/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes, amount, satisfaction_rating } = req.body;

    const updates = {};
    if (status !== undefined) {
      if (!['scheduled', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ error: true, message: 'Invalid status' });
      }
      updates.status = status;
    }
    if (notes !== undefined) updates.notes = notes;
    if (amount !== undefined) updates.amount = Number(amount) || null;
    if (satisfaction_rating !== undefined) {
      const r = parseInt(satisfaction_rating, 10);
      if (r < 1 || r > 5) {
        return res.status(400).json({ error: true, message: 'satisfaction_rating must be 1-5' });
      }
      updates.satisfaction_rating = r;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: true, message: 'No valid fields to update' });
    }

    const { data, error } = await req.supabase
      .from('consultations')
      .update(updates)
      .eq('id', id)
      .eq('employee_id', employeeId(req))
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: true, message: 'Consultation not found' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /employee/handle-product
 * Body: { product_id, country }
 * Registers that the current employee handles this product in this country
 */
router.post('/handle-product', async (req, res, next) => {
  try {
    const { product_id, country } = req.body;
    const employeeId = req.user.id;

    if (!product_id || !country) {
      return res.status(400).json({ error: true, message: 'product_id and country required' });
    }

    const { data, error } = await req.supabase
      .from('employee_product_handling')
      .upsert(
        { employee_id: employeeId, product_id, country },
        { onConflict: 'employee_id,product_id,country' }
      )
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
 * DELETE /employee/handle-product/:id
 * Removes a product assignment for the current employee
 */
router.delete('/handle-product/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const eid = employeeId(req);

    const { error } = await req.supabase
      .from('employee_product_handling')
      .delete()
      .eq('id', id)
      .eq('employee_id', eid);

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /employee/my-products
 * Returns products the current employee is assigned to handle
 */
router.get('/my-products', async (req, res, next) => {
  try {
    const { data: handlings, error } = await req.supabase
      .from('employee_product_handling')
      .select(`
        *,
        products (*)
      `)
      .eq('employee_id', req.user.id);

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(handlings || []);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /employee/clients
 * List clients for employee to create appointments
 */
router.get('/clients', async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client')
      .order('full_name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /employee/appointments
 * Employee creates an appointment for a client
 * Body: { client_id, datetime, duration_minutes?, type?, notes? }
 */
router.post('/appointments', async (req, res, next) => {
  try {
    const { client_id, datetime, duration_minutes, type, notes } = req.body;
    const eid = employeeId(req);

    if (!client_id || !datetime) {
      return res.status(400).json({ error: true, message: 'client_id and datetime required' });
    }

    const { data: client } = await req.supabase
      .from('profiles')
      .select('id, role')
      .eq('id', client_id)
      .single();

    if (!client || client.role !== 'client') {
      return res.status(400).json({ error: true, message: 'Invalid client_id' });
    }

    const duration = duration_minutes || 60;
    const endTime = new Date(new Date(datetime).getTime() + duration * 60000);

    const { data, error } = await req.supabase
      .from('appointments')
      .insert({
        client_id,
        employee_id: eid,
        datetime,
        duration_minutes: duration,
        type: type || 'consultation',
        notes: notes ? String(notes).trim() : null,
        status: 'scheduled',
      })
      .select(`
        *,
        profiles:client_id (id, full_name, email)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    await req.supabase.from('notifications').insert({
      user_id: client_id,
      type: 'appointment',
      title: 'New Appointment',
      message: `An appointment has been scheduled for you`,
      link: '/dashboard/appointments',
      metadata: { appointment_id: data.id },
    });

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /employee/report
 * Export consultations and sales report
 * Query: start_date, end_date, format=json|csv
 */
router.get('/report', async (req, res, next) => {
  try {
    const eid = employeeId(req);
    const { start_date, end_date, format } = req.query;

    const start = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = end_date ? new Date(end_date) : new Date();

    const { data: consultations, error } = await req.supabase
      .from('consultations')
      .select('*')
      .eq('employee_id', eid)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    const completed = (consultations || []).filter((c) => c.status === 'completed');
    const totalSales = completed.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const report = {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      totalConsultations: (consultations || []).length,
      completedConsultations: completed.length,
      totalSales: Math.round(totalSales * 100) / 100,
      consultations: consultations || [],
    };

    if (format === 'csv') {
      const headers = ['Date', 'Client', 'Type', 'Status', 'Amount', 'Satisfaction'];
      const rows = (consultations || []).map((c) => [
        new Date(c.created_at).toLocaleString(),
        (c.client_name || '').replace(/"/g, '""'),
        c.consultation_type || '',
        c.status || '',
        c.amount ?? '',
        c.satisfaction_rating ?? '',
      ]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="report-${report.start_date}-${report.end_date}.csv"`);
      return res.send('\uFEFF' + csv);
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /employee/invoices/generate-ai
 * Generate invoice using AI based on consultation or order data
 * Body: { consultation_id?, order_id?, client_id, amount?, tax?, notes?, ai_prompt? }
 */
router.post('/invoices/generate-ai', async (req, res, next) => {
  try {
    const eid = employeeId(req);
    const { consultation_id, order_id, client_id, amount, tax, notes, ai_prompt } = req.body;

    if (!client_id) {
      return res.status(400).json({ error: true, message: 'client_id required' });
    }

    let invoiceData = {
      client_id,
      amount: Number(amount) || 0,
      tax: Number(tax) || 0,
      notes: notes || null,
    };

    // AI-powered invoice generation
    if (ai_prompt || consultation_id || order_id) {
      let contextData = {};

      if (consultation_id) {
        const { data: consultation } = await req.supabase
          .from('consultations')
          .select('*, profiles:employee_id (full_name)')
          .eq('id', consultation_id)
          .eq('employee_id', eid)
          .single();

        if (consultation) {
          contextData.consultation = consultation;
          if (!invoiceData.amount && consultation.amount) {
            invoiceData.amount = Number(consultation.amount);
          }
          invoiceData.consultation_id = consultation_id;
        }
      }

      if (order_id) {
        const { data: order } = await req.supabase
          .from('orders')
          .select('*, order_items (*, products (*))')
          .eq('id', order_id)
          .single();

        if (order) {
          contextData.order = order;
          if (!invoiceData.amount && order.total) {
            invoiceData.amount = Number(order.total);
          }
          invoiceData.order_id = order_id;
        }
      }

      // AI-generated invoice details (simulated - in production, use OpenAI/Grok API)
      const aiGeneratedNotes = ai_prompt
        ? `AI Generated: ${ai_prompt}`
        : contextData.consultation
        ? `Invoice for ${contextData.consultation.consultation_type} consultation with ${contextData.consultation.client_name}. ${contextData.consultation.notes || ''}`
        : contextData.order
        ? `Invoice for order #${order_id.slice(0, 8)}. Total items: ${contextData.order.order_items?.length || 0}`
        : null;

      if (aiGeneratedNotes && !invoiceData.notes) {
        invoiceData.notes = aiGeneratedNotes;
      }
    }

    const total = invoiceData.amount + invoiceData.tax;

    const { supabaseAdmin } = require('../config/supabase');
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        ...invoiceData,
        total,
        status: 'draft',
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
 * POST /employee/invoices/:id/send
 * Send invoice to client (creates notification)
 */
router.post('/invoices/:id/send', async (req, res, next) => {
  try {
    const { id } = req.params;
    const eid = employeeId(req);

    const { data: invoice, error: invError } = await req.supabase
      .from('invoices')
      .select('*, consultations (employee_id)')
      .eq('id', id)
      .single();

    if (invError || !invoice) {
      return res.status(404).json({ error: true, message: 'Invoice not found' });
    }

    // Verify employee has access (through consultation or admin)
    if (invoice.consultation_id) {
      const consultation = invoice.consultations;
      if (consultation && consultation.employee_id !== eid && req.userRole !== 'admin') {
        return res.status(403).json({ error: true, message: 'Access denied' });
      }
    }

    // Update invoice status to 'sent'
    const { supabaseAdmin } = require('../config/supabase');
    await supabaseAdmin
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', id);

    // Create notification for client
    await req.supabase.from('notifications').insert({
      user_id: invoice.client_id,
      type: 'invoice',
      title: 'New Invoice',
      message: `You have a new invoice: ${invoice.invoice_number || id.slice(0, 8)}`,
      link: '/dashboard/invoices',
      metadata: { invoice_id: id },
    });

    res.json({ success: true, message: 'Invoice sent to client' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /employee/invoices
 * List invoices created by this employee (through consultations)
 */
router.get('/invoices', async (req, res, next) => {
  try {
    const eid = employeeId(req);
    const { status, limit = 50 } = req.query;

    // Get consultations by this employee
    const { data: consultations } = await req.supabase
      .from('consultations')
      .select('id')
      .eq('employee_id', eid);

    const consultationIds = (consultations || []).map((c) => c.id);

    if (consultationIds.length === 0) {
      return res.json([]);
    }

    let query = req.supabase
      .from('invoices')
      .select(`
        *,
        consultations (id, client_name, consultation_type),
        orders (id, total),
        profiles:client_id (id, full_name, email)
      `)
      .in('consultation_id', consultationIds)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (status) {
      query = query.eq('status', status);
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
