/**
 * Invoices routes
 * GET  /invoices - list invoices
 * POST /invoices - create invoice
 * GET  /invoices/:id/pdf - generate PDF (must be before /:id)
 * GET  /invoices/:id - get invoice
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const PDFDocument = require('pdfkit');

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /invoices
 * List invoices
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const isAdmin = req.userRole === 'admin';

    let query = req.supabase
      .from('invoices')
      .select(`
        *,
        orders (id, total, status),
        consultations (id, client_name, consultation_type),
        profiles:client_id (id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (!isAdmin) {
      query = query.eq('client_id', req.user.id);
    }

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
 * POST /invoices
 * Create invoice (admin only)
 */
router.post('/', async (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: true, message: 'Admin only' });
    }

    const { order_id, consultation_id, client_id, amount, tax, due_date, notes } = req.body;

    if (!client_id || !amount) {
      return res.status(400).json({ error: true, message: 'client_id and amount required' });
    }

    const total = Number(amount) + (Number(tax) || 0);

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        order_id: order_id || null,
        consultation_id: consultation_id || null,
        client_id,
        amount: Number(amount),
        tax: Number(tax) || 0,
        total,
        due_date: due_date || null,
        notes: notes || null,
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
 * GET /invoices/:id/pdf
 * Generate and return invoice PDF
 */
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    const { data: inv, error } = await req.supabase
      .from('invoices')
      .select(`
        *,
        orders (id, total, status),
        consultations (id, client_name, consultation_type, amount),
        profiles:client_id (id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !inv) {
      return res.status(404).json({ error: true, message: 'Invoice not found' });
    }

    if (!isAdmin && inv.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    const client = inv.profiles_client_id || {};
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${inv.invoice_number || id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(24).text('IVALUX Imperial', { continued: false }).moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text('Invoice', { continued: false }).moveDown(1);

    doc.fontSize(12).fillColor('#000');
    doc.text(`Invoice: ${inv.invoice_number || '—'}`, { continued: false });
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, { continued: false });
    doc.text(`Status: ${inv.status || 'draft'}`, { continued: false }).moveDown(1);

    doc.text('Bill To:', { underline: true }).moveDown(0.3);
    doc.text(client.full_name || '—');
    doc.text(client.email || '—').moveDown(1);

    if (inv.orders) {
      doc.text(`Order ref: ${inv.orders.id || '—'}`, { continued: false });
    }
    if (inv.consultations) {
      doc.text(`Consultation: ${inv.consultations.client_name || '—'} (${inv.consultations.consultation_type || '—'})`, { continued: false });
    }
    doc.moveDown(1);

    doc.fontSize(11);
    doc.text(`Amount: $${Number(inv.amount).toFixed(2)}`, { continued: false });
    doc.text(`Tax: $${Number(inv.tax || 0).toFixed(2)}`, { continued: false });
    doc.fontSize(12).text(`Total: $${Number(inv.total).toFixed(2)}`, { continued: false });
    doc.moveDown(1);

    if (inv.due_date) {
      doc.fontSize(10).text(`Due date: ${new Date(inv.due_date).toLocaleDateString()}`, { continued: false });
    }
    if (inv.notes) {
      doc.moveDown(0.5).text(`Notes: ${inv.notes}`, { continued: false });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /invoices/:id
 * Get invoice details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    const { data, error } = await req.supabase
      .from('invoices')
      .select(`
        *,
        orders (*, order_items (*, products (*))),
        consultations (*),
        profiles:client_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: true, message: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: true, message: 'Invoice not found' });
    }

    if (!isAdmin && data.client_id !== req.user.id) {
      return res.status(403).json({ error: true, message: 'Access denied' });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /invoices/:id
 * Update invoice status
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paid_at } = req.body;

    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: true, message: 'Admin only' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (paid_at) updates.paid_at = paid_at;

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update(updates)
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
