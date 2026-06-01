'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleInfo {
  isAdmin: boolean;
  isCustomer: boolean;
}

export function useRole(): RoleInfo {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return { isAdmin: false, isCustomer: false };
    }
    return {
      isAdmin: user.role === 'admin',
      isCustomer: user.role === 'customer',
    };
  }, [user]);
}
