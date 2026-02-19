'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { getAppointments, createAppointment, updateAppointment } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    datetime: '',
    duration_minutes: 60,
    type: 'consultation',
    notes: '',
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchEmployees();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    // In real app, fetch from API
    setEmployees([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAppointment(form);
      setShowCreate(false);
      setForm({ employee_id: '', datetime: '', duration_minutes: 60, type: 'consultation', notes: '' });
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Appointments</h1>
          <motion.button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Book Appointment
          </motion.button>
        </div>

        <div className="space-y-4">
          {appointments.map((apt) => (
            <motion.div
              key={apt.id}
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-luxury-ivory font-medium">
                    {new Date(apt.datetime).toLocaleString()}
                  </p>
                  <p className="text-luxury-ivory/80">
                    {apt.profiles_employee_id?.full_name || 'Employee'}
                  </p>
                  <p className="text-sm text-luxury-ivory/60 capitalize">{apt.type}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded ${apt.status === 'completed' ? 'bg-luxury-gold/20 text-luxury-gold' : apt.status === 'scheduled' ? 'bg-charcoal text-luxury-ivory/80' : 'bg-amber-500/20 text-amber-400'}`}>
                  {apt.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                className="w-full max-w-md bg-charcoal border border-luxury-gold/30 rounded-lg p-6"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-serif text-luxury-gold mb-4">Book Appointment</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.datetime}
                      onChange={(e) => setForm({ ...form, datetime: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value, 10) })}
                      min="30"
                      step="30"
                      className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-luxury-gold text-luxury-black font-medium"
                    >
                      Book
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
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
      </div>
    </motion.div>
  );
}
