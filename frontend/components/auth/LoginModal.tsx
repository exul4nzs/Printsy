'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/lib/store';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { X, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, loading } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const busy = loading || isSubmitting;
  const title = mode === 'signin' ? 'Welcome Back' : 'Create Account';
  const subtitle =
    mode === 'signin'
      ? 'Sign in to track your beautiful prints.'
      : 'Create an account to save your orders.';

  const redirectAfterLogin = () => {
    // Read directly from Zustand store — updated by completeSignIn before onClose
    if (storeUser?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/editor');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
      redirectAfterLogin();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
      redirectAfterLogin();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-scale-in">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-warm-gray-400 hover:text-warm-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-warm-gray-900 mb-2 italic">{title}</h2>
          <p className="text-warm-gray-500">{subtitle}</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-5">
          {error ? (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">{error}</div>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-warm-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-warm-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-4 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {busy && mode === 'signin' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-warm-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-warm-gray-400">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy || googleLoading}
          className="w-full py-3 rounded-xl border border-warm-gray-200 font-semibold text-warm-gray-700 hover:bg-warm-gray-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="text-center text-sm text-warm-gray-500 mt-6">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-accent font-semibold hover:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-accent font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
