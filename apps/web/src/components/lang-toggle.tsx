'use client';

import { Suspense } from 'react';
import { useLanguage } from '@/context/language-context';
import type { CardLang } from '@/lib/i18n';

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
  const { lang: contextLang, setLang: contextSetLang } = useLanguage();
  const effective = controlledLang ?? contextLang;

  const switchTo = (next: CardLang) => {
    contextSetLang(next);
    onChange?.(next);
  };

  const btnBase = compact
    ? 'inline-flex min-h-[32px] items-center justify-center px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer'
    : 'inline-flex min-h-[40px] min-w-[44px] items-center justify-center px-4 py-2 text-sm font-bold transition-all duration-200 cursor-pointer';

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
  return (
    <Suspense
      fallback={
        <div
          className={`inline-flex min-h-[32px] items-center overflow-hidden rounded-full border border-gold/40 bg-white/95 px-3 text-xs font-bold text-maroon shadow-2xs ${props.className ?? ''}`}
        >
          मराठी
        </div>
      }
    >
      <LangToggleControl {...props} />
    </Suspense>
  );
}
