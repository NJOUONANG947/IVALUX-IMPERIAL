'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import ProtectedEmployeeRoute from '@/components/auth/ProtectedEmployeeRoute';
import {
  getEmployeeDashboard,
  createConsultation,
  updateConsultation,
} from '@/lib/api';
import { fadeInUp, staggerFast } from '@/lib/motion';
import { useLanguage } from '@/lib/i18n';

export default function EmployeeDashboardPage() {
  return (
    <ProtectedEmployeeRoute>
      <EmployeeDashboardContent />
    </ProtectedEmployeeRoute>
  );
}

const CONSULTATION_TYPES = ['Skin Analysis', 'Product Recommendation', 'Beauty Diagnostic', 'General'];
const STATUS_OPTIONS = ['scheduled', 'in_progress', 'completed'];
const CONSULTATION_TYPE_KEYS = {
  'Skin Analysis': 'skinAnalysis',
  'Product Recommendation': 'productRecommendation',
  'Beauty Diagnostic': 'beautyDiagnostic',
  'General': 'general',
};

function statusClass(s) {
  if (s === 'completed') return 'bg-luxury-gold/20 text-luxury-gold';
  if (s === 'in_progress') return 'bg-amber-500/20 text-amber-400';
  return 'bg-charcoal text-luxury-ivory/60';
}

