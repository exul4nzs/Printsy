'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, LogOut, PenTool } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';
import LoginModal from './auth/LoginModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items]
  );

  const { user, logout } = useAuth();
  const { isAdmin } = useRole();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-warm-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Image src="/logo.png" alt="Printsy Logo" fill className="object-cover" />
            </div>
            <span className="font-serif text-2xl font-bold text-warm-gray-900 tracking-tight italic">
              Printsy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-warm-gray-600 hover:text-accent font-medium transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/editor"
              className="flex items-center gap-1.5 text-warm-gray-600 hover:text-accent font-medium transition-colors"
            >
              <PenTool className="w-4 h-4" />
              Editor
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-warm-gray-600 hover:text-accent font-medium transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/cart"
              className="relative text-warm-gray-600 hover:text-accent font-medium transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 font-medium text-warm-gray-600 hover:text-accent transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                    {user.first_name
                      ? user.first_name[0].toUpperCase()
                      : user.username[0].toUpperCase()}
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-warm-gray-100 py-2 animate-scale-in origin-top-right">
                    <div className="px-4 py-2 border-b border-warm-gray-100 mb-1">
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      <p className="text-xs text-warm-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-5 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-600 transition-all hover:shadow-md"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-warm-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-80 pb-4' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className="px-4 py-3 text-warm-gray-600 hover:text-accent hover:bg-accent/5 font-medium rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/editor"
              className="px-4 py-3 text-warm-gray-600 hover:text-accent hover:bg-accent/5 font-medium rounded-xl transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PenTool className="w-4 h-4" />
              Editor
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-3 text-warm-gray-600 hover:text-accent hover:bg-accent/5 font-medium rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/cart"
              className="px-4 py-3 text-warm-gray-600 hover:text-accent hover:bg-accent/5 font-medium rounded-xl transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>

            <div className="border-t border-warm-gray-200 my-2" />

            {user ? (
              <div className="px-4 py-2">
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-warm-gray-500">{user.email}</p>
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginModalOpen(true);
                }}
                className="mx-4 mt-2 px-5 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-600 transition-all text-center"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </header>
  );
}
