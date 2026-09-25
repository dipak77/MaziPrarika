import type { CSSProperties, ReactNode } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

type PaithaniDividerProps = {
  label?: string;
  className?: string;
};

export function PaithaniDivider({ label, className = '' }: PaithaniDividerProps) {
  return (
    <div role="separator" aria-label={label ?? 'सजावटीची रेषा'} className={`flex items-center gap-3 ${className}`}>
      <span aria-hidden="true" className="gold-rule min-w-8 flex-1" />
      <svg width="52" height="26" viewBox="0 0 52 26" aria-hidden="true" focusable="false" className="shrink-0">
        <circle cx="4" cy="13" r="1.6" fill="var(--color-gold)" />
        <circle cx="48" cy="13" r="1.6" fill="var(--color-gold)" />
        <ellipse cx="26" cy="13" rx="10" ry="11.5" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
        <ellipse cx="26" cy="13" rx="6.4" ry="8" fill="var(--color-paithani)" opacity="0.92" />
        <ellipse cx="26" cy="13.5" rx="3.4" ry="4.8" fill="var(--color-maroon)" />
        <circle cx="26" cy="11" r="1.5" fill="var(--color-gold-bright)" />
        <path d="M26 1.5v3M15 4.5l1.5 2.6M37 4.5l-1.5 2.6" stroke="var(--color-gold-deep)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {label ? (
        <span lang="mr" className="text-balance-marathi shrink-0 font-marathi-display text-sm font-bold text-maroon">
          {label}
        </span>
      ) : null}
      <span aria-hidden="true" className="gold-rule min-w-8 flex-1" />
    </div>
  );
}

type MandalaBackdropProps = {
  className?: string;
  opacity?: number;
};

const MANDALA_PETALS = Array.from({ length: 12 }, (_, index) => index * 30);

export function MandalaBackdrop({ className = '', opacity = 0.5 }: MandalaBackdropProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 m-auto size-full ${className}`}
      style={{ opacity }}
    >
      {[178, 148, 118, 88, 58].map((radius) => (
        <circle
          key={radius}
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1"
          opacity="0.35"
        />
      ))}
      {MANDALA_PETALS.map((rotation) => (
        <ellipse
          key={rotation}
          cx="200"
          cy="96"
          rx="15"
          ry="36"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1"
          opacity="0.3"
          transform={`rotate(${rotation} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="10" fill="none" stroke="var(--color-maroon)" strokeWidth="1.2" opacity="0.4" />
      <circle cx="200" cy="200" r="3.5" fill="var(--color-gold)" opacity="0.45" />
    </svg>
  );
}

type ShagunSealProps = {
  children: ReactNode;
  className?: string;
  tone?: 'gold' | 'maroon';
};

const SEAL_TONE: Record<NonNullable<ShagunSealProps['tone']>, string> = {
  gold: 'bg-linear-to-br from-gold-shimmer via-gold-soft to-gold text-maroon-deep ring-gold-deep/30',
  maroon: 'bg-linear-to-br from-maroon-rich via-maroon to-maroon-deep text-gold-shimmer ring-gold-bright/40',
};

export function ShagunSeal({ children, className = '', tone = 'gold' }: ShagunSealProps) {
  return (
    <span
      className={`shimmer-badge inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-center font-marathi-display text-sm font-bold ring-2 ${SEAL_TONE[tone]} ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false" className="shrink-0">
        <path
          d="M7 0.8l1.5 3.4 3.7 0.3-2.8 2.4 0.9 3.6L7 8.6 3.7 10.5l0.9-3.6L1.8 4.5l3.7-0.3z"
          fill="currentColor"
          opacity="0.9"
        />
      </svg>
      <span lang="mr" className="text-balance-marathi leading-snug">
        {children}
      </span>
    </span>
  );
}

type CountdownPillProps = {
  days: number | null;
  label?: string;
  className?: string;
};

function countdownText(days: number | null): string {
  if (days === null || Number.isNaN(days)) return 'तारीख ठरायची आहे';
  if (days === 0) return 'आजचा दिवस';
  if (days === 1) return 'फक्त १ दिवस शिल्लक';
  if (days > 1) return `${toDevanagariDigits(days)} दिवस शिल्लक`;
  return 'मुदत संपली';
}

export function CountdownPill({ days, label, className = '' }: CountdownPillProps) {
  const urgent = days !== null && days <= 7;
  return (
    <span
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 font-ui text-sm font-bold ring-1 ${
        urgent ? 'bg-maroon-light text-maroon ring-maroon/20' : 'bg-ivory-surface text-charcoal ring-gold/30'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 rounded-full ${urgent ? 'animate-pulse-subtle bg-maroon' : 'bg-paithani'}`}
      />
      <span lang="mr" className="text-balance-marathi leading-snug">
        {label ?? countdownText(days)}
      </span>
    </span>
  );
}

