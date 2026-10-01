'use client';

import Link from "next/link";
import { GoldenHeroLanding } from "@/components/golden-hero-landing";
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
        background: linear-gradient(100deg, #7c3aed 30%, #a78bfa 50%, #7c3aed 70%);
        background-size: 200% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: hp-shimmer 4.5s linear infinite;
      }
      .hp-shimmer-text-dark {
        background: linear-gradient(100deg, #a78bfa 30%, #ffffff 50%, #a78bfa 70%);
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
/* ═══════════════════════════════════════════════════════════════
   SHOWCASE CARDS DATA & CATEGORIES
═══════════════════════════════════════════════════════════════ */
interface ShowcaseCard {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  badge: string;
  category: string;
  color: string;
}

const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    id: 'wedding-royal-purple-ganesh',
    title: 'शुभविवाह',
    subtitle: 'शाही जांभळा वेलवेट',
    desc: 'जांभळा वेलवेट, सुवर्ण गणेश सिंहासन, मंदिर कमान, हत्ती व मोर नक्षीदार राजेशाही डिझाईन',
    image: '/art/card_purple_ganesh.jpg',
    badge: 'रॉयल वेलवेट २४K गोल्ड',
    category: 'राजेशाही पत्रिका',
    color: '#3b0b45',
  },
  {
    id: 'cream_floral',
    title: 'शुभविवाह',
    subtitle: 'मिनिमल एलिगंट',
    desc: 'आयव्हरी कागद व झेंडू-जाई फुलांची कमान',
    image: '/art/card_cream_floral.jpg',
    badge: 'क्लासिक',
    category: 'फुलांची सजावट',
    color: '#854d0e',
  },
  {
    id: 'couple_story',
    title: 'शुभविवाह',
    subtitle: 'स्टोरी थीम कस्टम',
    desc: 'हस्तलिखित वधू-वर चित्र व पारंपरिक जोडपे',
    image: '/art/card_couple.jpg',
    badge: 'लोकप्रिय',
    category: 'कस्टम जोडी',
    color: '#9a3412',
  },
  {
    id: 'emerald_temple',
    title: 'शुभविवाह',
    subtitle: 'रॉयल राजवाडा',
    desc: 'पाचू हिरवा व सुवर्ण महाल कमानीची रचना',
    image: '/art/card_emerald.jpg',
    badge: 'प्रीमियम',
    category: 'राजेशाही',
    color: '#065f46',
  },
  {
    id: 'peacock_special',
    title: 'शुभविवाह',
    subtitle: 'फेस्टिव्हल स्पेशल',
    desc: 'सुवर्ण मोरपीस व नक्षीदार राजस्थानी बॉर्डर',
    image: '/art/card_peacock.jpg',
    badge: 'ट्रेंडिंग',
    category: 'मोरपीस',
    color: '#0369a1',
  },
];

