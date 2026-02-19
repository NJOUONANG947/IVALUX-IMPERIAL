'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAdminSubscriptions } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminSubscriptionsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminSubscriptionsContent />
    </ProtectedAdminRoute>
  );
}

function AdminSubscriptionsContent() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : { limit: 100 };
      const data = await getAdminSubscriptions(params);
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    active: 'bg-luxury-gold/20 text-luxury-gold',
    paused: 'bg-amber-500/20 text-amber-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-charcoal text-luxury-ivory/60',
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Subscriptions</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No subscriptions found</p>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <motion.div key={sub.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <Link href={`/shop/${sub.product_id}`} className="text-luxury-gold hover:underline font-medium">
                      {sub.products?.name || 'Product'}
                    </Link>
                    <p className="text-luxury-ivory/80 mt-1">
                      Client: {sub.profiles_client_id?.full_name || sub.profiles_client_id?.email || '—'}
                    </p>
                    <p className="text-luxury-ivory/60 text-sm mt-1 capitalize">{sub.plan_type || '—'}</p>
                    <p className="text-luxury-ivory/50 text-xs mt-1">
                      Created: {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                    {sub.next_billing_date && (
                      <p className="text-luxury-ivory/50 text-xs">Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-luxury-gold font-medium">${Number(sub.amount || 0).toLocaleString()}</p>
                    <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[sub.status] || 'bg-charcoal text-luxury-ivory'}`}>
                      {sub.status}
                    </span>
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
