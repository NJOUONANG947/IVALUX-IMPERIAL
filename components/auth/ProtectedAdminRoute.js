'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isAdmin } from '@/lib/AuthContext';

/**
 * Route guard: Admin Dashboard access
 * - Not authenticated → redirect to /login
 * - Authenticated but not admin → redirect to /unauthorized
 * - Admin → render children
 */
export default function ProtectedAdminRoute({ children }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!isAdmin(currentUser)) {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuthenticated, currentUser, router]);

  if (isLoading || !isAuthenticated || !isAdmin(currentUser)) {
    return null;
  }

  return children;
}
