'use client';

import Link from "next/link";
import { InvitationCard } from "@/components/invitation-card";
import { MasterTemplateCard } from "@/components/master-template-card";
import { LAGN_TEMPLATES } from "@/lib/lagn-templates";
import { Reveal } from "@/components/reveal";
import {
  Eyebrow,
  Icon,
  OrnamentDivider,
  VerifiedBadge,
  type IconName,
} from "@/components/ui";
import { DEFAULT_DESIGN, IMG, TEMPLATES } from "@/lib/arch-data";
import { useLanguage } from "@/context/language-context";
import { uiCopy } from "@/lib/i18n";
import { toDevanagariDigits } from "@/lib/format";
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
        background: linear-gradient(100deg, var(--color-gold-bright) 30%, var(--color-gold-200) 50%, var(--color-gold-bright) 70%);
        background-size: 200% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: hp-shimmer 4.5s linear infinite;
      }
      .hp-shimmer-text-dark {
        background: linear-gradient(100deg, var(--color-gold-200) 30%, var(--color-gold-shimmer) 50%, var(--color-gold-200) 70%);
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

const STATIC_PARTICLES = [
  { left: "12%", bottom: "18%", size: 4, dur: "7s", delay: "0s" },
  { left: "24%", bottom: "42%", size: 3, dur: "8s", delay: "1.2s" },
  { left: "38%", bottom: "25%", size: 5, dur: "6s", delay: "0.5s" },
  { left: "55%", bottom: "48%", size: 4, dur: "9s", delay: "2.1s" },
  { left: "70%", bottom: "15%", size: 3, dur: "7.5s", delay: "1s" },
  { left: "82%", bottom: "35%", size: 4, dur: "6.5s", delay: "2.5s" },
  { left: "91%", bottom: "20%", size: 5, dur: "8.5s", delay: "0.8s" },
  { left: "16%", bottom: "50%", size: 3, dur: "7s", delay: "3s" },
  { left: "46%", bottom: "12%", size: 4, dur: "9s", delay: "1.7s" },
  { left: "64%", bottom: "38%", size: 3, dur: "6s", delay: "2.8s" },
  { left: "78%", bottom: "52%", size: 5, dur: "8s", delay: "0.2s" },
  { left: "88%", bottom: "44%", size: 4, dur: "7.2s", delay: "1.9s" },
];

const MANDALA_POINTS = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  return {
    cx: Number((100 + Math.cos(a) * 92).toFixed(2)),
    cy: Number((100 + Math.sin(a) * 92).toFixed(2)),
  };
});

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
    desc: 'जांभळा वेलवेट, सुवर्ण गणेश सिंहासन, मंदिर कमान, हत्ती व मोर नक्षीदार २४K गोल्ड राजेशाही डिझाईन',
    image: '/art/card_purple_ganesh.jpg',
    badge: 'रॉयल वेलवेट २४K गोल्ड',
    category: 'राजेशाही पत्रिका',
    color: '#3b0b45',
  },
  {
    id: 'lagn-floral-ivory',
    title: 'शुभविवाह',
    subtitle: 'हस्तीदंत सुलेखन व पुष्पहार',
    desc: 'आयव्हरी कॉटन कागद, झेंडू व मोगरा फुलांची कमान, सुवर्ण मुद्रा व अस्सल सुलेखन',
    image: '/art/card_cream_floral.jpg',
    badge: 'अल्ट्रा HD क्लासिक',
    category: 'फुलांची सजावट',
    color: '#854d0e',
  },
  {
    id: 'lagn-couple-arch',
    title: 'साखरपुडा व विवाह',
    subtitle: 'पुष्पकमान नवदंपती फोटो',
    desc: 'नऊवारी साडी व फेटा नवदंपती, लाकडी गुलाब कमान, मुंडावळ्या व सुवर्ण चौकट',
    image: '/art/card_couple.jpg',
    badge: 'अल्ट्रा HD लोकप्रिय',
    category: 'कस्टम जोडी',
    color: '#9a3412',
  },
  {
    id: 'lagn-sakharpuda-emerald',
    title: 'साखरपुडा व विवाह',
    subtitle: 'इम्पेरियल पाचू हिरवा',
    desc: 'पाचू हिरवा पोत, पैठणी पल्लू, पितळी समई, सुवर्ण कमान व गणेश पदक',
    image: '/art/card_emerald.jpg',
    badge: 'अल्ट्रा HD प्रीमियम',
    category: 'राजेशाही',
    color: '#065f46',
  },
  {
    id: 'lagn-peacock-vivaah',
    title: 'शुभविवाह सोहळा',
    subtitle: 'शाही मयूर सुवर्ण मुद्रा',
    desc: 'हॅण्डमेड डेकल-एज कॉटन पेपर, राजेशाही मयूर, सुवर्ण नक्षीकाम व अस्सल आमंत्रण',
    image: '/art/card_peacock.jpg',
    badge: 'अल्ट्रा HD ट्रेंडिंग',
    category: 'मोरपीस',
    color: '#0369a1',
  },
  {
    id: 'wedding-heritage-maroon',
    title: 'शुभविवाह',
    subtitle: 'हेरिटेज मरून वेलवेट',
    desc: 'शाही मरून वेलवेट, २४K सुवर्ण गणेश, मंदिर कमान व पारंपारिक नक्षीदार चौकट',
    image: '/art/card_heritage-maroon_gold.jpg',
    badge: 'अल्ट्रा HD राजेशाही',
    category: 'रॉयल वेलवेट',
    color: '#4a0404',
  },
];

