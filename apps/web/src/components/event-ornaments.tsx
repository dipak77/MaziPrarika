import React from "react";

/* ══ Hanging Brass Temple Bells with Peacock Feather (Image 1 Style) ═══ */
export function HangingBrassTempleBells({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 80"
      className={`w-32 h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] ${className}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="40%" stopColor="#e5a93b" />
          <stop offset="80%" stopColor="#875608" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>
      {/* Left Hanging Bell */}
      <g transform="translate(30, 0)">
        <line x1="0" y1="0" x2="0" y2="28" stroke="url(#brassGrad)" strokeWidth="2.5" strokeDasharray="2 1.5" />
        <ellipse cx="0" cy="28" rx="4" ry="2" fill="url(#brassGrad)" />
        <path d="M-10 48 C-10 32, 10 32, 10 48 C14 53, 14 55, 12 58 C8 60, -8 60, -12 58 C-14 55, -14 53, -10 48 Z" fill="url(#brassGrad)" />
        <circle cx="0" cy="59" r="3" fill="#875608" />
      </g>
      {/* Right Hanging Bell */}
      <g transform="translate(130, 0)">
        <line x1="0" y1="0" x2="0" y2="22" stroke="url(#brassGrad)" strokeWidth="2.5" strokeDasharray="2 1.5" />
        <ellipse cx="0" cy="22" rx="4" ry="2" fill="url(#brassGrad)" />
        <path d="M-9 40 C-9 26, 9 26, 9 40 C13 45, 13 47, 11 50 C7 52, -7 52, -11 50 C-13 47, -13 45, -9 40 Z" fill="url(#brassGrad)" />
        <circle cx="0" cy="51" r="2.8" fill="#875608" />
      </g>
    </svg>
  );
}

/* ══ Peacock Feather Motif (Image 1 Style) ═════════════════════════════ */
export function PeacockFeatherMotif({
  size = 64,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={(size * 120) / 100}
      className={`drop-shadow-[0_4px_14px_rgba(0,180,216,0.35)] ${className}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="peacockEye" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#10002b" />
          <stop offset="35%" stopColor="#3a0ca3" />
          <stop offset="65%" stopColor="#00b4d8" />
          <stop offset="85%" stopColor="#2ec4b6" />
          <stop offset="100%" stopColor="#e9c46a" />
        </radialGradient>
      </defs>
      {/* Central quill */}
      <path d="M50 115 Q52 70, 50 25" stroke="#90be6d" strokeWidth="2.5" strokeLinecap="round" />
      {/* Outer barbules plume */}
      <ellipse cx="50" cy="40" rx="34" ry="38" fill="#2d6a4f" opacity="0.3" />
      <path d="M50 8 C22 20, 20 60, 50 78 C80 60, 78 20, 50 8 Z" fill="#40916c" opacity="0.75" />
      <path d="M50 14 C28 24, 26 56, 50 72 C74 56, 72 24, 50 14 Z" fill="#52b788" />
      {/* Eye of the feather */}
      <ellipse cx="50" cy="38" rx="20" ry="24" fill="url(#peacockEye)" />
      {/* Deep purple center pupil */}
      <ellipse cx="50" cy="35" rx="8" ry="10" fill="#10002b" />
      <circle cx="52" cy="32" r="2.5" fill="#00b4d8" />
    </svg>
  );
}

/* ══ Golden Flute (Bansuri) & Makhan Handi Motif (Image 1 Style) ═══════ */
export function FluteAndButterPot({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={`w-32 h-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${className}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="goldPotGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fae5a8" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="85%" stopColor="#875608" />
        </linearGradient>
        <linearGradient id="fluteGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {/* Golden Matka / Butter Pot */}
      <g transform="translate(75, 45)">
        <ellipse cx="40" cy="65" rx="28" ry="8" fill="#000000" opacity="0.25" />
        <path
          d="M20 30 C12 45, 14 62, 40 62 C66 62, 68 45, 60 30 C60 22, 54 20, 40 20 C26 20, 20 22, 20 30 Z"
          fill="url(#goldPotGrad)"
          stroke="#78350f"
          strokeWidth="1.5"
        />
        {/* Pot Rim */}
        <ellipse cx="40" cy="22" rx="18" ry="5" fill="#78350f" />
        <ellipse cx="40" cy="21" rx="16" ry="4" fill="url(#goldPotGrad)" />
        {/* Overflowing Butter / Makhan */}
        <ellipse cx="40" cy="19" rx="14" ry="3" fill="#ffffff" />
        <path d="M30 20 Q35 32, 38 22 Q44 36, 46 21" fill="#ffffff" />
      </g>

      {/* Tilted Bamboo Flute (Bansuri) */}
      <g transform="translate(10, 8) rotate(42)">
        <rect x="0" y="0" width="8" height="110" rx="3.5" fill="url(#fluteGrad)" stroke="#78350f" strokeWidth="1" />
        {/* Finger Holes */}
        {[20, 32, 44, 56, 68, 80, 92].map((y) => (
          <circle key={y} cx="4" cy={y} r="1.4" fill="#451a03" />
        ))}
        {/* Red Silk Tassel */}
        <g transform="translate(4, 98)">
          <circle cx="0" cy="0" r="3" fill="#dc2626" />
          <path d="M-2 2 L-4 16 L0 18 L4 16 L2 2 Z" fill="#b91c1c" />
        </g>
      </g>
    </svg>
  );
}

/* ══ Maharashtrian Mundavalya (मुंडावळ्या - Image 2 Style) ══════════════ */
export function MundavalyaGarland({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 48"
      className={`w-full max-w-[220px] h-auto drop-shadow-sm ${className}`}
      fill="none"
      aria-hidden
    >
      {/* Top golden wire band */}
      <line x1="10" y1="12" x2="190" y2="12" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="16" x2="190" y2="16" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" />

      {/* Hanging pearl strands with red silk tassels */}
      {/* Left Hanging Tassel */}
      <g transform="translate(24, 16)">
        <line x1="0" y1="0" x2="0" y2="24" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="0" cy="24" r="3" fill="#ca8a04" />
        <path d="M-3 26 L-5 44 L0 46 L5 44 L3 26 Z" fill="#dc2626" />
      </g>
      {/* Right Hanging Tassel */}
      <g transform="translate(176, 16)">
        <line x1="0" y1="0" x2="0" y2="24" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="0" cy="24" r="3" fill="#ca8a04" />
        <path d="M-3 26 L-5 44 L0 46 L5 44 L3 26 Z" fill="#dc2626" />
      </g>

      {/* Central Rosettes */}
      <g transform="translate(100, 14)">
        <circle cx="0" cy="0" r="6" fill="#eab308" />
        <circle cx="0" cy="0" r="3.5" fill="#dc2626" />
        <circle cx="-16" cy="0" r="4.5" fill="#ca8a04" />
        <circle cx="16" cy="0" r="4.5" fill="#ca8a04" />
      </g>
    </svg>
  );
}

/* ══ Traditional Maratha Katyar (कट्यार - Image 3 & 5 Style) ═══════════ */
export function RoyalMarathaKatyar({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`w-24 h-24 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] ${className}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="scabbardGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="70%" stopColor="#875608" />
          <stop offset="100%" stopColor="#e5a93b" />
        </linearGradient>
      </defs>
      {/* Scabbard / Sheath with ornate curved Maratha style */}
      <g transform="translate(15, 15) rotate(15)">
        {/* Velvet/Wood body */}
        <path
          d="M10 8 Q35 45, 65 75 Q75 85, 90 92 Q82 78, 62 55 Q35 25, 20 8 Z"
          fill="#450a0a"
          stroke="url(#scabbardGold)"
          strokeWidth="2.5"
        />
        {/* Gold Filigree Bands */}
        <path d="M12 10 Q22 22, 30 18" stroke="url(#scabbardGold)" strokeWidth="4" />
        <path d="M38 38 Q50 50, 58 46" stroke="url(#scabbardGold)" strokeWidth="3" />
        {/* Curved Chape Tip in Gold */}
        <path d="M68 76 Q80 86, 92 93 Q85 80, 72 65 Z" fill="url(#scabbardGold)" />
        {/* Katyar Hilt Handle */}
        <g transform="translate(8, 6)">
          <path d="M-8 -6 L6 6 M-6 -8 L8 4" stroke="url(#scabbardGold)" strokeWidth="3" />
          <circle cx="0" cy="0" r="4" fill="#991b1b" stroke="url(#scabbardGold)" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}

/* ══ 3D Interlocking Golden Rings (Image 4 Style) ═══════════════════════ */
export function InterlockedGoldRings({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 64"
      width={size}
      height={(size * 64) / 100}
      className={`mx-auto drop-shadow-[0_4px_16px_rgba(212,175,55,0.65)] ${className}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ringGoldL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="ringGoldR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Left Ring */}
      <ellipse cx="38" cy="32" rx="26" ry="18" fill="none" stroke="url(#ringGoldL)" strokeWidth="6" />
      <ellipse cx="38" cy="32" rx="26" ry="18" fill="none" stroke="#fff8db" strokeWidth="1.5" opacity="0.65" />

      {/* Right Ring (Interlocking) */}
      <ellipse cx="62" cy="32" rx="26" ry="18" fill="none" stroke="url(#ringGoldR)" strokeWidth="6" />
      <ellipse cx="62" cy="32" rx="26" ry="18" fill="none" stroke="#fff8db" strokeWidth="1.5" opacity="0.65" />

      {/* Diamond on Top of Right Ring */}
      <g transform="translate(62, 13)">
        <polygon points="0,-7 6,-2 4,4 -4,4 -6,-2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
        <polygon points="0,-7 3,-2 0,4 -3,-2" fill="#ffffff" />
        {/* Sparkle Rays */}
        <line x1="0" y1="-12" x2="0" y2="-9" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-5" y1="-7" x2="-8" y2="-8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="5" y1="-7" x2="8" y2="-8" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ══ Tutari Vadak (तुतारी वादक - Image 4 Style) ══════════════════════════ */
export function TutariVadakMusicians({
  color = "#d4af37",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 48"
      className={`w-full max-w-[220px] mx-auto h-auto drop-shadow-sm ${className}`}
      fill="none"
      aria-hidden
    >
      {/* Left Tutari Player */}
      <g transform="translate(30, 24)">
        {/* Curving Tutari Horn */}
        <path
          d="M0 0 Q-10 -20, -22 -14 Q-30 -8, -25 6"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="-25" cy="6" r="4.5" fill={color} />
        {/* Player silhouette */}
        <circle cx="6" cy="-2" r="4" fill="#dc2626" /> {/* Red Pheta */}
        <circle cx="6" cy="3" r="3" fill="#fde047" /> {/* Face */}
        <path d="M2 7 L12 7 L10 20 L4 20 Z" fill="#ffffff" stroke={color} strokeWidth="1" /> {/* White Kurta */}
      </g>

      {/* Decorative center lotus/dot divider */}
      <g transform="translate(100, 24)">
        <circle cx="0" cy="0" r="3" fill={color} />
        <circle cx="-12" cy="0" r="1.5" fill={color} />
        <circle cx="12" cy="0" r="1.5" fill={color} />
        <line x1="-30" y1="0" x2="-18" y2="0" stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1="18" y1="0" x2="30" y2="0" stroke={color} strokeWidth="1" opacity="0.6" />
      </g>

      {/* Right Tutari Player (Flipped) */}
      <g transform="translate(170, 24) scale(-1, 1)">
        <path
          d="M0 0 Q-10 -20, -22 -14 Q-30 -8, -25 6"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="-25" cy="6" r="4.5" fill={color} />
        <circle cx="6" cy="-2" r="4" fill="#dc2626" />
        <circle cx="6" cy="3" r="3" fill="#fde047" />
        <path d="M2 7 L12 7 L10 20 L4 20 Z" fill="#ffffff" stroke={color} strokeWidth="1" />
      </g>
    </svg>
  );
}

/* ══ Haldi Kumkum & Akshata Thali (Image 3 & 5 Style) ══════════════════ */
export function HaldiKumkumThali({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={`w-20 h-auto drop-shadow-md ${className}`}
      fill="none"
      aria-hidden
    >
      {/* Plate */}
      <ellipse cx="50" cy="45" rx="42" ry="24" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
      <ellipse cx="50" cy="45" rx="36" ry="20" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2 2" />

      {/* Red Kumkum Bowl */}
      <ellipse cx="36" cy="42" rx="12" ry="8" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1.2" />
      <circle cx="36" cy="41" r="7" fill="#dc2626" />

      {/* Yellow Haldi Bowl */}
      <ellipse cx="64" cy="42" rx="12" ry="8" fill="#ca8a04" stroke="#a16207" strokeWidth="1.2" />
      <circle cx="64" cy="41" r="7" fill="#eab308" />

      {/* White Akshata Rice grains */}
      <ellipse cx="50" cy="54" rx="8" ry="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
    </svg>
  );
}

/* ══ "स्नेह निमंत्रण" Decorative Ribbon Badge (Image 2 & 3 Style) ═══════ */
export function SnehNimantranRibbon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-b-xl border-t-2 border-gold-400 bg-gradient-to-b from-maroon-700 via-maroon-800 to-maroon-950 px-3.5 py-1.5 shadow-md ${className}`}
      style={{
        boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex items-center gap-1 text-gold-300 text-[10px]">
        <span>✨</span>
        <span className="font-display font-black tracking-widest uppercase">
          स्नेह निमंत्रण
        </span>
        <span>✨</span>
      </div>
    </div>
  );
}

/* ══ Location QR Code Badge (Image 2 & 5 Style) ═════════════════════════ */
export function LocationQrBadge({
  qrValue,
  label = "SCAN QR FOR LOCATION",
  className = "",
}: {
  qrValue?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-gold-500/40 bg-white/90 p-2 shadow-xs backdrop-blur-xs ${className}`}
    >
      {/* Visual QR Code Pattern */}
      <svg viewBox="0 0 36 36" className="size-8 shrink-0 text-maroon-950" fill="currentColor">
        <rect x="2" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="5" y="5" width="4" height="4" />
        <rect x="24" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="27" y="5" width="4" height="4" />
        <rect x="2" y="24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="5" y="27" width="4" height="4" />
        <rect x="16" y="2" width="4" height="4" />
        <rect x="16" y="16" width="6" height="6" />
        <rect x="24" y="16" width="4" height="8" />
        <rect x="24" y="28" width="6" height="4" />
        <rect x="14" y="26" width="4" height="6" />
      </svg>
      <div className="text-left leading-none">
        <p className="font-mono text-[9px] font-black tracking-wider text-maroon-900 uppercase">
          {label}
        </p>
        <p className="text-[8px] text-ink-500 mt-0.5">
          {qrValue || "Google Maps Direction"}
        </p>
      </div>
    </div>
  );
}

/* ══ Red Velvet Royal Curtain Drapes (Image 4 Style) ═══════════════════ */
export function VelvetCurtainDrapes({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      className={`w-full h-12 pointer-events-none drop-shadow-md ${className}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="redDrape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
      </defs>
      {/* Scalloped Swags */}
      <path
        d="M0 0 H400 V10 Q350 45, 300 15 Q250 45, 200 15 Q150 45, 100 15 Q50 45, 0 10 Z"
        fill="url(#redDrape)"
      />
      {/* Golden Fringes */}
      <path
        d="M0 10 Q50 45, 100 15 Q150 45, 200 15 Q250 45, 300 15 Q350 45, 400 10"
        stroke="#fde047"
        strokeWidth="1.8"
        strokeDasharray="2 1.5"
      />
    </svg>
  );
}
