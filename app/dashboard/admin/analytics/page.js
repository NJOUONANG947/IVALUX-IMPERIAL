'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAnalyticsDashboard, getUserSegment } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AnalyticsDashboardPage() {
  return (
    <ProtectedAdminRoute>
      <AnalyticsDashboardContent />
    </ProtectedAdminRoute>
  );
}

function AnalyticsDashboardContent() {
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
            <p className="text-luxury-ivory/60 text-sm mb-2">Predictions</p>
            <p className="text-3xl font-serif text-luxury-gold">{dashboard?.recentPredictions?.length || 0}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Segment Distribution</h2>
            <div className="space-y-3">
              {dashboard?.stats?.segmentDistribution &&
                Object.entries(dashboard.stats.segmentDistribution).map(([segment, count]) => (
                  <div key={segment} className="flex justify-between items-center">
                    <span className="text-luxury-ivory capitalize">{segment.replace('_', ' ')}</span>
                    <span className="text-luxury-gold font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </motion.section>

          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Top Motivations</h2>
            <div className="space-y-3">
              {dashboard?.stats?.topMotivations?.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-luxury-ivory capitalize">{m.motivation.replace('_', ' ')}</span>
                  <span className="text-luxury-gold font-medium">{m.count}</span>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
