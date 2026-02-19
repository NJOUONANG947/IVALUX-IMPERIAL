'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getQuests, getMyLoyaltyQuests, completeQuest, getLoyaltyPoints } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp, staggerFast } from '@/lib/motion';

export default function QuestsPage() {
  return (
    <ProtectedClientRoute>
      <QuestsContent />
    </ProtectedClientRoute>
  );
}

function QuestsContent() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [availableQuests, setAvailableQuests] = useState([]);
  const [myQuests, setMyQuests] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quests, myQ, points] = await Promise.all([
        getQuests().catch(() => []),
        getMyLoyaltyQuests().catch(() => []),
        getLoyaltyPoints().catch(() => null),
      ]);
      setAvailableQuests(quests);
      setMyQuests(myQ);
      setLoyalty(points);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId) => {
    try {
      await completeQuest(questId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const getQuestStatus = (questId) => {
    const myQuest = myQuests.find(q => q.quest_id === questId);
    return myQuest?.status || 'available';
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Quests & Achievements</h1>
            {loyalty && (
              <p className="text-luxury-ivory/60">
                {loyalty.points || 0} points · Tier: <span className="capitalize text-luxury-gold">{loyalty.tier || 'bronze'}</span>
              </p>
            )}
          </div>
        </div>

        {/* My Active Quests */}
        {myQuests.filter(q => q.status === 'in_progress').length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-luxury-gold mb-6">In Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myQuests
                .filter(q => q.status === 'in_progress')
                .map((myQuest) => {
                  const quest = availableQuests.find(q => q.id === myQuest.quest_id);
                  if (!quest) return null;
                  return (
                    <motion.div
                      key={myQuest.id}
                      className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
                      variants={fadeInUp}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-serif text-luxury-ivory">{quest.name}</h3>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">In Progress</span>
                      </div>
                      <p className="text-luxury-ivory/70 text-sm mb-4">{quest.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-luxury-ivory/60">
                          <span>Progress</span>
                          <span>0%</span>
                        </div>
                        <div className="h-2 bg-luxury-black rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-luxury-gold to-amber-600" style={{ width: '0%' }} />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-luxury-gold/10">
                        <p className="text-luxury-gold text-sm">
                          Reward: {quest.points_reward} points
                          {quest.product_reward_id && ' + Product'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Available Quests */}
        <section>
          <h2 className="text-2xl font-serif text-luxury-gold mb-6">Available Quests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuests.map((quest) => {
              const status = getQuestStatus(quest.id);
              const isCompleted = status === 'completed' || status === 'claimed';
              const isInProgress = status === 'in_progress';

              return (
                <motion.div
                  key={quest.id}
                  className={`bg-charcoal/50 border p-6 rounded-lg ${
                    isCompleted ? 'border-luxury-gold/50 opacity-75' : 'border-luxury-gold/20'
                  }`}
                  variants={fadeInUp}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-serif text-luxury-ivory">{quest.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded capitalize ${
                      isCompleted ? 'bg-luxury-gold/20 text-luxury-gold' :
                      isInProgress ? 'bg-amber-500/20 text-amber-400' :
                      'bg-charcoal text-luxury-ivory/60'
                    }`}>
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : quest.quest_type}
                    </span>
                  </div>
                  <p className="text-luxury-ivory/70 text-sm mb-4">{quest.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-luxury-ivory/60">Reward</span>
                      <span className="text-luxury-gold font-medium">
                        {quest.points_reward} points
                        {quest.discount_reward && ` + ${quest.discount_reward}% off`}
                      </span>
                    </div>
                    {!isCompleted && (
                      <motion.button
                        onClick={() => handleCompleteQuest(quest.id)}
                        className="w-full py-2 bg-luxury-gold text-luxury-black font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isInProgress}
                      >
                        {isInProgress ? 'In Progress' : 'Start Quest'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
