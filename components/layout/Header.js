'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, isAdmin } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-luxury-black/95 backdrop-blur-md border-b border-luxury-gold/20"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="w-10 h-10 border-2 border-luxury-gold flex items-center justify-center"
              whileHover={{ scale: 1.05, borderColor: '#D4B872' }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-luxury-gold font-serif text-xl font-bold">I</span>
            </motion.div>
            <div>
              <h1 className="text-luxury-ivory font-serif text-lg tracking-wider">IVALUX</h1>
              <p className="text-luxury-gold text-xs tracking-widest">IMPERIAL</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
              {t('nav.home')}
            </Link>
            <Link href="/shop" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
              {t('nav.shop')}
            </Link>
            <Link href="/diagnostic" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
              {t('nav.diagnostic')}
            </Link>
            <Link href="/beauty-scanner" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
              AI Scanner
            </Link>
            <Link href="/metaverse" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
              Metaverse
            </Link>
            <Link href="/marketplace" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
              Marketplace
            </Link>
            {isAuthenticated && (
              <>
                <Link href={currentUser?.role === 'admin' ? '/dashboard/admin' : currentUser?.role === 'employee' ? '/dashboard/employee' : '/dashboard'} className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
                  {t('nav.dashboard')}
                </Link>
                {currentUser?.role === 'client' && (
                  <Link href="/dashboard/invoices" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
                    Invoices
                  </Link>
                )}
                {currentUser?.role === 'admin' && (
                  <Link href="/dashboard/admin/invoices" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
                    Invoices
                  </Link>
                )}
              </>
            )}
            {isAuthenticated && isAdmin(currentUser) && (
              <>
                <Link href="/dashboard/admin" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
                  {t('nav.admin')}
                </Link>
                <Link href="/dashboard/admin/distribution" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm tracking-wide">
                  {t('nav.distribution')}
                </Link>
              </>
            )}
            <div className="flex items-center gap-1 border-l border-luxury-gold/30 pl-4">
              <button
                onClick={() => setLocale('fr')}
                className={`px-2 py-0.5 text-xs font-medium transition-colors ${locale === 'fr' ? 'text-luxury-gold' : 'text-luxury-ivory/50 hover:text-luxury-ivory/80'}`}
                aria-label="Français"
              >
                FR
              </button>
              <span className="text-luxury-ivory/30">|</span>
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-0.5 text-xs font-medium transition-colors ${locale === 'en' ? 'text-luxury-gold' : 'text-luxury-ivory/50 hover:text-luxury-ivory/80'}`}
                aria-label="English"
              >
                EN
              </button>
              <span className="text-luxury-ivory/30">|</span>
              <button
                onClick={() => setLocale('de')}
                className={`px-2 py-0.5 text-xs font-medium transition-colors ${locale === 'de' ? 'text-luxury-gold' : 'text-luxury-ivory/50 hover:text-luxury-ivory/80'}`}
                aria-label="Deutsch"
              >
                DE
              </button>
              <span className="text-luxury-ivory/30">|</span>
              <button
                onClick={() => setLocale('zh')}
                className={`px-2 py-0.5 text-xs font-medium transition-colors ${locale === 'zh' ? 'text-luxury-gold' : 'text-luxury-ivory/50 hover:text-luxury-ivory/80'}`}
                aria-label="中文"
              >
                中文
              </button>
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-luxury-ivory/60 text-sm">{currentUser?.full_name || currentUser?.email}</span>
                <button onClick={handleLogout} className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-luxury-ivory/80 hover:text-luxury-gold transition-colors duration-300 text-sm">
                  {t('nav.signIn')}
                </Link>
                <Link href="/signup" className="px-5 py-2 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300 text-sm tracking-wide">
                  {t('nav.joinClub')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-luxury-ivory p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 pb-4 border-t border-luxury-gold/20 pt-4 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.home')}</Link>
              <Link href="/shop" className="text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.shop')}</Link>
              <Link href="/diagnostic" className="text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.diagnostic')}</Link>
              <Link href="/beauty-scanner" className="text-luxury-ivory/80 hover:text-luxury-gold">AI Scanner</Link>
              <Link href="/metaverse" className="text-luxury-ivory/80 hover:text-luxury-gold">Metaverse</Link>
              <Link href="/marketplace" className="text-luxury-ivory/80 hover:text-luxury-gold">Marketplace</Link>
              {isAuthenticated && (
                <>
                  <Link href={currentUser?.role === 'admin' ? '/dashboard/admin' : currentUser?.role === 'employee' ? '/dashboard/employee' : '/dashboard'} className="text-luxury-ivory/80 hover:text-luxury-gold">
                    {t('nav.dashboard')}
                  </Link>
                  {currentUser?.role === 'client' && (
                    <Link href="/dashboard/invoices" className="text-luxury-ivory/80 hover:text-luxury-gold">Invoices</Link>
                  )}
                  {currentUser?.role === 'admin' && (
                    <Link href="/dashboard/admin/invoices" className="text-luxury-ivory/80 hover:text-luxury-gold">Invoices</Link>
                  )}
                </>
              )}
              {isAuthenticated && isAdmin(currentUser) && (
                <>
                  <Link href="/dashboard/admin" className="text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.admin')}</Link>
                  <Link href="/dashboard/admin/distribution" className="text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.distribution')}</Link>
                </>
              )}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button onClick={() => setLocale('fr')} className={`text-sm ${locale === 'fr' ? 'text-luxury-gold font-medium' : 'text-luxury-ivory/60'}`}>FR</button>
                <span className="text-luxury-ivory/30">|</span>
                <button onClick={() => setLocale('en')} className={`text-sm ${locale === 'en' ? 'text-luxury-gold font-medium' : 'text-luxury-ivory/60'}`}>EN</button>
                <span className="text-luxury-ivory/30">|</span>
                <button onClick={() => setLocale('de')} className={`text-sm ${locale === 'de' ? 'text-luxury-gold font-medium' : 'text-luxury-ivory/60'}`}>DE</button>
                <span className="text-luxury-ivory/30">|</span>
                <button onClick={() => setLocale('zh')} className={`text-sm ${locale === 'zh' ? 'text-luxury-gold font-medium' : 'text-luxury-ivory/60'}`}>中文</button>
              </div>
              <div className="flex flex-col space-y-2 pt-4 border-t border-luxury-gold/20">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="text-left text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.logout')}</button>
                ) : (
                  <>
                    <Link href="/login" className="text-luxury-ivory/80 hover:text-luxury-gold">{t('nav.signIn')}</Link>
                    <Link href="/signup" className="text-luxury-gold">{t('nav.joinClub')}</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
