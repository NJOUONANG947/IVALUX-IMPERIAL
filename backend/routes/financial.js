/**
 * Financial routes (Admin only)
 * GET /financial/dashboard - financial overview
 * GET /financial/revenue - revenue analytics
 * GET /financial/payments - payment tracking
 */
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin());

/**
 * GET /financial/dashboard
 * Financial overview dashboard
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
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
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startIso = startDate.toISOString();

    // Total revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total, country, status, created_at')
      .gte('created_at', startIso)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

    // Revenue by country
    const revenueByCountry = {};
    (orders || []).forEach(o => {
      const country = o.country || 'Unknown';
      revenueByCountry[country] = (revenueByCountry[country] || 0) + Number(o.total || 0);
    });

    // Total invoices
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select('total, status, created_at')
      .gte('created_at', startIso);

    const totalInvoices = (invoices || []).reduce((sum, i) => sum + Number(i.total || 0), 0);
    const paidInvoices = (invoices || []).filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total || 0), 0);
    const pendingInvoices = (invoices || []).filter(i => i.status === 'sent').reduce((sum, i) => sum + Number(i.total || 0), 0);

    // Payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('amount, status, method, created_at')
      .gte('created_at', startIso);

    const totalPayments = (payments || []).filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paymentsByMethod = {};
    (payments || []).filter(p => p.status === 'completed').forEach(p => {
      const method = p.method || 'other';
      paymentsByMethod[method] = (paymentsByMethod[method] || 0) + Number(p.amount || 0);
    });

    // Orders count
    const ordersCount = orders?.length || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

    res.json({
      period,
      start_date: startIso,
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        by_country: revenueByCountry,
        orders_count: ordersCount,
        pending_orders: pendingOrders,
      },
      invoices: {
        total: Math.round(totalInvoices * 100) / 100,
        paid: Math.round(paidInvoices * 100) / 100,
        pending: Math.round(pendingInvoices * 100) / 100,
        count: invoices?.length || 0,
      },
      payments: {
        total: Math.round(totalPayments * 100) / 100,
        by_method: paymentsByMethod,
        count: payments?.length || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /financial/revenue
 * Revenue analytics with time series
 */
router.get('/revenue', async (req, res, next) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;
    const start = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = end_date || new Date().toISOString();

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total, created_at, country, status')
      .gte('created_at', start)
      .lte('created_at', end)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    // Group by time period
    const grouped = {};
    (orders || []).forEach(order => {
      const date = new Date(order.created_at);
      let key;
      
      if (group_by === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (group_by === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (group_by === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { date: key, revenue: 0, orders: 0 };
      }
      grouped[key].revenue += Number(order.total || 0);
      grouped[key].orders += 1;
    });

    res.json({
      period: { start, end, group_by },
      data: Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /financial/payments
 * Payment tracking
 */
router.get('/payments', async (req, res, next) => {
  try {
    const { status, limit = 100 } = req.query;

    let query = supabaseAdmin
      .from('payments')
      .select(`
        *,
        invoices (invoice_number, total),
        orders (id, total),
        profiles:client_id (id, full_name, email)
      `)
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