const CATEGORIES = [
  { id: 'wedding', label: 'विवाह पत्रिका', icon: '💍', bg: 'bg-[#fff5f5] text-[#e11d48] border-[#ffe4e6]', href: '/studio?category=wedding' },
  { id: 'haldi', label: 'हळदी समारंभ', icon: '🌿', bg: 'bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]', href: '/studio?category=haldi' },
  { id: 'sakharpuda', label: 'साखरपुडा', icon: '💍', bg: 'bg-[#fefce8] text-[#ca8a04] border-[#fef9c3]', href: '/studio?category=sakharpuda' },
  { id: 'munj', label: 'मुंज / उपनयन', icon: '🪔', bg: 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]', href: '/studio?category=munj' },
  { id: 'gruhapravesh', label: 'गृहप्रवेश', icon: '🏠', bg: 'bg-[#f0f9ff] text-[#0284c7] border-[#e0f2fe]', href: '/studio?category=gruhapravesh' },
  { id: 'birthday', label: 'वाढदिवस', icon: '🎂', bg: 'bg-[#fff1f2] text-[#f43f5e] border-[#ffe4e6]', href: '/studio?category=birthday' },
  { id: 'namkaran', label: 'नामकरण', icon: '👶', bg: 'bg-[#fffbeb] text-[#d97706] border-[#fef3c7]', href: '/studio?category=namkaran' },
  { id: 'shraddha', label: 'क्रियाकर्म', icon: '🪔', bg: 'bg-[#fefce8] text-[#eab308] border-[#fef08a]', href: '/studio?category=shraddha' },
  { id: 'business_card', label: 'बिझनेस कार्ड', icon: '💳', bg: 'bg-[#fdf2f8] text-[#db2777] border-[#fce7f3]', href: '/studio?category=business' },
  { id: 'festival', label: 'फेस्टिव्हल कार्ड', icon: '🪷', bg: 'bg-[#fae8ff] text-[#c026d3] border-[#f5d0fe]', href: '/studio?category=festival' },
  { id: 'biodata', label: 'बायोडेटा', icon: '📄', bg: 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]', href: '/biodata' },
  { id: 'all_events', label: 'इतर सर्व', icon: '▦', bg: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]', href: '/studio' },
];

const COLLECTION_ITEMS = [
  {
    id: 'c1',
    label: 'पारंपरिक महाराष्ट्रीयन',
    image: '/art/card_purple_ganesh.jpg',
    href: '/studio?style=traditional',
  },
  {
    id: 'c2',
    label: 'आधुनिक क्लासिक',
    image: '/art/card_arch.jpg',
    href: '/studio?style=classic',
  },
  {
    id: 'c3',
    label: 'रॉयल प्रीमियम',
    image: '/art/card_emerald.jpg',
    href: '/studio?style=royal',
  },
  {
    id: 'c4',
    label: 'मिनिमल एलिगंट',
    image: '/art/card_cream_floral.jpg',
    href: '/studio?style=minimal',
  },
  {
    id: 'c5',
    label: 'स्टोरी थीम कस्टम',
    image: '/art/card_couple.jpg',
    href: '/studio?style=story',
  },
  {
    id: 'c6',
    label: 'फेस्टिव्हल स्पेशल',
    image: '/art/card_peacock.jpg',
    href: '/studio?style=festival',
  },
];

