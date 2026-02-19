'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAdminAppointments } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminAppointmentsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminAppointmentsContent />
    </ProtectedAdminRoute>
  );
}

function AdminAppointmentsContent() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : { limit: 100 };
      const data = await getAdminAppointments(params);
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    scheduled: 'bg-charcoal text-luxury-ivory/80',
    confirmed: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-luxury-gold/20 text-luxury-gold',
    cancelled: 'bg-red-500/20 text-red-400',
    no_show: 'bg-charcoal text-luxury-ivory/50',
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Appointments</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No appointments found</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <motion.div key={apt.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-lg font-serif text-luxury-ivory">
                      {new Date(apt.datetime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-luxury-ivory/80 mt-1">
                      Client: {apt.profiles_client_id?.full_name || apt.profiles_client_id?.email || '—'}
                    </p>
                    <p className="text-luxury-ivory/80 mt-1">
                      Employee: {apt.profiles_employee_id?.full_name || apt.profiles_employee_id?.email || '—'}
                    </p>
                    <p className="text-luxury-ivory/60 text-sm capitalize mt-1">{apt.type}</p>
                    {apt.notes && <p className="text-luxury-ivory/60 text-sm mt-2">{apt.notes}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[apt.status] || 'bg-charcoal text-luxury-ivory'}`}>
                    {apt.status?.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
