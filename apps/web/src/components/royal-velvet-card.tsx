"use client";

import React, { useId } from "react";
import { type MasterTemplate } from "@/lib/templates-catalog";
import { type CardRenderData } from "./master-template-card";

export type RoyalBgColor =
  | "royal-purple"
  | "midnight-navy"
  | "imperial-emerald"
  | "heritage-maroon"
  | "obsidian-black"
  | "burgundy-bronze";

export type RoyalFoilType = "gold" | "silver" | "rose-gold";

export interface RoyalThemeConfig {
  id: RoyalBgColor;
  nameMr: string;
  nameEn: string;
  gradient: string;
  accent: string;
  swatch: string;
}

export const ROYAL_BG_PALETTES: RoyalThemeConfig[] = [
  {
    id: "royal-purple",
    nameMr: "शाही जांभळा (Royal Purple)",
    nameEn: "Royal Velvet Purple",
    gradient: "linear-gradient(168deg, #2d043a 0%, #1e0227 50%, #0e0114 100%)",
    accent: "#f5d061",
    swatch: "#3b084c",
  },
  {
    id: "midnight-navy",
    nameMr: "मध्यरात्री नेव्ही (Midnight Navy)",
    nameEn: "Midnight Sapphire Navy",
    gradient: "linear-gradient(168deg, #071530 0%, #040d1e 50%, #02060f 100%)",
    accent: "#e2e8f0",
    swatch: "#091b3d",
  },
  {
    id: "imperial-emerald",
    nameMr: "पाचू हिरवा (Imperial Emerald)",
    nameEn: "Imperial Emerald Velvet",
    gradient: "linear-gradient(168deg, #05261b 0%, #031710 50%, #010c08 100%)",
    accent: "#f5d061",
    swatch: "#073324",
  },
  {
    id: "heritage-maroon",
    nameMr: "किरमिजी मारून (Heritage Maroon)",
    nameEn: "Heritage Ruby Maroon",
    gradient: "linear-gradient(168deg, #360613 0%, #20030a 50%, #100104 100%)",
    accent: "#f5d061",
    swatch: "#4a081a",
  },
  {
    id: "obsidian-black",
    nameMr: "ऑब्सिडियन ब्लॅक (Obsidian Noir)",
    nameEn: "Obsidian Noir Velvet",
    gradient: "linear-gradient(168deg, #151318 0%, #0d0c10 50%, #060507 100%)",
    accent: "#f5d061",
    swatch: "#18161c",
  },
  {
    id: "burgundy-bronze",
    nameMr: "शाही ब्राँझ (Burgundy Bronze)",
    nameEn: "Burgundy Chocolate Bronze",
    gradient: "linear-gradient(168deg, #28140c 0%, #180a05 50%, #0c0402 100%)",
    accent: "#f5d061",
    swatch: "#331a0f",
  },
];

export const ROYAL_FOIL_STYLES: Array<{
  id: RoyalFoilType;
  nameMr: string;
  nameEn: string;
  badge: string;
  gradientClass: string;
  accentHex: string;
  borderHex: string;
}> = [
  {
    id: "gold",
    nameMr: "२४K सुवर्ण फॉइल",
    nameEn: "24K Gold Foil",
    badge: "24K GOLD",
    gradientClass: "gold-foil-text",
    accentHex: "#f5d061",
    borderHex: "#dfb150",
  },
  {
    id: "silver",
    nameMr: "९२५ रुपेरी फॉइल",
    nameEn: "925 Sterling Silver",
    badge: "STERLING SILVER",
    gradientClass: "silver-foil-text",
    accentHex: "#f1f5f9",
    borderHex: "#cbd5e1",
  },
  {
    id: "rose-gold",
    nameMr: "रोझ गोल्ड फॉइल",
    nameEn: "Rose Gold Foil",
    badge: "ROSE GOLD",
    gradientClass: "rosegold-foil-text",
    accentHex: "#fda4af",
    borderHex: "#f472b6",
  },
];

/* ══════════════════════════════════════════════════════════════════════
   1. ROYAL VELVET GANESHA TEMPLE ARCH SVG
   Exact match to reference: Sitting Ganesha on throne, hanging bells,
   temple columns with palms, elephants at bottom, peacocks at sides.
   ══════════════════════════════════════════════════════════════════════ */
