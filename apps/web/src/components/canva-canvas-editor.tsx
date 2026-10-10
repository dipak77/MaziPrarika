"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "@/context/language-context";
import { TransliteratedInput } from "@/components/ui/transliterated-input";
import {
  type MasterTemplate,
  MASTER_TEMPLATES,
  type EventCategory,
  EVENT_CATEGORIES,
} from "@/lib/templates-catalog";
import {
  BaroqueOuterBorder,
  DamaskBrocadeBackground,
  GoldFiligreeDivider,
  GoldenGaneshaEmblem,
  MarigoldToranGarland,
  BridalGoldJewelryChandelier,
  BaroqueGildedPhotoFrame,
} from "@/components/baroque-ornaments";
import {
  HangingBrassTempleBells,
  PeacockFeatherMotif,
  RoyalMarathaKatyar,
} from "@/components/event-ornaments";
import { toDevanagariDigits } from "@/lib/format";
import { getPrintArt, type ArtMotif } from "@/lib/print-art";

/* ══════════════════════════════════════════════════════════════════════
   CANVA PRO ELEMENT TYPES & INTERFACES
   ══════════════════════════════════════════════════════════════════════ */
export type CanvasElementType =
  | "text"
  | "photo"
  | "shape"
  | "ornament"
  | "divider"
  | "sticker";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // -180 to 180
  opacity: number;  // 0 to 1
  zIndex: number;
  locked?: boolean;
  visible?: boolean;

  // Text attributes
  text?: string;
  fontFamily?: "serif" | "display" | "script" | "sans" | "cinzel" | "playfair" | "yatra";
  fontSize?: number;
  fontWeight?: "normal" | "bold" | "black";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  color?: string;
  goldFoil?: boolean;
  shadow?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  textShadowPreset?: "none" | "gold-glow" | "deep-black" | "embossed" | "neon-rose";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";

  // Shape attributes
  shapeType?: "rectangle" | "rounded" | "circle" | "arch" | "star" | "shield" | "pill";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Ornament attributes
  ornamentType?: "ganesha" | "mandala" | "toran" | "peacock" | "bells" | "chandelier" | "divider" | "diya" | "swastik" | "katyar" | "kalash" | "mangalsutra" | "shehnai" | "dhol" | "rajmudra" | "lotus" | "pheta" | "trishul" | "paithani";
  ornamentColor?: string;

  // Photo attributes
  photoUrl?: string;
  frameShape?: "oval" | "rect" | "circle" | "heart" | "arch" | "gilded";
  filter?: "none" | "vintage" | "sepia" | "vivid" | "bw" | "glamour";
  borderWidth?: number;
  borderColor?: string;

  // Sticker attributes
  stickerEmoji?: string;
}

export type AspectRatio = "2:3" | "9:16" | "16:9" | "1:1";

export interface CanvasDimensions {
  width: number;
  height: number;
  name: string;
  ratio: AspectRatio;
}

const DIMENSIONS_MAP: Record<AspectRatio, CanvasDimensions> = {
  "2:3": { width: 750, height: 1125, name: "पत्रिका (Portrait 2:3)", ratio: "2:3" },
  "9:16": { width: 720, height: 1280, name: "व्हॉट्सअॅप स्टेटस (Story 9:16)", ratio: "9:16" },
  "16:9": { width: 1200, height: 675, name: "लँडस्केप (Display 16:9)", ratio: "16:9" },
  "1:1": { width: 800, height: 800, name: "सोशल पोस्ट (Square 1:1)", ratio: "1:1" },
};

/* ══════════════════════════════════════════════════════════════════════
   ROYAL MAHARASHTRIAN COLOR PRESETS
   ══════════════════════════════════════════════════════════════════════ */
export interface ColorPalette {
  id: string;
  nameMr: string;
  nameEn: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  pattern: "damask" | "paisley" | "halo" | "stars" | "none";
}

const ROYAL_PALETTES: ColorPalette[] = [
  {
    id: "royal-onyx",
    nameMr: "शाही ब्लॅक व २४K गोल्ड",
    nameEn: "Royal Onyx Black & 24K Gold",
    bgColor: "#090707",
    accentColor: "#d4af37",
    textColor: "#ffe18a",
    pattern: "damask",
  },
  {
    id: "peshwa-maroon",
    nameMr: "श्रीमंत पेशवाई किरमिजी",
    nameEn: "Imperial Peshwa Maroon",
    bgColor: "#32070e",
    accentColor: "#f3cc68",
    textColor: "#fef08a",
    pattern: "damask",
  },
  {
    id: "rajwada-emerald",
    nameMr: "राजवाडा पाचू हिरवा",
    nameEn: "Rajwada Emerald Green",
    bgColor: "#042217",
    accentColor: "#fbbf24",
    textColor: "#fef9c3",
    pattern: "paisley",
  },
  {
    id: "midnight-navy",
    nameMr: "मध्यरात्र निळा व शॅम्पेन",
    nameEn: "Midnight Sapphire & Champagne",
    bgColor: "#070e24",
    accentColor: "#fde047",
    textColor: "#fef08a",
    pattern: "stars",
  },
  {
    id: "maharani-rose",
    nameMr: "महारानी रोझ गोल्ड",
    nameEn: "Maharani Rose Gold",
    bgColor: "#240715",
    accentColor: "#fb7185",
    textColor: "#ffe4e6",
    pattern: "damask",
  },
  {
    id: "pure-ivory",
    nameMr: "शुभ्र हस्तिदंत व पितळ",
    nameEn: "Pure Ivory & Brass",
    bgColor: "#fbf8f2",
    accentColor: "#b45309",
    textColor: "#78350f",
    pattern: "halo",
  },
  {
    id: "sunburst-haldi",
    nameMr: "हळदी उत्सव पिवळा व कुंकू",
    nameEn: "Sunburst Haldi Yellow",
    bgColor: "#261302",
    accentColor: "#f59e0b",
    textColor: "#fef3c7",
    pattern: "halo",
  },
  {
    id: "daroma-violet",
    nameMr: "डारोमा व्हायोलेट व मिडनाइट स्लेट",
    nameEn: "Daroma Electric Violet & Midnight Slate",
    bgColor: "#0e0d26",
    accentColor: "#8247e5",
    textColor: "#f4f5fa",
    pattern: "stars",
  },
  {
    id: "daroma-card-light",
    nameMr: "डारोमा मॉडर्न लक्झरी स्लेट व्हाईट",
    nameEn: "Daroma Modern Luxury Slate White",
    bgColor: "#f4f5fa",
    accentColor: "#8247e5",
    textColor: "#111026",
    pattern: "halo",
  },
];

/* ══════════════════════════════════════════════════════════════════════
   1-CLICK AUSPICIOUS CALLIGRAPHY PRESETS
   ══════════════════════════════════════════════════════════════════════ */
const AUSPICIOUS_PHRASES = [
  { label: "गणेश वंदन", text: "॥ श्री गणेशाय नमः ॥" },
  { label: "शुभ विवाह", text: "॥ शुभ विवाह ॥" },
  { label: "सप्रेम निमंत्रण", text: "॥ सप्रेम निमंत्रण ॥" },
  { label: "शुभमंगल सावधान", text: "॥ शुभमंगल सावधान ॥" },
  { label: "हळदी समारंभ", text: "॥ हळदी समारंभ ॥" },
  { label: "साखरपुडा", text: "॥ साखरपुडा समारंभ ॥" },
  { label: "गृहप्रवेश", text: "॥ गृहप्रवेश व वास्तुशांती ॥" },
  { label: "सत्यनारायण", text: "॥ सत्यनारायण महापूजा ॥" },
  { label: "बारसे/नामकरण", text: "॥ बारसे व नामकरण सोहळा ॥" },
  { label: "वाढदिवस", text: "॥ वाढदिवसाच्या हार्दिक शुभेच्छा ॥" },
  { label: "सौभाग्यवती", text: "॥ अखंड सौभाग्यवती भव ॥" },
  { label: "कुलदेवता", text: "॥ कुलदेवता प्रसन्न ॥" },
  { label: "राजमुद्रा श्लोक", text: "॥ प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥" },
  { label: "शुभारंभ", text: "॥ शुभारंभ ॥" },
  { label: "अमृत महोत्सव", text: "॥ अमृत महोत्सव सोहळा ॥" },
  { label: "संस्कृती", text: "॥ सत्य, शौर्य, संस्कृती ॥" },
];

/* Inline Royal Swastik SVG Motif */
function RoyalSwastikSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 15v70M15 50h70M50 15h35M85 50v35M50 85H15M15 50V15" />
      <circle cx="32" cy="32" r="3" fill={accentColor} stroke="none" />
      <circle cx="68" cy="32" r="3" fill={accentColor} stroke="none" />
      <circle cx="68" cy="68" r="3" fill={accentColor} stroke="none" />
      <circle cx="32" cy="68" r="3" fill={accentColor} stroke="none" />
    </svg>
  );
}

/* Inline Royal Kalash SVG */
function RoyalKalashSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 15 C40 25, 42 35, 50 38 C58 35, 60 25, 50 15 Z" fill={accentColor} fillOpacity="0.25" />
      <path d="M36 30 C42 22, 50 28, 48 36" />
      <path d="M64 30 C58 22, 50 28, 52 36" />
      <path d="M26 34 C35 30, 44 36, 42 40" />
      <path d="M74 34 C65 30, 56 36, 58 40" />
      <path d="M35 40 H65" strokeWidth="4" />
      <path d="M38 45 H62" strokeWidth="3" />
      <path d="M38 45 C25 55, 25 78, 42 85 H58 C75 78, 75 55, 62 45 Z" fill={accentColor} fillOpacity="0.15" />
      <path d="M38 85 H62 V90 H38 Z" fill={accentColor} fillOpacity="0.3" strokeWidth="2" />
      <path d="M50 56 v16 M42 64 h16 M50 56 h6 M58 64 v6 M50 72 h-6 M42 64 v-6" strokeWidth="2.5" />
    </svg>
  );
}

/* Inline Mangalsutra Motif SVG */
function MangalsutraMotifSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="3" aria-hidden="true">
      <path d="M10 35 Q50 65 90 35" strokeDasharray="3 4" strokeWidth="3" stroke="#222" />
      <path d="M10 40 Q50 70 90 40" strokeDasharray="3 4" strokeWidth="2.5" stroke={accentColor} />
      <circle cx="43" cy="62" r="8" fill={accentColor} fillOpacity="0.3" strokeWidth="2.5" />
      <circle cx="57" cy="62" r="8" fill={accentColor} fillOpacity="0.3" strokeWidth="2.5" />
      <circle cx="50" cy="58" r="3.5" fill={accentColor} stroke="none" />
      <circle cx="43" cy="62" r="2.5" fill={accentColor} stroke="none" />
      <circle cx="57" cy="62" r="2.5" fill={accentColor} stroke="none" />
      <path d="M43 70 v5 M57 70 v5" strokeWidth="2" />
      <circle cx="43" cy="76" r="1.5" fill={accentColor} stroke="none" />
      <circle cx="57" cy="76" r="1.5" fill={accentColor} stroke="none" />
    </svg>
  );
}

/* Inline Shehnai & Choughada SVG */
function ShehnaiChoughadaSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 75 L65 30 L72 37 L27 82 Z" fill={accentColor} fillOpacity="0.2" strokeWidth="2" />
      <path d="M16 71 C10 77, 18 89, 29 83 Z" fill={accentColor} fillOpacity="0.4" strokeWidth="2" />
      <circle cx="40" cy="55" r="1.5" fill={accentColor} stroke="none" />
      <circle cx="48" cy="47" r="1.5" fill={accentColor} stroke="none" />
      <circle cx="56" cy="39" r="1.5" fill={accentColor} stroke="none" />
      <ellipse cx="68" cy="68" rx="14" ry="10" fill={accentColor} fillOpacity="0.2" strokeWidth="2.5" />
      <ellipse cx="80" cy="58" rx="12" ry="8" fill={accentColor} fillOpacity="0.2" strokeWidth="2.5" />
      <path d="M50 78 L65 68" strokeWidth="2.5" />
      <path d="M92 42 L80 58" strokeWidth="2.5" />
    </svg>
  );
}

/* Inline Dhol Tasha SVG */
function DholTashaMotifSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="40" cy="50" rx="12" ry="22" fill={accentColor} fillOpacity="0.3" strokeWidth="2.5" />
      <path d="M40 28 C65 32, 65 68, 40 72" fill={accentColor} fillOpacity="0.15" strokeWidth="2.5" />
      <path d="M32 35 L58 45 L32 55 L58 65" strokeWidth="1.5" strokeDasharray="2 2" />
      <ellipse cx="74" cy="48" rx="16" ry="11" fill={accentColor} fillOpacity="0.25" strokeWidth="2.5" />
      <path d="M62 48 L74 65 L86 48" strokeWidth="2" />
      <path d="M22 62 L38 52" strokeWidth="3" />
      <path d="M82 32 L74 46" strokeWidth="3" />
    </svg>
  );
}

/* Inline Royal Maratha Rajmudra SVG */
function RoyalRajmudraMotifSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="3" aria-hidden="true">
      <polygon points="50,6 80,18 94,48 82,78 50,92 18,78 6,48 20,18" fill={accentColor} fillOpacity="0.12" strokeWidth="3" />
      <polygon points="50,12 75,22 88,48 77,74 50,86 23,74 12,48 25,22" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M40 30 A 8 8 0 0 0 54 22 A 10 10 0 1 1 40 30 Z" fill={accentColor} stroke="none" />
      <path d="M30 40 H70 M26 48 H74 M28 56 H72 M32 64 H68 M38 72 H62" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* Inline Sacred Lotus SVG */
function SacredLotusSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 20 C42 42, 42 68, 50 78 C58 68, 58 42, 50 20 Z" fill={accentColor} fillOpacity="0.35" />
      <path d="M50 36 C34 46, 26 62, 34 76 C42 76, 46 64, 50 56" fill={accentColor} fillOpacity="0.2" />
      <path d="M50 36 C66 46, 74 62, 66 76 C58 76, 54 64, 50 56" fill={accentColor} fillOpacity="0.2" />
      <path d="M50 48 C28 54, 16 68, 22 80 C32 82, 42 74, 50 68" fill={accentColor} fillOpacity="0.15" />
      <path d="M50 48 C72 54, 84 68, 78 80 C68 82, 58 74, 50 68" fill={accentColor} fillOpacity="0.15" />
      <path d="M30 82 Q50 90 70 82" strokeWidth="2" />
    </svg>
  );
}

