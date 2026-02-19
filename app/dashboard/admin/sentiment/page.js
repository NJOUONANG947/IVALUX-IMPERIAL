'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getSentimentDashboard, getSatisfactionAlerts, resolveSatisfactionAlert } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function SentimentAnalysisPage() {
  return (
    <ProtectedAdminRoute>
      <SentimentAnalysisContent />
    </ProtectedAdminRoute>
  );
}

function SentimentAnalysisContent() {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dash, al] = await Promise.all([getSentimentDashboard(period), getSatisfactionAlerts({ resolved: false })]);
      setDashboard(dash);
      setAlerts(al || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await resolveSatisfactionAlert(alertId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to resolve alert');
    }
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  const severityColors = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Sentiment Analysis</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Positive</p>
            <p className="text-3xl font-serif text-luxury-gold">
              {dashboard?.sentimentDistribution?.positive || 0}
            </p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Negative</p>
            <p className="text-3xl font-serif text-red-400">{dashboard?.sentimentDistribution?.negative || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Neutral</p>
            <p className="text-3xl font-serif text-luxury-ivory">{dashboard?.sentimentDistribution?.neutral || 0}</p>
          </motion.div>
          <motion.div className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <p className="text-luxury-ivory/60 text-sm mb-2">Avg Score</p>
            <p className="text-3xl font-serif text-luxury-gold">
              {dashboard?.averageSentimentScore?.toFixed(2) || '0.00'}
            </p>
          </motion.div>
        </div>

        <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg mb-8" variants={fadeInUp}>
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Satisfaction Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-luxury-ivory/60 text-center py-8">No active alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex justify-between items-start p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded text-sm capitalize ${severityColors[alert.severity] || 'bg-charcoal text-luxury-ivory'}`}>
                        {alert.severity}
                      </span>
                      <span className="text-luxury-ivory/80 capitalize">{alert.alert_type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-luxury-ivory/70 text-sm">{alert.message}</p>
                    {alert.profiles && (
                      <p className="text-luxury-ivory/50 text-xs mt-1">
                        User: {alert.profiles.full_name || alert.profiles.email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 bg-luxury-gold text-luxury-black text-sm hover:bg-luxury-gold/90"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