export function RoyalVelvetTempleArchSvg({
  foilType = "gold",
  className = "",
}: {
  foilType?: RoyalFoilType;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `foilGrad_${uid}`;
  const strokeGradId = `foilStroke_${uid}`;
  const shadowId = `foilShadow_${uid}`;

  const isSilver = foilType === "silver";
  const isRose = foilType === "rose-gold";

  const stop1 = isSilver ? "#ffffff" : isRose ? "#fff1f2" : "#fff8db";
  const stop2 = isSilver ? "#e2e8f0" : isRose ? "#f472b6" : "#f5d061";
  const stop3 = isSilver ? "#94a3b8" : isRose ? "#be185d" : "#aa771c";
  const stop4 = isSilver ? "#cbd5e1" : isRose ? "#fda4af" : "#ffd700";

  return (
    <svg
      viewBox="0 0 540 380"
      className={`w-full h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="28%" stopColor={stop2} />
          <stop offset="65%" stopColor={stop3} />
          <stop offset="100%" stopColor={stop4} />
        </linearGradient>

        <linearGradient id={strokeGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="50%" stopColor={stop2} />
          <stop offset="100%" stopColor={stop3} />
        </linearGradient>

        <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.7" />
        </filter>
      </defs>

      {/* ── Hanging Chains & Temple Bells (घंटा) ── */}
      {/* Outer Left Bell */}
      <g filter={`url(#${shadowId})`}>
        <line x1="72" y1="35" x2="72" y2="95" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" strokeDasharray="2 3" />
        <path d="M64 95 C64 88, 80 88, 80 95 L84 110 C84 114, 60 114, 60 110 Z" fill={`url(#${gradId})`} />
        <circle cx="72" cy="113" r="2.8" fill={`url(#${gradId})`} />
      </g>

      {/* Inner Left Bell */}
      <g filter={`url(#${shadowId})`}>
        <line x1="110" y1="52" x2="110" y2="108" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" strokeDasharray="2 3" />
        <path d="M103 108 C103 102, 117 102, 117 108 L121 122 C121 125, 99 125, 99 122 Z" fill={`url(#${gradId})`} />
        <circle cx="110" cy="125" r="2.5" fill={`url(#${gradId})`} />
      </g>

      {/* Inner Right Bell */}
      <g filter={`url(#${shadowId})`}>
        <line x1="430" y1="52" x2="430" y2="108" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" strokeDasharray="2 3" />
        <path d="M423 108 C423 102, 437 102, 437 108 L441 122 C441 125, 419 125, 419 122 Z" fill={`url(#${gradId})`} />
        <circle cx="430" cy="125" r="2.5" fill={`url(#${gradId})`} />
      </g>

      {/* Outer Right Bell */}
      <g filter={`url(#${shadowId})`}>
        <line x1="468" y1="35" x2="468" y2="95" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" strokeDasharray="2 3" />
        <path d="M460 95 C460 88, 476 88, 476 95 L480 110 C480 114, 456 114, 456 110 Z" fill={`url(#${gradId})`} />
        <circle cx="468" cy="113" r="2.8" fill={`url(#${gradId})`} />
      </g>

      {/* ── Left Pillar & Palm / Tree Ornaments ── */}
      <g filter={`url(#${shadowId})`}>
        {/* Palm tree beside pillar */}
        <g transform="translate(116, 210) scale(0.65)">
          <path d="M20 70 Q16 35, 20 0" stroke={`url(#${strokeGradId})`} strokeWidth="3" strokeLinecap="round" />
          {/* Palm Fronds */}
          <path d="M20 15 Q-5 5, -15 -10 Q5 -2, 20 10" fill={`url(#${gradId})`} />
          <path d="M20 12 Q45 2, 55 -10 Q35 -2, 20 10" fill={`url(#${gradId})`} />
          <path d="M20 5 Q0 -20, 0 -35 Q12 -18, 20 0" fill={`url(#${gradId})`} />
          <path d="M20 5 Q40 -20, 40 -35 Q28 -18, 20 0" fill={`url(#${gradId})`} />
          <path d="M20 0 Q20 -25, 20 -45 Q26 -25, 20 0" fill={`url(#${gradId})`} />
        </g>

        {/* Fluted Column Pillar */}
        <rect x="145" y="125" width="26" height="155" fill={`url(#${gradId})`} rx="2" />
        <line x1="151" y1="130" x2="151" y2="275" stroke="#1a0423" strokeWidth="1.5" opacity="0.4" />
        <line x1="158" y1="130" x2="158" y2="275" stroke="#1a0423" strokeWidth="1.5" opacity="0.4" />
        <line x1="165" y1="130" x2="165" y2="275" stroke="#1a0423" strokeWidth="1.5" opacity="0.4" />

        {/* Pillar Capital (Top) */}
        <path d="M138 125 C138 115, 178 115, 178 125 Z" fill={`url(#${gradId})`} />
        <rect x="135" y="112" width="32" height="6" fill={`url(#${gradId})`} rx="1" />

        {/* Pillar Base (Bottom) */}
        <path d="M138 280 C138 290, 178 290, 178 280 Z" fill={`url(#${gradId})`} />
        <rect x="135" y="282" width="32" height="7" fill={`url(#${gradId})`} rx="1" />
      </g>

      {/* ── Right Pillar & Palm / Tree Ornaments ── */}
      <g filter={`url(#${shadowId})`} transform="translate(540, 0) scale(-1, 1)">
        {/* Palm tree beside pillar */}
        <g transform="translate(116, 210) scale(0.65)">
          <path d="M20 70 Q16 35, 20 0" stroke={`url(#${strokeGradId})`} strokeWidth="3" strokeLinecap="round" />
          <path d="M20 15 Q-5 5, -15 -10 Q5 -2, 20 10" fill={`url(#${gradId})`} />
          <path d="M20 12 Q45 2, 55 -10 Q35 -2, 20 10" fill={`url(#${gradId})`} />
          <path d="M20 5 Q0 -20, 0 -35 Q12 -18, 20 0" fill={`url(#${gradId})`} />
          <path d="M20 5 Q40 -20, 40 -35 Q28 -18, 20 0" fill={`url(#${gradId})`} />
          <path d="M20 0 Q20 -25, 20 -45 Q26 -25, 20 0" fill={`url(#${gradId})`} />
        </g>

        {/* Fluted Column Pillar */}
        <rect x="145" y="125" width="26" height="155" fill={`url(#${gradId})`} rx="2" />
        <line x1="151" y1="130" x2="151" y2="275" stroke="#1a0423" strokeWidth="1.5" opacity="0.4" />
        <line x1="158" y1="130" x2="158" y2="275" stroke="#1a0423" strokeWidth="1.5" opacity="0.4" />
        <line x1="165" y1="130" x2="165" y2="275" stroke="#1a0423" strokeWidth="1.5" opacity="0.4" />

        {/* Pillar Capital */}
        <path d="M138 125 C138 115, 178 115, 178 125 Z" fill={`url(#${gradId})`} />
        <rect x="135" y="112" width="32" height="6" fill={`url(#${gradId})`} rx="1" />

        {/* Pillar Base */}
        <path d="M138 280 C138 290, 178 290, 178 280 Z" fill={`url(#${gradId})`} />
        <rect x="135" y="282" width="32" height="7" fill={`url(#${gradId})`} rx="1" />
      </g>

      {/* ── Grand Scalloped Temple Arch (मंदिर कमान) ── */}
      <g filter={`url(#${shadowId})`}>
        {/* Outer Heavy Baroque Molding */}
        <path
          d="M148 116 C148 20, 392 20, 392 116"
          stroke={`url(#${strokeGradId})`}
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Inner Scalloped Cusps */}
        <path
          d="M156 116 C156 50, 185 45, 205 60 C225 35, 250 32, 270 32 C290 32, 315 35, 335 60 C355 45, 384 50, 384 116"
          fill="none"
          stroke={`url(#${strokeGradId})`}
          strokeWidth="4"
        />

        {/* Delicate Scallop Shell Dentils */}
        <path
          d="M170 114 Q180 85, 200 90 Q215 65, 240 70 Q255 48, 270 48 Q285 48, 300 70 Q325 65, 340 90 Q360 85, 370 114"
          fill="none"
          stroke={`url(#${strokeGradId})`}
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />

        {/* Arch Finial / Kalash at Peak */}
        <g transform="translate(270, 16)">
          <path d="M0 -12 Q-6 -6, 0 0 Q6 -6, 0 -12 Z" fill={`url(#${gradId})`} />
          <circle cx="0" cy="-14" r="2.5" fill={`url(#${gradId})`} />
          <path d="M-8 0 Q0 6, 8 0 Z" fill={`url(#${gradId})`} />
        </g>
      </g>

      {/* ── Sacred Seated Lord Ganesha on Throne (सिंहासन) ── */}
      <g transform="translate(270, 200)" filter={`url(#${shadowId})`}>
        {/* Royal Throne Backrest (मखर / सिंहासन) */}
        <ellipse cx="0" cy="-35" rx="55" ry="58" fill="none" stroke={`url(#${strokeGradId})`} strokeWidth="4.5" />
        <ellipse cx="0" cy="-35" rx="46" ry="49" fill="none" stroke={`url(#${strokeGradId})`} strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Throne Bolster Cushion */}
        <rect x="-44" y="10" width="88" height="22" rx="10" fill={`url(#${gradId})`} />
        {/* Throne Base Pedestal (चौरांग) */}
        <path d="M-52 32 L52 32 L44 48 L-44 48 Z" fill={`url(#${gradId})`} />
        <rect x="-48" y="48" width="96" height="6" rx="2" fill={`url(#${gradId})`} />

        {/* Ganesha Crown (भव्य मुकुट) */}
        <path d="M-14 -70 L14 -70 L10 -92 L0 -98 L-10 -92 Z" fill={`url(#${gradId})`} />
        <circle cx="0" cy="-99" r="2.5" fill={`url(#${gradId})`} />
        {/* Crown Filigree Bands */}
        <line x1="-12" y1="-76" x2="12" y2="-76" stroke="#1a0423" strokeWidth="1.2" opacity="0.6" />
        <line x1="-9" y1="-84" x2="9" y2="-84" stroke="#1a0423" strokeWidth="1.2" opacity="0.6" />

        {/* Head & Majestic Ears */}
        {/* Left Ear (कर्ण) */}
        <path d="M-14 -65 C-36 -72, -40 -40, -18 -38 C-25 -28, -16 -22, -10 -32" fill={`url(#${gradId})`} />
        {/* Right Ear */}
        <path d="M14 -65 C36 -72, 40 -40, 18 -38 C25 -28, 16 -22, 10 -32" fill={`url(#${gradId})`} />

        {/* Forehead & Sacred Tilak / Trishul */}
        <circle cx="0" cy="-55" r="14" fill={`url(#${gradId})`} />
        <path d="M-3 -62 L3 -62 L0 -52 Z" fill="#1a0423" opacity="0.8" />
        <circle cx="0" cy="-60" r="1.5" fill="#fff" />

        {/* Graceful Trunk (सोंड वळलेली) */}
        <path
          d="M-2 -46 C-3 -32, -8 -22, -18 -20 C-26 -18, -26 -8, -14 -10 C-4 -12, 4 -22, 4 -46 Z"
          fill={`url(#${gradId})`}
        />
        {/* Sacred Modak / Ladoo in Trunk tip */}
        <circle cx="-20" cy="-12" r="4.5" fill={`url(#${gradId})`} />

        {/* Body & Pot-belly (लंबोदर) */}
        <ellipse cx="0" cy="-8" rx="28" ry="24" fill={`url(#${gradId})`} />
        {/* Sacred Thread (जानवे) */}
        <path d="M-16 -28 Q-6 0, 18 12" stroke="#1a0423" strokeWidth="1.5" opacity="0.6" />

        {/* Four Arms & Divine Emblems (चतुर्भुज) */}
        {/* Upper Right Hand with Axe (परशू) */}
        <path d="M22 -35 C32 -42, 38 -32, 34 -22 L24 -22 Z" fill={`url(#${gradId})`} />
        <line x1="36" y1="-50" x2="36" y2="-20" stroke={`url(#${strokeGradId})`} strokeWidth="2.5" />
        <path d="M36 -46 Q46 -40, 36 -34 Z" fill={`url(#${gradId})`} />

        {/* Upper Left Hand with Lotus (कमळ / पाश) */}
        <path d="M-22 -35 C-32 -42, -38 -32, -34 -22 L-24 -22 Z" fill={`url(#${gradId})`} />
        <circle cx="-35" cy="-42" r="5" fill={`url(#${gradId})`} />

        {/* Lower Right Hand: Abhaya Mudra (आशीर्वाद वरदमुद्रा) */}
        <path d="M24 -15 C34 -15, 36 -2, 28 4 L20 0 Z" fill={`url(#${gradId})`} />
        <circle cx="28" cy="-5" r="2" fill="#fff" />

        {/* Lower Left Hand: Bowl of Modaks (मोदक पात्र) */}
        <path d="M-24 -15 C-34 -15, -36 -2, -28 4 L-20 0 Z" fill={`url(#${gradId})`} />
        <ellipse cx="-28" cy="-2" rx="7" ry="4" fill={`url(#${gradId})`} />
        <circle cx="-28" cy="-5" r="2" fill="#fff" />

        {/* Crossed Seated Legs (पद्मासन / ललितासन) */}
        <path d="M-38 18 C-38 6, -20 6, -10 18 C-2 18, 2 18, 10 18 C20 6, 38 6, 38 18 Z" fill={`url(#${gradId})`} />
        {/* Lotus Petal Footrest */}
        <path d="M-25 32 Q0 24, 25 32" stroke={`url(#${strokeGradId})`} strokeWidth="2.5" />

        {/* Auspicious Mushak (उंदीर मामा) at base */}
        <g transform="translate(32, 26) scale(0.65)">
          <ellipse cx="0" cy="0" rx="6" ry="4" fill={`url(#${gradId})`} />
          <path d="M5 -1 Q10 -3, 8 1" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" />
          <circle cx="4" cy="-2" r="1.5" fill={`url(#${gradId})`} />
        </g>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. ROYAL VELVET OUTER ORNAMENTAL FRAME (With Elephants & Peacocks)
   Matching the real gold filigree border of the reference photo
   ══════════════════════════════════════════════════════════════════════ */
export function RoyalVelvetCardFrame({
  foilType = "gold",
  className = "",
}: {
  foilType?: RoyalFoilType;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `frameFoil_${uid}`;
  const strokeGradId = `frameStroke_${uid}`;
  const beadGradId = `frameBead_${uid}`;

  const isSilver = foilType === "silver";
  const isRose = foilType === "rose-gold";

  const stop1 = isSilver ? "#ffffff" : isRose ? "#fff1f2" : "#fff8db";
  const stop2 = isSilver ? "#e2e8f0" : isRose ? "#f472b6" : "#f5d061";
  const stop3 = isSilver ? "#94a3b8" : isRose ? "#be185d" : "#aa771c";
  const stop4 = isSilver ? "#cbd5e1" : isRose ? "#fda4af" : "#ffd700";

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 600 880"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="25%" stopColor={stop2} />
          <stop offset="60%" stopColor={stop3} />
          <stop offset="100%" stopColor={stop4} />
        </linearGradient>

        <linearGradient id={strokeGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stop1} />
          <stop offset="50%" stopColor={stop2} />
          <stop offset="100%" stopColor={stop3} />
        </linearGradient>

        <linearGradient id={beadGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor={stop2} />
          <stop offset="100%" stopColor={stop3} />
        </linearGradient>
      </defs>

      {/* Outer Raised Gold Molding (Rectangle) */}
      <rect
        x="18"
        y="18"
        width="564"
        height="844"
        rx="4"
        stroke={`url(#${strokeGradId})`}
        strokeWidth="3.5"
      />

      {/* Beaded Pearl Inner String (मोत्यांची माळ) */}
      <rect
        x="26"
        y="26"
        width="548"
        height="828"
        rx="3"
        stroke={`url(#${beadGradId})`}
        strokeWidth="1.6"
        strokeDasharray="3 3.5"
      />

      {/* Thin Gold Filigree Track */}
      <rect
        x="42"
        y="42"
        width="516"
        height="796"
        rx="2"
        stroke={`url(#${strokeGradId})`}
        strokeWidth="1.2"
      />

      {/* ── Left Side Royal Peacocks (मोर) ── */}
      <g transform="translate(34, 450) scale(0.65)">
        {/* Peacock Body & Crest */}
        <path d="M0 0 C-6 -15, 6 -35, 16 -30 C22 -25, 20 -10, 10 5 Z" fill={`url(#${gradId})`} />
        <circle cx="16" cy="-30" r="3.5" fill={`url(#${gradId})`} />
        <path d="M18 -34 L23 -40 M19 -35 L25 -38 M16 -35 L20 -41" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" />
        {/* Elaborate Train Feathers flowing downward */}
        <path
          d="M0 0 C-10 25, 5 60, -2 95 C-8 120, 12 140, 2 165 C-4 185, 8 200, 0 220"
          stroke={`url(#${strokeGradId})`}
          strokeWidth="3"
          strokeDasharray="4 2"
        />
        <circle cx="4" cy="50" r="3.5" fill={`url(#${gradId})`} />
        <circle cx="-3" cy="95" r="3.5" fill={`url(#${gradId})`} />
        <circle cx="6" cy="140" r="3.5" fill={`url(#${gradId})`} />
        <circle cx="-1" cy="185" r="3.5" fill={`url(#${gradId})`} />
      </g>

      {/* ── Right Side Royal Peacocks (मोर) ── */}
      <g transform="translate(566, 450) scale(-0.65, 0.65)">
        <path d="M0 0 C-6 -15, 6 -35, 16 -30 C22 -25, 20 -10, 10 5 Z" fill={`url(#${gradId})`} />
        <circle cx="16" cy="-30" r="3.5" fill={`url(#${gradId})`} />
        <path d="M18 -34 L23 -40 M19 -35 L25 -38 M16 -35 L20 -41" stroke={`url(#${strokeGradId})`} strokeWidth="1.2" />
        <path
          d="M0 0 C-10 25, 5 60, -2 95 C-8 120, 12 140, 2 165 C-4 185, 8 200, 0 220"
          stroke={`url(#${strokeGradId})`}
          strokeWidth="3"
          strokeDasharray="4 2"
        />
        <circle cx="4" cy="50" r="3.5" fill={`url(#${gradId})`} />
        <circle cx="-3" cy="95" r="3.5" fill={`url(#${gradId})`} />
        <circle cx="6" cy="140" r="3.5" fill={`url(#${gradId})`} />
        <circle cx="-1" cy="185" r="3.5" fill={`url(#${gradId})`} />
      </g>

      {/* ── Bottom Left Royal Elephant with Howdah / Saddle (हत्ती) ── */}
      <g transform="translate(95, 846) scale(0.65)">
        {/* Elephant Body */}
        <path
          d="M-25 0 C-25 -20, 10 -24, 25 -10 C32 -4, 38 2, 42 12 L38 24 L30 24 L30 14 L20 14 L20 24 L12 24 L14 10 L-10 10 L-8 24 L-16 24 L-16 10 L-22 24 L-28 24 Z"
          fill={`url(#${gradId})`}
        />
        {/* Raised Trunk (सोंड वर उचललेली - शुभ शकुन) */}
        <path d="M38 4 Q48 -12, 42 -22 Q36 -12, 36 -2" stroke={`url(#${strokeGradId})`} strokeWidth="3" strokeLinecap="round" />
        {/* Royal Saddle Blanket (झूल) */}
        <rect x="-6" y="-12" width="20" height="15" rx="2" fill="#fff" opacity="0.3" stroke={`url(#${strokeGradId})`} strokeWidth="1" />
        {/* Tusk (सुळे) */}
        <path d="M38 12 Q45 10, 42 4" stroke="#fff" strokeWidth="1.5" />
      </g>

      {/* ── Bottom Right Royal Elephant (हत्ती) ── */}
      <g transform="translate(505, 846) scale(-0.65, 0.65)">
        <path
          d="M-25 0 C-25 -20, 10 -24, 25 -10 C32 -4, 38 2, 42 12 L38 24 L30 24 L30 14 L20 14 L20 24 L12 24 L14 10 L-10 10 L-8 24 L-16 24 L-16 10 L-22 24 L-28 24 Z"
          fill={`url(#${gradId})`}
        />
        <path d="M38 4 Q48 -12, 42 -22 Q36 -12, 36 -2" stroke={`url(#${strokeGradId})`} strokeWidth="3" strokeLinecap="round" />
        <rect x="-6" y="-12" width="20" height="15" rx="2" fill="#fff" opacity="0.3" stroke={`url(#${strokeGradId})`} strokeWidth="1" />
        <path d="M38 12 Q45 10, 42 4" stroke="#fff" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. MASTER ROYAL VELVET CARD COMPONENT
   Complete render with dynamic dark backgrounds, metallic foil fonts,
   Sitting Ganesha, and interactive live text.
   ══════════════════════════════════════════════════════════════════════ */
export function RoyalVelvetGaneshCard({
  template,
  data,
  isBlankPlaceholder = false,
  foilType = "gold",
  bgColor = "royal-purple",
  className = "",
  id,
}: {
  template: MasterTemplate;
  data: CardRenderData;
  isBlankPlaceholder?: boolean;
  foilType?: RoyalFoilType;
  bgColor?: RoyalBgColor;
  className?: string;
  id?: string;
}) {
  // Find background palette
  const activePalette =
    ROYAL_BG_PALETTES.find((p) => p.id === (data.bgColor || bgColor)) ||
    ROYAL_BG_PALETTES[0]!;

  const activeFoil =
    ROYAL_FOIL_STYLES.find((f) => f.id === (data.foilColor || foilType)) ||
    ROYAL_FOIL_STYLES[0]!;

  // Resolve fields
  const blessing = data.blessing || template.defaultBlessing || "॥ श्री गणेशाय नमः ॥";
  const title = data.title || template.defaultTitle || "शुभविवाह";

  const personA =
    data.personA ||
    (isBlankPlaceholder ? template.placeholders.personA : template.sample.personA) ||
    "PRINCESS REYA SINGH";

  const personB =
    data.personB !== undefined
      ? data.personB
      : isBlankPlaceholder
        ? template.placeholders.personB
        : template.sample.personB || "PRINCE VIKRAM RAO";

  const parentsA =
    data.parentsA ||
    (isBlankPlaceholder ? template.placeholders.parentsA : template.sample.parentsA) ||
    "(Daughter of Maharaj R.S. Singh Dev & Maharani V. Kumari of Pratapgarh)";

  const parentsB =
    data.parentsB ||
    (isBlankPlaceholder ? template.placeholders.parentsB : template.sample.parentsB) ||
    "(Son of Maharaj K.S. Rao & Maharani S. Lakshmi of Jaipur)";

  const date =
    data.date ||
    (isBlankPlaceholder ? template.placeholders.date : template.sample.date) ||
    "ON SUNDAY, THE 24TH OF NOVEMBER, 2024";

  const venue =
    data.venue ||
    (isBlankPlaceholder ? template.placeholders.venue : template.sample.venue) ||
    "AT THE RAJ MAHAL PALACE, JAIPUR";

  const tagline =
    data.tagline ||
    (isBlankPlaceholder ? template.placeholders.tagline : template.sample.tagline) ||
    "WE CORDIALLY INVITE YOU TO CELEBRATE THE AUSPICIOUS ROYAL WEDDING OF";

  const host =
    data.host ||
    (isBlankPlaceholder ? template.placeholders.host : template.sample.host) ||
    "WITH COMPLIMENTS FROM THE ROYAL FAMILIES";

  // Dynamic metallic font gradient classes
  const isSilver = activeFoil.id === "silver";
  const isRose = activeFoil.id === "rose-gold";

  const foilGradient = isSilver
    ? "linear-gradient(135deg, #ffffff 0%, #f1f5f9 25%, #cbd5e1 55%, #94a3b8 80%, #ffffff 100%)"
    : isRose
      ? "linear-gradient(135deg, #fff1f2 0%, #f472b6 30%, #be185d 70%, #fda4af 100%)"
      : "linear-gradient(135deg, #fff7d6 0%, #ffd700 25%, #d4af37 55%, #996515 80%, #ffe066 100%)";

  const foilTextShadow = isSilver
    ? "0 1px 2px rgba(0,0,0,0.9), 0 0 10px rgba(255,255,255,0.3)"
    : isRose
      ? "0 1px 2px rgba(0,0,0,0.9), 0 0 10px rgba(244,114,182,0.3)"
      : "0 1px 2px rgba(0,0,0,0.9), 0 0 12px rgba(255,215,0,0.3)";

  // Active photographic background asset matching background color & metallic foil
  const baseImageSrc = `/art/card_${activePalette.id}_${activeFoil.id}.jpg`;

  return (
    <div
      id={id}
      className={`relative w-full max-w-[520px] mx-auto overflow-hidden rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] text-center select-none print:shadow-none print:max-w-none print:rounded-none transition-all duration-500 ${className}`}
      style={{
        aspectRatio: "848 / 1264",
      }}
    >
      {/* ── 1. 100% Real High-Resolution Photographic Base ── */}
      {/* Contains genuine 24K gold / 925 sterling silver embossed Ganesha, arch, bells, and frame */}
      <img
        src={baseImageSrc}
        alt="Royal Velvet Ganesha Wedding Invitation"
        className="w-full h-full object-cover block select-none pointer-events-none"
        loading="eager"
      />

      {/* ── Custom Title Override if user changed from default "शुभविवाह" ── */}
      {title && title !== "शुभविवाह" && (
        <div
          className="absolute left-[13%] right-[13%] top-[34.8%] h-[8.5%] z-20 flex items-center justify-center pointer-events-none"
        >
          <div
            className="px-6 py-1.5 rounded-xl backdrop-blur-xs"
            style={{
              background: activePalette.gradient,
              boxShadow: "0 0 20px 8px rgba(0,0,0,0.9)",
            }}
          >
            <h2
              className="font-marathi-display text-2xl sm:text-3xl font-extrabold tracking-wide"
              style={{
                background: foilGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.9)) drop-shadow(${foilTextShadow})`,
              }}
            >
              {title}
            </h2>
          </div>
        </div>
      )}

      {/* ── 2. Dynamic Customizer Text Area Overlay ── */}
      {/* Positioned precisely in the clean velvet bed below शुभविवाह (Y: 60% to 89.5%) */}
      <div
        className="absolute left-[13%] right-[13%] top-[60%] bottom-[10.5%] z-10 flex flex-col justify-between items-center text-center pointer-events-none select-none"
      >
        {/* Top: Invitation Ribbon / Tagline */}
        <div className="w-full pt-1">
          <p
            className="text-[8px] sm:text-[9.5px] font-bold tracking-[0.14em] uppercase leading-tight max-w-[340px] mx-auto"
            style={{ color: activeFoil.accentHex }}
          >
            {tagline}
          </p>
        </div>

        {/* Bride Name & Royal Lineage */}
        <div className="w-full space-y-0.5">
          <h3
            className="font-serif text-sm sm:text-base md:text-lg font-black tracking-wider uppercase"
            style={{
              background: foilGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(${foilTextShadow})`,
            }}
          >
            {personA}
          </h3>
          {parentsA && (
            <p
              className="text-[8px] sm:text-[9.5px] italic tracking-wide opacity-90 max-w-[340px] mx-auto leading-tight"
              style={{ color: activeFoil.accentHex }}
            >
              {parentsA}
            </p>
          )}
        </div>

        {/* Royal Ampersand Symbol */}
        <div className="flex items-center justify-center -my-0.5">
          <span
            className="font-serif text-sm sm:text-base font-bold"
            style={{
              background: foilGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            &amp;
          </span>
        </div>

        {/* Groom Name & Royal Lineage */}
        <div className="w-full space-y-0.5">
          <h3
            className="font-serif text-sm sm:text-base md:text-lg font-black tracking-wider uppercase"
            style={{
              background: foilGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(${foilTextShadow})`,
            }}
          >
            {personB}
          </h3>
          {parentsB && (
            <p
              className="text-[8px] sm:text-[9.5px] italic tracking-wide opacity-90 max-w-[340px] mx-auto leading-tight"
              style={{ color: activeFoil.accentHex }}
            >
              {parentsB}
            </p>
          )}
        </div>

        {/* Auspicious Muhurat Date & Palace Venue */}
        <div className="w-full space-y-0.5 pt-0.5">
          <p
            className="text-[9px] sm:text-[10.5px] font-bold tracking-[0.16em] uppercase"
            style={{
              background: foilGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {date}
          </p>
          <p
            className="text-[9.5px] sm:text-[11px] font-bold tracking-wider uppercase"
            style={{ color: activeFoil.accentHex }}
          >
            {venue}
          </p>
        </div>

        {/* Royal Filigree Divider */}
        <div className="flex items-center justify-center gap-2 w-full opacity-75 my-0.5">
          <div className="h-px w-14" style={{ background: activeFoil.borderHex }} />
          <span className="text-[10px]" style={{ color: activeFoil.borderHex }}>✦</span>
          <div className="h-px w-14" style={{ background: activeFoil.borderHex }} />
        </div>

        {/* Royal Compliments & Host */}
        <div className="w-full pb-0.5">
          <p
            className="text-[8px] sm:text-[9.5px] font-bold tracking-[0.18em] uppercase"
            style={{
              background: foilGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {host}
          </p>
        </div>
      </div>
    </div>
  );
}
