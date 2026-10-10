'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import type { CardLang } from '@/lib/i18n';

export interface LangToggleProps {
  lang?: CardLang;
  compact?: boolean;
  onChange?: (next: CardLang) => void;
  className?: string;
  id?: string;
}

const LANGUAGES: Array<{
  code: CardLang;
  short: string;
  native: string;
  label: string;
  badge?: string;
}> = [
  { code: 'mr', short: 'MR', native: 'मराठी', label: 'मराठी (Marathi)', badge: 'डिफॉल्ट' },
  { code: 'hi', short: 'HI', native: 'हिंदी', label: 'हिंदी (Hindi)' },
  { code: 'en', short: 'EN', native: 'English', label: 'English' },
];

function LangToggleControl({
  lang: controlledLang,
  compact = false,
  onChange,
  className = '',
  id,
}: LangToggleProps) {
  const { lang: contextLang, setLang: contextSetLang } = useLanguage();
  const effective = controlledLang ?? contextLang;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang = LANGUAGES.find((l) => l.code === effective) ?? LANGUAGES[0]!;

  const switchTo = (next: CardLang) => {
    contextSetLang(next);
    onChange?.(next);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative inline-block text-left ${isOpen ? 'z-[80]' : ''} ${className}`}
    >
      {/* Short Name Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`भाषा निवडा (सध्या: ${activeLang.label})`}
        className={
          compact
            ? 'inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-haldi/40 bg-white px-2.5 py-0.5 text-xs font-bold text-ink-900 shadow-2xs backdrop-blur-xs transition hover:border-haldi hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haldi'
            : 'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-gold/45 bg-white/95 px-3.5 py-1.5 text-sm font-bold text-maroon shadow-2xs backdrop-blur-xs transition hover:border-gold hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
        }
      >
        <span aria-hidden="true" className="text-xs opacity-80">🌐</span>
        <span className="font-ui tracking-wider font-extrabold">{activeLang.short}</span>
        <span className="text-[11px] font-normal text-charcoal-muted hidden xs:inline">
          {activeLang.native}
        </span>
        <svg
          aria-hidden="true"
          className={`size-3 text-gold-deep transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="भाषा निवडा / भाषा चुनें / Select Language"
          className="absolute right-0 top-full z-[100] mt-2 w-48 origin-top-right overflow-hidden rounded-2xl border border-amber-300/80 bg-white p-2 shadow-[0_24px_50px_-12px_rgba(14,13,38,0.35),0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur-xl animate-fade-in"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
            भाषा निवडा / भाषा चुनें
          </div>
          <div className="space-y-0.5">
            {LANGUAGES.map((item) => {
              const selected = effective === item.code;
              return (
                <button
                  key={item.code}
                  role="option"
                  aria-selected={selected}
                  type="button"
                  onClick={() => switchTo(item.code)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                    selected
                      ? 'bg-maroon text-ivory font-bold shadow-2xs'
                      : 'text-charcoal hover:bg-gold/15 hover:text-maroon'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-lg text-[11px] font-bold ${
                        selected
                          ? 'bg-gold-bright text-maroon-deep'
                          : 'bg-gold/15 text-gold-deep'
                      }`}
                    >
                      {item.short}
                    </span>
                    <span>{item.native}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                        selected
                          ? 'bg-ivory/20 text-ivory'
                          : 'bg-gold/15 text-gold-deep'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function LangToggle(props: LangToggleProps) {
  return (
    <Suspense
      fallback={
        <div
          className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-gold/45 bg-white/95 px-3 text-xs font-bold text-maroon shadow-2xs ${props.className ?? ''}`}
        >
          <span>🌐</span>
          <span>MR</span>
        </div>
      }
    >
      <LangToggleControl {...props} />
    </Suspense>
  );
}
