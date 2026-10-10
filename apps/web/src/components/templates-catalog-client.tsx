"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EVENT_CATEGORIES,
  MASTER_TEMPLATES,
  type EventCategory,
  type MasterTemplate,
} from "@/lib/templates-catalog";
import { PageBanner } from "@/components/page-banner";
import { MasterTemplateCard } from "@/components/master-template-card";
import { toDevanagariDigits } from "@/lib/format";
import { useLanguage } from "@/context/language-context";

const BADGE_LABELS_MR: Record<string, string> = {
  ROYAL: "राजेशाही",
  "3D GOLD": "३डी गोल्ड",
  POPULAR: "लोकप्रिय",
  NEW: "नवीन",
  HERITAGE: "पारंपरिक",
  TRENDING: "ट्रेंडिंग",
};

export function TemplatesCatalogClient() {
  const { isEn, isHi } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">(() =>
    EVENT_CATEGORIES.some((cat) => cat.id === categoryParam)
      ? (categoryParam as EventCategory | "all")
      : "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [lightboxTemplate, setLightboxTemplate] = useState<MasterTemplate | null>(null);

  useEffect(() => {
    if (!categoryParam) return;
    if (EVENT_CATEGORIES.some((cat) => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam as EventCategory | "all");
    }
  }, [categoryParam]);

  const selectCategory = (id: EventCategory | "all") => {
    setSelectedCategory(id);
    router.replace(id === "all" ? "/templates" : `/templates?category=${id}`, { scroll: false });
  };

  const badgeLabel = (badge: string) =>
    isEn ? badge : (BADGE_LABELS_MR[badge] ?? badge);

  // Badges list
  const availableBadges = ["all", "ROYAL", "3D GOLD", "POPULAR", "NEW", "HERITAGE", "TRENDING"];

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return MASTER_TEMPLATES.filter((tmpl) => {
      // Category filter
      if (selectedCategory !== "all" && tmpl.category !== selectedCategory) {
        return false;
      }
      // Badge filter
      if (selectedBadge !== "all" && tmpl.badge !== selectedBadge) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNameMr = tmpl.nameMr.toLowerCase().includes(q);
        const matchNameEn = tmpl.nameEn.toLowerCase().includes(q);
        const matchDescMr = tmpl.descMr.toLowerCase().includes(q);
        const matchCity = tmpl.sample.city.toLowerCase().includes(q);
        const matchPerson = tmpl.sample.personA.toLowerCase().includes(q) || (tmpl.sample.personB && tmpl.sample.personB.toLowerCase().includes(q));
        if (!matchNameMr && !matchNameEn && !matchDescMr && !matchCity && !matchPerson) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedBadge, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 sm:py-12">
      <div className="shell space-y-8">
        {/* Unified Top Banner */}
        <PageBanner
          kicker={
            isEn
              ? "Artisan Marathi Patrika Catalog • 50+ Master Designs"
              : "राजेशाही पत्रिका कॅटलॉग • ५०+ अस्सल नमुने"
          }
          title={
            isEn
              ? "Royal Invitation & Patrika Templates"
              : "सर्व पत्रिका व आमंत्रण टेम्पलेट्स"
          }
          description={
            isEn
              ? "Authentic Maharashtrian cultural card templates for Wedding, Sakharpuda, Satyanarayan, Vastu Shanti and Family Celebrations. Direct WYSIWYG edit & 300 DPI press-ready download."
              : "विवाह, साखरपुडा, सत्यनारायण पूजा, वास्तुशांती व कौटुंबिक सोहळ्यांसाठी महाराष्ट्रातील अस्सल कलात्मक डिझाईन्स. थेट संपादन करा किंवा ३०० DPI प्रिंट-रेडी डाऊनलोड करा."
          }
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/studio"
                className="btn-base btn-maroon text-xs sm:text-sm font-bold shadow-md"
              >
                ✨ {isEn ? "Open Studio" : "स्टुडिओ उघडा"}
              </Link>
              <Link
                href="/studio/editor"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-ink-900 shadow-2xs hover:bg-[#fffdf8] transition"
              >
                🎨 {isEn ? "Canva Pro Editor" : "कॅनव्हा प्रो एडिटर"}
              </Link>
            </div>
          }
        />

        {/* Filter Controls Bar */}
        <div className="space-y-4 rounded-2xl border border-[#ead9b8] bg-white/95 p-4 sm:p-6 shadow-sm backdrop-blur-md">
          {/* Search Input & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[260px]">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8a7f76]">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? "Search template by name, city, style (e.g. Pune, Floral, Ganesh)..."
                    : "टेम्पलेटचे नाव, शहर, शैली शोधा (उदा. पुणे, मयूर, सत्यनारायण, साखरपुडा)..."
                }
                className="w-full rounded-xl border border-[#ead9b8] bg-ivory-warm pl-10 pr-4 py-2.5 text-xs sm:text-sm text-ink-900 placeholder:text-charcoal-muted outline-none transition focus:border-maroon focus:ring-2 focus:ring-gold/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-neutral-700"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300/60">
                {toDevanagariDigits(filteredTemplates.length)} {isEn ? "templates" : "डिझाइन्स उपलब्ध"}
              </span>
            </div>
          </div>

          {/* Event Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {EVENT_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategory(cat.id)}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition border ${
                    active
                      ? "bg-maroon text-gold-shimmer border-transparent shadow-xs"
                      : "bg-ivory-warm text-charcoal-soft border-[#ead9b8] hover:border-maroon/50 hover:bg-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{isEn ? cat.en : isHi ? cat.hi : cat.mr}</span>
                  {cat.id === "all" && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                      {MASTER_TEMPLATES.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Badge Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#f4ede0] text-xs">
            <span className="text-[11px] font-bold text-[#8a7f76] mr-1">
              {isEn ? "Style Tag:" : "शैली:"}
            </span>
            {availableBadges.map((badge) => {
              const active = selectedBadge === badge;
              return (
                <button
                  key={badge}
                  type="button"
                  onClick={() => setSelectedBadge(badge)}
                  className={`inline-flex min-h-11 items-center rounded-lg px-3 text-[11px] font-bold uppercase transition ${
                    active
                      ? "bg-ink-900 text-gold-bright shadow-xs"
                      : "bg-[#f4efe6] text-[#6d635b] hover:bg-[#eae3d5]"
                  }`}
                >
                  {badge === "all" ? (isEn ? "All Tags" : "सर्व प्रकार") : badgeLabel(badge)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="rounded-3xl border border-[#ead9b8] bg-white p-12 text-center shadow-sm">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-3 font-marathi-display text-lg font-bold text-ink-900">
              {isEn ? "No matching templates found" : "कोणतेही टेम्पलेट सापडले नाही"}
            </h3>
            <p className="mt-1 text-sm text-[#78716c]">
              {isEn
                ? "Try changing your search term or select 'All' categories."
                : "कृपया शोध शब्द बदला किंवा 'सर्व पत्रिका डिझाइन्स' निवडा."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                selectCategory("all");
                setSelectedBadge("all");
              }}
              className="btn-base btn-maroon mt-4 text-xs font-bold shadow-xs"
            >
              {isEn ? "Reset Filters" : "फिल्टर्स पूर्ववत करा"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTemplates.map((tmpl) => {
              const photoUrl = tmpl.sample?.photoUrl || tmpl.placeholders?.photoUrl;
              return (
                <div
                  key={tmpl.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#ead9b8] bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400"
                >
                  {/* Visual Card Image / Artwork View */}
                  <div
                    className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900 cursor-pointer"
                    onClick={() => setLightboxTemplate(tmpl)}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={tmpl.nameMr}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="pointer-events-none absolute left-0 top-0 w-[161%] origin-top-left scale-[0.62]">
                        <MasterTemplateCard
                          template={tmpl}
                          data={{
                            ...tmpl.sample,
                            blessing: tmpl.defaultBlessing,
                            title: tmpl.defaultTitle,
                          }}
                        />
                      </div>
                    )}

                    {/* Gradient Overlay & Badge */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-400/40">
                        {badgeLabel(tmpl.badge)}
                      </span>
                      {tmpl.sample.city && (
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-neutral-800 backdrop-blur-md">
                          📍 {tmpl.sample.city}
                        </span>
                      )}
                    </div>

                    {/* Quick Preview Hover Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxTemplate(tmpl);
                      }}
                      className="absolute top-2.5 right-2.5 grid size-11 place-items-center rounded-full bg-white/90 text-neutral-800 shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition hover:bg-white"
                      title={isEn ? "Full Preview" : "मोठा प्रिव्ह्यू"}
                    >
                      🔍
                    </button>

                    {/* Bottom Title Overlay */}
                    <div className="absolute bottom-2.5 inset-x-3 text-left">
                      <p className="font-marathi-display text-sm font-bold text-white drop-shadow-md line-clamp-1">
                        {tmpl.nameMr}
                      </p>
                      <p className="text-xs text-amber-200/90 line-clamp-1">
                        {tmpl.sample.personA} {tmpl.sample.personB ? `• ${tmpl.sample.personB}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Details & Actions Footer */}
                  <div className="flex flex-1 flex-col justify-between p-3.5 bg-gradient-to-b from-white to-[#fffcf8]">
                    <p className="text-xs text-[#6b625b] line-clamp-2 leading-relaxed">
                      {isEn ? tmpl.descEn : tmpl.descMr}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-[#f2e7d5] flex items-center gap-2">
                      <Link
                        href={`/studio?template=${tmpl.id}`}
                        className="btn-base btn-maroon flex-1 px-2 text-[11px] font-bold shadow-xs"
                      >
                        ✍️ {isEn ? "Edit Card" : "संपादित करा"}
                      </Link>
                      <Link
                        href={`/studio/editor?template=${tmpl.id}#design-form`}
                        target="_blank"
                        className="inline-flex min-h-11 items-center rounded-xl border border-amber-300 bg-amber-50/80 px-2.5 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition"
                        title={isEn ? "Open in Canva Pro Canvas" : "कॅनव्हा प्रो कॅनव्हासमध्ये उघडा"}
                      >
                        🎨 प्रो
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── HIGH RESOLUTION LIGHTBOX MODAL ── */}
      {lightboxTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxTemplate(null)}
        >
          <div
            className="relative flex flex-col max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-400/50 bg-ink-900 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-400/20 bg-black/40 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40">
                  {badgeLabel(lightboxTemplate.badge)}
                </span>
                <h3 className="font-marathi-display text-base sm:text-lg font-bold text-amber-100 truncate">
                  {lightboxTemplate.nameMr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxTemplate(null)}
                className="btn-icon rounded-full bg-white/10 text-white hover:bg-white/20 transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-[#0d030e]">
              {lightboxTemplate.sample?.photoUrl ? (
                <div className="relative max-h-[64vh] overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-2xl">
                  <img
                    src={lightboxTemplate.sample.photoUrl}
                    alt={lightboxTemplate.nameMr}
                    className="max-h-[64vh] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="relative h-80 w-64 overflow-hidden rounded-2xl border-2 border-amber-400/40 shadow-2xl">
                  <div className="pointer-events-none absolute left-0 top-0 w-[213%] origin-top-left scale-[0.47]">
                    <MasterTemplateCard
                      template={lightboxTemplate}
                      data={{
                        ...lightboxTemplate.sample,
                        blessing: lightboxTemplate.defaultBlessing,
                        title: lightboxTemplate.defaultTitle,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Sample Details */}
              <div className="mt-4 w-full rounded-xl bg-white/5 p-3.5 border border-amber-400/20 text-xs space-y-1">
                <p className="text-amber-200/90 font-bold">
                  {lightboxTemplate.defaultBlessing}
                </p>
                <p className="text-ivory-300">
                  {lightboxTemplate.descMr}
                </p>
                <div className="pt-1 text-[11px] text-amber-300/80 flex flex-wrap gap-x-3 gap-y-1">
                  <span>📍 {lightboxTemplate.sample.venue}, {lightboxTemplate.sample.city}</span>
                  <span>📅 {lightboxTemplate.sample.date}</span>
                  <span>⏰ {lightboxTemplate.sample.time}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-400/20 bg-black/60 px-5 py-3.5">
              <span className="text-xs text-amber-300/80 font-bold">
                {isEn ? "100% Free · HD Download" : "१००% मोफत · थेट छपाई-सज्ज"}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/studio?template=${lightboxTemplate.id}`}
                  onClick={() => setLightboxTemplate(null)}
                  className="btn-base btn-maroon px-4 text-xs font-bold shadow-md"
                >
                  ✍️ {isEn ? "Edit in Studio" : "स्टुडिओत उघडा"}
                </Link>
                <Link
                  href={`/studio/editor?template=${lightboxTemplate.id}#design-form`}
                  target="_blank"
                  className="inline-flex min-h-11 items-center rounded-xl border border-amber-400/60 bg-amber-400/10 px-3.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
                >
                  🎨 {isEn ? "Canva Pro" : "कॅनव्हा प्रो"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
