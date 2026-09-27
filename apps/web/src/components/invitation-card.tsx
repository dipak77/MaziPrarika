import type { DesignData } from "@/lib/arch-data";
import { enDate, mrDate, hiDate } from "@/lib/arch-data";
import {
  BaroqueCorner,
  FloralFlourishDivider,
  RoyalGaneshCrest,
  ShreeGaneshayCalligraphy,
  TempleArchTop,
} from "./biodata-ornaments";

/* ═══════════════════════════════════════════════════════════════
   PREMIUM PRIMITIVES — reusable building blocks
═══════════════════════════════════════════════════════════════ */

/* Paper-grain / velvet noise overlay (pure CSS, print-safe, Remotion-safe) */
function GrainOverlay({ tone = "light", opacity = 0.08 }: { tone?: "light" | "dark"; opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage:
          tone === "light"
            ? "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
            : "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}

/* Dual gold border with corner caps — print-safe 3mm inset */
function DualBorder({
  outer = "2px",
  inner = "1px",
  color = "#d4af37",
  outerOpacity = 0.75,
  innerOpacity = 0.45,
  inset = 8,
  insetInner = 13,
  cornerDots = true,
}: {
  outer?: string;
  inner?: string;
  color?: string;
  outerOpacity?: number;
  innerOpacity?: number;
  inset?: number;
  insetInner?: number;
  cornerDots?: boolean;
}) {
  return (
    <>
      <div
        className="absolute rounded-lg"
        style={{ inset: `${inset}px`, border: `${outer} solid ${color}`, opacity: outerOpacity }}
      />
      <div
        className="absolute rounded-md"
        style={{ inset: `${insetInner}px`, border: `${inner} solid ${color}`, opacity: innerOpacity }}
      />
      {cornerDots && (
        <>
          {[
            { top: `${inset - 2}px`, left: `${inset - 2}px` },
            { top: `${inset - 2}px`, right: `${inset - 2}px` },
            { bottom: `${inset - 2}px`, left: `${inset - 2}px` },
            { bottom: `${inset - 2}px`, right: `${inset - 2}px` },
          ].map((s, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute h-2 w-2 rounded-full"
              style={{ ...s, background: color, boxShadow: `0 0 0 3px ${color}33` }}
            />
          ))}
        </>
      )}
    </>
  );
}

/* Monogram medallion — circular crest with initials */
function Monogram({
  a,
  b,
  color = "#d4af37",
  size = 56,
  show = true,
}: {
  a: string;
  b?: string;
  color?: string;
  size?: number;
  show?: boolean;
}) {
  if (!show) return null;
  const initialA = (a.trim()[0] || "").toUpperCase();
  const initialB = (b?.trim()[0] || "").toUpperCase();
  const text = b && initialB ? `${initialA}${initialB}` : initialA;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="1.2" opacity="0.85" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.55" />
        {/* 4 petal markers */}
        {[0, 90, 180, 270].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <circle cx="50" cy="4" r="1.6" fill={color} />
          </g>
        ))}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fontSize={text.length === 2 ? "26" : "32"}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          letterSpacing="2"
          fill={color}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

/* Ornamental divider — 3 variants */
function OrnamentalDivider({
  variant = "flourish",
  color = "#d4af37",
  width = "w-40",
  className = "",
}: {
  variant?: "flourish" | "diamond" | "lotus" | "simple" | "star";
  color?: string;
  width?: string;
  className?: string;
}) {
  if (variant === "simple") {
    return <div className={`mx-auto h-px ${width} ${className}`} style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />;
  }
  if (variant === "diamond") {
    return (
      <div className={`mx-auto flex items-center gap-2 ${width} ${className}`} aria-hidden>
        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
        <span className="h-2 w-2 rotate-45" style={{ background: color }} />
        <span className="h-2.5 w-2.5 rotate-45 ring-1" style={{ background: color, boxShadow: `0 0 0 2px ${color}55` }} />
        <span className="h-2 w-2 rotate-45" style={{ background: color }} />
        <span className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${color})` }} />
      </div>
    );
  }
  if (variant === "lotus") {
    return (
      <svg viewBox="0 0 200 24" className={`mx-auto h-5 ${width} ${className}`} aria-hidden>
        <line x1="0" y1="12" x2="70" y2="12" stroke={color} strokeWidth="0.8" opacity="0.7" />
        <line x1="130" y1="12" x2="200" y2="12" stroke={color} strokeWidth="0.8" opacity="0.7" />
        <g transform="translate(100,12)">
          <path d="M0 -8 Q-4 0 0 8 Q4 0 0 -8" fill={color} opacity="0.9" />
          <path d="M-8 0 Q0 -4 8 0 Q0 4 -8 0" fill={color} opacity="0.7" />
          <circle cx="0" cy="0" r="1.8" fill={color} />
        </g>
        <circle cx="74" cy="12" r="1.2" fill={color} opacity="0.8" />
        <circle cx="126" cy="12" r="1.2" fill={color} opacity="0.8" />
      </svg>
    );
  }
  if (variant === "star") {
    return (
      <div className={`mx-auto flex items-center gap-2 ${width} ${className}`} aria-hidden>
        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
        <StarMark color={color} size={10} />
        <span className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${color})` }} />
      </div>
    );
  }
  // flourish (default)
  return (
    <svg viewBox="0 0 200 16" className={`mx-auto h-4 ${width} ${className}`} aria-hidden>
      <path d="M0 8 Q20 2 40 8 T80 8" stroke={color} fill="none" strokeWidth="0.8" opacity="0.7" />
      <path d="M120 8 Q140 2 160 8 T200 8" stroke={color} fill="none" strokeWidth="0.8" opacity="0.7" />
      <path d="M85 8 Q92 3 100 8 T115 8" stroke={color} fill="none" strokeWidth="1.2" />
      <circle cx="100" cy="8" r="1.8" fill={color} />
      <circle cx="70" cy="8" r="0.9" fill={color} opacity="0.6" />
      <circle cx="130" cy="8" r="0.9" fill={color} opacity="0.6" />
    </svg>
  );
}

