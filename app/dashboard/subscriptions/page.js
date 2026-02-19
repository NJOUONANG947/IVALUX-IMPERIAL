'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getSubscriptions, pauseSubscription, resumeSubscription } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function ClientSubscriptionsPage() {
  return (
    <ProtectedClientRoute>
      <ClientSubscriptionsContent />
    </ProtectedClientRoute>
  );
}

function ClientSubscriptionsContent() {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, paused, cancelled

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await getSubscriptions(params);
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    try {
      await pauseSubscription(id);
      fetchSubscriptions();
    } catch (err) {
      alert(err.message || 'Failed to pause subscription');
    }
  };

  const handleResume = async (id) => {
    try {
      await resumeSubscription(id);
      fetchSubscriptions();
    } catch (err) {
      alert(err.message || 'Failed to resume subscription');
    }
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-amber-500/20 text-amber-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-charcoal text-luxury-ivory/60',
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">My Subscriptions</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.length === 0 ? (
            <div className="col-span-2 text-center py-16 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60 mb-4">No subscriptions yet</p>
              <p className="text-luxury-ivory/50 text-sm">Subscribe to your favorite products for recurring deliveries.</p>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <motion.div
                key={sub.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-serif text-luxury-ivory">
                    {sub.products?.name || sub.product_name || 'Subscription'}
                  </h3>
                  <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[sub.status] || 'bg-charcoal text-luxury-ivory'}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between text-luxury-ivory/80">
                    <span>Plan</span>
                    <span className="capitalize">{sub.plan_type || '—'}</span>
                  </div>
                  <div className="flex justify-between text-luxury-ivory/80">
                    <span>Amount</span>
                    <span className="text-luxury-gold">${Number(sub.amount || 0).toLocaleString()}</span>
                  </div>
                  {sub.next_billing_date && (
                    <div className="flex justify-between text-luxury-ivory/80">
                      <span>Next billing</span>
                      <span>{new Date(sub.next_billing_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {sub.status === 'active' && (
                  <motion.button
                    onClick={() => handlePause(sub.id)}
                    className="w-full py-2 border border-amber-500/50 text-amber-400 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Pause Subscription
                  </motion.button>
                )}
                {sub.status === 'paused' && (
                  <motion.button
                    onClick={() => handleResume(sub.id)}
                    className="w-full py-2 bg-luxury-gold text-luxury-black font-medium text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Resume Subscription
                  </motion.button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
