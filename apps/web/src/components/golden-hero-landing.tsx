'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface GoldenHeroLandingProps {
  onStartEditing?: () => void;
  onPreviewDesigns?: () => void;
  onFullscreenPreview?: () => void;
  isEn?: boolean;
}

/* ─────────────────────────── Decorative Atoms ─────────────────────────── */

function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true">
      <path
        d="M20 0 L22.6 17.4 L40 20 L22.6 22.6 L20 40 L17.4 22.6 L0 20 L17.4 17.4 Z"
        fill="#f7e7b0"
      />
      <circle cx="20" cy="20" r="2.6" fill="#fffbe8" />
    </svg>
  );
}

function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <path d="M8 64 C8 26 26 8 64 8" stroke="#d4af37" strokeWidth="1.5" />
      <path d="M8 46 C8 22 22 8 46 8" stroke="#e9cf8a" strokeWidth="0.7" opacity="0.6" />
      <path
        d="M8 1.5 L9.8 6.2 L14.5 8 L9.8 9.8 L8 14.5 L6.2 9.8 L1.5 8 L6.2 6.2 Z"
        fill="#f2dd9d"
      />
      <circle cx="64" cy="8" r="1.6" fill="#d4af37" />
      <circle cx="8" cy="64" r="1.6" fill="#d4af37" />
    </svg>
  );
}

const STATS = [
  { icon: '👑', value: '५००+', label: 'रॉयल नमुने', sub: 'प्रीमियम डिझाईन्स', href: '/studio?style=royal' },
  { icon: '🛡️', value: '३ मिनिटे', label: 'पत्रिका तयार', sub: 'WYSIWYG १००% प्रिंट रेडी', href: '/studio?mode=invitation' },
  { icon: '⚡', value: '१००%', label: 'प्रिंट-रेडी', sub: 'उच्च प्रतीचे रिझोल्यूशन', href: '/studio' },
];

const MARQUEE = [
  'शुभ विवाह',
  'मंगल मुहूर्त',
  'हळद समारंभ',
  'साखरपुडा',
  'मेहंदी संगीत',
  'सत्कार व रिसेप्शन',
  'नामकरण सोहळा',
  'गृहप्रवेश',
  'सत्यनारायण पूजा',
  'वाढदिवस सोहळा',
];

const PETALS = [
  { left: '12%', size: 11, delay: '0s', dur: '8.5s' },
  { left: '32%', size: 9, delay: '2.5s', dur: '10.5s' },
  { left: '54%', size: 12, delay: '4.2s', dur: '9.2s' },
  { left: '72%', size: 8, delay: '1.2s', dur: '11.2s' },
  { left: '88%', size: 10, delay: '3.6s', dur: '9.8s' },
];

interface HeroSlide {
  src: string;
  alt: string;
  title: string;
  badge: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/art/hero_slide_purple.jpg',
    alt: 'रॉयल वेलवेट जांभळी गणेश लग्नपत्रिका, समई, मोतिया फुले व पारंपरिक सजावट',
    title: 'रॉयल पर्पल गणेश',
    badge: '👑 ट्रेंडिंग',
  },
  {
    src: '/art/hero_slide_couple.jpg',
    alt: 'शाही नवदांपत्य शुभविवाह पत्रिका, पैठणी, शेला, फेटा व फुलांचा मंडप',
    title: 'शुभविवाह दांपत्य',
    badge: '💖 लोकप्रिय',
  },
  {
    src: '/art/hero_slide_emerald.jpg',
    alt: 'इम्पेरियल एमराल्ड ग्रीन वेलवेट लग्नपत्रिका व २४ कॅरेट गोल्ड एम्बॉसिंग',
    title: 'इम्पेरियल एमराल्ड',
    badge: '✨ राजेशाही',
  },
  {
    src: '/art/hero_slide_peacock.jpg',
    alt: 'रॉयल मयूर आयव्हरी लग्नपत्रिका, मोरपीस व पारंपरिक पितळी दिवा',
    title: 'रॉयल मयूर आयव्हरी',
    badge: '🪶 क्लासिक',
  },
  {
    src: '/art/hero_slide_maroon.jpg',
    alt: 'हेरिटेज मरून वेलवेट गणेश लग्नपत्रिका, नक्षीदार बॉर्डर व पितळी समई',
    title: 'हेरिटेज मरून गोल्ड',
    badge: '🌟 पारंपरिक',
  },
];

/* ─────────────────────────── Component ─────────────────────────── */