/* Authentic Festive Mango Leaves & Blossom Corner Decoration */
function ToranCornerDecoration({ position = 'left' }: { position?: 'left' | 'right' }) {
  const isRight = position === 'right';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -top-2 ${isRight ? '-right-2 sm:right-0' : '-left-2 sm:left-0'} z-20 overflow-hidden w-28 sm:w-36 h-28 sm:h-36 opacity-90`}
    >
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full ${isRight ? '-scale-x-100' : ''} drop-shadow-sm`}
        fill="none"
      >
        {/* Mango Leaves Cluster (आंब्याची पाने) */}
        <path d="M-5 -5 Q 25 10 50 35 Q 28 42 5 28 Z" fill="#1b4332" opacity="0.95" />
        <path d="M5 -10 Q 28 20 65 25 Q 45 45 20 25 Z" fill="#2d6a4f" opacity="0.95" />
        <path d="M-5 15 Q 30 30 55 60 Q 32 65 10 42 Z" fill="#40916c" opacity="0.9" />
        <path d="M25 -5 Q 45 20 80 32 Q 62 48 38 35 Z" fill="#52b788" opacity="0.85" />
        <path d="M15 10 Q 48 30 68 68 Q 50 72 25 50 Z" fill="#2d6a4f" opacity="0.95" />

        {/* Delicate Golden Temple Bell */}
        <path d="M42 42 L38 52 L46 52 Z" fill="#f59e0b" />
        <circle cx="42" cy="53" r="1.5" fill="#d97706" />

        {/* Auspicious Red Rose Petal Accent */}
        <ellipse cx="60" cy="50" rx="3.5" ry="5.5" transform="rotate(35 60 50)" fill="#e11d48" opacity="0.85" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export function HomePageClient() {
  const { lang, isEn, isHi } = useLanguage();
  const copy = uiCopy[lang].home;

  return (
    <div className="overflow-x-clip" lang={isEn ? "en" : isHi ? "hi" : "mr"}>
      <HomeStyles />
      <GoldenHeroLanding isEn={isEn} />
      <CategoryQuickNav />
      <DesignCollectionBar />
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
   HERO — Exactly matching reference image 100%
═══════════════════════════════════════════════════════════════ */
function Hero({ copy, isEn, isHi }: HeroProps) {
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [previewModalCard, setPreviewModalCard] = useState<ShowcaseCard | null>(null);

  /* Auto-rotate cards slowly */
  useEffect(() => {
    const id = setInterval(() => {
      setSelectedCardIdx((prev) => (prev + 1) % SHOWCASE_CARDS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fffbf4] via-[#fffdf9] to-[#faf3e8] border-b border-stone-200/70">
      {/* Traditional Marigold & Mango Leaves Garlands (Toran) */}
      <ToranCornerDecoration position="left" />
      <ToranCornerDecoration position="right" />

      {/* Auspicious Sacred Mandala Watermark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="hp-anim pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[650px] w-[650px] text-amber-500/[0.04]"
        style={{ animation: "hp-spin 80s linear infinite" }}
      >
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 92} cy={100 + Math.sin(a) * 92} r="2" fill="currentColor" />;
        })}
      </svg>

      {/* Floating Sparkle Particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="hp-anim absolute block rounded-full bg-amber-400/60"
            style={{
              left: `${8 + seeded(i) * 84}%`,
              bottom: `${seeded(i + 30) * 45}%`,
              width: 3 + seeded(i + 70) * 3,
              height: 3 + seeded(i + 70) * 3,
              animation: `hp-spark ${5 + seeded(i + 15) * 5}s ${seeded(i + 40) * 5}s ease-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:pt-8 lg:pb-12">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          {/* ── Left Column: Typography, Metrics & CTAs (6 cols) ── */}
          <div className="lg:col-span-6 z-10 animate-fade-up">
            {/* Top Tagline Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-[#fdf6ec] px-4 py-1.5 text-xs sm:text-[13px] font-semibold text-amber-950 shadow-2xs">
              <span className="text-amber-500 font-bold">✦</span>
              <span>पुणे • १२०+ सत्यापित डिझाईन्स • लाखो आनंदी ग्राहक</span>
            </div>

            {/* Massive Marathi Heading */}
            <h1 className="mt-4 text-[40px] xs:text-[46px] sm:text-[54px] xl:text-[60px] font-extrabold leading-[1.12] tracking-tight text-[#1c1613]">
              <span className="block font-serif text-[#1c1613]">उत्सव ठरवला?</span>
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-[#691882] via-[#851896] to-[#b32486] bg-clip-text text-transparent drop-shadow-xs">
                  उरलेलं सगळं आमच्यावर.
                </span>
                {/* Golden swoosh underline matching reference image */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 pointer-events-none"
                  viewBox="0 0 340 18"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 14C85 3 250 3 337 14"
                    stroke="url(#hpGoldSwoosh)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="hpGoldSwoosh" x1="0" y1="0" x2="340" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#eab308" />
                      <stop offset="0.5" stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Description Paragraph */}
            <p className="mt-4 max-w-lg text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#544b46]">
              विवाह पत्रिका, बायोडेटा, मुहूर्त, क्रियायें, व्यवसायासाठी डिझाईन्स — सगळं एका विश्वसनीय, आधुनिक आणि मराठी मनाच्या प्लॅटफॉर्मवर. AI मदतीने काही मिनिटांत तुमची खास पत्रिका तयार करा.
            </p>

            {/* Trust Social Proof Metrics Row */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🧡</span>
                <div>
                  <p className="text-[14px] font-bold text-[#1c1613] leading-tight">१.५०+ लाख</p>
                  <p className="text-[11px] text-[#78716c]">आनंदी ग्राहक</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-[14px] font-bold text-[#1c1613] leading-tight">४.८/५</p>
                  <p className="text-[11px] text-[#78716c]">ग्राहक रेटिंग</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-[14px] font-bold text-[#1c1613] leading-tight">१२०+</p>
                  <p className="text-[11px] text-[#78716c]">सत्यापित डिझाईन्स</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-[14px] font-bold text-[#1c1613] leading-tight">क्षणात</p>
                  <p className="text-[11px] text-[#78716c]">डाउनलोड व शेअर</p>
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Primary Glowing Purple Pill */}
              <Link
                href="/create"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#6b1c82] via-[#7e22ce] to-[#581c87] px-6 sm:px-7 py-3.5 text-sm sm:text-[14.5px] font-bold text-white shadow-xl shadow-purple-600/30 ring-1 ring-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-600/45 whitespace-nowrap"
              >
                <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/25" style={{ animation: "hp-shine 3.2s ease-in-out infinite" }} />
                <span className="text-yellow-300">✦</span>
                <span>पत्रिका बनवा — मोफत</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>

              {/* Secondary White Pill: Biodata */}
              <Link
                href="/biodata"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white px-5 sm:px-6 py-3.5 text-sm sm:text-[14.5px] font-bold text-[#1c1613] shadow-xs transition hover:border-amber-400 hover:bg-amber-50/30 whitespace-nowrap"
              >
                <span className="text-amber-500">✦</span>
                <span>विवाह बायोडेटा</span>
              </Link>

              {/* Tertiary White Pill: Search */}
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white px-5 sm:px-6 py-3.5 text-sm sm:text-[14.5px] font-bold text-[#1c1613] shadow-xs transition hover:border-purple-300 hover:bg-purple-50/30 whitespace-nowrap"
              >
                <span className="text-slate-600">🔍</span>
                <span>डिझाईन्स शोधा</span>
              </Link>
            </div>
          </div>

          {/* ── Right Column: Wedding Couple Photography + Standing Cards (6 cols) ── */}
          <div className="lg:col-span-6 relative z-10 animate-fade-up">
            <div className="relative mx-auto w-full max-w-[620px] rounded-3xl overflow-hidden shadow-2xl border border-amber-200/50 bg-[#fffdf9]">
              {/* Couple Backdrop Photography */}
              <div className="relative h-80 sm:h-96 xl:h-[430px] w-full overflow-hidden">
                <img
                  src="/art/hero_couple.jpg"
                  alt="मराठी वधू-वर लग्नपत्रिका"
                  className="h-full w-full object-cover object-top filter brightness-[1.01] contrast-[1.04]"
                />
                {/* Gentle fade-out gradient overlays for seamless staging */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#fcf7ee] via-transparent to-black/20" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#fffbf4]/80 to-transparent hidden sm:block" />

                {/* Floating Glassmorphic AI Assistant Pill (Top-Right) */}
                <div className="absolute top-4 sm:top-5 right-4 sm:right-5 z-20 flex items-center gap-2.5 rounded-2xl border border-purple-400/40 bg-[#21062b]/92 px-3.5 sm:px-4 py-2 sm:py-2.5 text-white shadow-2xl backdrop-blur-md max-w-[280px]">
                  <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-yellow-300 shadow-sm">
                    <span className="text-xs">✦</span>
                  </div>
                  <div>
                    <p className="text-[12px] sm:text-[12.5px] font-bold text-white leading-tight">
                      AI डिझाईन असिस्टंट
                    </p>
                    <p className="text-[10px] text-purple-200/80 leading-snug mt-0.5">
                      तुमच्या माहितीनुसार स्वतःहून सुंदर पत्रिका तयार करा
                    </p>
                  </div>
                </div>

                {/* Standing 5 Realistic Invitation Cards (Row at bottom of couple image) */}
                <div className="absolute inset-x-0 bottom-2 sm:bottom-3 z-20 px-2 sm:px-4">
                  <div className="relative flex items-end justify-center gap-1.5 sm:gap-2.5">
                    {SHOWCASE_CARDS.map((card, idx) => {
                      const isSelected = selectedCardIdx === idx;
                      const isCenter = idx === 2;
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedCardIdx(idx);
                            setPreviewModalCard(card);
                          }}
                          className={`group relative cursor-pointer transition-all duration-300 ease-out hover:-translate-y-4 hover:z-30 shrink-0 ${
                            isSelected || isCenter
                              ? '-translate-y-2.5 sm:-translate-y-3 z-20 scale-105 ring-2 ring-amber-400 shadow-2xl'
                              : 'shadow-xl hover:shadow-2xl'
                          }`}
                          style={{
                            width: 'clamp(58px, 15vw, 94px)',
                            aspectRatio: '3 / 4.4',
                          }}
                        >
                          {/* Physical Card Edge & Embossed Look */}
                          <div className="relative h-full w-full overflow-hidden rounded-md sm:rounded-lg bg-white shadow-[0_14px_30px_-6px_rgba(20,5,30,0.45)] ring-1 ring-black/10">
                            <img
                              src={card.image}
                              alt={card.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Gold Foil Subtle Sheen */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 opacity-70 group-hover:opacity-20 transition" />
                          </div>
                        </div>
                      );
                    })}

                    {/* Right Carousel Arrow Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCardIdx((prev) => (prev + 1) % SHOWCASE_CARDS.length);
                      }}
                      aria-label="Next card"
                      className="size-8 sm:size-9 grid place-items-center rounded-full bg-white text-slate-800 shadow-xl border border-gray-200 hover:scale-110 hover:bg-slate-50 transition active:scale-95 shrink-0 ml-1"
                    >
                      <span className="text-base sm:text-lg font-bold leading-none">›</span>
                    </button>
                  </div>

                  {/* Scattered Flower Petals Decor along base of cards */}
                  <div className="pointer-events-none mt-1 flex justify-center items-center gap-6 text-[10px] opacity-75">
                    <span>🌸</span>
                    <span className="text-yellow-500">🌼</span>
                    <span>🌺</span>
                    <span className="text-amber-500">🌼</span>
                    <span>🌸</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Card Preview Modal ── */}
      {previewModalCard && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewModalCard(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-amber-400/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold ribbon */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-purple-600 to-amber-400" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold border border-amber-300">
                  {previewModalCard.badge}
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-stone-900 font-serif">
                  {previewModalCard.title} — {previewModalCard.subtitle}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {previewModalCard.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalCard(null)}
                className="grid size-8 place-items-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            {/* Card High-Res Preview */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 shadow-md bg-stone-50 max-h-[360px] flex items-center justify-center">
              <img
                src={previewModalCard.image}
                alt={previewModalCard.title}
                className="max-h-[360px] w-auto object-contain"
              />
            </div>

            {previewModalCard.id === 'wedding-royal-purple-ganesh' && (
              <div className="mt-3 rounded-xl bg-purple-50/90 border border-purple-200/90 p-2.5 text-xs text-purple-950">
                <p className="font-semibold text-purple-900 flex items-center gap-1.5">
                  <span>👑</span>
                  <span>राजेशाही लग्नपत्रिका नमुना (Royal Gold Foil Invitation)</span>
                </p>
                <p className="mt-1 text-[11px] text-purple-800 leading-snug">
                  राजकुमारी रेया सिंह (Princess Reya Singh) &amp; राजकुमार विक्रम राव (Prince Vikram Rao) · राज महाल पॅलेस, जयपूर
                </p>
              </div>
            )}

            {/* Features checkmarks */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>अस्सल मराठी फॉन्ट व मांडणी</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>३०० DPI हाय-रिझोल्यूशन प्रिंट</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>१-क्लिक व्हॉट्सअॅप व PDF शेअर</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>AI स्मार्ट मजकूर संपादन</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setPreviewModalCard(null)}
                className="rounded-full px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                बंद करा
              </button>
              <a
                href={previewModalCard.image}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
              >
                <span>🔍 HD झूम</span>
              </a>
              <Link
                href={`/studio?template=${previewModalCard.id}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-white shadow-md hover:scale-105 transition"
              >
                <span>✨ या डिझाइनसह पत्रिका बनवा</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY QUICK-NAV BAR — Exactly 12 items as in screenshot
═══════════════════════════════════════════════════════════════ */
function CategoryQuickNav() {
  return (
    <section className="border-y border-stone-200/80 bg-white py-3.5 shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1 sm:gap-2 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="group flex flex-col items-center gap-1.5 shrink-0 px-1.5 sm:px-2.5 py-1 rounded-xl transition hover:bg-stone-50"
          >
            <span
              className={`grid size-9 sm:size-10 place-items-center rounded-2xl border text-lg sm:text-xl shadow-2xs transition-all duration-200 group-hover:scale-110 group-hover:shadow-md ${cat.bg}`}
            >
              {cat.icon}
            </span>
            <span className="text-[11px] sm:text-[12px] font-semibold text-[#2b2421] transition group-hover:text-purple-900 group-hover:font-bold whitespace-nowrap">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PREMIUM DESIGNS COLLECTION BAR — Deep royal bar with crown
═══════════════════════════════════════════════════════════════ */
function DesignCollectionBar() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#19041d] via-[#24062a] to-[#19041d] text-white py-3 px-4 sm:px-6 border-b border-white/10 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col xl:flex-row items-center justify-between gap-3.5">
        {/* Left: Traditional Golden Motif + Crown + Heading */}
        <div className="flex items-center gap-3 shrink-0 w-full xl:w-auto">
          <span className="text-amber-400 text-lg hidden sm:inline-block">⚜️</span>
          <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-inner">
            <span className="text-lg sm:text-xl">👑</span>
          </div>
          <div>
            <h2 className="text-[14px] sm:text-[15px] font-bold text-[#ffe8a3] flex items-center gap-2">
              <span>प्रीमियम डिझाईन्स कलेक्शन</span>
            </h2>
            <p className="text-[10.5px] sm:text-[11px] text-[#e0cfd8]">
              तुमच्या प्रत्येक शुभक्षणासाठी खास, आकर्षक आणि मराठी संस्कृतीने सजलेले डिझाईन्स
            </p>
          </div>
        </div>

        {/* Right: 6 Miniature Collection Cards with Golden Border */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto xl:overflow-visible w-full xl:w-auto pb-0.5 xl:pb-0">
          {COLLECTION_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex items-center gap-2 shrink-0 rounded-xl border border-amber-400/35 bg-[#2b0730] p-1 pr-2.5 transition hover:border-amber-400 hover:bg-[#3a0a40] hover:shadow-md hover:shadow-amber-500/20"
            >
              <div className="size-8 sm:size-9 shrink-0 overflow-hidden rounded-lg border border-amber-400/50">
                <img
                  src={item.image}
                  alt={item.label}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-[11px] font-semibold text-white/95 group-hover:text-amber-300 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}

          {/* Next Chevron Button */}
          <Link
            href="/studio"
            className="grid size-8 sm:size-8.5 shrink-0 place-items-center rounded-xl border border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400/30 hover:scale-105 transition shadow-xs"
            aria-label="View all designs"
          >
            <span className="text-sm font-bold">»</span>
          </Link>
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