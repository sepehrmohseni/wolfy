'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dog } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface Props {
  onSuccess: (mode: 'signin' | 'signup') => void;
}

export function AuthForm({ onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const supabase = createSupabaseBrowser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Supabase returns a user with empty identities when email already exists
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('An account with this email already exists.');
          setMode('signin');
          return;
        }
        setMessage('Check your email for a verification link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onSuccess(mode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      // Also catch explicit "already registered" messages from some Supabase configs
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        setError('An account with this email already exists. Please sign in instead.');
        setMode('signin');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <div className="text-center mb-6">
        <Dog className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-white">
          {mode === 'signup' ? 'Join the Pack' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'signup'
            ? 'Create an account to find your inner wolf'
            : 'Sign in to continue your journey'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            name="email"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="wolf@forest.den"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
        >
          {loading
            ? 'Loading…'
            : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'signup' ? 'signin' : 'signup');
          setError('');
          setMessage('');
        }}
        className="block w-full text-center mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        {mode === 'signup'
          ? 'Already have an account? Sign in'
          : "Don't have an account? Sign up"}
      </button>

      {mode === 'signin' && (
        <Link
          href="/auth/reset-password"
          className="block text-center mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Forgot your password?
        </Link>
      )}
    </div>
  );
}
