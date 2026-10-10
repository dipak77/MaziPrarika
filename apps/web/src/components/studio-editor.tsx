"use client";

import { InvitationCard } from "@/components/invitation-card";
import { Icon } from "@/components/ui";
import { LangToggle } from "@/components/lang-toggle";
import { TransliteratedInput } from "@/components/ui/transliterated-input";
import { saveStudioDesign } from "@/app/studio/actions";
import { useLanguage } from "@/context/language-context";
import {
  BLESSINGS,
  BLESSINGS_EN,
  BLESSINGS_HI,
  DEFAULT_DESIGN,
  EVENT_TYPES,
  TEMPLATES,
  type DesignData,
  type TemplateId,
} from "@/lib/arch-data";
import { BiodataEditor } from "@/components/biodata-editor";
import { MultiEventStudio } from "@/components/multi-event-studio";
import { ProTemplateEditor } from "@/components/pro-template-editor";
import { CanvaCanvasEditor } from "@/components/canva-canvas-editor";
import { toDevanagariDigits } from "@/lib/format";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
  useMemo,
} from "react";

// ─── Premium Animation Types ───────────────────────────────────────────────────
type AnimationType =
  | "none"
  | "fade-in"
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "rotate-in"
  | "bounce-in"
  | "elastic"
  | "flip-x"
  | "flip-y"
  | "blur-in"
  | "typewriter"
  | "shimmer"
  | "glow-pulse"
  | "float"
  | "swing"
  | "heartbeat"
  | "jello"
  | "rubber-band";

type ParticleEffect =
  | "none"
  | "petals"
  | "sparkles"
  | "confetti"
  | "stars"
  | "hearts"
  | "snow"
  | "bubbles"
  | "fireflies"
  | "lanterns"
  | "diyas";

type TransitionStyle =
  | "none"
  | "smooth"
  | "spring"
  | "bounce"
  | "elastic"
  | "gentle";

type BackgroundStyle =
  | "solid"
  | "gradient-linear"
  | "gradient-radial"
  | "gradient-conic"
  | "mesh"
  | "aurora"
  | "animated-gradient";

// ─── Premium Color Palettes ─────────────────────────────────────────────────────
const PREMIUM_PALETTES = [
  {
    id: "royal-maroon",
    name: { en: "Royal Maroon", hi: "शाही मैरून", mr: "शाही मारून" },
    primary: "#800020",
    secondary: "#FFD700",
    accent: "#FFF8DC",
    bg: "#1a0008",
  },
  {
    id: "emerald-gold",
    name: { en: "Emerald Gold", hi: "पन्ना स्वर्ण", mr: "पन्ना सोनेरी" },
    primary: "#046307",
    secondary: "#FFD700",
    accent: "#F0FFF0",
    bg: "#001a02",
  },
  {
    id: "sapphire-silver",
    name: { en: "Sapphire Silver", hi: "नीलम रजत", mr: "नीलम चांदी" },
    primary: "#0F52BA",
    secondary: "#C0C0C0",
    accent: "#F0F8FF",
    bg: "#000a1a",
  },
  {
    id: "rose-gold",
    name: { en: "Rose Gold", hi: "गुलाबी स्वर्ण", mr: "गुलाबी सोनेरी" },
    primary: "#B76E79",
    secondary: "#FFD700",
    accent: "#FFF0F5",
    bg: "#1a0a0d",
  },
  {
    id: "ivory-cream",
    name: { en: "Ivory Cream", hi: "हाथीदांत क्रीम", mr: "हस्तिदंत क्रीम" },
    primary: "#4A3728",
    secondary: "#D4AF37",
    accent: "#FFFFF0",
    bg: "#1a1510",
  },
  {
    id: "purple-majesty",
    name: { en: "Purple Majesty", hi: "बैंगनी राजसी", mr: "जांभळा राजसी" },
    primary: "#4B0082",
    secondary: "#FFD700",
    accent: "#E6E6FA",
    bg: "#0d001a",
  },
  {
    id: "sunset-orange",
    name: { en: "Sunset Orange", hi: "सूर्यास्त नारंगी", mr: "सूर्यास्त नारिंगी" },
    primary: "#FF4500",
    secondary: "#FFD700",
    accent: "#FFF5EE",
    bg: "#1a0800",
  },
  {
    id: "ocean-teal",
    name: { en: "Ocean Teal", hi: "सागरी नीलहरित", mr: "सागरी निळहिरवा" },
    primary: "#008080",
    secondary: "#FFD700",
    accent: "#E0FFFF",
    bg: "#001a1a",
  },
];

// ─── Premium Fonts ──────────────────────────────────────────────────────────────
const PREMIUM_FONTS = [
  {
    id: "display",
    name: { en: "Royal Display", hi: "शाही प्रदर्शन", mr: "शाही प्रदर्शन" },
    family: "var(--font-display)",
    category: "display",
  },
  {
    id: "marathi",
    name: { en: "Marathi Classic", hi: "मराठी क्लासिक", mr: "मराठी क्लासिक" },
    family: "var(--font-marathi-display)",
    category: "regional",
  },
  {
    id: "serif",
    name: { en: "Elegant Serif", hi: "सुंदर सेरिफ", mr: "सुंदर सेरिफ" },
    family: "Georgia, 'Times New Roman', serif",
    category: "serif",
  },
  {
    id: "calligraphy",
    name: { en: "Calligraphy", hi: "सुलेख", mr: "सुलेख" },
    family: "'Segoe Script', 'Brush Script MT', cursive",
    category: "script",
  },
  {
    id: "modern",
    name: { en: "Modern Sans", hi: "आधुनिक सान्स", mr: "आधुनिक सान्स" },
    family: "'Inter', 'Helvetica Neue', sans-serif",
    category: "sans",
  },
  {
    id: "handwritten",
    name: { en: "Handwritten", hi: "हस्तलिखित", mr: "हस्तलिखित" },
    family: "'Caveat', 'Patrick Hand', cursive",
    category: "script",
  },
];

// ─── Animation Duration Presets ─────────────────────────────────────────────────
const DURATION_PRESETS = [
  { value: 200, label: { en: "Quick", hi: "त्वरित", mr: "जलद" } },
  { value: 400, label: { en: "Normal", hi: "सामान्य", mr: "सामान्य" } },
  { value: 600, label: { en: "Smooth", hi: "चिकना", mr: "गुळगुळीत" } },
  { value: 1000, label: { en: "Elegant", hi: "सुरुचिपूर्ण", mr: "अभिजात" } },
  { value: 1500, label: { en: "Dramatic", hi: "नाटकीय", mr: "नाट्यमय" } },
  { value: 2500, label: { en: "Cinematic", hi: "सिनेमाई", mr: "चित्रपटीय" } },
];