export function GoldenHeroLanding({
  onStartEditing,
  onPreviewDesigns,
  onFullscreenPreview,
  isEn,
}: GoldenHeroLandingProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -4, y: px * 5 });
  }, []);

  const handleLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <section
      lang={isEn ? 'en' : 'mr'}
      className="relative w-full overflow-hidden bg-[#faf6ee] py-3.5 sm:py-5 lg:py-6"
    >
      <style>{`
        @keyframes ghlTwinkle { 0%,100% { opacity:.2; transform: scale(.7) rotate(0deg); } 50% { opacity:1; transform: scale(1.1) rotate(18deg); } }
        @keyframes ghlPetal { 0% { transform: translate3d(0,-20px,0) rotate(5deg); opacity:0; } 15% { opacity:.85; } 85% { opacity:.65; } 100% { transform: translate3d(-35px,440px,0) rotate(140deg); opacity:0; } }
        @keyframes ghlMarquee { to { transform: translateX(-50%); } }
        @keyframes ghlMandalaSpin { to { transform: rotate(360deg); } }

        .ghl-twinkle { animation: ghlTwinkle 3s ease-in-out infinite; }
        .ghl-petal { animation: ghlPetal linear infinite; }
        .ghl-marquee-track { animation: ghlMarquee 32s linear infinite; width: max-content; }
        .ghl-mandala { animation: ghlMandalaSpin 120s linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ghl-twinkle, .ghl-petal, .ghl-marquee-track, .ghl-mandala { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
        {/* ════════════ Master Jewel Banner Container ════════════ */}
        <div className="relative w-full overflow-hidden rounded-[22px] sm:rounded-[30px] border border-[#d4af37]/45 bg-[#0d0312] shadow-[0_24px_70px_-15px_rgba(35,5,40,0.65),0_0_35px_rgba(212,175,55,0.18)] transition-all duration-300">

          {/* ── Ambient Radial Atmosphere Lighting ── */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/3 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-700/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-20 h-[420px] w-[420px] rounded-full bg-amber-600/20 blur-3xl" />

          {/* Inner hairline gold frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2 sm:inset-3 z-30 rounded-[18px] sm:rounded-[24px] border border-[#d4af37]/25"
          />

          {/* Corner gold flourishes */}
          <CornerFlourish className="pointer-events-none absolute left-2.5 top-2.5 z-30 w-7 sm:w-10 opacity-75" />
          <CornerFlourish className="pointer-events-none absolute right-2.5 top-2.5 z-30 w-7 sm:w-10 rotate-90 opacity-75" />
          <CornerFlourish className="pointer-events-none absolute bottom-2.5 right-2.5 z-30 w-7 sm:w-10 rotate-180 opacity-75" />
          <CornerFlourish className="pointer-events-none absolute bottom-2.5 left-2.5 z-30 w-7 sm:w-10 -rotate-90 opacity-75" />

          {/* ── HYBRID GRID: Left SVG/Graphic Text + Right Photorealistic Base ── */}
          <div className="relative grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[390px] sm:min-h-[430px] md:min-h-[460px] lg:min-h-[480px]">

            {/* ════════════ LEFT COLUMN: Graphic Text Effects & CTAs (7 cols) ════════════ */}
            <div className="md:col-span-7 z-10 flex flex-col justify-center p-5 sm:p-7 md:p-6 lg:p-9 xl:p-12">

              {/* Auspicious Eyebrow (Normal tracking for unbroken Devanagari) */}
              <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-amber-300/90 mb-2 sm:mb-2.5">
                <span aria-hidden="true" className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent via-amber-400 to-amber-300" />
                <span className="text-amber-400 text-[10px]">❖</span>
                <span className="text-amber-200">॥ शुभं भवतु ॥</span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-200">विवाह</span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-200">मुहूर्त</span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-200">संस्कार</span>
                <span aria-hidden="true" className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent via-amber-400 to-amber-300" />
              </div>

              {/* 3D 24K Embossed Gold Foil Title with Specular Starlight Flare */}
              <div className="relative mb-2 sm:mb-3 max-w-[660px]">
                {/* 4-Point Golden Starlight Lens Flare */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-3 -top-3 sm:-left-4 sm:-top-4 size-10 sm:size-12 ghl-twinkle"
                >
                  <svg viewBox="0 0 40 40" fill="none" className="w-full h-full drop-shadow-[0_0_16px_rgba(251,191,36,0.95)]">
                    <path d="M20 0 L22.5 17.5 L40 20 L22.5 22.5 L20 40 L17.5 22.5 L0 20 L17.5 17.5 Z" fill="url(#heroStarGlow)" />
                    <circle cx="20" cy="20" r="3.2" fill="#ffffff" />
                    <defs>
                      <radialGradient id="heroStarGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="35%" stopColor="#fef08a" />
                        <stop offset="70%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                {/* Master 3D Gold Embossed Typography Graphic (Retina 2x Crisp) */}
                <div className="relative h-11 xs:h-12 sm:h-15 md:h-17 lg:h-20 xl:h-[84px] w-full select-none">
                  <Image
                    src="/art/golden_hero_title_2x.png"
                    alt="पत्रिका बनवा — हस्तकलेचा ठसा"
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 660px"
                    className="object-contain object-left pointer-events-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]"
                  />
                </div>
                <h1 className="sr-only">पत्रिका बनवा — हस्तकलेचा ठसा</h1>
              </div>

              {/* Sub-proclamation */}
              <p className="italic text-xs sm:text-sm text-[#f0d98a] mb-2 sm:mb-3">
                — तुमच्या शुभप्रसंगासाठी अस्सल मराठी डिझाईन
              </p>

              {/* Real Crisp Devanagari Description (Selectable & Legible on all Screen Sizes) */}
              <p className="text-xs sm:text-sm lg:text-[14px] xl:text-[15px] leading-relaxed text-[#ede4d3]/95 max-w-xl mb-3 sm:mb-4 font-normal">
                रॉयल नमुना निवडा, नावे व मुहूर्त भरा — काहीच मिनिटांत तयार करा तुमची विवाह पत्रिका, नावाची पत्रिका, बायोडाटा किंवा मुहूर्त-पत्रिका. अस्सल मराठी बाणा, उच्च दर्जाची प्रिंट-रेडी फाईल.
              </p>

              {/* Golden Ornamental Hairline Divider */}
              <div className="flex items-center gap-3 my-2 sm:my-2.5 max-w-lg">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                <span className="text-amber-400 text-xs">❖</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
              </div>

              {/* Real Feature Metrics Row (3 Columns) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mb-4 sm:mb-5">
                {STATS.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="group/stat flex items-center gap-1.5 sm:gap-2.5 transition-transform hover:scale-105"
                  >
                    <span className="text-base sm:text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">{s.icon}</span>
                    <div>
                      <p className="text-[12px] sm:text-[13px] md:text-[14px] font-bold text-amber-300 leading-tight group-hover/stat:text-amber-200">
                        {s.value}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-stone-200/90 leading-tight font-medium">
                        {s.label}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Real Interactive Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Button 1: Glowing 24K Gold Pill */}
                <Link
                  href="/studio/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onFullscreenPreview?.()}
                  className="group relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-[#f8e7ae]/80 px-4.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[13.5px] font-bold text-[#3a0a12] shadow-[0_10px_30px_-8px_rgba(212,175,55,0.55),inset_0_1px_0_rgba(255,255,255,0.55)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_40px_-8px_rgba(212,175,55,0.7)]"
                  style={{ background: 'linear-gradient(155deg,#fbf0c4 0%,#f0d489 28%,#d9ae47 55%,#b98a24 82%,#a8771b 100%)' }}
                >
                  <span aria-hidden="true" className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span aria-hidden="true" className="text-[#7a4a08]">✦</span>
                  <span>नवीन डिझाईन पूर्ण स्क्रीन उघडा</span>
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>

                {/* Button 2: Cream Pill with Gold Border */}
                <Link
                  href="/studio"
                  onClick={() => onStartEditing?.()}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-400 bg-gradient-to-b from-[#fffefc] to-[#fef3c7] px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-bold text-[#1c1917] shadow-sm transition-all duration-200 hover:bg-[#fef08a] hover:scale-105 whitespace-nowrap"
                >
                  <span>✍️</span>
                  <span>संपादन सुरू करा</span>
                  <span>→</span>
                </Link>

                {/* Button 3: Dark Translucent Glass Pill */}
                <Link
                  href="/studio?category=wedding"
                  onClick={() => onPreviewDesigns?.()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-[#16061d]/85 px-3.5 sm:px-4.5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold text-amber-200 transition-all duration-200 hover:border-amber-400 hover:bg-[#20082a] hover:text-white whitespace-nowrap"
                >
                  <span>👁</span>
                  <span>नमुना डिझाईन पहा</span>
                </Link>
              </div>

              {/* Free notice */}
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#efe3c8]/60">
                <span aria-hidden="true" className="text-[9px] text-[#d4af37]/80">✦</span>
                नोंदणी मोफत — क्रेडिट कार्ड आवश्यक नाही
              </p>
            </div>

            {/* ════════════ RIGHT COLUMN: Photorealistic Image Base Staging (5 cols) ════════════ */}
            <div
              ref={stageRef}
              onMouseMove={handleMove}
              onMouseLeave={() => {
                handleLeave();
                setIsPaused(false);
              }}
              onMouseEnter={() => setIsPaused(true)}
              className="md:col-span-5 relative w-full min-h-[290px] sm:min-h-[350px] md:min-h-full overflow-hidden flex items-center justify-end select-none"
            >
              {/* Sacred rotating mandala background */}
              <div aria-hidden="true" className="ghl-mandala pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                <svg viewBox="0 0 400 400" className="h-auto w-[380px] sm:w-[480px]" fill="none" stroke="#e9cf8a" strokeWidth="0.8">
                  <circle cx="200" cy="200" r="150" />
                  <circle cx="200" cy="200" r="104" strokeDasharray="3 6" />
                  <circle cx="200" cy="200" r="62" />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <g key={i} transform={`rotate(${i * 15} 200 200)`}>
                      <ellipse cx="200" cy="76" rx="7" ry="24" />
                      <circle cx="200" cy="40" r="2.4" fill="#e9cf8a" stroke="none" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Ultra HD 2x Multi-Photo Rotating Staging Base */}
              <div
                className="relative w-full h-full min-h-[290px] sm:min-h-[350px] md:min-h-full"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                {HERO_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.src}
                    aria-hidden={idx !== currentSlide}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      priority={idx === 0}
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover object-center pointer-events-none select-none"
                    />
                  </div>
                ))}

                {/* Seamless Left Fade Gradient (Matches Left Dark Velvet Background Exactly) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 sm:w-24 md:w-28 lg:w-36 bg-gradient-to-r from-[#0d0312] to-transparent hidden md:block"
                />

                {/* Mobile Top Fade Gradient */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 bg-gradient-to-b from-[#0d0312] to-transparent md:hidden"
                />
              </div>

              {/* Falling Golden Petals Micro-Animation */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-25 overflow-hidden">
                {PETALS.map((p, i) => (
                  <span
                    key={i}
                    className="ghl-petal absolute top-0 block"
                    style={{
                      left: p.left,
                      width: p.size,
                      height: p.size * 1.25,
                      borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
                      background: 'radial-gradient(circle at 30% 30%, #fbd27a, #e0972e 70%)',
                      boxShadow: '0 0 8px rgba(212,175,55,0.4)',
                      animationDelay: p.delay,
                      animationDuration: p.dur,
                    }}
                  />
                ))}
                <Sparkle className="ghl-twinkle absolute right-[14%] top-[16%] w-5" style={{ animationDelay: '0.6s' }} />
                <Sparkle className="ghl-twinkle absolute bottom-[18%] left-[12%] w-4" style={{ animationDelay: '1.8s' }} />
              </div>

              {/* Interactive Theme Rotation Pill Controls */}
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 z-30 flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-400/35 bg-[#0d0312]/85 px-2.5 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  aria-label="मागील डिझाईन"
                  className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-100 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold">‹</span>
                </button>

                <div className="flex items-center gap-1 sm:gap-1.5 px-0.5 sm:px-1">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.src}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      aria-label={slide.title}
                      title={slide.title}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentSlide
                          ? 'w-5 sm:w-6 bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.85)]'
                          : 'w-1.5 bg-white/35 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  aria-label="पुढील डिझाईन"
                  className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-100 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold">›</span>
                </button>

                <span className="hidden sm:inline-block border-l border-amber-400/20 pl-2 text-[11px] font-medium text-amber-200/90 tracking-normal">
                  {HERO_SLIDES[currentSlide]?.title ?? ''}
                </span>
              </div>
            </div>
          </div>

          {/* ════════════ Auspicious Ribbon Marquee (Normal tracking for crisp Devanagari) ════════════ */}
          <div className="relative z-10 overflow-hidden border-t border-[#d4af37]/25 bg-[#14020a]/80 backdrop-blur-xs">
            <div className="ghl-marquee-track flex items-center whitespace-nowrap py-2.5 will-change-transform">
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex items-center">
                  {MARQUEE.map((w) => (
                    <span key={`${copy}-${w}`} className="flex items-center">
                      <span className="px-4 text-[11.5px] font-medium text-[#d4af37]/85 tracking-normal">
                        {w}
                      </span>
                      <span aria-hidden="true" className="text-[8px] text-[#d4af37]/45">❖</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