type PreviewFrameProps = {
  children: ReactNode;
  zoom?: number;
  className?: string;
  label?: string;
};

const CHECKER_STYLE: CSSProperties = {
  backgroundColor: 'var(--color-checker-b)',
  backgroundImage:
    'linear-gradient(45deg, var(--color-checker-a) 25%, transparent 25%, transparent 75%, var(--color-checker-a) 75%), linear-gradient(45deg, var(--color-checker-a) 25%, transparent 25%, transparent 75%, var(--color-checker-a) 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 10px 10px',
};

export function PreviewFrame({ children, zoom = 1, className = '', label }: PreviewFrameProps) {
  const safeZoom = Number.isFinite(zoom) ? Math.min(2, Math.max(0.5, zoom)) : 1;
  return (
    <div className={`ring-gold-soft overflow-hidden rounded-2xl ${className}`}>
      <div
        role={label ? 'img' : undefined}
        aria-label={label}
        style={CHECKER_STYLE}
        className="flex min-h-56 items-center justify-center overflow-hidden p-6"
      >
        <div style={{ transform: `scale(${safeZoom})` }} className="transition-transform duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}

type SkeletonCardProps = {
  lines?: number;
  className?: string;
};

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  const safeLines = Number.isFinite(lines) ? Math.min(5, Math.max(1, Math.floor(lines))) : 3;
  return (
    <div role="status" aria-label="लोड होत आहे" className={`surface card-pad space-y-3 ${className}`}>
      <div aria-hidden="true" className="skeleton h-5 w-2/5 rounded-full" />
      {Array.from({ length: safeLines }, (_, index) => (
        <div
          aria-hidden="true"
          key={index}
          style={{ animationDelay: `${index * 90}ms` }}
          className="skeleton h-3.5 rounded-full"
        />
      ))}
      <div aria-hidden="true" className="skeleton h-11 w-full rounded-full" />
    </div>
  );
}

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
};

const EMPTY_ACTION_CLASS =
  'btn-base btn-gold inline-flex min-h-[44px] px-6 text-sm focus-ring animate-fade-up';

export function EmptyState({ icon, title, hint, actionLabel, onAction, actionHref, className = '' }: EmptyStateProps) {
  const showAction = Boolean(actionLabel) && Boolean(actionHref ?? onAction);
  return (
    <div className={`surface card-pad flex flex-col items-center px-6 py-10 text-center ${className}`}>
      {icon ? (
        <span
          aria-hidden="true"
          className="glass-ivory flex size-14 items-center justify-center rounded-full text-2xl text-gold-ink"
        >
          {icon}
        </span>
      ) : null}
      <h3 lang="mr" className="text-balance-marathi mt-4 font-marathi-display text-lg font-bold text-charcoal">
        {title}
      </h3>
      {hint ? (
        <p lang="mr" className="text-balance-marathi mt-1.5 max-w-sm text-sm leading-relaxed text-charcoal-soft">
          {hint}
        </p>
      ) : null}
      {showAction && actionHref ? (
        <a href={actionHref} className={`${EMPTY_ACTION_CLASS} mt-5`}>
          {actionLabel}
        </a>
      ) : showAction && onAction ? (
        <button type="button" onClick={onAction} className={`${EMPTY_ACTION_CLASS} mt-5`}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
