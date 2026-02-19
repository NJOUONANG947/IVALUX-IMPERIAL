'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getOrders, updateOrderStatus } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminOrdersPage() {
  return (
    <ProtectedAdminRoute>
      <AdminOrdersContent />
    </ProtectedAdminRoute>
  );
}

function AdminOrdersContent() {
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
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getOrders(params);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Orders Management</h1>
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
            <div className="text-center py-12 text-luxury-ivory/60">No orders found</div>
          ) : (
            orders.map((order) => (
              <motion.div
                key={order.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <h3 className="text-lg font-serif text-luxury-ivory hover:text-luxury-gold transition-colors">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                      </Link>
                      <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[order.status] || 'bg-charcoal text-luxury-ivory'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-luxury-ivory/60">Date:</span>
                        <p className="text-luxury-ivory">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-luxury-ivory/60">Total:</span>
                        <p className="text-luxury-gold">${order.total_amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-luxury-ivory/60">Items:</span>
                        <p className="text-luxury-ivory">{order.order_items?.length || 0}</p>
                      </div>
                      <div>
                        <span className="text-luxury-ivory/60">Country:</span>
                        <p className="text-luxury-ivory">{order.country || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
