'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';
import deMessages from '@/messages/de.json';
import zhMessages from '@/messages/zh.json';

const LOCALE_KEY = 'ivalux_locale';
const DEFAULT_LOCALE = 'fr';

const translations = {
  en: enMessages,
  fr: frMessages,
  de: deMessages,
  zh: zhMessages,
};

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  messages: {},
});

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    const stored = localStorage.getItem(LOCALE_KEY);
    return (stored === 'en' || stored === 'fr') ? stored : DEFAULT_LOCALE;
  });
  const [messages, setMessages] = useState(() => translations[locale] || translations.fr || {});

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCALE_KEY) : null;
    if (stored && ['en', 'fr', 'de', 'zh'].includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    setMessages(translations[locale] || {});
  }, [locale]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((newLocale) => {
    if (!['en', 'fr', 'de', 'zh'].includes(newLocale)) return;
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_KEY, newLocale);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const parts = key.split('.');
      let val = messages;
      for (const p of parts) {
        val = val?.[p];
      }
      return typeof val === 'string' ? val : key;
    },
    [messages]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, messages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
