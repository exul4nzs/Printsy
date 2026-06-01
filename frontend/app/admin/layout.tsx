'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/hooks/useRole';
import { LayoutDashboard, Package, ShieldX } from 'lucide-react';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useRole();

  // Non-admin access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-off-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <div className="card p-8 text-center max-w-md w-full">
            <ShieldX className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-warm-gray-900 mb-2">Access Denied</h2>
            <p className="text-warm-gray-600 mb-6">
              You need admin privileges to view this page.
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <nav className="sticky top-24 card p-3 space-y-1">
              <p className="px-3 pt-2 pb-1 text-xs font-semibold text-warm-gray-400 uppercase tracking-wider">
                Admin
              </p>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-accent/10 text-accent'
                        : 'text-warm-gray-600 hover:bg-warm-gray-50 hover:text-warm-gray-900',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-gray-200 px-4 py-2 flex gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors',
                    active
                      ? 'text-accent bg-accent/5'
                      : 'text-warm-gray-500 hover:text-warm-gray-700',
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
