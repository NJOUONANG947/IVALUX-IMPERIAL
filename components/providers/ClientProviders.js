'use client';

import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n';

export default function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );
}
