'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAnalyticsDashboard, getBehaviorAnalytics, getUserSegment, getAIPredictions } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AnalyticsPage() {
  return (
    <ProtectedAdminRoute>
      <AnalyticsContent />
    </ProtectedAdminRoute>
  );
}

function AnalyticsContent() {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsDashboard(period);
      setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Behavioral Analytics</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Total Events</p>
            <p className="text-3xl font-serif text-luxury-gold">{dashboard?.stats?.totalEvents || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Segments</p>
            <p className="text-3xl font-serif text-luxury-gold">
              {Object.keys(dashboard?.stats?.segmentDistribution || {}).length}
            </p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Top Motivation</p>
            <p className="text-lg font-serif text-luxury-gold capitalize">
              {dashboard?.stats?.topMotivations?.[0]?.motivation || '—'}
            </p>
          </motion.div>
        </div>

        <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg mb-8" variants={fadeInUp}>
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Segment Distribution</h2>
          <div className="space-y-2">
            {Object.entries(dashboard?.stats?.segmentDistribution || {}).map(([segment, count]) => (
              <div key={segment} className="flex justify-between items-center">
                <span className="text-luxury-ivory capitalize">{segment.replace('_', ' ')}</span>
                <span className="text-luxury-gold">{count}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Recent AI Predictions</h2>
          <div className="space-y-3">
            {dashboard?.recentPredictions?.length === 0 ? (
              <p className="text-luxury-ivory/60">No predictions yet</p>
            ) : (
              dashboard?.recentPredictions?.map((pred) => (
                <div key={pred.id} className="p-3 bg-luxury-black/50 rounded border border-luxury-gold/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-luxury-ivory font-medium capitalize">{pred.prediction_type?.replace('_', ' ')}</p>
                      <p className="text-luxury-ivory/60 text-sm">{new Date(pred.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-luxury-gold">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
