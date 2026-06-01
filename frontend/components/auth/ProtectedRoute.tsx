'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'customer';
}

export default function ProtectedRoute({
  children,
  requiredRole = 'customer',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isAdmin, isCustomer } = useRole();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (requiredRole === 'admin' && !isAdmin) {
      router.replace('/');
      return;
    }
  }, [loading, user, isAdmin, requiredRole, router]);

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
