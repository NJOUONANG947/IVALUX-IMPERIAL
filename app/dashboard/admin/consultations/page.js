'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAdminConsultations } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminConsultationsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminConsultationsContent />
    </ProtectedAdminRoute>
  );
}

function AdminConsultationsContent() {
  const { t } = useLanguage();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : { limit: 100 };
      const data = await getAdminConsultations(params);
      setConsultations(data);
    } catch (err) {
      console.error(err);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    scheduled: 'bg-charcoal text-luxury-ivory/80',
    in_progress: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-luxury-gold/20 text-luxury-gold',
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Consultations</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No consultations found</p>
            </div>
          ) : (
            consultations.map((c) => (
              <motion.div key={c.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-luxury-ivory font-medium">{c.client_name || '—'}</p>
                    <p className="text-luxury-ivory/80 mt-1">{c.consultation_type || '—'}</p>
                    <p className="text-luxury-ivory/60 text-sm mt-1">{new Date(c.created_at).toLocaleString()}</p>
                    {c.notes && <p className="text-luxury-ivory/70 text-sm mt-2">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    {c.amount != null && (
                      <p className="text-luxury-gold font-medium">${Number(c.amount).toLocaleString()}</p>
                    )}
                    {c.satisfaction_rating != null && (
                      <p className="text-luxury-ivory/80">Rating: {c.satisfaction_rating}/5</p>
                    )}
                    <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[c.status] || 'bg-charcoal text-luxury-ivory'}`}>
                      {c.status}
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
