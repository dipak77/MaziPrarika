"use client";

import React, { useState } from "react";
import {
  type EventCategory,
  EVENT_CATEGORIES,
  type MasterTemplate,
  MASTER_TEMPLATES,
} from "@/lib/templates-catalog";
import { MasterTemplateCard, type CardRenderData } from "@/components/master-template-card";
import { Icon } from "@/components/ui";
import { LangToggle } from "@/components/lang-toggle";
import { TransliteratedInput } from "@/components/ui/transliterated-input";
import { useLanguage } from "@/context/language-context";
import { toDevanagariDigits } from "@/lib/format";

export function MultiEventStudio({
  onOpenCanvaPro,
}: {
  onOpenCanvaPro?: (templateId: string) => void;
} = {}) {
  const { lang, setLang, isEn, isHi } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    "wedding-shadi-katyar-arch"
  );
  const [isBlankPlaceholder, setIsBlankPlaceholder] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [copiedWa, setCopiedWa] = useState(false);

  // Active Template
  const activeTemplate: MasterTemplate =
    MASTER_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
    MASTER_TEMPLATES[0]!;

  // Editable Form Data state (defaulted to active template sample)
  const [formData, setFormData] = useState<CardRenderData>(() => ({
    personA: activeTemplate.sample.personA,
    personB: activeTemplate.sample.personB,
    surnames: activeTemplate.sample.surnames,
    date: activeTemplate.sample.date,
    time: activeTemplate.sample.time,
    venue: activeTemplate.sample.venue,
    city: activeTemplate.sample.city,
    host: activeTemplate.sample.host,
    parentsA: activeTemplate.sample.parentsA,
    parentsB: activeTemplate.sample.parentsB,
    tagline: activeTemplate.sample.tagline,
    blessing: activeTemplate.defaultBlessing,
    title: activeTemplate.defaultTitle,
    qrLocation: activeTemplate.sample.qrLocation,
    photoUrl: activeTemplate.sample.photoUrl,
  }));

  const updateField = <K extends keyof CardRenderData>(key: K, val: CardRenderData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleTemplateChange = (tmpl: MasterTemplate) => {
    setSelectedTemplateId(tmpl.id);
    if (isBlankPlaceholder) {
      setFormData({
        personA: tmpl.placeholders.personA,
        personB: tmpl.placeholders.personB,
        surnames: tmpl.placeholders.surnames,
        date: tmpl.placeholders.date,
        time: tmpl.placeholders.time,
        venue: tmpl.placeholders.venue,
        city: tmpl.placeholders.city,
        host: tmpl.placeholders.host,
        parentsA: tmpl.placeholders.parentsA,
        parentsB: tmpl.placeholders.parentsB,
        tagline: tmpl.placeholders.tagline,
        blessing: tmpl.defaultBlessing,
        title: tmpl.defaultTitle,
        qrLocation: tmpl.placeholders.qrLocation,
        photoUrl: tmpl.placeholders.photoUrl,
      });
    } else {
      setFormData({
        personA: tmpl.sample.personA,
        personB: tmpl.sample.personB,
        surnames: tmpl.sample.surnames,
        date: tmpl.sample.date,
        time: tmpl.sample.time,
        venue: tmpl.sample.venue,
        city: tmpl.sample.city,
        host: tmpl.sample.host,
        parentsA: tmpl.sample.parentsA,
        parentsB: tmpl.sample.parentsB,
        tagline: tmpl.sample.tagline,
        blessing: tmpl.defaultBlessing,
        title: tmpl.defaultTitle,
        qrLocation: tmpl.sample.qrLocation,
        photoUrl: tmpl.sample.photoUrl,
      });
    }
  };

  const handleModeToggle = (blank: boolean) => {
    setIsBlankPlaceholder(blank);
    if (blank) {
      setFormData({
        personA: activeTemplate.placeholders.personA,
        personB: activeTemplate.placeholders.personB,
        surnames: activeTemplate.placeholders.surnames,
        date: activeTemplate.placeholders.date,
        time: activeTemplate.placeholders.time,
        venue: activeTemplate.placeholders.venue,
        city: activeTemplate.placeholders.city,
        host: activeTemplate.placeholders.host,
        parentsA: activeTemplate.placeholders.parentsA,
        parentsB: activeTemplate.placeholders.parentsB,
        tagline: activeTemplate.placeholders.tagline,
        blessing: activeTemplate.defaultBlessing,
        title: activeTemplate.defaultTitle,
        qrLocation: activeTemplate.placeholders.qrLocation,
        photoUrl: activeTemplate.placeholders.photoUrl,
      });
    } else {
      setFormData({
        personA: activeTemplate.sample.personA,
        personB: activeTemplate.sample.personB,
        surnames: activeTemplate.sample.surnames,
        date: activeTemplate.sample.date,
        time: activeTemplate.sample.time,
        venue: activeTemplate.sample.venue,
        city: activeTemplate.sample.city,
        host: activeTemplate.sample.host,
        parentsA: activeTemplate.sample.parentsA,
        parentsB: activeTemplate.sample.parentsB,
        tagline: activeTemplate.sample.tagline,
        blessing: activeTemplate.defaultBlessing,
        title: activeTemplate.defaultTitle,
        qrLocation: activeTemplate.sample.qrLocation,
        photoUrl: activeTemplate.sample.photoUrl,
      });
    }
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
              {isEn ? "50+ Premium Event Templates" : isHi ? "५०+ प्रीमियम इवेंट टेम्पलेट्स" : "५०+ सर्व सोहळ्यांचे राजेशाही टेम्पलेट्स"}
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
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tmpl)}
                    className={`relative rounded-xl p-3 text-left transition-all border-2 flex flex-col justify-between min-h-[92px] ${
                      selected
                        ? "border-gold-500 shadow-glow bg-maroon-950 text-ivory-100"
                        : "border-maroon-900/10 bg-white/90 hover:border-gold-400 text-ink-900"
                    }`}
                  >
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
                          className="rounded p-1 text-[10.5px] text-amber-500 hover:bg-amber-400/20 hover:text-amber-300 transition"
                        >
                          ⤢
                        </a>
                        {selected && (
                          <span className="text-xs text-gold-400 font-bold">✓</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="font-marathi-display text-xs font-bold leading-tight line-clamp-1">
                        {isEn ? tmpl.nameEn : isHi ? tmpl.nameHi : tmpl.nameMr}
                      </p>
                      <p
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          selected ? "text-ivory-100/70" : "text-ink-500"
                        }`}
                      >
                        {isEn ? tmpl.descEn : tmpl.descMr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

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
                <label className="label">{isEn ? "Parents Lineage (Person A)" : "कुटुंब परिचय (आजोबा व वडिलांचे नाव)"}</label>
                <TransliteratedInput
                  value={formData.parentsA || ""}
                  onValueChange={(v) => updateField("parentsA", v)}
                  placeholder={activeTemplate.placeholders.parentsA}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{isEn ? "Invited By (Host)" : "निमंत्रक परिवार"}</label>
                <TransliteratedInput
                  value={formData.host || ""}
                  onValueChange={(v) => updateField("host", v)}
                  placeholder="उदा. समस्त परिवार"
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
              <Icon name="zap" className="h-4 w-4 text-emerald-600" />
              {copiedWa ? (isEn ? "Copied! ✓" : "प्रत केली! ✓") : (isEn ? "Copy WhatsApp Text" : "व्हॉट्सअॅप मजकूर प्रत करा")}
            </button>
          </div>
        </div>

        {/* Right Side: 60 FPS Master Card Live Preview */}
        <div
          id="studio-preview"
          className={`sticky top-20 ${mobileTab === "preview" ? "block" : "hidden lg:block"}`}
        >
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
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
              <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-amber-200">
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
            <MasterTemplateCard
              template={activeTemplate}
              data={formData}
              isBlankPlaceholder={isBlankPlaceholder}
              className="shadow-2xl ring-1 ring-gold-400/30"
            />
          </div>

          <div className="mt-4 rounded-xl border border-gold-500/25 bg-ivory-warm/80 p-3.5 text-xs text-ink-600">
            <p className="font-bold text-maroon-900 flex items-center gap-1.5">
              <Icon name="checkCircle" className="h-3.5 w-3.5 text-emerald-600" />
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
