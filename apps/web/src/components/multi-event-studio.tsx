"use client";

import React, { useState, useEffect } from "react";
import {
  type EventCategory,
  EVENT_CATEGORIES,
  type MasterTemplate,
  MASTER_TEMPLATES,
} from "@/lib/templates-catalog";
import { MasterTemplateCard, type CardRenderData } from "@/components/master-template-card";
import { ArtVariantPicker } from "@/components/art-variant-picker";
import { artVariants } from "@/lib/print-art";
import {
  ROYAL_BG_PALETTES,
  ROYAL_FOIL_STYLES,
  type RoyalBgColor,
  type RoyalFoilType,
} from "@/components/royal-velvet-card";
import { Icon } from "@/components/ui";
import { LangToggle } from "@/components/lang-toggle";
import { TransliteratedInput } from "@/components/ui/transliterated-input";
import { useLanguage } from "@/context/language-context";
import { toDevanagariDigits } from "@/lib/format";

function derivePalette(tmpl: MasterTemplate): {
  foil: RoyalFoilType;
  bgColor: RoyalBgColor;
} {
  const foil: RoyalFoilType =
    tmpl.accentColor === "#e2e8f0" || tmpl.id.includes("silver")
      ? "silver"
      : "gold";
  let bgColor: RoyalBgColor = "royal-purple";
  if (tmpl.id.includes("navy")) bgColor = "midnight-navy";
  else if (tmpl.id.includes("emerald")) bgColor = "imperial-emerald";
  else if (tmpl.id.includes("maroon") || tmpl.id.includes("ruby"))
    bgColor = "heritage-maroon";
  else if (tmpl.id.includes("black") || tmpl.id.includes("obsidian"))
    bgColor = "obsidian-black";
  else if (tmpl.id.includes("bronze")) bgColor = "burgundy-bronze";
  return { foil, bgColor };
}

function buildFormData(
  tmpl: MasterTemplate,
  blank: boolean
): CardRenderData {
  const source = blank ? tmpl.placeholders : tmpl.sample;
  const palette = derivePalette(tmpl);
  return {
    personA: source.personA,
    personB: source.personB,
    surnames: source.surnames,
    date: source.date,
    time: source.time,
    venue: source.venue,
    city: source.city,
    host: source.host,
    parentsA: source.parentsA,
    parentsB: source.parentsB,
    tagline: source.tagline,
    blessing: tmpl.defaultBlessing,
    title: tmpl.defaultTitle,
    qrLocation: source.qrLocation,
    photoUrl: source.photoUrl,
    foilColor: palette.foil,
    bgColor: palette.bgColor,
  };
}

