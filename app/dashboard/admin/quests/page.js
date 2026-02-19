'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';
import { getAdminQuests, createQuest, updateQuest, deleteQuest } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function AdminQuestsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminQuestsContent />
    </ProtectedAdminRoute>
  );
}

function AdminQuestsContent() {
  const { t } = useLanguage();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quest_type: 'purchase',
    points_reward: 100,
    is_active: true,
  });

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await getAdminQuests();
      setQuests(data);
    } catch (err) {
      console.error(err);
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuest) {
        await updateQuest(editingQuest.id, formData);
      } else {
        await createQuest(formData);
      }
      setShowModal(false);
      setEditingQuest(null);
      setFormData({ name: '', description: '', quest_type: 'purchase', points_reward: 100, is_active: true });
      fetchQuests();
    } catch (err) {
      alert(err.message || 'Failed to save quest');
    }
  };

  const handleEdit = (quest) => {
    setEditingQuest(quest);
    setFormData({
      name: quest.name || '',
      description: quest.description || '',
      quest_type: quest.quest_type || 'purchase',
      points_reward: quest.points_reward || 100,
      is_active: quest.is_active !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quest?')) return;
    try {
      await deleteQuest(id);
      fetchQuests();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-serif text-luxury-ivory">Quests Management</h1>
          <motion.button
            onClick={() => {
              setEditingQuest(null);
              setFormData({ name: '', description: '', quest_type: 'purchase', points_reward: 100, is_active: true });
              setShowModal(true);
            }}
            className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Quest
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
              variants={fadeInUp}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-serif text-luxury-ivory">{quest.name}</h3>
                <span className={`px-2 py-1 text-xs rounded ${
                  quest.is_active ? 'bg-green-500/20 text-green-400' : 'bg-charcoal text-luxury-ivory/60'
                }`}>
                  {quest.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-luxury-ivory/70 text-sm mb-4">{quest.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-ivory/60">Type:</span>
                  <span className="text-luxury-ivory capitalize">{quest.quest_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-ivory/60">Reward:</span>
                  <span className="text-luxury-gold">{quest.points_reward} points</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(quest)}
                  className="flex-1 px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(quest.id)}
                  className="flex-1 px-4 py-2 border border-red-500/50 text-red-400 text-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-charcoal border border-luxury-gold/30 p-8 rounded-lg max-w-2xl w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-2xl font-serif text-luxury-ivory mb-6">{editingQuest ? 'Edit Quest' : 'Create Quest'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                  />
                </div>
                <div>
                  <label className="block text-sm text-luxury-ivory/80 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Type</label>
                    <select
                      value={formData.quest_type}
                      onChange={(e) => setFormData({ ...formData, quest_type: e.target.value })}
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    >
                      <option value="purchase">Purchase</option>
                      <option value="review">Review</option>
                      <option value="consultation">Consultation</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-luxury-ivory/80 mb-2">Points Reward</label>
                    <input
                      type="number"
                      value={formData.points_reward}
                      onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                      required
                      className="w-full px-4 py-3 bg-luxury-black border border-luxury-gold/30 text-luxury-ivory"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 bg-luxury-gold text-luxury-black font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editingQuest ? 'Update' : 'Create'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingQuest(null);
                      setFormData({ name: '', description: '', quest_type: 'purchase', points_reward: 100, is_active: true });
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
      </div>
    </motion.div>
  );
}
