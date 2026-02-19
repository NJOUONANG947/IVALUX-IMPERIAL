'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedEmployeeRoute from '@/components/auth/ProtectedEmployeeRoute';
import { getEmployeeClients, getEmployeeConsultations, createEmployeeInvoiceAI, getEmployeeInvoices, downloadInvoicePdf, sendInvoiceToClient } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function EmployeeInvoicesPage() {
  return (
    <ProtectedEmployeeRoute>
      <EmployeeInvoicesContent />
    </ProtectedEmployeeRoute>
  );
}

function EmployeeInvoicesContent() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    consultation_id: '',
    amount: '',
    tax: '',
    notes: '',
    ai_prompt: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inv, cli, cons] = await Promise.all([
        getEmployeeInvoices(),
        getEmployeeClients(),
        getEmployeeConsultations({ status: 'completed' }),
      ]);
      setInvoices(inv || []);
      setClients(cli || []);
      setConsultations(cons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const invoice = await createEmployeeInvoiceAI({
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        tax: formData.tax ? parseFloat(formData.tax) : undefined,
      });
      setShowModal(false);
      setFormData({ client_id: '', consultation_id: '', amount: '', tax: '', notes: '', ai_prompt: '' });
      fetchData();
      alert(t('invoices.generated'));
    } catch (err) {
      alert(err.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      await downloadInvoicePdf(invoiceId);
    } catch (err) {
      alert(err.message || 'Failed to download invoice');
    }
  };

  const handleSend = async (invoiceId) => {
    if (!confirm('Send this invoice to the client?')) return;
    try {
      await sendInvoiceToClient(invoiceId);
      alert(t('invoices.sent'));
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to send invoice');
    }
  };

  const statusColors = {
    draft: 'bg-charcoal text-luxury-ivory/80',
    sent: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-luxury-gold/20 text-luxury-gold',
    overdue: 'bg-red-500/20 text-red-400',
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">{t('invoices.title')}</h1>
          <motion.button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('invoices.generateAI')}
          </motion.button>
        </div>

        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">{t('invoices.noInvoices')}</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <motion.div key={inv.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-luxury-ivory font-medium">{t('invoices.invoiceNumber')}{inv.invoice_number || inv.id.slice(0, 8)}</p>
                    <p className="text-luxury-ivory/80 mt-1">
                      {t('invoices.client')}: {inv.profiles_client_id?.full_name || inv.profiles_client_id?.email || '—'}
                    </p>
                    {inv.consultations && (
                      <p className="text-luxury-ivory/60 text-sm mt-1">
                        {t('invoices.consultation')}: {inv.consultations.client_name} ({inv.consultations.consultation_type})
                      </p>
                    )}
                    <p className="text-luxury-ivory/50 text-xs mt-1">{new Date(inv.created_at).toLocaleString()}</p>
                    {inv.notes && <p className="text-luxury-ivory/70 text-sm mt-2">{inv.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-luxury-gold font-medium text-lg">${Number(inv.total || 0).toLocaleString()}</p>
                      <p className="text-luxury-ivory/60 text-sm">
                        {t('invoices.amount')}: ${Number(inv.amount || 0).toLocaleString()} + {t('invoices.tax')}: ${Number(inv.tax || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[inv.status] || 'bg-charcoal text-luxury-ivory'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleDownload(inv.id)}
                    className="px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm hover:bg-luxury-gold/10"
                  >
                    {t('invoices.downloadPDF')}
                  </button>
                  {inv.status === 'draft' && (
                    <button
                      onClick={() => handleSend(inv.id)}
                      className="px-4 py-2 bg-luxury-gold text-luxury-black text-sm hover:bg-luxury-gold/90"
                    >
                      {t('invoices.sendToClient')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-charcoal border border-luxury-gold/30 p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <h2 className="text-2xl font-serif text-luxury-ivory mb-6">{t('invoices.generateWithAI')}</h2>
                <form onSubmit={handleGenerateAI} className="space-y-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">{t('invoices.client')} *</label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    >
                      <option value="">{t('invoices.selectClient')}</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name || c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">{t('invoices.selectConsultation')}</label>
                    <select
                      value={formData.consultation_id}
                      onChange={(e) => {
                        const cons = consultations.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          consultation_id: e.target.value,
                          amount: cons?.amount ? String(cons.amount) : formData.amount,
                        });
                      }}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    >
                      <option value="">{t('invoices.selectConsultation')}</option>
                      {consultations.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.client_name} - {c.consultation_type} (${c.amount || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-luxury-ivory/80 mb-2">{t('invoices.amount')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-luxury-ivory/80 mb-2">{t('invoices.tax')}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.tax}
                        onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                        className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">{t('invoices.aiPrompt')}</label>
                    <textarea
                      value={formData.ai_prompt}
                      onChange={(e) => setFormData({ ...formData, ai_prompt: e.target.value })}
                      rows={3}
                      placeholder={t('invoices.aiPromptPlaceholder')}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">{t('invoices.notes')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={generating}
                      className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                      whileHover={{ scale: generating ? 1 : 1.02 }}
                      whileTap={{ scale: generating ? 1 : 0.98 }}
                    >
                      {generating ? t('invoices.generating') : t('invoices.generate')}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ client_id: '', consultation_id: '', amount: '', tax: '', notes: '', ai_prompt: '' });
                      }}
                      className="px-6 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
                    >
                      {t('invoices.cancel')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
