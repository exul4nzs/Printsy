'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/login/`, {
        username,
        password,
      });
      
      login(response.data.token, response.data.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-warm-gray-400 hover:text-warm-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-warm-gray-900 mb-2 font-serif italic">Welcome Back</h2>
          <p className="text-warm-gray-500">Sign in to track your beautiful prints.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-warm-gray-700 mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-warm-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-warm-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
