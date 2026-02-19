'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as api from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

export default function SignupPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await api.signup(email, password, name);
      if (data.access_token) {
        localStorage.setItem('ivalux_access_token', data.access_token);
        router.replace('/dashboard');
      } else {
        setSuccess(data.message || 'Account created. Check your email to confirm.');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 border-2 border-luxury-gold flex items-center justify-center">
              <span className="text-luxury-gold font-serif text-xl font-bold">I</span>
            </div>
            <span className="font-serif text-xl text-luxury-ivory">IVALUX IMPERIAL</span>
          </Link>
          <h1 className="text-2xl font-serif text-luxury-ivory mb-2">{t('nav.joinClub')}</h1>
          <p className="text-luxury-ivory/60 text-sm">{t('auth.createAccountDesc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-amber-400 text-sm bg-amber-500/10 border border-amber-500/30 px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-luxury-gold text-sm bg-luxury-gold/10 border border-luxury-gold/30 px-4 py-3">
              {success}
            </p>
          )}
          <div>
            <label htmlFor="name" className="block text-sm text-luxury-ivory/80 mb-2">
              {t('auth.fullName')}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory placeholder:text-luxury-ivory/40 focus:border-luxury-gold outline-none transition-colors"
            />
          </div>
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
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory placeholder:text-luxury-ivory/40 focus:border-luxury-gold outline-none transition-colors"
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
              minLength={6}
              className="w-full px-4 py-3 bg-charcoal border border-luxury-gold/30 text-luxury-ivory placeholder:text-luxury-ivory/40 focus:border-luxury-gold outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-luxury-gold text-luxury-black font-medium hover:bg-luxury-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
          </button>
        </form>

        <p className="mt-8 text-center text-luxury-ivory/60 text-sm">
          {t('auth.haveAccount')}{' '}
          <Link href="/login" className="text-luxury-gold hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
