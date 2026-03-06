'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Mail, Dog, Loader, User, TreePine, Moon, CloudSnow } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { AuthForm } from './AuthForm';
import { Quiz, type QuizAnswers } from './Quiz';
import { WolfCard } from './WolfCard';
import { TurnstileWidget } from './TurnstileWidget';

interface UserInfo {
  id: string;
  email: string;
  verified: boolean;
}

interface WolfResult {
  archetype: {
    archetypeName: string;
    personality: string;
    originStory: string;
    motto: string;
    rarity: string;
    seed: string;
  };
  svg: string;
  imageUrl: string | null;
  imageExpiresAt: string | null;
  wolfId: string;
}

type LimitKind = 'global' | 'user' | null;

export function MainApp({ initialUser }: { initialUser: UserInfo | null }) {
  const [user, setUser] = useState<UserInfo | null>(initialUser);
  const [step, setStep] = useState<
    'landing' | 'auth' | 'quiz' | 'generating' | 'result' | 'limit'
  >('landing');
  const [limitKind, setLimitKind] = useState<LimitKind>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [result, setResult] = useState<WolfResult | null>(null);
  const [error, setError] = useState('');
  const [checkingLimits, setCheckingLimits] = useState(false);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          verified: !!session.user.email_confirmed_at,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkRateLimits = useCallback(async () => {
    setCheckingLimits(true);
    try {
      const res = await fetch('/api/rate-check');
      if (!res.ok) return true; // allow on error
      const data = await res.json();
      if (!data.globalAllowed) {
        setLimitKind('global');
        setStep('limit');
        return false;
      }
      if (!data.userAllowed) {
        setLimitKind('user');
        setStep('limit');
        return false;
      }
      return true;
    } catch {
      return true; // allow on network error
    } finally {
      setCheckingLimits(false);
    }
  }, []);

  useEffect(() => {
    if (user?.verified && step === 'landing') {
      checkRateLimits().then((allowed) => {
        if (allowed) setStep('quiz');
      });
    } else if (user && !user.verified && step === 'landing') {
      setStep('auth');
    }
  }, [user, step, checkRateLimits]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStep('landing');
    setResult(null);
    setQuizAnswers(null);
    setLimitKind(null);
  };

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
  };

  const handleGenerate = useCallback(async () => {
    if (!quizAnswers || !turnstileToken) return;
    setStep('generating');
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setLimitKind(data.error?.includes('Global') ? 'global' : 'user');
          setStep('limit');
          return;
        }
        throw new Error(data.error || 'Generation failed');
      }
      setResult(data);
      setStep('result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('quiz');
    }
  }, [quizAnswers, turnstileToken]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Logo */}
      <header className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#064e3b" />
            <path
              d="M7 25 L10 10 L14 17 L16 7 L18 17 L22 10 L25 25 Z"
              fill="#10b981"
            />
            <circle cx="12.5" cy="19" r="1.8" fill="#fbbf24" />
            <circle cx="19.5" cy="19" r="1.8" fill="#fbbf24" />
          </svg>
          <span className="text-white font-bold text-lg tracking-tight group-hover:text-emerald-400 transition-colors">
            Wolfy
          </span>
        </Link>
      </header>

      {/* User controls */}
      {user && step !== 'landing' && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:block truncate max-w-[150px]">
            {user.email}
          </span>
          <Link
            href="/profile"
            className="text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            title="My Wolves"
          >
            <User className="w-4 h-4" />
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      )}

      {/* ─── LANDING ─── */}
      {step === 'landing' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <div className="mb-6 animate-pulse-slow">
            <svg
              viewBox="0 0 80 80"
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="38" fill="#064e3b" opacity="0.5" />
              <path
                d="M20 65 L28 25 L36 45 L40 18 L44 45 L52 25 L60 65 Z"
                fill="#10b981"
              />
              <circle cx="33" cy="48" r="3.5" fill="#fbbf24" />
              <circle cx="47" cy="48" r="3.5" fill="#fbbf24" />
              <circle cx="33" cy="48" r="1.5" fill="#064e3b" />
              <circle cx="47" cy="48" r="1.5" fill="#064e3b" />
              <ellipse cx="40" cy="55" rx="4" ry="2.5" fill="#065f46" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Find Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Inner Wolf
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-md mb-10 leading-relaxed">
            Answer five questions. Discover your mythical wolf archetype. Share
            your spirit with the pack.
          </p>
          <button
            onClick={async () => {
              if (user?.verified) {
                const allowed = await checkRateLimits();
                if (allowed) setStep('quiz');
              } else {
                setStep('auth');
              }
            }}
            disabled={checkingLimits}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95"
          >
            {checkingLimits ? 'Checking…' : 'Begin the Journey'}
          </button>
        </div>
      )}

      {/* ─── AUTH ─── */}
      {step === 'auth' && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          {user && !user.verified ? (
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4"><Mail className="w-12 h-12 text-emerald-400 mx-auto" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-400 mb-6">
                We sent a verification link to{' '}
                <strong className="text-emerald-400">{user.email}</strong>.
                Verify your email to unlock wolf generation.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                I&apos;ve verified — refresh
              </button>
              <button
                onClick={handleSignOut}
                className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <AuthForm
              onSuccess={() =>
                setStep(user?.verified ? 'quiz' : 'auth')
              }
            />
          )}
        </div>
      )}

      {/* ─── QUIZ ─── */}
      {step === 'quiz' && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full">
            {!quizAnswers ? (
              <Quiz onComplete={handleQuizComplete} />
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <Dog className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ready to Summon
                </h2>
                <p className="text-gray-400 mb-6">
                  Complete the captcha to unleash your inner wolf.
                </p>
                <div className="flex justify-center mb-6">
                  <TurnstileWidget onVerify={setTurnstileToken} />
                </div>
                {error && (
                  <p className="text-red-400 text-sm mb-4 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!turnstileToken}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                >
                  <Dog className="w-5 h-5 inline-block mr-2" /> Summon Your Wolf
                </button>
                <button
                  onClick={() => {
                    setQuizAnswers(null);
                    setError('');
                    setTurnstileToken('');
                  }}
                  className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── GENERATING ─── */}
      {step === 'generating' && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center">
            <Loader className="w-16 h-16 text-emerald-400 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Summoning Your Wolf…
            </h2>
            <p className="text-gray-400">
              The forest spirits are crafting your archetype.
            </p>
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── RESULT ─── */}
      {step === 'result' && result && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <WolfCard result={result} />
        </div>
      )}

      {/* ─── RATE LIMIT ─── */}
      {step === 'limit' && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full text-center">
            {/* Nordic forest scene */}
            <div className="relative mb-8">
              <div className="flex justify-center items-end gap-1 opacity-60 mb-4">
                <TreePine className="w-8 h-8 text-emerald-800" />
                <TreePine className="w-12 h-12 text-emerald-700" />
                <TreePine className="w-16 h-16 text-emerald-600" />
                <Moon className="w-8 h-8 text-blue-200/60 -mt-12 mx-2" />
                <TreePine className="w-14 h-14 text-emerald-700" />
                <TreePine className="w-10 h-10 text-emerald-800" />
                <TreePine className="w-6 h-6 text-emerald-900" />
              </div>
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <CloudSnow
                    key={i}
                    className="w-4 h-4 text-blue-200/30 animate-pulse"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10">
              {limitKind === 'global' ? (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    The Forest is Sleeping
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-2">
                    The wolves have retreated to their dens for the night. Our forest can only
                    sustain a limited number of summonings each day to keep the magic alive.
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    The daily generation limit has been reached. Come back tomorrow when the
                    forest awakens with the dawn.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                    Your Pack is Complete
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-2">
                    You&apos;ve already summoned your wolf today. The spirits need time to
                    rest and recharge before they can reveal another archetype.
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    Your daily generation limit has been reached. Return tomorrow for a
                    fresh journey into the forest.
                  </p>
                </>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/profile"
                  className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-medium rounded-xl border border-emerald-500/20 transition-all duration-200"
                >
                  View My Wolves
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-gray-600">
          made by a human called{' '}
          <a
            href="https://sepr.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-400 transition-colors"
          >
            sepehr
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
