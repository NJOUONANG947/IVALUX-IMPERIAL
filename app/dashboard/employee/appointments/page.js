'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { getAppointments, updateAppointment, getEmployeeClients, createEmployeeAppointment } from '@/lib/api';
import { fadeInUp } from '@/lib/motion';

export default function EmployeeAppointmentsPage() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    client_id: '',
    datetime: '',
    duration_minutes: 60,
    type: 'consultation',
    notes: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  useEffect(() => {
    if (showCreate) {
      getEmployeeClients().then(setClients).catch(() => setClients([]));
    }
  }, [showCreate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await getAppointments(params);
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.client_id || !createForm.datetime) {
      alert('Select client and date/time');
      return;
    }
    setCreating(true);
    try {
      await createEmployeeAppointment({
        client_id: createForm.client_id,
        datetime: createForm.datetime,
        duration_minutes: createForm.duration_minutes || 60,
        type: createForm.type || 'consultation',
        notes: createForm.notes || undefined,
      });
      setShowCreate(false);
      setCreateForm({ client_id: '', datetime: '', duration_minutes: 60, type: 'consultation', notes: '' });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to create appointment');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(true);
    try {
      await updateAppointment(id, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">My Schedule</h1>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-luxury-gold text-luxury-black font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              New Appointment
            </motion.button>
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
        </div>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-16 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No appointments scheduled</p>
              <p className="text-luxury-ivory/50 text-sm mt-2">Create an appointment or wait for clients to book</p>
            <motion.button
              onClick={() => setShowCreate(true)}
              className="mt-4 px-4 py-2 bg-luxury-gold text-luxury-black font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              New Appointment
            </motion.button>
            </div>
          ) : (
            appointments.map((apt) => (
              <motion.div
                key={apt.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
                    <p className="text-luxury-ivory/60 text-sm capitalize mt-1">{apt.type}</p>
                    {apt.notes && <p className="text-luxury-ivory/60 text-sm mt-2">{apt.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[apt.status] || 'bg-charcoal text-luxury-ivory'}`}>
                      {apt.status?.replace('_', ' ')}
                    </span>
                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        disabled={updating}
                        className="px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory text-sm"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !creating && setShowCreate(false)}
          >
            <motion.div
              className="w-full max-w-md bg-charcoal border border-luxury-gold/30 rounded-lg p-6 shadow-xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-luxury-gold mb-4">New Appointment</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Client</label>
                  <select
                    value={createForm.client_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, client_id: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.email} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={createForm.datetime}
                    onChange={(e) => setCreateForm((f) => ({ ...f, datetime: e.target.value }))}
                    required
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={createForm.duration_minutes}
                    onChange={(e) => setCreateForm((f) => ({ ...f, duration_minutes: parseInt(e.target.value, 10) || 60 }))}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="product_demo">Product Demo</option>
                    <option value="treatment">Treatment</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Notes (optional)</label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => !creating && setShowCreate(false)}
                    className="px-4 py-2 border border-luxury-gold/50 text-luxury-ivory/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
