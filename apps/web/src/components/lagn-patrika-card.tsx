"use client";

import React, { useState, useEffect } from "react";
import type { MasterTemplate } from "@/lib/templates-catalog";
import type { CardRenderData } from "./master-template-card";
import {
  RoyalGaneshCrest,
  BaroqueCorner,
  FloralFlourishDivider,
} from "./biodata-ornaments";
import {
  PeacockFeatherMotif,
  TutariVadakMusicians,
  MundavalyaGarland,
  RoyalMarathaKatyar,
  InterlockedGoldRings,
  HangingBrassTempleBells,
} from "./event-ornaments";

/* ══════════════════════════════════════════════════════════════════════
   INLINE EDITABLE TEXT WRAPPER COMPONENT
   Allows click-to-edit directly on the card + 2-way sync with Studio form
   ══════════════════════════════════════════════════════════════════════ */
export function EditableField({
  value,
  field,
  placeholder,
  className = "",
  style,
  onUpdate,
  tag = "div",
}: {
  value?: string;
  field: keyof CardRenderData;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
  onUpdate?: (field: keyof CardRenderData, val: string) => void;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value || "");

  useEffect(() => {
    setTempVal(value || "");
  }, [value]);

  const displayVal = (value && value.trim()) ? value : placeholder;

  if (isEditing && onUpdate) {
    return (
      <input
        type="text"
        autoFocus
        value={tempVal}
        onChange={(e) => {
          setTempVal(e.target.value);
          onUpdate(field, e.target.value);
        }}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            setIsEditing(false);
          }
        }}
        className={`bg-white/95 text-ink-900 border-2 border-amber-400 rounded px-2 py-0.5 outline-none shadow-lg text-center ${className}`}
        style={style}
      />
    );
  }

  const Tag = tag;

  return (
    <Tag
      onClick={() => onUpdate && setIsEditing(true)}
      title={onUpdate ? "संपादन करण्यासाठी क्लिक करा" : undefined}
      className={`transition-all duration-150 ${
        onUpdate
          ? "cursor-text hover:outline hover:outline-1 hover:outline-amber-400/80 hover:bg-amber-400/10 rounded-sm"
          : ""
      } ${className}`}
      style={style}
    >
      {displayVal}
    </Tag>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HIGH-RESOLUTION CULTURAL VECTOR EMBLEMS & MOTIFS
   ══════════════════════════════════════════════════════════════════════ */

/* Dr. Babasaheb Ambedkar Gilded Medallion */
export function DrAmbedkarMedallion({ size = 76, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div
        className="relative overflow-hidden rounded-full border-2 border-[#f5d061] shadow-lg shadow-blue-950/70 bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0a1226]"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.25),transparent_70%)]" />
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#f5d061" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M35 42 C33 26, 67 26, 65 42 C65 50, 60 56, 50 56 C40 56, 35 50, 35 42 Z" fill="#e2c9a5" />
          <path d="M33 38 C33 24, 67 24, 67 38 C62 30, 52 28, 44 30 C38 32, 35 35, 33 38 Z" fill="#181512" />
          {/* Spectacles */}
          <rect x="39" y="39" width="9" height="7" rx="2" fill="none" stroke="#181512" strokeWidth="1.6" />
          <rect x="52" y="39" width="9" height="7" rx="2" fill="none" stroke="#181512" strokeWidth="1.6" />
          <line x1="48" y1="42" x2="52" y2="42" stroke="#181512" strokeWidth="1.6" />
          <line x1="36" y1="41" x2="39" y2="42" stroke="#181512" strokeWidth="1.2" />
          <line x1="61" y1="42" x2="64" y2="41" stroke="#181512" strokeWidth="1.2" />
          {/* Nose & Smile */}
          <path d="M49 45 L48 48 L52 48" fill="none" stroke="#b08558" strokeWidth="1" strokeLinecap="round" />
          <path d="M45 51 Q50 54 55 51" fill="none" stroke="#9a6e43" strokeWidth="1.2" strokeLinecap="round" />
          {/* Royal Blue Coat */}
          <path d="M20 100 L25 66 C28 60, 36 58, 42 58 L58 58 C64 58, 72 60, 75 66 L80 100 Z" fill="#1d4ed8" />
          <path d="M34 58 L45 74 L38 90 L25 70 Z" fill="#1e40af" stroke="#f5d061" strokeWidth="0.8" />
          <path d="M66 58 L55 74 L62 90 L75 70 Z" fill="#1e40af" stroke="#f5d061" strokeWidth="0.8" />
          {/* White Shirt Collar & Red Tie */}
          <polygon points="46,58 54,58 50,66" fill="#f8fafc" />
          <polygon points="48,66 52,66 54,84 50,88 46,84" fill="#dc2626" />
          <line x1="31" y1="74" x2="31" y2="82" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="mt-1 font-marathi-display text-xs font-bold text-[#fde047] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide whitespace-nowrap">
        डॉ. बाबासाहेब आंबेडकर
      </span>
    </div>
  );
}

