"use client";

import { InvitationCard } from "@/components/invitation-card";
import { Icon } from "@/components/ui";
import { LangToggle } from "@/components/lang-toggle";
import { saveStudioDesign } from "@/app/studio/actions";
import {
  BLESSINGS,
  BLESSINGS_EN,
  DEFAULT_DESIGN,
  EVENT_TYPES,
  TEMPLATES,
  type DesignData,
  type TemplateId,
} from "@/lib/arch-data";
import { toDevanagariDigits } from "@/lib/format";
import {
  type CardLang,
  DEFAULT_LANG,
  PREF_LANG_COOKIE,
  PREF_LANG_STORAGE_KEY,
} from "@/lib/i18n";
import { useEffect, useRef, useState, useTransition } from "react";

function rupeesLabel(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${toDevanagariDigits(rupees)}`;
}

type SaveStatus = "idle" | "saving" | "saved";

export function StudioEditor() {
  const [editorLang, setEditorLang] = useState<CardLang>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qLang = params.get("lang");
      if (qLang === "en" || qLang === "mr") return qLang;
      try {
        const stored = localStorage.getItem(PREF_LANG_STORAGE_KEY);
        if (stored === "en" || stored === "mr") return stored;
        const match = document.cookie.match(new RegExp(`(?:^|; )${PREF_LANG_COOKIE}=([^;]*)`));
        if (match && (match[1] === "en" || match[1] === "mr")) return match[1] as CardLang;
      } catch {}
    }
    return DEFAULT_LANG;
  });

  const [design, setDesign] = useState<DesignData>(() => ({
    ...DEFAULT_DESIGN,
    lang: DEFAULT_LANG,
  }));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (design.lang !== editorLang) {
      setDesign((d) => ({ ...d, lang: editorLang }));
    }
  }, [editorLang, design.lang]);

  const set = <K extends keyof DesignData>(k: K, v: DesignData[K]) =>
    setDesign((d) => ({ ...d, [k]: v }));

  const mark = (k: string) =>
    setTouched((t) => (t[k] ? t : { ...t, [k]: true }));

  const isCouple = design.eventType === "wedding" || design.eventType === "engagement";

  const errPersonA =
    design.personA.trim().length < 2
      ? "किमान २ अक्षरं लिहा."
      : design.personA.trim().length > 28
        ? "२८ अक्षरांत बसवा — प्रिंट सुंदर दिसेल."
        : null;
  const errPersonB = !isCouple
    ? null
    : design.personB.trim().length < 2
      ? "दुसरं नाव लिहा."
      : design.personB.trim().length > 28
        ? "२८ अक्षरांत बसवा — प्रिंट सुंदर दिसेल."
        : null;
  const errDate = !design.date ? "दिनांक निवडा." : null;
  const errVenue =
    design.venue.trim().length < 3 ? "स्थळ ३ किंवा अधिक अक्षरांत लिहा." : null;
  const errCity =
    design.city.trim().length > 0 && design.city.trim().length < 2
      ? "शहराचं नाव तपासा."
      : null;

  const showA = touched["personA"] ? errPersonA : null;
  const showB = touched["personB"] ? errPersonB : null;
  const showDate = touched["date"] ? errDate : null;
  const showVenue = touched["venue"] ? errVenue : null;
  const showCity = touched["city"] ? errCity : null;

  const checks = [
    { ok: design.personA.trim().length > 1, t: "पहिलं नाव भरलं" },
    { ok: !isCouple || design.personB.trim().length > 1, t: isCouple ? "दुसरं नाव भरलं" : "एकच नाव — बरोबर" },
    { ok: Boolean(design.date), t: "दिनांक निवडला" },
    { ok: design.venue.trim().length > 2, t: "स्थळ स्पष्ट आहे" },
    { ok: design.personA.length <= 28 && (!isCouple || design.personB.length <= 28), t: "नावं स्मार्ट-लेआउट मर्यादेत" },
  ];
  const doneCount = checks.filter((c) => c.ok).length;
  const allOk = doneCount === checks.length;
  const progressPct = Math.round((doneCount * 100) / checks.length);

  const activeTemplate = TEMPLATES.find((t) => t.id === design.template);
  const activePaise = activeTemplate ? activeTemplate.price * 100 : 0;
  const activeRupees = rupeesLabel(activePaise);

  const isSaving = saving || saveStatus === "saving";
  const longName = design.personA.length > 22 || (isCouple && design.personB.length > 22);
  const previewEmpty =
    design.personA.trim().length === 0 &&
    design.venue.trim().length === 0 &&
    design.date.length === 0;

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
          setSaveError("जतन अयशस्वी झाले — कनेक्शन तपासा व पुन्हा प्रयत्न करा.");
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

  const handleGalleryKeys = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowUp" && e.key !== "ArrowDown") {
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

  if (!mounted) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="स्टुडिओ मांडणी तयार होत आहे"
        className="grid gap-10 lg:grid-cols-[1fr_440px]"
      >
        <div className="space-y-4">
          <div className="h-5 w-40 animate-pulse rounded-full bg-maroon-900/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-maroon-900/10" />
            ))}
          </div>
          <div className="h-44 animate-pulse rounded-2xl bg-maroon-900/10" />
        </div>
        <div className="rounded-2xl bg-paisley-dark p-6 sm:p-10">
          <div className="mx-auto aspect-[3/4] max-w-[380px] animate-pulse rounded-xl bg-ivory-100/10" />
        </div>
        <p className="sr-only">मांडणी तयार होत आहे…</p>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_440px]">
      <a
        href="#studio-preview"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-full focus:bg-maroon-800 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-ivory-100"
      >
        थेट प्रिव्ह्यूकडे जा
      </a>
      <div className="min-w-0 animate-fade-up">
        {/* Card Language Preference Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-maroon-900/10 bg-white/70 p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-gold/20 text-maroon font-bold text-base">
              🌐
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-ink-800">
                  {editorLang === "mr" ? "पत्रिका भाषा प्राधान्य" : "Card Language Preference"}
                </span>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold-ink ring-1 ring-gold/30">
                  {editorLang === "mr" ? "डिफॉल्ट: मराठी" : "Selected: English"}
                </span>
              </div>
              <p className="text-[12px] text-ink-500">
                {editorLang === "mr"
                  ? "डिफॉल्ट मराठी; आवश्यकतेनुसार इंग्रजी निवडा"
                  : "Default is Marathi; English selected"}
              </p>
            </div>
          </div>
          <LangToggle
            lang={editorLang}
            onChange={(next) => {
              setEditorLang(next);
              setDesign((d) => ({
                ...d,
                lang: next,
                blessing: next === "en" ? "॥ Shri Ganeshaya Namah ॥" : "श्री गणेशाय नमः",
              }));
            }}
          />
        </div>

        <fieldset>
          <legend className="label">
            {editorLang === "en"
              ? `Select Template · ${TEMPLATES.length} Options`
              : `टेम्पलेट निवडा · ${toDevanagariDigits(TEMPLATES.length)} पर्याय`}
          </legend>
          {TEMPLATES.length === 0 ? (
            <div className="rounded-xl border border-maroon-900/10 bg-white/70 px-5 py-8 text-center">
              <p className="font-marathi-display text-[15px] font-bold text-ink-700">
                टेम्पलेट उपलब्ध नाहीत
              </p>
              <p className="mt-1 text-[13px] text-ink-500">
                कृपया थोड्या वेळाने पुन्हा उघडा — गॅलरी लगेच भरेल.
              </p>
            </div>
          ) : (
            <div
              role="radiogroup"
              aria-label="टेम्पलेट निवडा"
              onKeyDown={handleGalleryKeys}
              className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {TEMPLATES.map((t, i) => {
                const selected = design.template === t.id;
                const cardPaise = t.price * 100;
                const cardRupees = Math.round(cardPaise / 100);
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-pressed={selected}
                    aria-label={`${t.name} · ₹${cardRupees}`}
                    onClick={() => set("template", t.id as TemplateId)}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className={`group relative min-h-[44px] overflow-hidden rounded-xl text-left ring-2 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${
                      selected
                        ? "scale-[1.01] ring-gold-500 shadow-glow"
                        : "ring-transparent hover:-translate-y-1.5 hover:shadow-glow hover:ring-gold-400/50 focus-visible:ring-gold-500"
                    }`}
                  >
                    <InvitationCard
                      design={{ ...design, template: t.id, personA: "नाव", personB: "नाव", host: "", time: "" }}
                      className="pointer-events-none aspect-[3/4] w-full"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-950/95 via-maroon-950/55 to-transparent px-2.5 pb-2 pt-8">
                      <span className="block font-marathi-display text-[12.5px] font-bold text-gold-200">{t.name}</span>
                      <span className="block text-[11px] font-semibold text-ivory-100/60">
                        {rupeesLabel(cardPaise)}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full transition-all duration-300 ${
                        selected ? "scale-100 bg-gold-500 text-maroon-950" : "scale-75 bg-maroon-950/60 text-transparent"
                      }`}
                    >
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <p id="template-hint" aria-live="polite" className="mt-2 min-h-[20px] text-[12.5px] font-medium text-ink-500">
            {activeTemplate ? `${activeTemplate.name} — ${activeTemplate.desc} · ${activeRupees} प्रीमियम` : "टेम्पलेट निवडा."}
          </p>
        </fieldset>

        <form
          ref={formRef}
          action={handleAction}
          noValidate
          id="design-form"
          aria-label="पत्रिका तपशील फॉर्म"
          className="mt-6 space-y-6"
        >
          <input type="hidden" name="design" value={JSON.stringify(design)} />

          <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6">
            <legend className="rounded-full bg-maroon-800 px-3.5 py-1 text-[11px] font-extrabold tracking-[0.14em] text-ivory-100 uppercase">
              १ · कार्यक्रम
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="f-event" className="label">कार्यक्रम प्रकार</label>
                <select
                  id="f-event"
                  value={design.eventType}
                  onChange={(e) => set("eventType", e.target.value)}
                  onBlur={() => mark("eventType")}
                  className="field min-h-[44px]"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.mr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-blessing" className="label">
                  {editorLang === "en" ? "Blessing / Invocation" : "मंगलाचरण / आशीर्वाद"}
                </label>
                <select
                  id="f-blessing"
                  value={design.blessing}
                  onChange={(e) => set("blessing", e.target.value)}
                  onBlur={() => mark("blessing")}
                  className="field min-h-[44px]"
                >
                  {(editorLang === "en" ? BLESSINGS_EN : BLESSINGS).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-date" className="label">दिनांक</label>
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
                  <p id="err-date" className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700">{showDate}</p>
                ) : null}
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6">
            <legend className="rounded-full bg-maroon-800 px-3.5 py-1 text-[11px] font-extrabold tracking-[0.14em] text-ivory-100 uppercase">
              २ · व्यक्ती
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor="f-personA" className="label">{isCouple ? "वर / यजमान व्यक्ती" : "नाव"}</label>
                  <span id="hint-personA" className="text-[11px] font-bold text-ink-400">
                    {toDevanagariDigits(design.personA.trim().length)} / २८
                  </span>
                </div>
                <input
                  id="f-personA"
                  required
                  maxLength={40}
                  value={design.personA}
                  onChange={(e) => set("personA", e.target.value)}
                  onBlur={() => mark("personA")}
                  placeholder="पूर्ण नाव"
                  aria-invalid={Boolean(showA)}
                  aria-describedby={showA ? "err-personA hint-personA" : "hint-personA"}
                  className="field font-marathi-display min-h-[44px]"
                />
                {showA ? (
                  <p id="err-personA" className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700">{showA}</p>
                ) : null}
              </div>
              {isCouple ? (
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <label htmlFor="f-personB" className="label">वधू / दुसरी व्यक्ती</label>
                    <span id="hint-personB" className="text-[11px] font-bold text-ink-400">
                      {toDevanagariDigits(design.personB.trim().length)} / २८
                    </span>
                  </div>
                  <input
                    id="f-personB"
                    required
                    maxLength={40}
                    value={design.personB}
                    onChange={(e) => set("personB", e.target.value)}
                    onBlur={() => mark("personB")}
                    placeholder="पूर्ण नाव"
                    aria-invalid={Boolean(showB)}
                    aria-describedby={showB ? "err-personB hint-personB" : "hint-personB"}
                    className="field font-marathi-display min-h-[44px]"
                  />
                  {showB ? (
                    <p id="err-personB" className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700">{showB}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6">
            <legend className="rounded-full bg-maroon-800 px-3.5 py-1 text-[11px] font-extrabold tracking-[0.14em] text-ivory-100 uppercase">
              ३ · वेळ व स्थळ
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="f-time" className="label">वेळ</label>
                <input
                  id="f-time"
                  value={design.time}
                  onChange={(e) => set("time", e.target.value)}
                  onBlur={() => mark("time")}
                  placeholder="उदा. दुपारी १२:३० वा."
                  className="field min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="f-city" className="label">शहर</label>
                <input
                  id="f-city"
                  value={design.city}
                  onChange={(e) => set("city", e.target.value)}
                  onBlur={() => mark("city")}
                  placeholder="पुणे"
                  aria-invalid={Boolean(showCity)}
                  aria-describedby={showCity ? "err-city" : undefined}
                  className="field min-h-[44px]"
                />
                {showCity ? (
                  <p id="err-city" className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700">{showCity}</p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-venue" className="label">स्थळ</label>
                <input
                  id="f-venue"
                  required
                  value={design.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  onBlur={() => mark("venue")}
                  placeholder="उदा. शिवनेरी लॉन्स, बाणेर"
                  aria-invalid={Boolean(showVenue)}
                  aria-describedby={showVenue ? "err-venue" : undefined}
                  className="field min-h-[44px]"
                />
                {showVenue ? (
                  <p id="err-venue" className="mt-1.5 animate-fade-in text-[12.5px] font-semibold text-maroon-700">{showVenue}</p>
                ) : null}
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6">
            <legend className="rounded-full bg-maroon-800 px-3.5 py-1 text-[11px] font-extrabold tracking-[0.14em] text-ivory-100 uppercase">
              ४ · यजमान ओळ
            </legend>
            <div>
              <label htmlFor="f-host" className="label">यजमान / विनंती ओळ</label>
              <input
                id="f-host"
                value={design.host}
                onChange={(e) => set("host", e.target.value)}
                onBlur={() => mark("host")}
                placeholder="उदा. श्री. देशमुख व कुलकर्णी कुटुंबीय"
                className="field min-h-[44px]"
              />
              <p className="mt-1.5 text-[12px] text-ink-400">
                ही ओळ कार्डच्या तळाशी दिसेल — कुटुंबाचं नाव प्रेमाने लिहा.
              </p>
            </div>
          </fieldset>

          {longName ? (
            <div aria-live="polite" className="flex animate-fade-in items-start gap-3 rounded-xl border border-gold-500/40 bg-gold-400/10 px-4 py-3">
              <Icon name="sparkle" className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
              <p className="text-[13px] leading-relaxed text-ink-700">
                <strong className="font-bold">स्मार्ट लेआउट सक्रिय:</strong> नाव मोठं असल्याने नाव-विभाग
                आपोआप २-प्लॅन लहान फॉन्टमध्ये बसवला जाईल — प्रिंट कधीच तुटणार नाही.
              </p>
            </div>
          ) : null}

          <section
            aria-labelledby="guard-title"
            className="rounded-2xl border border-maroon-900/10 bg-white/70 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p id="guard-title" className="flex min-h-[24px] items-center gap-2 text-[13px] font-extrabold tracking-wider text-ink-700 uppercase">
                <Icon name="shield" className="h-4 w-4 text-maroon-700" /> क्वालिटी गार्ड
              </p>
              <span id="guard-summary" aria-live="polite" className={`text-[12px] font-bold ${allOk ? "text-leaf-700" : "text-gold-700"}`}>
                {toDevanagariDigits(doneCount)}/{toDevanagariDigits(checks.length)} तपासण्या पूर्ण
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="क्वालिटी गार्ड प्रगती"
              aria-valuemin={0}
              aria-valuemax={checks.length}
              aria-valuenow={doneCount}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-900/10"
            >
              <div
                style={{ width: `${progressPct}%` }}
                className={`h-full rounded-full transition-[width] duration-500 ${allOk ? "bg-leaf-600" : "bg-gold-500"}`}
              />
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {checks.map((c) => (
                <li key={c.t} className="flex min-h-[28px] items-center gap-2 text-[13px]">
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full transition-all duration-300 ${c.ok ? "scale-100 bg-leaf-600/15 text-leaf-700" : "scale-95 bg-ink-900/8 text-ink-400"}`}
                  >
                    {c.ok ? <Icon name="check" className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                  </span>
                  <span className={`transition-colors duration-300 ${c.ok ? "text-ink-700" : "text-ink-400"}`}>{c.t}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving || !allOk}
              aria-describedby="guard-summary save-status"
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full bg-maroon-800 px-7 py-3.5 text-[15px] font-bold text-ivory-100 shadow-luxe transition enabled:hover:bg-maroon-700 enabled:hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              {isSaving ? (
                <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-ivory-100/40 border-t-ivory-100" />
              ) : saveStatus === "saved" ? (
                <Icon name="check" className="h-4 w-4 text-gold-300" strokeWidth={2.8} />
              ) : (
                <Icon name="check" className="h-4 w-4 text-gold-300" strokeWidth={2.4} />
              )}
              {isSaving ? "जतन होत आहे…" : saveStatus === "saved" ? "जतन झालं — वर्कस्पेस उघडत आहे" : "जतन करा व वर्कस्पेस उघडा"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-maroon-800/25 bg-white px-6 py-3.5 text-[15px] font-bold text-maroon-800 transition hover:border-gold-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
            >
              <Icon name="printer" className="h-5 w-5" />
              PDF / प्रिंट
            </button>
            <span className="text-[12.5px] font-semibold text-ink-400">
              {activeRupees} · प्रीमियम टेम्पलेट
            </span>
          </div>
          <p id="save-status" aria-live="polite" className="min-h-[20px] text-[12.5px] font-medium text-ink-500">
            {isSaving
              ? "सुरक्षित जतन सुरू आहे — कृपया थांबा."
              : saveStatus === "saved"
                ? "रचना जतन झाली — वर्कस्पेस उघडत आहे."
                : allOk
                  ? "सर्व तपासण्या पूर्ण — जतन तयार."
                  : "क्वालिटी गार्ड पूर्ण करा — मग जतन सक्रिय होईल."}
          </p>
          {saveError ? (
            <div
              role="alert"
              className="flex animate-fade-in flex-wrap items-center justify-between gap-3 rounded-xl border border-maroon-700/30 bg-maroon-700/5 px-4 py-3"
            >
              <p className="text-[13.5px] font-semibold text-maroon-800">{saveError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-maroon-800 px-5 py-2.5 text-[13.5px] font-bold text-ivory-100 transition hover:bg-maroon-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
              >
                पुन्हा प्रयत्न करा
              </button>
            </div>
          ) : null}
        </form>
      </div>

      <section
        id="studio-preview"
        aria-label="थेट प्रिव्ह्यू"
        className="animate-fade-up lg:sticky lg:top-28 lg:self-start"
        style={{ animationDelay: "140ms" }}
      >
        <div className="flex min-h-[28px] items-center justify-between gap-2">
          <p className="label mb-0">लाइव्ह प्रिव्ह्यू</p>
          <span className="flex items-center gap-1.5 rounded-full bg-leaf-600/10 px-2.5 py-1 text-[11px] font-bold text-leaf-700 ring-1 ring-leaf-600/25">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-leaf-600" /> ६० FPS
          </span>
        </div>
        <div className="mt-3 rounded-2xl bg-paisley-dark p-6 shadow-card sm:p-10">
          <div aria-live="polite" aria-label="आमंत्रण प्रिव्ह्यू">
            <InvitationCard design={design} id="print-card" className="mx-auto max-w-[380px]" />
          </div>
          {previewEmpty ? (
            <div className="mx-auto mt-5 max-w-[380px] rounded-xl border border-gold-400/25 bg-ivory-100/5 px-4 py-3 text-center">
              <p className="text-[13px] font-bold text-gold-200">अजून तपशील भरा</p>
              <p className="mt-0.5 text-[12px] text-ivory-100/60">
                नाव, दिनांक व स्थळ लिहिल्यावर प्रिव्ह्यू आपोआप जुळेल.
              </p>
            </div>
          ) : null}
          <p className="mt-6 text-center text-[11px] tracking-[0.18em] text-gold-300/70 uppercase">
            WYSIWYP — जे दिसतंय, तेच छापलं जाईल
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gold-400/40 px-5 py-2.5 text-[13px] font-bold text-gold-200 transition hover:border-gold-300 hover:text-gold-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
            >
              <Icon name="printer" className="h-4 w-4" />
              प्रिव्ह्यू प्रिंट करा
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-maroon-900/10 bg-white/70 px-4 py-3">
          <Icon name="eye" className="mt-0.5 h-4 w-4 shrink-0 text-maroon-700" />
          <p className="text-[12.5px] leading-relaxed text-ink-500">
            {activeTemplate ? `${activeTemplate.name} · ` : ""}प्रत्येक अक्षर बदलताच प्रिव्ह्यू क्षणार्धात जुळतो — स्क्रोल न करता तपासा.
          </p>
        </div>
      </section>
    </div>
  );
}
