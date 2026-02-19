'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedClientRoute from '@/components/auth/ProtectedClientRoute';
import { getLoyaltyPoints } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { fadeInUp } from '@/lib/motion';

export default function ClientLoyaltyPage() {
  return (
    <ProtectedClientRoute>
      <ClientLoyaltyContent />
    </ProtectedClientRoute>
  );
}

function ClientLoyaltyContent() {
  const { t } = useLanguage();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const fetchLoyalty = async () => {
    try {
      setLoading(true);
      const data = await getLoyaltyPoints();
      setLoyalty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tierInfo = {
    bronze: { label: 'Bronze', minPoints: 0, color: 'from-amber-800 to-amber-600', benefits: ['5% off first order', 'Early access to sales'] },
    silver: { label: 'Silver', minPoints: 500, color: 'from-gray-400 to-gray-300', benefits: ['10% off orders', 'Free shipping over $100', 'Birthday gift'] },
    gold: { label: 'Gold', minPoints: 2000, color: 'from-amber-400 to-amber-600', benefits: ['15% off orders', 'Free shipping always', 'Exclusive products', 'Priority support'] },
    platinum: { label: 'Platinum', minPoints: 5000, color: 'from-slate-400 to-slate-200', benefits: ['20% off orders', 'Early product launches', 'Personal beauty consultant', 'VIP events'] },
    diamond: { label: 'Diamond', minPoints: 10000, color: 'from-cyan-400 to-blue-500', benefits: ['25% off orders', 'Luxury gift set', 'Dedicated account manager', 'Private consultations'] },
  };

  const currentTier = tierInfo[loyalty?.tier || 'bronze'] || tierInfo.bronze;
  const nextTier = loyalty?.tier === 'diamond' ? null : {
    bronze: tierInfo.silver,
    silver: tierInfo.gold,
    gold: tierInfo.platinum,
    platinum: tierInfo.diamond,
  }[loyalty?.tier || 'bronze'];

  const progressPercent = nextTier
    ? Math.min(100, ((loyalty?.lifetime_points || loyalty?.points || 0) - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints) * 100)
    : 100;

  if (loading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <motion.div className="min-h-[calc(100vh-200px)] px-6 py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-luxury-ivory mb-8">Loyalty & Rewards</h1>

        {/* Current tier card */}
        <motion.div
          className={`bg-gradient-to-r ${currentTier.color} p-8 rounded-lg mb-8 text-luxury-black`}
          variants={fadeInUp}
        >
          <h2 className="text-2xl font-serif mb-2">Your Tier: {currentTier.label}</h2>
          <p className="text-lg mb-6 opacity-90">
            {(loyalty?.points || 0).toLocaleString()} points available · {(loyalty?.lifetime_points || loyalty?.points || 0).toLocaleString()} lifetime points
          </p>
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextTier.label}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-black/40 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-sm mt-2 opacity-90">
                {(nextTier.minPoints - (loyalty?.lifetime_points || loyalty?.points || 0)).toLocaleString()} points to {nextTier.label}
              </p>
            </div>
          )}
        </motion.div>

        {/* Benefits */}
        <motion.section
          className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg mb-8"
          variants={fadeInUp}
        >
          <h2 className="text-xl font-serif text-luxury-gold mb-4">Your Benefits</h2>
          <ul className="space-y-2">
            {currentTier.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-3 text-luxury-ivory/90">
                <span className="text-luxury-gold">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* How to earn */}
        <motion.section
          className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg"
          variants={fadeInUp}
        >
          <h2 className="text-xl font-serif text-luxury-gold mb-4">How to Earn Points</h2>
          <div className="space-y-4 text-luxury-ivory/80">
            <div className="flex justify-between py-2 border-b border-luxury-gold/10">
              <span>Every $1 spent</span>
              <span className="text-luxury-gold">1 point</span>
            </div>
            <div className="flex justify-between py-2 border-b border-luxury-gold/10">
              <span>Product review</span>
              <span className="text-luxury-gold">50 points</span>
            </div>
            <div className="flex justify-between py-2 border-b border-luxury-gold/10">
              <span>Completed quest</span>
              <span className="text-luxury-gold">100–500 points</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Subscription sign-up</span>
              <span className="text-luxury-gold">200 points</span>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <Link href="/shop">
              <motion.button
                className="px-6 py-3 bg-luxury-gold text-luxury-black font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Shop Now
              </motion.button>
            </Link>
            <Link href="/dashboard/quests">
              <motion.button
                className="px-6 py-3 border border-luxury-gold text-luxury-gold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Complete Quests
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
