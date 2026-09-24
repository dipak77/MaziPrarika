import Link from 'next/link';
import type { ReactNode } from 'react';

type Tone = 'gold' | 'maroon' | 'outline' | 'ghost';
type BadgeTone = 'gold' | 'maroon' | 'green' | 'neutral' | 'haldi';
type CardVariant = 'elevated' | 'plain' | 'royal' | 'gold';

const toneClass: Record<Tone, string> = {
  gold: 'btn-gold',
  maroon: 'btn-maroon',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

export function UIButton({
  tone = 'maroon',
  className = '',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button type="button" className={`btn-base ${toneClass[tone]} px-6 py-3 text-sm focus-ring ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function UILink({
  href,
  tone = 'maroon',
  className = '',
  children,
}: {
  href: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`btn-base ${toneClass[tone]} px-6 py-3 text-sm no-underline focus-ring ${className}`}>
      {children}
    </Link>
  );
}

export function Kicker({ children, light = false, className = '' }: { children: ReactNode; light?: boolean; className?: string }) {
  return <p className={`${light ? 'kicker-light' : 'kicker'} ${className}`}>{children}</p>;
}

export function Divider({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`gold-rule opacity-60 ${className}`} />;
}

export function SectionHead({
  kicker,
  title,
  body,
  align = 'center',
  rule = true,
}: {
  kicker: string;
  title: string;
  body?: string;
  align?: 'center' | 'left';
  rule?: boolean;
}) {
  const alignCls = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start';
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignCls}`}>
      <Kicker>{kicker}</Kicker>
      <h2 className="font-display text-[1.7rem] font-bold tracking-tight text-charcoal sm:text-[2rem] leading-tight">{title}</h2>
      {body ? <p className="max-w-[44ch] text-sm leading-relaxed text-charcoal-soft">{body}</p> : null}
      {rule ? <div aria-hidden className="gold-rule mt-1 w-24 opacity-80" /> : null}
    </div>
  );
}

export function Card({
  children,
  variant = 'elevated',
  hover = false,
  className = '',
}: {
  children: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
}) {
  const map = {
    elevated: 'surface-elevated',
    plain: 'surface',
    royal: 'surface-royal',
    gold: 'surface-gold',
  } as const;
  return <div className={`${map[variant]} card-pad ${hover ? 'hover-lift' : ''} ${className}`}>{children}</div>;
}

export function Badge({
  children,
  tone = 'gold',
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  const map = {
    gold: 'border-gold/38 bg-gold/12 text-gold-ink',
    maroon: 'border-maroon/22 bg-maroon-light text-maroon',
    green: 'border-paithani/28 bg-paithani-soft text-paithani',
    neutral: 'border-charcoal/14 bg-ivory-deep text-charcoal-soft',
    haldi: 'border-haldi/40 bg-haldi-soft text-haldi',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${map[tone]}`}>
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" /> : null}
      {children}
    </span>
  );
}

export function Callout({
  tone = 'gold',
  title,
  children,
}: {
  tone?: 'gold' | 'maroon' | 'green' | 'neutral';
  title?: string;
  children: ReactNode;
}) {
  const map = {
    gold: 'border-gold/40 bg-gold/10 text-charcoal',
    maroon: 'border-maroon/30 bg-maroon/6 text-charcoal',
    green: 'border-paithani/30 bg-paithani/8 text-charcoal',
    neutral: 'border-gold/25 bg-ivory-deep/60 text-charcoal-soft',
  } as const;
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${map[tone]}`}>
      {title ? <p className="font-semibold text-charcoal">{title}</p> : null}
      <div className={title ? 'mt-1' : ''}>{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="surface card-pad text-center grain overflow-hidden">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gold/12 border border-gold/30 text-maroon">
        {icon ?? <span aria-hidden className="font-script text-xl">॥ श्री ॥</span>}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-charcoal">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-charcoal-soft">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="surface-elevated card-pad" role="status" aria-label="लोड होत आहे">
      <div className="flex items-center gap-3">
        <div className="skeleton size-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-1/2 rounded-full" />
          <div className="skeleton h-2.5 w-3/4 rounded-full" />
        </div>
      </div>
      <div className="skeleton mt-4 h-3 w-full rounded-lg" />
      <div className="skeleton mt-2 h-3 w-5/6 rounded-lg" />
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-7 w-20 rounded-full" />
        <div className="skeleton h-7 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return <div className="skeleton h-12 w-full rounded-xl" />;
}

export function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 rounded-lg border border-maroon/30 bg-maroon/6 px-3 py-2 text-xs font-medium text-maroon" role="alert">{children}</p>;
}

export function PageHeader({
  kicker,
  title,
  body,
  actions,
}: {
  kicker: string;
  title: string;
  body?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-3xl">
        <Kicker>{kicker}</Kicker>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-maroon sm:text-4xl">{title}</h1>
        {body ? <p className="mt-3 text-base leading-relaxed text-charcoal-soft">{body}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

/* ══ Custom line iconography — hand-drawn strokes, 24px grid ═══════════ */

const iconPaths: Record<string, ReactNode> = {
  diya: (
    <>
      <path d="M12 3c-1.8 1.6-2.6 3 .1 4.6 2.6-1.6 1.7-3-.1-4.6Z" />
      <path d="M5 11h14c0 2.8-3.1 5-7 5s-7-2.2-7-5Z" />
      <path d="M8 19h8" />
    </>
  ),
  mandap: (
    <>
      <path d="M4 21V9l8-6 8 6v12" />
      <path d="M4 21h16" />
      <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
    </>
  ),
  rings: (
    <>
      <circle cx="9" cy="13" r="5.5" />
      <circle cx="15" cy="13" r="5.5" />
      <path d="m12 4 1.7 2h-3.4L12 4Z" />
    </>
  ),
  cake: (
    <>
      <path d="M4 20h16M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7" />
      <path d="M5 15c1.5 1.4 3-1.4 4.5 0S12.5 16.4 14 15s3-1.4 4.5 0" />
      <path d="M12 11V8m0-3c-.9.8-1.3 1.5 0 2.3 1.3-.8.9-1.5 0-2.3Z" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2.2A1 1 0 0 1 9.3 3h5.4a1 1 0 0 1 .8.8L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  thali: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5c-2.8-1-3.6-4.5-1.5-6.5C12.6 5 14.8 8.5 12 9.5ZM14.5 12c1-2.8 4.5-3.6 6.5-1.5-2 2.1-5.5 4.3-6.5 1.5ZM12 14.5c2.8 1 3.6 4.5 1.5 6.5-2.1-2-4.3-5.5-1.5-6.5ZM9.5 12c-1 2.8-4.5 3.6-6.5 1.5 2-2.1 5.5-4.3 6.5-1.5Z" />
    </>
  ),
  dhol: (
    <>
      <path d="M7 5v14M17 5v14" />
      <path d="M7 5c3.5-1.6 6.5-1.6 10 0M7 19c3.5 1.6 6.5 1.6 10 0" />
      <path d="M7 8.5c3.5-1.4 6.5-1.4 10 0M7 15.5c3.5 1.4 6.5 1.4 10 0" />
    </>
  ),
  brush: (
    <>
      <path d="M20 4c-4 1-9.5 5.5-11.5 9L12 16.5c3.5-2 8-7.5 9-11.5.2-.7-.3-1.2-1-1Z" />
      <path d="M8 13c-2.5.5-4 2.5-4.5 5.5-.1.6.4 1 1 .9 3-.5 5-2 5.5-4.4" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3h10v5M7 17H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3" />
      <path d="M7 14h10v7H7z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
      <path d="M19 14c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M8 14h3M8 17h5" />
    </>
  ),
  guests: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5a3.5 3.5 0 0 1 0 6.6M18 14.5c2 .9 3 2.9 3 5.5" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13v3" />
      <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  checklist: (
    <>
      <path d="M4 6.5 5.5 8l3-3.5M4 13l1.5 1.5 3-3.5M4 19.5 5.5 21l3-3.5" />
      <path d="M12 7h9M12 13.5h9M12 20h9" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21c4-4.5 7-8 7-11.5A7 7 0 0 0 5 9.5C5 13 8 16.5 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  phone: (
    <>
      <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a1.5 1.5 0 0 1-1.7 1.5C10.5 19.6 4.4 13.5 3.5 5.7A1.5 1.5 0 0 1 5 4Z" />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3Z" />
  ),
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowLeft: <path d="M20 12H4m6-6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5M12 16V8M16 16v-3M20 16V6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6.5 1.5 6.5h-15S6 14 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-3.5 0h7" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5M3 17.5l9 5 9-5" opacity={0.5} />
    </>
  ),
  zap: <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />,
  qr: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M9 8.5c-.5 3 3.5 7 6.5 6.5l.5-1.8-2.2-1-.9.9c-1-.4-1.9-1.3-2.3-2.3l.9-.9-1-2.2L9 8.5Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h12v11H2zM14 10h4.5L21 13.5V17h-7" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11" />
      <path d="M2.5 21h19M7.5 8h3M7.5 12h3M7.5 16h3" />
    </>
  ),
};

export type IconName = keyof typeof iconPaths;

export function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.6,
  ...rest
}: { name: IconName; strokeWidth?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {iconPaths[name]}
    </svg>
  );
}

/* ══ Logo mark — temple arch + diya flame ══════════════════════════════ */
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8d189" />
          <stop offset="0.5" stopColor="#c7a24f" />
          <stop offset="1" stopColor="#8a6a2b" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 30 8.5h6A2 2 0 0 1 38 10.5V38a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V10.5a2 2 0 0 1 2-2h6L24 3Z"
        fill="#430d15"
      />
      <path
        d="M16 40V24.5C16 19 19.5 15.5 24 15.5s8 3.5 8 9V40"
        fill="none"
        stroke="url(#lg-gold)"
        strokeWidth="2.4"
      />
      <path
        d="M24 22c-2.4 2.2-3.4 4.2 0 6.4 3.4-2.2 2.4-4.2 0-6.4Z"
        fill="url(#lg-gold)"
      />
      <path d="M14 40h20" stroke="url(#lg-gold)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ══ Primitives from Architecture ════════════════════════════════════════ */

export function Chip({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "maroon" | "leaf" | "ink" | "outline" | "white";
}) {
  const tones = {
    gold: "bg-gold-400/15 text-gold-700 ring-gold-500/30",
    maroon: "bg-maroon-700/10 text-maroon-800 ring-maroon-700/25",
    leaf: "bg-leaf-600/10 text-leaf-700 ring-leaf-600/25",
    ink: "bg-ink-900/8 text-ink-700 ring-ink-900/15",
    outline: "bg-transparent text-ink-500 ring-ink-900/15",
    white: "bg-white/90 text-maroon-900 ring-maroon-900/15",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 text-[11px] font-extrabold tracking-[0.28em] uppercase ${
        dark ? "text-gold-400" : "text-maroon-700"
      }`}
    >
      <span className={`h-px w-8 ${dark ? "bg-gold-400/70" : "bg-maroon-700/50"}`} />
      {children}
    </p>
  );
}

export function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="gold-hairline h-px w-16 sm:w-28" />
      <svg viewBox="0 0 32 16" className="h-4 w-8 text-gold-500">
        <path
          d="M16 1c2.5 3 5 4.5 8 4.5-2 2.5-5 3-8 9.5-3-6.5-6-7-8-9.5 3 0 5.5-1.5 8-4.5Z"
          fill="currentColor"
          opacity="0.9"
        />
        <circle cx="3" cy="8" r="1.4" fill="currentColor" />
        <circle cx="29" cy="8" r="1.4" fill="currentColor" />
      </svg>
      <span className="gold-hairline h-px w-16 sm:w-28" />
    </div>
  );
}

export function Stat({
  value,
  label,
  dark = false,
}: {
  value: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        className={`font-display text-3xl font-semibold sm:text-4xl ${
          dark ? "text-gold-300" : "text-maroon-800"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1 text-[12px] font-semibold tracking-wide ${
          dark ? "text-ivory-100/60" : "text-ink-500"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-600/10 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-leaf-700 ring-1 ring-leaf-600/30">
      <Icon name="shield" className="h-3 w-3" strokeWidth={2.2} />
      {compact ? "सत्यापित" : "सत्यापित व्यवसाय"}
    </span>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className={`animate-fade-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

