import type { ReactNode } from "react";

/** Shared page header — same cream, gold, and violet language as the home page. */
export function PageBanner({
  kicker,
  title,
  description,
  actions,
  lang,
  className = "",
}: {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  lang?: string;
  className?: string;
}) {
  return (
    <header
      lang={lang}
      className={`relative overflow-hidden rounded-3xl border border-gold-200 bg-gradient-to-br from-ivory-100 via-ivory-surface to-ivory-warm px-6 py-7 shadow-[0_18px_44px_-28px_rgba(49,16,64,0.55)] sm:px-8 sm:py-8 ${className}`}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gold-200/60 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-maroon-400/20 blur-2xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-gold-ink">{kicker}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-maroon-deep sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