export function MultiEventStudio({
  initialTemplateId,
  onOpenCanvaPro,
}: {
  initialTemplateId?: string;
  onOpenCanvaPro?: (templateId: string) => void;
} = {}) {
  const { lang, setLang, isEn, isHi } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    MASTER_TEMPLATES.find((t) => t.id === initialTemplateId)?.id || "wedding-royal-purple-ganesh"
  );
  const [isBlankPlaceholder, setIsBlankPlaceholder] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [copiedWa, setCopiedWa] = useState(false);

  // Active Template
  const activeTemplate: MasterTemplate =
    MASTER_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    MASTER_TEMPLATES[0]!;

  const [activeFoil, setActiveFoil] = useState<RoyalFoilType>(
    derivePalette(activeTemplate).foil
  );
  const [activeBgColor, setActiveBgColor] = useState<RoyalBgColor>(
    derivePalette(activeTemplate).bgColor
  );
  const [artVariantId, setArtVariantId] = useState<string | undefined>(
    () => artVariants(activeTemplate.id)[0]?.id
  );
  const activeArtVariants = artVariants(activeTemplate.id);
  const activeArtVariant =
    activeArtVariants.find((v) => v.id === artVariantId) ?? activeArtVariants[0];

  // Sync when initialTemplateId prop changes
  useEffect(() => {
    if (initialTemplateId) {
      const tmpl = MASTER_TEMPLATES.find((t) => t.id === initialTemplateId);
      if (tmpl) {
        setSelectedTemplateId(initialTemplateId);
        const palette = derivePalette(tmpl);
        setActiveFoil(palette.foil);
        setActiveBgColor(palette.bgColor);
        setArtVariantId(artVariants(tmpl.id)[0]?.id);
        setFormData(buildFormData(tmpl, false));
      }
    }
  }, [initialTemplateId]);

  // Editable Form Data state (defaulted to active template sample)
  const [formData, setFormData] = useState<CardRenderData>(() =>
    buildFormData(activeTemplate, false)
  );

  const updateField = <K extends keyof CardRenderData>(key: K, val: CardRenderData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleTemplateChange = (tmpl: MasterTemplate) => {
    setSelectedTemplateId(tmpl.id);
    const palette = derivePalette(tmpl);
    setActiveFoil(palette.foil);
    setActiveBgColor(palette.bgColor);
    setArtVariantId(artVariants(tmpl.id)[0]?.id);
    setFormData(buildFormData(tmpl, isBlankPlaceholder));
  };

  const handleModeToggle = (blank: boolean) => {
    setIsBlankPlaceholder(blank);
    setFormData(buildFormData(activeTemplate, blank));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = async () => {
    const lines = [
      `*${formData.blessing || activeTemplate.defaultBlessing}*`,
      `*॥ ${formData.title || activeTemplate.defaultTitle} ॥*`,
      formData.surnames ? `*${formData.surnames}*` : null,
      `──────────────────────────`,
      formData.personA ? `• *नाव:* ${formData.personA}` : null,
      formData.personB ? `• *संग:* ${formData.personB}` : null,
      formData.date ? `• *दिनांक:* ${formData.date} (${formData.time || ""})` : null,
      formData.venue ? `• *स्थळ:* ${formData.venue}, ${formData.city || ""}` : null,
      formData.parentsA ? `• *पालक:* ${formData.parentsA}` : null,
      formData.tagline ? `\n_${formData.tagline}_` : null,
      `• *निमंत्रक:* ${formData.host || "समस्त परिवार"}`,
    ].filter(Boolean);

    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2400);
    } catch {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2400);
    }
  };

  // Filter templates
  const filteredTemplates =
    activeCategory === "all"
      ? MASTER_TEMPLATES
      : MASTER_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-8">
      {/* Top Banner: Category Tabs */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div>
            <h2 className="font-marathi-display text-2xl font-bold text-maroon-900">
              {isEn
                ? `${MASTER_TEMPLATES.length} premium event templates`
                : isHi
                  ? `${toDevanagariDigits(MASTER_TEMPLATES.length)} प्रीमियम इवेंट टेम्पलेट्स`
                  : `${toDevanagariDigits(MASTER_TEMPLATES.length)} पत्रिका टेम्पलेट्स — लग्न, पूजा, साखरपुडा`}
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              {isEn
                ? "Blank placeholder ready & working templates for Wedding, Sakharpuda, Pooja, Birthday, Gruh Pravesh & more"
                : "लग्न, साखरपुडा, सत्यनारायण पूजा, श्रीकृष्ण जन्माष्टमी, वाढदिवस, गृहप्रवेश व सर्व उत्सवांसाठी"}
            </p>
          </div>

          {/* Mode Switcher: Blank Placeholder vs Sample Working Data */}
          <div className="inline-flex rounded-xl border border-gold-500/40 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => handleModeToggle(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                !isBlankPlaceholder
                  ? "bg-maroon-800 text-ivory-100 shadow-xs"
                  : "text-ink-700 hover:text-maroon"
              }`}
            >
              📝 {isEn ? "Working Sample" : "नमुना डेटा"}
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                isBlankPlaceholder
                  ? "bg-maroon-800 text-ivory-100 shadow-xs"
                  : "text-ink-700 hover:text-maroon"
              }`}
            >
              📋 {isEn ? "Blank Placeholders" : "रिकामे टेम्पलेट"}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-maroon-950 border-gold-600 shadow-sm"
                  : "bg-white/80 text-ink-700 border-ink-900/10 hover:border-gold-400 hover:bg-gold-50"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{isEn ? cat.en : isHi ? cat.hi : cat.mr}</span>
              {cat.id === "all" && (
                <span className="rounded-full bg-maroon-950 px-1.5 py-0.2 text-[10px] text-gold-300 ml-1">
                  {MASTER_TEMPLATES.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_460px]">
        {/* Mobile View Toggle */}
        <div className="lg:hidden col-span-full -mb-4 flex rounded-xl border border-maroon-900/10 bg-white/80 p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={`flex-1 min-h-[42px] rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              mobileTab === "edit"
                ? "bg-maroon-800 text-ivory-100 shadow-sm"
                : "text-ink-700 hover:text-ink-900"
            }`}
          >
            <Icon name="sparkle" className="h-4 w-4" />
            {isEn ? "Select & Edit" : "टेम्पलेट व माहिती"}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 min-h-[42px] rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              mobileTab === "preview"
                ? "bg-maroon-800 text-ivory-100 shadow-sm"
                : "text-ink-700 hover:text-ink-900"
            }`}
          >
            <Icon name="eye" className="h-4 w-4" />
            {isEn ? "Live Preview" : "थेट प्रिव्ह्यू"}
          </button>
        </div>

        {/* Left Side: Template Carousel & Edit Controls */}
        <div className={`min-w-0 space-y-6 ${mobileTab === "edit" ? "block" : "hidden lg:block"}`}>
          {/* Template Selector Grid */}
          <fieldset>
            <legend className="label mb-2 flex items-center justify-between">
              <span>
                {isEn
                  ? `Select Design Template · ${filteredTemplates.length} Options`
                  : isHi
                    ? `टेम्पलेट चुनें · ${toDevanagariDigits(filteredTemplates.length)} विकल्प`
                    : `टेम्पलेट निवडा · ${toDevanagariDigits(filteredTemplates.length)} डिझाइन्स`}
              </span>
              <span className="text-[11px] font-bold text-gold-deep">
                ✨ {activeTemplate.badge}
              </span>
            </legend>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1 border border-maroon-900/10 rounded-2xl bg-white/60">
              {filteredTemplates.map((tmpl) => {
                const selected = tmpl.id === selectedTemplateId;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleTemplateChange(tmpl)}
                    className={`relative overflow-hidden rounded-xl p-3 pt-4 text-left transition-all border-2 flex flex-col justify-between min-h-[92px] ${
                      selected
                        ? "border-gold-500 shadow-glow bg-maroon-950 text-ivory-100"
                        : "border-maroon-900/10 bg-white/90 hover:border-gold-400 text-ink-900"
                    }`}
                  >
                    <span aria-hidden className="absolute inset-x-2 top-1.5 h-1 rounded-full" style={{ background: tmpl.bgGradient }} />
                    <div className="flex items-center justify-between">
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                        style={{
                          background: selected ? "#d4af37" : "#fef3c7",
                          color: "#78350f",
                        }}
                      >
                        {tmpl.badge}
                      </span>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/studio/editor?template=${tmpl.id}#design-form`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={isEn ? "Open in New Tab (Full View)" : "नवीन टॅबमध्ये पूर्ण स्क्रीन उघडा"}
                          className="rounded p-1 text-[10.5px] text-gold-600 hover:bg-gold-500/20 hover:text-gold-300 transition"
                        >
                          ⤢
                        </a>
                        {selected && (
                          <span className="text-xs text-gold-400 font-bold">✓</span>
                        )}
                      </div>
                    </div>

                    {tmpl.sample?.photoUrl ? (
                      <div className="relative mt-2 h-20 w-full overflow-hidden rounded-lg bg-neutral-900 border border-gold-500/20">
                        <img
                          src={tmpl.sample.photoUrl}
                          alt={tmpl.nameMr}
                          className="h-full w-full object-cover object-top transition group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-1 left-1.5 rounded bg-maroon-deep/80 px-1.5 py-0.5 text-[8px] font-bold text-gold-soft">
                          🖼️ नमुना
                        </span>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleTemplateChange(tmpl)}
                      className="mt-2 block min-h-[44px] w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                    >
                      <span className="font-marathi-display text-xs font-bold leading-tight line-clamp-1 block">
                        {isEn ? tmpl.nameEn : isHi ? tmpl.nameHi : tmpl.nameMr}
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 line-clamp-1 block ${
                          selected ? "text-ivory-100/70" : "text-ink-500"
                        }`}
                      >
                        {isEn ? tmpl.descEn : tmpl.descMr}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </fieldset>

          {/* ══════════════════════════════════════════════════════════════
              ROYAL VELVET & 24K GOLD FOIL CUSTOMIZER
              Allows switching 6 Velvet Backgrounds and 3 Metallic Foils
              ══════════════════════════════════════════════════════════════ */}
          <div className="rounded-2xl border-2 border-gold-500/40 bg-gradient-to-br from-maroon-950 via-maroon-900 to-ink-950 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
            {/* Ambient luxury glow */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold-400/10 blur-2xl" />

            <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <h3 className="font-marathi-display text-sm sm:text-base font-bold text-gold-200 leading-tight">
                    {isEn ? "Royal Velvet & Metallic Foil Customizer" : "शाही मखमली पार्श्वभूमी व सुवर्ण/रुपेरी फॉइल"}
                  </h3>
                  <p className="text-[11px] text-gold-300/70">
                    {isEn
                      ? "Select 24K Gold / 925 Silver embossed font & dark velvet fabric tone"
                      : "२४K सुवर्ण किंवा ९२५ रुपेरी फॉइल फॉन्ट व मखमली फॅब्रिक रंग निवडा"}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-gold-400/40 bg-gold-500/20 px-2 py-0.5 text-[10px] font-black text-gold-300 uppercase tracking-widest">
                LUXURY PRO
              </span>
            </div>

            {/* 1. Foil Metal Type Selector (Gold, Silver, Rose Gold) */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gold-300/80 mb-2 block">
                {isEn ? "1. Metallic Foil Typography (Font Sheen):" : "१. मेटॅलिक फॉइल टायपोग्राफी (Font Sheen):"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROYAL_FOIL_STYLES.map((foil) => {
                  const isSelected = activeFoil === foil.id;
                  return (
                    <button
                      key={foil.id}
                      type="button"
                      onClick={() => setActiveFoil(foil.id)}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-2.5 text-center transition-all duration-200 ${
                        isSelected
                          ? "border-2 border-white ring-2 ring-gold-400 shadow-lg scale-[1.02] bg-white/10"
                          : "border border-white/15 bg-black/40 hover:bg-white/5 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <span className="text-base mb-1">
                        {foil.id === "gold" ? "🪙" : foil.id === "silver" ? "💍" : "💎"}
                      </span>
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: foil.accentHex }}
                      >
                        {isEn ? foil.nameEn : foil.nameMr}
                      </span>
                      <span className="mt-0.5 text-[9px] text-neutral-300 font-mono tracking-tighter">
                        {foil.badge}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gold-400 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Velvet Fabric Tone Selector (6 Dark Velvet Shades) */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gold-300/80 mb-2 block">
                {isEn ? "2. Dark Velvet Fabric Background Color:" : "२. मखमली (Dark Velvet) पार्श्वभूमी रंग:"}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {ROYAL_BG_PALETTES.map((palette) => {
                  const isSelected = activeBgColor === palette.id;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => setActiveBgColor(palette.id)}
                      title={isEn ? palette.nameEn : palette.nameMr}
                      className={`group relative flex flex-col items-center rounded-xl p-2 transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-gold-300 shadow-md scale-105 border-2 border-gold-300 bg-white/15"
                          : "border border-white/20 bg-black/30 hover:bg-white/5 opacity-85 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="size-8 rounded-lg shadow-inner border border-white/20 mb-1.5 transition group-hover:scale-105"
                        style={{ background: palette.swatch }}
                      />
                      <span className="text-[10px] font-semibold text-neutral-200 text-center line-clamp-1">
                        {isEn ? palette.nameEn.split(" ")[0] : palette.nameMr.split(" ")[0]}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 text-xs text-gold-300 font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Fields Accordion / Groups */}
          <div className="space-y-4 rounded-2xl border border-maroon-900/10 bg-white/80 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-gold-500/20 pb-2">
              <h3 className="font-marathi-display text-base font-bold text-maroon-900">
                {isEn ? "Personalize Details" : "तपशील भरा व संपादन करा"}
              </h3>
              <button
                type="button"
                onClick={() => handleModeToggle(!isBlankPlaceholder)}
                className="text-xs text-maroon-700 font-semibold hover:underline"
              >
                {isBlankPlaceholder
                  ? "नमुना डेटा भरा"
                  : "सर्व रिकामा करा (Clear to Placeholders)"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">{isEn ? "Person / Host Name" : "प्रथम नाव (वर / बाळ / यजमान)"}</label>
                <TransliteratedInput
                  value={formData.personA}
                  onValueChange={(v) => updateField("personA", v)}
                  placeholder={activeTemplate.placeholders.personA}
                />
              </div>

              <div>
                <label className="label">{isEn ? "Second Person (Optional)" : "दुसरे नाव (वधू / साथीदार)"}</label>
                <TransliteratedInput
                  value={formData.personB || ""}
                  onValueChange={(v) => updateField("personB", v)}
                  placeholder={activeTemplate.placeholders.personB}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Family Surnames Ribbon" : "कुलनाम रिबन (उदा. पठारे - वराते)"}</label>
                <TransliteratedInput
                  value={formData.surnames || ""}
                  onValueChange={(v) => updateField("surnames", v)}
                  placeholder={activeTemplate.placeholders.surnames}
                />
              </div>

              <div>
                <label className="label">{isEn ? "Date" : "दिनांक"}</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">{isEn ? "Time & Muhurat" : "मुहूर्त वेळ"}</label>
                <TransliteratedInput
                  value={formData.time || ""}
                  onValueChange={(v) => updateField("time", v)}
                  placeholder="उदा. दुपारी १२:३० वा. शुभमुहूर्तावर"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Venue / Hall Name" : "कार्यस्थळ / हॉलचे नाव"}</label>
                <TransliteratedInput
                  value={formData.venue || ""}
                  onValueChange={(v) => updateField("venue", v)}
                  placeholder="उदा. दामिनी लॉन्स, एनडीए रस्ता"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "City & Address" : "शहर व गाव"}</label>
                <TransliteratedInput
                  value={formData.city || ""}
                  onValueChange={(v) => updateField("city", v)}
                  placeholder="उदा. पुणे, महाराष्ट्र"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Parents Lineage (Person A / Bride)" : "कुटुंब परिचय (वधूचे आई-वडील / घराणे)"}</label>
                <TransliteratedInput
                  value={formData.parentsA || ""}
                  onValueChange={(v) => updateField("parentsA", v)}
                  placeholder={activeTemplate.placeholders.parentsA || "(Daughter of Maharaj R.S. Singh Dev & Maharani V. Kumari of Pratapgarh)"}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Parents Lineage (Person B / Groom)" : "कुटुंब परिचय (वराचे आई-वडील / घराणे)"}</label>
                <TransliteratedInput
                  value={formData.parentsB || ""}
                  onValueChange={(v) => updateField("parentsB", v)}
                  placeholder={activeTemplate.placeholders.parentsB || "(Son of Maharaj K.S. Rao & Maharani S. Lakshmi of Jaipur)"}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Invitation Ribbon / Tagline" : "निमंत्रण मजकूर / टॅगलाईन"}</label>
                <TransliteratedInput
                  value={formData.tagline || ""}
                  onValueChange={(v) => updateField("tagline", v)}
                  placeholder={activeTemplate.placeholders.tagline || "WE CORDIALLY INVITE YOU TO CELEBRATE THE AUSPICIOUS ROYAL WEDDING OF"}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Invited By (Host / Royal Compliments)" : "निमंत्रक परिवार (With Compliments)"}</label>
                <TransliteratedInput
                  value={formData.host || ""}
                  onValueChange={(v) => updateField("host", v)}
                  placeholder="उदा. WITH COMPLIMENTS FROM THE ROYAL FAMILIES"
                />
              </div>

              <div>
                <label className="label">{isEn ? "Photo URL (Optional)" : "कपल / उमेदवार फोटो लिंक"}</label>
                <input
                  type="url"
                  value={formData.photoUrl || ""}
                  onChange={(e) => updateField("photoUrl", e.target.value)}
                  placeholder="https://..."
                  className="input"
                />
              </div>

              <div>
                <label className="label">{isEn ? "Location QR Code Text" : "स्थान QR कोड"}</label>
                <input
                  type="text"
                  value={formData.qrLocation || ""}
                  onChange={(e) => updateField("qrLocation", e.target.value)}
                  placeholder="Google Maps Location"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`/studio/editor?template=${selectedTemplateId}#design-form`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 px-6 py-3 text-sm font-black text-white shadow-xl hover:from-amber-400 hover:to-rose-500 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>🎨</span>
              {isEn
                ? "Open in New Tab (Full View) ⤢"
                : "नवीन टॅबमध्ये पूर्ण स्क्रीन कॅनव्हास उघडा ⤢"}
            </a>

            {onOpenCanvaPro && (
              <button
                type="button"
                onClick={() => onOpenCanvaPro(selectedTemplateId)}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-maroon-800/30 bg-maroon-950 px-5 py-3 text-sm font-bold text-gold-300 shadow-md hover:bg-maroon-900 transition"
              >
                <span>⚡</span>
                {isEn
                  ? "Edit on this page"
                  : "याच पानावर कॅनव्हास उघडा"}
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-maroon-800 px-6 py-3 text-sm font-bold text-ivory-100 shadow-luxe transition hover:bg-maroon-700 hover:shadow-glow"
            >
              <Icon name="printer" className="h-4 w-4 text-gold-300" />
              {isEn ? "Print / Save PDF" : "पत्रिका प्रिंट / PDF साठवा"}
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-maroon-800/30 bg-white px-5 py-3 text-sm font-bold text-maroon-800 transition hover:border-gold-500 hover:bg-gold-50"
            >
              <Icon name="zap" className="h-4 w-4 text-leaf-600" />
              {copiedWa ? (isEn ? "Copied! ✓" : "प्रत केली! ✓") : (isEn ? "Copy WhatsApp Text" : "व्हॉट्सअॅप मजकूर प्रत करा")}
            </button>
            <span aria-live="polite" role="status" className="sr-only">
              {copiedWa ? (isEn ? "WhatsApp text copied" : "व्हॉट्सअॅप मजकूर प्रत झाला") : ""}
            </span>
          </div>
        </div>

        {/* Right Side: 60 FPS Master Card Live Preview */}
        <div
          id="studio-preview"
          className={`sticky top-20 ${mobileTab === "preview" ? "block" : "hidden lg:block"}`}
        >
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-leaf-500 animate-pulse" />
              <h3 className="font-marathi-display text-sm font-bold text-ink-800 uppercase tracking-wide">
                {isEn ? "60 FPS Live Preview" : "थेट प्रिव्ह्यू (६० FPS)"}
              </h3>
            </div>
            <div className="text-[11px] font-bold text-gold-deep bg-gold/15 px-2.5 py-0.5 rounded-full border border-gold/30">
              {isBlankPlaceholder ? "📋 Blank Placeholder" : "✨ Working Template"}
            </div>
          </div>

          <div className="mb-3 flex flex-col gap-2">
            <a
              href={`/studio/editor?template=${selectedTemplateId}#design-form`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:brightness-110 transition active:scale-98"
            >
              <span className="flex items-center gap-1.5">
                <span>🎨</span>
                <span>{isEn ? "Open in New Tab (Full View Mode) ⤢" : "नवीन टॅबमध्ये पूर्ण स्क्रीन कॅनव्हास उघडा ⤢"}</span>
              </span>
              <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-gold-200">
                FULL VIEW ⤢
              </span>
            </a>

            {onOpenCanvaPro && (
              <button
                type="button"
                onClick={() => onOpenCanvaPro(selectedTemplateId)}
                className="w-full flex items-center justify-between rounded-xl border border-gold-500/30 bg-maroon-950/90 px-4 py-2 text-xs font-bold text-gold-300 hover:bg-maroon-900 transition"
              >
                <span className="flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{isEn ? "Edit on This Page (Canva Pro)" : "याच पानावर कॅनव्हास मोडमध्ये उघडा"}</span>
                </span>
                <span className="rounded bg-gold/20 px-2 py-0.5 text-[9px] uppercase tracking-wider font-black text-gold-300">
                  IN-PAGE
                </span>
              </button>
            )}
          </div>

          {/* Master Template Card Rendering */}
          <div className="animate-fade-up">
            {activeArtVariants.length > 0 && (
              <div className="mb-3">
                <ArtVariantPicker
                  variants={activeArtVariants}
                  value={artVariantId}
                  onChange={setArtVariantId}
                />
              </div>
            )}
            <MasterTemplateCard
              template={activeTemplate}
              data={{
                ...formData,
                foilColor: activeFoil,
                bgColor: activeBgColor,
              }}
              isBlankPlaceholder={isBlankPlaceholder}
              className="shadow-2xl ring-1 ring-gold-400/30"
              foilColor={activeFoil}
              bgColor={activeBgColor}
              variant={activeArtVariant}
              onUpdateField={(field, val) => {
                setFormData((prev) => ({ ...prev, [field]: val }));
              }}
            />
          </div>

          <div className="mt-4 rounded-xl border border-gold-500/25 bg-ivory-warm/80 p-3.5 text-xs text-ink-600">
            <p className="font-bold text-maroon-900 flex items-center gap-1.5">
              <Icon name="checkCircle" className="h-3.5 w-3.5 text-leaf-600" />
              {isEn ? "Print & Bleed Guaranteed" : "१००% प्रेस-रेडी व ब्लीड अचूकता"}
            </p>
            <p className="mt-1 leading-relaxed text-[11.5px]">
              {isEn
                ? "Instant high-resolution vector rendering matching authentic Maharashtrian & Indian wedding card printers."
                : "कट्यार, मुंडावळ्या, सुवर्ण अंगठ्या व तोरण अचूक हाय-रिझोल्यूशन प्रिंटमध्ये उमटतात."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