/* Inline Royal Maratha Pheta SVG */
function RoyalPhetaSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 66 C20 48, 32 30, 52 26 C68 24, 82 36, 80 56 C68 62, 40 68, 22 66 Z" fill={accentColor} fillOpacity="0.25" />
      <path d="M24 54 C36 42, 64 40, 78 48" strokeWidth="2" strokeDasharray="3 2" />
      <path d="M26 62 C40 52, 62 50, 76 58" strokeWidth="2" />
      <path d="M52 26 C52 14, 56 8, 62 6 C66 12, 64 22, 54 26" fill={accentColor} fillOpacity="0.5" strokeWidth="2" />
      <circle cx="53" cy="27" r="4" fill={accentColor} stroke="none" />
      <path d="M78 50 C86 52, 88 64, 86 78 L80 84" strokeWidth="2.2" />
    </svg>
  );
}

/* Inline Trishul & Om Motif SVG */
function TrishulOmSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50 14 V86" strokeWidth="3" />
      <path d="M50 14 L42 26 H58 Z" fill={accentColor} stroke="none" />
      <path d="M28 26 C28 46, 50 48, 50 48 C50 48, 72 46, 72 26" strokeWidth="2.8" />
      <path d="M28 26 L22 34 H34 Z" fill={accentColor} stroke="none" />
      <path d="M72 26 L66 34 H78 Z" fill={accentColor} stroke="none" />
      <ellipse cx="50" cy="56" rx="10" ry="6" fill={accentColor} fillOpacity="0.3" strokeWidth="2" />
      <path d="M40 56 L60 56" strokeWidth="2" />
    </svg>
  );
}

/* Inline Paithani Sari Corner SVG */
function PaithaniCornerSvg({ size = 48, accentColor = "#d4af37" }: { size?: number; accentColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 10 H90 V25 H25 V90 H10 Z" fill={accentColor} fillOpacity="0.2" strokeWidth="2.5" />
      <path d="M18 18 H82 M18 18 V82" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="35" cy="35" r="10" fill={accentColor} fillOpacity="0.3" strokeWidth="2" />
      <path d="M35 25 C45 35, 45 45, 35 45 C25 45, 25 35, 35 25 Z" fill={accentColor} stroke="none" />
      <circle cx="60" cy="20" r="3" fill={accentColor} stroke="none" />
      <circle cx="20" cy="60" r="3" fill={accentColor} stroke="none" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   INITIAL CANVAS TEMPLATE ELEMENTS (Rich default Wedding Card)
   ══════════════════════════════════════════════════════════════════════ */
function getInitialElements(): CanvasElement[] {
  return [
    {
      id: "el-ornament-ganesha",
      type: "ornament",
      name: "गोल्डन गणेश",
      x: 335,
      y: 50,
      width: 80,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      ornamentType: "ganesha",
      ornamentColor: "#d4af37",
    },
    {
      id: "el-text-blessing",
      type: "text",
      name: "शुभ आशीर्वाद",
      x: 100,
      y: 140,
      width: 550,
      height: 40,
      rotation: 0,
      opacity: 1,
      zIndex: 11,
      text: "॥ श्री गणेशाय नमः ॥",
      fontFamily: "display",
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      color: "#ffe18a",
      goldFoil: true,
      letterSpacing: 2,
    },
    {
      id: "el-divider-top",
      type: "divider",
      name: "सुवर्ण नक्षी पट्टी",
      x: 180,
      y: 190,
      width: 390,
      height: 24,
      rotation: 0,
      opacity: 0.9,
      zIndex: 12,
      ornamentType: "divider",
      ornamentColor: "#d4af37",
    },
    {
      id: "el-text-title",
      type: "text",
      name: "सोहळा शीर्षक",
      x: 100,
      y: 225,
      width: 550,
      height: 50,
      rotation: 0,
      opacity: 1,
      zIndex: 13,
      text: "॥ शुभ विवाह निमंत्रण ॥",
      fontFamily: "display",
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: "#f5c542",
      goldFoil: true,
    },
    {
      id: "el-text-groom",
      type: "text",
      name: "वराचे नाव",
      x: 50,
      y: 310,
      width: 650,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: 14,
      text: "चि. तेजस प्रभाकर देशमुख",
      fontFamily: "serif",
      fontSize: 36,
      fontWeight: "black",
      textAlign: "center",
      color: "#ffffff",
      shadow: true,
    },
    {
      id: "el-text-with",
      type: "text",
      name: "आणि शब्द",
      x: 320,
      y: 375,
      width: 110,
      height: 35,
      rotation: 0,
      opacity: 0.85,
      zIndex: 15,
      text: "— सस्नेह संग —",
      fontFamily: "display",
      fontSize: 18,
      fontWeight: "normal",
      textAlign: "center",
      color: "#f3cc68",
    },
    {
      id: "el-text-bride",
      type: "text",
      name: "वधूचे नाव",
      x: 50,
      y: 415,
      width: 650,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: 16,
      text: "चि.सौ.कां. अनन्य श्रीनिवास कुलकर्णी",
      fontFamily: "serif",
      fontSize: 34,
      fontWeight: "black",
      textAlign: "center",
      color: "#ffffff",
      shadow: true,
    },
    {
      id: "el-divider-mid",
      type: "divider",
      name: "मध्य सुवर्ण रेखा",
      x: 200,
      y: 490,
      width: 350,
      height: 20,
      rotation: 0,
      opacity: 0.85,
      zIndex: 17,
      ornamentType: "divider",
      ornamentColor: "#d4af37",
    },
    {
      id: "el-text-date",
      type: "text",
      name: "मुहूर्त व तारीख",
      x: 80,
      y: 535,
      width: 590,
      height: 50,
      rotation: 0,
      opacity: 1,
      zIndex: 18,
      text: "मंगळवार, २४ नोव्हेंबर २०२६ • दुपारी १२:३० वा.",
      fontFamily: "display",
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      color: "#fde047",
    },
    {
      id: "el-text-venue",
      type: "text",
      name: "शुभ विवाह स्थळ",
      x: 70,
      y: 600,
      width: 610,
      height: 70,
      rotation: 0,
      opacity: 0.95,
      zIndex: 19,
      text: "स्थळ: शिवनेरी राजमहाल लॉन्स, बाणेर-म्हाळुंगे रोड, पुणे",
      fontFamily: "sans",
      fontSize: 18,
      fontWeight: "normal",
      textAlign: "center",
      color: "#fef9c3",
      lineHeight: 1.5,
    },
    {
      id: "el-photo-couple",
      type: "photo",
      name: "वधू-वर फ्रेम",
      x: 265,
      y: 700,
      width: 220,
      height: 220,
      rotation: -3,
      opacity: 1,
      zIndex: 20,
      photoUrl: "",
      frameShape: "gilded",
      borderWidth: 3,
      borderColor: "#d4af37",
    },
    {
      id: "el-text-inviters",
      type: "text",
      name: "निमंत्रक व परिवार",
      x: 50,
      y: 960,
      width: 650,
      height: 60,
      rotation: 0,
      opacity: 0.9,
      zIndex: 21,
      text: "निमंत्रक: श्री. प्रभाकर देशमुख व समस्त देशमुख-कुलकर्णी परिवार\n॥ आपले सहर्ष स्वागत असो ॥",
      fontFamily: "display",
      fontSize: 16,
      fontWeight: "normal",
      textAlign: "center",
      color: "#fef3c7",
      lineHeight: 1.6,
    },
  ];
}

function resolveCssColor(value: string): string {
  if (!value || !value.startsWith("var(")) return value;
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return computed || value;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = src;
  });
}

