"use client";

import React, { useState } from "react";
import {
  type BiodataData,
  BIODATA_LABELS,
  BIODATA_TEMPLATES,
} from "@/lib/biodata-data";
import {
  BaroqueCorner,
  CornerFlourish,
  DiyaFlame,
  FloralFlourishDivider,
  GaneshWatermark,
  GoldPillBadge,
  KalashOrnament,
  LaceFretworkBorder,
  LotusBloom,
  MandalaWatermark,
  MarigoldGarland,
  OmCrest,
  PaisleyBand,
  PaisleyCorner,
  RoyalGaneshCrest,
  RoyalSeal,
  ShreeGaneshayCalligraphy,
  TempleArchTop,
  ZariBorder,
} from "./biodata-ornaments";

/* ═══════════════════════════════════════════════════════════════
   PREMIUM PRIMITIVES
═══════════════════════════════════════════════════════════════ */

/** Paper-grain / velvet texture — print-safe, Remotion-safe */
function Grain({ tone = "dark", opacity = 0.06 }: { tone?: "light" | "dark"; opacity?: number }) {
  const svg = tone === "light"
    ? "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"
    : "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{ opacity, backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")` }} />
  );
}

/** Smart data row — auto-hides empty values */
function Row({
  label, value, labelColor = "text-gold-300", valueColor = "text-ivory-100",
}: { label: string; value?: string | null; labelColor?: string; valueColor?: string }) {
  if (!value || value.trim().length === 0) return null;
  return (
    <div className="grid grid-cols-[105px_1fr] sm:grid-cols-[135px_1fr] items-baseline gap-2 py-0.5 text-[11px] sm:text-[12.5px] leading-tight">
      <span className={`shrink-0 font-semibold ${labelColor}`}>{label}</span>
      <span className={`break-words font-normal ${valueColor}`}>{value}</span>
    </div>
  );
}

/** Section title with flanking hairlines */
function SectionTitle({
  children, color = "text-gold-300", line = "#d4af37", center = true, className = "",
}: { children: React.ReactNode; color?: string; line?: string; center?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : ""} ${className}`}>
      <span aria-hidden className="h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${line})` }} />
      <h3 className={`font-marathi-display text-xs font-bold tracking-wider uppercase ${color}`}>
        ॥ {children} ॥
      </h3>
      <span aria-hidden className="h-px w-10" style={{ background: `linear-gradient(270deg, transparent, ${line})` }} />
    </div>
  );
}

