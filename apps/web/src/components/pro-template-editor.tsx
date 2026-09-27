"use client";

import React, { useRef, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { TransliteratedInput } from "@/components/ui/transliterated-input";
import {
  BaroqueGildedPhotoFrame,
  BaroqueOuterBorder,
  BridalGoldJewelryChandelier,
  DamaskBrocadeBackground,
  GoldenGaneshaEmblem,
  GoldFiligreeDivider,
  MarigoldToranGarland,
  OrnateQrBadge,
} from "@/components/baroque-ornaments";

/* ══════════════════════════════════════════════════════════════════════
   PRESET THEMES (Matching Reference & Royal Variants)
   ══════════════════════════════════════════════════════════════════════ */
interface ColorThemePreset {
  id: string;
  nameMr: string;
  nameHi: string;
  nameEn: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  damaskOpacity: number;
}

const COLOR_PRESETS: ColorThemePreset[] = [
  {
    id: "royal-onyx",
    nameMr: "शाही ब्लॅक व २४K गोल्ड (संदर्भ मूळ)",
    nameHi: "शाही काला व २४K सोना (संदर्भ)",
    nameEn: "Royal Onyx Black & 24K Gold (Reference)",
    bgColor: "#090707",
    accentColor: "#d4af37",
    textColor: "#ffe18a",
    damaskOpacity: 0.12,
  },
  {
    id: "peshwa-maroon",
    nameMr: "श्रीमंत पेशवाई किरमिजी",
    nameHi: "श्रीमंत पेशवाई महरून",
    nameEn: "Imperial Peshwa Maroon",
    bgColor: "#32070e",
    accentColor: "#f3cc68",
    textColor: "#fef08a",
    damaskOpacity: 0.14,
  },
  {
    id: "rajwada-emerald",
    nameMr: "राजवाडा पाचू पाचू हिरवा",
    nameHi: "राजवाड़ा पन्ना हरा",
    nameEn: "Rajwada Emerald Green",
    bgColor: "#042217",
    accentColor: "#fbbf24",
    textColor: "#fef9c3",
    damaskOpacity: 0.13,
  },
  {
    id: "midnight-navy",
    nameMr: "मध्यरात्र निळा व शॅम्पेन",
    nameHi: "गहरा नीला व शैंपेन",
    nameEn: "Midnight Sapphire & Champagne",
    bgColor: "#070e24",
    accentColor: "#fde047",
    textColor: "#fef08a",
    damaskOpacity: 0.12,
  },
  {
    id: "maharani-rose",
    nameMr: "महारानी रोझ गोल्ड",
    nameHi: "महारानी रोज़ गोल्ड",
    nameEn: "Maharani Rose Gold",
    bgColor: "#240715",
    accentColor: "#fb7185",
    textColor: "#ffe4e6",
    damaskOpacity: 0.15,
  },
  {
    id: "pure-ivory",
    nameMr: "शुभ्र हस्तिदंत व पितळ",
    nameHi: "श्वेत हाथीदांत व कांस्य",
    nameEn: "Pure Ivory & Antique Bronze",
    bgColor: "#fbf8f2",
    accentColor: "#b45309",
    textColor: "#78350f",
    damaskOpacity: 0.08,
  },
];

/* ══════════════════════════════════════════════════════════════════════
   PRO COMPONENT EDITOR COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export function ProTemplateEditor() {
  const { lang, isEn, isHi } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "content" | "colors" | "typography" | "frame" | "ornaments"
  >("content");

  // Mode: Blank Placeholder Ready vs Sample
  const [mode, setMode] = useState<"placeholder" | "sample">("placeholder");

  // 1. Content State
  const [personA, setPersonA] = useState("[वराचे नाव]");
  const [personB, setPersonB] = useState("[वधूचे नाव]");
  const [eventTitle, setEventTitle] = useState("साखरपुडा समारंभ");
  const [date, setDate] = useState("दि. [दिनांक]");
  const [venue, setVenue] = useState("विवाह स्थळ [स्थळ]");
  const [blessing, setBlessing] = useState("॥ श्री गणेशाय नमः ॥");
  const [footer, setFooter] = useState("॥ मंगलमय साखरपुडा ॥ • परिवाराच्या उपस्थितीत ॥");
  const [qrLabel, setQrLabel] = useState("RSVP / आमंत्रण तपशीलासाठी\nयेथे स्कॅन करा");

  // 2. Colors State
  const [activePreset, setActivePreset] = useState("royal-onyx");
  const [bgColor, setBgColor] = useState("#090707");
  const [accentColor, setAccentColor] = useState("#d4af37");
  const [textColor, setTextColor] = useState("#ffe18a");
  const [damaskOpacity, setDamaskOpacity] = useState(0.12);

  // 3. Typography State
  const [fontFamily, setFontFamily] = useState<
    "serif" | "rozha" | "playfair" | "poppins" | "cinzel" | "yatra"
  >("serif");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [nameSize, setNameSize] = useState(26);
  const [brideSize, setBrideSize] = useState(22);
  const [titleSize, setTitleSize] = useState(30);
  const [dateVenueSize, setDateVenueSize] = useState(15);
  const [nameWeight, setNameWeight] = useState<"normal" | "bold" | "black">("bold");
  const [titleWeight, setTitleWeight] = useState<"normal" | "bold" | "black">("bold");

  // 4. Photo Frame State
  const [frameShape, setFrameShape] = useState<
    "oval" | "rect" | "heart" | "arch" | "circle"
  >("oval");
  const [frameRotation, setFrameRotation] = useState(-4);
  const [frameScale, setFrameScale] = useState(100);
  const [showFlowers, setShowFlowers] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string>("");

  // 5. Ornaments State
  const [showGanesha, setShowGanesha] = useState(true);
  const [ganeshaSize, setGaneshaSize] = useState(54);
  const [showGarland, setShowGarland] = useState(true);
  const [garlandStyle, setGarlandStyle] = useState<"marigold" | "jasmine" | "rose">("marigold");
  const [showJewelry, setShowJewelry] = useState(true);
  const [jewelrySide, setJewelrySide] = useState<"left" | "right">("left");
  const [showQr, setShowQr] = useState(true);
  const [showDivider, setShowDivider] = useState(true);
  const [showBorder, setShowBorder] = useState(true);
  const [borderThickness, setBorderThickness] = useState<"thin" | "normal" | "heavy">("normal");

  // Handle Preset Switching
  const applyPreset = (preset: ColorThemePreset) => {
    setActivePreset(preset.id);
    setBgColor(preset.bgColor);
    setAccentColor(preset.accentColor);
    setTextColor(preset.textColor);
    setDamaskOpacity(preset.damaskOpacity);
  };

  // Toggle between Placeholder & Sample Data
  const toggleMode = (nextMode: "placeholder" | "sample") => {
    setMode(nextMode);
    if (nextMode === "placeholder") {
      setPersonA("[वराचे नाव]");
      setPersonB("[वधूचे नाव]");
      setEventTitle("साखरपुडा समारंभ");
      setDate("दि. [दिनांक]");
      setVenue("विवाह स्थळ [स्थळ]");
      setFooter("॥ मंगलमय साखरपुडा ॥ • परिवाराच्या उपस्थितीत ॥");
    } else {
      setPersonA("चि. प्रथमेश (B.Tech)");
      setPersonB("चि.सौ.कां. तनिष्का (M.Sc)");
      setEventTitle("साखरपुडा समारंभ");
      setDate("रविवार दि. २४ नोव्हेंबर २०२६, सायं. ०५:०० वा.");
      setVenue("दामिनी लॉन्स, सिंहगड रस्ता, पुणे");
      setFooter("॥ सस्नेह निमंत्रण ॥ • समस्त पठारे व बराटे परिवार ॥");
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Reset to Exact Reference Defaults
  const handleReset = () => {
    if (COLOR_PRESETS[0]) {
      applyPreset(COLOR_PRESETS[0]);
    }
    setMode("placeholder");
    setPersonA("[वराचे नाव]");
    setPersonB("[वधूचे नाव]");
    setEventTitle("साखरपुडा समारंभ");
    setDate("दि. [दिनांक]");
    setVenue("विवाह स्थळ [स्थळ]");
    setBlessing("॥ श्री गणेशाय नमः ॥");
    setFooter("॥ मंगलमय साखरपुडा ॥ • परिवाराच्या उपस्थितीत ॥");
    setFontFamily("serif");
    setTextAlign("left");
    setNameSize(26);
    setBrideSize(22);
    setTitleSize(30);
    setDateVenueSize(15);
    setFrameShape("oval");
    setFrameRotation(-4);
    setFrameScale(100);
    setShowFlowers(true);
    setPhotoUrl("");
    setShowGanesha(true);
    setGaneshaSize(54);
    setShowGarland(true);
    setGarlandStyle("marigold");
    setShowJewelry(true);
    setJewelrySide("left");
    setShowQr(true);
    setShowDivider(true);
    setShowBorder(true);
    setBorderThickness("normal");
  };

  // Font Family CSS Class
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "playfair":
      case "serif":
        return "font-serif";
      case "poppins":
        return "font-sans";
      case "cinzel":
        return "font-serif tracking-wider";
      case "rozha":
      case "yatra":
      default:
        return "font-marathi-display";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header Bar with Mode Toggles & Export ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold-500/30 bg-maroon-950/80 p-4 sm:p-5 backdrop-blur-md shadow-premium">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 text-maroon-950 font-black text-2xl shadow-glow">
            👑
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-black text-ivory-100 tracking-tight">
                {isEn ? "Baroque Gold Luxury Template Studio" : isHi ? "शाही स्वर्ण बारोक टेम्पलेट प्रो एडिटर" : "शाही सुवर्ण बारोक टेम्पलेट प्रो एडिटर"}
              </h2>
              <span className="rounded-full bg-gold-400/25 px-2 py-0.5 text-[10px] font-black text-gold-300 ring-1 ring-gold-400/40">
                PRO EDITOR
              </span>
            </div>
            <p className="text-xs text-gold-200/80">
              {isEn
                ? "Full component-level control: colors, fonts, sizes, shapes, garlands & jewelry"
                : isHi
                  ? "पूर्ण घटक नियंत्रण: रंग, फॉन्ट, आकार, फ्रेम शेप, तोरण व दागिने बदला"
                  : "सर्व घटकांवर पूर्ण नियंत्रण: रंग, फॉन्ट, साईज, फ्रेम आकार, तोरण व आभूषणे बदला"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl border border-gold-500/30 bg-black/40 p-1">
            <button
              type="button"
              onClick={() => toggleMode("placeholder")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mode === "placeholder"
                  ? "bg-gold-500 text-maroon-950 shadow-sm"
                  : "text-ivory-100/70 hover:text-white"
              }`}
            >
              📋 {isEn ? "Blank Placeholder Mode" : isHi ? "रिक्त प्लेसहोल्डर" : "रिक्त प्लेसहोल्डर"}
            </button>
            <button
              type="button"
              onClick={() => toggleMode("sample")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mode === "sample"
                  ? "bg-gold-500 text-maroon-950 shadow-sm"
                  : "text-ivory-100/70 hover:text-white"
              }`}
            >
              📝 {isEn ? "Sample Data" : isHi ? "नमुना डेटा" : "नमुना डेटा"}
            </button>
          </div>

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-400 px-4 py-2 text-xs sm:text-sm font-black text-maroon-950 shadow-glow transition hover:brightness-110 active:scale-95"
          >
            <span>🖨️</span>
            <span>{isEn ? "Print / PDF" : isHi ? "प्रिंट / PDF" : "प्रिंट / PDF डाऊनलोड"}</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-ivory-100/80 transition hover:bg-white/10"
            title="संदर्भ डिझाइन पूर्ववत करा"
          >
            🔄 {isEn ? "Reset Defaults" : isHi ? "रीसेट करें" : "रीसेट"}
          </button>
        </div>
      </div>

      {/* ── Main Studio Grid: Left Pro Controls & Right Live Card Canvas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr] gap-8 items-start">
        {/* ════════════════════════════════════════════════════════════════
           LEFT: COMPONENT PRO EDITOR CONTROL PANELS
           ════════════════════════════════════════════════════════════════ */}
        <div className="rounded-3xl border border-gold-500/25 bg-maroon-950/90 p-5 backdrop-blur-md shadow-2xl space-y-6">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-5 gap-1 rounded-2xl bg-black/50 p-1 border border-white/10 text-center">
            {[
              { id: "content", label: isEn ? "Text" : "मजकूर", icon: "✍️" },
              { id: "colors", label: isEn ? "Color" : "रंग", icon: "🎨" },
              { id: "typography", label: isEn ? "Fonts" : "फॉन्ट", icon: "🔤" },
              { id: "frame", label: isEn ? "Frame" : "फ्रेम", icon: "🖼️" },
              { id: "ornaments", label: isEn ? "Decor" : "दागिने", icon: "⚜️" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-gold-500 to-amber-500 text-maroon-950 shadow-md font-extrabold"
                    : "text-ivory-100/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB 1: CONTENT (मजकूर संपादन) ── */}
          {activeTab === "content" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  {isEn ? "Content & Placeholder Text" : "मजकूर व प्लेसहोल्डर माहिती"}
                </h3>
                <span className="text-[10px] text-ivory-100/60">
                  {isEn ? "Phonetic typing active" : "इंग्रजीत टाईप करा — मराठीत रूपांतर होईल"}
                </span>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                  {isEn ? "Auspicious Blessing Header" : "शीर्ष शुभ आशीर्वाद"}
                </label>
                <TransliteratedInput
                  value={blessing}
                  onValueChange={setBlessing}
                  placeholder="॥ श्री गणेशाय नमः ॥"
                  className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-gold-300 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                    {isEn ? "Groom Name" : "वराचे नाव (Groom)"}
                  </label>
                  <TransliteratedInput
                    value={personA}
                    onValueChange={setPersonA}
                    placeholder="[वराचे नाव]"
                    className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-ivory-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                    {isEn ? "Bride Name" : "वधूचे नाव (Bride)"}
                  </label>
                  <TransliteratedInput
                    value={personB}
                    onValueChange={setPersonB}
                    placeholder="[वधूचे नाव]"
                    className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-ivory-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                  {isEn ? "Event Ceremony Title" : "कार्यक्रमाचे नाव (Event Title)"}
                </label>
                <TransliteratedInput
                  value={eventTitle}
                  onValueChange={setEventTitle}
                  placeholder="साखरपुडा समारंभ / शुभ विवाह"
                  className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-gold-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                    {isEn ? "Date & Time" : "दिनांक व वेळ (Date)"}
                  </label>
                  <TransliteratedInput
                    value={date}
                    onValueChange={setDate}
                    placeholder="दि. [दिनांक]"
                    className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-ivory-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                    {isEn ? "Venue / Location" : "विवाह स्थळ (Venue)"}
                  </label>
                  <TransliteratedInput
                    value={venue}
                    onValueChange={setVenue}
                    placeholder="विवाह स्थळ [स्थळ]"
                    className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-ivory-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                  {isEn ? "Auspicious Footer Note" : "तळटीप / निमंत्रक संदेश (Footer)"}
                </label>
                <TransliteratedInput
                  value={footer}
                  onValueChange={setFooter}
                  placeholder="॥ मंगलमय साखरपुडा ॥ • परिवाराच्या उपस्थितीत ॥"
                  className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-ivory-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                  {isEn ? "QR Badge Subtitle" : "QR कोड मथळा"}
                </label>
                <input
                  type="text"
                  value={qrLabel}
                  onChange={(e) => setQrLabel(e.target.value)}
                  placeholder="RSVP / आमंत्रण तपशीलासाठी येथे स्कॅन करा"
                  className="w-full rounded-xl border border-gold-500/30 bg-black/40 px-3.5 py-2.5 text-sm text-ivory-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>
          )}

          {/* ── TAB 2: COLORS (रंग व थीम संपादन) ── */}
          {activeTab === "colors" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                {isEn ? "Royal Color Presets" : "राजेशाही रंग पॅलेट"}
              </h3>

              {/* 6 Curated Preset Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-2xl p-2.5 border text-left transition flex items-center gap-2.5 ${
                      activePreset === preset.id
                        ? "border-gold-400 bg-gold-500/20 ring-1 ring-gold-400"
                        : "border-white/10 bg-black/40 hover:border-gold-500/40"
                    }`}
                  >
                    <div
                      className="size-7 rounded-xl border border-white/20 shrink-0 shadow-sm"
                      style={{ background: preset.bgColor }}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-ivory-100 truncate">
                        {isEn ? preset.nameEn : isHi ? preset.nameHi : preset.nameMr}
                      </div>
                      <div className="text-[9.5px] text-gold-300 font-mono">
                        {preset.accentColor}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-ivory-100/90">
                  {isEn ? "Custom Color Controls" : "कस्टम रंग नियंत्रण"}
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-ivory-100/70 block mb-1">
                      {isEn ? "Background" : "पार्श्वभूमी"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => {
                          setBgColor(e.target.value);
                          setActivePreset("custom");
                        }}
                        className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] text-ivory-100/80 font-mono">{bgColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-ivory-100/70 block mb-1">
                      {isEn ? "Gold Accent" : "गोल्ड अॅक्सेंट"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value);
                          setActivePreset("custom");
                        }}
                        className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] text-ivory-100/80 font-mono">{accentColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-ivory-100/70 block mb-1">
                      {isEn ? "Text Tone" : "मजकूर रंग"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          setActivePreset("custom");
                        }}
                        className="size-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[10px] text-ivory-100/80 font-mono">{textColor}</span>
                    </div>
                  </div>
                </div>

                {/* Damask Pattern Intensity Slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ivory-100/80">
                      {isEn ? "Damask Brocade Opacity" : "दमास्क विणकाम तीव्रता"}
                    </span>
                    <span className="text-gold-300 font-mono">{Math.round(damaskOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.35"
                    step="0.01"
                    value={damaskOpacity}
                    onChange={(e) => setDamaskOpacity(parseFloat(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: TYPOGRAPHY (फॉन्ट व साईज संपादन) ── */}
          {activeTab === "typography" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                {isEn ? "Font Family & Typography" : "फॉन्ट फॅमिली व आकार नियंत्रण"}
              </h3>

              {/* Font Family Selection */}
              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1.5">
                  {isEn ? "Select Font Family" : "फॉन्ट निवडा"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "serif", name: "Playfair Classical Serif" },
                    { id: "rozha", name: "Rozha One (शाही देवनागरी)" },
                    { id: "cinzel", name: "Cinzel Luxury" },
                    { id: "poppins", name: "Poppins Modern" },
                    { id: "yatra", name: "Yatra One (कॅलिग्राफी)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.id as typeof fontFamily)}
                      className={`p-2.5 rounded-xl border text-center text-xs transition ${
                        fontFamily === f.id
                          ? "border-gold-400 bg-gold-500/20 text-gold-200 font-bold"
                          : "border-white/10 bg-black/40 text-ivory-100/75 hover:border-white/20"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1">
                  {isEn ? "Text Alignment" : "मजकूर मांडणी (Alignment)"}
                </label>
                <div className="inline-flex rounded-xl border border-white/15 bg-black/40 p-1">
                  {[
                    { id: "left", label: isEn ? "Left (Ref)" : "डावीकडे (संदर्भ)" },
                    { id: "center", label: isEn ? "Center" : "मध्यभागी" },
                    { id: "right", label: isEn ? "Right" : "उजवीकडे" },
                  ].map((al) => (
                    <button
                      key={al.id}
                      type="button"
                      onClick={() => setTextAlign(al.id as typeof textAlign)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        textAlign === al.id
                          ? "bg-gold-500 text-maroon-950 shadow-sm"
                          : "text-ivory-100/70 hover:text-white"
                      }`}
                    >
                      {al.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Sliders */}
              <div className="space-y-3 border-t border-white/10 pt-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ivory-100/80">{isEn ? "Groom Name Size" : "वराचे नाव साईज"}</span>
                    <span className="text-gold-300 font-mono">{nameSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="44"
                    value={nameSize}
                    onChange={(e) => setNameSize(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ivory-100/80">{isEn ? "Bride Name Size" : "वधूचे नाव साईज"}</span>
                    <span className="text-gold-300 font-mono">{brideSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="40"
                    value={brideSize}
                    onChange={(e) => setBrideSize(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ivory-100/80">{isEn ? "Event Title Size" : "कार्यक्रमाचे नाव साईज"}</span>
                    <span className="text-gold-300 font-mono">{titleSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    value={titleSize}
                    onChange={(e) => setTitleSize(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ivory-100/80">{isEn ? "Date & Venue Size" : "तारीख व स्थळ साईज"}</span>
                    <span className="text-gold-300 font-mono">{dateVenueSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={dateVenueSize}
                    onChange={(e) => setDateVenueSize(parseInt(e.target.value))}
                    className="w-full accent-gold-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: PHOTO FRAME & SHAPE (फोटो व फ्रेम आकार) ── */}
          {activeTab === "frame" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                {isEn ? "Photo Frame Shape & Styling" : "फोटो फ्रेम आकार व स्टाईल"}
              </h3>

              {/* Frame Shape Selection */}
              <div>
                <label className="text-[12px] font-semibold text-ivory-100/90 block mb-1.5">
                  {isEn ? "Baroque Frame Shape" : "फ्रेमचा आकार निवडा"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "oval", name: isEn ? "Oval (Reference)" : "ओव्हल (संदर्भ)" },
                    { id: "rect", name: isEn ? "Ornate Rectangle" : "शाही चौकोन" },
                    { id: "heart", name: isEn ? "Baroque Heart" : "हार्ट / हृदय" },
                    { id: "arch", name: isEn ? "Palace Arch" : "राजमहाल कमान" },
                    { id: "circle", name: isEn ? "Circular Mandala" : "वर्तुळाकार" },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => setFrameShape(sh.id as typeof frameShape)}
                      className={`p-2.5 rounded-xl border text-center text-xs transition ${
                        frameShape === sh.id
                          ? "border-gold-400 bg-gold-500/20 text-gold-200 font-bold shadow-sm"
                          : "border-white/10 bg-black/40 text-ivory-100/75 hover:border-white/20"
                      }`}
                    >
                      {sh.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Input */}
              <div className="border border-gold-500/30 rounded-2xl p-4 bg-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ivory-100">
                    {photoUrl ? "✅ फोटो जोडला आहे" : "📷 जोडप्याचा फोटो अपलोड करा"}
                  </span>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="text-[11px] text-red-400 hover:text-red-300 underline"
                    >
                      काढून टाका
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gold-400/50 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <span>📁</span>
                  <span>{photoUrl ? "दुसरा फोटो निवडा (Change Photo)" : "फोटो निवडा / अपलोड करा"}</span>
                </button>
              </div>

              {/* Rotation Tilt Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ivory-100/80">{isEn ? "Frame Rotation Tilt" : "फ्रेम तिरपे वळण (Tilt)"}</span>
                  <span className="text-gold-300 font-mono">{frameRotation}°</span>
                </div>
                <input
                  type="range"
                  min="-15"
                  max="15"
                  value={frameRotation}
                  onChange={(e) => setFrameRotation(parseInt(e.target.value))}
                  className="w-full accent-gold-500 cursor-pointer"
                />
              </div>

              {/* Frame Scale Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ivory-100/80">{isEn ? "Frame Scale Size" : "फ्रेम आकार (Scale)"}</span>
                  <span className="text-gold-300 font-mono">{frameScale}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="125"
                  value={frameScale}
                  onChange={(e) => setFrameScale(parseInt(e.target.value))}
                  className="w-full accent-gold-500 cursor-pointer"
                />
              </div>

              {/* Toggle White Garden Roses */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/40">
                <span className="text-xs text-ivory-100">
                  {isEn ? "Show White Garden Roses on Frame" : "फ्रेमवर पांढरी गुलाबाची फुले दाखवा"}
                </span>
                <input
                  type="checkbox"
                  checked={showFlowers}
                  onChange={(e) => setShowFlowers(e.target.checked)}
                  className="size-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ── TAB 5: ORNAMENTS & DECOR (दागिने व तोरण) ── */}
          {activeTab === "ornaments" && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                {isEn ? "Component Ornaments Toggles" : "पारंपरिक दागिने व घटक नियंत्रण"}
              </h3>

              {/* Marigold Toran Garland Toggle & Style */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-black/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ivory-100">
                    {isEn ? "Marigold & Mango Leaf Toran" : "झेंडू व आंब्याच्या पानांचे तोरण"}
                  </span>
                  <input
                    type="checkbox"
                    checked={showGarland}
                    onChange={(e) => setShowGarland(e.target.checked)}
                    className="size-4 accent-gold-500 rounded cursor-pointer"
                  />
                </div>
                {showGarland && (
                  <div className="flex gap-2 pt-1">
                    {[
                      { id: "marigold", name: "झेंडू (Marigold)" },
                      { id: "jasmine", name: "मोगरा (White)" },
                      { id: "rose", name: "गुलाब (Red Rose)" },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGarlandStyle(g.id as typeof garlandStyle)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                          garlandStyle === g.id
                            ? "border-gold-400 bg-gold-500/20 text-gold-300"
                            : "border-white/10 bg-black/20 text-ivory-100/60"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bridal Gold Jewelry Chandelier Toggle */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-black/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ivory-100">
                    {isEn ? "Bridal Gold Kundan Jewelry (Left)" : "वधूचे सुवर्ण कुंदन आभूषणे (डावी बाजू)"}
                  </span>
                  <input
                    type="checkbox"
                    checked={showJewelry}
                    onChange={(e) => setShowJewelry(e.target.checked)}
                    className="size-4 accent-gold-500 rounded cursor-pointer"
                  />
                </div>
                {showJewelry && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setJewelrySide("left")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                        jewelrySide === "left"
                          ? "border-gold-400 bg-gold-500/20 text-gold-300"
                          : "border-white/10 bg-black/20 text-ivory-100/60"
                      }`}
                    >
                      डावीकडे (Left)
                    </button>
                    <button
                      type="button"
                      onClick={() => setJewelrySide("right")}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                        jewelrySide === "right"
                          ? "border-gold-400 bg-gold-500/20 text-gold-300"
                          : "border-white/10 bg-black/20 text-ivory-100/60"
                      }`}
                    >
                      उजवीकडे (Right)
                    </button>
                  </div>
                )}
              </div>

              {/* Lord Ganesha Emblem Toggle */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-black/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ivory-100">
                    {isEn ? "Lord Ganesha Divine Emblem" : "श्रीगणेश मूर्ती व सुलेखन"}
                  </span>
                  <input
                    type="checkbox"
                    checked={showGanesha}
                    onChange={(e) => setShowGanesha(e.target.checked)}
                    className="size-4 accent-gold-500 rounded cursor-pointer"
                  />
                </div>
                {showGanesha && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ivory-100/70">मूर्ती आकार</span>
                      <span className="text-gold-300 font-mono">{ganeshaSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="72"
                      value={ganeshaSize}
                      onChange={(e) => setGaneshaSize(parseInt(e.target.value))}
                      className="w-full accent-gold-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Outer Baroque 3D Border Toggle */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-black/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ivory-100">
                    {isEn ? "Baroque 3D Carved Gold Border" : "३D बारोक कोरलेली सुवर्ण बॉर्डर"}
                  </span>
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="size-4 accent-gold-500 rounded cursor-pointer"
                  />
                </div>
                {showBorder && (
                  <div className="flex gap-2 pt-1">
                    {[
                      { id: "thin", name: "पातळ (Thin)" },
                      { id: "normal", name: "मध्यम (Normal)" },
                      { id: "heavy", name: "शाही जाड (Heavy)" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBorderThickness(b.id as typeof borderThickness)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
                          borderThickness === b.id
                            ? "border-gold-400 bg-gold-500/20 text-gold-300"
                            : "border-white/10 bg-black/20 text-ivory-100/60"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* QR Code & Divider Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/40">
                  <span className="text-xs text-ivory-100">QR कोड बॅज</span>
                  <input
                    type="checkbox"
                    checked={showQr}
                    onChange={(e) => setShowQr(e.target.checked)}
                    className="size-4 accent-gold-500 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/40">
                  <span className="text-xs text-ivory-100">सुवर्ण डिव्हायडर</span>
                  <input
                    type="checkbox"
                    checked={showDivider}
                    onChange={(e) => setShowDivider(e.target.checked)}
                    className="size-4 accent-gold-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
           RIGHT: LIVE 60 FPS INTERACTIVE CARD CANVAS
           ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center justify-center p-2 sm:p-6 bg-black/20 rounded-3xl border border-white/10 min-h-[880px]">
          {/* Card Viewport Container */}
          <div
            ref={cardRef}
            id="baroque-printable-card"
            className="relative w-full max-w-[500px] aspect-[1/1.9] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-gold-500/40 select-none transition-all duration-300"
            style={{
              backgroundColor: bgColor,
            }}
          >
            {/* 1. Damask Brocade Background Texture */}
            <DamaskBrocadeBackground color={accentColor} opacity={damaskOpacity} />

            {/* Subtle Center Radial Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 45%, ${accentColor}18 0%, transparent 70%)`,
              }}
            />

            {/* 2. Baroque 3D Carved Gold Outer Border */}
            {showBorder && (
              <BaroqueOuterBorder
                accentColor={accentColor}
                borderThickness={borderThickness}
              />
            )}

            {/* ── CARD INTERIOR CONTENT ── */}
            <div className="relative z-10 w-full h-full p-6 sm:p-8 flex flex-col justify-between">
              {/* TOP SECTION: Ganesha Emblem & Marigold Toran */}
              <div className="w-full flex flex-col items-center text-center">
                {/* Lord Ganesha */}
                {showGanesha && (
                  <div className="flex flex-col items-center pt-2">
                    <GoldenGaneshaEmblem size={ganeshaSize} accentColor={accentColor} />
                    <p
                      className="font-serif text-[13px] sm:text-[14px] font-bold tracking-widest mt-1 drop-shadow-sm"
                      style={{ color: textColor }}
                    >
                      {blessing}
                    </p>
                  </div>
                )}

                {/* Marigold Toran Garland */}
                {showGarland && (
                  <div className="w-full flex justify-center -mt-1 sm:-mt-2">
                    <MarigoldToranGarland style={garlandStyle} />
                  </div>
                )}
              </div>

              {/* MIDDLE SECTION: Split Layout (Jewelry + Typography on Left & Gilded Frame on Right) */}
              <div className="relative w-full my-auto py-2 grid grid-cols-12 items-center">
                {/* Left Side: Bridal Gold Kundan Jewelry Chandelier */}
                {showJewelry && (
                  <div
                    className={`absolute top-0 pointer-events-none z-10 ${
                      jewelrySide === "left" ? "-left-4 sm:-left-6" : "-right-4 sm:-right-6 scale-x-[-1]"
                    }`}
                  >
                    <BridalGoldJewelryChandelier accentColor={accentColor} />
                  </div>
                )}

                {/* Left Column: Typography Details */}
                <div
                  className="col-span-7 pl-6 sm:pl-8 pr-2 flex flex-col z-20 space-y-2.5"
                  style={{ textAlign }}
                >
                  {/* Groom Name */}
                  <div
                    className={`transition-all ${getFontFamilyClass()}`}
                    style={{
                      fontSize: `${nameSize}px`,
                      color: textColor,
                      fontWeight: nameWeight,
                      lineHeight: 1.15,
                      textShadow: `0 2px 10px rgba(0,0,0,0.8), 0 0 12px ${accentColor}30`,
                    }}
                  >
                    {personA}
                  </div>

                  {/* Bride Name */}
                  <div
                    className={`transition-all ${getFontFamilyClass()}`}
                    style={{
                      fontSize: `${brideSize}px`,
                      color: textColor,
                      fontWeight: nameWeight,
                      lineHeight: 1.15,
                      textShadow: `0 2px 10px rgba(0,0,0,0.8), 0 0 12px ${accentColor}30`,
                    }}
                  >
                    {personB}
                  </div>

                  {/* Gold Filigree Divider */}
                  {showDivider && (
                    <div className="py-1">
                      <GoldFiligreeDivider accentColor={accentColor} />
                    </div>
                  )}

                  {/* Event Title */}
                  <div
                    className={`tracking-wide uppercase ${getFontFamilyClass()}`}
                    style={{
                      fontSize: `${titleSize}px`,
                      color: accentColor,
                      fontWeight: titleWeight,
                      lineHeight: 1.1,
                      textShadow: `0 2px 12px rgba(0,0,0,0.9), 0 0 18px ${accentColor}40`,
                    }}
                  >
                    {eventTitle}
                  </div>

                  {/* Date */}
                  <div
                    className="font-serif tracking-normal pt-1"
                    style={{
                      fontSize: `${dateVenueSize}px`,
                      color: textColor,
                      opacity: 0.95,
                      textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                    }}
                  >
                    {date}
                  </div>

                  {/* Venue */}
                  <div
                    className="font-serif tracking-normal"
                    style={{
                      fontSize: `${dateVenueSize}px`,
                      color: textColor,
                      opacity: 0.95,
                      textShadow: "0 1px 6px rgba(0,0,0,0.8)",
                    }}
                  >
                    {venue}
                  </div>
                </div>

                {/* Right Column: Baroque Gilded Oval Frame with White Roses */}
                <div className="col-span-5 flex justify-center items-center z-20">
                  <div style={{ transform: `scale(${frameScale / 100})` }}>
                    <BaroqueGildedPhotoFrame
                      photoUrl={photoUrl}
                      shape={frameShape}
                      rotation={frameRotation}
                      accentColor={accentColor}
                      showFlowers={showFlowers}
                      onPhotoClick={() => fileInputRef.current?.click()}
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: QR Badge & Auspicious Footer */}
              <div className="w-full flex flex-col justify-end pt-2">
                <div className="flex items-end justify-between">
                  {/* Ornate QR Code Badge */}
                  {showQr ? (
                    <div className="pl-6 sm:pl-8">
                      <OrnateQrBadge accentColor={accentColor} label={qrLabel} />
                    </div>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Auspicious Footer */}
                {footer && (
                  <div className="w-full text-center pt-3 pb-1 border-t border-gold-500/20 mt-2">
                    <p
                      className="font-serif text-[11px] sm:text-[12px] font-bold tracking-wider"
                      style={{ color: textColor }}
                    >
                      {footer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-ivory-100/60 text-center">
            💡 {isEn ? "Click on the photo frame above to upload couple portrait. All changes reflect live at 60 FPS." : "वरील फोटो फ्रेमवर क्लिक करून फोटो अपलोड करा. सर्व बदल ६० FPS रिअल-टाईम दिसतात."}
          </p>
        </div>
      </div>
    </div>
  );
}
