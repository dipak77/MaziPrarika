import React from "react";

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLE BLOCK — animations used across ornaments
═══════════════════════════════════════════════════════════════ */
function OrnamentsStyles() {
  return (
    <style jsx global>{`
      @keyframes orn-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes orn-spin    { to { transform: rotate(360deg); } }
      @keyframes orn-flicker {
        0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); opacity: .95; }
        25%      { transform: scaleY(1.14) scaleX(.96) translateY(-1px); opacity: 1; }
        50%      { transform: scaleY(.92) scaleX(1.04) translateY(1px); opacity: .88; }
        75%      { transform: scaleY(1.08) scaleX(.98) translateY(-0.5px); opacity: .97; }
      }
      @keyframes orn-sway    { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
      @keyframes orn-glow    { 0%, 100% { filter: drop-shadow(0 0 6px rgba(212,175,55,.4)); } 50% { filter: drop-shadow(0 0 14px rgba(212,175,55,.7)); } }
      @keyframes orn-pulse   { 0%, 100% { opacity: .85; } 50% { opacity: 1; } }
      .orn-shimmer-fill {
        background: linear-gradient(100deg, #c9a24f 30%, #fff3c4 50%, #c9a24f 70%);
        background-size: 200% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: orn-shimmer 5s linear infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .orn-anim, .orn-shimmer-fill { animation: none !important; }
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1 · SHREE GANESHAYA CALLIGRAPHY (enhanced)
   Variants: classic / modern / royal
═══════════════════════════════════════════════════════════════ */
export function ShreeGaneshayCalligraphy({
  color = "#dfb150",
  className = "",
  variant = "classic",
  animate = false,
}: {
  color?: string;
  className?: string;
  variant?: "classic" | "modern" | "royal";
  animate?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <OrnamentsStyles />

      {/* Top decorative arch with curls */}
      <svg
        viewBox="0 0 300 52"
        className={`w-full max-w-[280px] h-auto drop-shadow-[0_2px_10px_rgba(212,175,55,0.35)] ${animate ? "orn-anim" : ""}`}
        style={animate ? { animation: "orn-pulse 3s ease-in-out infinite" } : undefined}
        fill="none"
        aria-hidden
      >
        {/* Outer ornamental curl line */}
        <path
          d="M20 26 C42 10, 74 10, 92 26 C108 40, 130 14, 150 14 C170 14, 192 40, 208 26 C226 10, 258 10, 280 26"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Inner echo line */}
        <path
          d="M36 28 C56 16, 80 16, 96 28 C110 38, 130 18, 150 18 C170 18, 190 38, 204 28 C220 16, 244 16, 264 28"
          stroke={color}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.5"
          strokeDasharray="2 3"
        />

        {/* Center crown lotus */}
        <g transform="translate(150, 14)">
          <circle cx="0" cy="0" r="3.2" fill={color} />
          <circle cx="0" cy="0" r="5" fill="none" stroke={color} strokeWidth="0.7" opacity="0.6" />
          {/* 4 petal petals */}
          <path d="M-4 0 Q0 -3 4 0 Q0 3 -4 0" fill={color} opacity="0.7" />
          <path d="M0 -4 Q3 0 0 4 Q-3 0 0 -4" fill={color} opacity="0.7" />
        </g>

        {/* End flourish dots */}
        <circle cx="20" cy="26" r="2.4" fill={color} />
        <circle cx="280" cy="26" r="2.4" fill={color} />
        <circle cx="32" cy="18" r="1" fill={color} opacity="0.7" />
        <circle cx="268" cy="18" r="1" fill={color} opacity="0.7" />

        {/* Calligraphic text */}
        <text
          x="150"
          y="42"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "var(--font-display), 'Noto Serif Devanagari', serif",
            fontWeight: 800,
            fontSize: variant === "royal" ? "22px" : "20px",
            letterSpacing: "0.08em",
          }}
        >
          ॥ श्री गणेशाय नमः ॥
        </text>
      </svg>

      {/* Underline flourish with lotus knot */}
      <svg viewBox="0 0 240 20" className="mt-1 h-auto w-full max-w-[220px] opacity-90" fill="none" aria-hidden>
        <path
          d="M8 10 Q70 14, 100 10 Q108 4, 120 10 Q132 16, 140 10 Q170 14, 232 10"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Center lotus knot */}
        <g transform="translate(120, 10)">
          <circle cx="0" cy="0" r="3.5" fill={color} />
          <path d="M-5 -2 Q0 -6 5 -2 Q0 6 -5 -2" fill={color} opacity="0.8" />
          <path d="M-2 -5 Q0 -8 2 -5 Q-2 5 -2 -5" fill={color} opacity="0.6" />
        </g>
        {/* Side curls */}
        <path d="M8 10 Q4 14 8 18" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M232 10 Q236 14 232 18" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2 · ROYAL GANESH CREST (richly detailed)
   Variants: crowned / seated / simple
═══════════════════════════════════════════════════════════════ */
export function RoyalGaneshCrest({
  color = "#e6cf92",
  size = 54,
  className = "",
  variant = "crowned",
  animate = false,
}: {
  color?: string;
  size?: number;
  className?: string;
  variant?: "crowned" | "seated" | "simple";
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={`mx-auto drop-shadow-[0_2px_10px_rgba(212,175,55,0.45)] ${animate ? "orn-anim" : ""} ${className}`}
      style={animate ? { animation: "orn-glow 3s ease-in-out infinite" } : undefined}
      fill="none"
      aria-hidden
    >
      {/* Outer halo rings */}
      <circle cx="32" cy="32" r="30" stroke={color} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.4" />
      <circle cx="32" cy="32" r="27" stroke={color} strokeWidth="1" opacity="0.6" />
      {variant === "crowned" && (
        <>
          {/* Radiating rays */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = 32 + Math.cos(a) * 24;
            const y1 = 32 + Math.sin(a) * 24;
            const x2 = 32 + Math.cos(a) * 28;
            const y2 = 32 + Math.sin(a) * 28;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.7" opacity="0.5" />;
          })}
        </>
      )}

      {/* Mukut / Crown */}
      <path
        d="M24 16 L27 7 L30 12 L32 6 L34 12 L37 7 L40 16 Z"
        fill={color}
        stroke={color}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="5" r="1.8" fill={color} />
      <circle cx="27" cy="7" r="1" fill={color} opacity="0.8" />
      <circle cx="37" cy="7" r="1" fill={color} opacity="0.8" />

      {/* Face / head */}
      <path
        d="M24 18 C20 22, 18 26, 22 30 C26 34, 30 28, 32 28 C34 28, 38 34, 42 30 C46 26, 44 22, 40 18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Ears */}
      <path d="M22 22 C16 23, 14 28, 18 32 C20 34, 23 33, 24 31" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 22 C48 23, 50 28, 46 32 C44 34, 41 33, 40 31" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Trunk (curled up) */}
      <path
        d="M32 28 C32 35, 34 42, 38 45 C42 48, 46 45, 44 41 C42 38, 38 38, 37 41"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="28" cy="22" r="0.9" fill={color} />
      <circle cx="36" cy="22" r="0.9" fill={color} />

      {/* Tilak */}
      <path d="M30 20 H34 M32 17 V24" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="32" cy="25" r="1.5" fill={color} />

      {/* Modak in trunk */}
      <circle cx="23" cy="38" r="2.8" fill={color} />
      <circle cx="23" cy="38" r="1.2" fill="none" stroke={color} strokeWidth="0.5" opacity="0.6" />

      {/* Mouse vehicle (subtle) */}
      {variant === "seated" && (
        <g transform="translate(32, 54)">
          <ellipse cx="0" cy="0" rx="4" ry="2" fill={color} opacity="0.7" />
          <circle cx="-3" cy="-1" r="0.6" fill={color} />
          <path d="M4 0 Q6 -1 7 0" stroke={color} strokeWidth="0.5" />
        </g>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3 · BAROQUE CORNER (richer acanthus detail)
═══════════════════════════════════════════════════════════════ */
export function BaroqueCorner({
  color = "#d4af37",
  className = "",
  variant = "ornate",
}: {
  color?: string;
  className?: string;
  variant?: "simple" | "ornate" | "royal";
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={`pointer-events-none h-14 w-14 drop-shadow-[0_1px_4px_rgba(212,175,55,0.3)] ${className}`}
      fill="none"
      aria-hidden
    >
      {/* Triple L frame */}
      <path d="M4 76 V20 C4 11.2, 11.2 4, 20 4 H76" stroke={color} strokeWidth="2.2" />
      <path d="M10 70 V24 C10 16.3, 16.3 10, 24 10 H70" stroke={color} strokeWidth="1.1" opacity="0.8" />
      {variant !== "simple" && (
        <path d="M14 64 V27 C14 20, 20 14, 27 14 H64" stroke={color} strokeWidth="0.75" strokeDasharray="1.5 2" opacity="0.6" />
      )}

      {/* Baroque swirl body */}
      <path
        d="M10 10 C18 18, 22 28, 20 38 C18 48, 8 44, 12 36 C16 28, 28 20, 38 20 C48 20, 44 10, 36 12 C28 14, 20 16, 10 10 Z"
        fill={color}
        opacity="0.35"
      />

      {/* Inner acanthus swirls */}
      <path d="M18 18 Q30 30, 45 24 Q32 16, 24 45" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {variant === "royal" && (
        <>
          <path d="M12 30 Q22 22, 30 12" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <path d="M30 12 Q36 20, 42 24" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <path d="M22 22 Q28 28, 34 30" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          {/* Tiny leaf sprouts */}
          <path d="M20 34 Q18 30 22 28" stroke={color} strokeWidth="0.7" strokeLinecap="round" />
          <path d="M34 20 Q30 18 28 22" stroke={color} strokeWidth="0.7" strokeLinecap="round" />
        </>
      )}

      {/* Acanthus dots */}
      <circle cx="10" cy="10" r="3.2" fill={color} />
      <circle cx="70" cy="10" r="2.2" fill={color} />
      <circle cx="10" cy="70" r="2.2" fill={color} />
      <circle cx="30" cy="30" r="2" fill={color} />
      <circle cx="48" cy="14" r="1.5" fill={color} />
      <circle cx="14" cy="48" r="1.5" fill={color} />
      {variant === "royal" && (
        <>
          <circle cx="20" cy="20" r="1" fill={color} opacity="0.8" />
          <circle cx="40" cy="20" r="0.8" fill={color} opacity="0.7" />
          <circle cx="20" cy="40" r="0.8" fill={color} opacity="0.7" />
        </>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4 · TEMPLE ARCH TOP (layered drapes + bells + marigold)
═══════════════════════════════════════════════════════════════ */
export function TempleArchTop({
  color = "#dfb150",
  fillTone = "#420f18",
  className = "",
  variant = "full",
}: {
  color?: string;
  fillTone?: string;
  className?: string;
  variant?: "full" | "simple" | "royal";
}) {
  return (
    <svg
      viewBox="0 0 400 140"
      preserveAspectRatio="none"
      className={`h-auto w-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="goldArchGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcedb8" />
          <stop offset="35%" stopColor="#d4af37" />
          <stop offset="70%" stopColor="#996f16" />
          <stop offset="100%" stopColor="#fcedb8" />
        </linearGradient>
        <linearGradient id="drapeGradLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dfb150" />
          <stop offset="50%" stopColor="#87580e" />
          <stop offset="100%" stopColor="#452702" />
        </linearGradient>
        <linearGradient id="drapeGradRight" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfb150" />
          <stop offset="50%" stopColor="#87580e" />
          <stop offset="100%" stopColor="#452702" />
        </linearGradient>
      </defs>

      {/* Background fill */}
      <path d="M0 0 H400 V65 C360 90, 300 128, 200 128 C100 128, 40 90, 0 65 Z" fill={fillTone} />

      {/* Left curtain drape (3D) */}
      <path d="M0 0 C40 10, 70 30, 80 65 C85 85, 60 115, 30 128 C20 110, 30 80, 0 85 Z" fill="url(#drapeGradLeft)" opacity="0.85" />
      <path d="M0 0 C25 20, 45 45, 45 80 C45 105, 20 125, 0 130 Z" fill="url(#drapeGradLeft)" />
      {/* Drape folds */}
      <path d="M10 0 Q20 40 25 90" stroke="#87580e" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M20 0 Q28 40 32 90" stroke="#452702" strokeWidth="0.5" fill="none" opacity="0.5" />

      {/* Right curtain drape */}
      <path d="M400 0 C360 10, 330 30, 320 65 C315 85, 340 115, 370 128 C380 110, 370 80, 400 85 Z" fill="url(#drapeGradRight)" opacity="0.85" />
      <path d="M400 0 C375 20, 355 45, 355 80 C355 105, 380 125, 400 130 Z" fill="url(#drapeGradRight)" />
      <path d="M390 0 Q380 40 375 90" stroke="#87580e" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M380 0 Q372 40 368 90" stroke="#452702" strokeWidth="0.5" fill="none" opacity="0.5" />

      {/* Outer Golden Arch */}
      <path d="M20 115 C80 95, 130 55, 200 40 C270 55, 320 95, 380 115" fill="none" stroke="url(#goldArchGrad)" strokeWidth="3.5" />

      {/* Inner scalloped arch */}
      <path d="M35 120 C90 100, 140 62, 200 48 C260 62, 310 100, 365 120" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.9" />

      {/* Hanging marigold garland (royal variant) */}
      {variant === "royal" && (
        <g>
          <path d="M80 95 Q200 130 320 95" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7" />
          {Array.from({ length: 9 }).map((_, i) => {
            const t = i / 8;
            const x = 80 + (320 - 80) * t;
            const y = 95 + (130 - 95) * Math.sin(t * Math.PI);
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="0" r="3" fill="#ff9d3c" />
                <circle cx="0" cy="0" r="1.5" fill={color} />
              </g>
            );
          })}
        </g>
      )}

      {/* Arch Peak Medallion */}
      <g transform="translate(200, 40)">
        <circle cx="0" cy="0" r="16" fill="url(#goldArchGrad)" />
        <circle cx="0" cy="0" r="13" fill={fillTone} />
        <circle cx="0" cy="0" r="10" fill="url(#goldArchGrad)" />
        <circle cx="0" cy="0" r="4" fill="#fff6d8" />
        {/* Cross lines inside */}
        <line x1="-3" y1="0" x2="3" y2="0" stroke={fillTone} strokeWidth="0.8" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke={fillTone} strokeWidth="0.8" />
      </g>

      {/* Side mini medallions */}
      {variant !== "simple" && (
        <>
          <g transform="translate(80, 80)">
            <circle cx="0" cy="0" r="6" fill="url(#goldArchGrad)" />
            <circle cx="0" cy="0" r="4" fill={fillTone} />
            <circle cx="0" cy="0" r="2" fill={color} />
          </g>
          <g transform="translate(320, 80)">
            <circle cx="0" cy="0" r="6" fill="url(#goldArchGrad)" />
            <circle cx="0" cy="0" r="4" fill={fillTone} />
            <circle cx="0" cy="0" r="2" fill={color} />
          </g>
        </>
      )}

      {/* Hanging bells on royal variant */}
      {variant === "royal" && (
        <>
          <g transform="translate(120, 90)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="0.8" />
            <path d="M-4 10 Q0 8 4 10 L3 18 L-3 18 Z" fill={color} />
            <circle cx="0" cy="19" r="1" fill={color} />
          </g>
          <g transform="translate(280, 90)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={color} strokeWidth="0.8" />
            <path d="M-4 10 Q0 8 4 10 L3 18 L-3 18 Z" fill={color} />
            <circle cx="0" cy="19" r="1" fill={color} />
          </g>
        </>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5 · LACE FRETBORDER (scallop + pearl drops + tassel)
═══════════════════════════════════════════════════════════════ */
export function LaceFretworkBorder({
  color = "#dfb150",
  flip = false,
  className = "",
  variant = "lace",
}: {
  color?: string;
  flip?: boolean;
  className?: string;
  variant?: "lace" | "pearl" | "tassel";
}) {
  const count = 16;
  return (
    <svg
      viewBox="0 0 400 32"
      preserveAspectRatio="none"
      className={`h-6 w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${flip ? "rotate-180" : ""} ${className}`}
      fill="none"
      aria-hidden
    >
      {/* Top running rules */}
      <line x1="0" y1="2" x2="400" y2="2" stroke={color} strokeWidth="1.5" />
      <line x1="0" y1="5" x2="400" y2="5" stroke={color} strokeWidth="0.75" opacity="0.6" />

      {Array.from({ length: count }).map((_, i) => {
        const x = i * 25 + 12.5;
        return (
          <g key={i}>
            {/* Scallop arch */}
            <path d={`M${x - 12.5} 5 Q${x} 20, ${x + 12.5} 5`} stroke={color} strokeWidth="1.2" fill="none" />
            {variant === "pearl" && (
              <>
                <circle cx={x} cy="14" r="2.5" fill={color} />
                <circle cx={x} cy="14" r="1" fill="#fff6d8" opacity="0.8" />
              </>
            )}
            {variant === "lace" && (
              <>
                {/* Teardrop */}
                <path d={`M${x} 10 L${x - 3} 16 L${x} 22 L${x + 3} 16 Z`} fill={color} opacity="0.9" />
                <circle cx={x} cy="24" r="1.2" fill={color} />
              </>
            )}
            {variant === "tassel" && (
              <>
                <line x1={x} y1="10" x2={x} y2="18" stroke={color} strokeWidth="0.8" />
                <circle cx={x} cy="19" r="2" fill={color} />
                <line x1={x - 1.5} y1="21" x2={x - 1.5} y2="28" stroke={color} strokeWidth="0.6" />
                <line x1={x} y1="21" x2={x} y2="29" stroke={color} strokeWidth="0.6" />
                <line x1={x + 1.5} y1="21" x2={x + 1.5} y2="28" stroke={color} strokeWidth="0.6" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6 · FLORAL FLOURISH DIVIDER (variants)
═══════════════════════════════════════════════════════════════ */
export function FloralFlourishDivider({
  color = "#e6cf92",
  className = "",
  variant = "rosette",
}: {
  color?: string;
  className?: string;
  variant?: "rosette" | "lotus" | "diamond" | "paisley" | "simple";
}) {
  if (variant === "simple") {
    return (
      <svg viewBox="0 0 240 10" className={`mx-auto h-auto w-full max-w-[220px] ${className}`} fill="none" aria-hidden>
        <line x1="10" y1="5" x2="230" y2="5" stroke={color} strokeWidth="1" opacity="0.8" />
        <circle cx="120" cy="5" r="2" fill={color} />
        <circle cx="10" cy="5" r="1" fill={color} opacity="0.6" />
        <circle cx="230" cy="5" r="1" fill={color} opacity="0.6" />
      </svg>
    );
  }

  if (variant === "diamond") {
    return (
      <svg viewBox="0 0 240 20" className={`mx-auto h-auto w-full max-w-[220px] ${className}`} fill="none" aria-hidden>
        <line x1="10" y1="10" x2="95" y2="10" stroke={color} strokeWidth="1" opacity="0.8" />
        <line x1="145" y1="10" x2="230" y2="10" stroke={color} strokeWidth="1" opacity="0.8" />
        <g transform="translate(120, 10)">
          <path d="M-10 0 L0 -8 L10 0 L0 8 Z" fill={color} />
          <path d="M-5 0 L0 -4 L5 0 L0 4 Z" fill="#fff6d8" opacity="0.8" />
        </g>
      </svg>
    );
  }

  if (variant === "lotus") {
    return (
      <svg viewBox="0 0 240 24" className={`mx-auto h-auto w-full max-w-[220px] ${className}`} fill="none" aria-hidden>
        <line x1="10" y1="12" x2="80" y2="12" stroke={color} strokeWidth="0.9" opacity="0.7" />
        <line x1="160" y1="12" x2="230" y2="12" stroke={color} strokeWidth="0.9" opacity="0.7" />
        <g transform="translate(120, 12)">
          {/* Lotus petals */}
          <path d="M0 -8 Q-3 0 0 8 Q3 0 0 -8" fill={color} opacity="0.9" />
          <path d="M-8 0 Q0 -3 8 0 Q0 3 -8 0" fill={color} opacity="0.8" />
          <path d="M-5 -5 Q-1 -1 5 -5" stroke={color} strokeWidth="0.6" fill="none" opacity="0.7" />
          <path d="M-5 5 Q-1 1 5 5" stroke={color} strokeWidth="0.6" fill="none" opacity="0.7" />
          <circle cx="0" cy="0" r="2" fill={color} />
        </g>
        <circle cx="85" cy="12" r="1.2" fill={color} />
        <circle cx="155" cy="12" r="1.2" fill={color} />
      </svg>
    );
  }

  if (variant === "paisley") {
    return (
      <svg viewBox="0 0 240 24" className={`mx-auto h-auto w-full max-w-[220px] ${className}`} fill="none" aria-hidden>
        <line x1="10" y1="12" x2="80" y2="12" stroke={color} strokeWidth="1" opacity="0.7" />
        <line x1="160" y1="12" x2="230" y2="12" stroke={color} strokeWidth="1" opacity="0.7" />
        <g transform="translate(120, 12)">
          {/* Paisley left */}
          <path d="M-10 0 Q-8 -10 0 -6 Q-2 0 0 6 Q-8 10 -10 0 Z" fill={color} opacity="0.85" />
          {/* Paisley right (mirrored) */}
          <path d="M10 0 Q8 -10 0 -6 Q2 0 0 6 Q8 10 10 0 Z" fill={color} opacity="0.85" />
          <circle cx="0" cy="0" r="1.5" fill="#fff6d8" />
        </g>
      </svg>
    );
  }

  // rosette (default)
  return (
    <svg viewBox="0 0 240 20" className={`mx-auto h-auto w-full max-w-[220px] ${className}`} fill="none" aria-hidden>
      {/* Left flourish */}
      <path d="M20 10 H85 M35 7 Q55 3, 75 10 M40 13 Q60 17, 80 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="10" r="2" fill={color} />

      {/* Center rosette */}
      <g transform="translate(120, 10)">
        <circle cx="0" cy="0" r="3.8" fill={color} />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const a = (deg / 180) * Math.PI;
          return (
            <circle key={deg} cx={Math.cos(a) * 7} cy={Math.sin(a) * 7} r="1.8" fill={color} opacity="0.8" />
          );
        })}
        <circle cx="0" cy="0" r="1.8" fill="#fff6d8" />
      </g>

      {/* Right flourish */}
      <path d="M155 10 H220 M165 10 Q185 3, 205 7 M160 10 Q180 17, 200 13" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="220" cy="10" r="2" fill={color} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7 · GANESH WATERMARK (enhanced detail)
═══════════════════════════════════════════════════════════════ */
export function GaneshWatermark({
  color = "#d4af37",
  className = "",
  opacity = 0.08,
  animate = false,
}: {
  color?: string;
  className?: string;
  opacity?: number;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`pointer-events-none select-none ${animate ? "orn-anim" : ""} ${className}`}
      style={{ opacity, ...(animate ? { animation: "orn-spin 60s linear infinite" } : {}) }}
      fill="none"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Outer rings */}
      <circle cx="50" cy="50" r="46" strokeWidth="0.7" strokeDasharray="3 4" />
      <circle cx="50" cy="50" r="42" strokeWidth="0.5" opacity="0.5" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 46} cy={50 + Math.sin(a) * 46} r="0.8" fill={color} />;
      })}

      {/* Crown */}
      <path d="M40 25 L45 15 L50 20 L55 15 L60 25 Z" />
      <circle cx="50" cy="14" r="1.2" fill={color} />

      {/* Face */}
      <path d="M40 30 C32 35, 30 45, 36 52 C42 58, 48 50, 50 50 C52 50, 58 58, 64 52 C70 45, 68 35, 60 30" />

      {/* Trunk */}
      <path d="M50 50 C50 62, 53 72, 60 76 C65 80, 72 75, 70 70 C68 64, 62 64, 60 68" strokeWidth="2" />

      {/* Tilak */}
      <path d="M47 32 H53 M50 28 V38" />
      <circle cx="50" cy="40" r="2" fill={color} />

      {/* Ears */}
      <path d="M40 30 C32 32, 28 38, 32 44" />
      <path d="M60 30 C68 32, 72 38, 68 44" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8 · GOLD PILL BADGE (with shimmer + icon support)
═══════════════════════════════════════════════════════════════ */
export function GoldPillBadge({
  children,
  badgeBg = "linear-gradient(135deg, #fae5a8 0%, #d4af37 50%, #9e7215 100%)",
  badgeText = "#2d0813",
  className = "",
  shimmer = false,
  icon,
}: {
  children: React.ReactNode;
  badgeBg?: string;
  badgeText?: string;
  className?: string;
  shimmer?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className={`my-3.5 flex items-center justify-center ${className}`}>
      <div
        className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-1.5 text-center font-bold tracking-wide shadow-[0_2px_10px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)] transition-transform hover:scale-[1.02]"
        style={{
          background: badgeBg,
          color: badgeText,
          fontFamily: "var(--font-display), 'Noto Serif Devanagari', serif",
          fontSize: "12.5px",
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span className={shimmer ? "orn-shimmer-fill" : ""}>{children}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9 · OM CREST (NEW) — auspicious Om with aura
═══════════════════════════════════════════════════════════════ */
export function OmCrest({
  color = "#d4af37",
  size = 56,
  className = "",
  animate = false,
}: {
  color?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`mx-auto drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)] ${animate ? "orn-anim" : ""} ${className}`}
      style={animate ? { animation: "orn-glow 3s ease-in-out infinite" } : undefined}
      fill="none"
      aria-hidden
    >
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="1.2" opacity="0.85" />
      <circle cx="50" cy="50" r="42" stroke={color} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.5" />
      {/* Petal markers */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg / 180) * Math.PI;
        return <circle key={deg} cx={50 + Math.cos(a) * 46} cy={50 + Math.sin(a) * 46} r="1.4" fill={color} />;
      })}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="36"
        fontFamily="'Noto Serif Devanagari', serif"
        fontWeight="700"
        fill={color}
      >
        ॐ
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10 · KALASH ORNAMENT (NEW) — sacred pot with coconut
═══════════════════════════════════════════════════════════════ */
export function KalashOrnament({
  color = "#d4af37",
  size = 64,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`mx-auto drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)] ${className}`}
      fill="none"
      aria-hidden
    >
      {/* Coconut on top */}
      <circle cx="40" cy="18" r="8" fill={color} opacity="0.85" />
      <circle cx="40" cy="18" r="5" fill="#fff6d8" opacity="0.4" />
      {/* Mango leaves */}
      <path d="M32 24 Q28 18 34 16" stroke={color} strokeWidth="1.2" fill={color} opacity="0.8" />
      <path d="M48 24 Q52 18 46 16" stroke={color} strokeWidth="1.2" fill={color} opacity="0.8" />
      <path d="M36 22 Q32 14 40 12" stroke={color} strokeWidth="1" fill={color} opacity="0.7" />
      <path d="M44 22 Q48 14 40 12" stroke={color} strokeWidth="1" fill={color} opacity="0.7" />
      {/* Kalash pot */}
      <path d="M28 30 L52 30 L50 40 L30 40 Z" fill={color} opacity="0.9" />
      <ellipse cx="40" cy="40" rx="12" ry="3" fill={color} />
      <path d="M28 40 Q24 55 30 65 L50 65 Q56 55 52 40" fill={color} opacity="0.85" />
      {/* Pot decorations */}
      <path d="M32 50 L48 50" stroke="#fff6d8" strokeWidth="0.8" opacity="0.6" />
      <path d="M31 55 L49 55" stroke="#fff6d8" strokeWidth="0.8" opacity="0.6" />
      {/* Base */}
      <ellipse cx="40" cy="66" rx="13" ry="3" fill={color} opacity="0.9" />
      <rect x="35" y="68" width="10" height="4" fill={color} opacity="0.8" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11 · MARIGOLD GARLAND (NEW) — hanging flower chain
═══════════════════════════════════════════════════════════════ */
export function MarigoldGarland({
  color = "#ff9d3c",
  goldColor = "#d4af37",
  className = "",
  flowers = 11,
}: {
  color?: string;
  goldColor?: string;
  className?: string;
  flowers?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className={`h-8 w-full ${className}`}
      fill="none"
      aria-hidden
    >
      {/* String */}
      <path d="M0 8 Q200 35 400 8" stroke={goldColor} strokeWidth="0.8" opacity="0.7" />
      {Array.from({ length: flowers }).map((_, i) => {
        const t = i / (flowers - 1);
        const x = t * 400;
        const y = 8 + (35 - 8) * Math.sin(t * Math.PI) * 1.2;
        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            <circle cx="0" cy="0" r="4.5" fill={color} />
            <circle cx="0" cy="0" r="2.5" fill={goldColor} />
            <circle cx="0" cy="0" r="1" fill="#fff6d8" opacity="0.8" />
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12 · PEACOCK MOTIF (NEW) — feather + bird silhouette
═══════════════════════════════════════════════════════════════ */
export function PeacockMotif({
  color = "#d4af37",
  size = 60,
  className = "",
  mirror = false,
}: {
  color?: string;
  size?: number;
  className?: string;
  mirror?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`drop-shadow-[0_1px_4px_rgba(212,175,55,0.3)] ${className}`}
      style={{ transform: mirror ? "scaleX(-1)" : undefined }}
      fill="none"
      aria-hidden
    >
      {/* Feather fan */}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = -60 + i * 20;
        const rad = (a / 180) * Math.PI;
        const x = 40 + Math.cos(rad) * 30;
        const y = 60 + Math.sin(rad) * -20;
        return (
          <g key={i} transform={`rotate(${a} 40 60)`}>
            <ellipse cx="40" cy="38" rx="3" ry="18" fill={color} opacity="0.85" />
            <circle cx="40" cy="30" r="2" fill="#fff6d8" />
            <circle cx="40" cy="30" r="1" fill={color} />
          </g>
        );
      })}
      {/* Body */}
      <ellipse cx="40" cy="62" rx="6" ry="8" fill={color} opacity="0.9" />
      {/* Neck + head */}
      <path d="M40 54 Q38 48 40 44 Q42 42 44 44" fill={color} />
      <circle cx="42" cy="42" r="2.5" fill={color} />
      <circle cx="43" cy="42" r="0.5" fill="#fff6d8" />
      {/* Beak */}
      <path d="M44 42 L47 42" stroke={color} strokeWidth="0.8" />
      {/* Crown feathers */}
      <path d="M41 40 L39 37" stroke={color} strokeWidth="0.8" />
      <path d="M42 39 L42 36" stroke={color} strokeWidth="0.8" />
      <path d="M43 40 L45 37" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   13 · LOTUS BLOOM (NEW) — 8-petal lotus
═══════════════════════════════════════════════════════════════ */
export function LotusBloom({
  color = "#d4af37",
  size = 48,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={`mx-auto ${className}`} fill="none" aria-hidden>
      {/* Outer petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x = 40 + Math.cos(a) * 16;
        const y = 40 + Math.sin(a) * 16;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i / 8) * 360})`}>
            <ellipse cx="0" cy="-8" rx="5" ry="12" fill={color} opacity="0.85" />
          </g>
        );
      })}
      {/* Inner petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = ((i + 0.5) / 8) * Math.PI * 2;
        const x = 40 + Math.cos(a) * 8;
        const y = 40 + Math.sin(a) * 8;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${((i + 0.5) / 8) * 360})`}>
            <ellipse cx="0" cy="-5" rx="3" ry="8" fill={color} opacity="0.6" />
          </g>
        );
      })}
      {/* Center */}
      <circle cx="40" cy="40" r="6" fill={color} />
      <circle cx="40" cy="40" r="3" fill="#fff6d8" opacity="0.8" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   14 · HANGING BELLS (NEW) — temple bell chain
═══════════════════════════════════════════════════════════════ */
export function HangingBells({
  color = "#d4af37",
  className = "",
  bells = 5,
}: {
  color?: string;
  className?: string;
  bells?: number;
}) {
  return (
    <svg viewBox="0 0 400 50" preserveAspectRatio="none" className={`h-10 w-full ${className}`} fill="none" aria-hidden>
      {/* Chain */}
      <line x1="0" y1="4" x2="400" y2="4" stroke={color} strokeWidth="0.8" opacity="0.7" />
      {Array.from({ length: bells }).map((_, i) => {
        const x = (i + 0.5) * (400 / bells);
        return (
          <g key={i} transform={`translate(${x}, 4)`}>
            <line x1="0" y1="0" x2="0" y2="14" stroke={color} strokeWidth="0.8" />
            <circle cx="0" cy="14" r="2" fill={color} />
            <path d="M-6 18 Q0 16 6 18 L5 32 L-5 32 Z" fill={color} />
            <circle cx="0" cy="33" r="1.5" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   15 · ZARI BORDER (NEW) — authentic paithani zari weave
═══════════════════════════════════════════════════════════════ */
export function ZariBorder({
  color = "#d4af37",
  className = "",
  variant = "side",
}: {
  color?: string;
  className?: string;
  variant?: "side" | "top" | "frame";
}) {
  if (variant === "frame") {
    return (
      <div
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{
          border: "9px solid transparent",
          borderImage: `repeating-linear-gradient(45deg, ${color} 0 6px, #8a6a2b 6px 12px, #e8d189 12px 14px) 9`,
        }}
        aria-hidden
      />
    );
  }
  if (variant === "top") {
    return (
      <svg viewBox="0 0 400 10" preserveAspectRatio="none" className={`h-2 w-full ${className}`} aria-hidden>
        <rect x="0" y="0" width="400" height="10" fill={color} opacity="0.9" />
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={i * 20} y="0" width="10" height="10" fill="#8a6a2b" opacity="0.6" />
        ))}
      </svg>
    );
  }
  // side
  return (
    <svg viewBox="0 0 10 400" preserveAspectRatio="none" className={`h-full w-2 ${className}`} aria-hidden>
      <rect x="0" y="0" width="10" height="400" fill={color} opacity="0.9" />
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x="0" y={i * 20} width="10" height="10" fill="#8a6a2b" opacity="0.6" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   16 · ROYAL SEAL / RAJMUDRA (NEW)
═══════════════════════════════════════════════════════════════ */
export function RoyalSeal({
  color = "#d4af37",
  size = 72,
  className = "",
  text = "शाही",
}: {
  color?: string;
  size?: number;
  className?: string;
  text?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`mx-auto ${className}`} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="1.5" opacity="0.85" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />
      {/* Decorative outer dots */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 46} cy={50 + Math.sin(a) * 46} r="1.8" fill={color} />;
      })}
      {/* Shivaji-style royal mark */}
      <path
        d="M50 15 C56 22 63 24 68 24 C64 30 58 33 50 45 C42 33 36 30 32 24 C37 24 44 22 50 15 Z"
        fill={color}
        opacity="0.9"
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="9"
        fontFamily="Georgia,'Noto Serif Devanagari',serif"
        fontWeight="700"
        fill={color}
        letterSpacing="1"
      >
        {text}
      </text>
      <path d="M50 62 V56" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   17 · PAISLEY BAND (NEW) — horizontal running motif
═══════════════════════════════════════════════════════════════ */
export function PaisleyBand({
  color = "#d4af37",
  flip = false,
  className = "",
}: {
  color?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 14" preserveAspectRatio="none" className={`h-[13px] w-full ${flip ? "rotate-180" : ""} ${className}`} aria-hidden>
      <g fill={color}>
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M${i * 32 + 16} 2c4.5 3.4 4.5 6.6 0 10-4.5-3.4-4.5-6.6 0-10Z`} opacity={0.85} />
        ))}
      </g>
      <rect y="6.2" width="320" height="1.4" fill={color} opacity="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   18 · DIYA FLAME (NEW) — animated oil lamp
═══════════════════════════════════════════════════════════════ */
export function DiyaFlame({
  color = "#d4af37",
  size = 48,
  className = "",
  animate = true,
}: {
  color?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className={`mx-auto ${className}`} aria-hidden>
      <OrnamentsStyles />
      {/* Flame */}
      <g className={animate ? "orn-anim" : ""} style={animate ? { animation: "orn-flicker 1.6s ease-in-out infinite", transformOrigin: "30px 30px" } : undefined}>
        <path d="M30 12 Q25 20 27 26 Q29 30 30 28 Q31 30 33 26 Q35 20 30 12 Z" fill="#ff9d3c" />
        <path d="M30 16 Q27 22 29 26 Q30 28 31 26 Q33 22 30 16 Z" fill="#ffd66b" />
        <ellipse cx="30" cy="24" rx="1.5" ry="3" fill="#fff6d8" />
      </g>
      {/* Diya bowl */}
      <ellipse cx="30" cy="42" rx="14" ry="5" fill={color} />
      <path d="M20 42 Q20 32 30 28 Q40 32 40 42" fill={color} opacity="0.85" />
      <ellipse cx="30" cy="48" rx="10" ry="2" fill={color} opacity="0.7" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   19 · MANDALA WATERMARK (NEW) — full-circle mandala
═══════════════════════════════════════════════════════════════ */
export function MandalaWatermark({
  color = "#d4af37",
  className = "",
  opacity = 0.08,
  animate = false,
}: {
  color?: string;
  className?: string;
  opacity?: number;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none h-full w-full ${animate ? "orn-anim" : ""} ${className}`}
      style={{ opacity, ...(animate ? { animation: "orn-spin 80s linear infinite" } : {}) }}
      fill="none"
      aria-hidden
    >
      <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="1" strokeDasharray="3 7" />
      <circle cx="100" cy="100" r="70" stroke={color} strokeWidth="0.8" opacity="0.6" />
      <circle cx="100" cy="100" r="50" stroke={color} strokeWidth="0.6" strokeDasharray="2 4" opacity="0.5" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return <circle key={i} cx={100 + Math.cos(a) * 92} cy={100 + Math.sin(a) * 92} r="2" fill={color} />;
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x1 = 100 + Math.cos(a) * 50;
        const y1 = 100 + Math.sin(a) * 50;
        const x2 = 100 + Math.cos(a) * 70;
        const y2 = 100 + Math.sin(a) * 70;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.8" opacity="0.6" />;
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   20 · CORNER FLOURISH (NEW) — simpler corner than BaroqueCorner
═══════════════════════════════════════════════════════════════ */
export function CornerFlourish({
  color = "#d4af37",
  size = 40,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className={`pointer-events-none ${className}`} fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <path d="M4 56 C4 30 30 4 56 4" opacity="0.9" />
      <path d="M4 44 C4 24 24 4 44 4" opacity="0.55" />
      <path d="M56 4 c-6 8 -14 10 -18 6 c-4 -4 -2 -12 6 -18" opacity="0.8" />
      <circle cx="8" cy="52" r="2.4" fill={color} stroke="none" />
      <circle cx="52" cy="8" r="1.2" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   21 · PAISLEY CORNER
═══════════════════════════════════════════════════════════════ */
export function PaisleyCorner({
  color = "#d4af37",
  size = 44,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 60 60" className={`pointer-events-none ${className}`} style={{ width: size, height: size }} fill="none" aria-hidden>
      <path d="M4 56 Q4 20 40 8 Q32 20 28 32 Q24 44 14 50 Q8 52 4 56 Z" fill={color} opacity="0.85" />
      <path d="M8 54 Q8 28 32 14" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
      <circle cx="22" cy="22" r="2" fill={color} opacity="0.5" />
      <circle cx="30" cy="30" r="1.5" fill={color} opacity="0.4" />
      <circle cx="12" cy="42" r="1.2" fill={color} opacity="0.5" />
    </svg>
  );
}