/* Gautam Buddha Radiant Aura Medallion */
export function GautamBuddhaMedallion({ size = 76, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div
        className="relative overflow-hidden rounded-full border-2 border-[#f5d061] shadow-lg shadow-blue-950/70 bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0a1226]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="#f5d061" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Aura behind head */}
          <circle cx="50" cy="38" r="22" fill="#fef08a" opacity="0.35" />
          <circle cx="50" cy="38" r="17" fill="#fde047" opacity="0.5" />
          <circle cx="50" cy="38" r="12" fill="#ffd700" opacity="0.75" />
          {/* Ushnisha & Hair */}
          <circle cx="50" cy="22" r="3.5" fill="#f59e0b" />
          <path d="M40 32 C40 23, 60 23, 60 32 C58 35, 42 35, 40 32 Z" fill="#d97706" />
          {/* Meditative Face */}
          <path d="M42 32 C41 42, 59 42, 58 32 Z" fill="#fed7aa" />
          <path d="M44 34 Q46 36 48 35" fill="none" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <path d="M52 35 Q54 36 56 34" fill="none" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          <path d="M48 40 Q50 42 52 40" fill="none" stroke="#b45309" strokeWidth="1" strokeLinecap="round" />
          {/* Saffron Robe */}
          <path d="M30 68 C34 52, 42 46, 50 46 C58 46, 66 52, 70 68 Z" fill="#f59e0b" />
          <path d="M36 50 C44 56, 54 62, 64 68 L70 68 L66 52 Z" fill="#d97706" opacity="0.8" />
          {/* Dhyana Hands */}
          <ellipse cx="50" cy="66" rx="8" ry="4" fill="#fed7aa" />
          {/* Double Lotus Base */}
          <path d="M24 74 C34 68, 66 68, 76 74 C70 82, 30 82, 24 74 Z" fill="#f43f5e" opacity="0.9" />
          <path d="M28 73 C38 66, 62 66, 72 73 C66 79, 34 79, 28 73 Z" fill="#fb7185" />
          <path d="M34 72 C42 67, 58 67, 66 72" fill="none" stroke="#ffd700" strokeWidth="1.2" />
        </svg>
      </div>
      <span className="mt-1 font-marathi-display text-xs font-bold text-[#fde047] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-wide whitespace-nowrap">
        भगवान गौतम बुद्ध
      </span>
    </div>
  );
}

/* 24-Spoke Golden Dhamma Chakra (Ashoka Chakra) */
export function DhammaChakraGold({ size = 58, className = "" }: { size?: number; className?: string }) {
  const spokes = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i * 360) / 24;
    return (
      <line
        key={i}
        x1="50"
        y1="50"
        x2="50"
        y2="14"
        transform={`rotate(${angle} 50 50)`}
        stroke="#ffd700"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#f5d061" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#ffd700" strokeWidth="3" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#b45309" strokeWidth="1" />
      {spokes}
      <circle cx="50" cy="50" r="11" fill="#f59e0b" stroke="#ffd700" strokeWidth="2" />
      <circle cx="50" cy="50" r="5" fill="#1e3a8a" stroke="#ffd700" strokeWidth="1" />
    </svg>
  );
}

/* Sacred Lotus Flower Divider Motif */
export function LotusMotif({ size = 32, color = "#d97706", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 32" width={size} height={size / 2} className={className} aria-hidden="true">
      <path d="M32 28 C28 14 18 10 8 14 C18 8 28 12 32 4 C36 12 46 8 56 14 C46 10 36 14 32 28Z" fill={color} />
      <circle cx="32" cy="18" r="3" fill="#fbbf24" />
    </svg>
  );
}