function serializeStageSvg(svg: SVGSVGElement, width: number, height: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  if (!clone.getAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  return new XMLSerializer().serializeToString(clone);
}

function svgDataUrl(svgText: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
}

/* ═══════════════════════════════════════════════════════════════
   CANVA PRO CANVAS DESIGN STUDIO
   ═══════════════════════════════════════════════════════════════ */
export function CanvaCanvasEditor({
  initialTemplateId,
  fullViewMode = false,
}: {
  initialTemplateId?: string;
  fullViewMode?: boolean;
}) {
  const { lang, isEn, isHi } = useLanguage();

  // Full View State & Panel Visibility
  const [isFullView, setIsFullView] = useState(fullViewMode);
  const [leftDockOpen, setLeftDockOpen] = useState(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const statusTimerRef = useRef<number | null>(null);
  const announce = (msg: string) => {
    setStatusMsg(msg);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatusMsg(null), 4500);
  };

  // Document Title
  const [docTitle, setDocTitle] = useState("माझी पत्रिका — राजेशाही कॅनव्हास डिझाइन");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("2:3");
  const dimensions = DIMENSIONS_MAP[aspectRatio];

  // Active Tool Dock Tab
  const [activeTab, setActiveTab] = useState<
    "templates" | "blocks" | "text" | "elements" | "photos" | "colors" | "effects" | "layers"
  >("templates");

  // DOM Refs
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Canvas State & History Stack
  const [elements, setElements] = useState<CanvasElement[]>(() => getInitialElements());
  const [history, setHistory] = useState<CanvasElement[][]>([getInitialElements()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selected Element
  const [selectedId, setSelectedId] = useState<string | null>("el-text-groom");
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId) || null,
    [elements, selectedId]
  );

  // Canvas Viewport & Zoom
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showSafeMargins, setShowSafeMargins] = useState(true);
  const [particleShower, setParticleShower] = useState<"gold-dust" | "petals" | "stars" | "none">("gold-dust");

  // Active Palette & Background
  const [activePaletteId, setActivePaletteId] = useState("royal-onyx");
  const activePalette = ROYAL_PALETTES.find((p) => p.id === activePaletteId) || ROYAL_PALETTES[0]!;
  const [customBgColor, setCustomBgColor] = useState(activePalette.bgColor);
  const [customAccentColor, setCustomAccentColor] = useState(activePalette.accentColor);
  const [customTextColor, setCustomTextColor] = useState(activePalette.textColor);
  const [patternOpacity, setPatternOpacity] = useState(0.12);

  // Canvas DOM ref for click-away and drag calculations
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dragging & Resizing Interactions
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; elX: number; elY: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<"nw" | "ne" | "se" | "sw" | null>(null);
  const [resizeStart, setResizeStart] = useState<{ mouseX: number; mouseY: number; elW: number; elH: number } | null>(null);

  // Filter templates by category
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [templateSearch, setTemplateSearch] = useState("");

  const filteredMasterTemplates = useMemo(() => {
    return MASTER_TEMPLATES.filter((t) => {
      const matchCat = selectedCategory === "all" || t.category === selectedCategory;
      const matchSearch =
        !templateSearch.trim() ||
        t.nameMr.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.nameEn.toLowerCase().includes(templateSearch.toLowerCase()) ||
        t.descMr.toLowerCase().includes(templateSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, templateSearch]);

  // Sync Palette changes
  const applyPalette = (palette: ColorPalette) => {
    setActivePaletteId(palette.id);
    setCustomBgColor(palette.bgColor);
    setCustomAccentColor(palette.accentColor);
    setCustomTextColor(palette.textColor);
  };

  // Push State to History
  const pushState = useCallback((newElements: CanvasElement[]) => {
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      updated.push(newElements);
      if (updated.length > 40) updated.shift();
      return updated;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 39));
    setElements(newElements);
  }, [historyIndex]);

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const snapshot = history[nextIndex];
      if (snapshot) setElements(snapshot);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const snapshot = history[nextIndex];
      if (snapshot) setElements(snapshot);
    }
  };

  // Keyboard Shortcuts (Delete, Undo, Redo, Nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          deleteElement(selectedId);
        }
      } else if (e.key.startsWith("Arrow") && selectedId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedId || el.locked) return el;
            let nx = el.x;
            let ny = el.y;
            if (e.key === "ArrowLeft") nx -= step;
            if (e.key === "ArrowRight") nx += step;
            if (e.key === "ArrowUp") ny -= step;
            if (e.key === "ArrowDown") ny += step;
            return { ...el, x: nx, y: ny };
          })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, historyIndex, history]);

  // Update a single element property
  const updateElement = <K extends keyof CanvasElement>(
    id: string,
    key: K,
    value: CanvasElement[K]
  ) => {
    const nextElements = elements.map((el) =>
      el.id === id ? { ...el, [key]: value } : el
    );
    pushState(nextElements);
  };

  // Delete Element
  const deleteElement = (id: string) => {
    const nextElements = elements.filter((el) => el.id !== id);
    pushState(nextElements);
    if (selectedId === id) setSelectedId(null);
  };

  // Duplicate Element
  const duplicateElement = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const dup: CanvasElement = {
      ...el,
      id: `el-${Date.now()}`,
      name: `${el.name} (प्रत)`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: elements.length + 1,
    };
    pushState([...elements, dup]);
    setSelectedId(dup.id);
  };

  // Bring to Front / Send to Back
  const changeZIndex = (id: string, dir: "front" | "back") => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const maxZ = Math.max(...elements.map((e) => e.zIndex), 0);
    const minZ = Math.min(...elements.map((e) => e.zIndex), 0);
    const nextZ = dir === "front" ? maxZ + 1 : Math.max(1, minZ - 1);
    updateElement(id, "zIndex", nextZ);
  };

  // Add New Element
  const addTextElement = (text: string, fontSize = 24, fontWeight: "normal" | "bold" | "black" = "bold") => {
    const newEl: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      name: text.slice(0, 14),
      x: dimensions.width / 2 - 160,
      y: dimensions.height / 2 - 30,
      width: 320,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      text,
      fontFamily: "display",
      fontSize,
      fontWeight,
      textAlign: "center",
      color: customTextColor,
      goldFoil: false,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addShapeElement = (shapeType: CanvasElement["shapeType"]) => {
    const newEl: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      name: `आकार (${shapeType})`,
      x: dimensions.width / 2 - 100,
      y: dimensions.height / 2 - 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 0.85,
      zIndex: elements.length + 1,
      shapeType,
      fill: "transparent",
      stroke: customAccentColor,
      strokeWidth: 2,
      borderRadius: shapeType === "rounded" ? 16 : shapeType === "pill" ? 999 : 0,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addOrnamentElement = (ornamentType: CanvasElement["ornamentType"]) => {
    const newEl: CanvasElement = {
      id: `ornament-${Date.now()}`,
      type: "ornament",
      name: `नक्षी (${ornamentType})`,
      x: dimensions.width / 2 - 60,
      y: dimensions.height / 2 - 60,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      ornamentType,
      ornamentColor: customAccentColor,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const addStickerElement = (stickerEmoji: string) => {
    const newEl: CanvasElement = {
      id: `sticker-${Date.now()}`,
      type: "sticker",
      name: `स्टिकर (${stickerEmoji})`,
      x: dimensions.width / 2 - 32,
      y: dimensions.height / 2 - 32,
      width: 64,
      height: 64,
      rotation: 0,
      opacity: 1,
      zIndex: elements.length + 1,
      stickerEmoji,
    };
    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (selectedElement && selectedElement.type === "photo") {
        updateElement(selectedElement.id, "photoUrl", url);
      } else {
        const newPhoto: CanvasElement = {
          id: `photo-${Date.now()}`,
          type: "photo",
          name: "अपलोड फोटो",
          x: dimensions.width / 2 - 110,
          y: dimensions.height / 2 - 110,
          width: 220,
          height: 220,
          rotation: 0,
          opacity: 1,
          zIndex: elements.length + 1,
          photoUrl: url,
          frameShape: "gilded",
          borderWidth: 3,
          borderColor: customAccentColor,
        };
        pushState([...elements, newPhoto]);
        setSelectedId(newPhoto.id);
      }
    }
  };

  // Load a Master Template directly onto the Canvas
  const loadMasterTemplate = (tmpl: MasterTemplate) => {
    setDocTitle(`${tmpl.nameMr} — कॅनव्हास`);
    // Find matching palette or default
    const matchingPalette = ROYAL_PALETTES.find(
      (p) => tmpl.accentColor?.toLowerCase() === p.accentColor.toLowerCase()
    ) || ROYAL_PALETTES[0]!;
    applyPalette(matchingPalette);
    if (tmpl.bgGradient) setCustomBgColor(tmpl.bgGradient);
    const spec = getPrintArt(tmpl.id);
    const specBg = spec?.variants[0]?.bgGradient;
    if (spec && specBg) setCustomBgColor(specBg);

    const cardStyle = tmpl.cardStyle;
    const tmplIdLower = tmpl.id?.toLowerCase() || "";
    let headerOrnamentType: CanvasElement["ornamentType"];
    let headerOrnamentName: string;
    if (cardStyle === "lagn-panel") {
      const isBaudha = tmplIdLower.includes("baudha");
      const isKrishna = tmplIdLower.includes("krishna") || tmplIdLower.includes("janmashtami");
      const isKatyar = tmplIdLower.includes("katyar") || tmplIdLower.includes("maratha");
      const isKalash = tmplIdLower.includes("satyanarayan") || tmplIdLower.includes("vastushanti") || tmplIdLower.includes("puja");
      const isSakharpuda = tmplIdLower.includes("sakharpuda");
      headerOrnamentType = isBaudha ? "lotus" : isKrishna ? "peacock" : isKatyar ? "katyar" : isKalash ? "kalash" : isSakharpuda ? "mandala" : "ganesha";
      headerOrnamentName = isBaudha ? "सुवर्ण धम्मचक्र / कमळ" : isKrishna ? "मोरपीस व बासरी" : isKatyar ? "छत्रपती शिवमुद्रा व कट्यार" : isKalash ? "मंगल कलश" : isSakharpuda ? "अंगठी व सुवर्ण नक्षी" : "गोल्डन गणेश";
    } else if (cardStyle === "royal-arch") {
      headerOrnamentType = "toran";
      headerOrnamentName = "झेंडू तोरण";
    } else if (cardStyle === "kalash-toran") {
      headerOrnamentType = "kalash";
      headerOrnamentName = "मंगल कलश";
    } else if (cardStyle === "paithani-zari") {
      headerOrnamentType = "mandala";
      headerOrnamentName = "पैठणी नक्षी";
    } else if (cardStyle === "rings-velvet") {
      headerOrnamentType = "divider";
      headerOrnamentName = "सुवर्ण नक्षी";
    } else if (cardStyle === "scroll-katyar") {
      headerOrnamentType = "katyar";
      headerOrnamentName = "छत्रपती शिवमुद्रा व कट्यार";
    } else if (cardStyle === "krishna-divine") {
      headerOrnamentType = "peacock";
      headerOrnamentName = "मोरपीस व बासरी";
    } else if (cardStyle === "cradle-stars" || cardStyle === "dohale-zula") {
      headerOrnamentType = "lotus";
      headerOrnamentName = "सुवर्ण धम्मचक्र / कमळ";
    } else {
      headerOrnamentType = "ganesha";
      headerOrnamentName = "गोल्डन गणेश";
    }
    if (spec && cardStyle !== "lagn-panel") {
      const motifMap: Record<ArtMotif, CanvasElement["ornamentType"]> = {
        ganesha: "ganesha",
        toran: "toran",
        kalash: "kalash",
        mandala: "mandala",
        katyar: "katyar",
        peacock: "peacock",
        lotus: "lotus",
        divider: "divider",
        arch: "toran",
        diya: "kalash",
        paisley: "mandala",
        om: "mandala",
        swastik: "divider",
        crown: "ganesha",
        rings: "divider",
        cradle: "lotus",
        star: "lotus",
        balloon: "lotus",
        cake: "lotus",
      };
      const mapped = motifMap[spec.motif];
      if (mapped) headerOrnamentType = mapped;
    }
    const crestSize = spec?.layout === "center-crest" ? 96 : 80;

    const photoSrc = tmpl.sample?.photoUrl || tmpl.placeholders?.photoUrl || "";
    const isSplitPhoto = cardStyle === "split-photo";
    let showBannerPhoto = Boolean(photoSrc) && !isSplitPhoto;
    let showSidePhoto = Boolean(photoSrc) && isSplitPhoto;
    if (spec && photoSrc) {
      if (spec.photoPlacement === "top" || spec.photoPlacement === "center") {
        showBannerPhoto = true;
        showSidePhoto = false;
      } else if (spec.photoPlacement === "side") {
        showBannerPhoto = false;
        showSidePhoto = true;
      } else if (spec.photoPlacement === "none") {
        showBannerPhoto = false;
        showSidePhoto = false;
      }
    } else if (spec && !photoSrc) {
      showBannerPhoto = false;
      showSidePhoto = false;
    }
    const yShift = showBannerPhoto ? 190 : 0;
    const hasPersonB = Boolean(tmpl.sample?.personB);
    const personA = tmpl.sample?.personA || tmpl.placeholders?.personA || "";
    const personB = tmpl.sample?.personB || "";
    const dateParts = [tmpl.sample?.date || tmpl.placeholders?.date, tmpl.sample?.time || tmpl.placeholders?.time].filter(Boolean);
    const dateText = dateParts.join(" • ");
    const venueName = tmpl.sample?.venue || tmpl.placeholders?.venue || "";
    const cityName = tmpl.sample?.city || tmpl.placeholders?.city || "";
    const venueText = venueName && cityName ? `स्थळ: ${venueName}, ${cityName}` : venueName ? `स्थळ: ${venueName}` : cityName || "";
    const taglineText = tmpl.sample?.tagline || tmpl.placeholders?.tagline || "";
    const venueY = (hasPersonB ? 560 : 460) + yShift;

    const newTemplateElements: CanvasElement[] = [
      {
        id: "tmpl-header-crest",
        type: "ornament",
        name: headerOrnamentName,
        x: dimensions.width / 2 - crestSize / 2,
        y: 40,
        width: crestSize,
        height: crestSize,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        ornamentType: headerOrnamentType,
        ornamentColor: matchingPalette.accentColor,
      },
      {
        id: "tmpl-blessing",
        type: "text",
        name: "शुभ वंदन",
        x: 100,
        y: 130,
        width: dimensions.width - 200,
        height: 38,
        rotation: 0,
        opacity: 1,
        zIndex: 11,
        text: tmpl.defaultBlessing || "॥ श्री गणेशाय नमः ॥",
        fontFamily: "display",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: matchingPalette.textColor,
        goldFoil: true,
      },
      {
        id: "tmpl-title",
        type: "text",
        name: "उत्सव शीर्षक",
        x: 80,
        y: 190,
        width: dimensions.width - 160,
        height: 50,
        rotation: 0,
        opacity: 1,
        zIndex: 12,
        text: tmpl.defaultTitle || "",
        fontFamily: "display",
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        color: matchingPalette.accentColor,
        goldFoil: true,
      },
      ...(showBannerPhoto
        ? [
            {
              id: "tmpl-photo",
              type: "photo" as const,
              name: "फोटो (कमान)",
              x: dimensions.width / 2 - 150,
              y: 250,
              width: 300,
              height: 180,
              rotation: 0,
              opacity: 1,
              zIndex: 13,
              photoUrl: photoSrc,
              frameShape: "arch" as const,
              borderWidth: 3,
              borderColor: matchingPalette.accentColor,
            },
          ]
        : []),
      ...(showSidePhoto
        ? [
            {
              id: "tmpl-photo",
              type: "photo" as const,
              name: "फोटो (बाजू)",
              x: dimensions.width - 210,
              y: 250,
              width: 170,
              height: 300,
              rotation: 0,
              opacity: 1,
              zIndex: 9,
              photoUrl: photoSrc,
              frameShape: "rect" as const,
              borderWidth: 3,
              borderColor: matchingPalette.accentColor,
            },
          ]
        : []),
      {
        id: "tmpl-personA",
        type: "text",
        name: "मुख्य नाव (वर/यजमान)",
        x: 50,
        y: 280 + yShift,
        width: dimensions.width - 100,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 13,
        text: personA,
        fontFamily: "serif",
        fontSize: 34,
        fontWeight: "black",
        textAlign: "center",
        color: "#ffffff",
        shadow: true,
      },
      ...(hasPersonB
        ? [
            {
              id: "tmpl-with",
              type: "text" as const,
              name: "संग शब्द",
              x: dimensions.width / 2 - 50,
              y: 345 + yShift,
              width: 100,
              height: 30,
              rotation: 0,
              opacity: 0.85,
              zIndex: 14,
              text: "— सह —",
              fontFamily: "display" as const,
              fontSize: 16,
              fontWeight: "normal" as const,
              textAlign: "center" as const,
              color: matchingPalette.accentColor,
            },
            {
              id: "tmpl-personB",
              type: "text" as const,
              name: "दुसरे नाव (वधू/साथीदार)",
              x: 50,
              y: 380 + yShift,
              width: dimensions.width - 100,
              height: 60,
              rotation: 0,
              opacity: 1,
              zIndex: 15,
              text: personB,
              fontFamily: "serif" as const,
              fontSize: 32,
              fontWeight: "black" as const,
              textAlign: "center" as const,
              color: "#ffffff",
              shadow: true,
            },
          ]
        : []),
      {
        id: "tmpl-divider",
        type: "divider",
        name: "सुवर्ण विभाजन रेखा",
        x: dimensions.width / 2 - 180,
        y: (hasPersonB ? 460 : 360) + yShift,
        width: 360,
        height: 20,
        rotation: 0,
        opacity: 0.85,
        zIndex: 16,
        ornamentType: "divider",
        ornamentColor: matchingPalette.accentColor,
      },
      {
        id: "tmpl-date",
        type: "text",
        name: "तारीख व वेळ",
        x: 60,
        y: (hasPersonB ? 500 : 400) + yShift,
        width: dimensions.width - 120,
        height: 48,
        rotation: 0,
        opacity: 1,
        zIndex: 17,
        text: dateText,
        fontFamily: "display",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: matchingPalette.accentColor,
      },
      {
        id: "tmpl-venue",
        type: "text",
        name: "सोहळा स्थळ",
        x: 60,
        y: venueY,
        width: dimensions.width - 120,
        height: 60,
        rotation: 0,
        opacity: 0.95,
        zIndex: 18,
        text: venueText,
        fontFamily: "sans",
        fontSize: 17,
        fontWeight: "normal",
        textAlign: "center",
        color: matchingPalette.textColor,
        lineHeight: 1.5,
      },
      ...(taglineText
        ? [
            {
              id: "tmpl-tagline",
              type: "text" as const,
              name: "टॅगलाइन",
              x: 60,
              y: venueY + 70,
              width: dimensions.width - 120,
              height: 44,
              rotation: 0,
              opacity: 0.85,
              zIndex: 20,
              text: taglineText,
              fontFamily: "display" as const,
              fontSize: 14,
              fontWeight: "normal" as const,
              fontStyle: "italic" as const,
              textAlign: "center" as const,
              color: matchingPalette.textColor,
              lineHeight: 1.5,
            },
          ]
        : []),
    ];

    pushState(newTemplateElements);
    setSelectedId(null);
  };

  // Load template on mount if initialTemplateId prop was supplied
  useEffect(() => {
    if (initialTemplateId) {
      const found = MASTER_TEMPLATES.find((t) => t.id === initialTemplateId);
      if (found) {
        loadMasterTemplate(found);
      }
    }
  }, [initialTemplateId]);

  // Blank Canvas Starter
  const handleStartBlank = () => {
    pushState([]);
    setSelectedId(null);
  };

  // Dragging Implementation
  const handleElementMouseDown = (
    e: React.MouseEvent,
    element: CanvasElement
  ) => {
    if (element.locked) {
      setSelectedId(element.id);
      return;
    }
    e.stopPropagation();
    setSelectedId(element.id);
    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: element.x,
      elY: element.y,
    });
  };

  // Resize Handle MouseDown
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    handle: "nw" | "ne" | "se" | "sw"
  ) => {
    if (!selectedElement || selectedElement.locked) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elW: selectedElement.width,
      elH: selectedElement.height,
    });
  };

  // Global Mouse Move & Up for Canvas Drag/Resize
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart && selectedId) {
        const dx = (e.clientX - dragStart.mouseX) / zoom;
        const dy = (e.clientY - dragStart.mouseY) / zoom;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedId) return el;
            return {
              ...el,
              x: Math.round(dragStart.elX + dx),
              y: Math.round(dragStart.elY + dy),
            };
          })
        );
      } else if (isResizing && resizeStart && selectedId && resizeHandle) {
        const dx = (e.clientX - resizeStart.mouseX) / zoom;
        const dy = (e.clientY - resizeStart.mouseY) / zoom;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedId) return el;
            let nw = resizeStart.elW;
            let nh = resizeStart.elH;
            if (resizeHandle === "se") {
              nw = Math.max(30, resizeStart.elW + dx);
              nh = Math.max(20, resizeStart.elH + dy);
            } else if (resizeHandle === "sw") {
              nw = Math.max(30, resizeStart.elW - dx);
              nh = Math.max(20, resizeStart.elH + dy);
            } else if (resizeHandle === "ne") {
              nw = Math.max(30, resizeStart.elW + dx);
              nh = Math.max(20, resizeStart.elH - dy);
            } else if (resizeHandle === "nw") {
              nw = Math.max(30, resizeStart.elW - dx);
              nh = Math.max(20, resizeStart.elH - dy);
            }
            return {
              ...el,
              width: Math.round(nw),
              height: Math.round(nh),
            };
          })
        );
      }
    };

    const onMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setDragStart(null);
        setResizeStart(null);
        setResizeHandle(null);
        // Commit final state to history
        pushState(elements);
      }
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, selectedId, resizeHandle, zoom, elements, pushState]);

  // Escape key listener to exit full view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullView) {
        setIsFullView(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullView]);

  // Ready Component Block Stampers
  const handleAddReadyBlock = (
    blockType:
      | "muhurat"
      | "couple"
      | "inviter"
      | "venue"
      | "rajmudra"
      | "haldi"
      | "satyanarayan"
      | "snehbhojan"
  ) => {
    const timestamp = Date.now();
    let newElements: CanvasElement[] = [];

    if (blockType === "muhurat") {
      newElements = [
        {
          id: `ready-muhurat-bg-${timestamp}`,
          type: "shape",
          name: "मुहूर्त बॅकग्राउंड कार्ड",
          x: 100,
          y: dimensions.height / 2 - 60,
          width: dimensions.width - 200,
          height: 120,
          rotation: 0,
          opacity: 0.95,
          zIndex: 20,
          shapeType: "rounded",
          fill: "#1f0408",
          stroke: customAccentColor,
          strokeWidth: 2,
          borderRadius: 20,
        },
        {
          id: `ready-muhurat-title-${timestamp}`,
          type: "text",
          name: "मुहूर्त शीर्षक",
          x: 110,
          y: dimensions.height / 2 - 50,
          width: dimensions.width - 220,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "॥ शुभ मुहूर्त ॥",
          fontFamily: "display",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          color: customAccentColor,
          goldFoil: true,
        },
        {
          id: `ready-muhurat-date-${timestamp}`,
          type: "text",
          name: "मुहूर्त दिनांक",
          x: 110,
          y: dimensions.height / 2 - 20,
          width: dimensions.width - 220,
          height: 40,
          rotation: 0,
          opacity: 1,
          zIndex: 22,
          text: "रविवार, २५ डिसेंबर २०२७",
          fontFamily: "serif",
          fontSize: 24,
          fontWeight: "black",
          textAlign: "center",
          color: "#ffffff",
        },
        {
          id: `ready-muhurat-time-${timestamp}`,
          type: "text",
          name: "मुहूर्त वेळ",
          x: 110,
          y: dimensions.height / 2 + 18,
          width: dimensions.width - 220,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 23,
          text: "दुपारी १२ वाजून ३५ मिनिटांनी शुभमुहूर्तावर",
          fontFamily: "sans",
          fontSize: 15,
          fontWeight: "normal",
          textAlign: "center",
          color: customTextColor,
        },
      ];
    } else if (blockType === "couple") {
      newElements = [
        {
          id: `ready-couple-groom-${timestamp}`,
          type: "text",
          name: "वर नाव",
          x: 50,
          y: 300,
          width: dimensions.width - 100,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 24,
          text: "चि. चिन्मय",
          fontFamily: "serif",
          fontSize: 36,
          fontWeight: "black",
          textAlign: "center",
          color: "#ffffff",
          shadow: true,
          goldFoil: true,
        },
        {
          id: `ready-couple-connector-${timestamp}`,
          type: "text",
          name: "सह शब्द",
          x: dimensions.width / 2 - 60,
          y: 365,
          width: 120,
          height: 30,
          rotation: 0,
          opacity: 0.9,
          zIndex: 25,
          text: "— सह —",
          fontFamily: "display",
          fontSize: 18,
          fontWeight: "normal",
          textAlign: "center",
          color: customAccentColor,
        },
        {
          id: `ready-couple-bride-${timestamp}`,
          type: "text",
          name: "वधू नाव",
          x: 50,
          y: 400,
          width: dimensions.width - 100,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 26,
          text: "चि.सौ.कां. तन्वी",
          fontFamily: "serif",
          fontSize: 36,
          fontWeight: "black",
          textAlign: "center",
          color: "#ffffff",
          shadow: true,
          goldFoil: true,
        },
      ];
    } else if (blockType === "inviter") {
      newElements = [
        {
          id: `ready-inviter-bg-${timestamp}`,
          type: "shape",
          name: "निमंत्रक बॉक्स",
          x: 80,
          y: dimensions.height - 280,
          width: dimensions.width - 160,
          height: 110,
          rotation: 0,
          opacity: 0.85,
          zIndex: 20,
          shapeType: "rounded",
          fill: "#150205",
          stroke: customAccentColor,
          strokeWidth: 1.5,
          borderRadius: 16,
        },
        {
          id: `ready-inviter-title-${timestamp}`,
          type: "text",
          name: "निमंत्रक शीर्षक",
          x: 90,
          y: dimensions.height - 275,
          width: dimensions.width - 180,
          height: 28,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "॥ निमंत्रक ॥",
          fontFamily: "display",
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "center",
          color: customAccentColor,
          goldFoil: true,
        },
        {
          id: `ready-inviter-names-${timestamp}`,
          type: "text",
          name: "निमंत्रक नावे",
          x: 90,
          y: dimensions.height - 245,
          width: dimensions.width - 180,
          height: 40,
          rotation: 0,
          opacity: 1,
          zIndex: 22,
          text: "समस्त देशमुख व पाटील परिवार",
          fontFamily: "serif",
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          color: "#ffffff",
        },
        {
          id: `ready-inviter-note-${timestamp}`,
          type: "text",
          name: "उपस्थिती विनंती",
          x: 90,
          y: dimensions.height - 205,
          width: dimensions.width - 180,
          height: 25,
          rotation: 0,
          opacity: 0.85,
          zIndex: 23,
          text: "आपल्या सप्रेम उपस्थितीची व आशीर्वादाची नम्र विनंती.",
          fontFamily: "sans",
          fontSize: 13,
          fontWeight: "normal",
          textAlign: "center",
          color: customTextColor,
        },
      ];
    } else if (blockType === "venue") {
      newElements = [
        {
          id: `ready-venue-bg-${timestamp}`,
          type: "shape",
          name: "स्थळ कार्ड",
          x: 80,
          y: dimensions.height - 150,
          width: dimensions.width - 160,
          height: 90,
          rotation: 0,
          opacity: 0.9,
          zIndex: 20,
          shapeType: "rounded",
          fill: "#1f0408",
          stroke: customAccentColor,
          strokeWidth: 1.5,
          borderRadius: 14,
        },
        {
          id: `ready-venue-title-${timestamp}`,
          type: "text",
          name: "स्थळ मजकूर",
          x: 90,
          y: dimensions.height - 145,
          width: dimensions.width - 180,
          height: 30,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "📍 स्थळ: दामिनी लॉन्स, एनडीए रोड, बावधन, पुणे",
          fontFamily: "sans",
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "center",
          color: "#ffffff",
        },
        {
          id: `ready-venue-sub-${timestamp}`,
          type: "text",
          name: "गुगल मॅप टीप",
          x: 90,
          y: dimensions.height - 110,
          width: dimensions.width - 180,
          height: 25,
          rotation: 0,
          opacity: 0.9,
          zIndex: 22,
          text: "📲 Google Maps लोकेशनसाठी येथे स्कॅन करा",
          fontFamily: "sans",
          fontSize: 13,
          fontWeight: "normal",
          textAlign: "center",
          color: customAccentColor,
        },
      ];
    } else if (blockType === "rajmudra") {
      newElements = [
        {
          id: `ready-rajmudra-emblem-${timestamp}`,
          type: "ornament",
          name: "छत्रपती शिवमुद्रा",
          x: dimensions.width / 2 - 40,
          y: 40,
          width: 80,
          height: 80,
          rotation: 0,
          opacity: 1,
          zIndex: 20,
          ornamentType: "rajmudra",
          ornamentColor: customAccentColor,
        },
        {
          id: `ready-rajmudra-shloka-${timestamp}`,
          type: "text",
          name: "राजमुद्रा श्लोक",
          x: 60,
          y: 130,
          width: dimensions.width - 120,
          height: 48,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "॥ प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥",
          fontFamily: "display",
          fontSize: 15,
          fontWeight: "bold",
          textAlign: "center",
          color: customAccentColor,
          goldFoil: true,
        },
      ];
    } else if (blockType === "haldi") {
      newElements = [
        {
          id: `ready-haldi-bg-${timestamp}`,
          type: "shape",
          name: "हळदी बॅज पार्श्वभूमी",
          x: 70,
          y: dimensions.height / 2 - 60,
          width: dimensions.width - 140,
          height: 110,
          rotation: 0,
          opacity: 0.95,
          zIndex: 20,
          shapeType: "rounded",
          fill: "#2e1a02",
          stroke: "#f59e0b",
          strokeWidth: 2,
          borderRadius: 18,
        },
        {
          id: `ready-haldi-title-${timestamp}`,
          type: "text",
          name: "हळदी शीर्षक",
          x: 80,
          y: dimensions.height / 2 - 50,
          width: dimensions.width - 160,
          height: 36,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "🟡 ॥ हळदी समारंभ व संगीत संध्या ॥ 🎶",
          fontFamily: "display",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          color: "#fde047",
          goldFoil: true,
        },
        {
          id: `ready-haldi-sub-${timestamp}`,
          type: "text",
          name: "हळदी वेळ व दिवस",
          x: 80,
          y: dimensions.height / 2 - 12,
          width: dimensions.width - 160,
          height: 44,
          rotation: 0,
          opacity: 0.95,
          zIndex: 22,
          text: "विवाहाच्या आदल्या दिवशी सायंकाळी ५:०० वा.\nसस्नेह हळद लावण्यासाठी सहकुटुंब उपस्थित राहावे.",
          fontFamily: "sans",
          fontSize: 13,
          fontWeight: "normal",
          textAlign: "center",
          color: "#fef3c7",
          lineHeight: 1.4,
        },
      ];
    } else if (blockType === "satyanarayan") {
      newElements = [
        {
          id: `ready-satya-bg-${timestamp}`,
          type: "shape",
          name: "सत्यनारायण चौकट",
          x: 70,
          y: dimensions.height / 2 - 60,
          width: dimensions.width - 140,
          height: 110,
          rotation: 0,
          opacity: 0.95,
          zIndex: 20,
          shapeType: "rounded",
          fill: "#1f070b",
          stroke: "#d4af37",
          strokeWidth: 2,
          borderRadius: 18,
        },
        {
          id: `ready-satya-title-${timestamp}`,
          type: "text",
          name: "सत्यनारायण शीर्षक",
          x: 80,
          y: dimensions.height / 2 - 50,
          width: dimensions.width - 160,
          height: 36,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "🥥 ॥ श्री सत्यनारायण महापूजा व वास्तुशांती ॥ 🪔",
          fontFamily: "display",
          fontSize: 17,
          fontWeight: "bold",
          textAlign: "center",
          color: "var(--color-gold-bright)",
          goldFoil: true,
        },
        {
          id: `ready-satya-sub-${timestamp}`,
          type: "text",
          name: "सत्यनारायण वेळ",
          x: 80,
          y: dimensions.height / 2 - 12,
          width: dimensions.width - 160,
          height: 44,
          rotation: 0,
          opacity: 0.95,
          zIndex: 22,
          text: "सकाळी ९:३० वा. पूजा प्रारंभ • दुपारी १२:०० वा. महाप्रसाद\nतीर्थप्रसादाचा लाभ घ्यावा ही नम्र विनंती.",
          fontFamily: "sans",
          fontSize: 13,
          fontWeight: "normal",
          textAlign: "center",
          color: "#fef3c7",
          lineHeight: 1.4,
        },
      ];
    } else if (blockType === "snehbhojan") {
      newElements = [
        {
          id: `ready-bhojan-bg-${timestamp}`,
          type: "shape",
          name: "स्नेहभोजन चौकट",
          x: 80,
          y: dimensions.height - 180,
          width: dimensions.width - 160,
          height: 75,
          rotation: 0,
          opacity: 0.9,
          zIndex: 20,
          shapeType: "rounded",
          fill: "#170508",
          stroke: customAccentColor,
          strokeWidth: 1.5,
          borderRadius: 14,
        },
        {
          id: `ready-bhojan-title-${timestamp}`,
          type: "text",
          name: "स्नेहभोजन मजकूर",
          x: 90,
          y: dimensions.height - 170,
          width: dimensions.width - 180,
          height: 52,
          rotation: 0,
          opacity: 1,
          zIndex: 21,
          text: "🍛 सस्नेह प्रीतीभोजन: सोहळ्यानंतर दुपारी १:०० वाजता\nआपली उपस्थिती हेच आमचे सौभाग्य!",
          fontFamily: "display",
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",
          color: "#ffffff",
          lineHeight: 1.4,
        },
      ];
    }

    pushState([...elements, ...newElements]);
    setSelectedId(newElements[0]?.id || null);
  };

  const buildExportCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width * 2;
    canvas.height = dimensions.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(2, 2);
    ctx.fillStyle = resolveCssColor(customBgColor);
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const stage = canvasRef.current;
    const bgSvgs = stage
      ? Array.from(stage.children).filter((c): c is SVGSVGElement => c instanceof SVGSVGElement)
      : [];

    for (const svg of bgSvgs) {
      try {
        const rect = svg.getBoundingClientRect();
        const w = rect.width || dimensions.width;
        const h = rect.height || dimensions.height;
        const text = serializeStageSvg(svg, w, h);
        const img = await loadImageElement(svgDataUrl(text));
        ctx.drawImage(img, 0, 0, w, h);
      } catch {
      }
    }

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      if (el.visible === false) continue;
      ctx.save();
      ctx.globalAlpha = el.opacity;
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      if (el.type === "shape") {
        ctx.fillStyle = resolveCssColor(el.fill || "transparent");
        ctx.strokeStyle = resolveCssColor(el.stroke || customAccentColor);
        ctx.lineWidth = el.strokeWidth || 2;
        if (el.shapeType === "circle") {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
          if (el.fill && el.fill !== "transparent") ctx.fill();
          ctx.stroke();
        } else if (el.borderRadius) {
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, el.borderRadius);
          if (el.fill && el.fill !== "transparent") ctx.fill();
          ctx.stroke();
        } else {
          if (el.fill && el.fill !== "transparent") ctx.fillRect(el.x, el.y, el.width, el.height);
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === "text" && el.text) {
        ctx.font = `${el.fontWeight === "black" ? "900" : el.fontWeight === "bold" ? "700" : "400"} ${el.fontSize || 24}px 'Tiro Devanagari Marathi', 'Noto Serif Devanagari', Arial, sans-serif`;
        ctx.fillStyle = resolveCssColor(el.color || customTextColor);
        ctx.textAlign = el.textAlign || "center";
        ctx.textBaseline = "middle";
        if (el.textShadowPreset === "gold-glow") {
          ctx.shadowColor = "rgba(223,177,80,0.9)";
          ctx.shadowBlur = 14;
        } else if (el.shadow || el.textShadowPreset === "deep-black") {
          ctx.shadowColor = "rgba(0,0,0,0.85)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
        }
        const posX = el.textAlign === "left" ? el.x : el.textAlign === "right" ? el.x + el.width : centerX;
        ctx.fillText(el.text, posX, centerY);
      } else if (el.type === "sticker" && el.stickerEmoji) {
        ctx.font = "36px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.stickerEmoji, centerX, centerY);
      } else if (el.type === "ornament" && el.ornamentType === "diya") {
        ctx.font = "48px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🪔", centerX, centerY);
      } else if (el.type === "ornament" || el.type === "divider") {
        const domEl = stage?.querySelector(`[data-el-id="${el.id}"]`);
        const svg = domEl?.querySelector("svg");
        if (svg) {
          try {
            const rect = svg.getBoundingClientRect();
            const w = rect.width || el.width;
            const h = rect.height || el.height;
            const text = serializeStageSvg(svg, w, h);
            const img = await loadImageElement(svgDataUrl(text));
            ctx.drawImage(img, el.x + (el.width - w) / 2, el.y + (el.height - h) / 2, w, h);
          } catch {
          }
        }
      } else if (el.type === "photo" && el.photoUrl) {
        try {
          const img = await loadImageElement(el.photoUrl);
          ctx.save();
          ctx.beginPath();
          if (el.frameShape === "circle" || el.frameShape === "oval") {
            ctx.ellipse(centerX, centerY, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
          } else {
            ctx.roundRect(el.x, el.y, el.width, el.height, 16);
          }
          ctx.clip();
          const ir = img.naturalWidth / img.naturalHeight;
          const er = el.width / el.height;
          let dw = el.width;
          let dh = el.height;
          let dx = el.x;
          let dy = el.y;
          if (ir > er) {
            dw = dh * ir;
            dx = el.x + (el.width - dw) / 2;
          } else {
            dh = dw / ir;
            dy = el.y + (el.height - dh) / 2;
          }
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.restore();
        } catch {
        }
      }
      ctx.restore();
    }

    return canvas;
  }, [dimensions, elements, customBgColor, customAccentColor, customTextColor]);

  // High-Resolution 2x PNG Export
  const handleExportPng = async () => {
    try {
      const canvas = await buildExportCanvas();
      if (!canvas) throw new Error("canvas-unavailable");
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${docTitle.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_")}.png`;
      a.click();
      announce(isEn ? "PNG downloaded!" : "PNG डाउनलोड झाला!");
    } catch {
      announce(
        isEn
          ? "PNG export failed. Try Print / PDF instead."
          : "PNG निर्यात अयशस्य झाला. प्रिंट / PDF वापरा."
      );
    }
  };

  // Copy High-Resolution Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    try {
      const canvas = await buildExportCanvas();
      if (!canvas) throw new Error("canvas-unavailable");
      canvas.toBlob(async (blob) => {
        if (blob && typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            announce(
              isEn
                ? "Image copied to clipboard! Paste (Ctrl+V) anywhere."
                : "इमेज थेट क्लिपबोर्डवर कॉपी झाली! आपण आता कोठेही Paste (Ctrl+V) करू शकता."
            );
          } catch {
            handleExportPng();
          }
        } else {
          handleExportPng();
        }
      });
    } catch {
      announce(
        isEn
          ? "Copy failed. Try PNG download instead."
          : "कॉपी अयशस्य. PNG डाउनलोड वापरा."
      );
    }
  };

  // Vector SVG Export
  const handleExportSvg = async () => {
    const stage = canvasRef.current;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}">`;
    svgContent += `<rect width="100%" height="100%" fill="${resolveCssColor(customBgColor)}" />`;

    const bgSvgs = stage
      ? Array.from(stage.children).filter((c): c is SVGSVGElement => c instanceof SVGSVGElement)
      : [];
    for (const svg of bgSvgs) {
      try {
        const rect = svg.getBoundingClientRect();
        const w = rect.width || dimensions.width;
        const h = rect.height || dimensions.height;
        svgContent += `<g>${serializeStageSvg(svg, w, h)}</g>`;
      } catch {
      }
    }

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      if (el.visible === false) continue;
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      const rotated = `rotate(${el.rotation} ${centerX} ${centerY})`;
      if (el.type === "shape") {
        const fillAttr = el.shapeType === "circle"
          ? `<ellipse cx="${centerX}" cy="${centerY}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${resolveCssColor(el.fill || "transparent")}" stroke="${resolveCssColor(el.stroke || customAccentColor)}" stroke-width="${el.strokeWidth || 2}" />`
          : `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.borderRadius || 0}" fill="${resolveCssColor(el.fill || "transparent")}" stroke="${resolveCssColor(el.stroke || customAccentColor)}" stroke-width="${el.strokeWidth || 2}" />`;
        svgContent += `<g opacity="${el.opacity}" transform="${rotated}">${fillAttr}</g>`;
      } else if (el.type === "text" && el.text) {
        const escaped = el.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const anchor = el.textAlign === "left" ? "start" : el.textAlign === "right" ? "end" : "middle";
        const textX = el.textAlign === "left" ? el.x : el.textAlign === "right" ? el.x + el.width : centerX;
        const textY = centerY + (el.fontSize || 24) * 0.35;
        svgContent += `<text x="${textX}" y="${textY}" text-anchor="${anchor}" font-size="${el.fontSize || 24}" font-weight="${el.fontWeight || "normal"}" fill="${resolveCssColor(el.color || customTextColor)}" opacity="${el.opacity}" font-family="'Tiro Devanagari Marathi', 'Noto Serif Devanagari', Arial, sans-serif" transform="${rotated}">${escaped}</text>`;
      } else if (el.type === "photo" && el.photoUrl) {
        const clipId = `clip-${el.id}`;
        const clipShape = el.frameShape === "circle" || el.frameShape === "oval"
          ? `<ellipse cx="${centerX}" cy="${centerY}" rx="${el.width / 2}" ry="${el.height / 2}" />`
          : `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="16" />`;
        svgContent += `<defs><clipPath id="${clipId}">${clipShape}</clipPath></defs>`;
        svgContent += `<g opacity="${el.opacity}" transform="${rotated}"><image href="${el.photoUrl}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" /></g>`;
      } else if ((el.type === "ornament" && el.ornamentType !== "diya") || el.type === "divider") {
        const domEl = stage?.querySelector(`[data-el-id="${el.id}"]`);
        const svg = domEl?.querySelector("svg");
        if (svg) {
          try {
            const rect = svg.getBoundingClientRect();
            const w = rect.width || el.width;
            const h = rect.height || el.height;
            const dx = el.x + (el.width - w) / 2;
            const dy = el.y + (el.height - h) / 2;
            svgContent += `<g opacity="${el.opacity}" transform="translate(${dx} ${dy}) rotate(${el.rotation} ${w / 2} ${h / 2})">${serializeStageSvg(svg, w, h)}</g>`;
          } catch {
          }
        }
      } else if (el.type === "sticker" && el.stickerEmoji) {
        svgContent += `<g opacity="${el.opacity}" transform="${rotated}"><text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="central" font-size="36">${el.stickerEmoji}</text></g>`;
      } else if (el.type === "ornament" && el.ornamentType === "diya") {
        svgContent += `<g opacity="${el.opacity}" transform="${rotated}"><text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="central" font-size="48">🪔</text></g>`;
      }
    }
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    announce(isEn ? "SVG downloaded!" : "SVG डाउनलोड झाला!");
  };

  // JSON Project Save
  const handleExportJson = () => {
    const data = {
      version: "2.0",
      app: "MaziPratika Canva Pro Studio",
      timestamp: new Date().toISOString(),
      docTitle,
      aspectRatio,
      dimensions,
      activePaletteId,
      customBgColor,
      customAccentColor,
      customTextColor,
      patternOpacity,
      elements,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, "_")}.mazipratika.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Project Restore
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.docTitle) setDocTitle(parsed.docTitle);
        if (parsed.aspectRatio && DIMENSIONS_MAP[parsed.aspectRatio as AspectRatio]) {
          setAspectRatio(parsed.aspectRatio);
        }
        if (parsed.customBgColor) setCustomBgColor(parsed.customBgColor);
        if (parsed.customAccentColor) setCustomAccentColor(parsed.customAccentColor);
        if (parsed.customTextColor) setCustomTextColor(parsed.customTextColor);
        if (Array.isArray(parsed.elements)) {
          pushState(parsed.elements);
          setSelectedId(null);
          announce(isEn ? "Project restored!" : "प्रोजेक्ट पुन्हा लोड झाला!");
        }
      } catch {
        announce(isEn ? "Invalid JSON file." : "अवैध JSON फाइल (Invalid JSON file)");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Copy share URL
  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // WhatsApp Share Generator
  const handleWhatsAppShare = () => {
    const textLines = elements
      .filter((el) => el.type === "text" && el.text)
      .map((el) => el.text?.trim())
      .filter(Boolean);
    const message = encodeURIComponent(
      `🙏 ${docTitle} 🙏\n\n${textLines.join("\n")}\n\n✨ माझी पत्रिका द्वारे तयार केलेली पत्रिका: https://mazipratika-in.web.app/studio`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // Print Export
  const handlePrint = () => {
    window.print();
  };

  return (
    <section
      id="design-form"
      aria-label={isEn ? "Canva Pro Free Design Studio" : "कॅनव्हा प्रो फ्री डिझाइन स्टुडिओ"}
      className={`relative select-none transition-all duration-300 ${
        isFullView
          ? "fixed inset-0 z-[9999] w-screen h-screen flex flex-col bg-maroon-deep overflow-hidden text-white"
          : "my-8 overflow-hidden rounded-3xl border border-white/15 bg-maroon-deep text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      }`}
    >
      {/* Hidden file input for Project JSON restoration */}
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJson}
        className="hidden"
      />

      {/* ═══════════════════════════════════════════════════════════════
          CANVA PRO TOP HEADER WORKSPACE BAR
      ═══════════════════════════════════════════════════════════════ */}
      <header className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-white/10 bg-maroon-900 px-3 py-2.5 sm:px-6">
        {/* Left Side: Document Title & Aspect Ratio Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setLeftDockOpen((v) => !v)}
            title={leftDockOpen ? "डावे पॅनल लपवा (Hide Left Dock)" : "डावे पॅनल दाखवा (Show Left Dock)"}
            className="hidden lg:grid size-8 place-items-center rounded-lg border border-white/15 text-xs text-ivory-300 hover:bg-white/10 transition"
          >
            {leftDockOpen ? "◀" : "▶"}
          </button>

          <div className="grid size-8 sm:size-9 place-items-center rounded-xl bg-gradient-to-br from-gold via-gold-500 to-gold-bright text-ink-950 shadow-md font-black text-sm">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="bg-transparent font-display text-xs sm:text-base font-bold text-white outline-none border-b border-transparent hover:border-gold/40 focus:border-gold transition truncate max-w-[170px] sm:max-w-xs"
              />
              <span className="rounded-full bg-maroon px-2 py-0.5 text-[11px] font-black uppercase text-gold-shimmer shadow-xs">
                PRO CANVAS
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gold-300/80">
              <span>{dimensions.name}</span>
              <span>•</span>
              <span>{dimensions.width} × {dimensions.height} px</span>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="hidden xl:flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
          {(["2:3", "9:16", "16:9", "1:1"] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                aspectRatio === ratio
                  ? "bg-gradient-to-r from-gold via-gold-500 to-gold-bright text-ink-950 shadow-sm"
                  : "text-ivory-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Center / Right Action Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              aria-label="Undo"
              className="grid size-7 sm:size-8 place-items-center rounded-lg text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-sm"
              title="पूर्ववत करा (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Redo"
              className="grid size-7 sm:size-8 place-items-center rounded-lg text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-sm"
              title="पुन्हा करा (Ctrl+Y)"
            >
              ↪
            </button>
          </div>

          {/* Zoom Selector */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
              className="hover:text-white font-bold px-1"
            >
              -
            </button>
            <span className="w-10 text-center font-bold text-gold-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(1))))}
              className="hover:text-white font-bold px-1"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="ml-1 text-[11px] text-ivory-400 hover:text-white"
            >
              Fit
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            title="ग्रिड मार्गदर्शक (Toggle Grid)"
            className={`hidden md:grid size-8 place-items-center rounded-lg border transition ${
              showGrid
                ? "bg-gold text-ink-950 border-gold"
                : "border-white/15 text-ivory-300 hover:bg-white/10"
            }`}
          >
            ▦
          </button>

          {/* Full View Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullView((v) => !v)}
            className={`inline-flex min-h-[34px] sm:min-h-[36px] items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-bold transition ${
              isFullView
                ? "bg-gradient-to-r from-gold via-gold-500 to-gold-bright text-ink-950 border-gold-400 font-extrabold shadow-sm"
                : "border-white/15 text-ivory-200 hover:border-gold-400 hover:bg-white/10"
            }`}
            title={isFullView ? "सामान्य दृश्यावर परत या (Exit Full View - Esc)" : "संपूर्ण स्क्रीन स्पेस उघडा (Full View Workspace)"}
          >
            <span>{isFullView ? "✕" : "⛶"}</span>
            <span className="hidden sm:inline">
              {isFullView ? "सामान्य दृश्य (Exit)" : "पूर्ण दृश्य (Full View)"}
            </span>
          </button>

          {/* Open in New Tab Button */}
          <a
            href={`/studio/editor${initialTemplateId ? `?template=${initialTemplateId}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[34px] sm:min-h-[36px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 sm:px-3 text-xs font-bold text-ivory-200 hover:border-gold-400 hover:text-white hover:bg-white/10 transition"
            title="नवीन टॅबमध्ये स्टुडिओ उघडा (Open in New Tab with 100% Space)"
          >
            <span>⤢</span>
            <span className="hidden md:inline">नवीन टॅब (New Tab)</span>
          </a>

          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex min-h-[34px] sm:min-h-[36px] items-center gap-1 rounded-full bg-[#25D366] px-2.5 sm:px-3 text-xs font-bold text-white shadow-md hover:bg-[#20ba59] transition"
          >
            <span>💬</span>
            <span className="hidden lg:inline">WhatsApp</span>
          </button>

          {/* Pro Export & Download Dropdown / Modal Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportModal((m) => !m)}
              className="inline-flex min-h-[34px] sm:min-h-[36px] items-center gap-1.5 rounded-full bg-gradient-to-r from-gold via-gold-500 to-gold-bright px-3 sm:px-4 text-xs font-black text-ink-950 shadow-lg shadow-maroon-950/40 hover:brightness-110 transition"
            >
              <span>📥</span>
              <span>एक्सपोर्ट / प्रिंट ▾</span>
            </button>

            {/* Export Dropdown Menu */}
            {showExportModal && (
              <div
                onClick={() => setShowExportModal(false)}
                className="fixed inset-0 z-40"
              />
            )}
            {showExportModal && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/15 bg-maroon-900 p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-xs font-bold text-white">
                    प्रो एक्सपोर्ट पर्याय (Export Options)
                  </div>
                  <div className="text-[11px] text-ivory-400">
                    उच्च दर्जाचे आउटपुट पर्याय
                  </div>
                </div>

                <div className="py-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      handleExportPng();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">🖼️</span>
                    <div>
                      <div>PNG इमेज डाउनलोड करा</div>
                      <div className="text-[11px] text-ivory-400 font-normal">२x हाय-रिझोल्यूशन इमेज</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      handleCopyImageToClipboard();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">📋</span>
                    <div>
                      <div>क्लिपबोर्डवर कॉपी करा</div>
                      <div className="text-[11px] text-ivory-400 font-normal">थेट Paste (Ctrl+V) करण्यासाठी</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      handleExportSvg();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">🎨</span>
                    <div>
                      <div>वेक्टर SVG डाउनलोड करा</div>
                      <div className="text-[11px] text-ivory-400 font-normal">प्रिंटर्स व कोरलड्रॉसाठी अचूक</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      handlePrint();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">🖨️</span>
                    <div>
                      <div>३०० DPI प्रिंट / PDF</div>
                      <div className="text-[11px] text-ivory-400 font-normal">प्रेस-रेडी छपाईसाठी</div>
                    </div>
                  </button>

                  <div className="border-t border-white/10 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      handleExportJson();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">💾</span>
                    <div>
                      <div>प्रोजेक्ट फाइल सेव्ह करा (JSON)</div>
                      <div className="text-[11px] text-ivory-400 font-normal">कधीही पुन्हा काम करण्यासाठी</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      jsonInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">📂</span>
                    <div>
                      <div>प्रोजेक्ट फाइल उघडा (Restore JSON)</div>
                      <div className="text-[11px] text-ivory-400 font-normal">सेव्ह केलेले डिझाइन लोड करा</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportModal(false);
                      handleCopyShareLink();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/10 transition"
                  >
                    <span className="text-base">🔗</span>
                    <div>
                      <div>{copiedLink ? "लिंक कॉपी झाली! ✓" : "डिझाइन लिंक कॉपी करा"}</div>
                      <div className="text-[11px] text-ivory-400 font-normal">मित्रांना शेअर करण्यासाठी</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {statusMsg && (
            <span role="status" aria-live="polite" className="hidden md:inline-flex max-w-[220px] items-center truncate rounded-xl border border-gold-500/40 bg-gold-500/15 px-2.5 py-1.5 text-[11px] font-bold text-gold-bright">
              {statusMsg}
            </span>
          )}

          {/* Right Inspector Toggle Button */}
          <button
            type="button"
            onClick={() => setRightInspectorOpen((v) => !v)}
            title={rightInspectorOpen ? "उजवे पॅनल लपवा (Hide Inspector)" : "उजवे पॅनल दाखवा (Show Inspector)"}
            className="hidden lg:grid size-8 place-items-center rounded-lg border border-white/15 text-xs text-ivory-300 hover:bg-white/10 transition"
          >
            {rightInspectorOpen ? "▶" : "◀"}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          CANVA WORKSPACE: DOCK (LEFT) + CANVAS (CENTER) + INSPECTOR (RIGHT)
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className={`grid flex-1 overflow-hidden transition-all duration-300 ${
          isFullView ? "h-[calc(100vh-56px)]" : "min-h-[740px]"
        } ${
          leftDockOpen && rightInspectorOpen
            ? "grid-cols-1 lg:grid-cols-[72px_320px_1fr_310px]"
            : leftDockOpen && !rightInspectorOpen
            ? "grid-cols-1 lg:grid-cols-[72px_320px_1fr]"
            : !leftDockOpen && rightInspectorOpen
            ? "grid-cols-1 lg:grid-cols-[72px_1fr_310px]"
            : "grid-cols-1 lg:grid-cols-[72px_1fr]"
        } bg-maroon-deep`}
      >
        {/* ── 1. CANVA PRIMARY TOOL DOCK (Left Narrow Icons) ── */}
        <aside className="hidden lg:flex flex-col items-center gap-2.5 border-r border-white/10 bg-maroon-900 py-3">
          {[
            { id: "templates" as const, icon: "📁", label: "नमुने" },
            { id: "blocks" as const, icon: "⚡", label: "तयार घटक" },
            { id: "text" as const, icon: "✏️", label: "मजकूर" },
            { id: "elements" as const, icon: "🎨", label: "आकार" },
            { id: "photos" as const, icon: "🖼️", label: "फोटो" },
            { id: "colors" as const, icon: "🌈", label: "रंग" },
            { id: "effects" as const, icon: "🪄", label: "जादू" },
            { id: "layers" as const, icon: "📑", label: "लेयर्स" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (!leftDockOpen) setLeftDockOpen(true);
                }}
                className={`group flex w-14 flex-col items-center gap-0.5 rounded-2xl p-2 transition ${
                  active
                    ? "bg-gradient-to-r from-gold via-gold-500 to-gold-bright text-ink-950 font-bold shadow-md shadow-maroon-950/40"
                    : "text-ivory-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{tab.icon}</span>
                <span className="text-[11px] font-semibold leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ── Mobile Horizontal Tool Tabs (Shown on small screens) ── */}
        <div className="flex lg:hidden overflow-x-auto border-b border-white/10 bg-maroon-900 p-2 gap-1.5 scrollbar-none">
          {[
            { id: "templates" as const, icon: "📁", label: "नमुने" },
            { id: "blocks" as const, icon: "⚡", label: "तयार घटक" },
            { id: "text" as const, icon: "✏️", label: "मजकूर" },
            { id: "elements" as const, icon: "🎨", label: "आकार" },
            { id: "photos" as const, icon: "🖼️", label: "फोटो" },
            { id: "colors" as const, icon: "🌈", label: "रंग" },
            { id: "effects" as const, icon: "🪄", label: "जादू" },
            { id: "layers" as const, icon: "📑", label: "लेयर्स" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-gold via-gold-500 to-gold-bright text-ink-950"
                  : "bg-white/5 text-ivory-300 hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── 2. EXPANDED TOOL PANEL (Left Drawer Content) ── */}
        {leftDockOpen && (
        <div className="border-r border-white/10 bg-maroon-deep/98 p-4 overflow-y-auto max-h-[780px]">
          {/* TAB 1: 50+ MASTER TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-white">
                  ५०+ राजेशाही टेम्पलेट्स
                </h3>
                <button
                  type="button"
                  onClick={handleStartBlank}
                  className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-haldi-soft hover:bg-gold-500 hover:text-maroon-950 transition"
                >
                  + कोरा कॅनव्हास
                </button>
              </div>

              {/* Search Templates */}
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="टेम्पलेट शोधा (उदा. विवाह, साखरपुडा)..."
                className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3 py-2 text-xs text-haldi-soft placeholder-[#fef3c7]/40 outline-none focus:border-gold-500"
              />

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "all" as const, label: "सर्व (All)" },
                  ...EVENT_CATEGORIES.map((c) => ({
                    id: c.id,
                    label: isEn ? c.en : isHi ? c.hi : c.mr,
                  })),
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                      selectedCategory === cat.id
                        ? "bg-gold-500 text-maroon-950"
                        : "bg-white/5 text-haldi-soft/60 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Template Card Previews Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {filteredMasterTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => loadMasterTemplate(tmpl)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-gold-500/25 bg-black/40 p-2 transition hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/15"
                  >
                    <div
                      className="h-28 w-full rounded-lg relative overflow-hidden flex flex-col items-center justify-center p-2 text-center"
                      style={{ background: tmpl.bgGradient }}
                    >
                      {tmpl.sample?.photoUrl ? (
                        <>
                          <img
                            src={tmpl.sample.photoUrl}
                            alt={tmpl.nameMr}
                            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                          <span className="absolute top-1.5 right-1.5 rounded-full bg-gold-500 px-1.5 py-0.5 text-[11px] font-black text-maroon-950 shadow-xs">
                            {tmpl.badge}
                          </span>
                          <p className="absolute bottom-1.5 inset-x-1 font-marathi-display text-[11px] font-bold text-white line-clamp-1 drop-shadow">
                            {tmpl.nameMr}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="text-xl">👑</div>
                          <p className="mt-1 font-marathi-display text-[11px] font-bold text-[#ffe18a] line-clamp-1">
                            {tmpl.nameMr}
                          </p>
                          <span className="mt-1 rounded-full bg-gold-500/20 px-1.5 py-0.5 text-[11px] font-bold text-gold-bright">
                            {tmpl.badge}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] text-haldi-soft/70 truncate text-center">
                      {tmpl.descMr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: READY COMPONENT BLOCKS */}
          {activeTab === "blocks" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-gold-bright">
                  तयार डिझाइन विभाग (Ready Blocks)
                </h3>
                <p className="text-[11px] text-haldi-soft/65 mt-0.5">
                  १-क्लिकमध्ये सुंदर संरेखित विभाग कॅनव्हासवर जोडा
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: "muhurat" as const,
                    icon: "📅",
                    title: "मुहूर्त व तारीख बॅज",
                    desc: "तारीख, वार, वेळ व शुभमुहूर्त चौकट",
                  },
                  {
                    id: "couple" as const,
                    icon: "💍",
                    title: "वर-वधू नाव पट्टी",
                    desc: "चि. वर — सह — चि.सौ.कां. वधू सुवर्ण अक्षरे",
                  },
                  {
                    id: "haldi" as const,
                    icon: "🟡",
                    title: "हळदी समारंभ व संगीत संध्या",
                    desc: "पिवळा-सुवर्ण हळद बॅज व संगीत वेळ",
                  },
                  {
                    id: "satyanarayan" as const,
                    icon: "🥥",
                    title: "सत्यनारायण व वास्तुशांती",
                    desc: "महापूजा, तीर्थप्रसाद व मंगल कलश चौकट",
                  },
                  {
                    id: "snehbhojan" as const,
                    icon: "🍲",
                    title: "सस्नेह प्रीतीभोजन बॅज",
                    desc: "शाही मेजवानी वेळ व आदरातिथ्य",
                  },
                  {
                    id: "inviter" as const,
                    icon: "📜",
                    title: "निमंत्रक व परिवार",
                    desc: "पारंपरिक निमंत्रक व परिवार परिचय",
                  },
                  {
                    id: "venue" as const,
                    icon: "📍",
                    title: "स्थळ व गुगल मॅप बॅज",
                    desc: "कार्यस्थळ पत्ता व लोकेशन स्कॅनर",
                  },
                  {
                    id: "rajmudra" as const,
                    icon: "🚩",
                    title: "छत्रपती शिवमुद्रा बॅनर",
                    desc: "ऐतिहासिक राजमुद्रा श्लोक व सुवर्ण अक्षरे",
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleAddReadyBlock(b.id)}
                    className="w-full flex items-start gap-3 rounded-2xl border border-gold-500/25 bg-black/40 p-3 text-left hover:border-gold-500 hover:bg-gold-500/15 transition group"
                  >
                    <span className="text-2xl rounded-xl bg-white/5 p-2 group-hover:scale-110 transition-transform">
                      {b.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-haldi-soft group-hover:text-gold-bright">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-haldi-soft/60 truncate mt-0.5">
                        {b.desc}
                      </div>
                    </div>
                    <span className="text-xs text-gold-500 font-bold self-center">
                      + जोडा
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT & AUSPICIOUS CALLIGRAPHY */}
          {activeTab === "text" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-gold-bright">
                मजकूर जोडा (Text Elements)
              </h3>

              {/* Quick Text Add Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => addTextElement("नवीन मोठा मथळा", 36, "black")}
                  className="w-full rounded-xl border border-gold-500/30 bg-black/30 p-3 text-left hover:border-gold-500 hover:bg-gold-500/10 transition"
                >
                  <p className="font-serif text-lg font-black text-[#ffe18a]">
                    + मोठा मथळा जोडा (Heading)
                  </p>
                  <p className="text-[11px] text-haldi-soft/50">ठळक व भव्य शीर्षक</p>
                </button>
                <button
                  type="button"
                  onClick={() => addTextElement("उपमथळा किंवा विशेष तारीख", 24, "bold")}
                  className="w-full rounded-xl border border-gold-500/30 bg-black/30 p-2.5 text-left hover:border-gold-500 hover:bg-gold-500/10 transition"
                >
                  <p className="font-display text-sm font-bold text-haldi-soft">
                    + उपमथळा जोडा (Subheading)
                  </p>
                  <p className="text-[11px] text-haldi-soft/50">दिनांक, वेळ व विशेष सूचना</p>
                </button>
                <button
                  type="button"
                  onClick={() => addTextElement("येथे तपशील, पत्ता व निमंत्रकांची नावे लिहा.", 16, "normal")}
                  className="w-full rounded-xl border border-gold-500/30 bg-black/30 p-2 text-left hover:border-gold-500 hover:bg-gold-500/10 transition"
                >
                  <p className="text-xs text-haldi-soft/90 font-medium">
                    + तपशील मजकूर जोडा (Body Text)
                  </p>
                  <p className="text-[11px] text-haldi-soft/50">पत्ता, स्वागत व नातेसंबंध</p>
                </button>
              </div>

              {/* 1-Click Auspicious Calligraphy Presets */}
              <div className="border-t border-gold-500/20 pt-4">
                <h4 className="font-display text-xs font-bold text-gold-bright mb-2.5">
                  १-क्लिक शुभ वचने व मथळे (Devanagari Presets)
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {AUSPICIOUS_PHRASES.map((phrase) => (
                    <button
                      key={phrase.text}
                      type="button"
                      onClick={() => addTextElement(phrase.text, 22, "bold")}
                      className="flex items-center justify-between rounded-xl border border-gold-500/20 bg-white/5 px-3 py-2 text-left text-xs font-serif text-[#ffe18a] hover:border-gold-500 hover:bg-gold-500/15 transition"
                    >
                      <span className="truncate">{phrase.text}</span>
                      <span className="text-[11px] text-gold-500 font-sans font-bold">+</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMENTS & SHAPES */}
          {activeTab === "elements" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-gold-bright">
                घटक व आकार (Elements & Shapes)
              </h3>

              {/* Sacred Symbols & Ornaments */}
              <div>
                <h4 className="text-xs font-bold text-haldi-soft/80 mb-2">
                  पवित्र शुभ चिन्हे व नक्षी (Sacred Motifs)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ganesha" as const, label: "गणेश", icon: "🕉️" },
                    { id: "swastik" as const, label: "स्वस्तिक", icon: "卐" },
                    { id: "kalash" as const, label: "कलश", icon: "🏺" },
                    { id: "mangalsutra" as const, label: "मंगळसूत्र", icon: "📿" },
                    { id: "shehnai" as const, label: "सनई-चौघडा", icon: "🎺" },
                    { id: "dhol" as const, label: "ढोल ताशा", icon: "🥁" },
                    { id: "rajmudra" as const, label: "शिवमुद्रा", icon: "🚩" },
                    { id: "lotus" as const, label: "पवित्र कमळ", icon: "🪷" },
                    { id: "pheta" as const, label: "शाही फेटा", icon: "👳" },
                    { id: "trishul" as const, label: "त्रिशूळ-ॐ", icon: "🔱" },
                    { id: "paithani" as const, label: "पैठणी कोपरा", icon: "⚜️" },
                    { id: "diya" as const, label: "पणती", icon: "🪔" },
                    { id: "bells" as const, label: "घंटा", icon: "🔔" },
                    { id: "peacock" as const, label: "मोरपीस", icon: "🦚" },
                    { id: "toran" as const, label: "तोरण", icon: "🌿" },
                    { id: "katyar" as const, label: "कट्यार", icon: "🗡️" },
                    { id: "chandelier" as const, label: "झुंबर", icon: "✨" },
                    { id: "divider" as const, label: "सुवर्ण पट्टी", icon: "〰️" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addOrnamentElement(item.id)}
                      className="flex flex-col items-center justify-center rounded-xl border border-gold-500/20 bg-black/30 p-2.5 text-center hover:border-gold-500 hover:bg-gold-500/10 transition"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[11px] mt-1 font-semibold text-haldi-soft">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geometrical Shapes */}
              <div className="border-t border-gold-500/20 pt-3">
                <h4 className="text-xs font-bold text-haldi-soft/80 mb-2">
                  आकार व फ्रेम्स (Shapes)
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "rectangle" as const, label: "चौकोन", icon: "▭" },
                    { id: "rounded" as const, label: "गोल चौकोन", icon: "▢" },
                    { id: "circle" as const, label: "वर्तुळ", icon: "○" },
                    { id: "arch" as const, label: "कमान", icon: "∩" },
                    { id: "pill" as const, label: "कॅप्सूल", icon: "⬭" },
                    { id: "star" as const, label: "तारा", icon: "★" },
                    { id: "shield" as const, label: "ढाल", icon: "🛡️" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => addShapeElement(s.id)}
                      className="flex flex-col items-center justify-center rounded-xl border border-gold-500/20 bg-black/30 p-2 hover:border-gold-500 hover:bg-gold-500/10 transition"
                    >
                      <span className="text-xl text-gold-500">{s.icon}</span>
                      <span className="text-[11px] mt-0.5 text-haldi-soft/80">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Celebratory Emojis & Stickers */}
              <div className="border-t border-gold-500/20 pt-3">
                <h4 className="text-xs font-bold text-haldi-soft/80 mb-2">
                  उत्सव स्टिकर्स (Festive Accents)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["🌸", "🪔", "💍", "🥥", "🥁", "🎺", "👑", "✨", "🌿", "🦚", "🥭", "💐"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addStickerElement(emoji)}
                      className="grid size-9 place-items-center rounded-xl border border-gold-500/20 bg-white/5 text-xl hover:scale-110 hover:border-gold-500 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS & FRAMES */}
          {activeTab === "photos" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-gold-bright">
                फोटो व फ्रेम (Photos & Frames)
              </h3>

              {/* File Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-gold-500/40 bg-black/40 p-6 text-center hover:border-gold-500 hover:bg-gold-500/10 transition"
              >
                <div className="text-3xl">📷</div>
                <p className="mt-2 text-xs font-bold text-[#ffe18a]">
                  फोटो अपलोड करा (Upload Photo)
                </p>
                <p className="text-[11px] text-haldi-soft/50 mt-1">
                  वधू-वर किंवा कुटुंबाचा सुंदर फोटो निवडा
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Frame Shapes Selection */}
              <div>
                <h4 className="text-xs font-bold text-haldi-soft/80 mb-2">
                  राजेशाही फ्रेम्स (Royal Frame Styles)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "gilded" as const, label: "बारोक सुवर्ण" },
                    { id: "oval" as const, label: "अंडाकृती" },
                    { id: "arch" as const, label: "राजमहाल कमान" },
                    { id: "circle" as const, label: "सुवर्ण वर्तुळ" },
                    { id: "rect" as const, label: "चौकोनी" },
                    { id: "heart" as const, label: "हृदयाकार" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        if (selectedElement && selectedElement.type === "photo") {
                          updateElement(selectedElement.id, "frameShape", f.id);
                        } else {
                          // Add empty photo frame
                          const newFrame: CanvasElement = {
                            id: `frame-${Date.now()}`,
                            type: "photo",
                            name: `फ्रेम (${f.label})`,
                            x: dimensions.width / 2 - 100,
                            y: dimensions.height / 2 - 100,
                            width: 200,
                            height: 200,
                            rotation: 0,
                            opacity: 1,
                            zIndex: elements.length + 1,
                            photoUrl: "",
                            frameShape: f.id,
                            borderWidth: 3,
                            borderColor: customAccentColor,
                          };
                          pushState([...elements, newFrame]);
                          setSelectedId(newFrame.id);
                        }
                      }}
                      className="rounded-xl border border-gold-500/20 bg-black/30 p-2.5 text-center text-xs font-semibold text-haldi-soft hover:border-gold-500 hover:bg-gold-500/15 transition"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COLORS & THEMES */}
          {activeTab === "colors" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-gold-bright">
                रंग व थीम पॅलेट (Royal Themes)
              </h3>

              {/* Royal Preset Palettes Grid */}
              <div className="grid grid-cols-2 gap-2">
                {ROYAL_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => applyPalette(pal)}
                    className={`rounded-xl border p-2 text-left transition ${
                      activePaletteId === pal.id
                        ? "border-gold-bright bg-white/10 shadow-md ring-1 ring-gold-bright"
                        : "border-gold-500/20 bg-black/30 hover:border-gold-500/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="size-4 rounded-full border border-white/30" style={{ background: pal.bgColor }} />
                      <span className="size-4 rounded-full border border-white/30" style={{ background: pal.accentColor }} />
                      <span className="size-4 rounded-full border border-white/30" style={{ background: pal.textColor }} />
                    </div>
                    <p className="font-marathi-display text-xs font-bold text-haldi-soft line-clamp-1">
                      {pal.nameMr}
                    </p>
                    <p className="text-[11px] text-haldi-soft/50 truncate">{pal.nameEn}</p>
                  </button>
                ))}
              </div>

              {/* Custom Color Pickers */}
              <div className="border-t border-gold-500/20 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-gold-bright">
                  कस्टम रंग (Custom Color Adjustments)
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-haldi-soft">पार्श्वभूमी (Background)</span>
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-haldi-soft">सुवर्ण नक्षी (Gold Accent)</span>
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-haldi-soft">मजकूर रंग (Text Color)</span>
                  <input
                    type="color"
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MAGIC SHADERS & PARTICLES */}
          {activeTab === "effects" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-gold-bright">
                जादू व पार्टिकल इफेक्ट्स (Magic Shaders)
              </h3>

              <div className="space-y-2">
                {[
                  { id: "gold-dust" as const, label: "✨ २४K सुवर्णकण (Gold Dust)" },
                  { id: "petals" as const, label: "🌹 गुलाबाच्या पाकळ्या (Rose Petals)" },
                  { id: "stars" as const, label: "⭐ शुभ चांदण्या (Star Sparkles)" },
                  { id: "none" as const, label: "🚫 बंद करा (None)" },
                ].map((ef) => (
                  <button
                    key={ef.id}
                    type="button"
                    onClick={() => setParticleShower(ef.id)}
                    className={`w-full rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                      particleShower === ef.id
                        ? "border-gold-bright bg-gold-500/20 text-gold-bright"
                        : "border-gold-500/20 bg-black/30 text-haldi-soft/80 hover:bg-white/5"
                    }`}
                  >
                    {ef.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-gold-500/20 pt-3">
                <label className="text-xs text-haldi-soft block mb-1.5">
                  दमास्क नक्षी पारदर्शकता (Pattern Opacity)
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.4"
                  step="0.02"
                  value={patternOpacity}
                  onChange={(e) => setPatternOpacity(parseFloat(e.target.value))}
                  className="w-full accent-gold-500"
                />
              </div>
            </div>
          )}

          {/* TAB 7: LAYERS MANAGER */}
          {activeTab === "layers" && (
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-gold-bright">
                लेयर्स व्यवस्थापक (Layers Stack · {elements.length})
              </h3>
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {[...elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el) => {
                    const selected = el.id === selectedId;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`flex items-center justify-between rounded-xl border p-2 text-xs transition cursor-pointer ${
                          selected
                            ? "border-gold-bright bg-gold-500/20 text-gold-bright"
                            : "border-gold-500/20 bg-black/30 text-haldi-soft/80 hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate max-w-[140px] font-semibold">{el.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateElement(el.id, "locked", !el.locked);
                            }}
                            className="text-xs opacity-70 hover:opacity-100"
                            title={el.locked ? "अनलॉक करा" : "लॉक करा"}
                          >
                            {el.locked ? "🔒" : "🔓"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(el.id);
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                            title="काढून टाका"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        )}

        {/* ── 3. CENTER INTERACTIVE CANVAS WORKSPACE ── */}
        <main
          className="relative flex items-center justify-center p-4 sm:p-8 overflow-auto bg-[#09081a]"
          onClick={() => setSelectedId(null)}
        >
          {/* Zoom Scaled Wrapper */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging || isResizing ? "none" : "transform 0.2s ease-out",
            }}
            className="relative"
          >
            {/* The Actual Canvas Surface */}
            <div
              ref={canvasRef}
              style={{
                width: dimensions.width,
                height: dimensions.height,
                background: customBgColor,
                boxShadow: "0 25px 90px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(212, 175, 55, 0.35)",
              }}
              className="relative overflow-hidden rounded-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Outer Royal Border */}
              <BaroqueOuterBorder borderThickness="normal" accentColor={customAccentColor} />

              {/* Damask Wallpaper Texture */}
              <DamaskBrocadeBackground color={customAccentColor} opacity={patternOpacity} />

              {/* Alignment Grid Overlay (If Toggled) */}
              {showGrid && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-50 opacity-15"
                  style={{
                    backgroundImage: "linear-gradient(to right, var(--color-gold-500) 1px, transparent 1px), linear-gradient(to bottom, var(--color-gold-500) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              )}

              {/* Safe Print Margins Guide (If Toggled) */}
              {showSafeMargins && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-8 z-40 rounded-xl border border-dashed border-gold-500/20"
                />
              )}

              {/* Live Canvas Particle Shaders */}
              {particleShower === "gold-dust" && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-30 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(circle, var(--color-gold-500) 1.5px, transparent 1.5px)",
                    backgroundSize: "28px 28px",
                  }}
                />
              )}

              {/* Render Canvas Elements */}
              {elements.map((el) => {
                if (el.visible === false) return null;
                const isSelected = el.id === selectedId;

                return (
                  <div
                    key={el.id}
                    data-el-id={el.id}
                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                    style={{
                      position: "absolute",
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      transform: `rotate(${el.rotation}deg)`,
                      opacity: el.opacity,
                      zIndex: el.zIndex,
                      cursor: el.locked ? "default" : isDragging && isSelected ? "grabbing" : "grab",
                    }}
                    className={`group ${
                      isSelected
                        ? "ring-2 ring-gold-bright ring-offset-2 ring-offset-transparent"
                        : "hover:ring-1 hover:ring-gold-500/50"
                    }`}
                  >
                    {/* Floating Context Toolbar above selected element */}
                    {isSelected && !el.locked && (
                      <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-maroon-950 px-2 py-1 shadow-xl border border-gold-500/40 z-50 whitespace-nowrap text-xs"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => duplicateElement(el.id)}
                          className="px-1.5 py-0.5 rounded text-gold-bright hover:bg-white/10"
                          title="प्रत बनवा (Duplicate)"
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          onClick={() => changeZIndex(el.id, "front")}
                          className="px-1.5 py-0.5 rounded text-gold-bright hover:bg-white/10"
                          title="सर्वात पुढे आणा"
                        >
                          ⬆
                        </button>
                        <button
                          type="button"
                          onClick={() => changeZIndex(el.id, "back")}
                          className="px-1.5 py-0.5 rounded text-gold-bright hover:bg-white/10"
                          title="सर्वात मागे पाठवा"
                        >
                          ⬇
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElement(el.id, "locked", true)}
                          className="px-1.5 py-0.5 rounded text-gold-bright hover:bg-white/10"
                          title="लॉक करा"
                        >
                          🔒
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteElement(el.id)}
                          className="px-1.5 py-0.5 rounded text-red-400 hover:bg-white/10"
                          title="काढून टाका"
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    {/* Resize Handles (Only when selected) */}
                    {isSelected && !el.locked && (
                      <>
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
                          className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-gold-bright border border-maroon-950 cursor-nwse-resize z-50"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
                          className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-gold-bright border border-maroon-950 cursor-nesw-resize z-50"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "se")}
                          className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full bg-gold-bright border border-maroon-950 cursor-nwse-resize z-50"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
                          className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full bg-gold-bright border border-maroon-950 cursor-nesw-resize z-50"
                        />
                      </>
                    )}

                    {/* ELEMENT TYPE: TEXT */}
                    {el.type === "text" && (
                      <div
                        style={{
                          fontSize: el.fontSize,
                          fontWeight: el.fontWeight === "black" ? 900 : el.fontWeight === "bold" ? 700 : 400,
                          textAlign: el.textAlign,
                          color: el.color || customTextColor,
                          letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : "normal",
                          lineHeight: el.lineHeight || 1.25,
                          textTransform: el.textTransform || "none",
                          textShadow:
                            el.textShadowPreset === "gold-glow"
                              ? "0 0 16px rgba(223, 177, 80, 0.85), 0 0 32px rgba(223, 177, 80, 0.4)"
                              : el.textShadowPreset === "deep-black"
                              ? "0 4px 14px rgba(0, 0, 0, 0.95)"
                              : el.textShadowPreset === "embossed"
                              ? "1px 1px 0 #ffe082, 2px 2px 0 #b38728, 4px 4px 8px rgba(0,0,0,0.9)"
                              : el.textShadowPreset === "neon-rose"
                              ? "0 0 14px rgba(225, 29, 72, 0.8), 0 0 28px rgba(244, 63, 94, 0.5)"
                              : el.shadow
                              ? "0 2px 10px rgba(0,0,0,0.85)"
                              : "none",
                        }}
                        className={`w-full h-full flex items-center justify-center ${
                          el.goldFoil ? "gold-foil" : ""
                        } ${
                          el.fontFamily === "serif"
                            ? "font-serif"
                            : el.fontFamily === "sans"
                            ? "font-sans"
                            : "font-display"
                        }`}
                      >
                        {el.text}
                      </div>
                    )}

                    {/* ELEMENT TYPE: ORNAMENT */}
                    {el.type === "ornament" && (
                      <div className="w-full h-full flex items-center justify-center pointer-events-none">
                        {el.ornamentType === "ganesha" && (
                          <GoldenGaneshaEmblem size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "swastik" && (
                          <RoyalSwastikSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "kalash" && (
                          <RoyalKalashSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "mangalsutra" && (
                          <MangalsutraMotifSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "shehnai" && (
                          <ShehnaiChoughadaSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "dhol" && (
                          <DholTashaMotifSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "rajmudra" && (
                          <RoyalRajmudraMotifSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "lotus" && (
                          <SacredLotusSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "pheta" && (
                          <RoyalPhetaSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "trishul" && (
                          <TrishulOmSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "paithani" && (
                          <PaithaniCornerSvg size={Math.min(el.width, el.height)} accentColor={el.ornamentColor || customAccentColor} />
                        )}
                        {el.ornamentType === "bells" && (
                          <HangingBrassTempleBells className="w-full h-full" />
                        )}
                        {el.ornamentType === "peacock" && (
                          <PeacockFeatherMotif size={Math.min(el.width, el.height)} />
                        )}
                        {el.ornamentType === "toran" && (
                          <MarigoldToranGarland />
                        )}
                        {el.ornamentType === "chandelier" && (
                          <BridalGoldJewelryChandelier />
                        )}
                        {el.ornamentType === "katyar" && (
                          <RoyalMarathaKatyar className="w-full h-full" />
                        )}
                        {el.ornamentType === "divider" && (
                          <GoldFiligreeDivider accentColor={el.ornamentColor || customAccentColor} className="w-full h-full" />
                        )}
                        {el.ornamentType === "diya" && (
                          <span className="text-5xl">🪔</span>
                        )}
                      </div>
                    )}

                    {/* ELEMENT TYPE: DIVIDER */}
                    {el.type === "divider" && (
                      <div className="w-full h-full flex items-center justify-center pointer-events-none">
                        <GoldFiligreeDivider accentColor={el.ornamentColor || customAccentColor} className="w-full h-full" />
                      </div>
                    )}

                    {/* ELEMENT TYPE: SHAPE */}
                    {el.type === "shape" && (
                      <div
                        style={{
                          backgroundColor: el.fill || "transparent",
                          borderColor: el.stroke || customAccentColor,
                          borderWidth: el.strokeWidth || 2,
                          borderStyle: "solid",
                          borderRadius: el.borderRadius || 0,
                        }}
                        className="w-full h-full"
                      />
                    )}

                    {/* ELEMENT TYPE: PHOTO */}
                    {el.type === "photo" && (
                      <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                        {el.photoUrl ? (
                          <img
                            src={el.photoUrl}
                            alt="Uploaded"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            className={`w-full h-full object-cover ${
                              el.frameShape === "oval"
                                ? "rounded-[50%]"
                                : el.frameShape === "circle"
                                ? "rounded-full"
                                : "rounded-2xl"
                            }`}
                          />
                        ) : (
                          <div
                            style={{
                              borderColor: el.borderColor || customAccentColor,
                              borderWidth: el.borderWidth || 3,
                            }}
                            className={`w-full h-full border-dashed flex flex-col items-center justify-center bg-black/30 p-4 text-center ${
                              el.frameShape === "oval"
                                ? "rounded-[50%]"
                                : el.frameShape === "circle"
                                ? "rounded-full"
                                : "rounded-2xl"
                            }`}
                          >
                            <span className="text-3xl">📷</span>
                            <span className="text-[11px] text-gold-bright mt-1 font-bold">
                              येथे फोटो टाका
                            </span>
                          </div>
                        )}
                        {el.frameShape === "gilded" && (
                          <BaroqueGildedPhotoFrame
                            shape="oval"
                            rotation={0}
                            accentColor={customAccentColor}
                          />
                        )}
                      </div>
                    )}

                    {/* ELEMENT TYPE: STICKER */}
                    {el.type === "sticker" && (
                      <div className="w-full h-full flex items-center justify-center text-4xl pointer-events-none">
                        {el.stickerEmoji}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ── 4. RIGHT PROPERTIES & INSPECTOR DOCK ── */}
        {rightInspectorOpen && (
          <aside className="border-l border-white/10 bg-maroon-900 p-4 overflow-y-auto max-h-[780px]">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white">
                  संपादक: {selectedElement.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-ivory-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* TEXT SPECIFIC CONTROLS */}
              {selectedElement.type === "text" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-haldi-soft block mb-1">
                      मजकूर संपादन (Devanagari Phonetic)
                    </label>
                    <TransliteratedInput
                      value={selectedElement.text || ""}
                      onValueChange={(val) => updateElement(selectedElement.id, "text", val)}
                      placeholder="येथे नाव किंवा मजकूर टाईप करा..."
                    />
                  </div>

                  {/* Font Family Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-haldi-soft block mb-1">
                      फॉन्ट शैली (Typography)
                    </label>
                    <select
                      value={selectedElement.fontFamily || "display"}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          "fontFamily",
                          e.target.value as CanvasElement["fontFamily"]
                        )
                      }
                      className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-2.5 py-1.5 text-xs text-haldi-soft outline-none"
                    >
                      <option value="display">राजेशाही डिस्प्ले (Tiro Serif)</option>
                      <option value="serif">पारंपरिक सेरिफ (Noto Serif)</option>
                      <option value="sans">आधुनिक सॅन्स (Noto Sans)</option>
                    </select>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-haldi-soft block mb-1">
                        फॉन्ट आकार: {selectedElement.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedElement.fontSize || 24}
                        onChange={(e) =>
                          updateElement(selectedElement.id, "fontSize", parseInt(e.target.value))
                        }
                        className="w-full accent-gold-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-haldi-soft block mb-1">वजन</label>
                      <select
                        value={selectedElement.fontWeight || "bold"}
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            "fontWeight",
                            e.target.value as CanvasElement["fontWeight"]
                          )
                        }
                        className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-2 py-1 text-xs text-haldi-soft outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="black">Black</option>
                      </select>
                    </div>
                  </div>

                  {/* Text Color & Gold Foil */}
                  <div className="flex items-center justify-between border-t border-gold-500/15 pt-2">
                    <span className="text-xs text-haldi-soft">मजकूर रंग</span>
                    <input
                      type="color"
                      value={selectedElement.color || customTextColor}
                      onChange={(e) => updateElement(selectedElement.id, "color", e.target.value)}
                      className="size-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-gold-500/15 pt-2">
                    <span className="text-xs text-haldi-soft">✨ २४K सुवर्ण फॉइल इफेक्ट</span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedElement.goldFoil)}
                      onChange={(e) => updateElement(selectedElement.id, "goldFoil", e.target.checked)}
                      className="accent-gold-500 size-4"
                    />
                  </div>

                  {/* Text Align */}
                  <div>
                    <label className="text-[11px] text-haldi-soft block mb-1">संरेखन (Align)</label>
                    <div className="flex rounded-xl bg-black/40 p-1 border border-gold-500/20">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateElement(selectedElement.id, "textAlign", align)}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg ${
                            selectedElement.textAlign === align
                              ? "bg-gold-500 text-maroon-950"
                              : "text-haldi-soft/60 hover:text-white"
                          }`}
                        >
                          {align === "left" ? "डावे" : align === "center" ? "मध्य" : "उजवे"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Letter Spacing & Line Height */}
                  <div className="grid grid-cols-2 gap-2 border-t border-gold-500/15 pt-2">
                    <div>
                      <label className="text-[11px] text-haldi-soft block mb-0.5">
                        अंतर: {selectedElement.letterSpacing || 0}px
                      </label>
                      <input
                        type="range"
                        min="-2"
                        max="10"
                        value={selectedElement.letterSpacing || 0}
                        onChange={(e) =>
                          updateElement(selectedElement.id, "letterSpacing", parseInt(e.target.value))
                        }
                        className="w-full accent-gold-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-haldi-soft block mb-0.5">
                        ओळ अंतर: {selectedElement.lineHeight || 1.2}
                      </label>
                      <input
                        type="range"
                        min="0.9"
                        max="2.2"
                        step="0.1"
                        value={selectedElement.lineHeight || 1.2}
                        onChange={(e) =>
                          updateElement(selectedElement.id, "lineHeight", parseFloat(e.target.value))
                        }
                        className="w-full accent-gold-500"
                      />
                    </div>
                  </div>

                  {/* Text Shadow & Glow Presets */}
                  <div className="border-t border-gold-500/15 pt-2">
                    <label className="text-[11px] font-bold text-haldi-soft block mb-1.5">
                      शॅडो व ग्लो इफेक्ट्स (Shadow & Glow)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "none" as const, label: "काही नाही" },
                        { id: "gold-glow" as const, label: "✨ सुवर्ण ग्लो" },
                        { id: "deep-black" as const, label: "🌑 गडद शॅडो" },
                        { id: "embossed" as const, label: "🏛️ 3D सुवर्ण" },
                        { id: "neon-rose" as const, label: "🌹 गुलाबाची छटा" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateElement(selectedElement.id, "textShadowPreset", s.id)}
                          className={`rounded-lg py-1 px-2 text-[11px] font-bold transition border ${
                            selectedElement.textShadowPreset === s.id
                              ? "bg-gold-500 text-maroon-950 border-gold-500"
                              : "bg-black/30 border-gold-500/20 text-haldi-soft/75 hover:bg-white/5"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Transform */}
                  <div className="border-t border-gold-500/15 pt-2">
                    <label className="text-[11px] text-haldi-soft block mb-1">कॅपिटलायझेशन</label>
                    <div className="flex rounded-xl bg-black/40 p-1 border border-gold-500/20 gap-1">
                      {[
                        { id: "none" as const, label: "Aa मूळ" },
                        { id: "uppercase" as const, label: "AA मोठे" },
                        { id: "capitalize" as const, label: "Ab शिर्षक" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => updateElement(selectedElement.id, "textTransform", c.id)}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg ${
                            (selectedElement.textTransform || "none") === c.id
                              ? "bg-gold-500 text-maroon-950"
                              : "text-haldi-soft/60 hover:text-white"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PHOTO SPECIFIC CONTROLS */}
              {selectedElement.type === "photo" && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-bright py-2 text-xs font-black text-maroon-950 shadow-md hover:brightness-110"
                  >
                    फोटो बदला (Replace Photo)
                  </button>
                  <div>
                    <label className="text-[11px] text-haldi-soft block mb-1">फ्रेम आकार</label>
                    <select
                      value={selectedElement.frameShape || "gilded"}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          "frameShape",
                          e.target.value as CanvasElement["frameShape"]
                        )
                      }
                      className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-2 py-1.5 text-xs text-haldi-soft outline-none"
                    >
                      <option value="gilded">बारोक सुवर्ण फ्रेम</option>
                      <option value="oval">अंडाकृती (Oval)</option>
                      <option value="circle">वर्तुळ (Circle)</option>
                      <option value="arch">कमान (Arch)</option>
                      <option value="rect">चौकोनी (Rect)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* COMMON POSITION & ROTATION CONTROLS */}
              <div className="border-t border-gold-500/20 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-haldi-soft">फिरवणे (Rotation: {selectedElement.rotation}°)</span>
                  <button
                    type="button"
                    onClick={() => updateElement(selectedElement.id, "rotation", 0)}
                    className="text-[11px] text-gold-500 hover:underline"
                  >
                    रीसेट
                  </button>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedElement.rotation}
                  onChange={(e) =>
                    updateElement(selectedElement.id, "rotation", parseInt(e.target.value))
                  }
                  className="w-full accent-gold-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-haldi-soft">पारदर्शकता (Opacity: {Math.round(selectedElement.opacity * 100)}%)</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={selectedElement.opacity}
                  onChange={(e) =>
                    updateElement(selectedElement.id, "opacity", parseFloat(e.target.value))
                  }
                  className="w-full accent-gold-500"
                />
              </div>

              {/* LOCK / DUPLICATE / DELETE ACTIONS */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold-500/20">
                <button
                  type="button"
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="rounded-xl border border-gold-500/40 bg-white/5 py-2 text-xs font-bold text-gold-bright hover:bg-white/10"
                >
                  📋 प्रत बनवा
                </button>
                <button
                  type="button"
                  onClick={() => deleteElement(selectedElement.id)}
                  className="rounded-xl border border-red-500/40 bg-red-950/30 py-2 text-xs font-bold text-red-300 hover:bg-red-900/40"
                >
                  🗑️ काढून टाका
                </button>
              </div>
            </div>
          ) : (
            /* CANVAS INSPECTOR (When no element is selected) */
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-white border-b border-white/10 pb-2">
                कॅनव्हास सेटिंग्ज (Canvas Workspace)
              </h3>
              <div>
                <p className="text-xs text-ivory-300">
                  कॅनव्हासवरील कोणत्याही घटकावर (मजकूर, फोटो, नक्षी) क्लिक करा आणि थेट संपादन करा.
                </p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-white">📐 निवडलेले प्रमाण</p>
                <p className="text-xs text-ivory-200">{dimensions.name}</p>
                <p className="text-[11px] text-ivory-400">रिझोल्यूशन: {dimensions.width} × {dimensions.height} px</p>
              </div>

              <div className="rounded-xl bg-white/5 p-3 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-white">🎨 सक्रिय थीम</p>
                <p className="text-xs text-ivory-200">{activePalette.nameMr}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="size-5 rounded-full border" style={{ background: customBgColor }} />
                  <span className="size-5 rounded-full border" style={{ background: customAccentColor }} />
                  <span className="size-5 rounded-full border" style={{ background: customTextColor }} />
                </div>
              </div>

              <div className="border-t border-gold-500/20 pt-3">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#20ba59] transition"
                >
                  <span>💬</span>
                  <span>व्हॉट्सअॅपवर शेअर करा</span>
                </button>
              </div>
            </div>
          )}
        </aside>
        )}
      </div>
    </section>
  );
}
