'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { X, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const busy = loading || isSubmitting;
  const title = mode === 'signin' ? 'Welcome Back' : 'Create Account';
  const subtitle =
    mode === 'signin'
      ? 'Sign in to track your beautiful prints.'
      : 'Create an account to save your orders.';

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
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-warm-gray-400 hover:text-warm-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-warm-gray-900 mb-2 font-serif italic">{title}</h2>
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
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
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
          disabled={busy}
          className="w-full py-3 rounded-xl border border-warm-gray-200 font-semibold text-warm-gray-700 hover:bg-warm-gray-50 transition-colors disabled:opacity-70"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-warm-gray-500 mt-6">
          {mode === 'signin' ? (
            <>
              New here?{' '}
              <button type="button" onClick={() => setMode('signup')} className="text-accent font-semibold hover:underline">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('signin')} className="text-accent font-semibold hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