function StarMark({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} aria-hidden>
      <path d="M12 2 L13.8 10 L22 12 L13.8 14 L12 22 L10.2 14 L2 12 L10.2 10 Z" fill={color} />
    </svg>
  );
}

/* Smart name — auto-scales long names to fit without clipping */
function SmartName({
  name = "",
  fallback,
  color,
  maxChars = 22,
  foil = true,
  lang,
  className = "",
}: {
  name?: string;
  fallback: string;
  color?: string;
  maxChars?: number;
  foil?: boolean;
  lang?: string;
  className?: string;
}) {
  const safeName = (name ?? "").trim();
  const len = Math.max(1, safeName.length);
  const scale = len > maxChars ? Math.max(0.55, maxChars / len) : 1;
  const useFallback = safeName.length === 0;
  const display = useFallback ? fallback : safeName;

  return (
    <div
      className={`font-marathi-display mx-auto w-full text-center leading-[1.12] ${className}`}
      style={{
        fontSize: `clamp(16px, ${4.8 * scale}vmin, ${28 * scale}px)`,
        fontWeight: 700,
        color: color ?? "inherit",
      }}
    >
      <span className={foil ? "gold-foil" : ""}>{display}</span>
    </div>
  );
}

/* Event-specific icon (rings, cake, home, etc.) */
function EventIcon({ type, color = "#d4af37" }: { type: string; color?: string }) {
  const paths: Record<string, React.ReactNode> = {
    wedding: <><circle cx="10" cy="14" r="5" fill="none" strokeWidth="1.3" /><circle cx="14" cy="14" r="5" fill="none" strokeWidth="1.3" /><path d="M12 6 L13 9 L12 11 L11 9 Z" fill={color} /></>,
    engagement: <><circle cx="12" cy="14" r="6" fill="none" strokeWidth="1.4" /><path d="M12 4 L14 8 L12 10 L10 8 Z" fill={color} /></>,
    birthday: <><path d="M5 12 H19 V20 H5 Z" fill="none" strokeWidth="1.3" /><path d="M5 15 H19" strokeWidth="1" /><path d="M12 6 V9" strokeWidth="1.3" /><circle cx="12" cy="5" r="1.2" fill={color} /></>,
    naming: <><circle cx="12" cy="10" r="3" fill="none" strokeWidth="1.3" /><path d="M8 20 Q8 14 12 14 Q16 14 16 20" fill="none" strokeWidth="1.3" /><path d="M12 7 V5" strokeWidth="1" /><circle cx="12" cy="4" r="1" fill={color} /></>,
    gruhapravesh: <><path d="M4 12 L12 5 L20 12 V20 H4 Z" fill="none" strokeWidth="1.3" /><rect x="10" y="14" width="4" height="6" fill="none" strokeWidth="1.2" /></>,
    thread: <><path d="M6 8 Q12 4 18 8" fill="none" strokeWidth="1.3" /><circle cx="12" cy="15" r="4" fill="none" strokeWidth="1.3" /></>,
    baby: <><circle cx="12" cy="10" r="3" fill="none" strokeWidth="1.3" /><path d="M7 19 Q7 14 12 14 Q17 14 17 19" fill="none" strokeWidth="1.3" /></>,
    haldi: <><circle cx="12" cy="12" r="6" fill="none" strokeWidth="1.3" /><circle cx="12" cy="12" r="2.5" fill={color} opacity="0.8" /></>,
    mehendi: <><circle cx="12" cy="12" r="7" fill="none" strokeWidth="1" /><path d="M12 5 V19 M5 12 H19 M7 7 L17 17 M17 7 L7 17" strokeWidth="0.7" opacity="0.7" /></>,
    reception: <><path d="M6 8 H18 V18 H6 Z" fill="none" strokeWidth="1.3" /><path d="M6 12 H18 M12 8 V18" strokeWidth="0.8" opacity="0.6" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[type] ?? paths.wedding}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Ornamental SVG building blocks (enhanced)
═══════════════════════════════════════════════════════════════ */

function CornerFlourish({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <path d="M4 56C4 30 30 4 56 4" opacity="0.9" />
      <path d="M4 44C4 24 24 4 44 4" opacity="0.55" />
      <path d="M56 4c-6 8-14 10-18 6-4-4-2-12 6-18" opacity="0.8" />
      <circle cx="8" cy="52" r="2.4" fill={color} stroke="none" />
      <circle cx="52" cy="8" r="1.2" fill={color} stroke="none" opacity="0.7" />
    </svg>
  );
}

function PaisleyBand({ color, flip = false }: { color: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 320 14" preserveAspectRatio="none" className={`h-[13px] w-full ${flip ? "rotate-180" : ""}`} aria-hidden>
      <g fill={color}>
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M${i * 32 + 16} 2c4.5 3.4 4.5 6.6 0 10-4.5-3.4-4.5-6.6 0-10Z`} opacity={0.85} />
        ))}
      </g>
      <rect y="6.2" width="320" height="1.4" fill={color} opacity="0.4" />
    </svg>
  );
}

function WarliDancers({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 30" className="h-7 w-full" aria-hidden>
      {[15, 45, 75, 105].map((x) => (
        <g key={x} stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <circle cx={x} cy={7} r={3.4} fill="none" />
          <path d={`M${x} 10.5v7M${x} 13l-5 3.5M${x} 13l5 3.5M${x} 17.5l-4 8M${x} 17.5l4 8`} />
        </g>
      ))}
      <path d="M8 16h104" stroke={color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />
    </svg>
  );
}

function GaneshMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="mx-auto h-11 w-11" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <circle cx="24" cy="24" r="19" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="1.5 2.5" opacity="0.6" />
      <path
        d="M24 10c3 0 5 2.2 5 5 0 2.2-1.3 4-3.2 4.6 2.4.6 4.2 2.8 4.2 5.4 0 3.2-2.7 5.8-6 5.8s-6-2.6-6-5.8c0-2.6 1.8-4.8 4.2-5.4-1.9-.6-3.2-2.4-3.2-4.6 0-2.8 2-5 5-5Z"
        fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"
      />
      <path d="M21 17h6M24 14v6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="1.6" fill={color} />
      <path d="M24 31c0 2-2 4-5 4" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RajmudraSeal({ color, text }: { color: string; text?: string }) {
  return (
    <svg viewBox="0 0 80 80" className="mx-auto h-16 w-16" aria-hidden>
      <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="1.2" opacity="0.7" />
      <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.5" />
      <path
        d="M40 12c4 4 9 5 13 5-3 5-9 7-13 14-4-7-10-9-13-14 4 0 9-1 13-5Z"
        fill={color} opacity="0.9"
      />
      {text && (
        <text x="40" y="44" textAnchor="middle" fontSize="7" fontFamily="Georgia, serif" fontWeight="700" fill={color} letterSpacing="1">
          {text}
        </text>
      )}
      <path d="M40 50v-6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* Traditional Paisley corner flourish */
function PaisleyCorner({ color, size = 48, className = "" }: { color: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={{ width: size, height: size }} aria-hidden>
      <path d="M4 56 Q4 20 40 8 Q32 20 28 32 Q24 44 14 50 Q8 52 4 56 Z" fill={color} opacity="0.85" />
      <path d="M8 54 Q8 28 32 14" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
      <circle cx="22" cy="22" r="2" fill={color} opacity="0.5" />
      <circle cx="30" cy="30" r="1.5" fill={color} opacity="0.4" />
      <circle cx="12" cy="42" r="1.2" fill={color} opacity="0.5" />
    </svg>
  );
}

/* Starfield for night themes */
function StarField({ count = 18, color = "#f0d878" }: { count?: number; color?: string }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    x: 8 + ((i * 37) % 84),
    y: 5 + ((i * 53) % 70),
    r: 0.5 + ((i * 7) % 10) / 10,
    o: 0.25 + ((i * 3) % 6) / 10,
  }));
  return (
    <svg viewBox="0 0 100 80" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={color} opacity={s.o} />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRINT-SAFE CARD FRAME (3mm bleed-ready)
═══════════════════════════════════════════════════════════════ */
function CardFrame({
  id,
  children,
  className = "",
  bg,
  printBg,
  grain = "dark",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  bg: React.CSSProperties["background"];
  printBg?: string;
  grain?: "light" | "dark" | "none";
}) {
  return (
    <div
      id={id}
      className={`relative aspect-[3/4] overflow-hidden rounded-xl shadow-card ${className}`}
      style={{ background: bg }}
    >
      {printBg && (
        <style>{`@media print { #${id ?? "print-card"} { background: ${printBg} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
      )}
      {grain !== "none" && <GrainOverlay tone={grain} opacity={grain === "dark" ? 0.14 : 0.08} />}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THE CARD — main component
═══════════════════════════════════════════════════════════════ */
export function InvitationCard({
  design,
  className = "",
  id,
}: {
  design: DesignData;
  className?: string;
  id?: string;
}) {
  const isCouple = design.eventType === "wedding" || design.eventType === "engagement";
  const isEn = design.lang === "en";
  const isHi = design.lang === "hi";

  const title = isEn
    ? design.eventType === "wedding" ? "॥ Wedding Ceremony ॥"
      : design.eventType === "engagement" ? "॥ Engagement Ceremony ॥"
        : design.eventType === "birthday" ? "॥ Birthday Celebration ॥"
          : design.eventType === "naming" ? "॥ Naming Ceremony ॥"
            : design.eventType === "gruhapravesh" ? "॥ Housewarming Ceremony ॥"
              : design.eventType === "thread" ? "॥ Thread Ceremony ॥"
                : design.eventType === "baby" ? "॥ Baby Shower ॥"
                  : design.eventType === "haldi" ? "॥ Haldi Ceremony ॥"
                    : design.eventType === "mehendi" ? "॥ Mehendi Ceremony ॥"
                      : design.eventType === "reception" ? "॥ Reception ॥"
                        : "॥ Auspicious Celebration ॥"
    : isHi
      ? design.eventType === "wedding" ? "॥ शुभ विवाह ॥"
        : design.eventType === "engagement" ? "॥ शुभ सगाई ॥"
          : design.eventType === "birthday" ? "॥ जन्मदिन उत्सव ॥"
            : design.eventType === "naming" ? "॥ नामकरण संस्कार ॥"
              : design.eventType === "gruhapravesh" ? "॥ गृह प्रवेश उत्सव ॥"
                : design.eventType === "thread" ? "॥ मुंज समारोह ॥"
                  : design.eventType === "baby" ? "॥ गोद भराई ॥"
                    : design.eventType === "haldi" ? "॥ हल्दी समारोह ॥"
                      : design.eventType === "mehendi" ? "॥ मेहंदी समारोह ॥"
                        : design.eventType === "reception" ? "॥ रिसेप्शन ॥"
                          : "॥ शुभ कार्यक्रम ॥"
      : design.eventType === "wedding" ? "॥ शुभ विवाह ॥"
        : design.eventType === "engagement" ? "॥ शुभ साखरपुडा ॥"
          : design.eventType === "birthday" ? "॥ वाढदिवसाचे निमित्त ॥"
            : design.eventType === "naming" ? "॥ नामकरण सोहळा ॥"
              : design.eventType === "gruhapravesh" ? "॥ गृहप्रवेश सोहळा ॥"
                : design.eventType === "thread" ? "॥ मुंज सोहळा ॥"
                  : design.eventType === "baby" ? "॥ बारसे ॥"
                    : design.eventType === "haldi" ? "॥ हळदीचा कार्यक्रम ॥"
                      : design.eventType === "mehendi" ? "॥ मेहंदी सोहळा ॥"
                        : design.eventType === "reception" ? "॥ स्नेहसंमेलन ॥"
                          : "॥ शुभ कार्यक्रम ॥";

  const dateDisplay = isEn ? enDate(design.date) : isHi ? hiDate(design.date) : mrDate(design.date);
  const conj = isEn ? "&" : isHi ? "संग" : "आणि";
  const blessing = design.blessing || (isEn ? "॥ Shri Ganeshaya Namah ॥" : "श्री गणेशाय नमः");
  const hostNotice = design.host
    ? isEn ? `Invited by — ${design.host}` : isHi ? `दर्शनाभिलाषी — ${design.host}` : `विनंती — ${design.host}`
    : isEn ? "The Family" : isHi ? "मेजबान परिवार" : "यजमान कुटुंब";
  const fallbackName = isEn ? "Name here" : isHi ? "नाम यहाँ" : "नाव येथे";
  const fallbackVenue = isEn ? "Venue here" : isHi ? "स्थान यहाँ" : "स्थळ येथे";
  const fallbackTime = isEn ? "Time later" : isHi ? "समय बाद में" : "वेळ नंतर कळवू";

  switch (design.template) {
    /* ─── ROYAL PURPLE ───────────────────────────────────────── */
    case "royal-purple":
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)"
          printBg="#1a0530"
        >
          {/* Velvet glow */}
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 28%, rgba(212,175,55,0.35) 0, transparent 55%), radial-gradient(ellipse at 50% 85%, rgba(180,60,200,0.2) 0, transparent 55%)",
          }} />
          <DualBorder color="#dfb150" />
          <BaroqueCorner color="#dfb150" className="absolute top-2.5 left-2.5 h-12 w-12" />
          <BaroqueCorner color="#dfb150" className="absolute top-2.5 right-2.5 h-12 w-12 -scale-x-100" />
          <BaroqueCorner color="#dfb150" className="absolute bottom-2.5 left-2.5 h-12 w-12 -scale-y-100" />
          <BaroqueCorner color="#dfb150" className="absolute bottom-2.5 right-2.5 h-12 w-12 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <ShreeGaneshayCalligraphy color="#f3e1a6" />
            <OrnamentalDivider variant="lotus" color="#dfb150" width="w-44" className="my-3" />
            <EventIcon type={design.eventType} color="#dfb150" />
            <p className="font-marathi-display mt-2 text-[14px] font-semibold text-gold-200">{title}</p>
            <Monogram a={design.personA} b={isCouple ? design.personB : undefined} color="#dfb150" size={48} show={isCouple} />
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[15px] text-gold-300 italic">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <OrnamentalDivider variant="diamond" color="#dfb150" width="w-32" className="mt-4" />
            <div className="mt-3 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/60">{design.city}</p>}
              <p className="pt-1 text-[11px] text-gold-200/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── TEMPLE GOLD ────────────────────────────────────────── */
    case "temple-gold":
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(180deg, #420f18 0%, #29080e 55%, #170307 100%)"
          printBg="#2a0810"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(252,237,184,0.22) 0, transparent 55%)",
          }} />
          <div className="absolute inset-x-0 top-0">
            <TempleArchTop color="#fcedb8" fillTone="#330b13" />
            <div className="absolute top-2 inset-x-0 flex justify-center">
              <RoyalGaneshCrest color="#fcedb8" size={38} />
            </div>
          </div>
          <div className="absolute inset-[8px] rounded-lg border border-gold-500/40" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-12 text-center">
            <p className="text-[11px] font-bold tracking-[0.22em] text-gold-300">{blessing}</p>
            <p className="font-marathi-display mt-1 text-[15px] font-semibold text-gold-200">{title}</p>
            <div className="my-2 w-full max-w-[200px]">
              <FloralFlourishDivider color="#d4af37" />
            </div>
            <EventIcon type={design.eventType} color="#d4af37" />
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-gold-300">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <div className="my-2 w-full max-w-[200px]">
              <FloralFlourishDivider color="#d4af37" className="rotate-180" />
            </div>
            <div className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/60">{design.city}</p>}
              <p className="pt-1 text-[11px] text-gold-200/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── MIDNIGHT NAVY ──────────────────────────────────────── */
    case "midnight-navy":
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(170deg, #131a38 0%, #0c1126 55%, #060914 100%)"
          printBg="#0c1126"
        >
          <StarField count={24} color="#d8e4ff" />
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 15%, rgba(220,200,160,0.22) 0, transparent 55%)",
          }} />
          <DualBorder color="#d4af37" outerOpacity={0.7} innerOpacity={0.35} />
          <BaroqueCorner color="#d4af37" className="absolute top-2.5 left-2.5 h-12 w-12" />
          <BaroqueCorner color="#d4af37" className="absolute top-2.5 right-2.5 h-12 w-12 -scale-x-100" />
          <BaroqueCorner color="#d4af37" className="absolute bottom-2.5 left-2.5 h-12 w-12 -scale-y-100" />
          <BaroqueCorner color="#d4af37" className="absolute bottom-2.5 right-2.5 h-12 w-12 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <RoyalGaneshCrest color="#d4af37" size={40} />
            <p className="mt-2 text-[11px] font-bold tracking-[0.25em] text-gold-300 uppercase">{blessing}</p>
            <OrnamentalDivider variant="star" color="#d4af37" width="w-40" className="my-3" />
            <p className="font-marathi-display text-[15px] text-gold-200">{title}</p>
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-gold-300">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <div className="mt-4 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/60">{design.city}</p>}
              <p className="pt-1 text-[11px] text-gold-200/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── HERITAGE MAROON ────────────────────────────────────── */
    case "heritage-maroon":
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(165deg, #4a0b15 0%, #2f060d 55%, #1a0308 100%)"
          printBg="#2a050c"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(212,175,55,0.28) 0, transparent 55%)",
          }} />
          <DualBorder color="#dfb150" />
          <PaisleyCorner color="#dfb150" size={44} className="absolute top-2.5 left-2.5" />
          <PaisleyCorner color="#dfb150" size={44} className="absolute top-2.5 right-2.5 -scale-x-100" />
          <PaisleyCorner color="#dfb150" size={44} className="absolute bottom-2.5 left-2.5 -scale-y-100" />
          <PaisleyCorner color="#dfb150" size={44} className="absolute bottom-2.5 right-2.5 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <RoyalGaneshCrest color="#dfb150" size={40} />
            <p className="mt-2 text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">{blessing}</p>
            <OrnamentalDivider variant="flourish" color="#dfb150" width="w-40" className="my-3" />
            <p className="font-marathi-display text-[15.5px] text-gold-200">{title}</p>
            {isCouple && <Monogram a={design.personA} b={design.personB} color="#dfb150" size={50} />}
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-gold-300">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <OrnamentalDivider variant="diamond" color="#dfb150" width="w-28" className="mt-4" />
            <div className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/60">{design.city}</p>}
              <p className="pt-1 text-[11px] text-gold-200/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── WARLI ──────────────────────────────────────────────── */
    case "warli":
      return (
        <CardFrame
          id={id}
          className={`${className}`}
          bg="linear-gradient(170deg, #f4eadb 0%, #ebddbf 50%, #dcc89a 100%)"
          printBg="#ebddbf"
          grain="none"
        >
          <div className="absolute inset-[7px] rounded-lg border-2 border-[#a4552e]/70" />
          <div className="absolute inset-[13px] rounded-md border border-[#a4552e]/40" />
          <div className="absolute inset-x-6 top-5 opacity-80"><WarliDancers color="#8a4524" /></div>
          <div className="absolute inset-x-6 bottom-5 rotate-180 opacity-80"><WarliDancers color="#8a4524" /></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#8a4524]">{blessing}</p>
            <OrnamentalDivider variant="simple" color="#8a4524" width="w-24" className="my-3" />
            <EventIcon type={design.eventType} color="#8a4524" />
            <p className="font-marathi-display mt-2 text-[15px] text-[#6d3418]">{title}</p>
            <SmartName name={design.personA} fallback={fallbackName} foil={false} lang={design.lang} color="#4a2312" className="mt-4" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1.5 text-[14px] text-[#8a4524]">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil={false} lang={design.lang} color="#4a2312" />
              </>
            )}
            <div className="mt-5 space-y-1 text-[12.5px] leading-relaxed text-[#5f3c22]">
              <p className="font-semibold">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-[#6d3418]/80">{design.city}</p>}
              <p className="pt-1 text-[11px] text-[#8a4524]/90">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── SHUBHRA (minimalist ivory) ─────────────────────────── */
    case "shubhra":
      return (
        <CardFrame
          id={id}
          className={`bg-ivory-50 ring-1 ring-ink-900/10 ${className}`}
          bg="linear-gradient(180deg, #fdfbf4 0%, #f7f1e1 100%)"
          printBg="#faf5e8"
          grain="none"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />
          <CornerFlourish className="absolute top-5 left-5 h-10 w-10 text-gold-500" color="currentColor" />
          <CornerFlourish className="absolute right-5 bottom-5 h-10 w-10 rotate-180 text-gold-500" color="currentColor" />
          <CornerFlourish className="absolute top-5 right-5 h-10 w-10 -scale-x-100 text-gold-500" color="currentColor" />
          <CornerFlourish className="absolute bottom-5 left-5 h-10 w-10 -scale-y-100 text-gold-500" color="currentColor" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <p className="text-[10.5px] font-extrabold tracking-[0.34em] text-ink-500 uppercase">
              {design.city || (isEn ? "Pune" : "पुणे")} · {design.date ? new Date(design.date + "T00:00:00").getFullYear() : ""}
            </p>
            <div className="mt-4 h-10 w-px bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
            <EventIcon type={design.eventType} color="#a78742" />
            <h3 className="font-display mt-4 text-[clamp(20px,4.8vmin,29px)] leading-tight font-medium text-ink-900">
              {design.personA.split(" ").slice(0, 2).join(" ") || fallbackName}
            </h3>
            {isCouple && (
              <>
                <p className="font-display my-1 text-[15px] text-gold-600 italic">&amp;</p>
                <h3 className="font-display text-[clamp(20px,4.8vmin,29px)] leading-tight font-medium text-ink-900">
                  {design.personB.split(" ").slice(0, 2).join(" ") || fallbackName}
                </h3>
              </>
            )}
            <div className="mt-5 h-px w-24 bg-ink-900/20" />
            <p className="font-marathi-display mt-4 text-[14px] text-maroon-800">{title}</p>
            <div className="mt-3 space-y-0.5 text-[12px] text-ink-500">
              <p className="font-semibold text-ink-700">{dateDisplay}</p>
              <p>{design.time || "—"} · {design.venue || fallbackVenue}</p>
            </div>
          </div>
          <p className="absolute bottom-6 inset-x-0 text-center text-[10.5px] tracking-[0.22em] text-ink-400 uppercase">
            {design.host || (isEn ? "The Family" : "यजमान कुटुंब")}
          </p>
        </CardFrame>
      );

    /* ─── RAJMUDRA ───────────────────────────────────────────── */
    case "rajmudra":
      return (
        <CardFrame
          id={id}
          className={`bg-maroon-950 ${className}`}
          bg="linear-gradient(180deg, #2a0508 0%, #1a0306 100%)"
          printBg="#1a0306"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            background: "radial-gradient(at 50% 0%, rgb(199 162 79 / 0.28) 0, transparent 52%), radial-gradient(at 50% 100%, rgb(138 47 58 / 0.5) 0, transparent 56%)",
          }} />
          <DualBorder color="#d9b96c" outerOpacity={0.6} innerOpacity={0.3} />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <RajmudraSeal color="#d9b96c" text={isEn ? "ROYAL" : isHi ? "शाही" : "राज"} />
            <p className="mt-3 text-[10.5px] font-bold tracking-[0.3em] text-gold-400/90 uppercase">{blessing}</p>
            <EventIcon type={design.eventType} color="#d9b96c" />
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-gold-400">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-500/50" />
              <span className="font-marathi-display text-[14px] text-ivory-100">{title}</span>
              <span className="h-px w-10 bg-gold-500/50" />
            </div>
            <div className="mt-3 space-y-0.5 text-[12px] text-ivory-100/75">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || "—"} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/50">{design.city}</p>}
            </div>
          </div>
          <p className="absolute bottom-5 inset-x-0 text-center text-[10.5px] tracking-[0.2em] text-gold-400/80">{hostNotice}</p>
        </CardFrame>
      );

    /* ─── EMERALD GARDEN (NEW) ───────────────────────────────── */
    case "emerald-garden":
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(165deg, #0a3d1f 0%, #062812 55%, #031508 100%)"
          printBg="#062812"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(242,201,76,0.28) 0, transparent 55%), radial-gradient(ellipse at 50% 90%, rgba(7,102,45,0.35) 0, transparent 55%)",
          }} />
          <DualBorder color="#e6c45c" />
          <BaroqueCorner color="#e6c45c" className="absolute top-2.5 left-2.5 h-12 w-12" />
          <BaroqueCorner color="#e6c45c" className="absolute top-2.5 right-2.5 h-12 w-12 -scale-x-100" />
          <BaroqueCorner color="#e6c45c" className="absolute bottom-2.5 left-2.5 h-12 w-12 -scale-y-100" />
          <BaroqueCorner color="#e6c45c" className="absolute bottom-2.5 right-2.5 h-12 w-12 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <GaneshMark color="#e6c45c" />
            <p className="mt-2 text-[11px] font-bold tracking-[0.22em] text-gold-300">{blessing}</p>
            <OrnamentalDivider variant="lotus" color="#e6c45c" width="w-40" className="my-3" />
            <EventIcon type={design.eventType} color="#e6c45c" />
            <p className="font-marathi-display mt-2 text-[15px] text-gold-200">{title}</p>
            {isCouple && <Monogram a={design.personA} b={design.personB} color="#e6c45c" size={50} />}
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-gold-300">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <OrnamentalDivider variant="diamond" color="#e6c45c" width="w-28" className="mt-4" />
            <div className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/60">{design.city}</p>}
              <p className="pt-1 text-[11px] text-gold-200/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── SAPPHIRE MOON (NEW) ────────────────────────────────── */
    case "sapphire-moon":
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(170deg, #0c1e4a 0%, #081538 55%, #040a22 100%)"
          printBg="#081538"
        >
          <StarField count={30} color="#e6efff" />
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 70% 15%, rgba(220,228,255,0.22) 0, transparent 45%), radial-gradient(ellipse at 30% 85%, rgba(80,120,200,0.25) 0, transparent 55%)",
          }} />
          {/* Silver border */}
          <DualBorder color="#c5d4f0" outerOpacity={0.6} innerOpacity={0.3} />
          <BaroqueCorner color="#c5d4f0" className="absolute top-2.5 left-2.5 h-12 w-12" />
          <BaroqueCorner color="#c5d4f0" className="absolute top-2.5 right-2.5 h-12 w-12 -scale-x-100" />
          <BaroqueCorner color="#c5d4f0" className="absolute bottom-2.5 left-2.5 h-12 w-12 -scale-y-100" />
          <BaroqueCorner color="#c5d4f0" className="absolute bottom-2.5 right-2.5 h-12 w-12 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            {/* Crescent moon accent */}
            <svg viewBox="0 0 40 40" className="mx-auto h-10 w-10" aria-hidden>
              <path d="M26 8 A14 14 0 1 0 26 32 A10 10 0 1 1 26 8 Z" fill="#e6efff" opacity="0.9" />
              <circle cx="30" cy="10" r="0.8" fill="#f0d878" />
              <circle cx="34" cy="14" r="0.5" fill="#f0d878" />
            </svg>
            <p className="mt-2 text-[11px] font-bold tracking-[0.25em] text-slate-200 uppercase">{blessing}</p>
            <OrnamentalDivider variant="star" color="#c5d4f0" width="w-36" className="my-3" />
            <EventIcon type={design.eventType} color="#c5d4f0" />
            <p className="font-marathi-display mt-2 text-[15px] text-slate-200">{title}</p>
            <SmartName name={design.personA} fallback={fallbackName} color="#f5f9ff" foil={false} lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-slate-300">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} color="#f5f9ff" foil={false} lang={design.lang} />
              </>
            )}
            <div className="mt-4 space-y-1 text-[12.5px] leading-relaxed text-slate-100/85">
              <p className="font-semibold text-slate-100">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-slate-300/70">{design.city}</p>}
              <p className="pt-1 text-[11px] text-slate-200/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── ROSE PETAL (NEW) ───────────────────────────────────── */
    case "rose-petal":
      return (
        <CardFrame
          id={id}
          className={`text-maroon-900 ${className}`}
          bg="linear-gradient(165deg, #fce4ec 0%, #f8c9d4 50%, #f0a8bc 100%)"
          printBg="#f8c9d4"
          grain="none"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.45) 0, transparent 55%)",
          }} />
          <DualBorder color="#c2185b" outerOpacity={0.55} innerOpacity={0.3} />
          <BaroqueCorner color="#c2185b" className="absolute top-2.5 left-2.5 h-12 w-12" />
          <BaroqueCorner color="#c2185b" className="absolute top-2.5 right-2.5 h-12 w-12 -scale-x-100" />
          <BaroqueCorner color="#c2185b" className="absolute bottom-2.5 left-2.5 h-12 w-12 -scale-y-100" />
          <BaroqueCorner color="#c2185b" className="absolute bottom-2.5 right-2.5 h-12 w-12 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <GaneshMark color="#ad1457" />
            <p className="mt-2 text-[11px] font-bold tracking-[0.22em] text-[#ad1457]">{blessing}</p>
            <OrnamentalDivider variant="lotus" color="#c2185b" width="w-40" className="my-3" />
            <EventIcon type={design.eventType} color="#ad1457" />
            <p className="font-marathi-display mt-2 text-[15px] font-semibold text-[#ad1457]">{title}</p>
            {isCouple && <Monogram a={design.personA} b={design.personB} color="#ad1457" size={48} />}
            <SmartName name={design.personA} fallback={fallbackName} color="#880e4f" foil={false} lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[15px] text-[#ad1457] italic">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} color="#880e4f" foil={false} lang={design.lang} />
              </>
            )}
            <OrnamentalDivider variant="diamond" color="#c2185b" width="w-28" className="mt-4" />
            <div className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-[#6d0a3d]">
              <p className="font-semibold text-[#880e4f]">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-[#ad1457]/70">{design.city}</p>}
              <p className="pt-1 text-[11px] text-[#ad1457]/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── IVORY ROYAL (NEW) ──────────────────────────────────── */
    case "ivory-royal":
      return (
        <CardFrame
          id={id}
          className={`text-ink-900 ${className}`}
          bg="linear-gradient(180deg, #fdf8ec 0%, #f4e9cf 50%, #ebdcb5 100%)"
          printBg="#f4e9cf"
          grain="none"
        >
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(ellipse at 50% 15%, rgba(212,175,55,0.18) 0, transparent 55%)",
          }} />
          <DualBorder color="#8a6a2b" outerOpacity={0.6} innerOpacity={0.35} />
          <PaisleyCorner color="#8a6a2b" size={42} className="absolute top-2.5 left-2.5" />
          <PaisleyCorner color="#8a6a2b" size={42} className="absolute top-2.5 right-2.5 -scale-x-100" />
          <PaisleyCorner color="#8a6a2b" size={42} className="absolute bottom-2.5 left-2.5 -scale-y-100" />
          <PaisleyCorner color="#8a6a2b" size={42} className="absolute bottom-2.5 right-2.5 -scale-x-100 -scale-y-100" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <RoyalGaneshCrest color="#8a6a2b" size={36} />
            <p className="mt-2 text-[11px] font-bold tracking-[0.22em] text-[#8a6a2b]">{blessing}</p>
            <OrnamentalDivider variant="flourish" color="#8a6a2b" width="w-40" className="my-3" />
            <EventIcon type={design.eventType} color="#8a6a2b" />
            <p className="font-marathi-display mt-2 text-[15.5px] font-semibold text-[#6b4f1a]">{title}</p>
            {isCouple && <Monogram a={design.personA} b={design.personB} color="#8a6a2b" size={52} />}
            <SmartName name={design.personA} fallback={fallbackName} color="#3d2a0a" foil={false} lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[15px] text-[#8a6a2b] italic">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} color="#3d2a0a" foil={false} lang={design.lang} />
              </>
            )}
            <OrnamentalDivider variant="diamond" color="#8a6a2b" width="w-28" className="mt-4" />
            <div className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-[#5a4014]">
              <p className="font-semibold text-[#6b4f1a]">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-[#8a6a2b]/70">{design.city}</p>}
              <p className="pt-1 text-[11px] text-[#8a6a2b]/80">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );

    /* ─── PAITHANI (default) ─────────────────────────────────── */
    default:
      return (
        <CardFrame
          id={id}
          className={`text-ivory-100 ${className}`}
          bg="linear-gradient(170deg, #5c1420 0%, #430d15 55%, #2e070d 100%)"
          printBg="#3d0b15"
        >
          {/* Authentic zari border */}
          <div className="absolute inset-0" style={{
            border: "9px solid transparent",
            borderImage: "repeating-linear-gradient(45deg, #c7a24f 0 6px, #8a6a2b 6px 12px, #e8d189 12px 14px) 9",
          }} />
          <div className="absolute inset-[13px] rounded-md border border-gold-400/60" />
          <div className="absolute inset-x-[13px] top-[13px] pt-2"><PaisleyBand color="#d9b96c" /></div>
          <div className="absolute inset-x-[13px] bottom-[13px] pb-2"><PaisleyBand color="#d9b96c" flip /></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <GaneshMark color="#e6cf92" />
            <p className="mt-2 text-[11px] font-bold tracking-[0.22em] text-gold-300">{blessing}</p>
            <OrnamentalDivider variant="lotus" color="#d9b96c" width="w-36" className="my-3" />
            <EventIcon type={design.eventType} color="#e6cf92" />
            <p className="font-marathi-display mt-2 text-[15.5px] text-gold-200">{title}</p>
            {isCouple && <Monogram a={design.personA} b={design.personB} color="#e6cf92" size={50} />}
            <SmartName name={design.personA} fallback={fallbackName} foil lang={design.lang} className="mt-3" />
            {isCouple && (
              <>
                <p className="font-marathi-display my-1.5 text-[14px] text-gold-300">{conj}</p>
                <SmartName name={design.personB} fallback={fallbackName} foil lang={design.lang} />
              </>
            )}
            <OrnamentalDivider variant="diamond" color="#d9b96c" width="w-28" className="mt-5" />
            <div className="mt-2 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              {design.city && <p className="text-[11px] text-ivory-100/60">{design.city}</p>}
              <p className="pt-1.5 text-[11px] text-gold-200/85">{hostNotice}</p>
            </div>
          </div>
        </CardFrame>
      );
  }
}