"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiodataCard } from "@/components/biodata-card";
import { Icon } from "@/components/ui";
import { LangToggle } from "@/components/lang-toggle";
import { TransliteratedInput } from "@/components/ui/transliterated-input";
import { useLanguage } from "@/context/language-context";
import {
  type BiodataData,
  BIODATA_LABELS,
  BIODATA_PRESETS,
  BIODATA_TEMPLATES,
  DEFAULT_BIODATA_EN,
  DEFAULT_BIODATA_HI,
  DEFAULT_BIODATA_MR,
  formatBiodataAsWhatsAppText,
  SAMPLE_PORTRAITS,
} from "@/lib/biodata-data";
import { toDevanagariDigits } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
═══════════════════════════════════════════════════════════════ */
type SectionId = "personal" | "horoscope" | "career" | "family" | "contact" | "photo";

const STORAGE_KEY = "mazi-biodata-draft-v1";
const HISTORY_CAP = 60;

/* Fields that define completion for each section tab */
const SECTION_KEYS: Record<Exclude<SectionId, "photo">, (keyof BiodataData)[]> = {
  personal: ["fullName", "dob", "height"],
  horoscope: ["caste", "rashi", "gotra"],
  career: ["education", "occupation"],
  family: ["fatherName", "motherName"],
  contact: ["phone"],
};

/* Trilingual helper */
const L = (isEn: boolean, isHi: boolean, en: string, hi: string, mr: string) =>
  isEn ? en : isHi ? hi : mr;

/* ═══════════════════════════════════════════════════════════════
   Small premium primitives
═══════════════════════════════════════════════════════════════ */

/** Animated SVG completion ring */
function CompletionRing({
  value,
  size = 46,
  stroke = 4.5,
  label,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const done = value >= 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(120,20,40,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={done ? "#3e6b4f" : "url(#bdRing)"}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.2,.8,.3,1)" }}
        />
        <defs>
          <linearGradient id="bdRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7a24f" />
            <stop offset="1" stopColor="#8a1030" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-black text-maroon-800">
        {label ?? `${value}%`}
      </span>
    </div>
  );
}

/** Info tooltip for astrological / technical fields */
function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={text}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="grid size-4 place-items-center rounded-full bg-gold/20 text-[9px] font-black text-gold-deep ring-1 ring-gold/40 transition hover:bg-gold/40"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="animate-fade-in absolute bottom-full left-1/2 z-30 mb-1.5 w-52 -translate-x-1/2 rounded-lg bg-maroon-950 px-3 py-2 text-[11px] font-medium leading-snug text-ivory-100 shadow-xl ring-1 ring-gold/30"
        >
          {text}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-maroon-950" />
        </span>
      )}
    </span>
  );
}

