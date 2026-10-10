'use client';

import React, { useId } from 'react';

interface GoldenHeroTitleSvgProps {
  className?: string;
  leadText?: string;
  accentText?: string;
}

export function GoldenHeroTitleSvg({
  className = '',
  leadText = 'पत्रिका बनवा —',
  accentText = 'हस्तकलेचा ठसा',
}: GoldenHeroTitleSvgProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const url = (k: string) => `url(#${uid}-${k})`;

  // ── Layout constants (compact, unified royal typography) ──
  const VW = 680, VH = 136, LEAD_X = 46, ACCENT_X = 368, BASE_Y = 78, FS = 50;

  /** Renders both phrases with natural royal spacing — used per bevel layer & mask */
  const TitlePair = (p: React.SVGProps<SVGTextElement>) => (
    <>
      <text x={LEAD_X} y={BASE_Y} textAnchor="start" {...p}>{leadText}</text>
      <text x={ACCENT_X} y={BASE_Y} textAnchor="start" {...p}>{accentText}</text>
    </>
  );

  return (
    <div className={`relative w-full max-w-[680px] select-none pointer-events-none ${className}`}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Noto+Serif+Devanagari:wght@600;700;800&family=Yatra+One&display=swap');
            .ghs-title-text {
              font-family: 'Rozha One','Noto Serif Devanagari','Yatra One','Tiro Devanagari Marathi',Georgia,serif;
              font-feature-settings: 'kern' 1,'liga' 1,'calt' 1;
              text-rendering: optimizeLegibility;
            }
            .ghs-shine { animation: ghsSweep 6s cubic-bezier(.4,0,.2,1) 1.3s infinite; }
            .ghs-tw { transform-box: fill-box; transform-origin: center; animation: ghsTwinkle 3.4s ease-in-out infinite; }
            .ghs-tw-b { animation-duration: 2.6s; animation-delay: .9s; }
            .ghs-tw-c { animation-duration: 4.2s; animation-delay: 1.7s; }
            .ghs-dust { animation: ghsFloat 4.6s ease-in-out infinite; }
            .ghs-glow { animation: ghsGlow 5.2s ease-in-out infinite; }
            .ghs-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ghsDraw 1.6s .5s cubic-bezier(.65,0,.35,1) forwards; }
            @keyframes ghsSweep { 0% { transform: translateX(0) skewX(-14deg); } 62%,100% { transform: translateX(880px) skewX(-14deg); } }
            @keyframes ghsTwinkle { 0%,100% { transform: scale(1) rotate(0deg); opacity: .95; } 50% { transform: scale(.8) rotate(9deg); opacity: .65; } }
            @keyframes ghsFloat { 0%,100% { transform: translateY(0); opacity: .9; } 50% { transform: translateY(-5px); opacity: .45; } }
            @keyframes ghsGlow { 0%,100% { opacity: .16; } 50% { opacity: .3; } }
            @keyframes ghsDraw { to { stroke-dashoffset: 0; } }
            @media (prefers-reduced-motion: reduce) {
              .ghs-shine,.ghs-tw,.ghs-dust,.ghs-glow { animation: none; }
              .ghs-draw { animation: none; stroke-dashoffset: 0; }
            }
          `}</style>

          {/* ── Ambient + cast shadow ── */}
          <filter id={id('shadow')} x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.95" />
            <feDropShadow dx="0" dy="1" stdDeviation="7" floodColor="#f59e0b" floodOpacity="0.45" />
          </filter>

          {/* ── 24K champagne foil face (hot-band at 54%) ── */}
          <linearGradient id={id('face')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffdf0" />
            <stop offset="10%" stopColor="#fef08a" />
            <stop offset="22%" stopColor="#fde047" />
            <stop offset="38%" stopColor="#eab308" />
            <stop offset="48%" stopColor="#ca8a04" />
            <stop offset="54%" stopColor="#fffdf2" />
            <stop offset="66%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#fef08a" />
            <stop offset="90%" stopColor="#d97706" />
            <stop offset="96%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#3d1703" />
          </linearGradient>

          {/* ── Rim-light stroke ── */}
          <linearGradient id={id('rim')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#b45309" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0.9" />
          </linearGradient>

          {/* ── Swash ribbon metal (drifting luster via SMIL) ── */}
          <linearGradient id={id('swash')} gradientUnits="userSpaceOnUse" x1="360" y1="120" x2="660" y2="85">
            <stop offset="0%" stopColor="#7a3a08" />
            <stop offset="18%" stopColor="#c8860f" />
            <stop offset="38%" stopColor="#f6d878" />
            <stop offset="55%" stopColor="#fffdf0" />
            <stop offset="70%" stopColor="#f2c14e" />
            <stop offset="86%" stopColor="#a66a0a" />
            <stop offset="100%" stopColor="#6b3407" />
            <animateTransform attributeName="gradientTransform" type="translate"
              values="-60 0; 60 0; -60 0" dur="8s" repeatCount="indefinite" />
          </linearGradient>

          {/* ── Shine sweep band ── */}
          <linearGradient id={id('shine')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ── Star halo + body ── */}
          <radialGradient id={id('halo')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#d97706" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id('starbody')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fff3b0" />
            <stop offset="75%" stopColor="#f2c14e" />
            <stop offset="100%" stopColor="#b4741a" />
          </radialGradient>

          {/* ── Ambient bloom behind title ── */}
          <radialGradient id={id('bloom')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#b45309" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
          </radialGradient>

          {/* ── Curved 4-point royal star ── */}
          <path id={id('star')} d="M0,-10 C1.2,-2.5 2.5,-1.2 10,0 C2.5,1.2 1.2,2.5 0,10 C-1.2,2.5 -2.5,1.2 -10,0 C-2.5,-1.2 -1.2,-2.5 0,-10 Z" />

          {/* ── Foil mask for shine sweep ── */}
          <mask id={id('foilmask')} maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <g className="ghs-title-text" fontSize={FS} fontWeight={700}>
              <TitlePair fill="#ffffff" />
            </g>
          </mask>
        </defs>

        {/* ════════ AMBIENT BLOOM ════════ */}
        <ellipse className="ghs-glow" cx="350" cy="76" rx="330" ry="50" fill={url('bloom')} />

        {/* ════════ 3D ROYAL TYPOGRAPHY ════════ */}
        <g className="ghs-title-text" fontSize={FS} fontWeight={700}>
          {/* Ground shadow */}
          <TitlePair fill="#050100" filter={url('shadow')} />
          {/* Extrusion stack */}
          <g transform="translate(0,3.4)"><TitlePair fill="#1b0901" /></g>
          <g transform="translate(0,2.3)"><TitlePair fill="#3a1503" /></g>
          <g transform="translate(0,1.2)"><TitlePair fill="#6b2e08" /></g>
          {/* Foil face + rim */}
          <TitlePair fill={url('face')} stroke={url('rim')} strokeWidth="0.85" paintOrder="stroke fill" />
          {/* Specular chamfer */}
          <g transform="translate(0,-0.7)">
            <TitlePair fill="none" stroke="#fff8dc" strokeWidth="0.35" strokeOpacity="0.85" />
          </g>
        </g>

        {/* ════════ FOIL SHINE SWEEP ════════ */}
        <g mask={url('foilmask')} opacity="0.55" style={{ mixBlendMode: 'screen' }}>
          <rect className="ghs-shine" x="-140" y="20" width="120" height="85" fill={url('shine')} />
        </g>

        {/* ════════ CALLIGRAPHIC SWASH (nestled directly under accent phrase) ════════ */}
        <g transform="translate(112, 10)" filter={url('shadow')}>
          <path transform="translate(0,3)" opacity="0.9" fill="#200a02"
            d="M 485 72 C 508 76, 532 82, 536 90 C 540 98, 524 104, 494 102 C 450 100, 375 92, 312 82 C 290 78, 278 74, 283 70 C 288 66, 297 68, 293 73 C 289 77, 302 80, 324 82 C 375 90, 448 95, 490 97 C 516 98, 526 94, 524 89 C 519 83, 497 78, 482 74 Z" />
          <path fill={url('swash')}
            d="M 485 72 C 508 76, 532 82, 536 90 C 540 98, 524 104, 494 102 C 450 100, 375 92, 312 82 C 290 78, 278 74, 283 70 C 288 66, 297 68, 293 73 C 289 77, 302 80, 324 82 C 375 90, 448 95, 490 97 C 516 98, 526 94, 524 89 C 519 83, 497 78, 482 74 Z" />
          <path fill={url('face')}
            d="M 452 73 C 462 77, 469 82, 466 86 C 461 89, 452 87, 449 83 C 446 79, 449 75, 452 73 Z" />
        </g>
        {/* Draw-in specular highlight along ribbon */}
        <path className="ghs-draw" pathLength={1}
          d="M 395 91 C 460 99, 535 106, 605 106 C 642 105, 656 99, 650 93"
          stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85" strokeLinecap="round" />
        {/* Faceted jewel finials */}
        <circle cx="392" cy="90" r="2.4" fill={url('face')} stroke="#ffffff" strokeWidth="0.4" />
        <circle cx="650" cy="99" r="2.2" fill={url('face')} stroke="#ffffff" strokeWidth="0.4" />
        <circle cx="606" cy="112" r="1.5" fill="#f6d878" />
        <circle cx="492" cy="103" r="1.3" fill="#fff3b0" />

        {/* ════════ ROYAL STARBURSTS + STARDUST ════════ */}
        {/* Main Radiant Flare at top-left of 'पत्रिका' */}
        <g className="ghs-tw" transform="translate(36,32)">
          <circle r="32" fill={url('halo')} opacity="0.95" />
          <use href={`#${uid}-star`} transform="scale(3.4) rotate(-8)" fill={url('starbody')} />
          <use href={`#${uid}-star`} transform="scale(1.2) rotate(45)" fill="#fef08a" opacity="0.75" />
          <circle r="2.6" fill="#ffffff" />
        </g>
        {/* Accent Sparkle near hyphen */}
        <g className="ghs-tw ghs-tw-b" transform="translate(352,42)">
          <circle r="14" fill={url('halo')} opacity="0.9" />
          <use href={`#${uid}-star`} transform="scale(1.5) rotate(12)" fill={url('starbody')} />
          <circle r="1.6" fill="#ffffff" />
        </g>
        {/* Subtle Sparkle near crown of accent word */}
        <g className="ghs-tw ghs-tw-c" transform="translate(638,36)">
          <circle r="10" fill={url('halo')} opacity="0.8" />
          <use href={`#${uid}-star`} transform="scale(1.1) rotate(20)" fill={url('starbody')} />
        </g>
        {/* Floating stardust trail */}
        <circle className="ghs-dust" cx="50" cy="80" r="1.5" fill="#fde047" opacity="0.85" />
        <circle className="ghs-dust" cx="62" cy="96" r="1.2" fill="#ffffff" opacity="0.9" style={{ animationDelay: '0.7s' }} />
        <circle className="ghs-dust" cx="44" cy="110" r="1.0" fill="#fef08a" opacity="0.8" style={{ animationDelay: '1.4s' }} />
        <circle className="ghs-dust" cx="72" cy="108" r="0.8" fill="#fde047" opacity="0.7" style={{ animationDelay: '2.1s' }} />
      </svg>
    </div>
  );
}