/* Sacred Golden Kalash with Coconut & Mango Leaves */
export function SacredKalashMotif({ size = 48, accent = "#f59e0b", className = "" }: { size?: number; accent?: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <path d="M32 6 C28 14 20 18 20 24 C24 24 28 20 32 14 C36 20 40 24 44 24 C44 18 36 14 32 6 Z" fill="#15803d" />
      <circle cx="32" cy="22" r="9" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
      <path d="M22 28 L42 28 L44 32 L20 32 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <path d="M20 32 C20 46, 44 46, 44 32 Z" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
      <rect x="24" y="46" width="16" height="4" rx="2" fill="#b45309" />
      <line x1="32" y1="34" x2="32" y2="44" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="26" y1="39" x2="38" y2="39" stroke="#fbbf24" strokeWidth="1.5" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   1. BAUDHA NEEL & BUDDHIST WEDDING MODERN ART PRINTED CARD
   Exact match to user reference: Deep royal blue velvet, Ambedkar, Buddha,
   Dhamma Chakra, Scalloped ivory arch, dual venue/dhamma pills, nimantrak bar.
   ══════════════════════════════════════════════════════════════════════ */
function BaudhaModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  tagline,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  tagline?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full max-w-[560px] mx-auto overflow-hidden rounded-2xl shadow-2xl select-none border-2 border-gold-400/80 bg-[#071333] print:shadow-none print:max-w-none print:rounded-none">
      {/* ── 1149 x 1440 PRESS-READY MASTER ARTWORK ── */}
      <div className="relative w-full" style={{ aspectRatio: "1149 / 1440" }}>
        <img
          src="/templates/lagn-pratika/baudha-neel-master-blank.png"
          alt="बौद्ध मंगलपरिणय शाही निळी पत्रिका"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
        />

        {/* ── 1. GROOM SECTION (वर: उपासक) ── */}
        <div className="absolute top-[20.8%] left-[23.5%] right-[23.5%] flex flex-col items-center justify-center text-center">
          <span className="font-marathi-display text-xs sm:text-[12.5px] md:text-[14px] font-black text-[#082c7d] tracking-widest leading-none drop-shadow-2xs">
            उपासक
          </span>
          <EditableField
            field="personA"
            value={personA}
            placeholder="चि. योगेश"
            onUpdate={onUpdateField}
            tag="h2"
            className="font-marathi-display text-xl sm:text-2xl md:text-3xl font-black text-[#082c7d] tracking-wide leading-tight mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
          />
          {parentsA && (
            <EditableField
              field="parentsA"
              value={parentsA}
              placeholder="आयु. मालुबाई व आयु. विष्णू चिंधू सपकाळे यांचे सुपुत्र, रा. चिखली, पुणे"
              onUpdate={onUpdateField}
              tag="p"
              className="text-xs sm:text-xs md:text-[12.5px] font-bold text-ink-800 leading-tight max-w-[94%] mt-0.5 sm:mt-1"
            />
          )}
        </div>

        {/* ── 2. BRIDE SECTION (वधू: उपासिका) ── */}
        <div className="absolute top-[37.0%] left-[23.5%] right-[23.5%] flex flex-col items-center justify-center text-center">
          <span className="font-marathi-display text-xs sm:text-[12.5px] md:text-[14px] font-black text-[#082c7d] tracking-widest leading-none drop-shadow-2xs">
            उपासिका
          </span>
          <EditableField
            field="personB"
            value={personB}
            placeholder="चि.सौ.कां. सुप्रिया"
            onUpdate={onUpdateField}
            tag="h2"
            className="font-marathi-display text-xl sm:text-2xl md:text-3xl font-black text-[#082c7d] tracking-wide leading-tight mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
          />
          {parentsB && (
            <EditableField
              field="parentsB"
              value={parentsB}
              placeholder="आयु. अंजिरबाई व आयु. सुरेश भगवान पात्रे यांची सुकन्या, रा. प्रकाश नगर, लातूर"
              onUpdate={onUpdateField}
              tag="p"
              className="text-xs sm:text-xs md:text-[12.5px] font-bold text-ink-800 leading-tight max-w-[94%] mt-0.5 sm:mt-1"
            />
          )}
        </div>

        {/* ── 3. DATE & MUHURAT SECTION ── */}
        <div className="absolute top-[66.0%] left-[17.5%] right-[17.5%] text-center">
          <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-[12px] md:text-[13px] font-bold text-ink-900 leading-snug">
            <EditableField
              field="date"
              value={date}
              placeholder="बौध्द वर्ष २५६९ मंगळवार दि. १६/१२/२०२६ रोजी"
              onUpdate={onUpdateField}
              className="font-bold"
            />
            <EditableField
              field="time"
              value={time}
              placeholder="दुपारी १२ वा. ३५ मि. शुभमुहूर्तावर"
              onUpdate={onUpdateField}
              className="font-bold text-[#082c7d]"
            />
          </div>
          <p className="text-xs sm:text-xs md:text-xs font-bold text-ink-700 leading-tight mt-0.5">
            बौद्ध धम्म पद्धतीने करण्याचे योजिले आहे.
          </p>
        </div>

        {/* ── 4. BOTTOM 3 BADGES SECTION (VENUE, DHAMMA PROGRAM, NIMANTRAK) ── */}
        <div className="absolute top-[71.2%] left-[18%] right-[18%] bottom-[12%] flex flex-col justify-between">
          {/* Upper Row: Left (Parinay Sthal) & Right (Dhamma Karye) */}
          <div className="grid grid-cols-2 gap-2 text-center">
            {/* Left Box: Parinay Sthal */}
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#082c7d] px-2.5 py-0.5 text-xs sm:text-xs md:text-xs font-black text-white shadow-2xs">
                <span className="text-[#00e5ff] text-xs leading-none">●</span>
                <span>परिणय स्थळ</span>
                <span className="text-[#00e5ff] text-xs leading-none">●</span>
              </span>
              <EditableField
                field="venue"
                value={venue}
                placeholder="लातूर जिल्हा उद्योग समुह, ५ नं. चौक"
                onUpdate={onUpdateField}
                className="text-xs sm:text-xs md:text-[12px] font-bold text-ink-900 leading-tight mt-1 line-clamp-2"
              />
              {city && (
                <EditableField
                  field="city"
                  value={city}
                  placeholder="लातूर"
                  onUpdate={onUpdateField}
                  className="text-xs sm:text-xs md:text-xs font-bold text-[#082c7d] leading-none mt-0.5"
                />
              )}
            </div>

            {/* Right Box: Dhamma Karye */}
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#082c7d] px-2.5 py-0.5 text-xs sm:text-xs md:text-xs font-black text-white shadow-2xs">
                <span className="text-[#00e5ff] text-xs leading-none">●</span>
                <span>धम्मकार्य</span>
                <span className="text-[#00e5ff] text-xs leading-none">●</span>
              </span>
              <EditableField
                field="tagline"
                value={tagline}
                placeholder="सोमवार दि. १५/१२/२०२६ सायं. ८ वा. (विवाहस्थळी)"
                onUpdate={onUpdateField}
                className="text-xs sm:text-xs md:text-[12px] font-bold text-ink-900 leading-tight mt-1 line-clamp-2"
              />
            </div>
          </div>

          {/* Lower Centered Cloud Area: Nimantrak */}
          <div className="flex flex-col items-center text-center -mt-1 sm:mt-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#082c7d] px-3 py-0.5 text-xs sm:text-xs md:text-xs font-black text-white shadow-2xs">
              <span className="text-[#00e5ff] text-xs leading-none">●</span>
              <span>निमंत्रक</span>
              <span className="text-[#00e5ff] text-xs leading-none">●</span>
            </span>
            <EditableField
              field="host"
              value={host}
              placeholder="समस्त सपकाळे परिवार"
              onUpdate={onUpdateField}
              tag="p"
              className="font-marathi-display text-xs sm:text-xs md:text-[13px] font-bold text-ink-900 leading-tight mt-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   2. FLORAL IVORY & ROSE BOUQUET SHUBHVIVAH PRINTED CARD
   Ivory textured paper, corner rose floral clusters, mundavalya garland,
   two-column bride/groom layout, haldi and kilbil family boxes.
   ══════════════════════════════════════════════════════════════════════ */
function FloralIvoryModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  tagline,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  tagline?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#fffdf9] p-4 sm:p-6 text-ink-900 select-none border-2 border-amber-400 shadow-2xl">
      {/* Decorative Outer Border */}
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-amber-300/60" />

      {/* Top Mundavalya Pearl Garland */}
      <div className="flex justify-center -mt-2">
        <MundavalyaGarland />
      </div>

      {/* Top Header: Ganesha & Blessing */}
      <div className="text-center mt-1">
        <RoyalGaneshCrest color="#9a3412" size={38} />
        <EditableField
          field="blessing"
          value={blessing}
          placeholder="॥ श्री गणेशाय नमः ॥"
          onUpdate={onUpdateField}
          className="mt-1 font-marathi-display text-xs font-bold text-[#9a3412] tracking-widest uppercase"
        />
        {surnames && (
          <div className="my-1.5 inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5">
            <EditableField
              field="surnames"
              value={surnames}
              placeholder="आढाव — तांबे"
              onUpdate={onUpdateField}
              className="font-marathi-display text-xs font-bold text-gold-ink"
            />
          </div>
        )}
        <EditableField
          field="title"
          value={title}
          placeholder="शुभविवाह सोहळा"
          onUpdate={onUpdateField}
          tag="h2"
          className="font-marathi-display text-2xl sm:text-3xl font-black text-[#7c2d12] mt-1"
        />
      </div>

      {/* Side-by-side or stacked Couple details */}
      <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-y border-amber-200/80 py-3 text-center">
        {/* Groom */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-gold-ink">वर (चि.)</span>
          <EditableField
            field="personA"
            value={personA}
            placeholder="चि. किरण"
            onUpdate={onUpdateField}
            tag="h3"
            className="font-marathi-display text-xl sm:text-2xl font-black text-[#451a03]"
          />
          {parentsA && (
            <EditableField
              field="parentsA"
              value={parentsA}
              placeholder="पालक तपशील"
              onUpdate={onUpdateField}
              className="text-xs text-ink-500 leading-snug max-w-xs mx-auto"
            />
          )}
        </div>

        {/* Bride */}
        <div className="space-y-1 sm:border-l sm:border-amber-200/80 sm:pl-3">
          <span className="text-xs font-bold text-gold-ink">वधू (चि.सौ.कां.)</span>
          <EditableField
            field="personB"
            value={personB}
            placeholder="चि.सौ.कां. स्नेहल"
            onUpdate={onUpdateField}
            tag="h3"
            className="font-marathi-display text-xl sm:text-2xl font-black text-[#451a03]"
          />
          {parentsB && (
            <EditableField
              field="parentsB"
              value={parentsB}
              placeholder="पालक तपशील"
              onUpdate={onUpdateField}
              className="text-xs text-ink-500 leading-snug max-w-xs mx-auto"
            />
          )}
        </div>
      </div>

      {/* Date & Muhurat Ribbon */}
      <div className="rounded-xl bg-gradient-to-r from-amber-100/80 via-amber-50 to-amber-100/80 p-2.5 text-center border border-amber-300/80">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#78350f]">
          <span>📅</span>
          <EditableField field="date" value={date} placeholder="रविवार दि. ३०/०६/२०२६" onUpdate={onUpdateField} />
          <span>•</span>
          <span>⏰</span>
          <EditableField field="time" value={time} placeholder="दुपारी १२.३१ मि." onUpdate={onUpdateField} />
        </div>
      </div>

      {/* Venue & Kilbil Family */}
      <div className="my-3 space-y-1 text-center">
        <span className="text-xs font-bold text-gold-ink uppercase">● विवाह स्थळ ●</span>
        <EditableField
          field="venue"
          value={venue}
          placeholder="गोरेश्वर मंगल कार्यालय, गोरेगांव"
          onUpdate={onUpdateField}
          className="text-xs sm:text-sm font-bold text-ink-800"
        />
        {city && (
          <EditableField field="city" value={city} placeholder="अहिल्यानगर" onUpdate={onUpdateField} className="text-xs text-ink-500" />
        )}
        {tagline && (
          <EditableField
            field="tagline"
            value={tagline}
            placeholder="हळदी समारंभ व किलबिल परिवार..."
            onUpdate={onUpdateField}
            className="text-xs text-gold-ink bg-amber-50/70 rounded-lg p-1.5 mt-1 border border-amber-200"
          />
        )}
      </div>

      {/* Host / Nimantrak Footer */}
      <div className="border-t border-amber-200 pt-2 text-center">
        <span className="text-xs font-bold text-gold-ink">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. LEAF TUTARI & GINKGO GOLDEN MODERN ART CARD
   Pair of royal tutari trumpeters, golden ginkgo wreath, royal pillars.
   ══════════════════════════════════════════════════════════════════════ */
function LeafTutariModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  tagline,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  tagline?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#fffef8] to-[#fbf3dc] p-4 sm:p-6 text-ink-900 select-none border-2 border-[#b45309] shadow-2xl">
      {/* Tutari Trumpeters Header */}
      <div className="flex justify-center mb-1">
        <TutariVadakMusicians />
      </div>

      <div className="text-center mt-1">
        <EditableField
          field="blessing"
          value={blessing}
          placeholder="॥ श्री गणेशाय नमः ॥"
          onUpdate={onUpdateField}
          className="font-marathi-display text-xs font-bold text-[#b45309] tracking-widest uppercase"
        />
        {surnames && (
          <div className="my-1.5 inline-block rounded-full border border-[#b45309]/40 bg-[#fef3c7] px-4 py-0.5">
            <EditableField field="surnames" value={surnames} placeholder="आढाव — तांबे" onUpdate={onUpdateField} className="font-marathi-display text-xs font-bold text-gold-ink" />
          </div>
        )}
        <EditableField
          field="title"
          value={title}
          placeholder="शुभविवाह सोहळा"
          onUpdate={onUpdateField}
          tag="h2"
          className="font-marathi-display text-2xl sm:text-3xl font-black text-[#78350f] mt-1"
        />
      </div>

      {/* Couple Section */}
      <div className="my-3 space-y-2 border-y border-amber-300/70 py-3 text-center">
        <div>
          <span className="text-xs font-bold text-gold-ink">वर (चि.)</span>
          <EditableField field="personA" value={personA} placeholder="चि. किरण आढाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-[#451a03]" />
          {parentsA && <EditableField field="parentsA" value={parentsA} placeholder="पालक तपशील" onUpdate={onUpdateField} className="text-xs text-ink-500 max-w-sm mx-auto" />}
        </div>
        {personB && (
          <div>
            <span className="text-xs font-bold text-gold-ink">वधू (चि.सौ.कां.)</span>
            <EditableField field="personB" value={personB} placeholder="चि.सौ.कां. स्नेहल तांबे" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-[#451a03]" />
            {parentsB && <EditableField field="parentsB" value={parentsB} placeholder="पालक तपशील" onUpdate={onUpdateField} className="text-xs text-ink-500 max-w-sm mx-auto" />}
          </div>
        )}
      </div>

      {/* Muhurat */}
      <div className="rounded-xl border border-amber-300 bg-white/90 p-2.5 text-center shadow-xs">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-gold-ink">
          <span>📅</span>
          <EditableField field="date" value={date} placeholder="शुभ दिनांक" onUpdate={onUpdateField} />
          <span>•</span>
          <span>⏰</span>
          <EditableField field="time" value={time} placeholder="शुभ मुहूर्त" onUpdate={onUpdateField} />
        </div>
      </div>

      {/* Venue & Host */}
      <div className="my-3 text-center space-y-0.5">
        <span className="text-xs font-bold text-gold-ink uppercase">● विवाह स्थळ ●</span>
        <EditableField field="venue" value={venue} placeholder="मंगल कार्यालय" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-ink-800" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      <div className="border-t border-amber-200 pt-2 text-center">
        <span className="text-xs font-bold text-gold-ink">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. SATYANARAYAN MAHAPOOJA PRINTED MODERN ART CARD
   Banana plantain leaves, sacred kalash, modak, marigold toran.
   ══════════════════════════════════════════════════════════════════════ */
function SatyanarayanModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  tagline,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  tagline?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#fffdf5] via-[#fef9e7] to-[#fbf1cc] p-4 sm:p-6 text-ink-900 select-none border-2 border-amber-500 shadow-2xl">
      <div className="flex justify-center mb-1">
        <SacredKalashMotif size={52} />
      </div>

      <div className="text-center">
        <EditableField
          field="blessing"
          value={blessing}
          placeholder="॥ श्री सत्यनारायणाय नमः ॥"
          onUpdate={onUpdateField}
          className="font-marathi-display text-xs font-bold text-gold-ink tracking-widest uppercase"
        />
        <EditableField
          field="title"
          value={title}
          placeholder="श्री सत्यनारायण महापूजा"
          onUpdate={onUpdateField}
          tag="h2"
          className="font-marathi-display text-2xl sm:text-3xl font-black text-[#92400e] mt-1"
        />
      </div>

      <div className="my-3 rounded-xl border border-amber-300 bg-white/80 p-3 text-center space-y-1">
        <span className="text-xs font-bold text-gold-ink">● पूजा यजमान ●</span>
        <EditableField field="personA" value={personA} placeholder="श्री. व सौ. यजमान" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-lg sm:text-xl font-black text-ink-800" />
        {parentsA && <EditableField field="parentsA" value={parentsA} placeholder="तपशील" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      {/* Date, Time & Prasad */}
      <div className="rounded-xl border border-amber-300 bg-amber-100/70 p-2.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-gold-ink">
          <span>📅</span>
          <EditableField field="date" value={date} placeholder="रविवार" onUpdate={onUpdateField} />
          <span>•</span>
          <span>⏰</span>
          <EditableField field="time" value={time} placeholder="सकाळी ९:०० वा." onUpdate={onUpdateField} />
        </div>
        <p className="text-xs text-gold-ink font-semibold mt-1">
          पूजा प्रारंभ • महाप्रसाद दुपारी १२:३० वा.
        </p>
      </div>

      <div className="my-3 text-center space-y-0.5">
        <span className="text-xs font-bold text-gold-ink uppercase">● महापूजा स्थळ ●</span>
        <EditableField field="venue" value={venue} placeholder="निवासस्थान" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-ink-800" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      <div className="border-t border-amber-200 pt-2 text-center">
        <span className="text-xs font-bold text-gold-ink">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. SAKHARPUDA & ENGAGEMENT MODERN ART CARD
   Interlocked gold rings, champagne pink / rose gold lace, engagement ribbons.
   ══════════════════════════════════════════════════════════════════════ */
function SakharpudaModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#fff8f6] via-[#fff2f4] to-[#fde5e8] p-4 sm:p-6 text-ink-900 select-none border-2 border-rose-300 shadow-2xl">
      <div className="flex justify-center mb-1">
        <InterlockedGoldRings />
      </div>

      <div className="text-center">
        <EditableField field="blessing" value={blessing} placeholder="॥ श्री गणेशाय नमः ॥" onUpdate={onUpdateField} className="font-marathi-display text-xs font-bold text-maroon-700 tracking-widest uppercase" />
        <EditableField field="title" value={title} placeholder="साखरपुडा समारंभ" onUpdate={onUpdateField} tag="h2" className="font-marathi-display text-2xl sm:text-3xl font-black text-maroon-900 mt-1" />
      </div>

      <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-y border-rose-200 py-3 text-center">
        <div>
          <span className="text-xs font-bold text-maroon-600">वर (चि.)</span>
          <EditableField field="personA" value={personA} placeholder="चि. वर नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl font-black text-ink-900" />
          {parentsA && <EditableField field="parentsA" value={parentsA} placeholder="पालक" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
        </div>
        <div>
          <span className="text-xs font-bold text-maroon-600">वधू (चि.सौ.कां.)</span>
          <EditableField field="personB" value={personB} placeholder="चि.सौ.कां. वधू नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl font-black text-ink-900" />
          {parentsB && <EditableField field="parentsB" value={parentsB} placeholder="पालक" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
        </div>
      </div>

      <div className="rounded-xl border border-rose-300 bg-white/90 p-2.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-maroon-900">
          <span>💍 अंगठी समारंभ:</span>
          <EditableField field="date" value={date} placeholder="दिनांक" onUpdate={onUpdateField} />
          <span>•</span>
          <EditableField field="time" value={time} placeholder="वेळ" onUpdate={onUpdateField} />
        </div>
      </div>

      <div className="my-3 text-center space-y-0.5">
        <span className="text-xs font-bold text-maroon-700 uppercase">● समारंभ स्थळ ●</span>
        <EditableField field="venue" value={venue} placeholder="बँक्वेट हॉल" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-ink-800" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      <div className="border-t border-rose-200 pt-2 text-center">
        <span className="text-xs font-bold text-maroon-700">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6. VASTUSHANTI & GRUHAPRAVESH MODERN ART CARD
   Sacred kalash, toran, home silhouette, pooja & snehabhojan boxes.
   ══════════════════════════════════════════════════════════════════════ */
function VastushantiModernArtCard({
  template,
  blessing,
  title,
  personA,
  date,
  time,
  venue,
  city,
  host,
  tagline,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  tagline?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#fbfdfa] via-[#f0fdf4] to-[#dcfce7] p-4 sm:p-6 text-ink-900 select-none border-2 border-emerald-500 shadow-2xl">
      <div className="flex justify-center mb-1">
        <SacredKalashMotif size={48} accent="#15803d" />
      </div>

      <div className="text-center">
        <EditableField field="blessing" value={blessing} placeholder="॥ वास्तु पुरुषाय नमः ॥" onUpdate={onUpdateField} className="font-marathi-display text-xs font-bold text-paithani tracking-widest uppercase" />
        <EditableField field="title" value={title} placeholder="गृहप्रवेश व वास्तुशांती" onUpdate={onUpdateField} tag="h2" className="font-marathi-display text-2xl sm:text-3xl font-black text-leaf-700 mt-1" />
      </div>

      <div className="my-3 rounded-xl border border-emerald-300 bg-white/90 p-3 text-center space-y-1">
        <span className="text-xs font-bold text-paithani">● नवीन गृहस्वामी ●</span>
        <EditableField field="personA" value={personA} placeholder="श्री. व सौ. गृहस्वामी" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-lg sm:text-xl font-black text-ink-800" />
      </div>

      <div className="rounded-xl border border-emerald-300 bg-emerald-100/80 p-2.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-leaf-700">
          <span>📅</span>
          <EditableField field="date" value={date} placeholder="शुभ वार व तारीख" onUpdate={onUpdateField} />
          <span>•</span>
          <span>⏰</span>
          <EditableField field="time" value={time} placeholder="सकाळी ९:०० वा." onUpdate={onUpdateField} />
        </div>
      </div>

      <div className="my-3 text-center space-y-0.5">
        <span className="text-xs font-bold text-paithani uppercase">● नवीन वास्तु पत्ता ●</span>
        <EditableField field="venue" value={venue} placeholder="फ्लॅट क्र. / बंगला नाव" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-ink-800" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      <div className="border-t border-emerald-200 pt-2 text-center">
        <span className="text-xs font-bold text-paithani">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   7. GANESH DEVOTIONAL VELVET MODERN ART CARD
   Deep crimson / navy velvet with 3D gold Ganesha, durva, brass bells.
   ══════════════════════════════════════════════════════════════════════ */
function GaneshDevotionalModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#38040d] via-[#4d0714] to-[#240207] p-4 sm:p-6 text-white select-none border-2 border-amber-400 shadow-2xl">
      <div className="flex justify-center mb-1">
        <RoyalGaneshCrest color="#ffd700" size={54} />
      </div>

      <div className="text-center">
        <EditableField field="blessing" value={blessing} placeholder="॥ श्री गणेशाय नमः ॥" onUpdate={onUpdateField} className="font-marathi-display text-xs font-bold text-[#ffd700] tracking-widest uppercase drop-shadow" />
        <EditableField field="title" value={title} placeholder="शुभविवाह सोहळा" onUpdate={onUpdateField} tag="h2" className="font-marathi-display text-2xl sm:text-3xl font-black text-gold-200 mt-1 drop-shadow" />
      </div>

      <div className="my-3 space-y-2 border-y border-amber-400/40 py-3 text-center">
        <div>
          <span className="text-xs font-bold text-gold-300">चि. वर</span>
          <EditableField field="personA" value={personA} placeholder="वर नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-gold-200" />
          {parentsA && <EditableField field="parentsA" value={parentsA} placeholder="पालक" onUpdate={onUpdateField} className="text-xs text-gold-200/80" />}
        </div>
        {personB && (
          <div>
            <span className="text-xs font-bold text-gold-300">चि.सौ.कां. वधू</span>
            <EditableField field="personB" value={personB} placeholder="वधू नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-gold-200" />
            {parentsB && <EditableField field="parentsB" value={parentsB} placeholder="पालक" onUpdate={onUpdateField} className="text-xs text-gold-200/80" />}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-400/60 bg-black/40 p-2.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#ffd700]">
          <span>📅</span>
          <EditableField field="date" value={date} placeholder="शुभ दिनांक" onUpdate={onUpdateField} />
          <span>•</span>
          <span>⏰</span>
          <EditableField field="time" value={time} placeholder="शुभ मुहूर्त" onUpdate={onUpdateField} />
        </div>
      </div>

      <div className="my-3 text-center space-y-0.5">
        <span className="text-xs font-bold text-gold-300 uppercase">● विवाह स्थळ ●</span>
        <EditableField field="venue" value={venue} placeholder="मंगल कार्यालय" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-gold-200" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-gold-200/80" />}
      </div>

      <div className="border-t border-amber-400/30 pt-2 text-center">
        <span className="text-xs font-bold text-gold-300">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-gold-200 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   8. MARATHA KATYAR & PEACOCK ROYAL MODERN ART CARD
   Chhatrapati Shivaji Maharaj rajmudra, royal dagger, pearl mundavalya.
   ══════════════════════════════════════════════════════════════════════ */
function MarathaKatyarModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#fff9ee] to-[#fbf1dc] p-4 sm:p-6 text-ink-900 select-none border-2 border-amber-600 shadow-2xl">
      <div className="flex justify-center mb-1">
        <RoyalMarathaKatyar />
      </div>

      <div className="text-center">
        <EditableField field="blessing" value={blessing} placeholder="॥ श्री भवानी प्रसन्न ॥" onUpdate={onUpdateField} className="font-marathi-display text-xs font-bold text-gold-ink tracking-widest uppercase" />
        <EditableField field="title" value={title} placeholder="राजेशाही लग्नपत्रिका" onUpdate={onUpdateField} tag="h2" className="font-marathi-display text-2xl sm:text-3xl font-black text-[#7c2d12] mt-1" />
      </div>

      <div className="my-3 space-y-2 border-y border-amber-400/60 py-3 text-center">
        <div>
          <span className="text-xs font-bold text-gold-ink">वर (चि.)</span>
          <EditableField field="personA" value={personA} placeholder="चि. वर नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-[#451a03]" />
          {parentsA && <EditableField field="parentsA" value={parentsA} placeholder="पालक" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
        </div>
        {personB && (
          <div>
            <span className="text-xs font-bold text-gold-ink">वधू (चि.सौ.कां.)</span>
            <EditableField field="personB" value={personB} placeholder="चि.सौ.कां. वधू नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-[#451a03]" />
            {parentsB && <EditableField field="parentsB" value={parentsB} placeholder="पालक" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-400 bg-white/90 p-2.5 text-center shadow-xs">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-gold-ink">
          <span>📅</span>
          <EditableField field="date" value={date} placeholder="शुभ मुहूर्त दिनांक" onUpdate={onUpdateField} />
          <span>•</span>
          <span>⏰</span>
          <EditableField field="time" value={time} placeholder="वेळ" onUpdate={onUpdateField} />
        </div>
      </div>

      <div className="my-3 text-center space-y-0.5">
        <span className="text-xs font-bold text-gold-ink uppercase">● सोहळा स्थळ ●</span>
        <EditableField field="venue" value={venue} placeholder="राजमहाल / लॉन्स" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-ink-800" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      <div className="border-t border-amber-300 pt-2 text-center">
        <span className="text-xs font-bold text-gold-ink">● निमंत्रक ●</span>
        <EditableField field="host" value={host} placeholder="समस्त परिवार" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800 mt-0.5" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   9. UNIVERSAL MODERN ART FALLBACK CARD
   ══════════════════════════════════════════════════════════════════════ */
function UniversalModernArtCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#fffdf9] p-4 sm:p-6 text-ink-900 select-none border-2 border-amber-400 shadow-2xl">
      <div className="text-center">
        <RoyalGaneshCrest color="#b45309" size={42} />
        <EditableField field="blessing" value={blessing} placeholder="॥ श्री गणेशाय नमः ॥" onUpdate={onUpdateField} className="mt-1 font-marathi-display text-xs font-bold text-[#b45309] tracking-widest uppercase" />
        <EditableField field="title" value={title} placeholder="आमंत्रण पत्रिका" onUpdate={onUpdateField} tag="h2" className="font-marathi-display text-2xl sm:text-3xl font-black text-[#78350f] mt-1" />
      </div>

      <div className="my-3 space-y-2 border-y border-amber-200 py-3 text-center">
        <EditableField field="personA" value={personA} placeholder="नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-ink-900" />
        {parentsA && <EditableField field="parentsA" value={parentsA} placeholder="तपशील" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
        {personB && (
          <div>
            <span className="text-xs text-gold-ink font-bold">आणि</span>
            <EditableField field="personB" value={personB} placeholder="दुसरे नाव" onUpdate={onUpdateField} tag="h3" className="font-marathi-display text-xl sm:text-2xl font-black text-ink-900" />
            {parentsB && <EditableField field="parentsB" value={parentsB} placeholder="तपशील" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-center text-xs sm:text-sm font-bold text-gold-ink">
        <EditableField field="date" value={date} placeholder="दिनांक" onUpdate={onUpdateField} />
        <span> • </span>
        <EditableField field="time" value={time} placeholder="वेळ" onUpdate={onUpdateField} />
      </div>

      <div className="my-3 text-center space-y-0.5">
        <EditableField field="venue" value={venue} placeholder="स्थळ" onUpdate={onUpdateField} className="text-xs sm:text-sm font-bold text-ink-800" />
        {city && <EditableField field="city" value={city} placeholder="शहर" onUpdate={onUpdateField} className="text-xs text-ink-500" />}
      </div>

      <div className="border-t border-amber-200 pt-2 text-center">
        <EditableField field="host" value={host} placeholder="निमंत्रक" onUpdate={onUpdateField} className="text-xs font-bold text-ink-800" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT: LAGN PATRIKA CARD ENGINE
   Directly routes every template to its authentic printed modern art layout
   with 100% editable typography, click-to-edit, and reference peek mode.
   ══════════════════════════════════════════════════════════════════════ */
export function LagnPatrikaCard({
  template,
  blessing,
  title,
  personA,
  personB,
  surnames,
  date,
  time,
  venue,
  city,
  host,
  parentsA,
  parentsB,
  tagline,
  className = "",
  id,
  onUpdateField,
}: {
  template: MasterTemplate;
  blessing: string;
  title: string;
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  tagline?: string;
  className?: string;
  id?: string;
  onUpdateField?: (field: keyof CardRenderData, val: string) => void;
}) {
  const photoUrl = template.sample?.photoUrl || template.placeholders?.photoUrl;
  /* Default is ALWAYS the modern editable design! */
  const [showReferencePhoto, setShowReferencePhoto] = useState(false);

  const tId = template.id.toLowerCase();

  return (
    <article
      id={id}
      className={`group relative mx-auto w-full max-w-[540px] select-none ${className}`}
    >
      {/* Top Floating View Toggle: Editable Live Design vs Reference Photo */}
      {photoUrl && (
        <div className="flex items-center justify-between pb-2 px-1 text-xs print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-marathi-display text-xs font-bold text-ink-700">
              {showReferencePhoto ? "मूळ संदर्भ फोटो दृश्य" : "✨ संपादनक्षम आधुनिक डिझाईन (Editable)"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowReferencePhoto((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/95 px-2.5 py-1 text-xs font-bold text-gold-ink shadow-xs hover:bg-amber-50 active:scale-95 transition"
          >
            <span>{showReferencePhoto ? "🎨 संपादन डिझाइन उघडा" : "👁️ संदर्भ फोटो पाहा"}</span>
          </button>
        </div>
      )}

      {/* ── PEAK REFERENCE PHOTO VIEW (If user explicitly clicks peek) ── */}
      {showReferencePhoto && photoUrl ? (
        <div className="relative flex flex-col rounded-2xl overflow-hidden border-2 border-amber-300 bg-neutral-900 shadow-xl">
          <div className="relative w-full overflow-hidden bg-neutral-950">
            <img
              src={photoUrl}
              alt={template.nameMr}
              className="w-full h-auto object-contain max-h-[720px] mx-auto"
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          </div>
          <div className="border-t border-amber-400/40 bg-neutral-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
            <span className="font-bold text-gold-300">मूळ मुद्रित संदर्भ नमुना</span>
            <button
              type="button"
              onClick={() => setShowReferencePhoto(false)}
              className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-ink-900 hover:bg-amber-300 transition"
            >
              थेट संपादनाकडे परत जा →
            </button>
          </div>
        </div>
      ) : (
        /* ── SUPER-PREMIUM PRINTED MODERN ART EDITABLE DESIGN (DEFAULT) ── */
        <div>
          {tId.includes("baudha") ? (
            <BaudhaModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              tagline={tagline}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("floral") || tId.includes("rajmahal") || tId.includes("garden") ? (
            <FloralIvoryModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              tagline={tagline}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("tutari") || tId.includes("leaf") ? (
            <LeafTutariModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              tagline={tagline}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("satyanarayan") ? (
            <SatyanarayanModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              tagline={tagline}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("sakharpuda") ? (
            <SakharpudaModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("vastushanti") ? (
            <VastushantiModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              tagline={tagline}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("ganesh") || tId.includes("ganpati") ? (
            <GaneshDevotionalModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              onUpdateField={onUpdateField}
            />
          ) : tId.includes("maratha") || tId.includes("katyar") || tId.includes("arch-dhol") ? (
            <MarathaKatyarModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              onUpdateField={onUpdateField}
            />
          ) : (
            <UniversalModernArtCard
              template={template}
              blessing={blessing}
              title={title}
              personA={personA}
              personB={personB}
              surnames={surnames}
              date={date}
              time={time}
              venue={venue}
              city={city}
              host={host}
              parentsA={parentsA}
              parentsB={parentsB}
              onUpdateField={onUpdateField}
            />
          )}
        </div>
      )}
    </article>
  );
}
