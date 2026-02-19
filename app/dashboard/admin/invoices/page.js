'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getInvoices, updateInvoiceStatus, createInvoice, getAdminClients, downloadInvoicePdf } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function InvoicesPage() {
  return (
    <ProtectedAdminRoute>
      <InvoicesContent />
    </ProtectedAdminRoute>
  );
}

function InvoicesContent() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null);
  const [form, setForm] = useState({
    client_id: '',
    amount: '',
    tax: '0',
    due_date: '',
    notes: '',
    order_id: '',
    consultation_id: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  useEffect(() => {
    if (showCreate) {
      getAdminClients().then(setClients).catch(() => setClients([]));
    }
  }, [showCreate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices({ status: filter !== 'all' ? filter : undefined, limit: 100 });
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateInvoiceStatus(id, { status });
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.amount) {
      alert('Client and amount are required');
      return;
    }
    setCreating(true);
    try {
      await createInvoice({
        client_id: form.client_id,
        amount: parseFloat(form.amount),
        tax: parseFloat(form.tax) || 0,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
        order_id: form.order_id || undefined,
        consultation_id: form.consultation_id || undefined,
      });
      setShowCreate(false);
      setForm({ client_id: '', amount: '', tax: '0', due_date: '', notes: '', order_id: '', consultation_id: '' });
      fetchInvoices();
    } catch (err) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadPdf = async (id) => {
    setPdfLoading(id);
    try {
      await downloadInvoicePdf(id);
    } catch (err) {
      alert(err.message || 'Failed to download PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Invoices</h1>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-luxury-gold text-luxury-black font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Invoice
            </motion.button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-luxury-ivory/60">Loading...</div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="text-luxury-gold font-medium">{inv.invoice_number}</p>
                  <p className="text-luxury-ivory/80">{inv.profiles_client_id?.full_name || inv.client_id}</p>
                  <p className="text-sm text-luxury-ivory/60">{new Date(inv.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(inv.id)}
                    disabled={pdfLoading === inv.id}
                    className="px-3 py-1.5 border border-luxury-gold/50 text-luxury-gold text-sm disabled:opacity-60"
                  >
                    {pdfLoading === inv.id ? '…' : 'Download PDF'}
                  </button>
                  <p className="text-2xl font-serif text-luxury-gold">${Number(inv.total).toLocaleString()}</p>
                  <select
                    value={inv.status}
                    onChange={(e) => handleStatusUpdate(inv.id, e.target.value)}
                    className="px-3 py-1 bg-charcoal border border-luxury-gold/30 text-luxury-ivory text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

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
                <h3 className="text-xl font-serif text-luxury-gold mb-4">Create Invoice</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-1">Client *</label>
                    <select
                      value={form.client_id}
                      onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-luxury-ivory/80 mb-1">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        required
                        className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-luxury-ivory/80 mb-1">Tax</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.tax}
                        onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))}
                        className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-1">Due date</label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                      className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-1">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
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
      </div>
    </motion.div>
  );
}
