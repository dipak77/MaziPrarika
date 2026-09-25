'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  type CardLang,
  DEFAULT_LANG,
  PREF_LANG_COOKIE,
  PREF_LANG_STORAGE_KEY,
} from '@/lib/i18n';

export interface LangToggleProps {
  lang?: CardLang;
  compact?: boolean;
  onChange?: (next: CardLang) => void;
  className?: string;
  id?: string;
}

function LangToggleControl({
  lang: controlledLang,
  compact = false,
  onChange,
  className = '',
  id,
}: LangToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeLang, setActiveLang] = useState<CardLang>(() => {
    if (controlledLang) return controlledLang;
    const queryLang = searchParams?.get('lang');
    if (queryLang === 'en' || queryLang === 'mr') return queryLang;
    return DEFAULT_LANG;
  });

  // Keep in sync when controlledLang prop changes
  useEffect(() => {
    if (controlledLang && controlledLang !== activeLang) {
      setActiveLang(controlledLang);
    }
  }, [controlledLang, activeLang]);

  // On client mount, if not controlled and no query param, check cookie/storage
  useEffect(() => {
    if (!controlledLang && !searchParams?.get('lang')) {
      try {
        const stored = localStorage.getItem(PREF_LANG_STORAGE_KEY);
        if (stored === 'en' || stored === 'mr') {
          setActiveLang(stored);
          return;
        }
        const match = document.cookie.match(new RegExp(`(?:^|; )${PREF_LANG_COOKIE}=([^;]*)`));
        if (match && (match[1] === 'en' || match[1] === 'mr')) {
          setActiveLang(match[1] as CardLang);
        }
      } catch {
        // storage or cookie access restricted
      }
    }
  }, [controlledLang, searchParams]);

  const switchTo = useCallback(
    (next: CardLang) => {
      // 1. Persist to cookie (1 year lifespan, SameSite=Lax for SSR)
      try {
        document.cookie = `${PREF_LANG_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // cookie write restricted
      }

      // 2. Persist to localStorage for client retention
      try {
        localStorage.setItem(PREF_LANG_STORAGE_KEY, next);
      } catch {
        // localStorage write restricted
      }

      setActiveLang(next);
      onChange?.(next);

      // 3. Update URL if searchParams exist or pathname is present
      try {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        params.set('lang', next);
        const queryStr = params.toString();
        const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
        router.replace(targetUrl, { scroll: false });
      } catch {
        // navigation fallback
      }
    },
    [pathname, router, searchParams, onChange],
  );

  const effective = controlledLang ?? activeLang;

  const btnBase = compact
    ? 'inline-flex min-h-[32px] items-center justify-center px-2.5 py-1 text-xs font-bold transition-all duration-200'
    : 'inline-flex min-h-[40px] min-w-[44px] items-center justify-center px-4 py-2 text-sm font-bold transition-all duration-200';

  return (
    <div
      id={id}
      role="group"
      aria-label="भाषा निवडा / Select Language"
      className={`inline-flex items-center overflow-hidden rounded-full border border-gold/40 bg-white/95 shadow-2xs backdrop-blur-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => switchTo('mr')}
        aria-pressed={effective === 'mr'}
        aria-label="मराठी (डिफॉल्ट)"
        className={
          effective === 'mr'
            ? `${btnBase} bg-maroon text-ivory shadow-xs`
            : `${btnBase} text-charcoal-soft hover:bg-gold/10 hover:text-maroon`
        }
      >
        <span>मराठी</span>
        {!compact ? (
          <span className="ml-1 text-[10px] font-normal opacity-75">(डिफॉल्ट)</span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => switchTo('en')}
        aria-pressed={effective === 'en'}
        aria-label="English"
        className={
          effective === 'en'
            ? `${btnBase} bg-maroon text-ivory shadow-xs`
            : `${btnBase} text-charcoal-soft hover:bg-gold/10 hover:text-maroon`
        }
      >
        <span>{compact ? 'EN' : 'English'}</span>
      </button>
    </div>
  );
}

export function LangToggle(props: LangToggleProps) {
  const fallbackBtn = props.compact ? (
    <div
      className={`inline-flex min-h-[32px] items-center overflow-hidden rounded-full border border-gold/40 bg-white/95 px-3 text-xs font-bold text-maroon shadow-2xs ${props.className ?? ''}`}
    >
      मराठी
    </div>
  ) : (
    <div
      className={`inline-flex min-h-[40px] items-center overflow-hidden rounded-full border border-gold/40 bg-white/95 px-4 text-sm font-bold text-maroon shadow-2xs ${props.className ?? ''}`}
    >
      मराठी (डिफॉल्ट)
    </div>
  );

  return (
    <Suspense fallback={fallbackBtn}>
      <LangToggleControl {...props} />
    </Suspense>
  );
}