const CATEGORIES = [
  { id: 'wedding', label: 'विवाह पत्रिका', icon: '💍', bg: 'bg-[#fff5f5] text-[#e11d48] border-[#ffe4e6]', href: '/templates?category=wedding' },
  { id: 'haldi', label: 'हळदी समारंभ', icon: '🌿', bg: 'bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]', href: '/templates?category=wedding' },
  { id: 'sakharpuda', label: 'साखरपुडा', icon: '💍', bg: 'bg-[#fefce8] text-[#ca8a04] border-[#fef9c3]', href: '/templates?category=engagement' },
  { id: 'munj', label: 'मुंज / उपनयन', icon: '🪔', bg: 'bg-[#fff7ed] text-[#ea580c] border-[#ffedd5]', href: '/templates?category=puja' },
  { id: 'gruhapravesh', label: 'गृहप्रवेश', icon: '🏠', bg: 'bg-[#f0f9ff] text-[#0284c7] border-[#e0f2fe]', href: '/templates?category=gruhapravesh' },
  { id: 'birthday', label: 'वाढदिवस', icon: '🎂', bg: 'bg-[#fff1f2] text-[#f43f5e] border-[#ffe4e6]', href: '/templates?category=birthday' },
  { id: 'namkaran', label: 'नामकरण', icon: '👶', bg: 'bg-[#fffbeb] text-[#d97706] border-[#fef3c7]', href: '/templates?category=naming' },
  { id: 'shraddha', label: 'क्रियाकर्म', icon: '🪔', bg: 'bg-[#fefce8] text-[#eab308] border-[#fef08a]', href: '/templates?category=puja' },
  { id: 'business_card', label: 'बिझनेस कार्ड', icon: '💳', bg: 'bg-[#fdf2f8] text-[#db2777] border-[#fce7f3]', href: '/templates?category=anniversary' },
  { id: 'festival', label: 'फेस्टिव्हल कार्ड', icon: '🪷', bg: 'bg-[#fae8ff] text-[#c026d3] border-[#f5d0fe]', href: '/templates?category=puja' },
  { id: 'biodata', label: 'बायोडेटा', icon: '📄', bg: 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]', href: '/biodata' },
  { id: 'all_events', label: 'इतर सर्व', icon: '▦', bg: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]', href: '/studio' },
];

