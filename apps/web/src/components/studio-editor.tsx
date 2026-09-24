"use client";

import { InvitationCard } from "@/components/invitation-card";
import { Icon } from "@/components/ui";
import { saveStudioDesign } from "@/app/studio/actions";
import {
  BLESSINGS,
  DEFAULT_DESIGN,
  EVENT_TYPES,
  TEMPLATES,
  type DesignData,
  type TemplateId,
} from "@/lib/arch-data";
import { useRef, useState, useTransition } from "react";

export function StudioEditor() {
  const [design, setDesign] = useState<DesignData>(DEFAULT_DESIGN);
  const [saving, startSave] = useTransition();
  const printRef = useRef<HTMLButtonElement>(null);

  const set = <K extends keyof DesignData>(k: K, v: DesignData[K]) =>
    setDesign((d) => ({ ...d, [k]: v }));

  const isCouple = design.eventType === "wedding" || design.eventType === "engagement";

  /* ── Quality Guard — प्रिंटपूर्वी तपासणी ── */
  const checks = [
    { ok: design.personA.trim().length > 1, t: "पहिलं नाव भरलं" },
    { ok: !isCouple || design.personB.trim().length > 1, t: isCouple ? "दुसरं नाव भरलं" : "एकच नाव — बरोबर" },
    { ok: Boolean(design.date), t: "दिनांक निवडला" },
    { ok: design.venue.trim().length > 2, t: "स्थळ स्पष्ट आहे" },
    { ok: design.personA.length <= 28 && (!isCouple || design.personB.length <= 28), t: "नावं स्मार्ट-लेआउट मर्यादेत" },
  ];
  const allOk = checks.every((c) => c.ok);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
      {/* ── Form panel ── */}
      <div>
        {/* template picker */}
        <p className="label">टेम्पलेट निवडा</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set("template", t.id as TemplateId)}
              className={`group relative overflow-hidden rounded-xl text-left ring-2 transition ${
                design.template === t.id
                  ? "ring-gold-500 shadow-glow"
                  : "ring-transparent hover:ring-gold-400/40"
              }`}
            >
              <InvitationCard
                design={{ ...design, template: t.id, personA: "नाव", personB: "नाव", host: "", time: "" }}
                className="pointer-events-none aspect-[3/4]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-maroon-950/90 to-transparent px-2.5 pb-2 pt-8">
                <p className="font-marathi-display text-[12.5px] font-bold text-gold-200">{t.name}</p>
              </div>
              {design.template === t.id && (
                <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-gold-500 text-maroon-950">
                  <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* fields */}
        <form
          action={(fd) => startSave(() => saveStudioDesign(fd))}
          className="mt-8 space-y-5"
          id="design-form"
        >
          <input type="hidden" name="design" value={JSON.stringify(design)} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">कार्यक्रम प्रकार</label>
              <select className="field" value={design.eventType} onChange={(e) => set("eventType", e.target.value)}>
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.mr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">मंगलाचरण / आशीर्वाद</label>
              <select className="field" value={design.blessing} onChange={(e) => set("blessing", e.target.value)}>
                {BLESSINGS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{isCouple ? "वर / यजमान व्यक्ती" : "नाव"}</label>
              <input className="field font-marathi-display" value={design.personA} onChange={(e) => set("personA", e.target.value)} placeholder="पूर्ण नाव" />
            </div>
            {isCouple && (
              <div>
                <label className="label">वधू / दुसरी व्यक्ती</label>
                <input className="field font-marathi-display" value={design.personB} onChange={(e) => set("personB", e.target.value)} placeholder="पूर्ण नाव" />
              </div>
            )}
            <div>
              <label className="label">दिनांक</label>
              <input type="date" className="field" value={design.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="label">वेळ</label>
              <input className="field" value={design.time} onChange={(e) => set("time", e.target.value)} placeholder="उदा. दुपारी १२:३० वा." />
            </div>
            <div>
              <label className="label">स्थळ</label>
              <input className="field" value={design.venue} onChange={(e) => set("venue", e.target.value)} placeholder="उदा. शिवनेरी लॉन्स, बाणेर" />
            </div>
            <div>
              <label className="label">शहर</label>
              <input className="field" value={design.city} onChange={(e) => set("city", e.target.value)} placeholder="पुणे" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">यजमान / विनंती ओळ</label>
              <input className="field" value={design.host} onChange={(e) => set("host", e.target.value)} placeholder="उदा. श्री. देशमुख व कुलकर्णी कुटुंबीय" />
            </div>
          </div>

          {/* smart layout hint */}
          {(design.personA.length > 22 || (isCouple && design.personB.length > 22)) && (
            <div className="flex items-start gap-3 rounded-xl border border-gold-500/40 bg-gold-400/10 px-4 py-3">
              <Icon name="sparkle" className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold-600" />
              <p className="text-[13px] leading-relaxed text-ink-700">
                <strong className="font-bold">स्मार्ट लेआउट सक्रिय:</strong> नाव मोठं असल्याने नाव-विभाग
                आपोआप २-प्लॅन लहान फॉन्टमध्ये बसवला जाईल — प्रिंट कधीच तुटणार नाही.
              </p>
            </div>
          )}

          {/* quality guard */}
          <div className="rounded-xl border border-maroon-900/10 bg-white/70 p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-wider text-ink-700 uppercase">
                <Icon name="shield" className="h-4 w-4 text-maroon-700" /> क्वालिटी गार्ड
              </p>
              <span className={`text-[12px] font-bold ${allOk ? "text-leaf-700" : "text-gold-700"}`}>
                {checks.filter((c) => c.ok).length}/{checks.length} तपासण्या पूर्ण
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {checks.map((c) => (
                <div key={c.t} className="flex items-center gap-2 text-[13px]">
                  <span className={`grid h-4.5 w-4.5 place-items-center rounded-full ${c.ok ? "bg-leaf-600/15 text-leaf-700" : "bg-ink-900/8 text-ink-400"}`}>
                    {c.ok ? <Icon name="check" className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                  </span>
                  <span className={c.ok ? "text-ink-700" : "text-ink-400"}>{c.t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving || !allOk}
              className="inline-flex items-center gap-2.5 rounded-full bg-maroon-800 px-7 py-3.5 text-[15px] font-bold text-ivory-100 shadow-luxe transition enabled:hover:bg-maroon-700 enabled:hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory-100/40 border-t-ivory-100" />
              ) : (
                <Icon name="check" className="h-4 w-4 text-gold-300" strokeWidth={2.4} />
              )}
              जतन करा व वर्कस्पेस उघडा
            </button>
            <button
              type="button"
              ref={printRef}
              onClick={() => window.print()}
              className="inline-flex items-center gap-2.5 rounded-full border border-maroon-800/25 bg-white px-6 py-3.5 text-[15px] font-bold text-maroon-800 transition hover:border-gold-500"
            >
              <Icon name="printer" className="h-4.5 w-4.5" />
              PDF / प्रिंट
            </button>
            <span className="text-[12.5px] font-semibold text-ink-400">
              ₹{TEMPLATES.find((t) => t.id === design.template)?.price} · प्रीमियम टेम्पलेट
            </span>
          </div>
        </form>
      </div>

      {/* ── Live preview ── */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-center justify-between">
          <p className="label mb-0">लाइव्ह प्रिव्ह्यू</p>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-leaf-700">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-leaf-600" /> ६० FPS
          </span>
        </div>
        <div className="mt-3 rounded-2xl bg-paisley-dark p-6 shadow-card sm:p-10">
          <InvitationCard design={design} id="print-card" className="mx-auto max-w-[380px]" />
          <p className="mt-6 text-center text-[11px] tracking-[0.18em] text-gold-300/70 uppercase">
            WYSIWYP — जे दिसतंय, तेच छापलं जाईल
          </p>
        </div>
      </div>
    </div>
  );
}
