'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getOrders } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function ClientOrdersPage() {
  return (
    <ProtectedClientRoute>
      <ClientOrdersContent />
    </ProtectedClientRoute>
  );
}

function ClientOrdersContent() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : { limit: 50 };
      const data = await getOrders(params);
      setOrders(data);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">My Orders</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60 mb-4">No orders yet</p>
              <Link href="/shop">
                <motion.button
                  className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Shopping
                </motion.button>
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg hover:border-luxury-gold/40 transition-colors"
                variants={fadeInUp}
              >
                <Link href={`/dashboard/orders/${order.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-serif text-luxury-ivory hover:text-luxury-gold transition-colors mb-1">
                        Order #{order.id?.slice(0, 8) || '—'}
                      </h3>
                      <p className="text-luxury-ivory/60 text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-luxury-ivory/50 text-sm mt-1">
                        {order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-serif text-luxury-gold mb-2">
                        ${Number(order.total_amount || order.total || 0).toLocaleString()}
                      </p>
                      <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[order.status] || 'bg-charcoal text-luxury-ivory'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
