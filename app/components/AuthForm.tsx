'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface Props {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for a verification link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🐺</div>
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
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="wolf@forest.den"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="••••••••"
          />
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
    </div>
  );
}
