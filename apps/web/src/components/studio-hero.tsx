'use client';

import { Eyebrow, Icon, Reveal, type IconName } from "@/components/ui";
import { useLanguage } from "@/context/language-context";
import { uiCopy } from "@/lib/i18n";

export function StudioHero() {
  const { lang, isEn } = useLanguage();
  const copy = uiCopy[lang].studio;

  const stats: { icon: IconName; value: string; label: string }[] = [
    { icon: "layers", value: copy.stat1Val, label: copy.stat1Lbl },
    { icon: "printer", value: copy.stat2Val, label: copy.stat2Lbl },
    { icon: "zap", value: copy.stat3Val, label: copy.stat3Lbl },
  ];

  return (
    <Reveal>
      <section
        aria-labelledby="studio-hero-title"
        className="relative overflow-hidden rounded-3xl bg-paisley-dark px-6 py-10 shadow-card sm:px-10 sm:py-14"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-gold-400/10 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-maroon-700/40 blur-3xl" />
        <div className="relative">
          <Eyebrow dark>{copy.heroEyebrow}</Eyebrow>
          <h1
            id="studio-hero-title"
            className="max-w-3xl font-marathi-display text-4xl leading-[1.12] font-bold text-balance text-ivory-100 sm:text-[52px]"
          >
            {copy.heroTitle} <span className="gold-foil">{copy.heroTitleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory-100/70">
            {copy.heroDesc}
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-gold-400/20 pt-6 sm:gap-6">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="flex min-h-[20px] items-center gap-1.5 text-[10.5px] font-bold tracking-[0.12em] text-ivory-100/55 uppercase sm:text-[11px]">
                  <Icon name={s.icon} className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                  <span className="truncate">{s.label}</span>
                </dt>
                <dd className="mt-1.5 font-display text-[17px] font-semibold text-gold-300 sm:text-2xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#design-form"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[14.5px] font-bold text-maroon-950 transition hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
            >
              {copy.btnStart}
              <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2.4} />
            </a>
            <a
              href="#studio-preview"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ivory-100/25 px-6 py-3 text-[14.5px] font-bold text-ivory-100 transition hover:border-gold-400/60 hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
            >
              <Icon name="eye" className="h-4 w-4" />
              {copy.btnPreview}
            </a>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