const COLLECTION_ITEMS = [
  {
    id: 'c1',
    label: 'पारंपरिक महाराष्ट्रीयन',
    image: '/art/card_purple_ganesh.jpg',
    href: '/templates?category=wedding',
  },
  {
    id: 'c2',
    label: 'आधुनिक क्लासिक',
    image: '/art/card_arch.jpg',
    href: '/templates?category=engagement',
  },
  {
    id: 'c3',
    label: 'रॉयल प्रीमियम',
    image: '/art/card_emerald.jpg',
    href: '/templates?category=wedding',
  },
  {
    id: 'c4',
    label: 'मिनिमल एलिगंट',
    image: '/art/card_cream_floral.jpg',
    href: '/templates?category=biodata',
  },
  {
    id: 'c5',
    label: 'स्टोरी थीम कस्टम',
    image: '/art/card_couple.jpg',
    href: '/templates?category=anniversary',
  },
  {
    id: 'c6',
    label: 'फेस्टिव्हल स्पेशल',
    image: '/art/card_peacock.jpg',
    href: '/templates?category=puja',
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
      <Hero copy={copy} isEn={isEn} isHi={isHi} />
      <CategoryQuickNav />
      <DesignCollectionBar />
      <LagnGallery />
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
  const [sliderPaused, setSliderPaused] = useState(false);

  /* Auto-rotate cards smoothly with pause support */
  useEffect(() => {
    if (sliderPaused) return;
    const id = setInterval(() => {
      setSelectedCardIdx((prev) => (prev + 1) % SHOWCASE_CARDS.length);
    }, 4500);
    return () => clearInterval(id);
  }, [sliderPaused]);

  const prevIdx = (selectedCardIdx - 1 + SHOWCASE_CARDS.length) % SHOWCASE_CARDS.length;
  const nextIdx = (selectedCardIdx + 1) % SHOWCASE_CARDS.length;
  const activeCard = SHOWCASE_CARDS[selectedCardIdx] || SHOWCASE_CARDS[0]!;
  const prevCard = SHOWCASE_CARDS[prevIdx] || SHOWCASE_CARDS[0]!;
  const nextCard = SHOWCASE_CARDS[nextIdx] || SHOWCASE_CARDS[0]!;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fffaf3] via-[#fffdf9] to-[#f9f2e6] border-b border-amber-200/50">
      {/* Traditional Marigold & Mango Leaves Garlands (Toran) */}
      <ToranCornerDecoration position="left" />
      <ToranCornerDecoration position="right" />

      {/* Auspicious Sacred Mandala Watermark */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="hp-anim pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[750px] w-[750px] text-amber-500/[0.04]"
        style={{ animation: "hp-spin 80s linear infinite" }}
      >
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" />
        {MANDALA_POINTS.map((pt, i) => (
          <circle key={i} cx={pt.cx} cy={pt.cy} r="2" fill="currentColor" />
        ))}
      </svg>

      {/* Floating Sparkle Particles (Deterministic to prevent SSR hydration mismatch) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STATIC_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hp-anim absolute block rounded-full bg-amber-400/60"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `hp-spark ${p.dur} ${p.delay} ease-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6 lg:pt-10 lg:pb-16">
        <div className="grid items-center gap-8 lg:gap-8 xl:gap-12 lg:grid-cols-12">
          {/* ── Left Column: Typography, Metrics & CTAs (5 cols) ── */}
          <div className="lg:col-span-5 z-10 animate-fade-up">
            {/* Top Tagline Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-gradient-to-r from-[#fef7ee] via-[#fffdf9] to-[#fcf2e3] px-4 py-1.5 text-xs sm:text-[13px] font-semibold text-amber-950 shadow-2xs">
              <span className="text-amber-500 font-bold animate-pulse">✦</span>
              <span>महाराष्ट्र • ५०+ राजेशाही डिझाईन्स • १.५+ लाख कुटुंबे</span>
            </div>

            {/* Massive Marathi Heading with Royal Aesthetics */}
            <h1 className="mt-4 text-[40px] xs:text-[46px] sm:text-[52px] xl:text-[58px] font-extrabold leading-[1.1] tracking-tight text-[#1c1613]">
              <span className="block font-serif text-[#1c1613]">उत्सव ठरवला?</span>
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-[#691882] via-[#851896] to-[#b32486] bg-clip-text text-transparent drop-shadow-xs">
                  उरलेलं सगळं आमच्यावर.
                </span>
                {/* Golden swoosh underline */}
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
              विवाह पत्रिका, बायोडेटा, मुहूर्त, क्रियाकर्म, व सोहळा डिझाईन्स — सगळं एका विश्वसनीय, आधुनिक आणि मराठी संस्कृतीच्या प्लॅटफॉर्मवर. AI मदतीने काही मिनिटांत तुमची राजेशाही पत्रिका तयार करा.
            </p>

            {/* Trust Social Proof Metrics Row */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-white/80 p-2.5 backdrop-blur-sm shadow-2xs">
                <span className="text-lg">🧡</span>
                <div>
                  <p className="text-[13.5px] font-bold text-[#1c1613] leading-tight">१.५०+ लाख</p>
                  <p className="text-[10px] text-[#78716c]">आनंदी ग्राहक</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-white/80 p-2.5 backdrop-blur-sm shadow-2xs">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-[13.5px] font-bold text-[#1c1613] leading-tight">४.८/५</p>
                  <p className="text-[10px] text-[#78716c]">ग्राहक रेटिंग</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-white/80 p-2.5 backdrop-blur-sm shadow-2xs">
                <span className="text-lg">👑</span>
                <div>
                  <p className="text-[13.5px] font-bold text-[#1c1613] leading-tight">५०+ नमुने</p>
                  <p className="text-[10px] text-[#78716c]">राजेशाही डिझाइन्स</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-white/80 p-2.5 backdrop-blur-sm shadow-2xs">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-[13.5px] font-bold text-[#1c1613] leading-tight">३ मिनिटांत</p>
                  <p className="text-[10px] text-[#78716c]">प्रिंट-रेडी HD</p>
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Primary Glowing Maroon Pill */}
              <Link
                href="/create"
                className="btn-base btn-maroon group relative overflow-hidden text-sm sm:text-[14.5px] font-bold transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                <span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/25" style={{ animation: "hp-shine 3.2s ease-in-out infinite" }} />
                <span className="text-yellow-300">✦</span>
                <span>पत्रिका बनवा — मोफत</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>

              {/* Secondary White Pill: Templates Catalog */}
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-full border border-amber-300/90 bg-ivory-surface px-5 py-3.5 text-sm sm:text-[14.5px] font-bold text-[#1c1613] shadow-xs transition hover:border-amber-500 hover:bg-amber-50/40 whitespace-nowrap"
              >
                <span className="text-amber-500">👑</span>
                <span>सर्व ५०+ डिझाईन्स पाहा</span>
              </Link>

              {/* Tertiary White Pill: Biodata */}
              <Link
                href="/biodata"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-ivory-surface px-5 py-3.5 text-sm sm:text-[14.5px] font-bold text-[#1c1613] shadow-xs transition hover:border-maroon/40 hover:bg-maroon-light whitespace-nowrap"
              >
                <span>📜</span>
                <span>विवाह बायोडेटा</span>
              </Link>
            </div>
          </div>

          {/* ── Right Column: Grand 3D Royal Spotlight Stage & Full Space Slider (7 cols) ── */}
          <div className="lg:col-span-7 relative z-10 animate-fade-up">
            <div
              className="relative mx-auto w-full flex flex-col items-center justify-center"
              onMouseEnter={() => setSliderPaused(true)}
              onMouseLeave={() => setSliderPaused(false)}
            >
              {/* Gentle Warm Gold & Festive Ambient Halo (Blends seamlessly with the warm page background) */}
              <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-gradient-to-tr from-amber-400/20 via-orange-300/10 to-gold/15 blur-3xl" />

              {/* ── 3D Card Spotlight Stage (Full Space, Generous Card Size) ── */}
              <div className="relative w-full flex items-center justify-center min-h-[400px] sm:min-h-[460px] lg:min-h-[500px] px-2 sm:px-4">
                {/* Left Flanking 3D Preview Card (Peeking card for depth) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCardIdx(prevIdx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCardIdx(prevIdx);
                    }
                  }}
                  aria-label={`मागील डिझाईन: ${prevCard.title} — ${prevCard.subtitle}`}
                  className="group/peek absolute left-2 sm:left-6 lg:left-8 xl:left-12 z-10 hidden md:block w-[160px] lg:w-[210px] xl:w-[240px] aspect-[3/4.2] rounded-2xl overflow-hidden border-2 border-amber-300/60 shadow-2xl opacity-40 hover:opacity-90 focus-visible:opacity-90 hover:scale-95 transition-all duration-500 cursor-pointer -rotate-6 -translate-y-2 select-none"
                  style={{ background: prevCard.color }}
                  title={`मागील: ${prevCard.title} — ${prevCard.subtitle}`}
                >
                  <img
                    src={prevCard.image}
                    alt={prevCard.title}
                    className="h-full w-full object-cover object-top transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover/peek:opacity-40 transition" />
                  <div className="absolute bottom-3 inset-x-3 text-left">
                    <p className="text-xs font-bold text-amber-200 line-clamp-1">← {prevCard.title}</p>
                    <p className="text-xs text-white/90 line-clamp-1">{prevCard.subtitle}</p>
                  </div>
                </div>

                {/* Right Flanking 3D Preview Card (Peeking card for depth) */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCardIdx(nextIdx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCardIdx(nextIdx);
                    }
                  }}
                  aria-label={`पुढील डिझाईन: ${nextCard.title} — ${nextCard.subtitle}`}
                  className="group/peek absolute right-2 sm:right-6 lg:right-8 xl:right-12 z-10 hidden md:block w-[160px] lg:w-[210px] xl:w-[240px] aspect-[3/4.2] rounded-2xl overflow-hidden border-2 border-amber-300/60 shadow-2xl opacity-40 hover:opacity-90 focus-visible:opacity-90 hover:scale-95 transition-all duration-500 cursor-pointer rotate-6 -translate-y-2 select-none"
                  style={{ background: nextCard.color }}
                  title={`पुढील: ${nextCard.title} — ${nextCard.subtitle}`}
                >
                  <img
                    src={nextCard.image}
                    alt={nextCard.title}
                    className="h-full w-full object-cover object-top transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover/peek:opacity-40 transition" />
                  <div className="absolute bottom-3 inset-x-3 text-right">
                    <p className="text-xs font-bold text-amber-200 line-clamp-1">{nextCard.title} →</p>
                    <p className="text-xs text-white/90 line-clamp-1">{nextCard.subtitle}</p>
                  </div>
                </div>

                {/* Main Active Spotlight Card (Large, Bold, Centered, Generous Space) */}
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPreviewModalCard(activeCard);
                    }
                  }}
                  aria-label={`प्रिव्ह्यू उघडा: ${activeCard.title} — ${activeCard.subtitle}`}
                  className="group/card relative z-20 w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[390px] lg:max-w-[415px] xl:max-w-[440px] aspect-[3/4.2] overflow-hidden rounded-2xl sm:rounded-3xl border-2 sm:border-[3px] border-amber-400 bg-neutral-900 shadow-[0_25px_60px_-15px_rgba(180,83,9,0.35),0_12px_28px_-8px_rgba(0,0,0,0.22)] transition-all duration-500 hover:scale-[1.02] hover:border-amber-300 cursor-pointer"
                  style={{ background: activeCard.color || "#1f0426" }}
                  onClick={() => setPreviewModalCard(activeCard)}
                >
                  {/* Actual High-Res Design Image */}
                  <img
                    src={activeCard.image}
                    alt={activeCard.title}
                    key={activeCard.id}
                    className="h-full w-full object-cover object-top transition duration-700 ease-out animate-fade-in group-hover/card:scale-105"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                    loading="eager"
                    decoding="async"
                  />

                  {/* Metallic Gloss Reflection Overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/75 via-transparent to-white/20 opacity-70 transition duration-300 group-hover/card:opacity-30" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 inset-x-3.5 sm:top-4 sm:inset-x-4 flex items-center justify-between gap-2 z-20">
                    <span className="rounded-full bg-black/85 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11.5px] font-black text-amber-300 backdrop-blur-md border border-amber-400/70 shadow-md">
                      ✨ {activeCard.badge}
                    </span>
                    <span className="rounded-full bg-white/95 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11.5px] font-bold text-neutral-900 backdrop-blur-md shadow-md border border-amber-200">
                      {activeCard.category}
                    </span>
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3.5 bg-black/60 p-4 opacity-0 transition duration-300 group-hover/card:opacity-100 group-focus-within/card:opacity-100 backdrop-blur-xs">
                    <Link
                      href={`/studio?template=${activeCard.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-6 min-h-[44px] text-sm sm:text-[14.5px] font-black text-neutral-950 shadow-2xl hover:scale-105 transition"
                    >
                      <span>✍️ या डिझाईनसह संपादन करा</span>
                      <span>→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalCard(activeCard);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/25 px-5 min-h-[44px] text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-white/35 transition"
                    >
                      <span>🔍 मोठा HD प्रिव्ह्यू</span>
                    </button>
                  </div>

                  {/* Bottom Card Title Banner */}
                  <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-5 text-left">
                    <p className="font-marathi-display text-lg sm:text-xl xl:text-2xl font-bold text-amber-100 drop-shadow-md">
                      {activeCard.title} — {activeCard.subtitle}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-amber-200/85 line-clamp-2">
                      {activeCard.desc}
                    </p>
                  </div>
                </div>

                {/* Floating Prev Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCardIdx(prevIdx)}
                  aria-label="Previous card"
                  className="absolute left-1 sm:left-3 lg:left-5 z-30 grid size-11 sm:size-12 place-items-center rounded-full bg-white/95 text-amber-950 border border-amber-300 shadow-xl hover:bg-amber-50 hover:scale-110 active:scale-95 transition"
                >
                  <span className="text-xl font-bold leading-none">‹</span>
                </button>

                {/* Floating Next Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCardIdx(nextIdx)}
                  aria-label="Next card"
                  className="absolute right-1 sm:right-3 lg:right-5 z-30 grid size-11 sm:size-12 place-items-center rounded-full bg-white/95 text-amber-950 border border-amber-300 shadow-xl hover:bg-amber-50 hover:scale-110 active:scale-95 transition"
                >
                  <span className="text-xl font-bold leading-none">›</span>
                </button>
              </div>

              {/* ── Bottom Deck: Luxury Thumbnails Bar & Indicator Pill (Full Space) ── */}
              <div className="relative z-20 mt-6 w-full max-w-xl flex flex-col items-center gap-3">
                {/* Miniature Cards Deck */}
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-1 px-2 overflow-x-auto no-scrollbar w-full">
                  {SHOWCASE_CARDS.map((card, idx) => {
                    const isSelected = selectedCardIdx === idx;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedCardIdx(idx)}
                        className={`group/thumb relative h-16 sm:h-20 w-12 sm:w-15 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? "scale-105 border-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.6)] ring-2 ring-amber-300"
                            : "border-amber-200/80 bg-white/60 opacity-60 hover:opacity-100 hover:border-amber-400"
                        }`}
                        title={`${card.title} — ${card.subtitle}`}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {isSelected && (
                          <span className="absolute bottom-0.5 inset-x-0 text-center text-xs font-black uppercase text-amber-300 bg-black/80">
                            सक्रिय
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Counter & Dot Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-amber-950 border border-amber-300/80 shadow-xs backdrop-blur-sm">
                    👑 {toDevanagariDigits(selectedCardIdx + 1)} / {toDevanagariDigits(SHOWCASE_CARDS.length)} · {activeCard.subtitle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {SHOWCASE_CARDS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedCardIdx(idx)}
                        className="group/dot -mx-1.5 grid h-11 w-11 place-items-center rounded-full transition"
                        aria-label={`Go to slide ${idx + 1}`}
                      >
                        <span
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === selectedCardIdx
                              ? "w-7 bg-amber-500 shadow-xs"
                              : "w-2 bg-amber-300/60 group-hover/dot:bg-amber-400"
                          }`}
                        />
                      </button>
                    ))}
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
            className="relative w-full max-w-lg rounded-3xl bg-ivory-surface p-6 shadow-2xl border border-amber-400/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gold ribbon */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gold via-maroon to-gold" />

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
                className="btn-icon bg-ivory-200 text-ink-500"
              >
                ✕
              </button>
            </div>

            {/* Card High-Res Preview */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 shadow-md bg-stone-50 max-h-[360px] flex items-center justify-center">
              <img
                src={previewModalCard.image}
                alt={previewModalCard.title}
                className="max-h-[360px] w-auto object-contain shadow-md rounded-xl"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
                decoding="async"
              />
            </div>

            {previewModalCard.id === 'wedding-royal-purple-ganesh' && (
              <div className="mt-3 rounded-xl bg-gold-soft border border-gold/40 p-2.5 text-xs text-gold-ink">
                <p className="font-semibold text-gold-ink flex items-center gap-1.5">
                  <span>👑</span>
                  <span>राजेशाही लग्नपत्रिका नमुना (Royal Gold Foil Invitation)</span>
                </p>
                <p className="mt-1 text-[11px] text-gold-ink leading-snug">
                  राजकुमारी रेया सिंह (Princess Reya Singh) &amp; राजकुमार विक्रम राव (Prince Vikram Rao) · राज महाल पॅलेस, जयपूर
                </p>
              </div>
            )}

            {/* Features checkmarks */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="text-leaf-600 font-bold">✓</span>
                <span>अस्सल मराठी फॉन्ट व मांडणी</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-leaf-600 font-bold">✓</span>
                <span>३०० DPI हाय-रिझोल्यूशन प्रिंट</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-leaf-600 font-bold">✓</span>
                <span>१-क्लिक व्हॉट्सअॅप व PDF शेअर</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-leaf-600 font-bold">✓</span>
                <span>AI स्मार्ट मजकूर संपादन</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setPreviewModalCard(null)}
                className="btn-base btn-ghost min-h-11 px-4 text-xs"
              >
                बंद करा
              </button>
              <a
                href={previewModalCard.image}
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-outline min-h-11 px-4 text-xs"
              >
                <span>🔍 HD झूम</span>
              </a>
              <Link
                href={`/studio?template=${previewModalCard.id}`}
                className="btn-base btn-maroon min-h-11 px-4 text-xs"
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
    <section className="border-y border-stone-200/80 bg-ivory-surface py-3.5 shadow-2xs">
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
            <span className="text-[11px] sm:text-[12px] font-semibold text-[#2b2421] transition group-hover:text-maroon group-hover:font-bold whitespace-nowrap">
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
    <section className="relative overflow-hidden bg-gradient-to-r from-maroon-deep via-maroon-900 to-maroon-deep text-white py-3 px-4 sm:px-6 border-b border-white/10 shadow-lg">
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
              <div className="size-9 shrink-0 overflow-hidden rounded-lg border border-amber-400/50">
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
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400/30 hover:scale-105 transition shadow-xs"
            aria-label="View all designs"
          >
            <span className="text-sm font-bold">»</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function LagnGallery() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string; templateId: string } | null>(null);

  const filterTabs = [
    { id: "all", label: "सर्व पत्रिका", icon: "✨", count: LAGN_TEMPLATES.length },
    { id: "wedding", label: "विवाह पत्रिका", icon: "💍", count: LAGN_TEMPLATES.filter((t) => t.category === "wedding").length },
    { id: "engagement", label: "साखरपुडा", icon: "✨", count: LAGN_TEMPLATES.filter((t) => t.category === "engagement").length },
    { id: "puja", label: "पूजा व उत्सव", icon: "🪔", count: LAGN_TEMPLATES.filter((t) => t.category === "puja").length },
    { id: "gruhapravesh", label: "वास्तुशांती व गृहप्रवेश", icon: "🏡", count: LAGN_TEMPLATES.filter((t) => t.category === "gruhapravesh").length },
  ];

  const filteredTemplates =
    activeTab === "all"
      ? LAGN_TEMPLATES
      : LAGN_TEMPLATES.filter((t) => t.category === activeTab);

  return (
    <section className="border-b border-[#ead9b8]/80 bg-gradient-to-b from-[#fff8ee] via-white to-[#f4f5fa] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-bold text-gold-ink">
              <span>👑</span>
              <span>महाराष्ट्र लग्न पत्रिका संग्रह २०२६</span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
              फुलांची, मयूर, साखरपुडा, गणेश व पूजा पत्रिका
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-charcoal-soft">
              थेट संपादन करता येणारे २८+ अस्सल महाराष्ट्रीय नमुने — नावे, मुहूर्त, पत्ता व फोटो आपले टाका आणि काही सेकंदांत प्रिंट-रेडी पत्रिका मिळवा.
            </p>
          </div>
          <Link
            href="/studio"
            className="btn-base btn-maroon inline-flex items-center gap-2 px-6 text-sm font-bold transition transform hover:-translate-y-0.5"
          >
            <span>🎨</span>
            <span>कॅनव्हा प्रो स्टुडिओत सर्व डिझाइन्स</span>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-[#ead9b8]/60 pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-maroon text-gold-shimmer shadow-md shadow-maroon-900/20"
                  : "border border-[#ead9b8] bg-ivory-surface text-charcoal-soft hover:border-maroon/50 hover:bg-maroon-light"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-stone-100 text-[#78716c]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => {
            const photoUrl = template.sample?.photoUrl || template.placeholders?.photoUrl;
            return (
              <div
                key={template.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ead9b8] bg-ivory-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gold/60"
              >
                {/* Visual Preview */}
                <div className="relative h-[340px] w-full overflow-hidden bg-[#fffaf3]">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={template.nameMr}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      style={{ imageRendering: "-webkit-optimize-contrast" }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="pointer-events-none origin-top-left scale-[0.62] w-[161%]">
                      <MasterTemplateCard
                        template={template}
                        data={{
                          ...template.sample,
                          blessing: template.defaultBlessing,
                          title: template.defaultTitle,
                        }}
                      />
                    </div>
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      {template.badge || "NEW"}
                    </span>
                  </div>

                  {/* Floating Action Buttons on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/studio?template=${template.id}`}
                        className="inline-flex w-full min-h-11 items-center justify-center gap-1.5 rounded-full bg-maroon text-xs font-bold text-gold-shimmer shadow-lg hover:bg-maroon-rich transition"
                      >
                        <span>✏️</span>
                        <span>स्टुडिओत थेट एडिट करा</span>
                      </Link>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModalImg({
                              url: photoUrl,
                              title: template.nameMr,
                              templateId: template.id,
                            })
                          }
                          className="inline-flex w-full min-h-11 items-center justify-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-charcoal hover:bg-ivory-surface transition"
                        >
                          <span>🔍</span>
                          <span>पूर्ण डिझाईन पहा</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="flex flex-1 flex-col justify-between border-t border-[#ead9b8]/80 p-3.5 bg-gradient-to-b from-white to-[#fffbf5]">
                  <div>
                    <h3 className="font-marathi-display text-[15px] font-bold text-ink-900 group-hover:text-maroon transition leading-snug line-clamp-1">
                      {template.nameMr}
                    </h3>
                    <p className="mt-1 text-xs text-[#78716c] line-clamp-1">
                      {template.descMr}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {template.defaultTitle}
                    </span>
                    <Link
                      href={`/studio?template=${template.id}`}
                      className="font-bold text-maroon hover:text-maroon-rich inline-flex items-center gap-1 group-hover:translate-x-0.5 transition"
                    >
                      <span>वापरा</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Preview Modal */}
        {previewModalImg && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fade-in"
            onClick={() => setPreviewModalImg(null)}
          >
            <div
              className="relative max-h-[92vh] max-w-[560px] w-full overflow-hidden rounded-2xl bg-ivory-surface shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b px-4 py-3 bg-stone-50">
                <p className="font-marathi-display text-sm font-bold text-stone-900 truncate">
                  {previewModalImg.title}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="btn-icon bg-ivory-200 text-ink-500"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-auto max-h-[75vh] p-2 bg-neutral-900 flex justify-center">
                <img
                  src={previewModalImg.url}
                  alt={previewModalImg.title}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  decoding="async"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t p-3 bg-ivory-surface">
                <span className="text-xs text-stone-500">
                  १००% अस्सल महाराष्ट्रीय डिझाईन
                </span>
                <Link
                  href={`/studio?template=${previewModalImg.templateId}`}
                  className="btn-base btn-maroon px-5 text-xs font-bold"
                >
                  या डिझाईनमध्ये पत्रिका बनवा →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
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
            <Link href={p.href} className="group relative block h-full overflow-hidden bg-ivory-50 p-8 transition-all duration-300 hover:bg-ivory-surface">
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
                      <span className="flex w-1/4 items-center justify-center bg-gold/70 text-[9px] font-bold text-maroon-950">
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
          <div ref={ref} className="overflow-hidden rounded-2xl border border-maroon-900/12 bg-ivory-surface shadow-card">
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

        <Reveal delay={100} className="mt-10 grid gap-4 rounded-2xl border border-gold-500/30 bg-ivory-surface p-6 sm:grid-cols-3">
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
            <figure className="group relative h-full rounded-2xl border border-maroon-900/10 bg-ivory-surface p-7 shadow-card transition-all duration-500 hover:-translate-y-2 hover:border-gold-500/40 hover:shadow-glow">
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
              <div className={`overflow-hidden rounded-2xl border transition-all duration-400 ${isOpen ? "border-gold-500/60 bg-ivory-surface shadow-luxe" : "border-maroon-900/10 bg-white/70 hover:border-gold-500/40"
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
            {STATIC_PARTICLES.slice(0, 8).map((p, i) => (
              <span
                key={i}
                className="hp-anim absolute rounded-full bg-gold-300"
                style={{
                  left: p.left,
                  bottom: p.bottom,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animation: `hp-spark ${p.dur} ${p.delay} ease-out infinite`,
                }}
              />
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