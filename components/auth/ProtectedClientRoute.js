'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isAdmin } from '@/lib/AuthContext';

/**
 * Route guard: Client Dashboard - clients only
 * Employee → redirect to /dashboard/employee
 * Admin → redirect to /dashboard/admin
 */
export default function ProtectedClientRoute({ children }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const role = currentUser?.role;
    if (role === 'employee') {
      router.replace('/dashboard/employee');
      return;
    }
    if (role === 'admin') {
      router.replace('/dashboard/admin');
    }
  }, [isLoading, isAuthenticated, currentUser?.role, router]);

  if (isLoading || !isAuthenticated || currentUser?.role !== 'client') {
    return null;
  }

  return children;
}
