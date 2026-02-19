'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getAdminDashboard, getOrders } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp, staggerFast } from '@/lib/motion';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dash, orders] = await Promise.all([getAdminDashboard(), getOrders({ limit: 10 })]);
      setDashboard(dash);
      setRecentOrders(orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  const stats = dashboard?.stats || {};

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Admin Dashboard</h1>
          <p className="text-luxury-ivory/60">Real-time overview and analytics</p>
        </div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" variants={staggerFast} initial="hidden" animate="visible">
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm">Total Users</p>
            <p className="text-2xl font-serif text-luxury-gold mt-1">{stats.totalUsers || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm">Total Orders</p>
            <p className="text-2xl font-serif text-luxury-gold mt-1">{stats.totalOrders || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm">Total Products</p>
            <p className="text-2xl font-serif text-luxury-gold mt-1">{stats.totalProducts || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm">Today&apos;s Revenue</p>
            <p className="text-2xl font-serif text-luxury-gold mt-1">${(stats.todayRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-luxury-ivory/50 mt-1">{stats.todayOrders || 0} orders</p>
          </motion.div>
        </motion.div>

        <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-luxury-gold">Recent Orders</h2>
            <Link href="/dashboard/admin/orders" className="text-luxury-gold hover:underline text-sm">View all</Link>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-luxury-ivory/60 text-center py-8">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block p-3 bg-luxury-black/50 rounded border border-luxury-gold/10 hover:bg-luxury-gold/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-luxury-ivory font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-luxury-ivory/50 text-xs">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-luxury-gold font-medium">${Number(order.total || 0).toLocaleString()}</p>
                      <p className="text-luxury-ivory/50 text-xs capitalize">{order.status}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
