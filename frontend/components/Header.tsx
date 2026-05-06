'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import LoginModal from './auth/LoginModal';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const itemCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items]);
  
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-warm-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-lg group-hover:scale-110 transition-transform">
              <Image
                src="/logo.png"
                alt="Printsy Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-black text-2xl text-warm-gray-900 tracking-tighter italic">
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
              href="/cart"
              className="relative text-warm-gray-600 hover:text-accent font-medium transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-white text-xs font-medium rounded-full flex items-center justify-center">
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
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                    {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                  </div>
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-warm-gray-100 py-2">
                    <div className="px-4 py-2 border-b border-warm-gray-100 mb-2">
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      <p className="text-xs text-warm-gray-500 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logout();
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
                className="px-5 py-2 rounded-full bg-warm-gray-900 text-white font-medium hover:bg-warm-gray-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-warm-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-40 pb-4' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-warm-gray-600 hover:text-accent font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 text-warm-gray-600 hover:text-accent font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              Cart ({itemCount})
            </Link>
          </nav>
        </div>
      </div>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </header>
  );
}
