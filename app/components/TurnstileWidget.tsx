'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface Props {
  onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !containerRef.current) return;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token: string) => onVerify(token),
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      window.onTurnstileLoad = renderWidget;
      const script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      script.async = true;
      document.head.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    return (
      <button
        onClick={() => onVerify('dev-token')}
        className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm hover:bg-yellow-600/30 transition-colors"
      >
        [Dev] Skip Captcha
      </button>
    );
  }

  return <div ref={containerRef} />;
}