/** Label + optional counter + optional tooltip */
function FieldLabel({
  children,
  required,
  counter,
  max,
  tip,
}: {
  children: React.ReactNode;
  required?: boolean;
  counter?: number;
  max?: number;
  tip?: string;
}) {
  const over = max != null && counter != null && counter > max;
  return (
    <div className="mb-1 flex items-center justify-between gap-2">
      <label className="label mb-0 flex items-center gap-1.5">
        {children}
        {required && <span className="text-maroon-600">*</span>}
        {tip && <InfoTip text={tip} />}
      </label>
      {counter != null && max != null && (
        <span className={`text-[10px] font-bold tabular-nums ${over ? "text-maroon-600" : "text-ink-400"}`}>
          {counter}/{max}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EDITOR
═══════════════════════════════════════════════════════════════ */
export function BiodataEditor() {
  const { lang, setLang, isEn, isHi } = useLanguage();
  const t = BIODATA_LABELS[lang] || BIODATA_LABELS.mr;

  /* ── Initial data (language default or restored draft) ── */
  const [data, setData] = useState<BiodataData>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...(lang === "en" ? DEFAULT_BIODATA_EN : lang === "hi" ? DEFAULT_BIODATA_HI : DEFAULT_BIODATA_MR), ...JSON.parse(raw) };
      } catch { /* ignore */ }
    }
    return lang === "en" ? DEFAULT_BIODATA_EN : lang === "hi" ? DEFAULT_BIODATA_HI : DEFAULT_BIODATA_MR;
  });

  /* ── UI state ── */
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [copiedWa, setCopiedWa] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [templateQuery, setTemplateQuery] = useState("");
  const [presetGender, setPresetGender] = useState<"all" | "groom" | "bride">("all");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  /* ── Undo / Redo history (debounced snapshots) ── */
  const historyRef = useRef<BiodataData[]>([data]);
  const pointerRef = useRef(0);
  const skipHistory = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (skipHistory.current) { skipHistory.current = false; return; }
    const id = setTimeout(() => {
      const stack = historyRef.current.slice(0, pointerRef.current + 1);
      stack.push(data);
      if (stack.length > HISTORY_CAP) stack.shift();
      historyRef.current = stack;
      pointerRef.current = stack.length - 1;
      setCanUndo(pointerRef.current > 0);
      setCanRedo(false);
    }, 300);
    return () => clearTimeout(id);
  }, [data]);

  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return;
    pointerRef.current -= 1;
    skipHistory.current = true;
    setData(historyRef.current[pointerRef.current]!);
    setCanUndo(pointerRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current += 1;
    skipHistory.current = true;
    setData(historyRef.current[pointerRef.current]!);
    setCanRedo(pointerRef.current < historyRef.current.length - 1);
    setCanUndo(true);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") { e.preventDefault(); handlePrint(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo]);

  /* ── Autosave (debounced) ── */
  useEffect(() => {
    setSaving(true);
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSavedAt(new Date());
      } catch { /* storage full / disabled */ }
      setSaving(false);
    }, 800);
    return () => clearTimeout(id);
  }, [data]);

  /* ── Sync blessing/title on language change ── */
  useEffect(() => {
    skipHistory.current = true;
    setData((prev) => ({
      ...prev,
      lang,
      blessing: lang === "en" ? "॥ Shri Ganeshaya Namah ॥" : "॥ श्री गणेशाय नमः ॥",
      title: prev.title || (lang === "en" ? "Marriage Biodata" : "विवाह बायोडाटा"),
    }));
  }, [lang]);

  /* ── Toast helper ── */
  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  /* ── Field setter ── */
  const setField = <K extends keyof BiodataData>(k: K, v: BiodataData[K]) =>
    setData((prev) => ({ ...prev, [k]: v }));

  /* ── Presets ── */
  const filteredPresets = useMemo(
    () => BIODATA_PRESETS.filter((p) => presetGender === "all" || p.data.gender === presetGender),
    [presetGender]
  );
  const handlePresetSelect = (presetId: string) => {
    const preset = BIODATA_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setData({ ...preset.data, lang, template: data.template });
      flash(L(isEn, isHi, "Profile loaded ✓", "प्रोफ़ाइल लोड हुई ✓", "प्रोफाईल लोड झाली ✓"));
    }
  };

  /* ── Photo handling ── */
  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      flash(L(isEn, isHi, "Please choose an image file", "कृपया छवि फ़ाइल चुनें", "कृपया प्रतिमा फाईल निवडा"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      flash(L(isEn, isHi, "Image too large (max 4 MB)", "छवि बहुत बड़ी (अधिकतम 4 MB)", "प्रतिमा खूप मोठी (कमाल 4 MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") setField("photoUrl", ev.target.result);
    };
    reader.readAsDataURL(file);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = "";
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  /* ── Share / export actions ── */
  const handlePrint = () => window.print();

  const handleCopyWhatsApp = async () => {
    const text = formatBiodataAsWhatsAppText(data);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2400);
  };

  const handleShareWhatsApp = () => {
    const text = formatBiodataAsWhatsAppText(data);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const handleNativeShare = async () => {
    const text = formatBiodataAsWhatsAppText(data);
    if (navigator.share) {
      try { await navigator.share({ title: data.title || "Biodata", text }); } catch { /* cancelled */ }
    } else {
      handleShareWhatsApp();
    }
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(data.fullName || "biodata").replace(/\s+/g, "-").toLowerCase()}-biodata.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash(L(isEn, isHi, "JSON downloaded ✓", "JSON डाउनलोड हुआ ✓", "JSON डाउनलोड झाले ✓"));
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result));
        if (parsed && typeof parsed === "object" && "fullName" in parsed) {
          setData({ ...data, ...parsed, lang });
          flash(L(isEn, isHi, "Biodata imported ✓", "बायोडाटा आयात हुआ ✓", "बायोडाटा आयात झाला ✓"));
        } else {
          flash(L(isEn, isHi, "Invalid biodata file", "अमान्य बायोडाटा फ़ाइल", "अवैध बायोडाटा फाईल"));
        }
      } catch {
        flash(L(isEn, isHi, "Could not parse JSON", "JSON पढ़ नहीं सका", "JSON वाचता आले नाही"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    const base = lang === "en" ? DEFAULT_BIODATA_EN : lang === "hi" ? DEFAULT_BIODATA_HI : DEFAULT_BIODATA_MR;
    skipHistory.current = true;
    setData({ ...base });
    historyRef.current = [{ ...base }];
    pointerRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
    setConfirmReset(false);
    flash(L(isEn, isHi, "Form cleared", "फ़ॉर्म साफ़ हुआ", "फॉर्म साफ झाला"));
  };

  /* ── Completion model ── */
  const isFilled = (k: keyof BiodataData) => {
    const v = data[k];
    return typeof v === "string" ? v.trim().length > 1 : Boolean(v);
  };
  const sectionDone = (sec: SectionId) => {
    if (sec === "photo") return Boolean(data.photoUrl);
    return SECTION_KEYS[sec].every(isFilled);
  };
  const sectionPct = (sec: SectionId) => {
    if (sec === "photo") return data.photoUrl ? 100 : 0;
    const keys = SECTION_KEYS[sec];
    return Math.round((keys.filter(isFilled).length * 100) / keys.length);
  };

  const sections: { id: SectionId; label: string; icon: string }[] = [
    { id: "personal", label: t.sectionPersonal, icon: "sparkle" },
    { id: "horoscope", label: t.sectionHoroscope, icon: "sun" },
    { id: "career", label: t.sectionCareer, icon: "briefcase" },
    { id: "family", label: t.sectionFamily, icon: "users" },
    { id: "contact", label: t.sectionContact, icon: "phone" },
    { id: "photo", label: isEn ? "Photo & Style" : isHi ? "फोटो व शैली" : "फोटो व शैली", icon: "camera" },
  ];

  const overallPct = useMemo(() => {
    const all = [...SECTION_KEYS.personal, ...SECTION_KEYS.horoscope, ...SECTION_KEYS.career, ...SECTION_KEYS.family, ...SECTION_KEYS.contact];
    return Math.round((all.filter(isFilled).length * 100) / all.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const filledCount = useMemo(
    () => Object.values(data).filter((v) => (typeof v === "string" ? v.trim().length > 1 : Boolean(v))).length,
    [data]
  );

  const filteredTemplates = useMemo(
    () =>
      BIODATA_TEMPLATES.filter((tpl) => {
        if (!templateQuery.trim()) return true;
        const q = templateQuery.toLowerCase();
        return [tpl.name, tpl.nameEn, tpl.nameHi, tpl.desc, tpl.descEn].some((s) => s?.toLowerCase().includes(q));
      }),
    [templateQuery]
  );

  /* ── Astro tooltip copy ── */
  const tips = {
    gotra: L(isEn, isHi, "Ancestral lineage/clan used for matchmaking compatibility.", "वंश/कुल — वैवाहिक मिलान हेतु पूर्वज परंपरा.", "वंश/कुळ — वैवाहिक जुळवणीसाठी पूर्वज परंपरा."),
    rashi: L(isEn, isHi, "Moon sign at birth — one of the 12 zodiac signs.", "जन्म समय की चंद्र राशि — 12 राशियों में से एक.", "जन्माची चंद्र राशी — १२ राशींपैकी एक."),
    nakshatra: L(isEn, isHi, "Birth star — one of 27 lunar mansions.", "जन्म नक्षत्र — 27 चंद्र नक्षत्रों में से एक.", "जन्म नक्षत्र — २७ चंद्र नक्षत्रांपैकी एक."),
    mangal: L(isEn, isHi, "Mars placement indicating Manglik dosha status.", "मंगल दोष की स्थिति बताने वाला मंगल ग्रह.", "मंगळ दोषाची स्थिती दर्शवणारे मंगळ ग्रह."),
    gan: L(isEn, isHi, "Temperament category: Dev, Manushya or Rakshas.", "स्वभाव गण: देव, मनुष्य या राक्षस.", "स्वभाव गण: देव, मनुष्य वा राक्षस."),
    nadi: L(isEn, isHi, "Pulse category (Adya/Madhya/Antya) for compatibility.", "नाड़ी वर्ग (आद्य/मध्य/अंत्य) — जुळवणीसाठी.", "नाडी वर्ग (आद्य/मध्य/अंत्य) — जुळवणीसाठी."),
  };

  const inputCls = "input";

  return (
    <div className="relative">
      {/* ══ Toast ══ */}
      {toast && (
        <div className="animate-fade-in fixed left-1/2 top-24 z-[80] -translate-x-1/2 rounded-full bg-maroon-950 px-5 py-2.5 text-sm font-bold text-gold-200 shadow-2xl ring-1 ring-gold/40">
          {toast}
        </div>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_460px]">
        {/* ══ Mobile tab toggle ══ */}
        <div className="col-span-full -mb-4 flex rounded-xl border border-maroon-900/10 bg-white/80 p-1 shadow-2xs lg:hidden">
          <button type="button" onClick={() => setMobileTab("edit")}
            className={`flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition ${mobileTab === "edit" ? "bg-maroon-800 text-ivory-100 shadow-sm" : "text-ink-700 hover:text-ink-900"
              }`}>
            <Icon name="sparkle" className="h-4 w-4" />
            {isEn ? "Edit Biodata" : isHi ? "बायोडाटा भरें" : "बायोडाटा भरा"}
          </button>
          <button type="button" onClick={() => setMobileTab("preview")}
            className={`flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-bold transition ${mobileTab === "preview" ? "bg-maroon-800 text-ivory-100 shadow-sm" : "text-ink-700 hover:text-ink-900"
              }`}>
            <Icon name="eye" className="h-4 w-4" />
            {isEn ? "Live Preview" : isHi ? "लाइव प्रिव्यू" : "थेट प्रिव्ह्यू"}
            <span className="rounded-full bg-gold-500/25 px-1.5 text-[9px] font-black text-gold-deep">{overallPct}%</span>
          </button>
        </div>

        {/* ══════════ LEFT: FORM ══════════ */}
        <div className={`min-w-0 animate-fade-up ${mobileTab === "edit" ? "block" : "hidden lg:block"}`}>
          {/* ── Sticky editor toolbar ── */}
          <div className="sticky top-[68px] z-30 mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gold-500/30 bg-white/85 px-3.5 py-2.5 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <CompletionRing value={overallPct} size={42} />
              <div className="leading-tight">
                <p className="text-[13px] font-bold text-ink-800">
                  {overallPct >= 100
                    ? L(isEn, isHi, "Biodata complete! 🎉", "बायोडाटा पूर्ण! 🎉", "बायोडाटा पूर्ण! 🎉")
                    : L(isEn, isHi, "Building biodata…", "बायोडाटा बन रहा है…", "बायोडाटा तयार होत आहे…")}
                </p>
                <p className="text-[10.5px] text-ink-400">
                  {filledCount} {L(isEn, isHi, "fields filled", "फ़ील्ड भरे", "फिल्ड भरल्या")}
                  {savedAt && (
                    <span className="ml-1.5 inline-flex items-center gap-1 text-emerald-600">
                      <span className={`size-1.5 rounded-full ${saving ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`} />
                      {saving ? L(isEn, isHi, "Saving…", "सहेजना…", "जतन…") : L(isEn, isHi, "Auto-saved", "स्वतः सहेजा", "आपोआप जतन")}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href="/biodata/editor"
                target="_blank"
                rel="noopener noreferrer"
                title={L(isEn, isHi, "Open in New Tab (Full View Mode)", "नए टैब में पूर्ण स्क्रीन खोलें", "नवीन टॅबमध्ये पूर्ण स्क्रीन उघडा")}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:brightness-110 transition active:scale-95"
              >
                <span>⤢</span>
                <span className="hidden sm:inline">
                  {L(isEn, isHi, "Full View (New Tab)", "पूर्ण स्क्रीन (New Tab)", "पूर्ण स्क्रीन (New Tab)")}
                </span>
              </a>
              <button type="button" onClick={undo} disabled={!canUndo} title={L(isEn, isHi, "Undo (Ctrl+Z)", "पूर्ववत (Ctrl+Z)", "पूर्ववत (Ctrl+Z)")}
                className="grid size-9 place-items-center rounded-lg bg-ink-900/5 text-ink-600 transition hover:bg-ink-900/10 disabled:opacity-30">
                <Icon name="undo" className="h-4 w-4" />
              </button>
              <button type="button" onClick={redo} disabled={!canRedo} title={L(isEn, isHi, "Redo (Ctrl+Y)", "फिर से (Ctrl+Y)", "पुन्हा (Ctrl+Y)")}
                className="grid size-9 place-items-center rounded-lg bg-ink-900/5 text-ink-600 transition hover:bg-ink-900/10 disabled:opacity-30">
                <Icon name="redo" className="h-4 w-4" />
              </button>
              <div className="mx-1 h-6 w-px bg-ink-900/10" />
              <button type="button" onClick={() => setConfirmReset(true)} title={L(isEn, isHi, "Clear form", "फ़ॉर्म साफ़ करें", "फॉर्म साफ करा")}
                className="grid size-9 place-items-center rounded-lg bg-ink-900/5 text-maroon-700 transition hover:bg-maroon-700/10">
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Language bar ── */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-maroon-900/10 bg-white/70 p-3.5 shadow-2xs sm:p-4">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-gold/20 text-base font-bold text-maroon">🌐</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-ink-800">
                    {isEn ? "Biodata Language" : isHi ? "बायोडाटा भाषा" : "बायोडाटा भाषा"}
                  </span>
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-ink ring-1 ring-gold/30">
                    {isEn ? "English" : isHi ? "हिंदी" : "मराठी"}
                  </span>
                </div>
                <p className="text-[12px] text-ink-500">
                  {L(isEn, isHi,
                    "Phonetic typing: write in English letters, get Devanagari.",
                    "ध्वन्यात्मक टाइपिंग: अंग्रेज़ी अक्षरों से हिंदी पाएँ।",
                    "इंग्रजीत टाइप करा — आपोआप मराठी रूपांतर होईल.")}
                </p>
              </div>
            </div>
            <LangToggle lang={lang} onChange={(next) => setLang(next)} />
          </div>

          {/* ── Presets (gender-filtered) ── */}
          <div className="mb-6 rounded-2xl border border-gold-500/30 bg-gradient-to-r from-gold-500/10 via-ivory-warm to-gold-500/5 p-4 shadow-2xs">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gold-deep">
                  ✨ {L(isEn, isHi, "Quick-Start Profiles", "पूर्व-निर्मित प्रोफाइल", "पूर्व-डिझाइन प्रोफाईल")}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-600">
                  {L(isEn, isHi, "Load a realistic groom or bride biodata in one click.", "एक क्लिक में वर/वधू का प्रामाणिक विवरण भरें।", "एका क्लिकवर वर/वधूचा वास्तववादी तपशील भरा.")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex overflow-hidden rounded-xl border border-gold-500/40">
                  {(["all", "groom", "bride"] as const).map((g) => (
                    <button key={g} type="button" onClick={() => setPresetGender(g)}
                      className={`min-h-[40px] px-3 text-xs font-bold transition ${presetGender === g ? "bg-maroon-800 text-ivory-100" : "bg-white text-ink-600 hover:bg-gold/10"
                        }`}>
                      {g === "all" ? L(isEn, isHi, "All", "सभी", "सर्व") : g === "groom" ? "🤵" : "👰"}
                    </button>
                  ))}
                </div>
                <select aria-label={t.presetSelect} onChange={(e) => handlePresetSelect(e.target.value)} defaultValue=""
                  className="min-h-[40px] rounded-xl border border-gold-500/40 bg-white px-3 py-1.5 text-xs font-bold text-maroon shadow-xs focus:ring-2 focus:ring-gold-500">
                  <option value="" disabled>{t.presetSelect}</option>
                  {filteredPresets.map((p) => (
                    <option key={p.id} value={p.id}>{isEn ? p.labelEn : isHi ? p.labelHi : p.labelMr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Template gallery with search ── */}
          <fieldset className="mb-6">
            <legend className="label mb-2 flex items-center justify-between">
              <span>
                {L(isEn, isHi,
                  `1. Premium Template · ${BIODATA_TEMPLATES.length} Designs`,
                  `१. प्रीमियम टेम्पलेट · ${toDevanagariDigits(BIODATA_TEMPLATES.length)} डिजाइन`,
                  `१. प्रीमियम टेम्पलेट · ${toDevanagariDigits(BIODATA_TEMPLATES.length)} डिझाइन्स`)}
              </span>
              <span className="text-[11px] font-normal text-gold-deep">
                {L(isEn, isHi, "Royal print quality", "शाही प्रिंट गुणवत्ता", "१००% राजेशाही क्वालिटी")}
              </span>
            </legend>

            {BIODATA_TEMPLATES.length > 6 && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-maroon-900/10 bg-white/70 px-3 py-2">
                <Icon name="search" className="h-4 w-4 text-ink-400" />
                <input value={templateQuery} onChange={(e) => setTemplateQuery(e.target.value)}
                  placeholder={L(isEn, isHi, "Search templates…", "टेम्पलेट खोजें…", "टेम्पलेट शोधा…")}
                  className="w-full bg-transparent text-xs text-ink-800 outline-none placeholder:text-ink-400" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredTemplates.map((tpl) => {
                const selected = data.template === tpl.id;
                return (
                  <button key={tpl.id} type="button" onClick={() => setField("template", tpl.id)}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border-2 p-3.5 text-left transition-all duration-200 ${selected ? "scale-[1.02] border-gold-500 shadow-glow" : "border-maroon-900/15 hover:border-gold-400/60"
                      }`}
                    style={{ background: tpl.bgGradient }}>
                    <div className="flex items-center justify-between">
                      <span className="size-3.5 rounded-full border border-white/40" style={{ background: tpl.accentColor }} />
                      {selected && (
                        <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-maroon-950">
                          ✓ {isEn ? "Active" : "सक्रिय"}
                        </span>
                      )}
                    </div>
                    <div className="mt-5">
                      <p className="font-marathi-display text-sm font-bold text-ivory-100">
                        {isEn ? tpl.nameEn : isHi ? tpl.nameHi : tpl.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[10.5px] leading-tight text-ivory-100/70">
                        {isEn ? tpl.descEn : isHi ? tpl.descHi : tpl.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
              {filteredTemplates.length === 0 && (
                <p className="col-span-full py-6 text-center text-sm text-ink-400">
                  {L(isEn, isHi, "No templates match your search.", "कोई टेम्पलेट नहीं मिला.", "कोणतेही टेम्पलेट सापडले नाही.")}
                </p>
              )}
            </div>
          </fieldset>

          {/* ── Section tabs with completion dots ── */}
          <div className="mb-4 flex flex-wrap gap-1.5 border-b border-maroon-900/15 pb-2">
            {sections.map((sec) => {
              const active = activeSection === sec.id;
              const done = sectionDone(sec.id);
              const pct = sectionPct(sec.id);
              return (
                <button key={sec.id} type="button" onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${active ? "bg-maroon-800 text-ivory-100 shadow-xs" : "bg-white/70 text-ink-700 hover:bg-gold/15 hover:text-maroon"
                    }`}>
                  <span>{sec.label}</span>
                  <span className={`grid size-4 place-items-center rounded-full text-[8px] font-black ${done ? "bg-emerald-500 text-white" : pct > 0 ? "bg-gold-500 text-maroon-950" : active ? "bg-ivory-100/25 text-ivory-100" : "bg-ink-900/10 text-ink-500"
                    }`}>
                    {done ? "✓" : pct > 0 ? "…" : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Section: Personal ── */}
          {activeSection === "personal" && (
            <div className="animate-fade-in space-y-4 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
                <h3 className="font-marathi-display text-base font-bold text-maroon-900">{t.sectionPersonal}</h3>
                <span className="text-[11px] font-bold text-gold-deep">{sectionPct("personal")}%</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel required counter={data.fullName.trim().length} max={40}>{t.fullName}</FieldLabel>
                  <TransliteratedInput value={data.fullName} onValueChange={(v) => setField("fullName", v)}
                    placeholder={isEn ? "e.g. Tejas Pramod Deshmukh" : "उदा. चि. संकेत प्रमोदराव देशमुख"} required />
                </div>
                <div>
                  <FieldLabel>{t.gender}</FieldLabel>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setField("gender", "groom")}
                      className={`min-h-[40px] rounded-xl border text-xs font-bold transition ${data.gender === "groom" ? "border-maroon-800 bg-maroon-800 text-white shadow-xs" : "border-ink-900/20 bg-white text-ink-700"
                        }`}>🤵 {t.genderGroom}</button>
                    <button type="button" onClick={() => setField("gender", "bride")}
                      className={`min-h-[40px] rounded-xl border text-xs font-bold transition ${data.gender === "bride" ? "border-maroon-800 bg-maroon-800 text-white shadow-xs" : "border-ink-900/20 bg-white text-ink-700"
                        }`}>👰 {t.genderBride}</button>
                  </div>
                </div>
                <div>
                  <FieldLabel required>{t.dob}</FieldLabel>
                  <input type="date" value={data.dob} onChange={(e) => setField("dob", e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <FieldLabel>{t.tob}</FieldLabel>
                  <TransliteratedInput value={data.tob} onValueChange={(v) => setField("tob", v)}
                    placeholder={isEn ? "e.g. 10:30 AM" : "उदा. सकाळी ०९:२५ वा."} />
                </div>
                <div>
                  <FieldLabel>{t.pob}</FieldLabel>
                  <TransliteratedInput value={data.pob} onValueChange={(v) => setField("pob", v)}
                    placeholder={isEn ? "e.g. Pune, Maharashtra" : "उदा. पुणे, महाराष्ट्र"} />
                </div>
                <div>
                  <FieldLabel>{t.height}</FieldLabel>
                  <TransliteratedInput value={data.height} onValueChange={(v) => setField("height", v)}
                    placeholder={isEn ? "e.g. 5 ft 9 in" : "उदा. ५ फूट ९ इंच"} />
                </div>
                <div>
                  <FieldLabel>{t.weight}</FieldLabel>
                  <TransliteratedInput value={data.weight} onValueChange={(v) => setField("weight", v)}
                    placeholder={isEn ? "e.g. 68 kg" : "उदा. ६८ किलो"} />
                </div>
                <div>
                  <FieldLabel>{t.complexion}</FieldLabel>
                  <TransliteratedInput value={data.complexion} onValueChange={(v) => setField("complexion", v)}
                    placeholder={isEn ? "e.g. Fair / Wheatish" : "उदा. गोरा / गव्हाळ"} />
                </div>
                <div>
                  <FieldLabel>{t.bloodGroup}</FieldLabel>
                  <input type="text" value={data.bloodGroup} onChange={(e) => setField("bloodGroup", e.target.value)}
                    placeholder="e.g. B +ve / O +ve" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* ── Section: Horoscope ── */}
          {activeSection === "horoscope" && (
            <div className="animate-fade-in space-y-4 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
                <h3 className="font-marathi-display text-base font-bold text-maroon-900">{t.sectionHoroscope}</h3>
                <span className="text-[11px] font-bold text-gold-deep">{sectionPct("horoscope")}%</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>{t.caste}</FieldLabel>
                  <TransliteratedInput value={data.caste} onValueChange={(v) => setField("caste", v)}
                    placeholder={isEn ? "e.g. Hindu - Maratha 96 Kuli" : "उदा. हिंदू - मराठा (९६ कुळी)"} />
                </div>
                <div>
                  <FieldLabel>{t.subCaste}</FieldLabel>
                  <TransliteratedInput value={data.subCaste} onValueChange={(v) => setField("subCaste", v)}
                    placeholder={isEn ? "e.g. Deshmukh / Rigvedi" : "उदा. देशमुख / देशस्थ"} />
                </div>
                <div>
                  <FieldLabel tip={tips.gotra}>{t.gotra}</FieldLabel>
                  <TransliteratedInput value={data.gotra} onValueChange={(v) => setField("gotra", v)}
                    placeholder={isEn ? "e.g. Kashyap / Bhardwaj" : "उदा. कश्यप / भारद्वाज"} />
                </div>
                <div>
                  <FieldLabel tip={tips.rashi}>{t.rashi}</FieldLabel>
                  <TransliteratedInput value={data.rashi} onValueChange={(v) => setField("rashi", v)}
                    placeholder={isEn ? "e.g. Virgo (Kanya)" : "उदा. कन्या (Virgo)"} />
                </div>
                <div>
                  <FieldLabel tip={tips.nakshatra}>{t.nakshatra}</FieldLabel>
                  <TransliteratedInput value={data.nakshatra} onValueChange={(v) => setField("nakshatra", v)}
                    placeholder={isEn ? "e.g. Hasta" : "उदा. हस्त / उत्तराषाढा"} />
                </div>
                <div>
                  <FieldLabel tip={tips.mangal}>{t.mangal}</FieldLabel>
                  <TransliteratedInput value={data.mangal} onValueChange={(v) => setField("mangal", v)}
                    placeholder={isEn ? "e.g. No (Non-Manglik)" : "उदा. नाही (निर्दोष पत्रिका)"} />
                </div>
                <div>
                  <FieldLabel tip={tips.gan}>{t.gan}</FieldLabel>
                  <TransliteratedInput value={data.gan} onValueChange={(v) => setField("gan", v)}
                    placeholder={isEn ? "e.g. Dev Gan" : "उदा. देव गण / मनुष्य गण"} />
                </div>
                <div>
                  <FieldLabel tip={tips.nadi}>{t.nadi}</FieldLabel>
                  <TransliteratedInput value={data.nadi} onValueChange={(v) => setField("nadi", v)}
                    placeholder={isEn ? "e.g. Madhya / Adya" : "उदा. आद्य / मध्य / अंत्य"} />
                </div>
              </div>
            </div>
          )}

          {/* ── Section: Career ── */}
          {activeSection === "career" && (
            <div className="animate-fade-in space-y-4 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
                <h3 className="font-marathi-display text-base font-bold text-maroon-900">{t.sectionCareer}</h3>
                <span className="text-[11px] font-bold text-gold-deep">{sectionPct("career")}%</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel required counter={data.education.trim().length} max={80}>{t.education}</FieldLabel>
                  <TransliteratedInput value={data.education} onValueChange={(v) => setField("education", v)}
                    placeholder={isEn ? "e.g. B.Tech (Computer Science), COEP" : "उदा. B.Tech (Computer Science), COEP Pune"} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{t.college}</FieldLabel>
                  <TransliteratedInput value={data.college} onValueChange={(v) => setField("college", v)}
                    placeholder={isEn ? "e.g. Pune University / IIT" : "उदा. सावित्रीबाई फुले पुणे विद्यापीठ"} />
                </div>
                <div>
                  <FieldLabel required>{t.occupation}</FieldLabel>
                  <TransliteratedInput value={data.occupation} onValueChange={(v) => setField("occupation", v)}
                    placeholder={isEn ? "e.g. Senior Software Architect" : "उदा. सीनिअर सॉफ्टवेअर इंजिनिअर"} />
                </div>
                <div>
                  <FieldLabel>{t.company}</FieldLabel>
                  <TransliteratedInput value={data.company} onValueChange={(v) => setField("company", v)}
                    placeholder={isEn ? "e.g. Microsoft India, Pune" : "उदा. मायक्रोसॉफ्ट इंडिया प्रा. लि., पुणे"} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{t.annualIncome}</FieldLabel>
                  <TransliteratedInput value={data.annualIncome} onValueChange={(v) => setField("annualIncome", v)}
                    placeholder={isEn ? "e.g. ₹ 24 Lakhs per annum" : "उदा. ₹ २४.५ लाख प्रतिवर्ष"} />
                </div>
              </div>
            </div>
          )}

          {/* ── Section: Family ── */}
          {activeSection === "family" && (
            <div className="animate-fade-in space-y-4 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
                <h3 className="font-marathi-display text-base font-bold text-maroon-900">{t.sectionFamily}</h3>
                <span className="text-[11px] font-bold text-gold-deep">{sectionPct("family")}%</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel required>{t.fatherName}</FieldLabel>
                  <TransliteratedInput value={data.fatherName} onValueChange={(v) => setField("fatherName", v)}
                    placeholder={isEn ? "e.g. Mr. Pramod V. Deshmukh" : "उदा. श्री. प्रमोद विठ्ठलराव देशमुख"} />
                </div>
                <div>
                  <FieldLabel>{t.fatherOccupation}</FieldLabel>
                  <TransliteratedInput value={data.fatherOccupation} onValueChange={(v) => setField("fatherOccupation", v)}
                    placeholder={isEn ? "e.g. Retd. Executive Engineer" : "उदा. निवृत्त उपअभियंता (शासकीय)"} />
                </div>
                <div>
                  <FieldLabel required>{t.motherName}</FieldLabel>
                  <TransliteratedInput value={data.motherName} onValueChange={(v) => setField("motherName", v)}
                    placeholder={isEn ? "e.g. Mrs. Jayashree Deshmukh" : "उदा. सौ. जयश्री प्रमोद देशमुख"} />
                </div>
                <div>
                  <FieldLabel>{t.motherOccupation}</FieldLabel>
                  <TransliteratedInput value={data.motherOccupation} onValueChange={(v) => setField("motherOccupation", v)}
                    placeholder={isEn ? "e.g. Homemaker / Teacher" : "उदा. गृहिणी"} />
                </div>
                <div>
                  <FieldLabel>{t.brothers}</FieldLabel>
                  <TransliteratedInput value={data.brothers} onValueChange={(v) => setField("brothers", v)}
                    placeholder={isEn ? "e.g. 1 younger (studying)" : "उदा. १ लहान भाऊ (शिक्षण सुरू)"} />
                </div>
                <div>
                  <FieldLabel>{t.sisters}</FieldLabel>
                  <TransliteratedInput value={data.sisters} onValueChange={(v) => setField("sisters", v)}
                    placeholder={isEn ? "e.g. 1 elder (married)" : "उदा. १ बहीण (विवाहित)"} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{t.maternalUncle}</FieldLabel>
                  <TransliteratedInput value={data.maternalUncle} onValueChange={(v) => setField("maternalUncle", v)}
                    placeholder={isEn ? "e.g. Mr. Vilasrao Kadam (Satara)" : "उदा. श्री. विलासराव गणपत कदम (सातारा)"} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{t.relativeSurnames}</FieldLabel>
                  <TransliteratedInput value={data.relativeSurnames} onValueChange={(v) => setField("relativeSurnames", v)}
                    placeholder={isEn ? "e.g. Patil, Kadam, Jagtap, Shinde" : "उदा. पाटील, कदम, जगताप, शिंदे, सावंत"} />
                </div>
              </div>
            </div>
          )}

          {/* ── Section: Contact ── */}
          {activeSection === "contact" && (
            <div className="animate-fade-in space-y-4 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
                <h3 className="font-marathi-display text-base font-bold text-maroon-900">{t.sectionContact}</h3>
                <span className="text-[11px] font-bold text-gold-deep">{sectionPct("contact")}%</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>{t.contactPerson}</FieldLabel>
                  <TransliteratedInput value={data.contactPerson} onValueChange={(v) => setField("contactPerson", v)}
                    placeholder={isEn ? "e.g. Mr. Pramod Deshmukh (Father)" : "उदा. श्री. प्रमोद देशमुख (वडील)"} />
                </div>
                <div>
                  <FieldLabel required counter={data.phone.trim().length} max={15}>{t.phone}</FieldLabel>
                  <input type="tel" value={data.phone} onChange={(e) => setField("phone", e.target.value)}
                    placeholder="e.g. 98220 14567" className={inputCls} required />
                </div>
                <div>
                  <FieldLabel>{t.whatsapp}</FieldLabel>
                  <input type="tel" value={data.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)}
                    placeholder="e.g. 98220 14567" className={inputCls} />
                </div>
                <div>
                  <FieldLabel>{t.email}</FieldLabel>
                  <input type="email" value={data.email} onChange={(e) => setField("email", e.target.value)}
                    placeholder="e.g. family@example.com" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{t.address}</FieldLabel>
                  <TransliteratedInput value={data.address} onValueChange={(v) => setField("address", v)}
                    placeholder={isEn ? "e.g. Flat 402, Shivneri Heights, Baner" : "उदा. फ्लॅट क्र. ४०२, शिवनेरी हाइट्स, बाणेर"} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>{t.city}</FieldLabel>
                  <TransliteratedInput value={data.city} onValueChange={(v) => setField("city", v)}
                    placeholder={isEn ? "e.g. Pune, Maharashtra - 411045" : "उदा. पुणे, महाराष्ट्र - ४११०४५"} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel counter={data.aboutMe?.trim().length ?? 0} max={240}>{t.aboutMe}</FieldLabel>
                  <textarea value={data.aboutMe} onChange={(e) => setField("aboutMe", e.target.value)} rows={3} maxLength={240}
                    className={`${inputCls} resize-none`}
                    placeholder={L(isEn, isHi, "Brief thoughts on values, lifestyle, interests…", "स्वभाव, जीवनमूल्य, रुचियाँ…", "स्वभाव, जीवनमूल्ये, छंद व आवड…")} />
                </div>
              </div>
            </div>
          )}

          {/* ── Section: Photo & Style ── */}
          {activeSection === "photo" && (
            <div className="animate-fade-in space-y-5 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
                <h3 className="font-marathi-display text-base font-bold text-maroon-900">
                  {L(isEn, isHi, "Photo & Title Customization", "फोटो व शीर्षक", "फोटो व शीर्षलेख रचना")}
                </h3>
                {data.photoUrl && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700">✓ {L(isEn, isHi, "Photo set", "फोटो लगा", "फोटो लावला")}</span>}
              </div>

              {/* Drag & drop zone */}
              <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${dragOver ? "border-gold-500 bg-gold-500/10" : "border-maroon-900/20 bg-ivory-warm/40"
                  }`}>
                {data.photoUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={data.photoUrl} alt="preview" className="size-20 rounded-full object-cover ring-2 ring-gold-500" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-ink-800">{L(isEn, isHi, "Photo attached", "फोटो जुड़ा", "फोटो जोडला")}</p>
                      <button type="button" onClick={() => setField("photoUrl", "")} className="mt-1 text-xs font-bold text-maroon-600 hover:underline">
                        {L(isEn, isHi, "Remove photo", "फोटो हटाएँ", "फोटो काढा")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <p className="text-sm font-bold text-ink-800">
                      {L(isEn, isHi, "Drag & drop your photo here", "अपना फोटो यहाँ खींचें", "तुमचा फोटो येथे ड्रॅग करा")}
                    </p>
                    <p className="text-[11px] text-ink-400">JPG / PNG · {L(isEn, isHi, "max 4 MB", "अधिकतम 4 MB", "कमाल 4 MB")}</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="btn-base mt-1 min-h-[42px] border border-maroon-800/30 bg-white px-4 text-xs font-bold text-maroon-800 hover:bg-gold/10">
                  📁 {L(isEn, isHi, "Choose from device", "डिवाइस से चुनें", "डिव्हाइसवरून निवडा")}
                </button>
              </div>

              {/* Sample portraits */}
              <div>
                <FieldLabel>{L(isEn, isHi, "Or pick a sample portrait", "या नमूना फोटो चुनें", "किंवा नमुना फोटो निवडा")}</FieldLabel>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {Object.entries(SAMPLE_PORTRAITS).map(([key, url]) => (
                    <button key={key} type="button" onClick={() => setField("photoUrl", url)}
                      className={`size-14 overflow-hidden rounded-full border-2 transition-transform hover:scale-105 ${data.photoUrl === url ? "border-gold-500 ring-2 ring-gold-400" : "border-transparent opacity-70 hover:opacity-100"
                        }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={key} className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>{L(isEn, isHi, "Or paste image URL", "या छवि URL पेस्ट करें", "किंवा फोटोची लिंक टाका")}</FieldLabel>
                <input type="url" value={data.photoUrl} onChange={(e) => setField("photoUrl", e.target.value)} placeholder="https://…" className={inputCls} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <FieldLabel>{L(isEn, isHi, "Header Blessing", "शीर्ष आशीर्वाद", "मंगलाचरण / आशीर्वाद")}</FieldLabel>
                  <TransliteratedInput value={data.blessing} onValueChange={(v) => setField("blessing", v)} placeholder="॥ श्री गणेशाय नमः ॥" />
                </div>
                <div>
                  <FieldLabel>{L(isEn, isHi, "Biodata Title", "बायोडाटा शीर्षक", "बायोडाटा शीर्षक")}</FieldLabel>
                  <TransliteratedInput value={data.title} onValueChange={(v) => setField("title", v)} placeholder="विवाह बायोडाटा" />
                </div>
              </div>
            </div>
          )}

          {/* ── Section stepper nav ── */}
          <div className="mt-4 flex items-center justify-between">
            <button type="button"
              onClick={() => {
                const idx = sections.findIndex((s) => s.id === activeSection);
                if (idx > 0) setActiveSection(sections[idx - 1]!.id);
              }}
              disabled={sections.findIndex((s) => s.id === activeSection) === 0}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-maroon-900/15 bg-white/70 px-4 text-xs font-bold text-ink-700 transition hover:border-gold-500 disabled:opacity-40">
              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
              {L(isEn, isHi, "Previous", "पिछला", "मागील")}
            </button>
            <button type="button"
              onClick={() => {
                const idx = sections.findIndex((s) => s.id === activeSection);
                if (idx < sections.length - 1) setActiveSection(sections[idx + 1]!.id);
              }}
              disabled={sections.findIndex((s) => s.id === activeSection) === sections.length - 1}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-maroon-800 px-4 text-xs font-bold text-ivory-100 shadow-xs transition hover:bg-maroon-700 disabled:opacity-40">
              {L(isEn, isHi, "Next section", "अगला", "पुढील")}
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* ── Export / action bar ── */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-maroon-900/10 pt-4">
            <a
              href="/biodata/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 px-5 py-3 text-sm font-black text-white shadow-xl hover:from-amber-400 hover:to-rose-500 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>⤢</span>
              {L(isEn, isHi, "Open in New Tab (Full View) ⤢", "नए टैब में खोलें (Full View) ⤢", "नवीन टॅबमध्ये उघडा (Full View) ⤢")}
            </a>
            <button type="button" onClick={handlePrint}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-maroon-800 px-6 py-3 text-sm font-bold text-ivory-100 shadow-luxe transition hover:bg-maroon-700 hover:shadow-glow">
              <Icon name="printer" className="h-4.5 w-4.5 text-gold-300" />
              {t.btnPrint}
            </button>
            <button type="button" onClick={handleCopyWhatsApp}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-maroon-800/30 bg-white px-5 py-3 text-sm font-bold text-maroon-800 transition hover:border-gold-500 hover:bg-gold-500/10">
              <Icon name="zap" className="h-4 w-4 text-emerald-600" />
              {copiedWa ? L(isEn, isHi, "Copied! ✓", "कॉपी हो गया! ✓", "प्रत झाली! ✓") : t.btnCopyWa}
            </button>
            <button type="button" onClick={handleShareWhatsApp}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
              <Icon name="whatsapp" className="h-4 w-4" />
              {L(isEn, isHi, "Share on WhatsApp", "WhatsApp पर भेजें", "WhatsApp वर पाठवा")}
            </button>
            <button type="button" onClick={handleNativeShare}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-maroon-800/20 bg-white px-4 py-3 text-sm font-bold text-ink-700 transition hover:border-gold-500">
              <Icon name="link" className="h-4 w-4" />
              {L(isEn, isHi, "Share", "शेयर", "शेअर")}
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <button type="button" onClick={handleDownloadJSON} title={L(isEn, isHi, "Download JSON", "JSON डाउनलोड", "JSON डाउनलोड")}
                className="grid size-11 place-items-center rounded-full border border-maroon-900/15 bg-white text-ink-600 transition hover:border-gold-500 hover:text-maroon">
                <Icon name="download" className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => importInputRef.current?.click()} title={L(isEn, isHi, "Import JSON", "JSON आयात", "JSON आयात")}
                className="grid size-11 place-items-center rounded-full border border-maroon-900/15 bg-white text-ink-600 transition hover:border-gold-500 hover:text-maroon">
                <Icon name="upload" className="h-4 w-4" />
              </button>
              <input ref={importInputRef} type="file" accept="application/json" onChange={handleImportJSON} className="hidden" />
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT: LIVE PREVIEW ══════════ */}
        <div id="studio-preview" className={`lg:sticky lg:top-20 ${mobileTab === "preview" ? "block" : "hidden lg:block"}`}>
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              <h3 className="font-marathi-display text-sm font-bold uppercase tracking-wide text-ink-800">
                {L(isEn, isHi, "Live Preview · 60 FPS", "लाइव प्रिव्यू · 60 FPS", "थेट प्रिव्ह्यू · 60 FPS")}
              </h3>
            </div>
            <div className="rounded-full border border-gold/30 bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-gold-deep">
              {overallPct}% {L(isEn, isHi, "ready", "तैयार", "तयार")}
            </div>
          </div>

          {/* Completion ring card */}
          <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-maroon-900/10 bg-white/70 p-3.5 shadow-2xs">
            <CompletionRing value={overallPct} size={56} stroke={5.5} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-800">
                {overallPct >= 100
                  ? L(isEn, isHi, "Perfect — ready to share!", "पूर्ण — भेजने के लिए तैयार!", "पूर्ण — पाठवण्यास तयार!")
                  : L(isEn, isHi, "Keep filling for a complete biodata", "पूर्ण बायोडाटा के लिए भरते रहें", "पूर्ण बायोडाटासाठी भरत राहा")}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {sections.filter((s) => s.id !== "photo").map((s) => (
                  <span key={s.id} className={`h-1.5 flex-1 rounded-full ${sectionDone(s.id) ? "bg-emerald-500" : sectionPct(s.id) > 0 ? "bg-gold-500" : "bg-ink-900/10"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Zoom control */}
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-maroon-900/10 bg-white/70 px-3.5 py-2">
            <Icon name="search" className="h-3.5 w-3.5 text-ink-400" />
            <input type="range" min={70} max={115} value={previewZoom} onChange={(e) => setPreviewZoom(Number(e.target.value))}
              className="flex-1 accent-maroon-700" aria-label={L(isEn, isHi, "Preview zoom", "प्रिव्यू ज़ूम", "प्रिव्ह्यू झूम")} />
            <span className="w-10 text-right text-[11px] font-bold tabular-nums text-ink-500">{previewZoom}%</span>
          </div>

          {/* Live card */}
          <div className="animate-fade-up overflow-hidden rounded-2xl">
            <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: "top center", transition: "transform 0.2s ease-out" }}>
              <BiodataCard data={data} className="shadow-2xl ring-1 ring-gold-400/30" />
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 rounded-xl border border-gold-500/25 bg-ivory-warm/80 p-3.5 text-xs text-ink-600">
            <p className="flex items-center gap-1.5 font-bold text-maroon-900">
              <Icon name="checkCircle" className="h-3.5 w-3.5 text-emerald-600" />
              {L(isEn, isHi, "100% Print-Ready Guarantee", "१००% प्रिंट-रेडी गारंटी", "१००% प्रिंट-रेडी हमी")}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed">
              {L(isEn, isHi,
                "Fonts, gold gradients & ornaments fit A4 margins perfectly — zero overflow. Autosaved to this device.",
                "फ़ॉन्ट, सुवर्ण ग्रेडिएंट व आभूषण A4 मार्जिन में पूरी तरह फ़िट — शून्य ओवरफ्लो। इस डिवाइस पर स्वतः सहेजा।",
                "सर्व फॉन्ट, सुवर्ण ग्रेडियंट व नक्षी A4 वर अचूक बसतात — शून्य ओव्हरफ्लो. या डिव्हाइसवर आपोआप जतन.")}
            </p>
          </div>
        </div>
      </div>

      {/* ══ Reset confirmation modal ══ */}
      {confirmReset && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-maroon-950/50 p-4 backdrop-blur-sm" onClick={() => setConfirmReset(false)}>
          <div className="animate-fade-in w-full max-w-sm rounded-2xl border border-gold-500/30 bg-ivory-50 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-maroon-700/10 text-2xl">🗑️</div>
            <h3 className="mt-3 text-center font-marathi-display text-lg font-bold text-maroon-900">
              {L(isEn, isHi, "Clear entire biodata?", "पूरा बायोडाटा साफ़ करें?", "संपूर्ण बायोडाटा साफ करावा?")}
            </h3>
            <p className="mt-1.5 text-center text-[13px] text-ink-500">
              {L(isEn, isHi, "This removes all entered details and the saved draft. This cannot be undone.", "यह सभी विवरण और सहेजा गया ड्राफ्ट हटा देगा। यह पूर्ववत नहीं हो सकता।", "यात सर्व तपशील व जतन मसुदा काढून टाकला जाई. हे पूर्ववत करता येणार नाही.")}
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setConfirmReset(false)}
                className="min-h-[44px] flex-1 rounded-full border border-maroon-900/20 bg-white text-sm font-bold text-ink-700 transition hover:bg-ink-900/5">
                {L(isEn, isHi, "Cancel", "रद्द करें", "रद्द करा")}
              </button>
              <button type="button" onClick={handleReset}
                className="min-h-[44px] flex-1 rounded-full bg-maroon-800 text-sm font-bold text-ivory-100 transition hover:bg-maroon-700">
                {L(isEn, isHi, "Yes, clear it", "हाँ, साफ़ करें", "होय, साफ करा")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}