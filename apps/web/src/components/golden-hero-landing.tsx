'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoldenHeroTitleSvg } from './golden-hero-title-svg';

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
  { icon: '👑', value: '५००+', label: 'रॉयल नमुने', sub: 'प्रीमियम डिझाईन्स', href: '/templates?category=wedding' },
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
    src: '/art/card_purple_ganesh.jpg',
    alt: 'रॉयल वेलवेट जांभळी गणेश लग्नपत्रिका, समई, मोतिया फुले व पारंपरिक सजावट',
    title: 'रॉयल पर्पल गणेश',
    badge: '👑 ट्रेंडिंग',
  },
  {
    src: '/art/card_couple.jpg',
    alt: 'शाही नवदांपत्य शुभविवाह पत्रिका, पैठणी, शेला, फेटा व फुलांचा मंडप',
    title: 'शुभविवाह दांपत्य',
    badge: '💖 लोकप्रिय',
  },
  {
    src: '/art/card_emerald.jpg',
    alt: 'इम्पेरियल एमराल्ड ग्रीन वेलवेट लग्नपत्रिका व २४ कॅरेट गोल्ड एम्बॉसिंग',
    title: 'इम्पेरियल एमराल्ड',
    badge: '✨ राजेशाही',
  },
  {
    src: '/art/card_peacock.jpg',
    alt: 'रॉयल मयूर आयव्हरी लग्नपत्रिका, मोरपीस व पारंपरिक पितळी दिवा',
    title: 'रॉयल मयूर आयव्हरी',
    badge: '🪶 क्लासिक',
  },
  {
    src: '/art/card_heritage-maroon_gold.jpg',
    alt: 'हेरिटेज मरून वेलवेट गणेश लग्नपत्रिका, नक्षीदार बॉर्डर व पितळी समई',
    title: 'हेरिटेज मरून गोल्ड',
    badge: '🌟 पारंपरिक',
  },
  {
    src: '/art/card_cream_floral.jpg',
    alt: 'हस्तीदंत फुलांची सुलेखन लग्नपत्रिका, झेंडू व मोगरा पुष्पहार',
    title: 'हस्तीदंत पुष्प सुलेखन',
    badge: '🌸 क्लासिक',
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

      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10">
        {/* ════════════ Master Jewel Banner Container ════════════ */}
        <div className="relative w-full overflow-hidden rounded-[22px] sm:rounded-[30px] border border-[#d4af37]/45 bg-[#0d0312] shadow-[0_24px_70px_-15px_rgba(35,5,40,0.65),0_0_35px_rgba(212,175,55,0.18)] transition-all duration-300">

          {/* ── Ambient Radial Atmosphere Lighting ── */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/3 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-20 h-[420px] w-[420px] rounded-full bg-amber-600/20 blur-3xl" />

          {/* Inner hairline gold frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2 sm:inset-3 z-30 rounded-[18px] sm:rounded-[24px] border border-[#d4af37]/25"
          />

          {/* Corner gold flourishes */}
          <CornerFlourish className="pointer-events-none absolute left-2 top-2 sm:left-3 sm:top-3 z-30 w-8 sm:w-11 opacity-90" />
          <CornerFlourish className="pointer-events-none absolute right-2 top-2 sm:right-3 sm:top-3 z-30 w-8 sm:w-11 rotate-90 opacity-90" />
          <CornerFlourish className="pointer-events-none absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-30 w-8 sm:w-11 rotate-180 opacity-90" />
          <CornerFlourish className="pointer-events-none absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-30 w-8 sm:w-11 -rotate-90 opacity-90" />

          {/* ── HYBRID: Left Text Part (50%) + Right Image Part (50%) ── */}
          <div className="relative flex flex-col md:flex-row items-stretch min-h-[420px] sm:min-h-[460px] md:min-h-[490px] lg:min-h-[520px]">

            {/* ════════════ LEFT COLUMN: Graphic Text Effects & CTAs (50%) ════════════ */}
            <div className="w-full md:w-1/2 z-10 flex flex-col justify-center p-6 sm:p-8 md:p-7 lg:p-9 xl:p-12 shrink-0">

              {/* Auspicious Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 px-3.5 sm:px-4.5 py-1 text-xs sm:text-[13px] font-semibold text-amber-200 backdrop-blur-md mb-2.5 sm:mb-3 w-fit shadow-[0_2px_14px_-3px_rgba(245,158,11,0.3)]">
                <span className="text-amber-400 text-[11px] animate-pulse">❖</span>
                <span className="text-amber-100 tracking-wide font-medium">॥ शुभं भवतु ॥</span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-200/90">विवाह</span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-200/90">मुहूर्त</span>
                <span className="text-amber-400/60">•</span>
                <span className="text-amber-200/90">संस्कार</span>
                <span className="text-amber-400 text-[11px] animate-pulse">❖</span>
              </div>

              {/* 3D 24K Embossed Gold Foil Title with Specular Starlight Flare (Pure Vector SVG & Font) */}
              <div className="relative mb-2 sm:mb-3 max-w-[680px] w-full">
                <GoldenHeroTitleSvg />
                <h1 className="sr-only">पत्रिका बनवा — हस्तकलेचा ठसा</h1>
              </div>

              {/* Sub-proclamation */}
              <p className="italic text-xs sm:text-sm lg:text-[14.5px] font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#ffe7a0] via-[#f7d070] to-[#e4b33c] mb-2 sm:mb-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                — तुमच्या शुभप्रसंगासाठी अस्सल मराठी डिझाईन
              </p>

              {/* Real Crisp Devanagari Description (Selectable & Legible on all Screen Sizes) */}
              <p className="text-xs sm:text-sm lg:text-[14px] xl:text-[15px] leading-relaxed text-[#ede4d3]/95 max-w-2xl mb-3.5 sm:mb-4.5 font-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                रॉयल नमुना निवडा, नावे व मुहूर्त भरा — काहीच मिनिटांत तयार करा तुमची <span className="text-amber-200/90 font-medium">विवाह पत्रिका</span>, <span className="text-amber-200/90 font-medium">नावाची पत्रिका</span>, <span className="text-amber-200/90 font-medium">बायोडेटा</span> किंवा <span className="text-amber-200/90 font-medium">मुहूर्त-पत्रिका</span>. अस्सल मराठी बाणा, उच्च दर्जाची प्रिंट-रेडी फाईल.
              </p>

              {/* Golden Ornamental Hairline Divider */}
              <div className="flex items-center gap-3 my-2.5 sm:my-3 max-w-xl lg:max-w-2xl">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                <span className="text-amber-400 text-xs drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]">❖</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              </div>

              {/* Real Feature Metrics Row (Jewel Frosted Cards) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl lg:max-w-2xl mb-4 sm:mb-5">
                {STATS.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="group/stat relative flex flex-col justify-center rounded-2xl border border-amber-400/25 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-2.5 sm:p-3 backdrop-blur-md shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:scale-105 hover:border-amber-300/60 hover:bg-white/[0.1] hover:shadow-[0_12px_28px_-6px_rgba(212,175,55,0.25)]"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="text-base sm:text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">{s.icon}</span>
                      <p className="text-[13px] sm:text-[15px] md:text-[16px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 leading-tight">
                        {s.value}
                      </p>
                    </div>
                    <p className="text-[10.5px] sm:text-[11.5px] text-stone-200/90 leading-tight font-medium">
                      {s.label}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Real Interactive Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {/* Button 1: Glowing 24K Gold Pill */}
                <Link
                  href="/studio/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onFullscreenPreview?.()}
                  className="group relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border border-[#fef08a] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-[13.5px] font-bold text-[#2a1002] shadow-[0_12px_32px_-6px_rgba(212,175,55,0.65),inset_0_1px_1px_rgba(255,255,255,0.85)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_42px_-6px_rgba(212,175,55,0.85)]"
                  style={{ background: 'linear-gradient(135deg, #fff1b8 0%, #f7d070 28%, #d99f28 60%, #b87c14 100%)' }}
                >
                  <span aria-hidden="true" className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span aria-hidden="true" className="text-[#683c05] text-[13px]">✦</span>
                  <span>नवीन डिझाईन पूर्ण स्क्रीन उघडा</span>
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>

                {/* Button 2: Cream Pearl Pill with Gold Border */}
                <Link
                  href="/studio"
                  onClick={() => onStartEditing?.()}
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-300/80 bg-gradient-to-b from-[#ffffff] via-[#fffdf5] to-[#fef7da] px-4.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-bold text-[#1c1917] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-200 hover:bg-[#fef08a] hover:border-amber-400 hover:scale-105 whitespace-nowrap"
                >
                  <span>✍️</span>
                  <span>संपादन सुरू करा</span>
                  <span>→</span>
                </Link>

                {/* Button 3: Dark Translucent Glass Pill */}
                <Link
                  href="/templates?category=wedding"
                  onClick={() => onPreviewDesigns?.()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-[#16061d]/85 px-4 sm:px-4.5 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold text-amber-200/95 backdrop-blur-md shadow-sm transition-all duration-200 hover:border-amber-300 hover:bg-[#23092e] hover:text-white whitespace-nowrap hover:scale-105"
                >
                  <span>👁</span>
                  <span>नमुना डिझाईन पहा</span>
                </Link>
              </div>

              {/* Free notice */}
              <div className="mt-3.5 flex items-center gap-2 text-[11.5px] text-[#efe3c8]/70">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] border border-emerald-500/40 font-bold">✓</span>
                <span>नोंदणी मोफत — क्रेडिट कार्ड आवश्यक नाही</span>
                <span className="text-amber-400/40">•</span>
                <span className="text-[#efe3c8]/60">१००% प्रिंट-रेडी फाइल</span>
              </div>
            </div>

            {/* ════════════ RIGHT COLUMN: Photorealistic Image Base Staging (50%) ════════════ */}
            <div
              ref={stageRef}
              onMouseMove={handleMove}
              onMouseLeave={() => {
                handleLeave();
                setIsPaused(false);
              }}
              onMouseEnter={() => setIsPaused(true)}
              className="w-full md:w-1/2 relative min-h-[320px] sm:min-h-[380px] md:min-h-full overflow-hidden flex items-center justify-end select-none shrink-0"
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
                      sizes="(max-width: 768px) 100vw, 50vw"
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
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 z-30 flex items-center gap-1 sm:gap-1.5 rounded-full border border-amber-400/35 bg-[#0d0312]/85 px-1 sm:px-1.5 py-1 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  aria-label="मागील डिझाईन"
                  className="grid h-11 w-11 place-items-center rounded-full text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-100 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold">‹</span>
                </button>

                <div className="flex items-center">
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
                      className="group/dot -mx-1 grid h-11 w-11 place-items-center rounded-full transition"
                    >
                      <span
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentSlide
                            ? 'w-5 sm:w-6 bg-gradient-to-r from-amber-400 to-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.85)]'
                            : 'w-1.5 bg-white/35 group-hover/dot:bg-white/70'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  aria-label="पुढील डिझाईन"
                  className="grid h-11 w-11 place-items-center rounded-full text-amber-200/80 hover:bg-amber-500/20 hover:text-amber-100 transition-colors"
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
