'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getInvoices, downloadInvoicePdf } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function ClientInvoicesPage() {
  return (
    <ProtectedClientRoute>
      <ClientInvoicesContent />
    </ProtectedClientRoute>
  );
}

function ClientInvoicesContent() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pdfLoading, setPdfLoading] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : { limit: 100 };
      const data = await getInvoices(params);
      setInvoices(data);
    } catch (err) {
      console.error(err);
      setInvoices([]);
    } finally {
      setLoading(false);
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

  const statusColors = {
    draft: 'bg-charcoal text-luxury-ivory/80',
    sent: 'bg-blue-500/20 text-blue-400',
    paid: 'bg-luxury-gold/20 text-luxury-gold',
    overdue: 'bg-amber-500/20 text-amber-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-luxury-gold hover:underline text-sm mb-2 inline-block">← Back to dashboard</Link>
            <h1 className="text-4xl font-serif text-luxury-ivory">My Invoices</h1>
          </div>
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

        {loading ? (
          <div className="py-12 text-center text-luxury-ivory/60">{t('common.loading')}</div>
        ) : invoices.length === 0 ? (
          <div className="bg-charcoal/50 border border-luxury-gold/20 rounded-lg p-12 text-center">
            <p className="text-luxury-ivory/60">No invoices yet</p>
            <p className="text-luxury-ivory/50 text-sm mt-2">Your invoices will appear here when they are issued.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <motion.div
                key={inv.id}
                className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg flex flex-wrap justify-between items-center gap-4"
                variants={fadeInUp}
              >
                <div>
                  <p className="text-luxury-gold font-medium">{inv.invoice_number}</p>
                  <p className="text-sm text-luxury-ivory/60">{new Date(inv.created_at).toLocaleDateString()}</p>
                  {inv.due_date && (
                    <p className="text-xs text-luxury-ivory/50 mt-1">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm capitalize ${statusColors[inv.status] || 'bg-charcoal text-luxury-ivory'}`}>
                    {inv.status}
                  </span>
                  <p className="text-xl font-serif text-luxury-gold">${Number(inv.total).toLocaleString()}</p>
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(inv.id)}
                    disabled={pdfLoading === inv.id}
                    className="px-3 py-1.5 border border-luxury-gold/50 text-luxury-gold text-sm hover:bg-luxury-gold/10 disabled:opacity-60"
                  >
                    {pdfLoading === inv.id ? '…' : 'Download PDF'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
