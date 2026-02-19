'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getFinancialDashboard, getFinancialRevenue, getFinancialPayments } from '@/lib/api';
import { fadeInUp, staggerFast } from '@/lib/motion';
import { useLanguage } from '@/lib/i18n';

export default function FinancialDashboardPage() {
  return (
    <ProtectedAdminRoute>
      <FinancialDashboardContent />
    </ProtectedAdminRoute>
  );
}

function FinancialDashboardContent() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('month');
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dash, rev, pay] = await Promise.all([
        getFinancialDashboard(period),
        getFinancialRevenue({ group_by: period === 'day' ? 'day' : period === 'week' ? 'week' : 'month' }),
        getFinancialPayments({ limit: 20 }),
      ]);
      setDashboard(dash);
      setRevenue(rev);
      setPayments(pay);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-luxury-ivory/60">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-amber-400">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Financial Dashboard</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Revenue KPIs */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerFast}
        >
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Total Revenue</p>
            <p className="text-3xl font-serif text-luxury-gold">${dashboard?.revenue?.total?.toLocaleString() || 0}</p>
            <p className="text-xs text-luxury-ivory/50 mt-1">{dashboard?.revenue?.orders_count || 0} orders</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Invoices Paid</p>
            <p className="text-3xl font-serif text-luxury-gold">${dashboard?.invoices?.paid?.toLocaleString() || 0}</p>
            <p className="text-xs text-luxury-ivory/50 mt-1">{dashboard?.invoices?.count || 0} invoices</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Pending Payments</p>
            <p className="text-3xl font-serif text-amber-400">${dashboard?.invoices?.pending?.toLocaleString() || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Total Payments</p>
            <p className="text-3xl font-serif text-luxury-gold">${dashboard?.payments?.total?.toLocaleString() || 0}</p>
            <p className="text-xs text-luxury-ivory/50 mt-1">{dashboard?.payments?.count || 0} transactions</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Country */}
          <motion.section
            className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Revenue by Country</h2>
            <div className="space-y-3">
              {dashboard?.revenue?.by_country && Object.entries(dashboard.revenue.by_country).map(([country, amount]) => (
                <div key={country} className="flex justify-between items-center">
                  <span className="text-luxury-ivory">{country}</span>
                  <span className="text-luxury-gold font-medium">${Number(amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Payments by Method */}
          <motion.section
            className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Payments by Method</h2>
            <div className="space-y-3">
              {dashboard?.payments?.by_method && Object.entries(dashboard.payments.by_method).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-luxury-ivory capitalize">{method.replace('_', ' ')}</span>
                  <span className="text-luxury-gold font-medium">${Number(amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Recent Payments */}
          <motion.section
            className="lg:col-span-2 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Recent Payments</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {payments?.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center py-2 border-b border-luxury-gold/10">
                  <div>
                    <p className="text-luxury-ivory">{payment.profiles_client_id?.full_name || payment.client_id}</p>
                    <p className="text-xs text-luxury-ivory/50">{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-luxury-gold font-medium">${Number(payment.amount).toLocaleString()}</p>
                    <p className="text-xs text-luxury-ivory/50 capitalize">{payment.method}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
