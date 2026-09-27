'use client';

import Link from "next/link";
import { KalashArt } from "@/components/decor/kalash";
import { MandalaCorner } from "@/components/decor/mandala";
import { InvitationCard } from "@/components/invitation-card";
import { Reveal } from "@/components/reveal";
import {
  Chip,
  Eyebrow,
  Icon,
  OrnamentDivider,
  Stat,
  VerifiedBadge,
  type IconName,
} from "@/components/ui";
import { DEFAULT_DESIGN, IMG, TEMPLATES } from "@/lib/arch-data";
import { useLanguage } from "@/context/language-context";
import { uiCopy } from "@/lib/i18n";
import { useEffect, useMemo, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   Global animation styles for the home experience
═══════════════════════════════════════════════════════════════ */
function HomeStyles() {
  return (
    <style jsx global>{`
      @keyframes hp-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes hp-shine   { 0% { transform: translateX(-130%) skewX(-16deg); } 100% { transform: translateX(260%) skewX(-16deg); } }
      @keyframes hp-spark   { 0% { transform: translateY(0) scale(1); opacity: 0; } 12% { opacity: 1; } 100% { transform: translateY(-110px) scale(.3); opacity: 0; } }
      @keyframes hp-flame   { 0%, 100% { transform: scaleY(1) translateY(0); opacity: .95; } 30% { transform: scaleY(1.12) translateY(-1px); opacity: 1; } 60% { transform: scaleY(.94) translateY(1px); opacity: .85; } }
      @keyframes hp-marquee-rev { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      @keyframes hp-spin    { to { transform: rotate(360deg); } }
      @keyframes hp-blob    { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-24px) scale(1.06); } 66% { transform: translate(-22px,18px) scale(.96); } }
      .hp-shimmer-text {
        background: linear-gradient(100deg, #b98a2f 30%, #f5d67b 50%, #b98a2f 70%);
        background-size: 200% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: hp-shimmer 4.5s linear infinite;
      }
      .hp-shimmer-text-dark {
        background: linear-gradient(100deg, #f0c048 30%, #fff3c4 50%, #f0c048 70%);
        background-size: 200% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: hp-shimmer 4.5s linear infinite;
      }
      .hp-marquee-rev { animation: hp-marquee-rev 32s linear infinite; }
      .hp-card-tilt { transition: transform .18s ease-out; will-change: transform; }
      @media (prefers-reduced-motion: reduce) {
        .hp-shimmer-text, .hp-shimmer-text-dark, .hp-marquee-rev, .hp-anim { animation: none !important; }
        .hp-card-tilt { transition: none; }
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Hooks: in-view + count-up
═══════════════════════════════════════════════════════════════ */
function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, active: boolean, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, dur]);
  return v;
}

/* Deterministic pseudo-random for particle placement */
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export function HomePageClient() {
  const { lang, isEn, isHi } = useLanguage();
  const copy = uiCopy[lang].home;

  return (
    <div className="overflow-x-clip" lang={isEn ? "en" : isHi ? "hi" : "mr"}>
      <HomeStyles />
      <Hero copy={copy} isEn={isEn} isHi={isHi} />
      <Marquee copy={copy} />
      <Pillars copy={copy} isEn={isEn} />
      <StudioShowcase copy={copy} isEn={isEn} isHi={isHi} />
      <EventOsShowcase copy={copy} />
      <Marketplace copy={copy} isEn={isEn} />
      <Journey copy={copy} />
      <Pricing copy={copy} />
      <Testimonials copy={copy} />
      <Faq isEn={isEn} isHi={isHi} />
      <CtaBand copy={copy} />
    </div>
  );
}

type HomeCopy = (typeof uiCopy)[keyof typeof uiCopy]['home'];

interface HeroProps {
  copy: HomeCopy;
  isEn: boolean;
  isHi?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   HERO — 3D tilt card · auto-cycling templates · particles
═══════════════════════════════════════════════════════════════ */
function Hero({ copy, isEn, isHi }: HeroProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [tplIdx, setTplIdx] = useState(0);
  const heroTpls = useMemo(() => TEMPLATES.slice(0, Math.min(5, TEMPLATES.length)), []);

  /* Auto-cycle the hero invitation template */
  useEffect(() => {
    if (heroTpls.length < 2) return;
    const id = setInterval(() => setTplIdx((i) => (i + 1) % heroTpls.length), 3800);
    return () => clearInterval(id);
  }, [heroTpls.length]);

  const baseDesign = isEn
    ? {
      ...DEFAULT_DESIGN,
      lang: "en" as const,
      personA: "Tejas Prabhulkar Deshmukh",
      personB: "Ananya Shrinivas Kulkarni",
      time: "12:30 PM",
      venue: "Shivneri Lawns, Baner",
      city: "Pune",
      host: "The Deshmukh & Kulkarni Families",
      blessing: "॥ Shri Ganeshaya Namah ॥",
    }
    : isHi
      ? {
        ...DEFAULT_DESIGN,
        lang: "hi" as const,
        personA: "तेजस प्रभुलकर देशमुख",
        personB: "अनन्या श्रीनिवास कुलकर्णी",
        time: "दोपहर १२:३० बजे",
        venue: "शिवनेरी लॉन्स, बाणेर",
        city: "पुणे",
        host: "श्री. देशमुख एवं कुलकर्णी परिवार",
        blessing: "॥ श्री गणेशाय नमः ॥",
      }
      : { ...DEFAULT_DESIGN, lang: "mr" as const };

  const heroDesign = { ...baseDesign, template: heroTpls[tplIdx]?.id ?? baseDesign.template };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  return (
    <section className="bg-weave relative overflow-hidden">
      <MandalaCorner className="pointer-events-none absolute -left-6 top-6 hidden h-40 w-40 text-gold-500/35 lg:block" />
      <KalashArt className="pointer-events-none absolute right-6 bottom-4 hidden h-40 w-28 text-maroon-800/20 lg:block" />

      {/* Living aurora blobs */}
      <div className="hp-anim pointer-events-none absolute -top-32 -right-40 h-[480px] w-[480px] rounded-full bg-gold-400/15 blur-3xl" style={{ animation: "hp-blob 14s ease-in-out infinite" }} />
      <div className="hp-anim pointer-events-none absolute top-64 -left-52 h-[420px] w-[420px] rounded-full bg-maroon-700/10 blur-3xl" style={{ animation: "hp-blob 18s ease-in-out infinite reverse" }} />

      {/* Rotating mandala watermark */}
      <svg aria-hidden viewBox="0 0 200 200" className="hp-anim pointer-events-none absolute -right-28 top-1/3 h-[420px] w-[420px] text-gold-500/10" style={{ animation: "hp-spin 60s linear infinite" }}>
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i / 20) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 92} cy={100 + Math.sin(a) * 92} r="2" fill="currentColor" />;
        })}
      </svg>

      {/* Rising sparkle particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i}
            className="hp-anim absolute block rounded-full bg-gold-500/70"
            style={{
              left: `${6 + seeded(i) * 88}%`,
              bottom: `${seeded(i + 40) * 40}%`,
              width: 3 + seeded(i + 80) * 3,
              height: 3 + seeded(i + 80) * 3,
              animation: `hp-spark ${5 + seeded(i + 20) * 6}s ${seeded(i + 60) * 6}s ease-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        {/* ── Left: copy ── */}
        <div className="animate-fade-up relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip tone="maroon">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-maroon-700" />
              {copy.heroBadge}
            </Chip>
            <Link href="/panchang"
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-400/10 px-3 py-1 text-[12px] font-bold text-maroon-900 transition hover:bg-gold-400/20">
              <Icon name="calendar" className="h-3.5 w-3.5 text-gold-600" />
              {copy.heroPanchang}
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-leaf-600/30 bg-leaf-600/10 px-3 py-1 text-[12px] font-bold text-leaf-700">
              <span>🎬</span>
              {isEn ? "MP4 Video Export" : isHi ? "MP4 वीडियो एक्सपोर्ट" : "MP4 व्हिडिओ एक्सपोर्ट"}
            </span>
          </div>

          <h1 className="font-marathi-display mr-tracking mt-6 text-[32px] xs:text-[40px] sm:text-[56px] leading-[1.15] font-bold text-maroon-900 text-balance">
            {copy.heroTitle1}
            <br />
            <span className="text-maroon-700">{copy.heroTitle2}</span>{" "}
            <span className="relative inline-block">
              <span className="hp-shimmer-text relative z-10">{copy.heroTitle3}</span>
              <svg viewBox="0 0 220 12" className="absolute -bottom-2 left-0 w-full text-gold-500" aria-hidden>
                <path d="M4 8c40-6 140-6 212-2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-[16.5px] leading-relaxed text-ink-700">{copy.heroDesc}</p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <Link href="/studio"
              className="group relative inline-flex w-full sm:w-auto justify-center items-center gap-2.5 overflow-hidden rounded-full bg-maroon-800 py-3.5 pr-5 pl-7 text-[15px] font-bold text-ivory-100 shadow-luxe transition hover:bg-maroon-700 hover:shadow-glow">
              <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/15" style={{ animation: "hp-shine 3.4s ease-in-out infinite" }} />
              <span className="relative">{copy.ctaCreate}</span>
              <Icon name="arrowRight" className="relative h-4 w-4 text-gold-300 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
            </Link>
            <Link href="/biodata"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-6 py-3.5 text-[15px] font-bold text-maroon-900 transition hover:bg-gold-500/20 hover:border-gold-500">
              <span>⚜️</span>
              {isEn ? "Biodata Maker" : "विवाह बायोडाटा"}
            </Link>
            <Link href="/vendors"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2.5 rounded-full border border-maroon-800/25 bg-white/60 px-6 py-3.5 text-[15px] font-bold text-maroon-800 transition hover:border-gold-500 hover:bg-white">
              <Icon name="search" className="h-4.5 w-4.5" />
              {copy.ctaVendors}
            </Link>
            <Link href="/events"
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-ink-900/15 bg-white/40 px-5 py-3.5 text-[14px] font-bold text-ink-700 transition hover:border-gold-500 hover:bg-white">
              <Icon name="layers" className="h-4 w-4 text-maroon-700" />
              {copy.ctaEvents}
            </Link>
          </div>

          {/* Stats + social proof */}
          <div className="mt-12 grid max-w-lg grid-cols-3 gap-2 sm:gap-6 border-t border-maroon-900/10 pt-8">
            <Stat value={copy.stat1Val} label={copy.stat1Lbl} />
            <Stat value={copy.stat2Val} label={copy.stat2Lbl} />
            <Stat value={copy.stat3Val} label={copy.stat3Lbl} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {["द", "अ", "स", "प"].map((c, i) => (
                <span key={i} className="grid h-9 w-9 place-items-center rounded-full border-2 border-ivory-100 bg-gradient-to-br from-maroon-700 to-maroon-900 text-[12px] font-bold text-gold-200 shadow-sm">
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[12.5px] font-semibold text-ink-500">
              {isEn ? "Trusted by 12,000+ Maharashtrian families" : isHi ? "१२,०००+ महाराष्ट्रीय परिवारों का विश्वास" : "१२,०००+ महाराष्ट्रीय कुटुंबांची पसंती"}
              <span className="ml-1.5 text-gold-600">★★★★★</span>
            </p>
          </div>
        </div>

        {/* ── Right: living invitation with 3D tilt ── */}
        <div className="animate-fade-up relative z-10 mx-auto w-full max-w-[420px]" style={{ animationDelay: "150ms" }}>
          <div className="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-to-br from-gold-400/20 via-transparent to-maroon-700/15 blur-2xl" />

          <div onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="hp-card-tilt"
            style={{ transform: `perspective(1200px) rotateY(${tilt.x * 7}deg) rotateX(${-tilt.y * 7}deg)` }}>
            <div className="animate-float [--tilt:1.5deg]">
              <div key={tplIdx} className="animate-fade-in">
                <InvitationCard design={heroDesign} className="shadow-card ring-1 ring-maroon-900/10" />
              </div>
            </div>
          </div>

          {/* template cycle dots */}
          <div className="mt-4 flex justify-center gap-1.5">
            {heroTpls.map((t, i) => (
              <button key={t.id} type="button" aria-label={t.id} onClick={() => setTplIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-400 ${i === tplIdx ? "w-6 bg-gold-600" : "w-1.5 bg-maroon-900/20 hover:bg-maroon-900/40"}`} />
            ))}
          </div>

          {/* floating chips */}
          <div className="animate-float-slow absolute -left-10 top-14 hidden rounded-xl border border-ivory-300 bg-white/95 p-3.5 shadow-card backdrop-blur sm:block [--tilt:-3deg]">
            <div className="flex items-center gap-3">
              <ReadyRingMini value={82} />
              <div>
                <p className="text-[11px] font-extrabold tracking-wider text-ink-500 uppercase">{copy.readiness}</p>
                <p className="text-[15px] font-bold text-leaf-700">{copy.readinessVal}</p>
              </div>
            </div>
          </div>

          <div className="animate-float-slow absolute -right-6 bottom-16 hidden rounded-xl border border-ivory-300 bg-white/95 p-3.5 shadow-card backdrop-blur sm:block [--tilt:2deg]" style={{ animationDelay: "1.2s" }}>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-600/12 text-leaf-700">
                <Icon name="check" strokeWidth={2.4} />
              </span>
              <div>
                <p className="text-[13px] font-bold text-ink-900">{copy.bookingConfirmed}</p>
                <p className="text-[11.5px] text-ink-500">{copy.catererRate}</p>
              </div>
            </div>
          </div>

          <div className="animate-float absolute -top-4 -right-2 hidden items-center gap-2 rounded-full bg-gradient-to-r from-purple-700 to-maroon-800 py-2 pr-4 pl-2.5 text-[12px] font-bold text-ivory-100 shadow-luxe sm:flex [--tilt:2deg]" style={{ animationDelay: "1.8s" }}>
            <span>🎬</span>
            {isEn ? "Reel exported · 1080×1920" : isHi ? "रील एक्सपोर्ट · 1080×1920" : "रील एक्सपोर्ट · १०८०×१९२०"}
          </div>

          <div className="animate-float absolute -bottom-5 left-8 hidden items-center gap-2 rounded-full bg-maroon-900 py-2 pr-4 pl-2.5 text-[12px] font-bold text-gold-200 shadow-luxe sm:flex [--tilt:-1deg]" style={{ animationDelay: "0.6s" }}>
            <Icon name="whatsapp" className="h-4 w-4 text-gold-300" />
            {copy.guestWelcome}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReadyRingMini({ value }: { value: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-11 w-11">
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#ece1c6" strokeWidth="5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="#3e6b4f" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-extrabold text-leaf-700">{value}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARQUEE — dual row, opposite directions, gradient edges
═══════════════════════════════════════════════════════════════ */
function Marquee({ copy }: { copy: HomeCopy }) {
  const items = copy.marqueeItems;
  const rev = useMemo(() => [...items].reverse(), [items]);

  const Row = ({ list, reverse }: { list: readonly string[]; reverse?: boolean }) => (
    <div className="flex overflow-hidden" aria-hidden>
      <div className={`flex shrink-0 items-center gap-10 pr-10 ${reverse ? "hp-marquee-rev" : "animate-marquee"}`}>
        {[...list, ...list].map((m, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className={`font-marathi-display text-[15px] ${reverse ? "text-gold-400/80" : "text-gold-200"}`}>{m}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-gold-500/70" />
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative border-y border-gold-500/25 bg-maroon-900 py-4">
      {/* gold fade edges */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-maroon-900 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-maroon-900 to-transparent" />
      <div className="space-y-3">
        <Row list={items} />
        <Row list={rev} reverse />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PILLARS — spotlight hover cards
═══════════════════════════════════════════════════════════════ */
function Pillars({ copy, isEn }: { copy: HomeCopy; isEn: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Eyebrow>{copy.pillarsEyebrow}</Eyebrow>
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 text-balance sm:text-[44px]">
          {copy.pillarsTitle1} <span className="hp-shimmer-text">{copy.pillarsTitle2}</span> {copy.pillarsTitle3}
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-maroon-900/10 ring-1 ring-maroon-900/10 sm:grid-cols-2 lg:grid-cols-3">
        {copy.pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 60}>
            <Link href={p.href} className="group relative block h-full overflow-hidden bg-ivory-50 p-8 transition-all duration-300 hover:bg-white">
              {/* hover corner glow */}
              <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-400/0 blur-2xl transition-all duration-500 group-hover:bg-gold-400/25" />
              <span className="font-display absolute top-6 right-7 text-[13px] font-semibold text-gold-600/80 transition-colors group-hover:text-gold-600">
                {isEn ? `0${i + 1}` : `०${i + 1}`}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-maroon-800/8 text-maroon-800 ring-1 ring-maroon-800/15 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-maroon-800 group-hover:text-gold-300 group-hover:shadow-luxe">
                <Icon name={p.icon as IconName} className="h-6 w-6" />
              </span>
              <h3 className="font-marathi-display mt-5 text-[21px] font-bold text-ink-900">{p.title}</h3>
              <p className="mt-0.5 text-[10.5px] font-extrabold tracking-[0.24em] text-gold-600 uppercase">{p.sub}</p>
              <p className="mt-3.5 text-[14px] leading-relaxed text-ink-500">{p.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-maroon-700 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                {isEn ? "Open" : "उघडा"} <Icon name="arrowRight" className="h-3.5 w-3.5" strokeWidth={2.4} />
              </span>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-to-r from-transparent via-gold-500 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDIO SHOWCASE — tabbed: Templates / Video Studio / Effects Lab
═══════════════════════════════════════════════════════════════ */
type StudioTab = "templates" | "video" | "effects";

function StudioShowcase({ copy, isEn, isHi }: { copy: HomeCopy; isEn: boolean; isHi?: boolean }) {
  const mini = TEMPLATES;
  const s = copy.studioShowcase;
  const [tab, setTab] = useState<StudioTab>("templates");

  const tabs: { id: StudioTab; icon: string; label: string }[] = [
    { id: "templates", icon: "🎨", label: isEn ? "Templates" : isHi ? "टेम्पलेट्स" : "टेम्पलेट्स" },
    { id: "video", icon: "🎬", label: isEn ? "Video Studio" : isHi ? "वीडियो स्टूडियो" : "व्हिडिओ स्टुडिओ" },
    { id: "effects", icon: "✨", label: isEn ? "Effects Lab" : isHi ? "इफेक्ट्स लैब" : "इफेक्ट्स लॅब" },
  ];

  const effects = [
    { icon: "✨", en: "Golden Glow", mr: "सोनेरी तेज", hi: "स्वर्णिम आभा" },
    { icon: "🌸", en: "Petal Shower", mr: "फुलांची उधळण", hi: "फूलों की वर्षा" },
    { icon: "🪔", en: "Diya Lights", mr: "दिवा प्रकाश", hi: "दीप ज्योति" },
    { icon: "🧊", en: "Frosted Glass", mr: "दंवले काच", hi: "तुषारित कांच" },
    { icon: "🎊", en: "Confetti Pop", mr: "कॉन्फेटी", hi: "कॉन्फेटी" },
    { icon: "🔮", en: "Holographic", mr: "होलोग्राफिक", hi: "होलोग्राफिक" },
  ];

  return (
    <section className="bg-paisley-dark relative overflow-hidden py-24 text-ivory-100">
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-maroon-600/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal className="relative z-10">
          <Eyebrow dark>{s.eyebrow}</Eyebrow>
          <h2 className="font-marathi-display text-4xl leading-tight font-bold text-balance sm:text-[42px]">
            {s.title1} <span className="gold-foil">{s.titleHighlight}</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ivory-100/70">{s.desc}</p>

          {/* Tab switcher */}
          <div className="mt-8 inline-flex flex-wrap gap-1.5 rounded-2xl border border-gold-400/25 bg-white/5 p-1.5 backdrop-blur-sm">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex min-h-[42px] items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all duration-300 ${tab === t.id
                    ? "bg-gradient-to-r from-gold-500 to-gold-400 text-maroon-950 shadow-glow"
                    : "text-ivory-100/70 hover:bg-white/5 hover:text-gold-200"
                  }`}>
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <ul className="mt-8 space-y-4">
            {s.features.map((f) => (
              <li key={f.t} className="flex gap-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold-400/15 text-gold-300 ring-1 ring-gold-400/30">
                  <Icon name={f.icon as IconName} className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-[15px] font-bold">{f.t}</p>
                  <p className="text-[13.5px] text-ivory-100/60">{f.d}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/studio" className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gold-500 px-6 py-3.5 text-[15px] font-bold text-maroon-950 transition hover:bg-gold-400">
              <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/30" style={{ animation: "hp-shine 3s ease-in-out infinite" }} />
              <span className="relative">{s.cta}</span>
              <Icon name="arrowRight" className="relative h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
            </Link>
            <Link href="/biodata" className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 px-5 py-3.5 text-[14px] font-bold text-gold-200 transition hover:border-gold-300 hover:text-gold-100">
              <span>⚜️</span>
              {isEn ? "Marriage Biodata Maker" : "विवाह बायोडाटा मेकर"}
            </Link>
          </div>
        </Reveal>

        {/* Right panel — tab content */}
        <Reveal delay={120} className="relative z-10">
          {tab === "templates" && (
            <div className="animate-fade-in grid grid-cols-2 gap-5">
              {mini.slice(0, 4).map((t, i) => (
                <Link key={t.id} href="/studio"
                  className={`group relative overflow-hidden rounded-xl ring-1 ring-gold-400/25 transition duration-500 hover:-translate-y-2 hover:ring-gold-400/60 hover:shadow-glow ${i % 2 === 1 ? "translate-y-8" : ""}`}>
                  <InvitationCard
                    design={{
                      ...DEFAULT_DESIGN,
                      lang: isEn ? "en" : "mr",
                      template: t.id,
                      personA: isEn ? "Tejas Deshmukh" : "तेजस देशमुख",
                      personB: isEn ? "Ananya Kulkarni" : "अनन्या कुलकर्णी",
                    }}
                    className="aspect-[3/4.4]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-950/95 via-maroon-950/60 to-transparent p-3.5 pt-10">
                    <p className="font-marathi-display text-[14px] font-bold text-gold-200">{isEn ? t.en : t.name}</p>
                    <p className="text-[11px] text-ivory-100/60">₹{t.price} · {isEn ? t.name : t.en}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === "video" && (
            <div className="animate-fade-in">
              <div className="overflow-hidden rounded-2xl ring-1 ring-gold-400/30 shadow-glow">
                {/* mock video player */}
                <div className="relative aspect-[9/14] bg-gradient-to-b from-maroon-950 via-maroon-900 to-maroon-950">
                  <div aria-hidden className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: "radial-gradient(circle,#f0c048 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold-500 text-maroon-950 shadow-glow transition-transform duration-300 hover:scale-110">
                        <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                      <p className="mt-4 text-[12px] font-bold tracking-widest text-gold-300 uppercase">
                        {isEn ? "Invitation Reel · 9:16" : isHi ? "निमंत्रण रील · 9:16" : "पत्रिका रील · ९:१६"}
                      </p>
                    </div>
                  </div>
                  {/* timeline */}
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="flex h-8 gap-1 overflow-hidden rounded-lg">
                      <span className="flex w-1/4 items-center justify-center bg-purple-500/60 text-[9px] font-bold text-white">
                        {isEn ? "Intro" : "इंट्रो"}
                      </span>
                      <span className="flex w-2/4 items-center justify-center bg-gold-500/70 text-[9px] font-bold text-maroon-950">
                        {isEn ? "Card" : "कार्ड"}
                      </span>
                      <span className="flex w-1/4 items-center justify-center bg-leaf-600/60 text-[9px] font-bold text-white">
                        {isEn ? "Outro" : "शेवट"}
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-2/3 rounded-full bg-gold-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] font-mono text-ivory-100/60">1080×1920 · 30 FPS · H.264 MP4</p>
                <Link href="/studio?mode=video-studio"
                  className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-[12.5px] font-bold text-maroon-950 transition hover:bg-gold-400">
                  🎬 {isEn ? "Open Video Studio" : isHi ? "वीडियो स्टूडियो खोलें" : "व्हिडिओ स्टुडिओ उघडा"}
                </Link>
              </div>
            </div>
          )}

          {tab === "effects" && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {effects.map((e, i) => (
                  <Link key={e.en} href="/studio?mode=effects-lab"
                    className="group flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border border-gold-400/25 bg-white/5 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-400/60 hover:bg-gold-400/10 hover:shadow-glow"
                    style={{ animationDelay: `${i * 60}ms` }}>
                    <span className="text-3xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">{e.icon}</span>
                    <span className="text-[12px] font-bold text-ivory-100">{isEn ? e.en : isHi ? e.hi : e.mr}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[12px] text-ivory-100/55">
                  {isEn ? "11 particle systems · 20+ animations" : isHi ? "११ पार्टिकल · २०+ एनिमेशन" : "११ पार्टिकल · २०+ अ‍ॅनिमेशन्स"}
                </p>
                <Link href="/studio?mode=effects-lab"
                  className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 px-4 py-2 text-[12.5px] font-bold text-gold-200 transition hover:border-gold-300 hover:text-gold-100">
                  ✨ {isEn ? "Open Effects Lab" : isHi ? "इफेक्ट्स लैब खोलें" : "इफेक्ट्स लॅब उघडा"}
                </Link>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EVENT OS — count-up readiness + animated status bars
═══════════════════════════════════════════════════════════════ */
function EventOsShowcase({ copy }: { copy: HomeCopy }) {
  const e = copy.eventOsShowcase;
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const score = useCountUp(82, inView, 1600);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow>{e.eyebrow}</Eyebrow>
          <h2 className="font-marathi-display text-4xl leading-tight font-bold text-maroon-900 text-balance sm:text-[42px]">
            {e.title1} <span className="hp-shimmer-text">{e.titleHighlight}</span>
          </h2>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink-700">{e.desc}</p>
          <div className="mt-8 space-y-3">
            {e.features.map((x) => (
              <div key={x.t} className="flex items-center gap-3.5 rounded-xl border border-maroon-900/10 bg-white/70 px-4 py-3 transition-all duration-300 hover:translate-x-1 hover:border-gold-500/50 hover:shadow-luxe">
                <Icon name={x.icon as IconName} className="h-5 w-5 shrink-0 text-maroon-700" />
                <span className="text-[14.5px] font-semibold text-ink-800">{x.t}</span>
              </div>
            ))}
          </div>
          <Link href="/events" className="group mt-8 inline-flex items-center gap-2 text-[15px] font-bold text-maroon-800 hover:text-maroon-600">
            {e.cta}
            <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div ref={ref} className="overflow-hidden rounded-2xl border border-maroon-900/12 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-maroon-900/10 bg-ivory-50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-maroon-600/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-leaf-600/60" />
              </div>
              <span className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-ink-400 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-500" />
                </span>
                {e.workspaceTag}
              </span>
            </div>
            <div className="grid gap-5 p-6 sm:grid-cols-[auto_1fr]">
              <div className="text-center">
                <ReadinessBig value={score} animated={inView} />
                <p className="mt-2 text-[12px] font-bold text-ink-500">{e.scoreLabel}</p>
              </div>
              <div className="space-y-3.5">
                {e.statusItems.map((r, i) => (
                  <div key={r.t} className="rounded-lg bg-ivory-100 px-3.5 py-2.5 transition-colors hover:bg-ivory-200/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`grid h-5 w-5 place-items-center rounded-full ${r.ok ? "bg-leaf-600/15 text-leaf-700" : "bg-gold-500/20 text-gold-700"}`}>
                          {r.ok ? <Icon name="check" className="h-3 w-3" strokeWidth={2.6} /> : <Icon name="clock" className="h-3 w-3" strokeWidth={2.4} />}
                        </span>
                        <span className="text-[13px] font-semibold text-ink-800">{r.t}</span>
                      </div>
                      <span className={`text-[11px] font-bold ${r.ok ? "text-leaf-700" : "text-gold-700"}`}>{r.s}</span>
                    </div>
                    {/* animated progress bar */}
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-900/8">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${r.ok ? "bg-leaf-500" : "bg-gold-500"}`}
                        style={{
                          width: inView ? (r.ok ? "100%" : `${45 + i * 15}%`) : "0%",
                          transitionDelay: `${200 + i * 140}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ReadinessBig({ value, animated }: { value: number; animated: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f4eddc" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * (animated ? value : 0)) / 100}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.3,1)" }}
        />
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7a24f" />
            <stop offset="1" stopColor="#3e6b4f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="font-display text-[34px] leading-none font-semibold text-maroon-800">{value}%</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARKETPLACE
═══════════════════════════════════════════════════════════════ */
const MKT_DATA = [
  { img: IMG.banquet, mr: "लॉन आणि हॉल", en: "Lawns & Banquets", mrCount: "३८ सत्यापित", enCount: "38 Verified" },
  { img: IMG.mandapStage, mr: "डेकोरेशन", en: "Decorations", mrCount: "२६ सत्यापित", enCount: "26 Verified" },
  { img: IMG.coupleRitual, mr: "फोटोग्राफी", en: "Photography", mrCount: "३१ सत्यापित", enCount: "31 Verified" },
  { img: IMG.thali, mr: "कॅटरिंग", en: "Catering", mrCount: "२४ सत्यापित", enCount: "24 Verified" },
];

function Marketplace({ copy, isEn }: { copy: HomeCopy; isEn: boolean }) {
  const m = copy.marketplace;

  return (
    <section className="bg-ivory-200/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{m.eyebrow}</Eyebrow>
            <h2 className="font-marathi-display max-w-xl text-4xl leading-tight font-bold text-maroon-900 text-balance sm:text-[42px]">
              {m.title1} <span className="hp-shimmer-text">{m.titleHighlight}</span>
            </h2>
          </div>
          <p className="max-w-sm text-[14.5px] leading-relaxed text-ink-500">{m.desc}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MKT_DATA.map((c, i) => (
            <Reveal key={c.en} delay={i * 70}>
              <Link href="/vendors" className="group relative block overflow-hidden rounded-2xl shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-glow">
                <img src={c.img} alt={isEn ? c.en : c.mr} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950/90 via-maroon-950/25 to-transparent transition-opacity duration-500 group-hover:from-maroon-950/95" />
                {/* hover arrow */}
                <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-gold-500 text-maroon-950 opacity-0 shadow-luxe transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                  <Icon name="arrowRight" className="h-4.5 w-4.5" strokeWidth={2.4} />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-2"><VerifiedBadge compact /></div>
                  <p className="font-marathi-display mt-2 text-[22px] font-bold text-ivory-100">{isEn ? c.en : c.mr}</p>
                  <p className="text-[12px] font-semibold text-gold-300">{isEn ? c.enCount : c.mrCount} · {m.suffix}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100} className="mt-10 grid gap-4 rounded-2xl border border-gold-500/30 bg-white p-6 sm:grid-cols-3">
          {m.trust.map((x) => (
            <div key={x.h} className="flex gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-maroon-800/8 text-maroon-800 ring-1 ring-maroon-800/15">
                <Icon name={x.icon as IconName} className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-ink-900">{x.h}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{x.d}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   JOURNEY — scroll-drawn timeline
═══════════════════════════════════════════════════════════════ */
function Journey({ copy }: { copy: HomeCopy }) {
  const j = copy.journey;
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <OrnamentDivider className="mb-8" />
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 text-balance sm:text-[42px]">
          {j.title1} <span className="hp-shimmer-text">{j.titleHighlight}</span>
        </h2>
      </Reveal>
      <div ref={ref} className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* drawing connector line */}
        <div aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 overflow-hidden rounded-full bg-maroon-900/8 lg:block">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 transition-all duration-[1600ms] ease-out"
            style={{ width: inView ? "100%" : "0%" }}
          />
        </div>
        {j.steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 90} className="relative text-center">
            <span className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full bg-maroon-800 text-gold-300 shadow-luxe ring-4 ring-ivory-100 transition-transform duration-300 hover:scale-110">
              <Icon name={s.icon as IconName} className="h-6 w-6" />
              {/* pulse ring */}
              <span aria-hidden className="absolute inset-0 rounded-full border-2 border-gold-500/40" style={{ animation: `hp-spark 0s`, opacity: 0 }} />
            </span>
            <p className="mt-4 text-[11px] font-extrabold tracking-[0.24em] text-gold-600">{j.stepPrefix}{i + 1}</p>
            <h3 className="font-marathi-display mt-1 text-[20px] font-bold text-ink-900">{s.t}</h3>
            <p className="mx-auto mt-2 max-w-[240px] text-[13.5px] leading-relaxed text-ink-500">{s.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRICING — shimmer hot tier
═══════════════════════════════════════════════════════════════ */
function Pricing({ copy }: { copy: HomeCopy }) {
  const p = copy.pricing;

  return (
    <section className="bg-paisley-dark relative overflow-hidden py-24 text-ivory-100">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>{p.eyebrow}</Eyebrow>
          <h2 className="font-marathi-display text-4xl font-bold text-balance sm:text-[44px]">
            {p.title1} <span className="gold-foil">{p.titleHighlight}</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {p.tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className={`relative h-full overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 ${t.hot
                  ? "bg-gradient-to-b from-gold-500/20 to-gold-500/5 ring-2 ring-gold-400/70 shadow-glow"
                  : "bg-white/[0.05] ring-1 ring-white/12 hover:ring-white/25"
                }`}>
                {t.hot && (
                  <>
                    <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/8" style={{ animation: "hp-shine 4s ease-in-out infinite" }} />
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-[11px] font-extrabold tracking-wider text-maroon-950 shadow-glow">
                      {p.popularBadge}
                    </span>
                  </>
                )}
                <p className="text-[12px] font-extrabold tracking-[0.22em] text-gold-400 uppercase">{t.name}</p>
                <p className="font-display mt-3 text-[42px] leading-none font-semibold">{t.price}</p>
                <p className="mt-2 text-[13px] text-ivory-100/55">{t.per}</p>
                <ul className="mt-7 space-y-3">
                  {t.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-ivory-100/80">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" strokeWidth={2.4} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/vendor-os"
                  className={`mt-8 block rounded-full py-3 text-center text-[14px] font-bold transition ${t.hot ? "bg-gold-500 text-maroon-950 hover:bg-gold-400 hover:shadow-glow" : "bg-white/10 text-ivory-100 ring-1 ring-white/20 hover:bg-white/20"
                    }`}>
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS — star rated
═══════════════════════════════════════════════════════════════ */
function Testimonials({ copy }: { copy: HomeCopy }) {
  const tm = copy.testimonials;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal className="text-center">
        <Eyebrow>{tm.eyebrow}</Eyebrow>
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 sm:text-[42px]">
          {tm.title1} <span className="hp-shimmer-text">{tm.titleHighlight}</span>
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tm.items.map((t, i) => (
          <Reveal key={t.a} delay={i * 80}>
            <figure className="group relative h-full rounded-2xl border border-maroon-900/10 bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/40 hover:shadow-glow">
              <div className="flex items-center justify-between">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-gold-500" fill="currentColor" aria-hidden>
                  <path d="M10 7H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3v-1c0-3-1-4-3-5l1-3c2 .5 4 2 4 5zm11 0h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h3v-1c0-3-1-4-3-5l1-3c2 .5 4 2 4 5z" opacity="0.8" />
                </svg>
                <span className="text-[13px] tracking-wider text-gold-500" aria-label="5 star rating">★★★★★</span>
              </div>
              <blockquote className="font-marathi-display mt-4 text-[16.5px] leading-relaxed text-ink-800">{t.q}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ivory-300 pt-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-maroon-700 to-maroon-900 text-[14px] font-bold text-gold-200 ring-2 ring-gold-500/30">
                  {t.a.charAt(0)}
                </span>
                <div>
                  <p className="text-[14px] font-bold text-maroon-800">{t.a}</p>
                  <p className="text-[12px] text-ink-400">{t.r}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ — trilingual accordion (NEW)
═══════════════════════════════════════════════════════════════ */
function Faq({ isEn, isHi }: { isEn: boolean; isHi?: boolean }) {
  const [open, setOpen] = useState(0);

  const faqs = isEn
    ? [
      { q: "Which languages are supported?", a: "Everything works in Marathi, Hindi and English — cards, editor, panchang and invoices. Transliteration is built-in, so you can type in English and get Devanagari output." },
      { q: "Will the printed card match the screen exactly?", a: "Yes — our WYSIWYP pipeline renders at 300 DPI with a 3mm bleed, CMYK-safe colors and zero clipping, guaranteed." },
      { q: "Can I export a video invitation?", a: "Absolutely. The Video Studio renders a real MP4 (H.264) on our servers — 9:16 for Reels, 1:1 for posts — with particles, music and animations." },
      { q: "How do vendor payments work?", a: "Payments sit in secure escrow and are released to the vendor only after you verify the milestone delivery." },
      { q: "How accurate is the panchang?", a: "We compute tithi, nakshatra and muhurat with the Surya Siddhanta engine, localised to your city's sunrise." },
    ]
    : isHi
      ? [
        { q: "कौन-कौन सी भाषाएँ समर्थित हैं?", a: "सब कुछ मराठी, हिंदी और अंग्रेज़ी में — कार्ड, एडिटर, पंचांग और बिल। ट्रांसलिटरेषन भी बना है: अंग्रेज़ी टाइप करें, देवनागरी पाएँ।" },
        { q: "क्या छपाई स्क्रीन जैसी ही होगी?", a: "हाँ — WYSIWYP पाइपलाइन 300 DPI, 3 मिमी ब्लीड और CMYK-सुरक्षित रंगों के साथ छापती है। क्लिपिंग कभी नहीं होती।" },
        { q: "क्या वीडियो निमंत्रण एक्सपोर्ट कर सकते हैं?", a: "बिल्कुल। वीडियो स्टूडियो सर्वर पर असली MP4 (H.264) रेंडर करता है — रील्स के लिए 9:16 — पार्टिकल्स, संगीत और एनिमेशन के साथ।" },
        { q: "विक्रेता भुगतान कैसे होता है?", a: "भुगतान सुरक्षित एस्क्रो में रहता है और सत्यापित डिलीवरी के बाद ही विक्रेता को मिलता है।" },
        { q: "पंचांग कितना सटीक है?", a: "सूर्यसिद्धांत इंजन से तिथि, नक्षत्र और मुहूर्त की गणना आपके शहर के सूर्योदय के अनुसार होती है।" },
      ]
      : [
        { q: "कोणत्या भाषांना पाठिंबा आहे?", a: "सर्व काही मराठी, हिंदी आणि इंग्रजीमध्ये — पत्रिका, एडिटर, पंचांग व बिले. ट्रान्सलिटरेशन आतच आहे: इंग्रजीत टाइप करा, देवनागरीत मिळवा." },
        { q: "प्रिंट स्क्रीनसारखाच येतो का?", a: "हो — WYSIWYP पाइपलाइन 300 DPI, ३ मिमी ब्लीड आणि CMYK-सुरक्षित रंगांसह छापते. क्लिपिंग कधीच होत नाही." },
        { q: "व्हिडिओ पत्रिका एक्सपोर्ट करता येते का?", a: "नक्कीच. व्हिडिओ स्टुडिओ सर्व्हरवर खरा MP4 (H.264) रेंडर करतो — रील्ससाठी ९:१६ — पार्टिकल, संगीत व अ‍ॅनिमेशनसह." },
        { q: "विक्रेता पेमेंट कसे होते?", a: "पेमेंट सुरक्षित एस्क्रोमध्ये राहते आणि कामाची खातरजमा झाल्यावरच विक्रेत्याला दिले जाते." },
        { q: "पंचांग किती अचूक आहे?", a: "सूर्यसिद्धांत इंजिनने तिथी, नक्षत्र व मुहूर्त तुमच्या शहराच्या सूर्योदयानुसार मोजले जातात." },
      ];

  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
      <Reveal className="text-center">
        <Eyebrow>{isEn ? "Questions & Answers" : isHi ? "प्रश्नोत्तर" : "प्रश्नोत्तरे"}</Eyebrow>
        <h2 className="font-marathi-display text-4xl font-bold text-maroon-900 sm:text-[42px]">
          {isEn ? "Everything you" : isHi ? "आपके सभी" : "तुमची सर्व"}{" "}
          <span className="hp-shimmer-text">{isEn ? "wonder about" : isHi ? "प्रश्न" : "शंका"}</span>
        </h2>
      </Reveal>

      <div className="mt-10 space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 50}>
              <div className={`overflow-hidden rounded-2xl border transition-all duration-400 ${isOpen ? "border-gold-500/60 bg-white shadow-luxe" : "border-maroon-900/10 bg-white/70 hover:border-gold-500/40"
                }`}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
                  <span className="flex items-center gap-3.5">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-black transition-all duration-300 ${isOpen ? "bg-maroon-800 text-gold-300 rotate-180" : "bg-gold-500/15 text-gold-700"
                      }`}>
                      {isEn ? `0${i + 1}` : `०${i + 1}`}
                    </span>
                    <span className="text-[15px] font-bold text-ink-900">{f.q}</span>
                  </span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-400 ${isOpen ? "rotate-45 border-gold-500 bg-gold-500/15 text-maroon-800" : "border-maroon-900/15 text-ink-500"
                    }`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-500 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-[4.2rem] text-[14px] leading-relaxed text-ink-600 sm:px-6 sm:pl-[4.5rem]">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CTA BAND — flickering diya + sparkles
═══════════════════════════════════════════════════════════════ */
function CtaBand({ copy }: { copy: HomeCopy }) {
  const c = copy.ctaBand;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-maroon-900 px-8 py-16 text-center shadow-card sm:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-gold-400/25 blur-3xl" />

          {/* sparkles */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className="hp-anim absolute rounded-full bg-gold-300"
                style={{
                  left: `${8 + seeded(i + 5) * 84}%`,
                  bottom: `${10 + seeded(i + 15) * 30}%`,
                  width: 2.5 + seeded(i) * 3,
                  height: 2.5 + seeded(i) * 3,
                  animation: `hp-spark ${4 + seeded(i + 30) * 5}s ${seeded(i + 45) * 5}s ease-out infinite`,
                }} />
            ))}
          </div>

          {/* Diya with flickering flame */}
          <div className="relative mx-auto h-16 w-16">
            <span aria-hidden className="hp-anim absolute left-1/2 top-0 block h-7 w-4 -translate-x-1/2 rounded-full bg-gradient-to-t from-amber-500 via-gold-400 to-ivory-100 blur-[1px]"
              style={{ animation: "hp-flame 1.6s ease-in-out infinite", transformOrigin: "bottom center" }} />
            <Icon name="diya" className="absolute bottom-0 left-1/2 h-10 w-10 -translate-x-1/2 text-gold-400" strokeWidth={1.4} />
          </div>

          <h2 className="font-marathi-display mx-auto mt-5 max-w-2xl text-4xl leading-tight font-bold text-ivory-100 text-balance sm:text-[46px]">
            {c.title1} <span className="gold-foil">{c.titleHighlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-ivory-100/65">{c.desc}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/studio"
              className="group relative overflow-hidden rounded-full bg-gold-500 px-8 py-4 text-[15.5px] font-bold text-maroon-950 shadow-luxe transition hover:bg-gold-400 hover:shadow-glow hover:scale-[1.03]">
              <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/30" style={{ animation: "hp-shine 3s ease-in-out infinite" }} />
              <span className="relative">{c.btn1}</span>
            </Link>
            <Link href="/events"
              className="rounded-full border border-gold-400/40 px-8 py-4 text-[15.5px] font-bold text-gold-200 transition hover:bg-gold-400/10 hover:border-gold-300">
              {c.btn2}
            </Link>
          </div>

          <p className="hp-shimmer-text-dark mt-8 text-[13px] font-semibold tracking-widest">
            ॥ शुभं भवतु ॥
          </p>
        </div>
      </Reveal>
    </section>
  );
}