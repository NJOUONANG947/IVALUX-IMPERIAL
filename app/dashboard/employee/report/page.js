'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { getEmployeeReport, downloadEmployeeReportCsv } from '@/lib/api';
import { fadeInUp } from '@/lib/motion';

export default function EmployeeReportPage() {
  const { t } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeReport({ start_date: startDate, end_date: endDate });
      setReport(data);
    } catch (err) {
      console.error(err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setDownloading(true);
    try {
      await downloadEmployeeReportCsv({ start_date: startDate, end_date: endDate });
    } catch (err) {
      alert(err.message || 'Failed to export');
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !report) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Sales Report</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <label className="text-luxury-ivory/80 text-sm">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-luxury-ivory/80 text-sm">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
              />
            </div>
            <motion.button
              onClick={handleExportCsv}
              disabled={downloading}
              className="px-4 py-2 border border-luxury-gold text-luxury-gold disabled:opacity-60"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {downloading ? 'Exporting...' : 'Export CSV'}
            </motion.button>
          </div>
        </div>

        {report && (
          <>
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" variants={fadeInUp}>
              <div className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg">
                <p className="text-luxury-ivory/60 text-sm">Total Consultations</p>
                <p className="text-2xl font-serif text-luxury-gold">{report.totalConsultations}</p>
              </div>
              <div className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg">
                <p className="text-luxury-ivory/60 text-sm">Completed</p>
                <p className="text-2xl font-serif text-luxury-gold">{report.completedConsultations}</p>
              </div>
              <div className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg">
                <p className="text-luxury-ivory/60 text-sm">Total Sales</p>
                <p className="text-2xl font-serif text-luxury-gold">${report.totalSales?.toLocaleString() ?? 0}</p>
              </div>
              <div className="bg-charcoal/50 border border-luxury-gold/20 p-4 rounded-lg">
                <p className="text-luxury-ivory/60 text-sm">Period</p>
                <p className="text-luxury-gold">{report.start_date} → {report.end_date}</p>
              </div>
            </motion.div>

            <motion.div className="bg-charcoal/50 border border-luxury-gold/20 rounded-lg overflow-hidden" variants={fadeInUp}>
              <h2 className="text-lg font-serif text-luxury-gold p-4 border-b border-luxury-gold/20">Consultations</h2>
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-luxury-black/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-luxury-ivory/80 text-sm">Date</th>
                      <th className="px-4 py-3 text-luxury-ivory/80 text-sm">Client</th>
                      <th className="px-4 py-3 text-luxury-ivory/80 text-sm">Type</th>
                      <th className="px-4 py-3 text-luxury-ivory/80 text-sm">Status</th>
                      <th className="px-4 py-3 text-luxury-ivory/80 text-sm">Amount</th>
                      <th className="px-4 py-3 text-luxury-ivory/80 text-sm">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report.consultations || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-luxury-ivory/60">No consultations in this period</td>
                      </tr>
                    ) : (
                      (report.consultations || []).map((c) => (
                        <tr key={c.id} className="border-b border-luxury-gold/10 hover:bg-luxury-black/30">
                          <td className="px-4 py-3 text-luxury-ivory text-sm">{new Date(c.created_at).toLocaleString()}</td>
                          <td className="px-4 py-3 text-luxury-ivory">{c.client_name || '—'}</td>
                          <td className="px-4 py-3 text-luxury-ivory/90">{c.consultation_type || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${c.status === 'completed' ? 'bg-luxury-gold/20 text-luxury-gold' : 'bg-charcoal text-luxury-ivory/80'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-luxury-gold">${c.amount != null ? Number(c.amount).toLocaleString() : '—'}</td>
                          <td className="px-4 py-3 text-luxury-ivory/80">{c.satisfaction_rating ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