/** Photo placeholder */
function Placeholder({ name, gender, shape }: { name: string; gender: "groom" | "bride"; shape: "circle" | "square" | "arch" }) {
  const initial = name.trim().charAt(0) || (gender === "groom" ? "व" : "क");
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-gold-500/25 via-maroon-900/60 to-gold-600/30 font-display font-bold text-gold-300 shadow-inner ${shape === "circle" ? "rounded-full" : shape === "arch" ? "rounded-t-full rounded-b-lg" : "rounded-md"
      }`}>
      <span className="text-3xl drop-shadow sm:text-4xl">{initial}</span>
    </div>
  );
}

/** Unified photo frame */
function PhotoFrame({
  src, name, gender, shape = "circle", size = "size-24 sm:size-28", failed, onError, glow = true,
}: {
  src?: string | null; name: string; gender: "groom" | "bride";
  shape?: "circle" | "square" | "arch"; size?: string;
  failed: boolean; onError: () => void; glow?: boolean;
}) {
  const ringRadius = shape === "circle" ? "rounded-full" : shape === "arch" ? "rounded-t-full rounded-b-lg" : "rounded-md";
  const innerRadius = shape === "circle" ? "rounded-full" : shape === "arch" ? "rounded-t-full rounded-b-md" : "rounded-sm";
  const hasPhoto = Boolean(src && !failed);
  return (
    <div className={`relative ${size} bg-gradient-to-tr from-gold-600 via-gold-300 to-gold-500 p-[3px] ${ringRadius} ${glow ? "shadow-[0_0_18px_rgba(212,175,55,0.45)]" : "shadow-md"
      }`}>
      <div className={`relative h-full w-full overflow-hidden bg-maroon-950 ${innerRadius}`}>
        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src!} alt={name} className="h-full w-full object-cover" onError={onError} />
        ) : (
          <Placeholder name={name} gender={gender} shape={shape} />
        )}
      </div>
    </div>
  );
}

/** Dual gold border + corner dots */
function DualBorder({ color = "#d4af37", outerOpacity = 0.7, innerOpacity = 0.35 }: { color?: string; outerOpacity?: number; innerOpacity?: number }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-[6px] rounded-xl border-2" style={{ borderColor: color, opacity: outerOpacity }} />
      <div className="pointer-events-none absolute inset-[10px] rounded-lg border" style={{ borderColor: color, opacity: innerOpacity }} />
      {[{ top: 4, left: 4 }, { top: 4, right: 4 }, { bottom: 4, left: 4 }, { bottom: 4, right: 4 }].map((s, i) => (
        <span key={i} aria-hidden className="absolute h-1.5 w-1.5 rounded-full" style={{ ...s, background: color, boxShadow: `0 0 0 3px ${color}33` }} />
      ))}
    </>
  );
}

/** Star scatter */
function StarField({ count = 22, color = "#d8e4ff" }: { count?: number; color?: string }) {
  const pts = Array.from({ length: count }, (_, i) => ({
    x: 5 + ((i * 37) % 90),
    y: 4 + ((i * 53) % 72),
    r: 0.4 + ((i * 7) % 10) / 12,
    o: 0.15 + ((i * 3) % 6) / 12,
  }));
  return (
    <svg viewBox="0 0 100 80" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={color} opacity={p.o} />)}
    </svg>
  );
}

/** Couple monogram medallion */
function Monogram({ a, b, color, size = 52 }: { a: string; b?: string; color: string; size?: number }) {
  if (!b) return null;
  const iA = (a.trim()[0] || "").toUpperCase();
  const iB = (b.trim()[0] || "").toUpperCase();
  if (!iA) return null;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto" style={{ width: size, height: size }} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="1.2" opacity="0.85" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.55" />
      {[0, 90, 180, 270].map((d) => (
        <g key={d} transform={`rotate(${d} 50 50)`}>
          <circle cx="50" cy="4" r="1.6" fill={color} />
        </g>
      ))}
      <text x="50" y="58" textAnchor="middle" fontSize={iB ? "24" : "30"}
        fontFamily="Georgia,'Times New Roman',serif" fontWeight="700" letterSpacing="2" fill={color}>
        {iB ? `${iA}${iB}` : iA}
      </text>
    </svg>
  );
}

const SHELL = "relative mx-auto w-full max-w-[540px] select-none overflow-hidden rounded-2xl shadow-premium print:max-w-none print:rounded-none print:shadow-none";

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — 8 Museum-Grade Templates
═══════════════════════════════════════════════════════════════ */
export function BiodataCard({ data, className = "", id }: { data: BiodataData; className?: string; id?: string }) {
  const [photoError, setPhotoError] = useState(false);
  const t = BIODATA_LABELS[data.lang] || BIODATA_LABELS.mr;
  const isEn = data.lang === "en";
  const isHi = data.lang === "hi";

  const templateConfig = BIODATA_TEMPLATES.find((tpl) => tpl.id === data.template) ?? BIODATA_TEMPLATES[0]!;
  const onPhotoError = () => setPhotoError(true);

  /* ── Composed values ── */
  const casteFull = data.subCaste ? `${data.caste} (${data.subCaste})` : data.caste;
  const rashiFull = data.nakshatra ? `${data.rashi} / ${data.nakshatra}` : data.rashi;
  const fatherFull = data.fatherOccupation ? `${data.fatherName} (${data.fatherOccupation})` : data.fatherName;
  const motherFull = data.motherOccupation ? `${data.motherName} (${data.motherOccupation})` : data.motherName;
  const addressFull = data.city ? `${data.address}, ${data.city}` : data.address;
  const blessingLine = data.blessing || (isEn ? "॥ Shri Ganeshaya Namah ॥" : "॥ श्री गणेशाय नमः ॥");
  const docTitle = data.title || (isEn ? "Marriage Biodata" : isHi ? "विवाह बायोडाटा" : "विवाह बायोडाटा");

  /* ═══ 1 · ROYAL PURPLE — OmCrest + Lotus + Diya + RoyalSeal ═══ */
  if (data.template === "royal-purple") {
    return (
      <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
        style={{ background: "linear-gradient(165deg, #3a0e5c 0%, #220838 55%, #14041f 100%)" }}>
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 50% 20%, rgba(212,175,55,0.4) 0, transparent 45%), radial-gradient(circle at 50% 80%, rgba(212,175,55,0.25) 0, transparent 50%)",
          opacity: 0.15,
        }} />
        <MandalaWatermark color="#dfb150" className="absolute inset-0" opacity={0.05} />
        <Grain tone="dark" opacity={0.12} />
        <DualBorder color="#dfb150" />

        <BaroqueCorner color="#dfb150" className="absolute top-2 left-2" variant="royal" />
        <BaroqueCorner color="#dfb150" className="absolute top-2 right-2 -scale-x-100" variant="royal" />
        <BaroqueCorner color="#dfb150" className="absolute bottom-2 left-2 -scale-y-100" variant="royal" />
        <BaroqueCorner color="#dfb150" className="absolute bottom-2 right-2 -scale-x-100 -scale-y-100" variant="royal" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <ShreeGaneshayCalligraphy color="#f3e1a6" variant="royal" />

          {/* Om crest beneath calligraphy */}
          <div className="mt-1">
            <OmCrest color="#dfb150" size={44} animate />
          </div>

          <div className="mt-4 flex justify-center">
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="circle" failed={photoError} onError={onPhotoError} />
          </div>

          <div className="mt-3 text-center">
            <FloralFlourishDivider color="#dfb150" variant="lotus" />
            <h2 className="font-marathi-display my-1 text-xl font-bold tracking-wide sm:text-2xl">
              <span className="gold-foil">{data.fullName}</span>
            </h2>
            <FloralFlourishDivider color="#dfb150" variant="lotus" className="rotate-180" />
            {data.education && <p className="mt-1 text-xs font-medium text-gold-200/90">{data.education}</p>}
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-4" shimmer icon={<span>👤</span>}>
            {t.sectionPersonal}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-3">
            <Row label={t.dob} value={data.dob} />
            <Row label={t.tob} value={data.tob} />
            <Row label={t.pob} value={data.pob} />
            <Row label={t.height} value={data.height} />
            <Row label={t.complexion} value={data.complexion} />
            <Row label={t.caste} value={casteFull} />
            <Row label={t.gotra} value={data.gotra} />
            <Row label={t.rashi} value={rashiFull} />
            <Row label={t.mangal} value={data.mangal} />
            <Row label={t.occupation} value={data.occupation} />
            <Row label={t.company} value={data.company} />
            <Row label={t.annualIncome} value={data.annualIncome} />
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-4" shimmer icon={<span>👨‍👩‍👧</span>}>
            {t.sectionFamily}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-3">
            <Row label={t.fatherName} value={fatherFull} />
            <Row label={t.motherName} value={motherFull} />
            <Row label={t.brothers} value={data.brothers} />
            <Row label={t.sisters} value={data.sisters} />
            <Row label={t.maternalUncle} value={data.maternalUncle} />
            <Row label={t.relativeSurnames} value={data.relativeSurnames} />
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-4" shimmer icon={<span>📞</span>}>
            {t.sectionContact}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-3">
            <Row label={t.contactPerson} value={data.contactPerson} />
            <Row label={t.phone} value={data.phone} />
            <Row label={t.whatsapp} value={data.whatsapp} />
            <Row label={t.address} value={addressFull} />
          </div>

          {data.aboutMe && (
            <div className="mt-4 border-t border-gold-500/20 px-3 pt-3 text-center">
              <p className="text-[11px] italic leading-relaxed text-ivory-100/75">"{data.aboutMe}"</p>
            </div>
          )}

          {/* Ornamental footer: diya pair + royal seal */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <DiyaFlame color="#dfb150" size={28} animate />
            <RoyalSeal color="#dfb150" size={52} text={isEn ? "ROYAL" : isHi ? "शाही" : "राज"} />
            <DiyaFlame color="#dfb150" size={28} animate />
          </div>
        </div>
      </div>
    );
  }

  /* ═══ 2 · BURGUNDY DAMASK — Marigold garland + pearl lace ═══ */
  if (data.template === "burgundy-damask") {
    return (
      <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
        style={{ background: "linear-gradient(170deg, #48101a 0%, #2e070d 60%, #1c0307 100%)" }}>
        <div className="pointer-events-none absolute inset-0 opacity-12" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.4) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }} />
        <Grain tone="dark" opacity={0.1} />

        <LaceFretworkBorder color="#dfb150" className="absolute inset-x-0 top-1 z-10" variant="pearl" />
        <LaceFretworkBorder color="#dfb150" flip className="absolute inset-x-0 bottom-1 z-10" variant="pearl" />
        <div className="pointer-events-none absolute inset-[8px] rounded-xl border border-gold-500/40" />

        <div className="relative px-6 py-9 sm:px-9 sm:py-11">
          {/* Marigold garland under lace */}
          <MarigoldGarland flowers={13} className="mb-4" />

          <div className="grid grid-cols-[90px_1fr] items-center gap-4 sm:grid-cols-[110px_1fr]">
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="square" size="size-[90px] sm:size-[110px]" failed={photoError} onError={onPhotoError} glow={false} />
            <div className="min-w-0">
              <h2 className="font-marathi-display text-xl font-bold leading-tight sm:text-2xl">
                <span className="gold-foil">{data.fullName}</span>
              </h2>
              <p className="mt-1 text-xs font-semibold text-gold-300">{t.dob}: <span className="font-normal text-ivory-100">{data.dob}</span></p>
              {data.pob && <p className="text-xs font-semibold text-gold-300">{t.pob}: <span className="font-normal text-ivory-100">{data.pob}</span></p>}
              {data.occupation && <p className="mt-0.5 truncate text-xs font-medium text-gold-200/90">{data.occupation}</p>}
            </div>
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-6" shimmer icon={<span>👤</span>}>
            {t.sectionPersonal.toUpperCase()}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-2">
            <Row label={t.caste} value={data.caste} />
            <Row label={t.subCaste} value={data.subCaste} />
            <Row label={t.rashi} value={data.rashi} />
            <Row label={t.nakshatra} value={data.nakshatra} />
            <Row label={t.gotra} value={data.gotra} />
            <Row label={t.mangal} value={data.mangal} />
            <Row label={t.height} value={data.height} />
            <Row label={t.complexion} value={data.complexion} />
            <Row label={t.education} value={data.education} />
            <Row label={t.occupation} value={data.occupation} />
            <Row label={t.company} value={data.company} />
            <Row label={t.annualIncome} value={data.annualIncome} />
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-5" shimmer icon={<span>👨‍👩‍👧</span>}>
            {t.sectionFamily.toUpperCase()}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-2">
            <Row label={t.fatherName} value={data.fatherName} />
            <Row label={t.fatherOccupation} value={data.fatherOccupation} />
            <Row label={t.motherName} value={data.motherName} />
            <Row label={t.motherOccupation} value={data.motherOccupation} />
            <Row label={t.brothers} value={data.brothers} />
            <Row label={t.sisters} value={data.sisters} />
            <Row label={t.maternalUncle} value={data.maternalUncle} />
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-5" shimmer icon={<span>📞</span>}>
            {t.sectionContact.toUpperCase()}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-2">
            <Row label={t.contactPerson} value={data.contactPerson} />
            <Row label={t.phone} value={data.phone} />
            <Row label={t.whatsapp} value={data.whatsapp} />
            <Row label={t.address} value={addressFull} />
          </div>

          {data.aboutMe && (
            <div className="mt-4 border-t border-gold-500/20 px-2 pt-3 text-center">
              <p className="text-[11px] italic leading-relaxed text-ivory-100/75">"{data.aboutMe}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══ 3 · TEMPLE PORTAL — Arch + bells + kalash flanking photo ═══ */
  if (data.template === "temple-portal") {
    return (
      <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
        style={{ background: "linear-gradient(180deg, #4a1018 0%, #29080e 55%, #170307 100%)" }}>
        <Grain tone="dark" opacity={0.1} />

        <div className="relative w-full">
          <TempleArchTop color="#fcedb8" fillTone="#330b13" variant="royal" />
          <div className="absolute inset-x-0 top-2 flex justify-center">
            <RoyalGaneshCrest color="#fcedb8" size={42} variant="crowned" />
          </div>
        </div>

        {/* Marigold garland hanging from arch */}
        <MarigoldGarland flowers={15} className="relative -mt-2" />

        <div className="pointer-events-none absolute inset-[6px] rounded-xl border border-gold-500/35" />

        <div className="relative -mt-6 px-6 pb-9 sm:px-9 sm:pb-11">
          {/* Kalash flanking the arch photo */}
          <div className="flex items-end justify-center gap-3">
            <KalashOrnament color="#fcedb8" size={40} />
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="arch" failed={photoError} onError={onPhotoError} />
            <KalashOrnament color="#fcedb8" size={40} />
          </div>

          <div className="mt-3 text-center">
            <FloralFlourishDivider color="#d4af37" variant="paisley" />
            <h2 className="font-marathi-display my-1 text-xl font-bold tracking-wide sm:text-2xl">
              <span className="gold-foil">{data.fullName}</span>
            </h2>
            <FloralFlourishDivider color="#d4af37" variant="paisley" className="rotate-180" />
            <p className="mt-1 text-xs text-gold-200">{t.dob}: {data.dob} &nbsp;·&nbsp; {t.pob}: {data.pob}</p>
          </div>

          {/* Personal + Horoscope panel */}
          <div className="mt-5 rounded-xl border border-gold-500/25 bg-maroon-950/40 p-4">
            <SectionTitle>{t.sectionPersonal} व {t.sectionHoroscope}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.tob} value={data.tob} />
              <Row label={t.height} value={data.height} />
              <Row label={t.complexion} value={data.complexion} />
              <Row label={t.caste} value={casteFull} />
              <Row label={t.gotra} value={data.gotra} />
              <Row label={t.rashi} value={rashiFull} />
              <Row label={t.nakshatra} value={data.nakshatra} />
              <Row label={t.mangal} value={data.mangal} />
              <Row label={t.education} value={data.education} />
              <Row label={t.occupation} value={data.occupation} />
              <Row label={t.company} value={data.company} />
              <Row label={t.annualIncome} value={data.annualIncome} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gold-500/25 bg-maroon-950/40 p-4">
            <SectionTitle>{t.sectionFamily}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.fatherName} value={fatherFull} />
              <Row label={t.motherName} value={motherFull} />
              <Row label={t.brothers} value={data.brothers} />
              <Row label={t.sisters} value={data.sisters} />
              <Row label={t.maternalUncle} value={data.maternalUncle} />
              <Row label={t.relativeSurnames} value={data.relativeSurnames} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gold-500/25 bg-maroon-950/40 p-4">
            <SectionTitle>{t.sectionContact}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.contactPerson} value={data.contactPerson} />
              <Row label={t.phone} value={data.phone} />
              <Row label={t.whatsapp} value={data.whatsapp} />
              <Row label={t.address} value={addressFull} />
            </div>
          </div>

          {data.aboutMe && (
            <div className="mt-4 border-t border-gold-500/20 px-2 pt-3 text-center">
              <p className="text-[11px] italic leading-relaxed text-ivory-100/75">"{data.aboutMe}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══ 4 · MIDNIGHT NAVY — Mandala + animated OmCrest + split header ═══ */
  if (data.template === "midnight-navy") {
    return (
      <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
        style={{ background: "linear-gradient(170deg, #141c3c 0%, #0c1126 55%, #060914 100%)" }}>
        <StarField count={30} color="#d8e4ff" />
        <MandalaWatermark color="#d4af37" className="absolute inset-0" opacity={0.04} />
        <GaneshWatermark color="#d4af37" className="pointer-events-none absolute bottom-8 right-2 h-64 w-64 opacity-10" />
        <Grain tone="dark" opacity={0.08} />
        <DualBorder color="#d4af37" outerOpacity={0.6} innerOpacity={0.3} />

        <BaroqueCorner color="#dfb150" className="absolute top-2 left-2" />
        <BaroqueCorner color="#dfb150" className="absolute top-2 right-2 -scale-x-100" />
        <BaroqueCorner color="#dfb150" className="absolute bottom-2 left-2 -scale-y-100" />
        <BaroqueCorner color="#dfb150" className="absolute bottom-2 right-2 -scale-x-100 -scale-y-100" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="text-center">
            <OmCrest color="#dfb150" size={52} animate />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.25em] text-gold-300">
              {data.blessing || "ॐ गणेशाय नमः"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_88px] items-start gap-3 sm:grid-cols-[1fr_110px]">
            <div>
              <h2 className="font-marathi-display text-xl font-bold leading-tight sm:text-2xl">
                <span className="gold-foil">{data.fullName}</span>
              </h2>
              <div className="mt-2 space-y-0.5 text-xs">
                <Row label={t.dob} value={data.dob} />
                <Row label={t.pob} value={data.pob} />
                <Row label={t.rashi} value={rashiFull} />
                <Row label={t.caste} value={casteFull} />
                <Row label={t.height} value={data.height} />
              </div>
            </div>
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="square" size="size-[88px] sm:size-[110px]" failed={photoError} onError={onPhotoError} glow={false} />
          </div>

          <div className="mt-4 space-y-1 border-t border-gold-500/25 pt-2">
            <Row label={t.education} value={data.education} />
            <Row label={t.occupation} value={data.occupation} />
            <Row label={t.company} value={data.company} />
            <Row label={t.annualIncome} value={data.annualIncome} />
            <Row label={t.gotra} value={data.gotra} />
            <Row label={t.mangal} value={data.mangal} />
          </div>

          <div className="mt-5 border-t-2 border-gold-500/40 pt-2">
            <SectionTitle center={false}>{t.sectionFamily}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.fatherName} value={fatherFull} />
              <Row label={t.motherName} value={motherFull} />
              <Row label={t.brothers} value={data.brothers} />
              <Row label={t.sisters} value={data.sisters} />
              <Row label={t.maternalUncle} value={data.maternalUncle} />
              <Row label={t.relativeSurnames} value={data.relativeSurnames} />
            </div>
          </div>

          <div className="mt-5 border-t-2 border-gold-500/40 pt-2">
            <SectionTitle center={false}>{t.sectionContact}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.contactPerson} value={data.contactPerson} />
              <Row label={t.phone} value={data.phone} />
              <Row label={t.whatsapp} value={data.whatsapp} />
              <Row label={t.address} value={addressFull} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ 5 · EMERALD GARDEN — LotusBloom crest + leaf flourishes ═══ */
  if (data.template === "emerald-garden") {
    return (
      <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
        style={{ background: "linear-gradient(165deg, #0b4222 0%, #072a15 55%, #031709 100%)" }}>
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at 50% 18%, rgba(242,201,76,0.28) 0, transparent 55%), radial-gradient(ellipse at 50% 90%, rgba(7,102,45,0.35) 0, transparent 55%)",
        }} />
        <Grain tone="dark" opacity={0.1} />
        <DualBorder color="#e6c45c" />

        <CornerFlourish color="#e6c45c" size={44} className="top-3 left-3" />
        <CornerFlourish color="#e6c45c" size={44} className="top-3 right-3 -scale-x-100" />
        <CornerFlourish color="#e6c45c" size={44} className="bottom-3 left-3 -scale-y-100" />
        <CornerFlourish color="#e6c45c" size={44} className="bottom-3 right-3 -scale-x-100 -scale-y-100" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="flex justify-center">
            <LotusBloom color="#e6c45c" size={56} />
          </div>
          <p className="mt-2 text-center text-[11px] font-bold tracking-[0.2em] text-gold-300">{blessingLine}</p>
          <p className="font-marathi-display mt-0.5 text-center text-sm font-semibold text-gold-200">{docTitle}</p>

          <div className="mt-4 flex justify-center">
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="circle" failed={photoError} onError={onPhotoError} />
          </div>

          <div className="mt-3 text-center">
            <FloralFlourishDivider color="#e6c45c" variant="lotus" />
            <h2 className="font-marathi-display my-1 text-xl font-bold tracking-wide sm:text-2xl">
              <span className="gold-foil">{data.fullName}</span>
            </h2>
            <FloralFlourishDivider color="#e6c45c" variant="lotus" className="rotate-180" />
            {data.education && <p className="mt-0.5 text-xs font-medium text-gold-200/90">{data.education}</p>}
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-4" shimmer icon={<span>🌿</span>}>
            {t.sectionPersonal}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-3">
            <Row label={t.dob} value={data.dob} />
            <Row label={t.tob} value={data.tob} />
            <Row label={t.pob} value={data.pob} />
            <Row label={t.height} value={data.height} />
            <Row label={t.complexion} value={data.complexion} />
            <Row label={t.caste} value={casteFull} />
            <Row label={t.gotra} value={data.gotra} />
            <Row label={t.rashi} value={rashiFull} />
            <Row label={t.mangal} value={data.mangal} />
            <Row label={t.occupation} value={data.occupation} />
            <Row label={t.company} value={data.company} />
            <Row label={t.annualIncome} value={data.annualIncome} />
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-4" shimmer icon={<span>🌳</span>}>
            {t.sectionFamily}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-3">
            <Row label={t.fatherName} value={fatherFull} />
            <Row label={t.motherName} value={motherFull} />
            <Row label={t.brothers} value={data.brothers} />
            <Row label={t.sisters} value={data.sisters} />
            <Row label={t.maternalUncle} value={data.maternalUncle} />
          </div>

          <GoldPillBadge badgeBg={templateConfig.badgeBg} badgeText={templateConfig.badgeText} className="mt-4" shimmer icon={<span>🏡</span>}>
            {t.sectionContact}
          </GoldPillBadge>
          <div className="space-y-1 px-1 sm:px-3">
            <Row label={t.contactPerson} value={data.contactPerson} />
            <Row label={t.phone} value={data.phone} />
            <Row label={t.whatsapp} value={data.whatsapp} />
            <Row label={t.address} value={addressFull} />
          </div>

          {data.aboutMe && (
            <div className="mt-4 border-t border-gold-500/20 px-3 pt-3 text-center">
              <p className="text-[11px] italic leading-relaxed text-ivory-100/75">"{data.aboutMe}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══ 6 · SAPPHIRE MOON — Crescent + panel sections + silver-gold ═══ */
  if (data.template === "sapphire-moon") {
    return (
      <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
        style={{ background: "linear-gradient(170deg, #0e2250 0%, #091740 55%, #040b26 100%)" }}>
        <StarField count={36} color="#e6efff" />
        <Grain tone="dark" opacity={0.08} />
        <DualBorder color="#c5d4f0" outerOpacity={0.6} innerOpacity={0.3} />

        <BaroqueCorner color="#c5d4f0" className="absolute top-2 left-2" />
        <BaroqueCorner color="#c5d4f0" className="absolute top-2 right-2 -scale-x-100" />
        <BaroqueCorner color="#c5d4f0" className="absolute bottom-2 left-2 -scale-y-100" />
        <BaroqueCorner color="#c5d4f0" className="absolute bottom-2 right-2 -scale-x-100 -scale-y-100" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          {/* Crescent moon emblem */}
          <div className="flex justify-center">
            <svg viewBox="0 0 40 40" className="h-11 w-11 drop-shadow-[0_0_10px_rgba(230,239,255,0.5)]" aria-hidden>
              <path d="M26 8A14 14 0 1 0 26 32A10 10 0 1 1 26 8Z" fill="#e6efff" opacity="0.95" />
              <circle cx="30" cy="10" r="0.9" fill="#f0d878" />
              <circle cx="34" cy="14" r="0.6" fill="#f0d878" />
              <circle cx="10" cy="20" r="0.5" fill="#f0d878" opacity="0.8" />
            </svg>
          </div>
          <p className="mt-1 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-200">{blessingLine}</p>

          <div className="mt-4 flex justify-center">
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="circle" failed={photoError} onError={onPhotoError} />
          </div>

          <div className="mt-3 text-center">
            <FloralFlourishDivider color="#c5d4f0" variant="diamond" />
            <h2 className="font-marathi-display my-1 text-xl font-bold tracking-wide text-slate-50 sm:text-2xl">
              {data.fullName}
            </h2>
            <FloralFlourishDivider color="#c5d4f0" variant="diamond" className="rotate-180" />
            {data.education && <p className="mt-0.5 text-xs font-medium text-slate-300">{data.education}</p>}
          </div>

          <div className="mt-5 rounded-xl border border-slate-400/25 bg-black/20 p-4 backdrop-blur-sm">
            <SectionTitle color="text-slate-200" line="#c5d4f0">{t.sectionPersonal}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.dob} value={data.dob} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.tob} value={data.tob} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.pob} value={data.pob} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.height} value={data.height} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.complexion} value={data.complexion} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.caste} value={casteFull} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.gotra} value={data.gotra} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.rashi} value={rashiFull} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.occupation} value={data.occupation} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.annualIncome} value={data.annualIncome} labelColor="text-slate-300" valueColor="text-slate-50" />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-400/25 bg-black/20 p-4 backdrop-blur-sm">
            <SectionTitle color="text-slate-200" line="#c5d4f0">{t.sectionFamily}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.fatherName} value={fatherFull} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.motherName} value={motherFull} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.brothers} value={data.brothers} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.sisters} value={data.sisters} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.maternalUncle} value={data.maternalUncle} labelColor="text-slate-300" valueColor="text-slate-50" />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-400/25 bg-black/20 p-4 backdrop-blur-sm">
            <SectionTitle color="text-slate-200" line="#c5d4f0">{t.sectionContact}</SectionTitle>
            <div className="mt-2 space-y-1">
              <Row label={t.contactPerson} value={data.contactPerson} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.phone} value={data.phone} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.whatsapp} value={data.whatsapp} labelColor="text-slate-300" valueColor="text-slate-50" />
              <Row label={t.address} value={addressFull} labelColor="text-slate-300" valueColor="text-slate-50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ 7 · IVORY ROYAL — ZariBorder + PaisleyBand + RoyalSeal ═══ */
  if (data.template === "ivory-royal") {
    const lbl = "text-[#8a6a2b]";
    const val = "text-[#3d2a0a]";
    return (
      <div id={id} className={`${SHELL} text-[#3d2a0a] ring-1 ring-[#8a6a2b]/20 ${className}`}
        style={{ background: "linear-gradient(180deg, #fdf8ec 0%, #f4e9cf 55%, #ebdcb5 100%)" }}>
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(ellipse at 50% 12%, rgba(212,175,55,0.2) 0, transparent 55%)",
        }} />
        <ZariBorder color="#8a6a2b" variant="frame" />
        <PaisleyBand color="#8a6a2b" className="absolute inset-x-[13px] top-[13px]" />
        <PaisleyBand color="#8a6a2b" flip className="absolute inset-x-[13px] bottom-[13px]" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="text-center">
            <RoyalGaneshCrest color="#8a6a2b" size={42} variant="crowned" />
            <p className="mt-1 text-[11px] font-bold tracking-[0.2em] text-[#8a6a2b]">{blessingLine}</p>
            <p className="font-marathi-display mt-0.5 text-sm font-semibold text-[#6b4f1a]">{docTitle}</p>
          </div>

          <div className="mt-4 flex justify-center">
            <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="circle" failed={photoError} onError={onPhotoError} />
          </div>

          <div className="mt-3 text-center">
            <FloralFlourishDivider color="#8a6a2b" variant="paisley" />
            <h2 className="font-marathi-display my-1 text-xl font-bold tracking-wide text-[#3d2a0a] sm:text-2xl">
              {data.fullName}
            </h2>
            <FloralFlourishDivider color="#8a6a2b" variant="paisley" className="rotate-180" />
            {data.education && <p className="mt-0.5 text-xs font-medium text-[#6b4f1a]">{data.education}</p>}
          </div>

          <div className="mt-5">
            <SectionTitle color="text-[#6b4f1a]" line="#8a6a2b">{t.sectionPersonal}</SectionTitle>
            <div className="mt-2 space-y-1 px-1 sm:px-3">
              <Row label={t.dob} value={data.dob} labelColor={lbl} valueColor={val} />
              <Row label={t.tob} value={data.tob} labelColor={lbl} valueColor={val} />
              <Row label={t.pob} value={data.pob} labelColor={lbl} valueColor={val} />
              <Row label={t.height} value={data.height} labelColor={lbl} valueColor={val} />
              <Row label={t.weight} value={data.weight} labelColor={lbl} valueColor={val} />
              <Row label={t.complexion} value={data.complexion} labelColor={lbl} valueColor={val} />
              <Row label={t.education} value={data.education} labelColor={lbl} valueColor={val} />
              <Row label={t.occupation} value={data.occupation} labelColor={lbl} valueColor={val} />
              <Row label={t.company} value={data.company} labelColor={lbl} valueColor={val} />
              <Row label={t.annualIncome} value={data.annualIncome} labelColor={lbl} valueColor={val} />
              <Row label={t.rashi} value={rashiFull} labelColor={lbl} valueColor={val} />
              <Row label={t.gotra} value={data.gotra} labelColor={lbl} valueColor={val} />
              <Row label={t.mangal} value={data.mangal} labelColor={lbl} valueColor={val} />
              <Row label={t.caste} value={casteFull} labelColor={lbl} valueColor={val} />
            </div>
          </div>

          <div className="mt-5">
            <SectionTitle color="text-[#6b4f1a]" line="#8a6a2b">{t.sectionFamily}</SectionTitle>
            <div className="mt-2 space-y-1 px-1 sm:px-3">
              <Row label={t.fatherName} value={fatherFull} labelColor={lbl} valueColor={val} />
              <Row label={t.motherName} value={motherFull} labelColor={lbl} valueColor={val} />
              <Row label={t.brothers} value={data.brothers} labelColor={lbl} valueColor={val} />
              <Row label={t.sisters} value={data.sisters} labelColor={lbl} valueColor={val} />
              <Row label={t.maternalUncle} value={data.maternalUncle} labelColor={lbl} valueColor={val} />
              <Row label={t.relativeSurnames} value={data.relativeSurnames} labelColor={lbl} valueColor={val} />
            </div>
          </div>

          <div className="mt-5">
            <SectionTitle color="text-[#6b4f1a]" line="#8a6a2b">{t.sectionContact}</SectionTitle>
            <div className="mt-2 space-y-1 px-1 sm:px-3">
              <Row label={t.contactPerson} value={data.contactPerson} labelColor={lbl} valueColor={val} />
              <Row label={t.phone} value={data.phone} labelColor={lbl} valueColor={val} />
              <Row label={t.whatsapp} value={data.whatsapp} labelColor={lbl} valueColor={val} />
              <Row label={t.address} value={addressFull} labelColor={lbl} valueColor={val} />
            </div>
          </div>

          {/* Royal seal footer */}
          <div className="mt-6">
            <RoyalSeal color="#8a6a2b" size={60} text={isEn ? "ROYAL" : isHi ? "शाही" : "राज"} />
            <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a6a2b]/70">
              {isEn ? "Authentic Heritage" : isHi ? "प्रामाणिक विरासत" : "अस्सल वारसा"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ 8 · HERITAGE MAROON (default) — Crowned crest + diya pair footer ═══ */
  return (
    <div id={id} className={`${SHELL} text-ivory-100 ${className}`}
      style={{ background: "linear-gradient(165deg, #4a0b15 0%, #2f060d 55%, #1a0308 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-12" style={{
        backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.4) 0, transparent 60%)",
      }} />
      <MandalaWatermark color="#dfb150" className="absolute inset-0" opacity={0.04} />
      <Grain tone="dark" opacity={0.12} />
      <DualBorder color="#dfb150" />

      <BaroqueCorner color="#dfb150" className="absolute top-2 left-2" variant="royal" />
      <BaroqueCorner color="#dfb150" className="absolute top-2 right-2 -scale-x-100" variant="royal" />
      <BaroqueCorner color="#dfb150" className="absolute bottom-2 left-2 -scale-y-100" variant="royal" />
      <BaroqueCorner color="#dfb150" className="absolute bottom-2 right-2 -scale-x-100 -scale-y-100" variant="royal" />

      <div className="relative px-6 py-8 sm:px-9 sm:py-10">
        <div className="text-center">
          <RoyalGaneshCrest color="#dfb150" size={42} variant="crowned" />
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">{blessingLine}</p>
          <p className="font-marathi-display mt-0.5 text-sm font-semibold text-gold-200">{docTitle}</p>
        </div>

        <div className="mt-4 flex justify-center">
          <PhotoFrame src={data.photoUrl} name={data.fullName} gender={data.gender} shape="circle" failed={photoError} onError={onPhotoError} />
        </div>

        <div className="mt-3 text-center">
          <FloralFlourishDivider color="#dfb150" variant="rosette" />
          <h2 className="font-marathi-display my-1 text-xl font-bold tracking-wide sm:text-2xl">
            <span className="gold-foil">{data.fullName}</span>
          </h2>
          <FloralFlourishDivider color="#dfb150" variant="rosette" className="rotate-180" />
          {data.education && <p className="mt-0.5 text-xs font-medium text-gold-200/90">{data.education}</p>}
        </div>

        {/* Personal */}
        <div className="mt-5 border-t border-gold-500/30 pt-2">
          <SectionTitle>{t.sectionPersonal}</SectionTitle>
          <div className="mt-2 space-y-1 px-1">
            <Row label={t.dob} value={data.dob} />
            <Row label={t.tob} value={data.tob} />
            <Row label={t.pob} value={data.pob} />
            <Row label={t.height} value={data.height} />
            <Row label={t.weight} value={data.weight} />
            <Row label={t.complexion} value={data.complexion} />
            <Row label={t.education} value={data.education} />
            <Row label={t.occupation} value={data.occupation} />
            <Row label={t.company} value={data.company} />
            <Row label={t.annualIncome} value={data.annualIncome} />
            <Row label={t.rashi} value={rashiFull} />
            <Row label={t.gotra} value={data.gotra} />
            <Row label={t.mangal} value={data.mangal} />
            <Row label={t.caste} value={casteFull} />
          </div>
        </div>

        {/* Family */}
        <div className="mt-5 border-t border-gold-500/30 pt-2">
          <SectionTitle>{t.sectionFamily}</SectionTitle>
          <div className="mt-2 space-y-1 px-1">
            <Row label={t.fatherName} value={fatherFull} />
            <Row label={t.motherName} value={motherFull} />
            <Row label={t.brothers} value={data.brothers} />
            <Row label={t.sisters} value={data.sisters} />
            <Row label={t.maternalUncle} value={data.maternalUncle} />
            <Row label={t.relativeSurnames} value={data.relativeSurnames} />
          </div>
        </div>

        {/* Contact */}
        <div className="mt-5 border-t border-gold-500/30 pt-2">
          <SectionTitle>{t.sectionContact}</SectionTitle>
          <div className="mt-2 space-y-1 px-1">
            <Row label={t.contactPerson} value={data.contactPerson} />
            <Row label={t.phone} value={data.phone} />
            <Row label={t.whatsapp} value={data.whatsapp} />
            <Row label={t.address} value={addressFull} />
          </div>
        </div>

        {data.aboutMe && (
          <div className="mt-4 border-t border-gold-500/20 px-2 pt-3 text-center">
            <p className="text-[11px] italic leading-relaxed text-ivory-100/75">"{data.aboutMe}"</p>
          </div>
        )}

        {/* Ornamental diya pair footer */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <DiyaFlame color="#dfb150" size={28} animate />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400/70">
            {isEn ? "Shubham Bhavatu" : "शुभं भवतु"}
          </span>
          <DiyaFlame color="#dfb150" size={28} animate />
        </div>
      </div>
    </div>
  );
}