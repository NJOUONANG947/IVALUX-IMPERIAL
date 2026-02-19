'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

/**
 * Route guard: Employee Dashboard - employees only
 * Client → redirect to /dashboard
 * Admin → redirect to /dashboard/admin
 */
export default function ProtectedEmployeeRoute({ children }) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const role = currentUser?.role;
    if (role === 'client') {
      router.replace('/dashboard');
      return;
    }
    if (role === 'admin') {
      router.replace('/dashboard/admin');
    }
  }, [isLoading, isAuthenticated, currentUser?.role, router]);

  if (isLoading || !isAuthenticated || currentUser?.role !== 'employee') {
    return null;
  }

  return children;
}
