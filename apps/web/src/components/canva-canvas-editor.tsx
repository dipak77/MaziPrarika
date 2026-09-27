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

  // Shape attributes
  shapeType?: "rectangle" | "rounded" | "circle" | "arch" | "star" | "shield" | "pill";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Ornament attributes
  ornamentType?: "ganesha" | "mandala" | "toran" | "peacock" | "bells" | "chandelier" | "divider" | "diya" | "swastik" | "katyar";
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
    id: "paithani-purple",
    nameMr: "शाही पैठणी जांभळा",
    nameEn: "Royal Paithani Purple",
    bgColor: "#20062a",
    accentColor: "#eab308",
    textColor: "#fae8ff",
    pattern: "paisley",
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

/* ═══════════════════════════════════════════════════════════════
   CANVA PRO CANVAS DESIGN STUDIO
   ═══════════════════════════════════════════════════════════════ */
export function CanvaCanvasEditor({
  initialTemplateId,
}: {
  initialTemplateId?: string;
}) {
  const { lang, isEn, isHi } = useLanguage();

  // Document Title
  const [docTitle, setDocTitle] = useState("माझी पत्रिका — राजेशाही कॅनव्हास डिझाइन");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("2:3");
  const dimensions = DIMENSIONS_MAP[aspectRatio];

  // Active Tool Dock Tab
  const [activeTab, setActiveTab] = useState<
    "templates" | "text" | "elements" | "photos" | "colors" | "effects" | "layers"
  >("templates");

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
      (p) => tmpl.accentColor.toLowerCase() === p.accentColor.toLowerCase()
    ) || ROYAL_PALETTES[0]!;
    applyPalette(matchingPalette);

    const newTemplateElements: CanvasElement[] = [
      {
        id: "tmpl-ganesha",
        type: "ornament",
        name: "गोल्डन गणेश",
        x: dimensions.width / 2 - 40,
        y: 40,
        width: 80,
        height: 80,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        ornamentType: "ganesha",
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
        text: tmpl.defaultBlessing,
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
        text: tmpl.defaultTitle,
        fontFamily: "display",
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        color: matchingPalette.accentColor,
        goldFoil: true,
      },
      {
        id: "tmpl-personA",
        type: "text",
        name: "मुख्य नाव (वर/यजमान)",
        x: 50,
        y: 280,
        width: dimensions.width - 100,
        height: 60,
        rotation: 0,
        opacity: 1,
        zIndex: 13,
        text: tmpl.sample.personA,
        fontFamily: "serif",
        fontSize: 34,
        fontWeight: "black",
        textAlign: "center",
        color: "#ffffff",
        shadow: true,
      },
      ...(tmpl.sample.personB
        ? [
            {
              id: "tmpl-with",
              type: "text" as const,
              name: "संग शब्द",
              x: dimensions.width / 2 - 50,
              y: 345,
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
              y: 380,
              width: dimensions.width - 100,
              height: 60,
              rotation: 0,
              opacity: 1,
              zIndex: 15,
              text: tmpl.sample.personB,
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
        y: tmpl.sample.personB ? 460 : 360,
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
        y: tmpl.sample.personB ? 500 : 400,
        width: dimensions.width - 120,
        height: 48,
        rotation: 0,
        opacity: 1,
        zIndex: 17,
        text: `${tmpl.sample.date} • ${tmpl.sample.time}`,
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
        y: tmpl.sample.personB ? 560 : 460,
        width: dimensions.width - 120,
        height: 60,
        rotation: 0,
        opacity: 0.95,
        zIndex: 18,
        text: `स्थळ: ${tmpl.sample.venue}, ${tmpl.sample.city}`,
        fontFamily: "sans",
        fontSize: 17,
        fontWeight: "normal",
        textAlign: "center",
        color: matchingPalette.textColor,
        lineHeight: 1.5,
      },
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
      className="relative my-8 overflow-hidden rounded-3xl border border-[#dfb150]/40 bg-[#140a0d] text-ivory shadow-[0_24px_80px_rgba(0,0,0,0.65)] select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════
          CANVA PRO TOP HEADER WORKSPACE BAR
      ═══════════════════════════════════════════════════════════════ */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfb150]/30 bg-gradient-to-r from-[#240307] via-[#3d0711] to-[#240307] px-4 py-3 sm:px-6">
        {/* Document Title & Aspect Ratio Pill */}
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#dfb150] to-[#8a6a2b] text-[#240307] shadow-md font-black text-sm">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="bg-transparent font-display text-sm sm:text-base font-bold text-[#fef3c7] outline-none border-b border-transparent hover:border-[#dfb150]/40 focus:border-[#dfb150] transition truncate max-w-[240px] sm:max-w-xs"
              />
              <span className="rounded-full bg-[#dfb150]/20 px-2 py-0.5 text-[9px] font-black uppercase text-[#ffd700] border border-[#dfb150]/30">
                PRO CANVAS
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#dfb150]/75">
              <span>{dimensions.name}</span>
              <span>•</span>
              <span>{dimensions.width} × {dimensions.height} px</span>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="hidden md:flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-[#dfb150]/20">
          {(["2:3", "9:16", "16:9", "1:1"] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                aspectRatio === ratio
                  ? "bg-[#dfb150] text-[#240307] shadow-sm"
                  : "text-[#fef3c7]/70 hover:text-[#ffd700] hover:bg-white/5"
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Top Action Cluster (Undo, Redo, Zoom, Share, Print) */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-[#dfb150]/20">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              aria-label="Undo"
              className="grid size-8 place-items-center rounded-lg text-[#fef3c7] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
              title="पूर्ववत करा (Ctrl+Z)"
            >
              ↩
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              aria-label="Redo"
              className="grid size-8 place-items-center rounded-lg text-[#fef3c7] hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
              title="पुन्हा करा (Ctrl+Y)"
            >
              ↪
            </button>
          </div>

          {/* Zoom Selector */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 border border-[#dfb150]/20 text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
              className="hover:text-[#ffd700] font-bold px-1"
            >
              -
            </button>
            <span className="w-12 text-center font-bold text-[#ffd700]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))))}
              className="hover:text-[#ffd700] font-bold px-1"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="ml-1 text-[10px] text-[#fef3c7]/60 hover:text-white"
            >
              Fit
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            title="ग्रिड मार्गदर्शक"
            className={`hidden sm:grid size-8 place-items-center rounded-lg border transition ${
              showGrid
                ? "bg-[#dfb150] text-[#240307] border-[#dfb150]"
                : "border-[#dfb150]/30 text-[#fef3c7]/70 hover:bg-white/10"
            }`}
          >
            ▦
          </button>

          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs font-bold text-white shadow-md hover:bg-[#20ba59] transition"
          >
            <span>💬</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Download & Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-gradient-to-r from-[#dfb150] to-[#ffd700] px-3.5 text-xs font-black text-[#240307] shadow-lg hover:brightness-110 transition"
          >
            <span>📥</span>
            <span>डाउनलोड / प्रिंट</span>
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          CANVA WORKSPACE: DOCK (LEFT) + CANVAS (CENTER) + INSPECTOR (RIGHT)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[80px_320px_1fr_290px] xl:grid-cols-[80px_340px_1fr_310px] min-h-[720px] bg-[#1a0c10]">

        {/* ── 1. CANVA PRIMARY TOOL DOCK (Left Narrow Icons) ── */}
        <aside className="hidden lg:flex flex-col items-center gap-3 border-r border-[#dfb150]/20 bg-[#16080b] py-4">
          {[
            { id: "templates" as const, icon: "📁", label: "नमुने" },
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
                onClick={() => setActiveTab(tab.id)}
                className={`group flex w-16 flex-col items-center gap-1 rounded-2xl p-2.5 transition ${
                  active
                    ? "bg-[#dfb150] text-[#240307] font-bold shadow-md shadow-[#dfb150]/20"
                    : "text-[#fef3c7]/70 hover:bg-white/5 hover:text-[#ffd700]"
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                <span className="text-[10px] font-semibold leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ── Mobile Horizontal Tool Tabs (Shown on small screens) ── */}
        <div className="flex lg:hidden overflow-x-auto border-b border-[#dfb150]/20 bg-[#16080b] p-2 gap-2 scrollbar-none">
          {[
            { id: "templates" as const, icon: "📁", label: "नमुने" },
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
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
                activeTab === tab.id
                  ? "bg-[#dfb150] text-[#240307]"
                  : "bg-white/5 text-[#fef3c7]/80 hover:bg-white/10"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── 2. EXPANDED TOOL PANEL (Left Drawer Content) ── */}
        <div className="border-r border-[#dfb150]/20 bg-[#1e0d12]/95 p-4 overflow-y-auto max-h-[780px]">
          {/* TAB 1: 50+ MASTER TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-[#ffd700]">
                  ५०+ राजेशाही टेम्पलेट्स
                </h3>
                <button
                  type="button"
                  onClick={handleStartBlank}
                  className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-[#fef3c7] hover:bg-[#dfb150] hover:text-[#240307] transition"
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
                className="w-full rounded-xl border border-[#dfb150]/30 bg-black/40 px-3 py-2 text-xs text-[#fef3c7] placeholder-[#fef3c7]/40 outline-none focus:border-[#dfb150]"
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
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold transition ${
                      selectedCategory === cat.id
                        ? "bg-[#dfb150] text-[#240307]"
                        : "bg-white/5 text-[#fef3c7]/60 hover:text-white"
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
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#dfb150]/25 bg-black/40 p-2 transition hover:border-[#dfb150] hover:shadow-lg hover:shadow-[#dfb150]/15"
                  >
                    <div
                      className="h-28 w-full rounded-lg relative overflow-hidden flex flex-col items-center justify-center p-2 text-center"
                      style={{ background: tmpl.bgGradient }}
                    >
                      <div className="text-xl">👑</div>
                      <p className="mt-1 font-marathi-display text-[11px] font-bold text-[#ffe18a] line-clamp-1">
                        {tmpl.nameMr}
                      </p>
                      <span className="mt-1 rounded-full bg-[#dfb150]/20 px-1.5 py-0.5 text-[8.5px] font-bold text-[#ffd700]">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-[#fef3c7]/70 truncate text-center">
                      {tmpl.descMr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT & AUSPICIOUS CALLIGRAPHY */}
          {activeTab === "text" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-[#ffd700]">
                मजकूर जोडा (Text Elements)
              </h3>

              {/* Quick Text Add Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => addTextElement("नवीन मोठा मथळा", 36, "black")}
                  className="w-full rounded-xl border border-[#dfb150]/30 bg-black/30 p-3 text-left hover:border-[#dfb150] hover:bg-[#dfb150]/10 transition"
                >
                  <p className="font-serif text-lg font-black text-[#ffe18a]">
                    + मोठा मथळा जोडा (Heading)
                  </p>
                  <p className="text-[11px] text-[#fef3c7]/50">ठळक व भव्य शीर्षक</p>
                </button>
                <button
                  type="button"
                  onClick={() => addTextElement("उपमथळा किंवा विशेष तारीख", 24, "bold")}
                  className="w-full rounded-xl border border-[#dfb150]/30 bg-black/30 p-2.5 text-left hover:border-[#dfb150] hover:bg-[#dfb150]/10 transition"
                >
                  <p className="font-display text-sm font-bold text-[#fef3c7]">
                    + उपमथळा जोडा (Subheading)
                  </p>
                  <p className="text-[11px] text-[#fef3c7]/50">दिनांक, वेळ व विशेष सूचना</p>
                </button>
                <button
                  type="button"
                  onClick={() => addTextElement("येथे तपशील, पत्ता व निमंत्रकांची नावे लिहा.", 16, "normal")}
                  className="w-full rounded-xl border border-[#dfb150]/30 bg-black/30 p-2 text-left hover:border-[#dfb150] hover:bg-[#dfb150]/10 transition"
                >
                  <p className="text-xs text-[#fef3c7]/90 font-medium">
                    + तपशील मजकूर जोडा (Body Text)
                  </p>
                  <p className="text-[10px] text-[#fef3c7]/50">पत्ता, स्वागत व नातेसंबंध</p>
                </button>
              </div>

              {/* 1-Click Auspicious Calligraphy Presets */}
              <div className="border-t border-[#dfb150]/20 pt-4">
                <h4 className="font-display text-xs font-bold text-[#ffd700] mb-2.5">
                  १-क्लिक शुभ वचने व मथळे (Devanagari Presets)
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {AUSPICIOUS_PHRASES.map((phrase) => (
                    <button
                      key={phrase.text}
                      type="button"
                      onClick={() => addTextElement(phrase.text, 22, "bold")}
                      className="flex items-center justify-between rounded-xl border border-[#dfb150]/20 bg-white/5 px-3 py-2 text-left text-xs font-serif text-[#ffe18a] hover:border-[#dfb150] hover:bg-[#dfb150]/15 transition"
                    >
                      <span className="truncate">{phrase.text}</span>
                      <span className="text-[10px] text-[#dfb150] font-sans font-bold">+</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMENTS & SHAPES */}
          {activeTab === "elements" && (
            <div className="space-y-5">
              <h3 className="font-display text-sm font-bold text-[#ffd700]">
                घटक व आकार (Elements & Shapes)
              </h3>

              {/* Sacred Symbols & Ornaments */}
              <div>
                <h4 className="text-xs font-bold text-[#fef3c7]/80 mb-2">
                  पवित्र शुभ चिन्हे व नक्षी (Sacred Motifs)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "ganesha" as const, label: "गणेश", icon: "🕉️" },
                    { id: "swastik" as const, label: "स्वस्तिक", icon: "卐" },
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
                      className="flex flex-col items-center justify-center rounded-xl border border-[#dfb150]/20 bg-black/30 p-2.5 text-center hover:border-[#dfb150] hover:bg-[#dfb150]/10 transition"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-[10.5px] mt-1 font-semibold text-[#fef3c7]">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geometrical Shapes */}
              <div className="border-t border-[#dfb150]/20 pt-3">
                <h4 className="text-xs font-bold text-[#fef3c7]/80 mb-2">
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
                      className="flex flex-col items-center justify-center rounded-xl border border-[#dfb150]/20 bg-black/30 p-2 hover:border-[#dfb150] hover:bg-[#dfb150]/10 transition"
                    >
                      <span className="text-xl text-[#dfb150]">{s.icon}</span>
                      <span className="text-[9.5px] mt-0.5 text-[#fef3c7]/80">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Celebratory Emojis & Stickers */}
              <div className="border-t border-[#dfb150]/20 pt-3">
                <h4 className="text-xs font-bold text-[#fef3c7]/80 mb-2">
                  उत्सव स्टिकर्स (Festive Accents)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["🌸", "🪔", "💍", "🥥", "🥁", "🎺", "👑", "✨", "🌿", "🦚", "🥭", "💐"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addStickerElement(emoji)}
                      className="grid size-9 place-items-center rounded-xl border border-[#dfb150]/20 bg-white/5 text-xl hover:scale-110 hover:border-[#dfb150] transition"
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
              <h3 className="font-display text-sm font-bold text-[#ffd700]">
                फोटो व फ्रेम (Photos & Frames)
              </h3>

              {/* File Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-[#dfb150]/40 bg-black/40 p-6 text-center hover:border-[#dfb150] hover:bg-[#dfb150]/10 transition"
              >
                <div className="text-3xl">📷</div>
                <p className="mt-2 text-xs font-bold text-[#ffe18a]">
                  फोटो अपलोड करा (Upload Photo)
                </p>
                <p className="text-[10px] text-[#fef3c7]/50 mt-1">
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
                <h4 className="text-xs font-bold text-[#fef3c7]/80 mb-2">
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
                      className="rounded-xl border border-[#dfb150]/20 bg-black/30 p-2.5 text-center text-xs font-semibold text-[#fef3c7] hover:border-[#dfb150] hover:bg-[#dfb150]/15 transition"
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
              <h3 className="font-display text-sm font-bold text-[#ffd700]">
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
                        ? "border-[#ffd700] bg-white/10 shadow-md ring-1 ring-[#ffd700]"
                        : "border-[#dfb150]/20 bg-black/30 hover:border-[#dfb150]/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="size-4 rounded-full border border-white/30" style={{ background: pal.bgColor }} />
                      <span className="size-4 rounded-full border border-white/30" style={{ background: pal.accentColor }} />
                      <span className="size-4 rounded-full border border-white/30" style={{ background: pal.textColor }} />
                    </div>
                    <p className="font-marathi-display text-xs font-bold text-[#fef3c7] line-clamp-1">
                      {pal.nameMr}
                    </p>
                    <p className="text-[9.5px] text-[#fef3c7]/50 truncate">{pal.nameEn}</p>
                  </button>
                ))}
              </div>

              {/* Custom Color Pickers */}
              <div className="border-t border-[#dfb150]/20 pt-3 space-y-3">
                <h4 className="text-xs font-bold text-[#ffd700]">
                  कस्टम रंग (Custom Color Adjustments)
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#fef3c7]">पार्श्वभूमी (Background)</span>
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#fef3c7]">सुवर्ण नक्षी (Gold Accent)</span>
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#fef3c7]">मजकूर रंग (Text Color)</span>
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
              <h3 className="font-display text-sm font-bold text-[#ffd700]">
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
                        ? "border-[#ffd700] bg-[#dfb150]/20 text-[#ffd700]"
                        : "border-[#dfb150]/20 bg-black/30 text-[#fef3c7]/80 hover:bg-white/5"
                    }`}
                  >
                    {ef.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#dfb150]/20 pt-3">
                <label className="text-xs text-[#fef3c7] block mb-1.5">
                  दमास्क नक्षी पारदर्शकता (Pattern Opacity)
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.4"
                  step="0.02"
                  value={patternOpacity}
                  onChange={(e) => setPatternOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#dfb150]"
                />
              </div>
            </div>
          )}

          {/* TAB 7: LAYERS MANAGER */}
          {activeTab === "layers" && (
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-[#ffd700]">
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
                            ? "border-[#ffd700] bg-[#dfb150]/20 text-[#ffd700]"
                            : "border-[#dfb150]/20 bg-black/30 text-[#fef3c7]/80 hover:bg-white/5"
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

        {/* ── 3. CENTER INTERACTIVE CANVAS WORKSPACE ── */}
        <main
          className="relative flex items-center justify-center p-4 sm:p-8 overflow-auto bg-[#12070a]"
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
                    backgroundImage: "linear-gradient(to right, #dfb150 1px, transparent 1px), linear-gradient(to bottom, #dfb150 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              )}

              {/* Safe Print Margins Guide (If Toggled) */}
              {showSafeMargins && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-8 z-40 rounded-xl border border-dashed border-[#dfb150]/20"
                />
              )}

              {/* Live Canvas Particle Shaders */}
              {particleShower === "gold-dust" && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-30 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(circle, #dfb150 1.5px, transparent 1.5px)",
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
                        ? "ring-2 ring-[#ffd700] ring-offset-2 ring-offset-transparent"
                        : "hover:ring-1 hover:ring-[#dfb150]/50"
                    }`}
                  >
                    {/* Floating Context Toolbar above selected element */}
                    {isSelected && !el.locked && (
                      <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg bg-[#240307] px-2 py-1 shadow-xl border border-[#dfb150]/40 z-50 whitespace-nowrap text-xs"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => duplicateElement(el.id)}
                          className="px-1.5 py-0.5 rounded text-[#ffd700] hover:bg-white/10"
                          title="प्रत बनवा (Duplicate)"
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          onClick={() => changeZIndex(el.id, "front")}
                          className="px-1.5 py-0.5 rounded text-[#ffd700] hover:bg-white/10"
                          title="सर्वात पुढे आणा"
                        >
                          ⬆
                        </button>
                        <button
                          type="button"
                          onClick={() => changeZIndex(el.id, "back")}
                          className="px-1.5 py-0.5 rounded text-[#ffd700] hover:bg-white/10"
                          title="सर्वात मागे पाठवा"
                        >
                          ⬇
                        </button>
                        <button
                          type="button"
                          onClick={() => updateElement(el.id, "locked", true)}
                          className="px-1.5 py-0.5 rounded text-[#ffd700] hover:bg-white/10"
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
                          className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-[#ffd700] border border-[#240307] cursor-nwse-resize z-50"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
                          className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-[#ffd700] border border-[#240307] cursor-nesw-resize z-50"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "se")}
                          className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full bg-[#ffd700] border border-[#240307] cursor-nwse-resize z-50"
                        />
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
                          className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full bg-[#ffd700] border border-[#240307] cursor-nesw-resize z-50"
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
                          textShadow: el.shadow ? "0 2px 10px rgba(0,0,0,0.85)" : "none",
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
                            <span className="text-[10px] text-[#ffd700] mt-1 font-bold">
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
        <aside className="border-l border-[#dfb150]/20 bg-[#16080b] p-4 overflow-y-auto max-h-[780px]">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#dfb150]/20 pb-2">
                <span className="text-xs font-bold text-[#ffd700]">
                  संपादक: {selectedElement.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-[#fef3c7]/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* TEXT SPECIFIC CONTROLS */}
              {selectedElement.type === "text" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#fef3c7] block mb-1">
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
                    <label className="text-[11px] font-bold text-[#fef3c7] block mb-1">
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
                      className="w-full rounded-xl border border-[#dfb150]/30 bg-black/40 px-2.5 py-1.5 text-xs text-[#fef3c7] outline-none"
                    >
                      <option value="display">राजेशाही डिस्प्ले (Tiro Serif)</option>
                      <option value="serif">पारंपरिक सेरिफ (Noto Serif)</option>
                      <option value="sans">आधुनिक सॅन्स (Noto Sans)</option>
                    </select>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#fef3c7] block mb-1">
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
                        className="w-full accent-[#dfb150]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#fef3c7] block mb-1">वजन</label>
                      <select
                        value={selectedElement.fontWeight || "bold"}
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            "fontWeight",
                            e.target.value as CanvasElement["fontWeight"]
                          )
                        }
                        className="w-full rounded-xl border border-[#dfb150]/30 bg-black/40 px-2 py-1 text-xs text-[#fef3c7] outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="black">Black</option>
                      </select>
                    </div>
                  </div>

                  {/* Text Color & Gold Foil */}
                  <div className="flex items-center justify-between border-t border-[#dfb150]/15 pt-2">
                    <span className="text-xs text-[#fef3c7]">मजकूर रंग</span>
                    <input
                      type="color"
                      value={selectedElement.color || customTextColor}
                      onChange={(e) => updateElement(selectedElement.id, "color", e.target.value)}
                      className="size-7 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-[#dfb150]/15 pt-2">
                    <span className="text-xs text-[#fef3c7]">✨ २४K सुवर्ण फॉइल इफेक्ट</span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedElement.goldFoil)}
                      onChange={(e) => updateElement(selectedElement.id, "goldFoil", e.target.checked)}
                      className="accent-[#dfb150] size-4"
                    />
                  </div>

                  {/* Text Align */}
                  <div>
                    <label className="text-[11px] text-[#fef3c7] block mb-1">संरेखन (Align)</label>
                    <div className="flex rounded-xl bg-black/40 p-1 border border-[#dfb150]/20">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateElement(selectedElement.id, "textAlign", align)}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg ${
                            selectedElement.textAlign === align
                              ? "bg-[#dfb150] text-[#240307]"
                              : "text-[#fef3c7]/60 hover:text-white"
                          }`}
                        >
                          {align === "left" ? "डावे" : align === "center" ? "मध्य" : "उजवे"}
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
                    className="w-full rounded-xl bg-gradient-to-r from-[#dfb150] to-[#ffd700] py-2 text-xs font-black text-[#240307] shadow-md hover:brightness-110"
                  >
                    फोटो बदला (Replace Photo)
                  </button>
                  <div>
                    <label className="text-[11px] text-[#fef3c7] block mb-1">फ्रेम आकार</label>
                    <select
                      value={selectedElement.frameShape || "gilded"}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          "frameShape",
                          e.target.value as CanvasElement["frameShape"]
                        )
                      }
                      className="w-full rounded-xl border border-[#dfb150]/30 bg-black/40 px-2 py-1.5 text-xs text-[#fef3c7] outline-none"
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
              <div className="border-t border-[#dfb150]/20 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#fef3c7]">फिरवणे (Rotation: {selectedElement.rotation}°)</span>
                  <button
                    type="button"
                    onClick={() => updateElement(selectedElement.id, "rotation", 0)}
                    className="text-[10px] text-[#dfb150] hover:underline"
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
                  className="w-full accent-[#dfb150]"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#fef3c7]">पारदर्शकता (Opacity: {Math.round(selectedElement.opacity * 100)}%)</span>
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
                  className="w-full accent-[#dfb150]"
                />
              </div>

              {/* LOCK / DUPLICATE / DELETE ACTIONS */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#dfb150]/20">
                <button
                  type="button"
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="rounded-xl border border-[#dfb150]/40 bg-white/5 py-2 text-xs font-bold text-[#ffd700] hover:bg-white/10"
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
              <h3 className="font-display text-sm font-bold text-[#ffd700] border-b border-[#dfb150]/20 pb-2">
                कॅनव्हास सेटिंग्ज (Canvas Workspace)
              </h3>
              <div>
                <p className="text-xs text-[#fef3c7]/70">
                  कॅनव्हासवरील कोणत्याही घटकावर (मजकूर, फोटो, नक्षी) क्लिक करा आणि थेट संपादन करा.
                </p>
              </div>

              <div className="rounded-xl bg-black/30 p-3 border border-[#dfb150]/20 space-y-2">
                <p className="text-xs font-bold text-[#ffd700]">📐 निवडलेले प्रमाण</p>
                <p className="text-xs text-[#fef3c7]">{dimensions.name}</p>
                <p className="text-[11px] text-[#fef3c7]/60">रिझोल्यूशन: {dimensions.width} × {dimensions.height} px</p>
              </div>

              <div className="rounded-xl bg-black/30 p-3 border border-[#dfb150]/20 space-y-2">
                <p className="text-xs font-bold text-[#ffd700]">🎨 सक्रिय थीम</p>
                <p className="text-xs text-[#fef3c7]">{activePalette.nameMr}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="size-5 rounded-full border" style={{ background: customBgColor }} />
                  <span className="size-5 rounded-full border" style={{ background: customAccentColor }} />
                  <span className="size-5 rounded-full border" style={{ background: customTextColor }} />
                </div>
              </div>

              <div className="border-t border-[#dfb150]/20 pt-3">
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
      </div>
    </section>
  );
}
