'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getFormulations, createFormulation } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function FormulationsPage() {
  return (
    <ProtectedClientRoute>
      <FormulationsContent />
    </ProtectedClientRoute>
  );
}

function FormulationsContent() {
  const { t } = useLanguage();
  const [formulations, setFormulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    formulation_name: '',
    skin_type: '',
    skin_concerns: [],
    ingredients: [],
    formulation_data: {},
  });

  useEffect(() => {
    fetchFormulations();
  }, []);

  const fetchFormulations = async () => {
    try {
      setLoading(true);
      const data = await getFormulations();
      setFormulations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createFormulation(formData);
      setShowModal(false);
      setFormData({ formulation_name: '', skin_type: '', skin_concerns: [], ingredients: [], formulation_data: {} });
      fetchFormulations();
    } catch (err) {
      alert(err.message || 'Failed to create formulation');
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    draft: 'bg-charcoal text-luxury-ivory/80',
    pending: 'bg-blue-500/20 text-blue-400',
    approved: 'bg-green-500/20 text-green-400',
    manufacturing: 'bg-amber-500/20 text-amber-400',
    ready: 'bg-luxury-gold/20 text-luxury-gold',
    shipped: 'bg-purple-500/20 text-purple-400',
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Personalized Formulations</h1>
          <motion.button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Formulation
          </motion.button>
        </div>

        <div className="space-y-4">
          {formulations.length === 0 ? (
            <div className="text-center py-12 bg-charcoal/50 border border-luxury-gold/20 rounded-lg">
              <p className="text-luxury-ivory/60">No formulations yet. Create one to get started.</p>
            </div>
          ) : (
            formulations.map((form) => (
              <motion.div key={form.id} className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-luxury-ivory font-medium">{form.formulation_name}</p>
                    {form.skin_type && <p className="text-luxury-ivory/60 text-sm mt-1">Skin Type: {form.skin_type}</p>}
                    {form.skin_concerns && form.skin_concerns.length > 0 && (
                      <p className="text-luxury-ivory/60 text-sm mt-1">
                        Concerns: {form.skin_concerns.join(', ')}
                      </p>
                    )}
                    <p className="text-luxury-ivory/50 text-xs mt-1">{new Date(form.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm capitalize ${statusColors[form.status] || 'bg-charcoal text-luxury-ivory'}`}>
                    {form.status}
                  </span>
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
                <h2 className="text-2xl font-serif text-luxury-ivory mb-6">Create Personalized Formulation</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Formulation Name *</label>
                    <input
                      type="text"
                      value={formData.formulation_name}
                      onChange={(e) => setFormData({ ...formData, formulation_name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Skin Type</label>
                    <select
                      value={formData.skin_type}
                      onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    >
                      <option value="">Select</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Skin Concerns (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="acne, wrinkles, dark spots"
                      value={formData.skin_concerns.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skin_concerns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Ingredients (JSON array)</label>
                    <textarea
                      value={JSON.stringify(formData.ingredients, null, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, ingredients: JSON.parse(e.target.value) });
                        } catch {}
                      }}
                      rows={4}
                      placeholder='["hyaluronic acid", "vitamin C", "retinol"]'
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60"
                      whileHover={{ scale: saving ? 1 : 1.02 }}
                      whileTap={{ scale: saving ? 1 : 0.98 }}
                    >
                      {saving ? 'Creating...' : 'Create'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ formulation_name: '', skin_type: '', skin_concerns: [], ingredients: [], formulation_data: {} });
                      }}
                      className="px-6 py-3 border border-luxury-gold/50 text-luxury-ivory/80"
                    >
                      Cancel
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
