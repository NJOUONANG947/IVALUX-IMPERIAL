'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import {
  getEmployeeConsultations,
  createConsultation,
  updateConsultation,
} from '@/lib/api';
import { fadeInUp } from '@/lib/motion';

const CONSULTATION_TYPES = ['Skin Analysis', 'Product Recommendation', 'Beauty Diagnostic', 'General'];
const STATUS_OPTIONS = ['scheduled', 'in_progress', 'completed'];

export default function EmployeeConsultationsPage() {
  const { t } = useLanguage();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    client_name: '',
    consultation_type: 'Skin Analysis',
    status: 'scheduled',
    notes: '',
  });
  const [editForm, setEditForm] = useState({ status: '', notes: '', amount: '', satisfaction_rating: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, [statusFilter]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : { limit: 100 };
      const data = await getEmployeeConsultations(params);
      setConsultations(data);
    } catch (err) {
      console.error(err);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.client_name?.trim()) return;
    setSubmitting(true);
    try {
      await createConsultation(form);
      setShowCreate(false);
      setForm({ client_name: '', consultation_type: 'Skin Analysis', status: 'scheduled', notes: '' });
      fetchConsultations();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    setSubmitting(true);
    try {
      await updateConsultation(id, updates);
      setEditingId(null);
      setEditForm({ status: '', notes: '', amount: '', satisfaction_rating: '' });
      fetchConsultations();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = (s) => {
    if (s === 'completed') return 'bg-luxury-gold/20 text-luxury-gold';
    if (s === 'in_progress') return 'bg-amber-500/20 text-amber-400';
    return 'bg-charcoal text-luxury-ivory/60';
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">My Consultations</h1>
          <div className="flex gap-3">
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
            <motion.button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              New Consultation
            </motion.button>
          </div>
        </div>

        <div className="space-y-4">
          {consultations.length === 0 ? (
            <div className="text-center py-16 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No consultations yet</p>
              <motion.button
                onClick={() => setShowCreate(true)}
                className="mt-4 px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Create First Consultation
              </motion.button>
            </div>
          ) : (
            consultations.map((c) => (
              <motion.div
                key={c.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                variants={fadeInUp}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <p className="text-lg font-serif text-luxury-ivory">{c.client_name}</p>
                    <p className="text-luxury-ivory/60 text-sm">{c.consultation_type}</p>
                    <p className="text-luxury-ivory/50 text-xs mt-1">
                      {new Date(c.created_at).toLocaleDateString()}
                      {c.amount != null && ` · $${Number(c.amount).toLocaleString()}`}
                    </p>
                    {c.notes && <p className="text-luxury-ivory/70 text-sm mt-2">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-sm capitalize ${statusClass(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    {c.status !== 'completed' && (
                      <motion.button
                        onClick={() =>
                          setEditingId(c.id) ||
                          setEditForm({
                            status: c.status,
                            notes: c.notes || '',
                            amount: c.amount != null ? String(c.amount) : '',
                            satisfaction_rating: c.satisfaction_rating != null ? String(c.satisfaction_rating) : '',
                          })
                        }
                        className="px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Update
                      </motion.button>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {editingId === c.id && (
                    <motion.div
                      className="mt-4 p-4 bg-luxury-black/50 rounded border border-luxury-gold/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="block text-xs text-luxury-ivory/60 mb-1">Status</label>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                            className="px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-luxury-ivory/60 mb-1">Amount $</label>
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                            className="w-24 px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-luxury-ivory/60 mb-1">Rating 1-5</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editForm.satisfaction_rating}
                            onChange={(e) => setEditForm((f) => ({ ...f, satisfaction_rating: e.target.value }))}
                            className="w-16 px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-xs text-luxury-ivory/60 mb-1">Notes</label>
                          <input
                            type="text"
                            value={editForm.notes}
                            onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                            className="w-full px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
                          />
                        </div>
                        <button
                          onClick={() =>
                            handleUpdate(c.id, {
                              status: editForm.status,
                              notes: editForm.notes || undefined,
                              amount: editForm.amount ? parseFloat(editForm.amount) : undefined,
                              satisfaction_rating: editForm.satisfaction_rating ? parseInt(editForm.satisfaction_rating, 10) : undefined,
                            })
                          }
                          disabled={submitting}
                          className="px-4 py-2 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                        >
                          {submitting ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-luxury-ivory/60"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            onClick={() => !submitting && setShowCreate(false)}
          >
            <motion.div
              className="w-full max-w-md bg-charcoal border border-luxury-gold/30 rounded-lg p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-luxury-gold mb-4">New Consultation</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                    placeholder="e.g. Victoria L."
                    required
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Type</label>
                  <select
                    value={form.consultation_type}
                    onChange={(e) => setForm((f) => ({ ...f, consultation_type: e.target.value }))}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  >
                    {CONSULTATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={submitting || !form.client_name?.trim()}
                    className="flex-1 py-2 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? 'Creating...' : 'Create'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => !submitting && setShowCreate(false)}
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
