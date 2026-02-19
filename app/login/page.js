'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import * as api from '@/lib/api';
import { fadeInUp, stagger } from '@/lib/motion';
import { useLanguage } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const me = await api.getMe();
      const role = me.profile?.role || me.role || 'client';
      if (role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (role === 'employee') {
        router.replace('/dashboard/employee');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div className="text-center mb-10" variants={fadeInUp}>
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 border-2 border-luxury-gold flex items-center justify-center">
              <span className="text-luxury-gold font-serif text-xl font-bold">I</span>
            </div>
            <span className="font-serif text-xl text-luxury-ivory">IVALUX IMPERIAL</span>
          </Link>
          <h1 className="text-2xl font-serif text-luxury-ivory mb-2">{t('auth.welcomeBack')}</h1>
          <p className="text-luxury-ivory/60 text-sm">{t('auth.signInToAccount')}</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={fadeInUp}
        >
          {error && (
            <motion.p
              className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 px-4 py-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}
          <div>
            <label htmlFor="email" className="block text-sm text-luxury-ivory/80 mb-2">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory placeholder:text-luxury-ivory/40 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-luxury-ivory/80 mb-2">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory placeholder:text-luxury-ivory/40 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all duration-200"
            />
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-luxury-gold text-luxury-black font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={{ scale: submitting ? 1 : 1.02, boxShadow: submitting ? 'none' : '0 8px 25px rgba(201, 169, 97, 0.3)' }}
            whileTap={{ scale: submitting ? 1 : 0.98 }}
          >
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </motion.button>
        </motion.form>

        <motion.p
          className="mt-8 text-center text-luxury-ivory/60 text-sm"
          variants={fadeInUp}
        >
          {t('auth.noAccount')}{' '}
          <Link href="/signup" className="text-luxury-gold hover:underline transition-colors">
            {t('auth.joinClub')}
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