function EmployeeDashboardContent() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const statusLabel = (s) => t(`employee.statusLabels.${s}`) || s;
  const consultationLabel = (type) => t(`employee.consultationTypes.${CONSULTATION_TYPE_KEYS[type] || 'general'}`) || type;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    client_name: '',
    consultation_type: 'Skin Analysis',
    status: 'scheduled',
  });
  const [editForm, setEditForm] = useState({ status: '', notes: '', amount: '', satisfaction_rating: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getEmployeeDashboard();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.client_name?.trim()) return;
    setSubmitting(true);
    try {
      await createConsultation({
        client_name: form.client_name.trim(),
        consultation_type: form.consultation_type,
        status: form.status,
      });
      setShowCreate(false);
      setForm({ client_name: '', consultation_type: 'Skin Analysis', status: 'scheduled' });
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, updates) => {
    setSubmitting(true);
    try {
      await updateConsultation(id, updates);
      setEditingId(null);
      setEditForm({ status: '', notes: '', amount: '', satisfaction_rating: '' });
      fetchDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setEditForm({
      status: c.status,
      notes: c.notes || '',
      amount: c.amount != null ? String(c.amount) : '',
      satisfaction_rating: c.satisfaction_rating != null ? String(c.satisfaction_rating) : '',
    });
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-[calc(100vh-200px)] px-6 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="h-12 w-64 bg-charcoal/50 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-charcoal/50 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-charcoal/50 rounded-lg animate-pulse" />
        </div>
      </motion.div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6">
        <p className="text-amber-400 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const consultations = data?.recentConsultations || [];
  const handlings = data?.productHandlings || [];
  const displayName = currentUser?.full_name || data?.profile?.role || 'Employee';

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-serif text-luxury-ivory mb-2">{t('employee.assistedSelling')}</h1>
            <p className="text-luxury-ivory/60">
              {displayName} · {data?.profile?.role || 'Employee'}
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2 bg-luxury-gold text-luxury-black font-medium"
              type="button"
              whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(201,169,97,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              {t('employee.newConsultation')}
            </motion.button>
            <motion.button
              onClick={() => window.dispatchEvent(new CustomEvent('openLuxy'))}
              className="px-6 py-2 border border-luxury-gold text-luxury-gold"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(201,169,97,0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              {t('employee.openLuxy')}
            </motion.button>
          </div>
        </div>

        {error && (
          <motion.div
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* KPI Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerFast}
        >
          {[
            { label: t('employee.todayConsultations'), value: stats.todayConsultations ?? 0 },
            { label: t('employee.weeklySales'), value: `$${Number(stats.weeklySales ?? 0).toLocaleString()}` },
            { label: t('employee.clientSatisfaction'), value: stats.clientSatisfaction === '—' ? '—' : `${stats.clientSatisfaction}/5` },
            { label: t('employee.employeeId'), value: stats.employeeId ?? '—' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <p className="text-luxury-ivory/60 text-sm">{item.label}</p>
              <p className="text-2xl lg:text-3xl font-serif text-luxury-gold mt-1">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Consultations */}
        <motion.section
          className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-serif text-luxury-gold mb-4">{t('employee.recentConsultations')}</h2>
          {consultations.length === 0 ? (
            <p className="text-luxury-ivory/60 py-8 text-center">{t('employee.noConsultations')}</p>
          ) : (
            <div className="space-y-1">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b border-luxury-gold/10 last:border-0"
                >
                  <div>
                    <p className="text-luxury-ivory font-medium">{c.client_name}</p>
                    <p className="text-luxury-ivory/60 text-sm">
                      {consultationLabel(c.consultation_type)}
                      {c.amount != null && ` · $${Number(c.amount).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${statusClass(c.status)}`}>
                      {statusLabel(c.status)}
                    </span>
                    {c.status !== 'completed' && (
                      <motion.button
                        onClick={() => openEdit(c)}
                        className="text-xs text-luxury-gold hover:underline"
                        disabled={editingId === c.id}
                        type="button"
                      >
                        {t('employee.update')}
                      </motion.button>
                    )}
                  </div>
                  {editingId === c.id && (
                    <div className="col-span-2 mt-2 p-4 bg-luxury-black/50 rounded border border-luxury-gold/20">
                      <p className="text-sm text-luxury-ivory mb-2">{t('employee.updateConsultation')}</p>
                      <div className="flex flex-wrap gap-2 items-end">
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                          className="px-3 py-1.5 bg-charcoal border border-luxury-gold/30 text-luxury-ivory text-sm"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{statusLabel(s) || s}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Amount $"
                          value={editForm.amount}
                          onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                          className="w-24 px-3 py-1.5 bg-charcoal border border-luxury-gold/30 text-luxury-ivory text-sm"
                        />
                        <input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Rating 1-5"
                          value={editForm.satisfaction_rating}
                          onChange={(e) => setEditForm((f) => ({ ...f, satisfaction_rating: e.target.value }))}
                          className="w-20 px-3 py-1.5 bg-charcoal border border-luxury-gold/30 text-luxury-ivory text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                          className="flex-1 min-w-[120px] px-3 py-1.5 bg-charcoal border border-luxury-gold/30 text-luxury-ivory text-sm"
                        />
                        <button
                          onClick={() => handleUpdateStatus(c.id, {
                            status: editForm.status,
                            notes: editForm.notes || undefined,
                            amount: editForm.amount ? parseFloat(editForm.amount) : undefined,
                            satisfaction_rating: editForm.satisfaction_rating ? parseInt(editForm.satisfaction_rating, 10) : undefined,
                          })}
                          disabled={submitting}
                          className="px-3 py-1.5 bg-luxury-gold text-luxury-black text-sm font-medium disabled:opacity-60"
                        >
                          {submitting ? '…' : t('employee.save')}
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditForm({}); }}
                          className="px-3 py-1.5 text-luxury-ivory/60 text-sm"
                        >
                          {t('employee.cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Product Handlings */}
        {handlings.length > 0 && (
          <motion.section
            className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-serif text-luxury-gold mb-4">{t('employee.myProducts')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {handlings.map((h) => {
                const p = h.products;
                if (!p) return null;
                return (
                  <Link
                    key={h.id}
                    href={`/shop/${p.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-square overflow-hidden rounded border border-luxury-gold/10 mb-2">
                      <Image
                        src={p.image_url || 'https://cdn.shopify.com/s/files/1/0723/4302/7880/files/EACFC3B5-7CE0-4E0F-9DCC-80661437A4DF.png?v=1770527071'}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="120px"
                      />
                    </div>
                    <p className="text-luxury-ivory/90 text-sm truncate group-hover:text-luxury-gold">{p.name}</p>
                    <p className="text-luxury-gold/70 text-xs">{h.country}</p>
                  </Link>
                );
              })}
            </div>
          </motion.section>
        )}

        <div className="text-luxury-ivory/50 text-sm">
          <Link href="/shop" className="hover:text-luxury-gold">{t('employee.viewAllProducts')}</Link>
          {' · '}
          <Link href="/diagnostic" className="hover:text-luxury-gold">Beauty Diagnostic</Link>
        </div>
      </div>

      {/* Create Consultation Modal */}
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
              className="w-full max-w-md bg-charcoal border border-luxury-gold/30 rounded-lg p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-luxury-gold mb-4">{t('employee.newConsultation')}</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">{t('employee.clientName')}</label>
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
                  <label className="block text-sm text-luxury-ivory/80 mb-1">{t('employee.type')}</label>
                  <select
                    value={form.consultation_type}
                    onChange={(e) => setForm((f) => ({ ...f, consultation_type: e.target.value }))}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  >
                    {CONSULTATION_TYPES.map((type) => (
                      <option key={type} value={type}>{consultationLabel(type)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-1">{t('employee.status')}</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitting || !form.client_name?.trim()}
                    className="flex-1 py-2 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? t('employee.creating') : t('employee.create')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => !submitting && setShowCreate(false)}
                    className="px-4 py-2 border border-luxury-gold/50 text-luxury-ivory/80"
                  >
                    {t('employee.cancel')}
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
