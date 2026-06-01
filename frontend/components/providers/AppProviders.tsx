'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      {children}
    </AuthProvider>
  );
}
