import React from "react";

/* ══════════════════════════════════════════════════════════════════════
   1. LUXURY DAMASK BROCADE SVG PATTERN
   Authentic Indian / Victorian royal brocade wallpaper motif
   ══════════════════════════════════════════════════════════════════════ */
export function DamaskBrocadeBackground({
  color = "#d4af37",
  opacity = 0.09,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="damaskTile"
          width="80"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          {/* Central Damask Palmette */}
          <path
            d="M40 10 C32 20, 22 24, 25 38 C28 50, 36 52, 40 65 C44 52, 52 50, 55 38 C58 24, 48 20, 40 10 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.2"
          />
          <path
            d="M40 22 C36 28, 30 32, 32 40 C34 46, 38 48, 40 56 C42 48, 46 46, 48 40 C50 32, 44 28, 40 22 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
          <circle cx="40" cy="38" r="3" fill={color} />
          {/* Side Floral Acanthus Volutes */}
          <path
            d="M25 38 C14 36, 6 46, 12 58 C18 70, 28 66, 34 60"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <path
            d="M55 38 C66 36, 74 46, 68 58 C62 70, 52 66, 46 60"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          {/* Secondary Interlocking Flourish */}
          <path
            d="M40 68 C34 76, 18 84, 18 96 C18 108, 30 114, 40 118 C50 114, 62 108, 62 96 C62 84, 46 76, 40 68 Z"
            fill="none"
            stroke={color}
            strokeWidth="1"
          />
          <path
            d="M0 60 C8 66, 14 74, 14 84 C14 94, 6 100, 0 106"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
          <path
            d="M80 60 C72 66, 66 74, 66 84 C66 94, 74 100, 80 106"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
          />
          {/* Little Floral Buds */}
          <circle cx="20" cy="20" r="1.5" fill={color} />
          <circle cx="60" cy="20" r="1.5" fill={color} />
          <circle cx="40" cy="94" r="2.2" fill={color} />
          <circle cx="0" cy="0" r="2" fill={color} />
          <circle cx="80" cy="0" r="2" fill={color} />
          <circle cx="0" cy="120" r="2" fill={color} />
          <circle cx="80" cy="120" r="2" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#damaskTile)" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. BAROQUE ROCOCO 3D CARVED GOLD OUTER BORDER
   Elaborate golden frame molding with 4 ornate acanthus corners & beading
   ══════════════════════════════════════════════════════════════════════ */
export function BaroqueOuterBorder({
  accentColor = "#d4af37",
  borderThickness = "normal",
  className = "",
}: {
  accentColor?: string;
  borderThickness?: "thin" | "normal" | "heavy";
  className?: string;
}) {
  const outerInset = borderThickness === "thin" ? 14 : borderThickness === "heavy" ? 22 : 18;
  const innerInset = outerInset + 8;

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 500 800"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="baroqueGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="25%" stopColor={accentColor} />
          <stop offset="50%" stopColor="#8a6114" />
          <stop offset="75%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#ffd875" />
        </linearGradient>
        <linearGradient id="baroqueBeadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="40%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#5e3e07" />
        </linearGradient>
        <filter id="goldDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Outer Heavy Gold Carved Molding Line */}
      <rect
        x={outerInset}
        y={outerInset}
        width={500 - outerInset * 2}
        height={800 - outerInset * 2}
        rx="6"
        stroke="url(#baroqueGoldGrad)"
        strokeWidth={borderThickness === "thin" ? 2 : borderThickness === "heavy" ? 4.5 : 3.5}
        filter="url(#goldDropShadow)"
      />

      {/* Decorative Beaded Inner Molding */}
      <rect
        x={innerInset}
        y={innerInset}
        width={500 - innerInset * 2}
        height={800 - innerInset * 2}
        rx="4"
        stroke="url(#baroqueBeadGrad)"
        strokeWidth="1.4"
        strokeDasharray="3 3.5"
      />

      {/* Fine Inner Accent Border */}
      <rect
        x={innerInset + 5}
        y={innerInset + 5}
        width={500 - (innerInset + 5) * 2}
        height={800 - (innerInset + 5) * 2}
        rx="2"
        stroke="url(#baroqueGoldGrad)"
        strokeWidth="0.8"
        strokeOpacity="0.75"
      />

      {/* ── Corner 1: TOP LEFT ROCOCO ACANTHUS ── */}
      <g transform={`translate(${outerInset - 4}, ${outerInset - 4})`} filter="url(#goldDropShadow)">
        <path
          d="M0 0 C16 4, 34 8, 48 24 C36 28, 28 36, 24 48 C8 34, 4 16, 0 0 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M12 12 C24 16, 32 24, 38 38 C30 40, 24 48, 20 60 C8 44, 4 28, 12 12 Z"
          fill="none"
          stroke="#fff4cc"
          strokeWidth="0.8"
        />
        <circle cx="16" cy="16" r="3" fill="#fff" />
        <path
          d="M48 24 C56 18, 68 20, 74 12 C64 12, 54 8, 48 2 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M24 48 C18 56, 20 68, 12 74 C12 64, 8 54, 2 48 Z"
          fill="url(#baroqueGoldGrad)"
        />
      </g>

      {/* ── Corner 2: TOP RIGHT ROCOCO ACANTHUS ── */}
      <g transform={`translate(${500 - outerInset + 4}, ${outerInset - 4}) scale(-1, 1)`} filter="url(#goldDropShadow)">
        <path
          d="M0 0 C16 4, 34 8, 48 24 C36 28, 28 36, 24 48 C8 34, 4 16, 0 0 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M12 12 C24 16, 32 24, 38 38 C30 40, 24 48, 20 60 C8 44, 4 28, 12 12 Z"
          fill="none"
          stroke="#fff4cc"
          strokeWidth="0.8"
        />
        <circle cx="16" cy="16" r="3" fill="#fff" />
        <path
          d="M48 24 C56 18, 68 20, 74 12 C64 12, 54 8, 48 2 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M24 48 C18 56, 20 68, 12 74 C12 64, 8 54, 2 48 Z"
          fill="url(#baroqueGoldGrad)"
        />
      </g>

      {/* ── Corner 3: BOTTOM LEFT ROCOCO ACANTHUS ── */}
      <g transform={`translate(${outerInset - 4}, ${800 - outerInset + 4}) scale(1, -1)`} filter="url(#goldDropShadow)">
        <path
          d="M0 0 C16 4, 34 8, 48 24 C36 28, 28 36, 24 48 C8 34, 4 16, 0 0 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M12 12 C24 16, 32 24, 38 38 C30 40, 24 48, 20 60 C8 44, 4 28, 12 12 Z"
          fill="none"
          stroke="#fff4cc"
          strokeWidth="0.8"
        />
        <circle cx="16" cy="16" r="3" fill="#fff" />
        <path
          d="M48 24 C56 18, 68 20, 74 12 C64 12, 54 8, 48 2 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M24 48 C18 56, 20 68, 12 74 C12 64, 8 54, 2 48 Z"
          fill="url(#baroqueGoldGrad)"
        />
      </g>

      {/* ── Corner 4: BOTTOM RIGHT ROCOCO ACANTHUS ── */}
      <g transform={`translate(${500 - outerInset + 4}, ${800 - outerInset + 4}) scale(-1, -1)`} filter="url(#goldDropShadow)">
        <path
          d="M0 0 C16 4, 34 8, 48 24 C36 28, 28 36, 24 48 C8 34, 4 16, 0 0 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M12 12 C24 16, 32 24, 38 38 C30 40, 24 48, 20 60 C8 44, 4 28, 12 12 Z"
          fill="none"
          stroke="#fff4cc"
          strokeWidth="0.8"
        />
        <circle cx="16" cy="16" r="3" fill="#fff" />
        <path
          d="M48 24 C56 18, 68 20, 74 12 C64 12, 54 8, 48 2 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <path
          d="M24 48 C18 56, 20 68, 12 74 C12 64, 8 54, 2 48 Z"
          fill="url(#baroqueGoldGrad)"
        />
      </g>

      {/* ── Top Center Baroque Cartouche / Crest ── */}
      <g transform="translate(250, 22)" filter="url(#goldDropShadow)">
        <path
          d="M-40 0 C-26 -10, 26 -10, 40 0 C30 6, 15 10, 0 10 C-15 10, -30 6, -40 0 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <circle cx="0" cy="3" r="3" fill="#fff" />
        <circle cx="-16" cy="2" r="2" fill="url(#baroqueGoldGrad)" />
        <circle cx="16" cy="2" r="2" fill="url(#baroqueGoldGrad)" />
      </g>

      {/* ── Bottom Center Baroque Cartouche / Crest ── */}
      <g transform="translate(250, 778) scale(1, -1)" filter="url(#goldDropShadow)">
        <path
          d="M-40 0 C-26 -10, 26 -10, 40 0 C30 6, 15 10, 0 10 C-15 10, -30 6, -40 0 Z"
          fill="url(#baroqueGoldGrad)"
        />
        <circle cx="0" cy="3" r="3" fill="#fff" />
        <circle cx="-16" cy="2" r="2" fill="url(#baroqueGoldGrad)" />
        <circle cx="16" cy="2" r="2" fill="url(#baroqueGoldGrad)" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. MARIGOLD (झेंडू) & MANGO LEAF (आंब्याची पाने) TORAN GARLAND
   Curved celebratory festoon with realistic layered marigold blossoms & green leaves
   ══════════════════════════════════════════════════════════════════════ */
export function MarigoldToranGarland({
  style = "marigold", // 'marigold' | 'jasmine' | 'rose'
  className = "",
}: {
  style?: "marigold" | "jasmine" | "rose";
  className?: string;
}) {
  // Flower points along a natural hanging parabolic curve
  const flowerPoints = [
    { x: 35, y: 16, r: 8, col: "#ea580c" },
    { x: 55, y: 24, r: 8.5, col: "#f97316" },
    { x: 78, y: 34, r: 9, col: "#eab308" },
    { x: 104, y: 44, r: 9.5, col: "#ea580c" },
    { x: 132, y: 53, r: 10, col: "#f97316" },
    { x: 162, y: 60, r: 10.5, col: "#eab308" },
    { x: 194, y: 64, r: 11, col: "#ea580c" },
    { x: 226, y: 66, r: 11.5, col: "#f97316" }, // Apex center flower
    { x: 258, y: 64, r: 11, col: "#ea580c" },
    { x: 290, y: 60, r: 10.5, col: "#eab308" },
    { x: 320, y: 53, r: 10, col: "#f97316" },
    { x: 348, y: 44, r: 9.5, col: "#ea580c" },
    { x: 374, y: 34, r: 9, col: "#eab308" },
    { x: 397, y: 24, r: 8.5, col: "#f97316" },
    { x: 417, y: 16, r: 8, col: "#ea580c" },
  ];

  // Leaf anchors between flowers
  const leafPoints = [
    { x: 45, y: 20, rot: -28 },
    { x: 67, y: 29, rot: -22 },
    { x: 91, y: 39, rot: -16 },
    { x: 118, y: 49, rot: -10 },
    { x: 147, y: 57, rot: -5 },
    { x: 178, y: 62, rot: -2 },
    { x: 210, y: 65, rot: 0 },
    { x: 242, y: 65, rot: 2 },
    { x: 274, y: 62, rot: 5 },
    { x: 305, y: 57, rot: 10 },
    { x: 334, y: 49, rot: 16 },
    { x: 361, y: 39, rot: 22 },
    { x: 385, y: 29, rot: 28 },
  ];

  const primaryColor =
    style === "jasmine" ? "#f8fafc" : style === "rose" ? "#be123c" : "#f97316";
  const secondaryColor =
    style === "jasmine" ? "#e2e8f0" : style === "rose" ? "#9f1239" : "#eab308";

  return (
    <svg
      viewBox="0 0 450 100"
      className={`w-full max-w-[480px] h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mangoLeafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="50%" stopColor="#166534" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
        <filter id="flowerShad" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Hanging Silk Rope Thread */}
      <path
        d="M25 10 Q225 80 425 10"
        stroke="#78350f"
        strokeWidth="3"
        strokeDasharray="4 2"
        fill="none"
        opacity="0.85"
      />

      {/* Pointing Mango Leaves (आंब्याची पाने) */}
      {leafPoints.map((lp, i) => (
        <g
          key={`leaf-${i}`}
          transform={`translate(${lp.x}, ${lp.y}) rotate(${lp.rot})`}
          filter="url(#flowerShad)"
        >
          <path
            d="M0 0 C-5 12, -7 24, 0 34 C7 24, 5 12, 0 0 Z"
            fill="url(#mangoLeafGrad)"
            stroke="#22c55e"
            strokeWidth="0.6"
          />
          {/* Leaf Midrib */}
          <line x1="0" y1="2" x2="0" y2="30" stroke="#86efac" strokeWidth="0.7" opacity="0.6" />
        </g>
      ))}

      {/* Rich Layered Marigold Blossoms (झेंडूची फुले) */}
      {flowerPoints.map((fp, i) => {
        const flowerColor = i % 2 === 0 ? primaryColor : secondaryColor;
        const petalRadius = fp.r;
        return (
          <g
            key={`flower-${i}`}
            transform={`translate(${fp.x}, ${fp.y})`}
            filter="url(#flowerShad)"
          >
            {/* Outer Petals Ring */}
            <circle cx="0" cy="0" r={petalRadius} fill={flowerColor} />
            {/* Scalloped Texture Petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
              <ellipse
                key={ang}
                cx="0"
                cy={-petalRadius * 0.55}
                rx={petalRadius * 0.38}
                ry={petalRadius * 0.45}
                transform={`rotate(${ang})`}
                fill={i % 2 === 0 ? "#ea580c" : "#ca8a04"}
                opacity="0.9"
              />
            ))}
            {/* Inner Core Ruffle */}
            <circle cx="0" cy="0" r={petalRadius * 0.52} fill={flowerColor} />
            <circle cx="0" cy="0" r={petalRadius * 0.28} fill="#fef08a" />
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. BRIDAL KUNDAN & GOLD JEWELRY CHANDELIER (Left Side Garland)
   Cascading traditional Maharashtrian / Indian bridal gold jewelry with
   pearl droplets, jhumka, kundan medallion, and hanging tassels
   ══════════════════════════════════════════════════════════════════════ */
export function BridalGoldJewelryChandelier({
  accentColor = "#d4af37",
  className = "",
}: {
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 380"
      className={`w-36 h-auto pointer-events-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="jewelGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="30%" stopColor={accentColor} />
          <stop offset="65%" stopColor="#926210" />
          <stop offset="85%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#ffe699" />
        </linearGradient>
        <linearGradient id="pearlWhite" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <radialGradient id="emeraldGem" cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </radialGradient>
        <radialGradient id="rubyGem" cx="40%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </radialGradient>
      </defs>

      {/* Top Hanging Pearl Strand */}
      <path
        d="M20 0 Q40 40 50 80"
        stroke="url(#pearlWhite)"
        strokeWidth="3.5"
        strokeDasharray="4 3"
      />

      {/* Upper Crescent Maang Tikka / Mathapatti Arc */}
      <g transform="translate(60, 70)">
        <path
          d="M-25 -25 C-5 -35, 20 -20, 30 5 C15 5, -5 -5, -25 -25 Z"
          fill="url(#jewelGold)"
          stroke="#fff4cc"
          strokeWidth="0.8"
        />
        {/* Seed Pearls around outer rim */}
        {[-22, -14, -6, 2, 10, 18, 26].map((x, idx) => (
          <circle key={idx} cx={x} cy={-24 + idx * 4.5} r="2.5" fill="url(#pearlWhite)" />
        ))}
        {/* Emerald Gem Setting in Crescent */}
        <circle cx="5" cy="-8" r="4.5" fill="url(#emeraldGem)" stroke="url(#jewelGold)" strokeWidth="1.2" />
      </g>

      {/* Middle Kundan Choker Medallion / Bajuband Circle */}
      <g transform="translate(75, 140)">
        <circle cx="0" cy="0" r="28" fill="url(#jewelGold)" stroke="#fff" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="24" fill="none" stroke="#684206" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Center Emerald Gem */}
        <circle cx="0" cy="0" r="13" fill="url(#emeraldGem)" stroke="url(#jewelGold)" strokeWidth="2" />
        {/* Surrounding Ruby & Pearl Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <g key={deg} transform={`rotate(${deg}) translate(0, -21)`}>
            <circle cx="0" cy="0" r="3.2" fill={deg % 90 === 0 ? "url(#rubyGem)" : "url(#pearlWhite)"} />
          </g>
        ))}
      </g>

      {/* Interlocking Pearl Chains Connecting to Lower Jhumka */}
      <path
        d="M75 168 Q65 190 55 220"
        stroke="url(#pearlWhite)"
        strokeWidth="3.2"
        strokeDasharray="4 2.5"
      />
      <path
        d="M85 168 Q95 200 80 230"
        stroke="url(#jewelGold)"
        strokeWidth="2.2"
      />

      {/* Hanging Traditional Gold Bell Jhumka (झुमका) */}
      <g transform="translate(58, 225)">
        {/* Jhumka Top Stud */}
        <circle cx="0" cy="0" r="7" fill="url(#rubyGem)" stroke="url(#jewelGold)" strokeWidth="1.8" />
        <path d="M0 7 L0 14" stroke="url(#jewelGold)" strokeWidth="2.5" />
        {/* Bell Dome Shape */}
        <path
          d="M-18 28 C-18 14, 18 14, 18 28 C14 30, -14 30, -18 28 Z"
          fill="url(#jewelGold)"
          stroke="#ffe699"
          strokeWidth="0.8"
        />
        {/* Filigree ribs on bell */}
        <path d="M-10 28 C-10 18, 0 16, 0 28" stroke="#784b06" strokeWidth="0.8" fill="none" />
        <path d="M10 28 C10 18, 0 16, 0 28" stroke="#784b06" strokeWidth="0.8" fill="none" />
        {/* Hanging Little Pearl Latkan Droplets */}
        {[-14, -9, -4, 0, 4, 9, 14].map((px) => (
          <g key={px} transform={`translate(${px}, 30)`}>
            <line x1="0" y1="0" x2="0" y2="7" stroke="url(#jewelGold)" strokeWidth="1.2" />
            <circle cx="0" cy="9" r="2.2" fill="url(#pearlWhite)" />
          </g>
        ))}
      </g>

      {/* Lower Hanging Kundan Pendant & Silk Tassel */}
      <g transform="translate(58, 275)">
        <circle cx="0" cy="0" r="10" fill="url(#jewelGold)" />
        <circle cx="0" cy="0" r="6" fill="url(#rubyGem)" />
        {/* Hanging Floral Pearls */}
        <path d="M-8 12 Q0 24 0 34" stroke="url(#pearlWhite)" strokeWidth="2.5" strokeDasharray="3 2" />
        <path d="M8 12 Q0 24 0 34" stroke="url(#pearlWhite)" strokeWidth="2.5" strokeDasharray="3 2" />
        <circle cx="0" cy="36" r="4.5" fill="url(#pearlWhite)" />
        <circle cx="0" cy="44" r="3" fill="url(#jewelGold)" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. BAROQUE GILDED OVAL PHOTO FRAME WITH WHITE ROSES
   Antique carved gold frame adorned with white garden roses & golden leaves
   Supports user photo upload or guided placeholder
   ══════════════════════════════════════════════════════════════════════ */
export function BaroqueGildedPhotoFrame({
  photoUrl,
  shape = "oval", // 'oval' | 'rect' | 'heart' | 'arch' | 'circle'
  rotation = -4, // slight aesthetic tilt as in reference
  accentColor = "#d4af37",
  showFlowers = true,
  placeholderText = "Couple Photo Here\n- फोटो येथे टाका -",
  onPhotoClick,
  className = "",
}: {
  photoUrl?: string;
  shape?: "oval" | "rect" | "heart" | "arch" | "circle";
  rotation?: number;
  accentColor?: string;
  showFlowers?: boolean;
  placeholderText?: string;
  onPhotoClick?: () => void;
  className?: string;
}) {
  const getClipRadiusClass = () => {
    switch (shape) {
      case "oval":
        return "rounded-[50%]";
      case "circle":
        return "rounded-full aspect-square";
      case "arch":
        return "rounded-t-full rounded-b-2xl";
      case "heart":
        return "rounded-3xl"; // Styled frame
      case "rect":
      default:
        return "rounded-2xl";
    }
  };

  return (
    <div
      className={`relative inline-block select-none group cursor-pointer transition-transform duration-300 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={onPhotoClick}
      title="फोटो बदलण्यासाठी क्लिक करा (Click to upload/change photo)"
    >
      {/* ── 3D Carved Gold Outer Frame Container ── */}
      <div
        className={`relative p-3 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.7)] transition-all ${getClipRadiusClass()}`}
        style={{
          background: `radial-gradient(ellipse at 35% 30%, #fffbe6 0%, ${accentColor} 45%, #784c07 80%, #ffd978 100%)`,
          boxShadow: `0 0 24px ${accentColor}40, inset 0 2px 6px rgba(255,255,255,0.7), inset 0 -4px 8px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Inner Beaded Carved Molding Ring */}
        <div
          className={`p-1.5 sm:p-2 border-2 border-dashed ${getClipRadiusClass()}`}
          style={{
            borderColor: "#fff4cc",
            background: "linear-gradient(135deg, #593504 0%, #1c0e00 100%)",
          }}
        >
          {/* Photo Aperture Inner Window */}
          <div
            className={`relative overflow-hidden w-44 sm:w-56 h-60 sm:h-72 flex items-center justify-center bg-[#fdfbf7] ${getClipRadiusClass()} shadow-inner`}
            style={{
              boxShadow: "inset 0 4px 14px rgba(0,0,0,0.45)",
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Couple Portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl sm:text-3xl text-gold-600 animate-pulse">📷</span>
                <p className="font-serif text-[13px] sm:text-sm font-bold text-ink-800 leading-tight whitespace-pre-line">
                  {placeholderText}
                </p>
                <span className="inline-block mt-1 text-[10px] font-sans font-semibold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                  फोटो अपलोड करा
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Adorned White Garden Roses & Golden Leaves (as in Reference) ── */}
      {showFlowers && (
        <>
          {/* Top-Left Rose Cluster */}
          <div
            className="absolute -top-4 -left-4 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            style={{ transform: "rotate(15deg)" }}
          >
            <WhiteRoseSvg size={46} />
          </div>

          {/* Golden Laurel Leaves Top-Right */}
          <div className="absolute -top-3 -right-2 pointer-events-none drop-shadow-md">
            <GoldenFoliageSvg size={38} rotation={50} accentColor={accentColor} />
          </div>

          {/* Mid-Left Rose Accent */}
          <div
            className="absolute top-1/2 -left-5 -translate-y-1/2 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            style={{ transform: "rotate(-20deg)" }}
          >
            <WhiteRoseSvg size={38} />
          </div>

          {/* Bottom-Right Golden Leaves Accent */}
          <div className="absolute -bottom-2 -right-3 pointer-events-none drop-shadow-md">
            <GoldenFoliageSvg size={42} rotation={-40} accentColor={accentColor} />
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6. WHITE GARDEN ROSE SVG ORNAMENT
   Layered velvety white rose petals with ivory shading
   ══════════════════════════════════════════════════════════════════════ */
export function WhiteRoseSvg({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="roseIvory" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#fdfbf7" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </radialGradient>
        <radialGradient id="roseCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="70%" stopColor="#fae8ff" />
          <stop offset="100%" stopColor="#f3f4f6" />
        </radialGradient>
      </defs>

      {/* Outer Petals */}
      <circle cx="50" cy="50" r="46" fill="url(#roseIvory)" stroke="#d1d5db" strokeWidth="0.8" />
      <path
        d="M20 50 C20 30, 40 15, 60 20 C75 25, 85 45, 80 65 C70 85, 30 85, 20 50 Z"
        fill="url(#roseIvory)"
        stroke="#cbd5e1"
        strokeWidth="0.8"
      />
      {/* Mid Layer Overlapping Petals */}
      <path
        d="M32 40 C35 25, 65 25, 68 40 C72 55, 60 70, 48 70 C36 70, 28 55, 32 40 Z"
        fill="url(#roseIvory)"
        stroke="#e2e8f0"
        strokeWidth="0.8"
      />
      {/* Inner Heart Rosebud Ruffle */}
      <path
        d="M40 45 C42 36, 58 36, 60 45 C62 54, 55 60, 50 60 C45 60, 38 54, 40 45 Z"
        fill="url(#roseCore)"
        stroke="#d4d4d8"
        strokeWidth="0.8"
      />
      <circle cx="50" cy="48" r="4" fill="#fde68a" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   7. GOLDEN FOLIAGE & LAUREL LEAVES SVG
   ══════════════════════════════════════════════════════════════════════ */
export function GoldenFoliageSvg({
  size = 40,
  rotation = 0,
  accentColor = "#d4af37",
}: {
  size?: number;
  rotation?: number;
  accentColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="leafGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff8db" />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#855406" />
        </linearGradient>
      </defs>
      {/* Stem */}
      <path d="M10 70 Q40 50 65 15" stroke="url(#leafGold)" strokeWidth="2.5" fill="none" />
      {/* Leaf 1 */}
      <path d="M25 55 C22 45, 15 42, 10 45 C15 55, 20 60, 25 55 Z" fill="url(#leafGold)" />
      {/* Leaf 2 */}
      <path d="M35 48 C42 40, 50 42, 52 48 C45 52, 38 52, 35 48 Z" fill="url(#leafGold)" />
      {/* Leaf 3 */}
      <path d="M45 35 C42 25, 32 25, 30 30 C38 38, 42 40, 45 35 Z" fill="url(#leafGold)" />
      {/* Leaf 4 Apex */}
      <path d="M65 15 C60 8, 52 10, 50 16 C58 22, 65 22, 65 15 Z" fill="url(#leafGold)" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   8. GOLDEN LORD GANESHA EMBLEM (Top Center)
   Sacred line art Ganesha with crown and tilak in 24K gold
   ══════════════════════════════════════════════════════════════════════ */
export function GoldenGaneshaEmblem({
  size = 54,
  accentColor = "#d4af37",
  className = "",
}: {
  size?: number;
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_12px_rgba(212,175,55,0.45)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ganeshGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor={accentColor} />
          <stop offset="70%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>

      {/* Royal Crown (मुकुट) */}
      <path
        d="M32 28 L50 8 L68 28 L58 32 L50 24 L42 32 Z"
        fill="url(#ganeshGrad)"
        stroke="#fff"
        strokeWidth="0.8"
      />
      <circle cx="50" cy="18" r="2.5" fill="#fff" />

      {/* Forehead Crescent & Tilak */}
      <path
        d="M38 34 C44 38, 56 38, 62 34"
        stroke="url(#ganeshGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="50" cy="30" r="2" fill="#ef4444" />

      {/* Left Big Ear (कान) */}
      <path
        d="M35 34 C20 34, 15 48, 24 60 C30 68, 38 66, 38 60"
        stroke="url(#ganeshGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right Ear & Sacred Modak */}
      <path
        d="M65 34 C80 34, 85 48, 76 60 C70 68, 62 66, 62 60"
        stroke="url(#ganeshGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Divine Trunk (सोंड) curling gracefully */}
      <path
        d="M48 38 C54 48, 54 62, 45 74 C40 82, 54 90, 62 82 C68 76, 62 70, 56 72"
        stroke="url(#ganeshGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Sacred Modak / Ladoo */}
      <circle cx="70" cy="68" r="4.5" fill="#facc15" stroke="url(#ganeshGrad)" strokeWidth="1" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   9. ORNATE QR CODE BADGE (Bottom Left)
   With ornate gold corner brackets and scan label
   ══════════════════════════════════════════════════════════════════════ */
export function OrnateQrBadge({
  accentColor = "#d4af37",
  label = "RSVP / आमंत्रण तपशीलासाठी\nयेथे स्कॅन करा",
  className = "",
}: {
  accentColor?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 select-none ${className}`}>
      {/* QR Box with Ornate Gold Corners */}
      <div
        className="relative p-2 bg-[#0d0908]/90 border border-gold-500/50 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
        style={{ borderColor: accentColor }}
      >
        {/* 4 Little Gold Corner Flairs */}
        <span
          className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2"
          style={{ borderColor: accentColor }}
        />
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2"
          style={{ borderColor: accentColor }}
        />
        <span
          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2"
          style={{ borderColor: accentColor }}
        />
        <span
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2"
          style={{ borderColor: accentColor }}
        />

        {/* High Contrast Clean White QR Pattern */}
        <div className="w-14 h-14 bg-white p-1 rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-full h-full text-black fill-current" aria-hidden="true">
            <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm9-2h7v7h-7V2zm2 2v3h3V4h-3zM2 13h7v7H2v-7zm2 2v3h3v-3H4zm10-2h2v2h-2v-2zm3 0h3v2h-3v-2zm-3 3h2v4h-2v-4zm5 0h2v2h-2v-2zm0 3h2v1h-2v-1zm-3 0h2v1h-2v-1zm-2 2h4v1h-4v-1zm7-4h1v3h-1v-3z" />
          </svg>
        </div>
      </div>

      {/* Label */}
      <p
        className="font-serif text-[9px] sm:text-[10px] text-center leading-tight whitespace-pre-line tracking-wide"
        style={{ color: accentColor }}
      >
        {label}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   10. GOLD FILIGREE CALLIGRAPHIC DIVIDER
   ══════════════════════════════════════════════════════════════════════ */
export function GoldFiligreeDivider({
  accentColor = "#d4af37",
  className = "",
}: {
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={`w-44 sm:w-56 h-auto drop-shadow-sm ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="divGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0" />
          <stop offset="30%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fff8db" />
          <stop offset="70%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 12 L90 12" stroke="url(#divGold)" strokeWidth="1" />
      <path d="M150 12 L240 12" stroke="url(#divGold)" strokeWidth="1" />
      {/* Center Diamond & Flourish */}
      <g transform="translate(120, 12)">
        <polygon points="0,-5 5,0 0,5 -5,0" fill="url(#divGold)" />
        <circle cx="0" cy="0" r="2" fill="#fff" />
        <path d="M-14 -3 C-8 -6, -8 6, -14 3" stroke="url(#divGold)" strokeWidth="1" fill="none" />
        <path d="M14 -3 C8 -6, 8 6, 14 3" stroke="url(#divGold)" strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
}
