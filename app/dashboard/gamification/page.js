'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBeautyQuests, getMyQuests, startQuest, completeBeautyQuest } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function GamificationPage() {
  const { t } = useLanguage();
  const [quests, setQuests] = useState([]);
  const [myQuests, setMyQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ quest_type: '', difficulty: '' });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [q, mq] = await Promise.all([
        getBeautyQuests({ ...filter, is_active: true }),
        getMyQuests(),
      ]);
      setQuests(q || []);
      setMyQuests(mq || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (questId) => {
    try {
      await startQuest(questId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to start quest');
    }
  };

  const handleComplete = async (questId) => {
    try {
      const result = await completeBeautyQuest(questId);
      alert(`Quest completed! Earned ${result.points_earned} points${result.badge ? ` and badge: ${result.badge}` : ''}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to complete quest');
    }
  };

  if (loading) {
    return <div className="min-h-[200px] flex items-center justify-center px-6">{t('common.loading')}</div>;
  }

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-blue-500/20 text-blue-400',
    hard: 'bg-orange-500/20 text-orange-400',
    expert: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div className="px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">Beauty Quests</h1>

        <div className="flex gap-4 mb-8">
          <select
            value={filter.quest_type}
            onChange={(e) => setFilter({ ...filter, quest_type: e.target.value })}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="review">Review</option>
            <option value="consultation">Consultation</option>
            <option value="social_share">Social Share</option>
            <option value="look_creation">Look Creation</option>
            <option value="event_attendance">Event Attendance</option>
          </select>
          <select
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
            className="px-4 py-2 bg-charcoal border border-luxury-gold/30 text-luxury-ivory"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">Available Quests</h2>
            <div className="space-y-4">
              {quests.length === 0 ? (
                <p className="text-luxury-ivory/60">No quests available</p>
              ) : (
                quests.map((quest) => {
                  const myQuest = myQuests.find((mq) => mq.quest_id === quest.id);
                  return (
                    <div key={quest.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-luxury-ivory font-medium">{quest.quest_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${difficultyColors[quest.difficulty] || 'bg-charcoal text-luxury-ivory'}`}>
                          {quest.difficulty}
                        </span>
                      </div>
                      <p className="text-luxury-ivory/70 text-sm mb-3">{quest.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-luxury-gold">{quest.points_reward} points</span>
                          {quest.badge_reward && <span className="text-luxury-ivory/60">Badge: {quest.badge_reward}</span>}
                          {quest.nft_reward && <span className="text-luxury-gold">NFT Reward</span>}
                        </div>
                        {myQuest ? (
                          myQuest.status === 'completed' ? (
                            <span className="text-luxury-gold text-sm">Completed</span>
                          ) : (
                            <button
                              onClick={() => handleComplete(quest.id)}
                              className="px-4 py-2 bg-luxury-gold text-luxury-black text-sm hover:bg-luxury-gold/90"
                            >
                              Complete
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleStart(quest.id)}
                            className="px-4 py-2 border border-luxury-gold/50 text-luxury-gold text-sm hover:bg-luxury-gold/10"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.section>

          <motion.section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg" variants={fadeInUp}>
            <h2 className="text-xl font-serif text-luxury-gold mb-4">My Progress</h2>
            <div className="space-y-4">
              {myQuests.length === 0 ? (
                <p className="text-luxury-ivory/60">No active quests</p>
              ) : (
                myQuests.map((mq) => (
                  <div key={mq.id} className="p-4 bg-luxury-black/50 rounded border border-luxury-gold/10">
                    <h3 className="text-luxury-ivory font-medium">{mq.beauty_quests?.quest_name}</h3>
                    <p className="text-luxury-ivory/60 text-sm capitalize mt-1">{mq.status.replace('_', ' ')}</p>
                    {mq.completed_at && (
                      <p className="text-luxury-ivory/50 text-xs mt-1">
                        Completed: {new Date(mq.completed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