// ─── Premium Effects Library ────────────────────────────────────────────────────
const EFFECTS_LIBRARY = [
  {
    id: "golden-glow",
    name: { en: "Golden Glow", hi: "स्वर्णिम आभा", mr: "सोनेरी तेज" },
    icon: "✨",
    css: "box-shadow: 0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)",
  },
  {
    id: "inner-light",
    name: { en: "Inner Light", hi: "आंतरिक प्रकाश", mr: "अंतर्गत प्रकाश" },
    icon: "💡",
    css: "box-shadow: inset 0 0 30px rgba(255,215,0,0.15)",
  },
  {
    id: "frosted-glass",
    name: { en: "Frosted Glass", hi: "तुषारित कांच", mr: "दंवले काच" },
    icon: "🧊",
    css: "backdrop-filter: blur(12px) saturate(180%); background: rgba(255,255,255,0.1)",
  },
  {
    id: "neon-border",
    name: { en: "Neon Border", hi: "नियॉन बॉर्डर", mr: "नियॉन बॉर्डर" },
    icon: "🌈",
    css: "box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 40px #ff00de",
  },
  {
    id: "vintage-paper",
    name: { en: "Vintage Paper", hi: "विंटेज पेपर", mr: "विंटेज पेपर" },
    icon: "📜",
    css: "background-image: url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
  },
  {
    id: "holographic",
    name: { en: "Holographic", hi: "होलोग्राफिक", mr: "होलोग्राफिक" },
    icon: "🔮",
    css: "background: linear-gradient(135deg, rgba(255,0,128,0.1), rgba(0,255,255,0.1), rgba(255,255,0,0.1)); background-size: 200% 200%; animation: holoShift 3s ease infinite",
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────────
function rupeesLabel(paise: number, isEn: boolean): string {
  const rupees = Math.round(paise / 100);
  return `₹${isEn ? rupees : toDevanagariDigits(rupees)}`;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
export type StudioMode =
  | "all-events"
  | "pro-editor"
  | "invitation"
  | "biodata"
  | "video-studio"
  | "effects-lab";

// ─── Premium Studio Editor Component ────────────────────────────────────────────
export function StudioEditor({
  initialMode = "all-events",
  initialTemplateId,
}: {
  initialMode?: StudioMode;
  initialTemplateId?: string;
}) {
  const { lang, setLang, isEn, isHi, isMr } = useLanguage();
  const [studioMode, setStudioMode] = useState<StudioMode>(initialMode);
  const [canvaTemplateId, setCanvaTemplateId] = useState<string | undefined>(initialTemplateId);

  // Synchronize hash: when /studio#design-form is visited or clicked, automatically switch to pro-editor mode
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#design-form") {
        setStudioMode("pro-editor");
        setTimeout(() => {
          const el = document.getElementById("design-form");
          if (el) {
            const reduceMotion =
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          }
        }, 120);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // ── Core Design State ──
  const [design, setDesign] = useState<DesignData>(() => ({
    ...DEFAULT_DESIGN,
    lang,
    blessing:
      lang === "en" ? "॥ Shri Ganeshaya Namah ॥" : "॥ श्री गणेशाय नमः ॥",
  }));

  // ── Premium Features State ──
  const [animationType, setAnimationType] = useState<AnimationType>("fade-up");
  const [particleEffect, setParticleEffect] = useState<ParticleEffect>("none");
  const [transitionStyle, setTransitionStyle] =
    useState<TransitionStyle>("smooth");
  const [backgroundStyle, setBackgroundStyle] =
    useState<BackgroundStyle>("solid");
  const [selectedPalette, setSelectedPalette] = useState("royal-maroon");
  const [selectedFont, setSelectedFont] = useState("display");
  const [animationDuration, setAnimationDuration] = useState(600);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [animationIteration, setAnimationIteration] = useState(1);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [customRotation, setCustomRotation] = useState(0);
  const [customScale, setCustomScale] = useState(100);
  const [customOpacity, setCustomOpacity] = useState(100);
  const [customBlur, setCustomBlur] = useState(0);
  const [textShadow, setTextShadow] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [showEffectsLab, setShowEffectsLab] = useState(false);
  const [showAnimationPreview, setShowAnimationPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "pdf" | "png" | "mp4" | "gif" | "webp"
  >("pdf");
  const [autoPlayAnimation, setAutoPlayAnimation] = useState(true);
  const [historyStack, setHistoryStack] = useState<DesignData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── UI State ──
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview" | "effects">(
    "edit"
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [activePanel, setActivePanel] = useState<
    "template" | "text" | "effects" | "animation" | "color" | "export"
  >("template");
  const formRef = useRef<HTMLFormElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // ── Mounted Check ──
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Sync Mode from URL / Props ──
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#design-form") return;
    if (initialMode) {
      setStudioMode(initialMode);
    }
  }, [initialMode]);

  // ── Language Sync ──
  useEffect(() => {
    if (design.lang !== lang) {
      setDesign((d) => ({
        ...d,
        lang,
        blessing:
          lang === "en"
            ? "॥ Shri Ganeshaya Namah ॥"
            : "॥ श्री गणेशाय नमः ॥",
      }));
    }
  }, [lang, design.lang]);

  // ── History Management (Undo/Redo) ──
  const skipHistoryRef = useRef(false);
  const pushHistory = useCallback(
    (newDesign: DesignData) => {
      setHistoryStack((prev) => {
        const newStack = prev.slice(0, historyIndex + 1);
        newStack.push(newDesign);
        if (newStack.length > 50) newStack.shift();
        return newStack;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    pushHistory(design);
  }, [design]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      skipHistoryRef.current = true;
      setHistoryIndex((prev) => prev - 1);
      const prevDesign = historyStack[historyIndex - 1];
      if (prevDesign) setDesign(prevDesign);
    }
  }, [historyIndex, historyStack]);

  const redo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      skipHistoryRef.current = true;
      setHistoryIndex((prev) => prev + 1);
      const nextDesign = historyStack[historyIndex + 1];
      if (nextDesign) setDesign(nextDesign);
    }
  }, [historyIndex, historyStack]);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (studioMode === "pro-editor") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "z" &&
        e.shiftKey
      ) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, studioMode]);

  // ── Design Setters ──
  const set = <K extends keyof DesignData>(k: K, v: DesignData[K]) => {
    setDesign((d) => ({ ...d, [k]: v }));
  };

  const mark = (k: string) =>
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const isCouple =
    design.eventType === "wedding" || design.eventType === "engagement";

  // ── Validation ──
  const errPersonA =
    design.personA.trim().length < 2
      ? isEn
        ? "Please enter at least 2 characters."
        : isHi
          ? "कम से कम २ अक्षर लिखें."
          : "किमान २ अक्षरं लिहा."
      : design.personA.trim().length > 28
        ? isEn
          ? "Keep within 28 characters for best layout."
          : isHi
            ? "२८ अक्षरों में रखें — प्रिंट सुंदर दिखेगा."
            : "२८ अक्षरांत बसवा — प्रिंट सुंदर दिसेल."
        : null;

  const errPersonB = !isCouple
    ? null
    : design.personB.trim().length < 2
      ? isEn
        ? "Please enter the second name."
        : isHi
          ? "दूसरा नाम लिखें."
          : "दुसरं नाव लिहा."
      : design.personB.trim().length > 28
        ? isEn
          ? "Keep within 28 characters for best layout."
          : isHi
            ? "२८ अक्षरों में रखें — प्रिंट सुंदर दिखेगा."
            : "२८ अक्षरांत बसवा — प्रिंट सुंदर दिसेल."
        : null;

  const errDate = !design.date
    ? isEn
      ? "Please select a date."
      : isHi
        ? "दिनांक चुनें."
        : "दिनांक निवडा."
    : null;

  const errVenue =
    design.venue.trim().length < 3
      ? isEn
        ? "Please enter at least 3 characters for venue."
        : isHi
          ? "स्थान ३ या अधिक अक्षरों में लिखें."
          : "स्थळ ३ किंवा अधिक अक्षरांत लिहा."
      : null;

  const errCity =
    design.city.trim().length > 0 && design.city.trim().length < 2
      ? isEn
        ? "Please check city name."
        : isHi
          ? "शहर का नाम जांचें."
          : "शहराचं नाव तपासा."
      : null;

  const showA = touched["personA"] ? errPersonA : null;
  const showB = touched["personB"] ? errPersonB : null;
  const showDate = touched["date"] ? errDate : null;
  const showVenue = touched["venue"] ? errVenue : null;
  const showCity = touched["city"] ? errCity : null;

  // ── Quality Checks ──
  const checks = useMemo(
    () => [
      {
        ok: design.personA.trim().length > 1,
        t: isEn
          ? "First name filled"
          : isHi
            ? "पहला नाम भरा"
            : "पहिलं नाव भरलं",
      },
      {
        ok: !isCouple || design.personB.trim().length > 1,
        t: isCouple
          ? isEn
            ? "Second name filled"
            : isHi
              ? "दूसरा नाम भरा"
              : "दुसरं नाव भरलं"
          : isEn
            ? "Single name — verified"
            : isHi
              ? "एक ही नाम — सत्यापित"
              : "एकच नाव — बरोबर",
      },
      {
        ok: Boolean(design.date),
        t: isEn ? "Date selected" : isHi ? "दिनांक चुना" : "दिनांक निवडला",
      },
      {
        ok: design.venue.trim().length > 2,
        t: isEn
          ? "Venue is clear"
          : isHi
            ? "स्थान स्पष्ट है"
            : "स्थळ स्पष्ट आहे",
      },
      {
        ok:
          design.personA.length <= 28 &&
          (!isCouple || design.personB.length <= 28),
        t: isEn
          ? "Names within layout bounds"
          : isHi
            ? "नाम स्मार्ट लेआउट सीमा में"
            : "नावं स्मार्ट-लेआउट मर्यादेत",
      },
    ],
    [design, isCouple, isEn, isHi]
  );

  const doneCount = checks.filter((c) => c.ok).length;
  const allOk = doneCount === checks.length;
  const progressPct = Math.round((doneCount * 100) / checks.length);

  const activeTemplate = TEMPLATES.find((t) => t.id === design.template);
  const activePaise = activeTemplate ? activeTemplate.price * 100 : 0;
  const activeRupees = rupeesLabel(activePaise, isEn);

  const isSaving = saving || saveStatus === "saving";
  const longName =
    design.personA.length > 22 || (isCouple && design.personB.length > 22);

  const previewEmpty =
    design.personA.trim().length === 0 &&
    design.venue.trim().length === 0 &&
    design.date.length === 0;

  // ── Save Handler ──
  const handleAction = (fd: FormData) => {
    setSaveError(null);
    setSaveStatus("saving");
    startSave(() => {
      saveStudioDesign(fd)
        .then(() => {
          setSaveStatus("saved");
        })
        .catch((e: unknown) => {
          const digest =
            typeof e === "object" && e !== null && "digest" in e
              ? String((e as { digest: unknown }).digest)
              : e instanceof Error
                ? e.message
                : "";
          if (digest.includes("NEXT_REDIRECT")) {
            throw e;
          }
          setSaveStatus("idle");
          setSaveError(
            isEn
              ? "Save failed — check your network connection and retry."
              : "जतन अयशस्वी झाले — कनेक्शन तपासा व पुन्हा प्रयत्न करा."
          );
        });
    });
  };

  const handleRetry = () => {
    setSaveError(null);
    formRef.current?.requestSubmit();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (exportFormat === "pdf") {
      window.print();
    }
  };

  const handleGalleryKeys = (e: React.KeyboardEvent) => {
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown"
    ) {
      return;
    }
    e.preventDefault();
    const idx = TEMPLATES.findIndex((t) => t.id === design.template);
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = (idx + dir + TEMPLATES.length) % TEMPLATES.length;
    const target = TEMPLATES[next];
    if (target) {
      set("template", target.id as TemplateId);
    }
  };

  const toggleEffect = (effectId: string) => {
    setSelectedEffects((prev) =>
      prev.includes(effectId)
        ? prev.filter((e) => e !== effectId)
        : [...prev, effectId]
    );
  };

  // ── Computed Styles for Preview ──
  const previewTransformStyle = useMemo(() => {
    return {
      transform: `rotate(${customRotation}deg) scale(${customScale / 100})`,
      opacity: customOpacity / 100,
      filter: customBlur > 0 ? `blur(${customBlur}px)` : undefined,
      borderRadius: `${borderRadius}px`,
      transition: `all ${animationDuration}ms ${transitionStyle === "spring"
          ? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          : transitionStyle === "bounce"
            ? "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
            : transitionStyle === "elastic"
              ? "cubic-bezier(0.68, -0.6, 0.32, 1.6)"
              : "ease"
        }`,
    };
  }, [
    customRotation,
    customScale,
    customOpacity,
    customBlur,
    borderRadius,
    animationDuration,
    transitionStyle,
  ]);

  // ── Loading State ──
  if (!mounted) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={
          isEn ? "Loading premium studio" : "प्रीमियम स्टुडिओ लोड होत आहे"
        }
        className="min-h-screen grid place-items-center"
      >
        <div className="text-center space-y-6">
          {/* Premium Loading Animation */}
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-gold-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-gold-500" />
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-maroon-600 [animation-direction:reverse] [animation-duration:1.5s]" />
            <div className="absolute inset-4 animate-pulse rounded-full bg-gradient-to-br from-gold-400 to-maroon-600 opacity-30" />
            <div className="absolute inset-0 grid place-items-center text-2xl">
              👑
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-bold text-maroon-800 animate-pulse">
              {isEn
                ? "Initializing Premium Studio"
                : isHi
                  ? "प्रीमियम स्टूडियो लोड हो रहा है"
                  : "प्रीमियम स्टुडिओ सुरू होत आहे"}
            </h2>
            <p className="text-sm text-ink-500">
              {isEn
                ? "Loading templates, effects & animations…"
                : isHi
                  ? "टेम्पलेट्स, इफेक्ट्स और एनिमेशन लोड हो रहे हैं…"
                  : "टेम्पलेट्स, इफेक्ट्स आणि अ‍ॅनिमेशन्स लोड होत आहेत…"}
            </p>
          </div>
          {/* Loading Progress Bar */}
          <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-maroon-900/10">
            <div className="h-full animate-loading-bar rounded-full bg-gradient-to-r from-gold-500 via-maroon-600 to-gold-500 bg-[length:200%_100%]" />
          </div>
        </div>
      </div>
    );
  }

  // ── Studio Mode Definitions ──
  const studioModes = [
    {
      id: "all-events" as StudioMode,
      icon: "👑",
      label: {
        en: "50+ All Events",
        hi: "५०+ सभी इवेंट",
        mr: "५०+ सर्व सोहळे",
      },
      badge: "50+",
      badgeColor: "bg-maroon-950 text-gold-300",
    },
    {
      id: "pro-editor" as StudioMode,
      icon: "🎨",
      label: {
        en: "Canva Pro Studio",
        hi: "कैनवा प्रो स्टूडियो",
        mr: "कॅनव्हा प्रो स्टुडिओ",
      },
      badge: "CANVA PRO",
      badgeColor: "bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white font-extrabold animate-pulse shadow-xs",
    },
    {
      id: "video-studio" as StudioMode,
      icon: "🎬",
      label: {
        en: "Video Studio",
        hi: "वीडियो स्टूडियो",
        mr: "व्हिडिओ स्टुडिओ",
      },
      badge: "NEW",
      badgeColor: "bg-leaf-600 text-white",
    },
    {
      id: "effects-lab" as StudioMode,
      icon: "✨",
      label: {
        en: "Effects Lab",
        hi: "इफेक्ट्स लैब",
        mr: "इफेक्ट्स लॅब",
      },
      badge: "BETA",
      badgeColor: "bg-purple-600 text-white",
    },
    {
      id: "invitation" as StudioMode,
      icon: "💌",
      label: {
        en: "Lagna Patrika",
        hi: "लग्न पत्रिका",
        mr: "लग्नाची पत्रिका",
      },
      badge: null,
      badgeColor: "",
    },
    {
      id: "biodata" as StudioMode,
      icon: "⚜️",
      label: {
        en: "Biodata",
        hi: "बायोडाटा",
        mr: "बायोडाटा",
      },
      badge: "NEW",
      badgeColor: "bg-gold-500/25 text-gold-700",
    },
  ];

  return (
    <div className={`space-y-8 ${isFullscreen ? "fixed inset-0 z-50 overflow-auto bg-white p-6" : ""}`}>
      {/* ═══════════════════════════════════════════════════════════════════════
          PREMIUM STUDIO HEADER
      ═══════════════════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden rounded-3xl border border-gold-500/20 bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-950 p-6 sm:p-8 shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFD700%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] animate-bg-scroll" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          {/* Crown Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-lg">👑</span>
            <span className="text-[11px] font-black tracking-[0.2em] text-gold-300 uppercase">
              {isEn
                ? "Premium Creator Studio"
                : isHi
                  ? "प्रीमियम क्रिएटर स्टूडियो"
                  : "प्रीमियम क्रिएटर स्टुडिओ"}
            </span>
            <span className="rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-2 py-0.5 text-[9px] font-black text-maroon-950">
              v3.0
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory-100 tracking-tight">
            {isEn
              ? "Super Premium Design Studio"
              : isHi
                ? "सुपर प्रीमियम डिज़ाइन स्टूडियो"
                : "सुपर प्रीमियम डिझाइन स्टुडिओ"}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ivory-100/60">
            {isEn
              ? "50+ templates · Advanced animations · Video export · AI-powered transliteration · Multi-language"
              : isHi
                ? "५०+ टेम्पलेट्स · एडवांस्ड एनिमेशन · वीडियो एक्सपोर्ट · AI ट्रांसलिटरेषन · बहु-भाषा"
                : "५०+ टेम्पलेट्स · प्रगत अ‍ॅनिमेशन · व्हिडिओ एक्सपोर्ट · AI ट्रान्सलिटरेशन · बहु-भाषा"}
          </p>

          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {[
              {
                icon: "🎨",
                val: "50+",
                label: isEn ? "Templates" : isHi ? "टेम्पलेट्स" : "टेम्पलेट्स",
              },
              {
                icon: "🎬",
                val: "25+",
                label: isEn
                  ? "Animations"
                  : isHi
                    ? "एनिमेशन"
                    : "अ‍ॅनिमेशन्स",
              },
              {
                icon: "✨",
                val: "15+",
                label: isEn ? "Effects" : isHi ? "इफेक्ट्स" : "इफेक्ट्स",
              },
              {
                icon: "🌐",
                val: "3",
                label: isEn
                  ? "Languages"
                  : isHi
                    ? "भाषाएं"
                    : "भाषा",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-1.5 rounded-full bg-ivory-100/5 px-3 py-1 ring-1 ring-ivory-100/10"
              >
                <span className="text-xs">{stat.icon}</span>
                <span className="text-xs font-bold text-gold-300">
                  {stat.val}
                </span>
                <span className="text-[10px] text-ivory-100/50">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          STUDIO MODE SWITCHER — Premium Tab Bar
      ═══════════════════════════════════════════════════════════════════════ */}
      <nav className="flex flex-col items-center">
        <div className="inline-flex flex-wrap justify-center gap-1.5 rounded-2xl border border-gold-500/25 bg-maroon-950/95 p-2 shadow-2xl backdrop-blur-xl">
          {studioModes.map((mode) => {
            const active = studioMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setStudioMode(mode.id)}
                className={`group relative min-h-[48px] rounded-xl px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${active
                    ? "bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-maroon-950 shadow-lg shadow-gold-500/25 scale-[1.02]"
                    : "text-ivory-100/70 hover:text-gold-200 hover:bg-ivory-100/5"
                  }`}
              >
                <span className="text-base">{mode.icon}</span>
                <span className="hidden sm:inline">
                  {isEn
                    ? mode.label.en
                    : isHi
                      ? mode.label.hi
                      : mode.label.mr}
                </span>
                {mode.badge && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[8.5px] font-black ${mode.badgeColor}`}
                  >
                    {mode.badge}
                  </span>
                )}
                {/* Active Indicator */}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-gold-400 shadow-glow" />
                )}
              </button>
            );
          })}

          {/* Direct Full View in New Tab Button */}
          <a
            href={`/studio/editor?template=${canvaTemplateId || "wedding-royal-purple-ganesh"}#design-form`}
            target="_blank"
            rel="noopener noreferrer"
            title={isEn ? "Open in New Tab (Full Space & Full View Mode)" : "नवीन टॅबमध्ये पूर्ण स्क्रीन उघडा"}
            className="btn-base btn-maroon group relative"
          >
            <span className="text-base">⤢</span>
            <span className="hidden md:inline">
              {isEn ? "Full View (New Tab)" : "पूर्ण स्क्रीन (New Tab)"}
            </span>
            <span className="rounded-full bg-gold-500/25 px-1.5 py-0.5 text-[8.5px] font-black text-gold-bright">
              PRO
            </span>
          </a>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          STUDIO MODE CONTENT
      ═══════════════════════════════════════════════════════════════════════ */}
      {studioMode === "all-events" ? (
        <MultiEventStudio
          initialTemplateId={initialTemplateId}
          onOpenCanvaPro={(tmplId) => {
            setCanvaTemplateId(tmplId);
            setStudioMode("pro-editor");
            if (typeof window !== "undefined") {
              window.location.hash = "#design-form";
            }
          }}
        />
      ) : studioMode === "pro-editor" ? (
        <CanvaCanvasEditor initialTemplateId={canvaTemplateId} />
      ) : studioMode === "biodata" ? (
        <BiodataEditor />
      ) : studioMode === "video-studio" ? (
        /* ─── VIDEO STUDIO MODE ─────────────────────────────────────────── */
        <VideoStudioSection
          design={design}
          animationType={animationType}
          setAnimationType={setAnimationType}
          particleEffect={particleEffect}
          setParticleEffect={setParticleEffect}
          animationDuration={animationDuration}
          setAnimationDuration={setAnimationDuration}
          autoPlayAnimation={autoPlayAnimation}
          setAutoPlayAnimation={setAutoPlayAnimation}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          handleExport={handleExport}
          isEn={isEn}
          isHi={isHi}
          previewRef={previewRef}
          previewTransformStyle={previewTransformStyle}
          lang={lang}
        />
      ) : studioMode === "effects-lab" ? (
        /* ─── EFFECTS LAB MODE ──────────────────────────────────────────── */
        <EffectsLabSection
          design={design}
          selectedEffects={selectedEffects}
          toggleEffect={toggleEffect}
          customRotation={customRotation}
          setCustomRotation={setCustomRotation}
          customScale={customScale}
          setCustomScale={setCustomScale}
          customOpacity={customOpacity}
          setCustomOpacity={setCustomOpacity}
          customBlur={customBlur}
          setCustomBlur={setCustomBlur}
          borderRadius={borderRadius}
          setBorderRadius={setBorderRadius}
          textShadow={textShadow}
          setTextShadow={setTextShadow}
          isEn={isEn}
          isHi={isHi}
          lang={lang}
          previewTransformStyle={previewTransformStyle}
          previewRef={previewRef}
        />
      ) : (
        /* ─── INVITATION EDITOR MODE ────────────────────────────────────── */
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_440px]">
          <a
            href="#studio-preview"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-full focus:bg-maroon-800 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-ivory-100"
          >
            {isEn
              ? "Skip to Live Preview"
              : isHi
                ? "लाइव प्रिव्यू पर जाएं"
                : "थेट प्रिव्ह्यूकडे जा"}
          </a>

          {/* Mobile Tab Switcher */}
          <div className="lg:hidden col-span-full -mb-2 flex rounded-xl border border-maroon-900/10 bg-white/90 p-1 shadow-lg backdrop-blur-sm">
            {(
              [
                {
                  id: "edit",
                  icon: "sparkle",
                  label: {
                    en: "Edit",
                    hi: "संपादन",
                    mr: "संपादन",
                  },
                },
                {
                  id: "effects",
                  icon: "wand",
                  label: {
                    en: "Effects",
                    hi: "इफेक्ट्स",
                    mr: "इफेक्ट्स",
                  },
                },
                {
                  id: "preview",
                  icon: "eye",
                  label: {
                    en: "Preview",
                    hi: "प्रिव्यू",
                    mr: "प्रिव्ह्यू",
                  },
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileTab(tab.id)}
                className={`flex-1 min-h-[42px] rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${mobileTab === tab.id
                    ? "bg-maroon-800 text-ivory-100 shadow-sm"
                    : "text-ink-700 hover:text-ink-900"
                  }`}
              >
                <Icon name={tab.icon} className="h-4 w-4" />
                {isEn
                  ? tab.label.en
                  : isHi
                    ? tab.label.hi
                    : tab.label.mr}
              </button>
            ))}
          </div>

          {/* ─── EDITOR PANEL ───────────────────────────────────────────── */}
          <div
            className={`min-w-0 animate-fade-up ${mobileTab === "edit" ? "block" : "hidden lg:block"
              }`}
          >
            {/* Premium Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-maroon-900/10 bg-white/80 p-2.5 shadow-lg backdrop-blur-sm">
              {/* Undo/Redo */}
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                title={isEn ? "Undo (Ctrl+Z)" : isHi ? "पूर्ववत" : "पूर्ववत"}
                className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900/5 text-ink-600 transition hover:bg-ink-900/10 disabled:opacity-30"
              >
                <Icon name="undo" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= historyStack.length - 1}
                title={isEn ? "Redo (Ctrl+Shift+Z)" : isHi ? "फिर से" : "पुन्हा"}
                className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900/5 text-ink-600 transition hover:bg-ink-900/10 disabled:opacity-30"
              >
                <Icon name="redo" className="h-4 w-4" />
              </button>

              <div className="h-6 w-px bg-ink-900/10" />

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen((p) => !p)}
                title={isEn ? "Fullscreen (F11)" : "फुलस्क्रीन"}
                className="grid h-9 w-9 place-items-center rounded-lg bg-ink-900/5 text-ink-600 transition hover:bg-ink-900/10"
              >
                <Icon
                  name={isFullscreen ? "minimize" : "maximize"}
                  className="h-4 w-4"
                />
              </button>

              <div className="h-6 w-px bg-ink-900/10" />

              {/* Panel Tabs */}
              {(
                [
                  {
                    id: "template",
                    icon: "🎨",
                    label: isEn ? "Template" : isHi ? "टेम्पलेट" : "टेम्पलेट",
                  },
                  {
                    id: "text",
                    icon: "✏️",
                    label: isEn ? "Text" : isHi ? "टेक्स्ट" : "मजकूर",
                  },
                  {
                    id: "animation",
                    icon: "🎬",
                    label: isEn
                      ? "Animate"
                      : isHi
                        ? "एनिमेट"
                        : "अ‍ॅनिमेट",
                  },
                  {
                    id: "color",
                    icon: "🎨",
                    label: isEn ? "Colors" : isHi ? "रंग" : "रंग",
                  },
                  {
                    id: "export",
                    icon: "📤",
                    label: isEn
                      ? "Export"
                      : isHi
                        ? "एक्सपोर्ट"
                        : "निर्यात",
                  },
                ] as const
              ).map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setActivePanel(panel.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${activePanel === panel.id
                      ? "bg-maroon-800 text-ivory-100 shadow-sm"
                      : "text-ink-600 hover:bg-ink-900/5"
                    }`}
                >
                  <span>{panel.icon}</span>
                  <span className="hidden sm:inline">{panel.label}</span>
                </button>
              ))}
            </div>

            {/* Card Language Preference */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-maroon-900/10 bg-white/70 p-3.5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-gold-400/20 to-maroon-600/10 text-lg"
                >
                  🌐
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-ink-800">
                      {isEn
                        ? "Card Language"
                        : isHi
                          ? "कार्ड भाषा"
                          : "पत्रिका भाषा"}
                    </span>
                    <span className="rounded-full bg-gradient-to-r from-gold-500/15 to-gold-600/15 px-2.5 py-0.5 text-[10px] font-bold text-gold-700 ring-1 ring-gold-500/30">
                      {isEn
                        ? "English"
                        : isHi
                          ? "हिंदी"
                          : "मराठी"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-400 mt-0.5">
                    {isEn
                      ? "Switch between Marathi, Hindi & English"
                      : isHi
                        ? "मराठी, हिंदी और अंग्रेजी के बीच बदलें"
                        : "मराठी, हिंदी आणि इंग्रजी मध्ये बदला"}
                  </p>
                </div>
              </div>
              <LangToggle
                lang={lang}
                onChange={(next) => {
                  setLang(next);
                  setDesign((d) => ({
                    ...d,
                    lang: next,
                    blessing:
                      next === "en"
                        ? "॥ Shri Ganeshaya Namah ॥"
                        : "॥ श्री गणेशाय नमः ॥",
                  }));
                }}
              />
            </div>

            {/* ─── ACTIVE PANEL: TEMPLATE GALLERY ──────────────────────── */}
            {activePanel === "template" && (
              <fieldset className="animate-fade-in">
                <legend className="label flex items-center gap-2">
                  <span className="text-base">🎨</span>
                  {isEn
                    ? `Select Template · ${TEMPLATES.length} Premium Options`
                    : isHi
                      ? `टेम्प्लेट चुनें · ${toDevanagariDigits(TEMPLATES.length)} प्रीमियम विकल्प`
                      : `टेम्पलेट निवडा · ${toDevanagariDigits(TEMPLATES.length)} प्रीमियम पर्याय`}
                </legend>
                {TEMPLATES.length === 0 ? (
                  <div className="rounded-xl border border-maroon-900/10 bg-white/70 px-5 py-8 text-center">
                    <p className="font-marathi-display text-[15px] font-bold text-ink-700">
                      {isEn
                        ? "No templates available"
                        : isHi
                          ? "कोई टेम्प्लेट उपलब्ध नहीं"
                          : "टेम्पलेट उपलब्ध नाहीत"}
                    </p>
                  </div>
                ) : (
                  <div
                    role="radiogroup"
                    aria-label={
                      isEn
                        ? "Select template"
                        : isHi
                          ? "टेम्प्लेट चुनें"
                          : "टेम्पलेट निवडा"
                    }
                    onKeyDown={handleGalleryKeys}
                    className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4"
                  >
                    {TEMPLATES.map((t, i) => {
                      const selected = design.template === t.id;
                      const cardPaise = t.price * 100;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-pressed={selected}
                          aria-label={`${isEn ? t.en : t.name} · ${rupeesLabel(cardPaise, isEn)}`}
                          onClick={() => set("template", t.id as TemplateId)}
                          style={{ animationDelay: `${i * 70}ms` }}
                          className={`group relative min-h-[44px] overflow-hidden rounded-xl text-left ring-2 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${selected
                              ? "scale-[1.02] ring-gold-500 shadow-glow shadow-gold-500/20"
                              : "ring-transparent hover:-translate-y-2 hover:shadow-xl hover:ring-gold-400/50"
                            }`}
                        >
                          <InvitationCard
                            design={{
                              ...design,
                              lang,
                              template: t.id,
                              personA: isEn
                                ? "Name"
                                : isHi
                                  ? "नाम"
                                  : "नाव",
                              personB: isEn
                                ? "Name"
                                : isHi
                                  ? "नाम"
                                  : "नाव",
                              host: "",
                              time: "",
                            }}
                            className="pointer-events-none aspect-[3/4] w-full"
                          />
                          {/* Premium Overlay */}
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-950/95 via-maroon-950/60 to-transparent px-2.5 pb-2.5 pt-10">
                            <span className="block font-marathi-display text-[12.5px] font-bold text-gold-200">
                              {isEn ? t.en : t.name}
                            </span>
                            <span className="block text-[11px] font-semibold text-ivory-100/60">
                              {rupeesLabel(cardPaise, isEn)}
                            </span>
                          </span>
                          {/* Selected Checkmark */}
                          <span
                            aria-hidden="true"
                            className={`absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full transition-all duration-300 ${selected
                                ? "scale-100 bg-gold-500 text-maroon-950 shadow-lg"
                                : "scale-75 bg-maroon-950/60 text-transparent"
                              }`}
                          >
                            <Icon
                              name="check"
                              className="h-3.5 w-3.5"
                              strokeWidth={3}
                            />
                          </span>
                          {/* Premium Badge for selected */}
                          {selected && (
                            <span className="absolute top-2 left-2 rounded-full bg-gold-500 px-2 py-0.5 text-[8px] font-black text-maroon-950 uppercase animate-pulse">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p
                  id="template-hint"
                  aria-live="polite"
                  className="mt-2 min-h-[20px] text-[12.5px] font-medium text-ink-500"
                >
                  {activeTemplate
                    ? `${isEn ? activeTemplate.en : activeTemplate.name} — ${activeTemplate.desc} · ${activeRupees}`
                    : isEn
                      ? "Select a template."
                      : isHi
                        ? "टेम्प्लेट चुनें."
                        : "टेम्पलेट निवडा."}
                </p>
              </fieldset>
            )}

            {/* ─── ACTIVE PANEL: ANIMATION CONTROLS ────────────────────── */}
            {activePanel === "animation" && (
              <div className="space-y-5 animate-fade-in">
                {/* Animation Type Selector */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-purple-700 to-maroon-800 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    🎬{" "}
                    {isEn
                      ? "Animation Style"
                      : isHi
                        ? "एनिमेशन शैली"
                        : "अ‍ॅनिमेशन शैली"}
                  </legend>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {(
                      [
                        "none",
                        "fade-in",
                        "fade-up",
                        "fade-down",
                        "slide-left",
                        "slide-right",
                        "zoom-in",
                        "zoom-out",
                        "rotate-in",
                        "bounce-in",
                        "elastic",
                        "flip-x",
                        "blur-in",
                        "typewriter",
                        "shimmer",
                        "float",
                        "swing",
                        "heartbeat",
                        "jello",
                        "glow-pulse",
                      ] as AnimationType[]
                    ).map((anim) => (
                      <button
                        key={anim}
                        type="button"
                        onClick={() => setAnimationType(anim)}
                        className={`min-h-[40px] rounded-lg px-2 py-2 text-[11px] font-bold transition-all ${animationType === anim
                            ? "bg-gradient-to-r from-purple-600 to-maroon-700 text-ivory-100 shadow-md scale-[1.02]"
                            : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
                          }`}
                      >
                        {anim.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Duration & Timing */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-blue-700 to-purple-800 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    ⏱️{" "}
                    {isEn
                      ? "Timing & Duration"
                      : isHi
                        ? "समय और अवधि"
                        : "वेळ आणि कालावधी"}
                  </legend>
                  <div className="mt-3 space-y-4">
                    {/* Duration Slider */}
                    <div>
                      <label className="label text-xs">
                        {isEn
                          ? "Duration"
                          : isHi
                            ? "अवधि"
                            : "कालावधी"}{" "}
                        — {animationDuration}ms
                      </label>
                      <input
                        type="range"
                        min={100}
                        max={3000}
                        step={100}
                        value={animationDuration}
                        onChange={(e) =>
                          setAnimationDuration(Number(e.target.value))
                        }
                        className="w-full accent-purple-600"
                      />
                      <div className="flex justify-between mt-1">
                        {DURATION_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() =>
                              setAnimationDuration(preset.value)
                            }
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${animationDuration === preset.value
                                ? "bg-purple-100 text-purple-700"
                                : "text-ink-400"
                              }`}
                          >
                            {isEn
                              ? preset.label.en
                              : isHi
                                ? preset.label.hi
                                : preset.label.mr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delay */}
                    <div>
                      <label className="label text-xs">
                        {isEn ? "Delay" : isHi ? "विलंब" : "विलंब"} —{" "}
                        {animationDelay}ms
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={2000}
                        step={100}
                        value={animationDelay}
                        onChange={(e) =>
                          setAnimationDelay(Number(e.target.value))
                        }
                        className="w-full accent-purple-600"
                      />
                    </div>

                    {/* Iteration Count */}
                    <div>
                      <label className="label text-xs">
                        {isEn
                          ? "Repeat"
                          : isHi
                            ? "दोहराव"
                            : "पुनरावृत्ती"}{" "}
                        —{" "}
                        {animationIteration === 0
                          ? "∞"
                          : `${animationIteration}x`}
                      </label>
                      <div className="flex gap-2 mt-1">
                        {[1, 2, 3, 5, 0].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setAnimationIteration(n)}
                            className={`flex-1 min-h-[36px] rounded-lg text-xs font-bold transition ${animationIteration === n
                                ? "bg-purple-600 text-white"
                                : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
                              }`}
                          >
                            {n === 0 ? "∞" : `${n}x`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transition Style */}
                    <div>
                      <label className="label text-xs">
                        {isEn
                          ? "Easing"
                          : isHi
                            ? "ईज़िंग"
                            : "ईझिंग"}
                      </label>
                      <div className="flex gap-2 mt-1">
                        {(
                          [
                            "none",
                            "smooth",
                            "spring",
                            "bounce",
                            "elastic",
                            "gentle",
                          ] as TransitionStyle[]
                        ).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setTransitionStyle(style)}
                            className={`flex-1 min-h-[36px] rounded-lg text-[10px] font-bold transition ${transitionStyle === style
                                ? "bg-purple-600 text-white"
                                : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
                              }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Particle Effects */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-amber-600 to-orange-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    ✨{" "}
                    {isEn
                      ? "Particle Effects"
                      : isHi
                        ? "पार्टिकल इफेक्ट्स"
                        : "पार्टिकल इफेक्ट्स"}
                  </legend>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {(
                      [
                        "none",
                        "petals",
                        "sparkles",
                        "confetti",
                        "stars",
                        "hearts",
                        "snow",
                        "bubbles",
                        "fireflies",
                        "lanterns",
                        "diyas",
                      ] as ParticleEffect[]
                    ).map((particle) => (
                      <button
                        key={particle}
                        type="button"
                        onClick={() => setParticleEffect(particle)}
                        className={`min-h-[44px] rounded-lg px-2 py-2 text-[11px] font-bold transition-all flex flex-col items-center gap-1 ${particleEffect === particle
                            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md scale-[1.02]"
                            : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
                          }`}
                      >
                        <span className="text-base">
                          {particle === "none"
                            ? "🚫"
                            : particle === "petals"
                              ? "🌸"
                              : particle === "sparkles"
                                ? "✨"
                                : particle === "confetti"
                                  ? "🎊"
                                  : particle === "stars"
                                    ? "⭐"
                                    : particle === "hearts"
                                      ? "💕"
                                      : particle === "snow"
                                        ? "❄️"
                                        : particle === "bubbles"
                                          ? "🫧"
                                          : particle === "fireflies"
                                            ? "🪲"
                                            : particle === "lanterns"
                                              ? "🏮"
                                              : "🪔"}
                        </span>
                        <span>{particle}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Animation Preview Button */}
                <button
                  type="button"
                  onClick={() => setShowAnimationPreview((p) => !p)}
                  className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-purple-600 via-maroon-700 to-purple-600 text-ivory-100 font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
                >
                  {showAnimationPreview
                    ? isEn
                      ? "⏹ Stop Preview"
                      : "⏹ प्रिव्ह्यू थांबवा"
                    : isEn
                      ? "▶ Preview Animation"
                      : isHi
                        ? "▶ एनिमेशन प्रिव्यू"
                        : "▶ अ‍ॅनिमेशन प्रिव्ह्यू"}
                </button>
              </div>
            )}

            {/* ─── ACTIVE PANEL: COLOR & THEME ─────────────────────────── */}
            {activePanel === "color" && (
              <div className="space-y-5 animate-fade-in">
                {/* Premium Color Palettes */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-pink-600 to-purple-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    🎨{" "}
                    {isEn
                      ? "Premium Palettes"
                      : isHi
                        ? "प्रीमियम पैलेट"
                        : "प्रीमियम पॅलेट्स"}
                  </legend>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {PREMIUM_PALETTES.map((palette) => (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => setSelectedPalette(palette.id)}
                        className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-300 ring-2 ${selectedPalette === palette.id
                            ? "ring-gold-500 shadow-lg scale-[1.02]"
                            : "ring-transparent hover:ring-gold-400/40 hover:shadow-md"
                          }`}
                        style={{
                          background: `linear-gradient(135deg, ${palette.bg}, ${palette.primary}20)`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            <div
                              className="h-5 w-5 rounded-full ring-2 ring-white/20"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <div
                              className="h-5 w-5 rounded-full ring-2 ring-white/20"
                              style={{
                                backgroundColor: palette.secondary,
                              }}
                            />
                            <div
                              className="h-5 w-5 rounded-full ring-2 ring-white/20"
                              style={{ backgroundColor: palette.accent }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-ivory-100">
                            {isEn
                              ? palette.name.en
                              : isHi
                                ? palette.name.hi
                                : palette.name.mr}
                          </span>
                        </div>
                        {selectedPalette === palette.id && (
                          <span className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-gold-500 text-maroon-950">
                            <Icon
                              name="check"
                              className="h-3 w-3"
                              strokeWidth={3}
                            />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Background Style */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    🖼️{" "}
                    {isEn
                      ? "Background Style"
                      : isHi
                        ? "पृष्ठभूमि शैली"
                        : "पार्श्वभूमी शैली"}
                  </legend>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {(
                      [
                        "solid",
                        "gradient-linear",
                        "gradient-radial",
                        "gradient-conic",
                        "mesh",
                        "aurora",
                        "animated-gradient",
                      ] as BackgroundStyle[]
                    ).map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setBackgroundStyle(bg)}
                        className={`min-h-[44px] rounded-lg px-2 py-2 text-[10px] font-bold transition-all ${backgroundStyle === bg
                            ? "bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md"
                            : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
                          }`}
                      >
                        {bg.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {/* Font Selection */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-leaf-600 to-paithani px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    🔤{" "}
                    {isEn ? "Typography" : isHi ? "टाइपोग्राफी" : "टायपोग्राफी"}
                  </legend>
                  <div className="grid gap-2 mt-3">
                    {PREMIUM_FONTS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setSelectedFont(font.id)}
                        className={`flex items-center justify-between min-h-[44px] rounded-lg px-4 py-2 transition-all ${selectedFont === font.id
                            ? "bg-gradient-to-r from-leaf-600 to-paithani text-white shadow-md"
                            : "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"
                          }`}
                        style={{ fontFamily: font.family }}
                      >
                        <span className="text-sm">
                          {isEn
                            ? font.name.en
                            : isHi
                              ? font.name.hi
                              : font.name.mr}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {font.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {/* ─── ACTIVE PANEL: EXPORT ─────────────────────────────────── */}
            {activePanel === "export" && (
              <div className="space-y-5 animate-fade-in">
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
                  <legend className="rounded-full bg-gradient-to-r from-leaf-600 to-leaf-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase">
                    📤{" "}
                    {isEn
                      ? "Export Format"
                      : isHi
                        ? "एक्सपोर्ट फॉर्मेट"
                        : "निर्यात स्वरूप"}
                  </legend>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                    {(
                      [
                        {
                          id: "pdf",
                          icon: "📄",
                          label: "PDF",
                          desc: isEn
                            ? "Print-ready"
                            : "प्रिंट-रेडी",
                        },
                        {
                          id: "png",
                          icon: "🖼️",
                          label: "PNG",
                          desc: isEn
                            ? "High-res"
                            : "हाय-रेस",
                        },
                        {
                          id: "mp4",
                          icon: "🎬",
                          label: "MP4",
                          desc: isEn
                            ? "Video"
                            : "व्हिडिओ",
                        },
                        {
                          id: "gif",
                          icon: "🎞️",
                          label: "GIF",
                          desc: isEn
                            ? "Animated"
                            : "अ‍ॅनिमे",
                        },
                        {
                          id: "webp",
                          icon: "🌐",
                          label: "WebP",
                          desc: isEn
                            ? "Web-opt"
                            : "वेब",
                        },
                      ] as const
                    ).map((format) => (
                      <button
                        key={format.id}
                        type="button"
                        disabled={format.id !== "pdf"}
                        onClick={() =>
                          setExportFormat(
                            format.id as "pdf" | "png" | "mp4" | "gif" | "webp"
                          )
                        }
                        className={`flex min-h-[72px] flex-col items-center gap-1 rounded-xl p-3 transition-all ${exportFormat === format.id
                            ? "bg-maroon-deep text-gold-bright shadow-lg scale-[1.02]"
                            : format.id !== "pdf"
                              ? "cursor-not-allowed bg-ink-900/5 text-ink-400 opacity-60"
                              : "bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"
                          }`}
                      >
                        <span className="text-xl">{format.icon}</span>
                        <span className="text-xs font-bold">
                          {format.label}
                        </span>
                        <span className="text-[9px] opacity-70">
                          {format.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p
                    role="status"
                    className="mt-3 rounded-xl border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs font-bold text-gold-700"
                  >
                    {isEn
                      ? "Only PDF export is available in this version. PNG / MP4 / GIF / WebP are coming soon."
                      : isHi
                        ? "इस संस्करण में केवल PDF एक्सपोर्ट उपलब्ध है। PNG / MP4 / GIF / WebP जल्द आ रहे हैं।"
                        : "या आवृत्तीत केवळ PDF निर्यात उपलब्ध आहे. PNG / MP4 / GIF / WebP लवकर येत आहेत."}
                  </p>
                </fieldset>

                {/* Export Actions */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="btn-base btn-maroon flex items-center justify-center gap-2"
                  >
                    <Icon name="download" className="h-5 w-5" />
                    {isEn
                      ? `Export as ${exportFormat.toUpperCase()}`
                      : isHi
                        ? `${exportFormat.toUpperCase()} में एक्सपोर्ट करें`
                        : `${exportFormat.toUpperCase()} मध्ये निर्यात करा`}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn-base btn-outline flex items-center justify-center gap-2"
                  >
                    <Icon name="printer" className="h-5 w-5" />
                    {isEn ? "Quick Print" : isHi ? "त्वरित प्रिंट" : "जलद प्रिंट"}
                  </button>
                </div>

                {/* Premium Export Options */}
                <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">👑</span>
                    <span className="text-sm font-bold text-gold-700">
                      {isEn
                        ? "Premium Export Features"
                        : isHi
                          ? "प्रीमियम एक्सपोर्ट फीचर्स"
                          : "प्रीमियम निर्यात वैशिष्ट्ये"}
                    </span>
                  </div>
                  <ul className="space-y-2 text-[12px] text-ink-600">
                    <li className="flex items-center gap-2">
                      <span className="text-leaf-600">✓</span>
                      {isEn
                        ? "4K resolution video export with animations"
                        : "अ‍ॅनिमेशनसह 4K रिझोल्यूशन व्हिडिओ"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-leaf-600">✓</span>
                      {isEn
                        ? "Print-ready 300 DPI PDF"
                        : "प्रिंट-रेडी 300 DPI PDF"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-leaf-600">✓</span>
                      {isEn
                        ? "Animated GIF with custom timing"
                        : "कस्टम टायमिंगसह अ‍ॅनिमेटेड GIF"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-leaf-600">✓</span>
                      {isEn
                        ? "WhatsApp-optimized sharing"
                        : "WhatsApp-ऑप्टिमाइज्ड शेअरिंग"}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ─── ACTIVE PANEL: TEXT EDITING ──────────────────────────── */}
            {(activePanel === "text" || activePanel === "template") && (
              <form
                ref={formRef}
                action={handleAction}
                noValidate
                id="legacy-design-form"
                aria-label={
                  isEn
                    ? "Invitation details form"
                    : isHi
                      ? "निमंत्रण विवरण फॉर्म"
                      : "पत्रिका तपशील फॉर्म"
                }
                className="mt-6 space-y-6"
              >
                <input
                  type="hidden"
                  name="design"
                  value={JSON.stringify(design)}
                />

                {/* Event Details */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6 shadow-lg backdrop-blur-sm">
                  <legend className="rounded-full bg-gradient-to-r from-maroon-800 to-maroon-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase shadow-md">
                    {isEn
                      ? "1 · Event Details"
                      : isHi
                        ? "१ · कार्यक्रम विवरण"
                        : "१ · कार्यक्रम"}
                  </legend>
                  <div className="grid gap-5 sm:grid-cols-2 mt-3">
                    <div>
                      <label htmlFor="f-event" className="label">
                        {isEn
                          ? "Event Type"
                          : isHi
                            ? "कार्यक्रम प्रकार"
                            : "कार्यक्रम प्रकार"}
                      </label>
                      <select
                        id="f-event"
                        value={design.eventType}
                        onChange={(e) => set("eventType", e.target.value)}
                        onBlur={() => mark("eventType")}
                        className="field min-h-[44px]"
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {isEn ? t.en : isHi ? t.hi : t.mr}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="f-blessing" className="label">
                        {isEn
                          ? "Blessing / Invocation"
                          : isHi
                            ? "मंगलाचरण"
                            : "मंगलाचरण / आशीर्वाद"}
                      </label>
                      <select
                        id="f-blessing"
                        value={design.blessing}
                        onChange={(e) => set("blessing", e.target.value)}
                        onBlur={() => mark("blessing")}
                        className="field min-h-[44px]"
                      >
                        {(isEn
                          ? BLESSINGS_EN
                          : isHi
                            ? BLESSINGS_HI
                            : BLESSINGS
                        ).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="f-date" className="label">
                        {isEn ? "Date" : isHi ? "दिनांक" : "दिनांक"}
                      </label>
                      <input
                        id="f-date"
                        type="date"
                        required
                        value={design.date}
                        onChange={(e) => set("date", e.target.value)}
                        onBlur={() => mark("date")}
                        aria-invalid={Boolean(showDate)}
                        aria-describedby={showDate ? "err-date" : undefined}
                        className="field min-h-[44px]"
                      />
                      {showDate ? (
                        <p
                          id="err-date"
                          className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700"
                        >
                          {showDate}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </fieldset>

                {/* Personal Details */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6 shadow-lg backdrop-blur-sm">
                  <legend className="rounded-full bg-gradient-to-r from-maroon-800 to-maroon-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase shadow-md">
                    {isEn
                      ? "2 · Personal Details"
                      : isHi
                        ? "२ · व्यक्तिगत विवरण"
                        : "२ · व्यक्ती"}
                  </legend>
                  <div className="grid gap-5 sm:grid-cols-2 mt-3">
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <label htmlFor="f-personA" className="label">
                          {isEn
                            ? isCouple
                              ? "Groom / First Person"
                              : "Host Name"
                            : isHi
                              ? isCouple
                                ? "वर / मुख्य व्यक्ति"
                                : "नाम"
                              : isCouple
                                ? "वर / यजमान व्यक्ती"
                                : "नाव"}
                        </label>
                        <span
                          id="hint-personA"
                          className="text-[11px] font-bold text-ink-400"
                        >
                          {isEn
                            ? `${design.personA.trim().length} / 28`
                            : `${toDevanagariDigits(design.personA.trim().length)} / २८`}
                        </span>
                      </div>
                      <TransliteratedInput
                        id="f-personA"
                        required
                        maxLength={40}
                        value={design.personA}
                        onValueChange={(val) => set("personA", val)}
                        onBlur={() => mark("personA")}
                        placeholder={
                          isEn
                            ? "e.g. Tejas Prabhulkar Deshmukh"
                            : isHi
                              ? "उदा. तेजस प्रभुलकर देशमुख"
                              : "उदा. तेजस प्रभुलकर देशमुख"
                        }
                        aria-invalid={Boolean(showA)}
                        aria-describedby={
                          showA ? "err-personA hint-personA" : "hint-personA"
                        }
                        className="field font-marathi-display min-h-[44px] w-full"
                      />
                      {showA ? (
                        <p
                          id="err-personA"
                          className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700"
                        >
                          {showA}
                        </p>
                      ) : null}
                    </div>
                    {isCouple ? (
                      <div>
                        <div className="flex items-baseline justify-between gap-2">
                          <label htmlFor="f-personB" className="label">
                            {isEn
                              ? "Bride / Second Person"
                              : isHi
                                ? "वधू / दूसरी व्यक्ति"
                                : "वधू / दुसरी व्यक्ती"}
                          </label>
                          <span
                            id="hint-personB"
                            className="text-[11px] font-bold text-ink-400"
                          >
                            {isEn
                              ? `${design.personB.trim().length} / 28`
                              : `${toDevanagariDigits(design.personB.trim().length)} / २८`}
                          </span>
                        </div>
                        <TransliteratedInput
                          id="f-personB"
                          required
                          maxLength={40}
                          value={design.personB}
                          onValueChange={(val) => set("personB", val)}
                          onBlur={() => mark("personB")}
                          placeholder={
                            isEn
                              ? "e.g. Ananya Shrinivas Kulkarni"
                              : isHi
                                ? "उदा. अनन्या श्रीनिवास कुलकर्णी"
                                : "उदा. अनन्या श्रीनिवास कुलकर्णी"
                          }
                          aria-invalid={Boolean(showB)}
                          aria-describedby={
                            showB ? "err-personB hint-personB" : "hint-personB"
                          }
                          className="field font-marathi-display min-h-[44px] w-full"
                        />
                        {showB ? (
                          <p
                            id="err-personB"
                            className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700"
                          >
                            {showB}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </fieldset>

                {/* Timing & Venue */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6 shadow-lg backdrop-blur-sm">
                  <legend className="rounded-full bg-gradient-to-r from-maroon-800 to-maroon-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase shadow-md">
                    {isEn
                      ? "3 · Timing & Venue"
                      : isHi
                        ? "३ · समय व स्थान"
                        : "३ · वेळ व स्थळ"}
                  </legend>
                  <div className="grid gap-5 sm:grid-cols-2 mt-3">
                    <div>
                      <label htmlFor="f-time" className="label">
                        {isEn ? "Time" : isHi ? "समय" : "वेळ"}
                      </label>
                      <TransliteratedInput
                        id="f-time"
                        value={design.time}
                        onValueChange={(val) => set("time", val)}
                        onBlur={() => mark("time")}
                        placeholder={
                          isEn
                            ? "e.g. 12:30 PM"
                            : isHi
                              ? "उदा. दोपहर १२:३० बजे"
                              : "उदा. दुपारी १२:३० वा."
                        }
                        className="field min-h-[44px] w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="f-city" className="label">
                        {isEn ? "City" : isHi ? "शहर" : "शहर"}
                      </label>
                      <TransliteratedInput
                        id="f-city"
                        value={design.city}
                        onValueChange={(val) => set("city", val)}
                        onBlur={() => mark("city")}
                        placeholder={
                          isEn
                            ? "e.g. Pune"
                            : isHi
                              ? "उदा. पुणे"
                              : "उदा. पुणे"
                        }
                        aria-invalid={Boolean(showCity)}
                        aria-describedby={showCity ? "err-city" : undefined}
                        className="field min-h-[44px] w-full"
                      />
                      {showCity ? (
                        <p
                          id="err-city"
                          className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700"
                        >
                          {showCity}
                        </p>
                      ) : null}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="f-venue" className="label">
                        {isEn ? "Venue" : isHi ? "स्थान" : "स्थळ"}
                      </label>
                      <TransliteratedInput
                        id="f-venue"
                        required
                        value={design.venue}
                        onValueChange={(val) => set("venue", val)}
                        onBlur={() => mark("venue")}
                        placeholder={
                          isEn
                            ? "e.g. Shivneri Lawns, Baner"
                            : isHi
                              ? "उदा. शिवनेरी लॉन्स, बाणेर"
                              : "उदा. शिवनेरी लॉन्स, बाणेर"
                        }
                        aria-invalid={Boolean(showVenue)}
                        aria-describedby={showVenue ? "err-venue" : undefined}
                        className="field min-h-[44px] w-full"
                      />
                      {showVenue ? (
                        <p
                          id="err-venue"
                          className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700"
                        >
                          {showVenue}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </fieldset>

                {/* Host Details */}
                <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6 shadow-lg backdrop-blur-sm">
                  <legend className="rounded-full bg-gradient-to-r from-maroon-800 to-maroon-700 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase shadow-md">
                    {isEn
                      ? "4 · Host Details"
                      : isHi
                        ? "४ · निमंत्रक"
                        : "४ · यजमान ओळ"}
                  </legend>
                  <div className="mt-3">
                    <label htmlFor="f-host" className="label">
                      {isEn
                        ? "Invited By / Host Family"
                        : isHi
                          ? "निमंत्रक / परिवार"
                          : "यजमान / विनंती ओळ"}
                    </label>
                    <TransliteratedInput
                      id="f-host"
                      value={design.host}
                      onValueChange={(val) => set("host", val)}
                      onBlur={() => mark("host")}
                      placeholder={
                        isEn
                          ? "e.g. The Deshmukh & Kulkarni Families"
                          : isHi
                            ? "उदा. श्री. देशमुख एवं कुलकर्णी परिवार"
                            : "उदा. श्री. देशमुख व कुलकर्णी कुटुंबीय"
                      }
                      className="field min-h-[44px] w-full"
                    />
                  </div>
                </fieldset>

                {/* Advanced Typography Controls */}
                {activePanel === "text" && (
                  <fieldset className="rounded-2xl border border-purple-500/20 bg-purple-50/50 p-5 shadow-lg">
                    <legend className="rounded-full bg-gradient-to-r from-purple-700 to-indigo-800 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-ivory-100 uppercase shadow-md">
                      ⚙️{" "}
                      {isEn
                        ? "Advanced Typography"
                        : isHi
                          ? "उन्नत टाइपोग्राफी"
                          : "प्रगत टायपोग्राफी"}
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2 mt-3">
                      {/* Letter Spacing */}
                      <div>
                        <label className="label text-xs">
                          {isEn
                            ? "Letter Spacing"
                            : isHi
                              ? "अक्षर अंतराल"
                              : "अक्षर अंतर"}{" "}
                          — {letterSpacing}px
                        </label>
                        <input
                          type="range"
                          min={-2}
                          max={10}
                          step={0.5}
                          value={letterSpacing}
                          onChange={(e) =>
                            setLetterSpacing(Number(e.target.value))
                          }
                          className="w-full accent-purple-600"
                        />
                      </div>
                      {/* Line Height */}
                      <div>
                        <label className="label text-xs">
                          {isEn
                            ? "Line Height"
                            : isHi
                              ? "पंक्ति ऊंचाई"
                              : "ओळ उंची"}{" "}
                          — {lineHeight}
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={lineHeight}
                          onChange={(e) =>
                            setLineHeight(Number(e.target.value))
                          }
                          className="w-full accent-purple-600"
                        />
                      </div>
                      {/* Text Shadow Toggle */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setTextShadow((p) => !p)}
                          className={`relative h-7 w-12 rounded-full transition-colors ${textShadow ? "bg-purple-600" : "bg-ink-900/20"
                            }`}
                        >
                          <span
                            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${textShadow ? "translate-x-5" : "translate-x-0.5"
                              }`}
                          />
                        </button>
                        <span className="text-xs font-bold text-ink-700">
                          {isEn
                            ? "Text Shadow"
                            : isHi
                              ? "टेक्स्ट शैडो"
                              : "मजकूर सावली"}
                        </span>
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Smart Layout Alert */}
                {longName ? (
                  <div
                    aria-live="polite"
                    className="flex animate-fade-in items-start gap-3 rounded-xl border border-gold-500/40 bg-gold-400/10 px-4 py-3"
                  >
                    <Icon
                      name="sparkle"
                      className="mt-0.5 h-5 w-5 shrink-0 text-gold-600"
                    />
                    <p className="text-[13px] leading-relaxed text-ink-700">
                      <strong className="font-bold">
                        {isEn
                          ? "Smart Layout Active: "
                          : "स्मार्ट लेआउट सक्रिय: "}
                      </strong>
                      {isEn
                        ? "Due to longer names, the layout automatically adjusts typography to guarantee zero print clipping."
                        : "नाव मोठं असल्याने नाव-विभाग आपोआप २-प्लॅन लहान फॉन्टमध्ये बसवला जाईल — प्रिंट कधीच तुटणार नाही."}
                    </p>
                  </div>
                ) : null}

                {/* Quality Guard */}
                <section
                  aria-labelledby="guard-title"
                  className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6 shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      id="guard-title"
                      className="flex min-h-[24px] items-center gap-2 text-[13px] font-black tracking-wider text-ink-700 uppercase"
                    >
                      <Icon
                        name="shield"
                        className="h-4 w-4 text-maroon-700"
                      />{" "}
                      {isEn ? "Quality Guard" : "क्वालिटी गार्ड"}
                    </p>
                    <span
                      id="guard-summary"
                      aria-live="polite"
                      className={`text-[12px] font-bold ${allOk ? "text-leaf-700" : "text-gold-700"}`}
                    >
                      {isEn
                        ? `${doneCount}/${checks.length} Complete`
                        : `${toDevanagariDigits(doneCount)}/${toDevanagariDigits(checks.length)} पूर्ण`}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={
                      isEn
                        ? "Quality Guard progress"
                        : "क्वालिटी गार्ड प्रगती"
                    }
                    aria-valuemin={0}
                    aria-valuemax={checks.length}
                    aria-valuenow={doneCount}
                    className="mt-3 h-2 overflow-hidden rounded-full bg-ink-900/10"
                  >
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full rounded-full transition-[width] duration-700 ease-out ${allOk ? "bg-gradient-to-r from-leaf-500 to-paithani-light" : "bg-gradient-to-r from-gold-400 to-amber-500"}`}
                    />
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {checks.map((c) => (
                      <li
                        key={c.t}
                        className="flex min-h-[28px] items-center gap-2 text-[13px]"
                      >
                        <span
                          aria-hidden="true"
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all duration-300 ${c.ok ? "scale-100 bg-leaf-600/15 text-leaf-700" : "scale-95 bg-ink-900/8 text-ink-400"}`}
                        >
                          {c.ok ? (
                            <Icon
                              name="check"
                              className="h-2.5 w-2.5"
                              strokeWidth={3}
                            />
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-current" />
                          )}
                        </span>
                        <span
                          className={`transition-colors duration-300 ${c.ok ? "text-ink-700" : "text-ink-400"}`}
                        >
                          {c.t}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSaving || !allOk}
                    aria-describedby="guard-summary save-status"
                    className="inline-flex min-h-[48px] w-full sm:w-auto justify-center items-center gap-2.5 rounded-full bg-gradient-to-r from-maroon-800 to-maroon-700 px-8 py-3.5 text-[15px] font-bold text-ivory-100 shadow-xl transition-all enabled:hover:shadow-glow enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
                  >
                    {isSaving ? (
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-ivory-100/40 border-t-ivory-100"
                      />
                    ) : (
                      <Icon
                        name="check"
                        className="h-4 w-4 text-gold-300"
                        strokeWidth={2.4}
                      />
                    )}
                    {isSaving
                      ? isEn
                        ? "Saving…"
                        : isHi
                          ? "सहेजा जा रहा है…"
                          : "जतन होत आहे…"
                      : saveStatus === "saved"
                        ? isEn
                          ? "✓ Saved — Opening Workspace"
                          : isHi
                            ? "✓ सहेजा गया"
                            : "✓ जतन झालं"
                        : isEn
                          ? "Save & Open Workspace"
                          : isHi
                            ? "सहेजें और खोलें"
                            : "जतन करा व उघडा"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex min-h-[48px] w-full sm:w-auto justify-center items-center gap-2.5 rounded-full border-2 border-maroon-800/25 bg-white px-6 py-3.5 text-[15px] font-bold text-maroon-800 transition hover:border-gold-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
                  >
                    <Icon name="printer" className="h-5 w-5" />
                    {isEn ? "PDF / Print" : isHi ? "PDF / प्रिंट" : "PDF / प्रिंट"}
                  </button>
                  <span className="text-[12.5px] font-semibold text-ink-400 text-center sm:text-left">
                    {activeRupees} ·{" "}
                    {isEn
                      ? "Premium Template"
                      : isHi
                        ? "प्रीमियम टेम्प्लेट"
                        : "प्रीमियम टेम्पलेट"}
                  </span>
                </div>

                {/* Save Status */}
                <p
                  id="save-status"
                  aria-live="polite"
                  className="min-h-[20px] text-[12.5px] font-medium text-ink-500"
                >
                  {isSaving
                    ? isEn
                      ? "Secure save in progress…"
                      : isHi
                        ? "सुरक्षित सहेजना जारी…"
                        : "सुरक्षित जतन सुरू…"
                    : saveStatus === "saved"
                      ? isEn
                        ? "✓ Design saved — opening workspace."
                        : isHi
                          ? "✓ रचना सहेजी गई।"
                          : "✓ रचना जतन झाली."
                      : allOk
                        ? isEn
                          ? "All checks passed — ready to save."
                          : isHi
                            ? "सभी जांच पूरी — तैयार।"
                            : "सर्व तपासण्या पूर्ण — तयार."
                        : isEn
                          ? "Complete Quality Guard checks to enable save."
                          : isHi
                            ? "क्वालिटी गार्ड जांच पूरी करें।"
                            : "क्वालिटी गार्ड पूर्ण करा."}
                </p>

                {/* Error Display */}
                {saveError ? (
                  <div
                    role="alert"
                    className="flex animate-fade-in flex-wrap items-center justify-between gap-3 rounded-xl border border-maroon-700/30 bg-maroon-700/5 px-4 py-3"
                  >
                    <p className="text-[13.5px] font-semibold text-maroon-800">
                      {saveError}
                    </p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-maroon-800 px-5 py-2.5 text-[13.5px] font-bold text-ivory-100 transition hover:bg-maroon-700"
                    >
                      {isEn
                        ? "Retry"
                        : isHi
                          ? "पुनः प्रयास"
                          : "पुन्हा प्रयत्न"}
                    </button>
                  </div>
                ) : null}
              </form>
            )}
          </div>

          {/* ─── MOBILE EFFECTS PANEL ───────────────────────────────────── */}
          {mobileTab === "effects" && (
            <div className="lg:hidden animate-fade-in space-y-4">
              {/* Quick Effects */}
              <div className="rounded-2xl border border-purple-500/20 bg-white/80 p-4 shadow-lg">
                <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <span>✨</span>
                  {isEn
                    ? "Quick Effects"
                    : isHi
                      ? "त्वरित इफेक्ट्स"
                      : "जलद इफेक्ट्स"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {EFFECTS_LIBRARY.map((effect) => (
                    <button
                      key={effect.id}
                      type="button"
                      onClick={() => toggleEffect(effect.id)}
                      className={`flex flex-col items-center gap-1 min-h-[60px] rounded-xl p-2 transition-all ${selectedEffects.includes(effect.id)
                          ? "bg-purple-100 ring-2 ring-purple-500 shadow-md"
                          : "bg-ink-900/5 hover:bg-ink-900/10"
                        }`}
                    >
                      <span className="text-xl">{effect.icon}</span>
                      <span className="text-[9px] font-bold text-ink-700 text-center leading-tight">
                        {isEn
                          ? effect.name.en
                          : isHi
                            ? effect.name.hi
                            : effect.name.mr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Transform */}
              <div className="rounded-2xl border border-maroon-900/10 bg-white/80 p-4 shadow-lg">
                <h3 className="text-sm font-bold text-maroon-800 mb-3 flex items-center gap-2">
                  <span>🔄</span>
                  {isEn
                    ? "Transform"
                    : isHi
                      ? "ट्रांसफॉर्म"
                      : "ट्रान्सफॉर्म"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-ink-600">
                      {isEn ? "Scale" : "स्केल"} — {customScale}%
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={customScale}
                      onChange={(e) => setCustomScale(Number(e.target.value))}
                      className="w-full accent-maroon-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-600">
                      {isEn ? "Rotation" : "रोटेशन"} — {customRotation}°
                    </label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={customRotation}
                      onChange={(e) =>
                        setCustomRotation(Number(e.target.value))
                      }
                      className="w-full accent-maroon-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink-600">
                      {isEn ? "Opacity" : "अपारदर्शिता"} — {customOpacity}%
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={customOpacity}
                      onChange={(e) =>
                        setCustomOpacity(Number(e.target.value))
                      }
                      className="w-full accent-maroon-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── LIVE PREVIEW PANEL ─────────────────────────────────────── */}
          <section
            id="studio-preview"
            aria-label={
              isEn ? "Live preview" : isHi ? "लाइव प्रिव्यू" : "थेट प्रिव्ह्यू"
            }
            ref={previewRef}
            className={`animate-fade-up lg:sticky lg:top-28 lg:self-start ${mobileTab === "preview" ? "block" : "hidden lg:block"
              }`}
            style={{ animationDelay: "140ms" }}
          >
            {/* Preview Header */}
            <div className="flex min-h-[32px] items-center justify-between gap-2 mb-3">
              <p className="label mb-0 flex items-center gap-2">
                <span className="text-base">👁️</span>
                {isEn ? "Live Preview" : "लाइव्ह प्रिव्ह्यू"}
              </p>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-leaf-600/10 px-2.5 py-1 text-[10px] font-bold text-leaf-700 ring-1 ring-leaf-600/25">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-leaf-600"
                  />{" "}
                  60 FPS
                </span>
                {animationType !== "none" && (
                  <span className="flex items-center gap-1 rounded-full bg-purple-600/10 px-2 py-1 text-[10px] font-bold text-purple-700 ring-1 ring-purple-600/25">
                    🎬 {animationType}
                  </span>
                )}
              </div>
            </div>

            {/* Preview Card Container */}
            <div className="rounded-2xl bg-gradient-to-br from-paisley-dark to-maroon-950 p-6 shadow-2xl sm:p-10 relative overflow-hidden">
              {/* Particle Effect Overlay */}
              {particleEffect !== "none" && (
                <div
                  className={`absolute inset-0 pointer-events-none z-10 ${particleEffect === "petals"
                      ? "animate-petals"
                      : particleEffect === "sparkles"
                        ? "animate-sparkles"
                        : particleEffect === "confetti"
                          ? "animate-confetti"
                          : particleEffect === "stars"
                            ? "animate-stars"
                            : particleEffect === "hearts"
                              ? "animate-hearts"
                              : particleEffect === "snow"
                                ? "animate-snow"
                                : particleEffect === "fireflies"
                                  ? "animate-fireflies"
                                  : particleEffect === "diyas"
                                    ? "animate-diyas"
                                    : ""
                    }`}
                />
              )}

              {/* Background Style Overlay */}
              {backgroundStyle === "aurora" && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 animate-aurora pointer-events-none" />
              )}
              {backgroundStyle === "animated-gradient" && (
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-maroon-500/5 to-gold-500/5 animate-gradient-x bg-[length:200%_100%] pointer-events-none" />
              )}

              {/* Card Preview with Transforms */}
              <div
                style={previewTransformStyle}
                className={`relative z-20 ${showAnimationPreview
                    ? `animate-${animationType}`
                    : ""
                  }`}
              >
                <div aria-live="polite">
                  <InvitationCard
                    design={design}
                    id="print-card"
                    className="mx-auto max-w-[380px]"
                  />
                </div>
              </div>

              {/* Empty State */}
              {previewEmpty ? (
                <div className="mx-auto mt-5 max-w-[380px] rounded-xl border border-gold-400/25 bg-ivory-100/5 px-4 py-3 text-center relative z-20">
                  <p className="text-[13px] font-bold text-gold-200">
                    {isEn
                      ? "Fill in more details"
                      : "अजून तपशील भरा"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ivory-100/60">
                    {isEn
                      ? "Preview auto-renders as you type."
                      : "टायप करताच प्रिव्ह्यू जुळेल."}
                  </p>
                </div>
              ) : null}

              {/* WYSIWYP Footer */}
              <p className="mt-6 text-center text-[10px] tracking-[0.2em] text-gold-300/50 uppercase relative z-20">
                {isEn
                  ? "WYSIWYP — What You See Is What You Print"
                  : "WYSIWYP — जे दिसतंय, तेच छापलं जाईल"}
              </p>

              {/* Quick Actions */}
              <div className="mt-4 flex justify-center gap-2 relative z-20">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-gold-400/40 px-4 py-2 text-[12px] font-bold text-gold-200 transition hover:border-gold-300 hover:text-gold-100 hover:bg-gold-500/10"
                >
                  <Icon name="printer" className="h-3.5 w-3.5" />
                  {isEn ? "Print" : "प्रिंट"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnimationPreview((p) => !p)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-purple-400/40 px-4 py-2 text-[12px] font-bold text-purple-200 transition hover:border-purple-300 hover:text-purple-100 hover:bg-purple-500/10"
                >
                  <span>🎬</span>
                  {showAnimationPreview
                    ? isEn
                      ? "Stop"
                      : "थांबवा"
                    : isEn
                      ? "Animate"
                      : "अ‍ॅनिमेट"}
                </button>
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-maroon-900/10 bg-white/70 px-4 py-3 shadow-sm">
              <Icon
                name="eye"
                className="mt-0.5 h-4 w-4 shrink-0 text-maroon-700"
              />
              <p className="text-[12px] leading-relaxed text-ink-500">
                {activeTemplate
                  ? `${isEn ? activeTemplate.en : activeTemplate.name} · `
                  : ""}
                {isEn
                  ? "Live preview updates at 60 FPS as you type."
                  : "प्रत्येक अक्षर बदलताच प्रिव्ह्यू जुळतो."}
                {animationType !== "none" &&
                  ` · 🎬 ${animationType} · ${animationDuration}ms`}
                {particleEffect !== "none" && ` · ✨ ${particleEffect}`}
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          GLOBAL ANIMATION STYLES (injected via <style>)
      ═══════════════════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        /* Premium Animation Keyframes */
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes zoom-out {
          from {
            opacity: 0;
            transform: scale(1.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes rotate-in {
          from {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(0) scale(1);
          }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes elastic {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          55% {
            opacity: 1;
            transform: scale(1.1);
          }
          75% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes flip-x {
          from {
            opacity: 0;
            transform: perspective(400px) rotateX(90deg);
          }
          to {
            opacity: 1;
            transform: perspective(400px) rotateX(0);
          }
        }
        @keyframes blur-in {
          from {
            opacity: 0;
            filter: blur(20px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow:
              0 0 40px rgba(255, 215, 0, 0.6),
              0 0 80px rgba(255, 215, 0, 0.3);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes swing {
          20% {
            transform: rotate(15deg);
          }
          40% {
            transform: rotate(-10deg);
          }
          60% {
            transform: rotate(5deg);
          }
          80% {
            transform: rotate(-5deg);
          }
          100% {
            transform: rotate(0);
          }
        }
        @keyframes heartbeat {
          0%,
          100% {
            transform: scale(1);
          }
          14% {
            transform: scale(1.1);
          }
          28% {
            transform: scale(1);
          }
          42% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(1);
          }
        }
        @keyframes jello {
          0%,
          100% {
            transform: skewX(0) skewY(0);
          }
          30% {
            transform: skewX(-12deg) skewY(-12deg);
          }
          40% {
            transform: skewX(8deg) skewY(8deg);
          }
          50% {
            transform: skewX(-4deg) skewY(-4deg);
          }
          65% {
            transform: skewX(2deg) skewY(2deg);
          }
          75% {
            transform: skewX(-1deg) skewY(-1deg);
          }
        }
        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        /* Particle Animations */
        @keyframes petals {
          0% {
            transform: translateY(-10%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes sparkles {
          0%,
          100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fireflies {
          0%,
          100% {
            opacity: 0;
            transform: translate(0, 0);
          }
          25% {
            opacity: 1;
            transform: translate(10px, -20px);
          }
          50% {
            opacity: 0.8;
            transform: translate(-5px, -40px);
          }
          75% {
            opacity: 1;
            transform: translate(15px, -20px);
          }
        }
        @keyframes diyas {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        /* Aurora Background */
        @keyframes aurora {
          0%,
          100% {
            opacity: 0.3;
            transform: rotate(0deg) scale(1);
          }
          33% {
            opacity: 0.5;
            transform: rotate(1deg) scale(1.02);
          }
          66% {
            opacity: 0.4;
            transform: rotate(-1deg) scale(0.98);
          }
        }

        /* Animated Gradient */
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Background Scroll */
        @keyframes bg-scroll {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 60px 60px;
          }
        }

        /* Loading Bar */
        @keyframes loading-bar {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Animation Classes */
        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }
        .animate-fade-down {
          animation: fade-down 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoom-in 0.6s ease-out forwards;
        }
        .animate-zoom-out {
          animation: zoom-out 0.6s ease-out forwards;
        }
        .animate-slide-left {
          animation: slide-left 0.6s ease-out forwards;
        }
        .animate-slide-right {
          animation: slide-right 0.6s ease-out forwards;
        }
        .animate-rotate-in {
          animation: rotate-in 0.8s ease-out forwards;
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out forwards;
        }
        .animate-elastic {
          animation: elastic 1s ease-out forwards;
        }
        .animate-flip-x {
          animation: flip-x 0.8s ease-out forwards;
        }
        .animate-blur-in {
          animation: blur-in 0.8s ease-out forwards;
        }
        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-swing {
          animation: swing 1s ease-in-out;
          transform-origin: top center;
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        .animate-jello {
          animation: jello 1s ease-in-out;
        }
        .animate-bg-scroll {
          animation: bg-scroll 20s linear infinite;
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
        .animate-aurora {
          animation: aurora 8s ease-in-out infinite;
        }
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
        }
        .animate-petals {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ctext x='0' y='15' font-size='12'%3E🌸%3C/text%3E%3C/svg%3E")
            repeat;
          animation: petals 8s linear infinite;
          opacity: 0.6;
        }
        .animate-sparkles {
          background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.3) 1px,
            transparent 1px
          );
          background-size: 30px 30px;
          animation: sparkles 2s ease-in-out infinite;
        }
        .animate-fireflies {
          background: radial-gradient(
            circle,
            rgba(255, 255, 100, 0.4) 2px,
            transparent 2px
          );
          background-size: 50px 50px;
          animation: fireflies 4s ease-in-out infinite;
        }
        .animate-diyas {
          background: radial-gradient(
            circle,
            rgba(255, 150, 50, 0.3) 3px,
            transparent 3px
          );
          background-size: 40px 40px;
          animation: diyas 2s ease-in-out infinite;
        }

        /* Stagger animation for grid children */
        .stagger > * {
          opacity: 0;
          animation: fade-up 0.5s ease-out forwards;
        }

        /* Premium shadow utilities */
        .shadow-glow {
          box-shadow:
            0 0 20px rgba(255, 215, 0, 0.3),
            0 0 40px rgba(255, 215, 0, 0.1);
        }
        .shadow-luxe {
          box-shadow:
            0 10px 40px -10px rgba(0, 0, 0, 0.3),
            0 2px 10px -2px rgba(0, 0, 0, 0.1);
        }
        .shadow-card {
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 215, 0, 0.05);
        }
        .shadow-2xs {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Pulse dot animation */
        .animate-pulse-dot {
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
        }

        /* Premium scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(128, 0, 32, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 0, 32, 0.5);
        }
      `}</style>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// VIDEO STUDIO SECTION COMPONENT
// ═════════════════════════════════════════════════════════════════════════════════
function VideoStudioSection({
  design,
  animationType,
  setAnimationType,
  particleEffect,
  setParticleEffect,
  animationDuration,
  setAnimationDuration,
  autoPlayAnimation,
  setAutoPlayAnimation,
  exportFormat,
  setExportFormat,
  handleExport,
  isEn,
  isHi,
  previewRef,
  previewTransformStyle,
  lang,
}: {
  design: DesignData;
  animationType: AnimationType;
  setAnimationType: (v: AnimationType) => void;
  particleEffect: ParticleEffect;
  setParticleEffect: (v: ParticleEffect) => void;
  animationDuration: number;
  setAnimationDuration: (v: number) => void;
  autoPlayAnimation: boolean;
  setAutoPlayAnimation: (v: boolean) => void;
  exportFormat: "pdf" | "png" | "mp4" | "gif" | "webp";
  setExportFormat: (v: "pdf" | "png" | "mp4" | "gif" | "webp") => void;
  handleExport: () => void;
  isEn: boolean;
  isHi: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
  previewTransformStyle: React.CSSProperties;
  lang: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(5000);
  const [scenes, setScenes] = useState([
    {
      id: 1,
      name: isEn ? "Opening" : isHi ? "शुरुआत" : "सुरुवात",
      animation: "fade-in" as AnimationType,
      duration: 1500,
    },
    {
      id: 2,
      name: isEn ? "Main Card" : isHi ? "मुख्य कार्ड" : "मुख्य कार्ड",
      animation: "zoom-in" as AnimationType,
      duration: 2000,
    },
    {
      id: 3,
      name: isEn ? "Closing" : isHi ? "समापन" : "शेवट",
      animation: "fade-up" as AnimationType,
      duration: 1500,
    },
  ]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
      {/* Video Timeline Editor */}
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/90 to-maroon-950/90 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ivory-100 flex items-center gap-2">
              <span>🎬</span>
              {isEn
                ? "Video Timeline"
                : isHi
                  ? "वीडियो टाइमलाइन"
                  : "व्हिडिओ टाइमलाइन"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-ivory-100/60">
                {(totalDuration / 1000).toFixed(1)}s
              </span>
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300 ring-1 ring-red-500/30">
                REC
              </span>
            </div>
          </div>

          {/* Timeline Track */}
          <div className="relative h-20 rounded-xl bg-ivory-100/5 overflow-hidden border border-ivory-100/10">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="absolute top-2 bottom-2 rounded-lg flex items-center justify-center text-[10px] font-bold text-ivory-100 border border-ivory-100/20 cursor-pointer hover:brightness-110 transition"
                style={{
                  left: `${(scenes.slice(0, idx).reduce((a, s) => a + s.duration, 0) / totalDuration) * 100}%`,
                  width: `${(scene.duration / totalDuration) * 100}%`,
                  background: `linear-gradient(135deg, hsl(${idx * 60 + 270}, 70%, 40%), hsl(${idx * 60 + 300}, 70%, 30%))`,
                }}
              >
                <div className="text-center">
                  <div>{scene.name}</div>
                  <div className="text-[8px] opacity-60">{scene.animation}</div>
                </div>
              </div>
            ))}
            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gold-400 shadow-glow z-10 transition-all"
              style={{
                left: `${(currentTime / totalDuration) * 100}%`,
              }}
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setCurrentTime(0)}
              className="grid h-10 w-10 place-items-center rounded-full bg-ivory-100/10 text-ivory-100 hover:bg-ivory-100/20 transition"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r from-gold-500 to-amber-500 text-maroon-950 shadow-lg hover:shadow-glow transition-all hover:scale-105"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              onClick={() => setCurrentTime(totalDuration)}
              className="grid h-10 w-10 place-items-center rounded-full bg-ivory-100/10 text-ivory-100 hover:bg-ivory-100/20 transition"
            >
              ⏭
            </button>
          </div>

          {/* Time Slider */}
          <input
            type="range"
            min={0}
            max={totalDuration}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full mt-3 accent-gold-500"
          />
        </div>

        {/* Scene Editor */}
        <div className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 shadow-lg">
          <h3 className="text-sm font-bold text-ink-800 mb-3 flex items-center gap-2">
            <span>🎞️</span>
            {isEn
              ? "Scene Configuration"
              : isHi
                ? "दृश्य कॉन्फ़िगरेशन"
                : "दृश्य कॉन्फिगरेशन"}
          </h3>
          <div className="space-y-3">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="flex items-center gap-3 rounded-xl bg-ink-900/5 p-3"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                  {scene.id}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-ink-700">
                    {scene.name}
                  </div>
                  <div className="text-[10px] text-ink-400">
                    {scene.animation} · {scene.duration}ms
                  </div>
                </div>
                <select
                  value={scene.animation}
                  onChange={(e) => {
                    setScenes((prev) =>
                      prev.map((s) =>
                        s.id === scene.id
                          ? {
                            ...s,
                            animation: e.target.value as AnimationType,
                          }
                          : s
                      )
                    );
                  }}
                  className="text-[11px] rounded-lg border border-ink-900/10 bg-white px-2 py-1"
                >
                  <option value="fade-in">Fade In</option>
                  <option value="fade-up">Fade Up</option>
                  <option value="zoom-in">Zoom In</option>
                  <option value="slide-left">Slide Left</option>
                  <option value="rotate-in">Rotate</option>
                  <option value="bounce-in">Bounce</option>
                  <option value="elastic">Elastic</option>
                  <option value="blur-in">Blur In</option>
                </select>
                <input
                  type="number"
                  value={scene.duration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setScenes((prev) =>
                      prev.map((s) =>
                        s.id === scene.id ? { ...s, duration: val } : s
                      )
                    );
                    setTotalDuration(
                      scenes.reduce(
                        (a, s) => a + (s.id === scene.id ? val : s.duration),
                        0
                      )
                    );
                  }}
                  className="w-16 text-[11px] rounded-lg border border-ink-900/10 bg-white px-2 py-1 text-center"
                  min={500}
                  max={5000}
                  step={100}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setScenes((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  name: isEn
                    ? `Scene ${prev.length + 1}`
                    : `दृश्य ${toDevanagariDigits(prev.length + 1)}`,
                  animation: "fade-in",
                  duration: 1000,
                },
              ])
            }
            className="mt-3 w-full min-h-[40px] rounded-xl border-2 border-dashed border-purple-500/30 text-xs font-bold text-purple-700 hover:bg-purple-50 transition"
          >
            +{" "}
            {isEn
              ? "Add Scene"
              : isHi
                ? "दृश्य जोड़ें"
                : "दृश्य जोडा"}
          </button>
        </div>

        {/* Video Export Settings */}
        <div className="rounded-2xl border border-leaf-500/20 bg-white/70 p-5 shadow-lg">
          <h3 className="text-sm font-bold text-ink-800 mb-3 flex items-center gap-2">
            <span>📤</span>
            {isEn
              ? "Video Export Settings"
              : isHi
                ? "वीडियो एक्सपोर्ट सेटिंग्स"
                : "व्हिडिओ निर्यात सेटिंग्ज"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label text-xs">
                {isEn ? "Resolution" : isHi ? "रेज़ोल्यूशन" : "रिझोल्यूशन"}
              </label>
              <select className="field min-h-[40px] text-sm">
                <option>1080p (Full HD)</option>
                <option>720p (HD)</option>
                <option>4K (Ultra HD)</option>
                <option>1080x1920 (Reels/Shorts)</option>
                <option>1080x1080 (Square)</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">
                {isEn ? "Frame Rate" : "फ्रेम रेट"}
              </label>
              <select className="field min-h-[40px] text-sm">
                <option>30 FPS</option>
                <option>60 FPS</option>
                <option>24 FPS (Cinematic)</option>
              </select>
            </div>
          </div>
          <p
            role="status"
            className="mt-4 rounded-xl border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs font-bold text-gold-700"
          >
            {isEn
              ? "Video rendering is coming soon. For now use PDF export (Print) from the Export panel."
              : isHi
                ? "वीडियो रेंडरिंग जल्द आ रही है। अभी निर्यात पैनल से PDF (प्रिंट) का उपयोग करें।"
                : "व्हिडिओ रेंडरिंग लवकर येत आहे. सध्या निर्यात पॅनेलमधून PDF (प्रिंट) वापरा."}
          </p>
          <button
            type="button"
            disabled
            className="mt-4 flex w-full min-h-[48px] cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-ink-900/10 text-sm font-bold text-ink-400"
          >
            <span>🎬</span>
            {isEn
              ? "Render & Export Video"
              : isHi
                ? "वीडियो रेंडर और एक्सपोर्ट करें"
                : "व्हिडिओ रेंडर आणि निर्यात करा"}
          </button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="lg:sticky lg:top-28 lg:self-start space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-gray-950 to-gray-900 p-4 shadow-2xl border border-ivory-100/10">
          <div className="aspect-[9/16] max-h-[600px] mx-auto rounded-xl bg-black overflow-hidden relative flex items-center justify-center">
            {/* Preview Content */}
            <div
              style={previewTransformStyle}
              className={`w-full max-w-[280px] ${isPlaying ? `animate-${animationType}` : ""}`}
            >
              <InvitationCard
                design={design}
                className="mx-auto w-full"
              />
            </div>

            {/* Particle Overlay */}
            {particleEffect !== "none" && (
              <div
                className={`absolute inset-0 pointer-events-none ${particleEffect === "sparkles"
                    ? "animate-sparkles"
                    : particleEffect === "petals"
                      ? "animate-petals"
                      : particleEffect === "fireflies"
                        ? "animate-fireflies"
                        : ""
                  }`}
              />
            )}

            {/* Timecode Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="text-[10px] font-mono text-ivory-100/60 bg-black/50 px-2 py-0.5 rounded">
                {(currentTime / 1000).toFixed(1)}s /{" "}
                {(totalDuration / 1000).toFixed(1)}s
              </span>
              <span className="text-[10px] font-mono text-ivory-100/60 bg-black/50 px-2 py-0.5 rounded">
                1080p · 30fps
              </span>
            </div>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="rounded-2xl border border-maroon-900/10 bg-white/70 p-4 shadow-lg">
          <h4 className="text-xs font-bold text-ink-700 mb-2">
            {isEn
              ? "Quick Animation"
              : isHi
                ? "त्वरित एनिमेशन"
                : "जलद अ‍ॅनिमेशन"}
          </h4>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                "fade-in",
                "zoom-in",
                "bounce-in",
                "elastic",
                "rotate-in",
                "blur-in",
                "float",
                "heartbeat",
              ] as AnimationType[]
            ).map((anim) => (
              <button
                key={anim}
                type="button"
                onClick={() => setAnimationType(anim)}
                className={`min-h-[36px] rounded-lg text-[9px] font-bold transition ${animationType === anim
                    ? "bg-purple-600 text-white"
                    : "bg-ink-900/5 text-ink-600 hover:bg-ink-900/10"
                  }`}
              >
                {anim.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// EFFECTS LAB SECTION COMPONENT
// ═════════════════════════════════════════════════════════════════════════════════
function EffectsLabSection({
  design,
  selectedEffects,
  toggleEffect,
  customRotation,
  setCustomRotation,
  customScale,
  setCustomScale,
  customOpacity,
  setCustomOpacity,
  customBlur,
  setCustomBlur,
  borderRadius,
  setBorderRadius,
  textShadow,
  setTextShadow,
  isEn,
  isHi,
  lang,
  previewTransformStyle,
  previewRef,
}: {
  design: DesignData;
  selectedEffects: string[];
  toggleEffect: (id: string) => void;
  customRotation: number;
  setCustomRotation: (v: number) => void;
  customScale: number;
  setCustomScale: (v: number) => void;
  customOpacity: number;
  setCustomOpacity: (v: number) => void;
  customBlur: number;
  setCustomBlur: (v: number) => void;
  borderRadius: number;
  setBorderRadius: (v: number) => void;
  textShadow: boolean;
  setTextShadow: (v: boolean) => void;
  isEn: boolean;
  isHi: boolean;
  lang: string;
  previewTransformStyle: React.CSSProperties;
  previewRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
      {/* Effects Controls */}
      <div className="space-y-6 animate-fade-in">
        {/* Effects Library */}
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg">
          <h3 className="text-base font-bold text-purple-800 mb-4 flex items-center gap-2">
            <span>✨</span>
            {isEn
              ? "Premium Effects Library"
              : isHi
                ? "प्रीमियम इफेक्ट्स लाइब्रेरी"
                : "प्रीमियम इफेक्ट्स लायब्ररी"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EFFECTS_LIBRARY.map((effect) => {
              const active = selectedEffects.includes(effect.id);
              return (
                <button
                  key={effect.id}
                  type="button"
                  onClick={() => toggleEffect(effect.id)}
                  className={`group relative flex flex-col items-center gap-2 min-h-[90px] rounded-xl p-4 transition-all duration-300 ${active
                      ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg scale-[1.02] ring-2 ring-purple-400"
                      : "bg-white border border-ink-900/10 text-ink-700 hover:border-purple-300 hover:shadow-md hover:-translate-y-1"
                    }`}
                >
                  <span className="text-2xl">{effect.icon}</span>
                  <span className="text-[11px] font-bold text-center leading-tight">
                    {isEn
                      ? effect.name.en
                      : isHi
                        ? effect.name.hi
                        : effect.name.mr}
                  </span>
                  {active && (
                    <span className="absolute top-1.5 right-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold-400 text-[8px] font-black text-maroon-950">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transform Controls */}
        <div className="rounded-2xl border border-maroon-900/10 bg-white/70 p-6 shadow-lg">
          <h3 className="text-base font-bold text-ink-800 mb-4 flex items-center gap-2">
            <span>🔄</span>
            {isEn
              ? "Transform Controls"
              : isHi
                ? "ट्रांसफॉर्म कंट्रोल्स"
                : "ट्रान्सफॉर्म कंट्रोल्स"}
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Rotation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-700">
                  {isEn ? "Rotation" : isHi ? "रोटेशन" : "रोटेशन"}
                </label>
                <span className="text-[11px] font-mono text-ink-500">
                  {customRotation}°
                </span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={customRotation}
                onChange={(e) => setCustomRotation(Number(e.target.value))}
                className="w-full accent-maroon-700"
              />
              <div className="flex justify-between mt-1">
                {[-90, -45, 0, 45, 90, 180].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCustomRotation(v)}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${customRotation === v
                        ? "bg-maroon-100 text-maroon-700"
                        : "text-ink-400 hover:text-ink-600"
                      }`}
                  >
                    {v}°
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-700">
                  {isEn ? "Scale" : isHi ? "स्केल" : "स्केल"}
                </label>
                <span className="text-[11px] font-mono text-ink-500">
                  {customScale}%
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={200}
                value={customScale}
                onChange={(e) => setCustomScale(Number(e.target.value))}
                className="w-full accent-maroon-700"
              />
              <div className="flex justify-between mt-1">
                {[50, 75, 100, 125, 150].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCustomScale(v)}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${customScale === v
                        ? "bg-maroon-100 text-maroon-700"
                        : "text-ink-400 hover:text-ink-600"
                      }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-700">
                  {isEn ? "Opacity" : isHi ? "अपारदर्शिता" : "अपारदर्शकता"}
                </label>
                <span className="text-[11px] font-mono text-ink-500">
                  {customOpacity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={customOpacity}
                onChange={(e) => setCustomOpacity(Number(e.target.value))}
                className="w-full accent-maroon-700"
              />
            </div>

            {/* Blur */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-700">
                  {isEn ? "Blur" : isHi ? "धुंधला" : "-blur"}
                </label>
                <span className="text-[11px] font-mono text-ink-500">
                  {customBlur}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={customBlur}
                onChange={(e) => setCustomBlur(Number(e.target.value))}
                className="w-full accent-maroon-700"
              />
            </div>

            {/* Border Radius */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink-700">
                  {isEn
                    ? "Border Radius"
                    : isHi
                      ? "बॉर्डर रेडियस"
                      : "बॉर्डर रेडियस"}
                </label>
                <span className="text-[11px] font-mono text-ink-500">
                  {borderRadius}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full accent-maroon-700"
              />
            </div>

            {/* Text Shadow Toggle */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setTextShadow(!textShadow)}
                className={`relative h-7 w-12 rounded-full transition-colors ${textShadow ? "bg-maroon-700" : "bg-ink-900/20"
                  }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${textShadow ? "translate-x-5" : "translate-x-0.5"
                    }`}
                />
              </button>
              <span className="text-xs font-bold text-ink-700">
                {isEn
                  ? "Text Shadow"
                  : isHi
                    ? "टेक्स्ट शैडो"
                    : "मजकूर सावली"}
              </span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => {
              setCustomRotation(0);
              setCustomScale(100);
              setCustomOpacity(100);
              setCustomBlur(0);
              setBorderRadius(0);
              setTextShadow(false);
            }}
            className="mt-4 w-full min-h-[40px] rounded-xl border-2 border-dashed border-ink-900/20 text-xs font-bold text-ink-600 hover:bg-ink-900/5 transition"
          >
            🔄{" "}
            {isEn
              ? "Reset All Transforms"
              : isHi
                ? "सभी रीसेट करें"
                : "सर्व रीसेट करा"}
          </button>
        </div>

        {/* CSS Output */}
        <div className="rounded-2xl border border-ink-900/10 bg-gray-950 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-ivory-100 flex items-center gap-2">
              <span>💻</span>
              {isEn ? "Generated CSS" : isHi ? "जनरेटेड CSS" : "तयार CSS"}
            </h3>
            <button
              type="button"
              onClick={() => {
                const css = JSON.stringify(previewTransformStyle, null, 2);
                navigator.clipboard.writeText(css);
              }}
              className="text-[10px] font-bold text-gold-300 bg-gold-500/10 px-2.5 py-1 rounded-full hover:bg-gold-500/20 transition"
            >
              📋 Copy
            </button>
          </div>
          <pre className="text-[11px] text-green-400 font-mono overflow-x-auto bg-black/30 rounded-lg p-3 max-h-[200px] overflow-y-auto">
            {JSON.stringify(previewTransformStyle, null, 2)}
          </pre>
        </div>
      </div>

      {/* Effects Preview */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl bg-gradient-to-br from-paisley-dark to-maroon-950 p-6 shadow-2xl sm:p-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-ivory-100/70 uppercase tracking-wider">
              {isEn ? "Effects Preview" : "इफेक्ट्स प्रिव्ह्यू"}
            </p>
            <div className="flex gap-1.5">
              {selectedEffects.length > 0 && (
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                  {selectedEffects.length} effects
                </span>
              )}
            </div>
          </div>

          <div style={previewTransformStyle}>
            <InvitationCard
              design={design}
              className="mx-auto max-w-[350px]"
            />
          </div>

          {/* Active Effects List */}
          {selectedEffects.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedEffects.map((effectId) => {
                const effect = EFFECTS_LIBRARY.find(
                  (e) => e.id === effectId
                );
                return effect ? (
                  <span
                    key={effectId}
                    className="inline-flex items-center gap-1 rounded-full bg-ivory-100/10 px-2.5 py-1 text-[10px] font-bold text-ivory-100"
                  >
                    {effect.icon}{" "}
                    {isEn
                      ? effect.name.en
                      : isHi
                        ? effect.name.hi
                        : effect.name.mr}
                    <button
                      type="button"
                      onClick={() => toggleEffect(effectId)}
                      className="ml-1 text-ivory-100/50 hover:text-ivory-100"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}