"use client";

import React, { useState } from "react";
import { type MasterTemplate } from "@/lib/templates-catalog";
import {
  BaroqueCorner,
  FloralFlourishDivider,
  LaceFretworkBorder,
  RoyalGaneshCrest,
  ShreeGaneshayCalligraphy,
  TempleArchTop,
} from "./biodata-ornaments";
import {
  FluteAndButterPot,
  HaldiKumkumThali,
  HangingBrassTempleBells,
  InterlockedGoldRings,
  LocationQrBadge,
  MundavalyaGarland,
  PeacockFeatherMotif,
  RoyalMarathaKatyar,
  SnehNimantranRibbon,
  TutariVadakMusicians,
  VelvetCurtainDrapes,
} from "./event-ornaments";
import { RoyalVelvetGaneshCard, type RoyalBgColor, type RoyalFoilType } from "./royal-velvet-card";

export interface CardRenderData {
  personA: string;
  personB?: string;
  surnames?: string;
  date?: string;
  time?: string;
  venue?: string;
  city?: string;
  host?: string;
  parentsA?: string;
  parentsB?: string;
  tagline?: string;
  blessing?: string;
  title?: string;
  qrLocation?: string;
  photoUrl?: string;
  foilColor?: RoyalFoilType;
  bgColor?: RoyalBgColor;
}

export function MasterTemplateCard({
  template,
  data,
  isBlankPlaceholder = false,
  className = "",
  id,
  foilColor,
  bgColor,
}: {
  template: MasterTemplate;
  data: CardRenderData;
  isBlankPlaceholder?: boolean;
  className?: string;
  id?: string;
  foilColor?: RoyalFoilType;
  bgColor?: RoyalBgColor;
}) {
  const [photoError, setPhotoError] = useState(false);

  // Values prioritizing user data or template placeholders/sample
  const blessing =
    data.blessing || template.defaultBlessing || "॥ श्री गणेशाय नमः ॥";
  const title = data.title || template.defaultTitle || "आमंत्रण पत्रिका";

  const personA =
    data.personA ||
    (isBlankPlaceholder
      ? template.placeholders.personA
      : template.sample.personA);
  const personB =
    data.personB !== undefined
      ? data.personB
      : isBlankPlaceholder
        ? template.placeholders.personB
        : template.sample.personB;
  const surnames =
    data.surnames ||
    (isBlankPlaceholder
      ? template.placeholders.surnames
      : template.sample.surnames);
  const date =
    data.date ||
    (isBlankPlaceholder ? template.placeholders.date : template.sample.date);
  const time =
    data.time ||
    (isBlankPlaceholder ? template.placeholders.time : template.sample.time);
  const venue =
    data.venue ||
    (isBlankPlaceholder ? template.placeholders.venue : template.sample.venue);
  const city =
    data.city ||
    (isBlankPlaceholder ? template.placeholders.city : template.sample.city);
  const host =
    data.host ||
    (isBlankPlaceholder ? template.placeholders.host : template.sample.host);
  const parentsA =
    data.parentsA ||
    (isBlankPlaceholder
      ? template.placeholders.parentsA
      : template.sample.parentsA);
  const parentsB =
    data.parentsB ||
    (isBlankPlaceholder
      ? template.placeholders.parentsB
      : template.sample.parentsB);
  const tagline =
    data.tagline ||
    (isBlankPlaceholder
      ? template.placeholders.tagline
      : template.sample.tagline);
  const qrLocation =
    data.qrLocation ||
    (isBlankPlaceholder
      ? template.placeholders.qrLocation
      : template.sample.qrLocation);
  const photoUrl =
    data.photoUrl ||
    (isBlankPlaceholder
      ? template.placeholders.photoUrl
      : template.sample.photoUrl);

  const hasPhoto = Boolean(photoUrl && !photoError);

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 0: ROYAL VELVET GANESHA EMBOSSED FOIL (Exact Match to User Reference)
     24K Gold & 925 Silver on Deep Velvet (Purple, Navy, Emerald, Maroon, Black)
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "royal-velvet-ganesh") {
    return (
      <RoyalVelvetGaneshCard
        template={template}
        data={data}
        isBlankPlaceholder={isBlankPlaceholder}
        className={className}
        foilType={data.foilColor || foilColor}
        bgColor={data.bgColor || bgColor}
        id={id}
      />
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 1: SPLIT PHOTO & FLORAL ARCH (Reference Image 2 Style)
     Wooden floral rose arch on right with couple, die-cut window on left with toran
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "split-photo") {
    return (
      <div
        id={id}
        className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-maroon-950 select-none bg-[#fdfbf7] border-2 border-gold-500/60 print:shadow-none print:max-w-none print:rounded-none ${className}`}
      >
        {/* Top Right Ribbon Badge */}
        <div className="absolute top-0 right-4 z-20">
          <SnehNimantranRibbon />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] min-h-[480px]">
          {/* Left Parchment Window */}
          <div className="relative p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gold-400/40 bg-gradient-to-br from-ivory via-white to-ivory-warm">
            {/* Mundavalya Pearl Garland */}
            <div className="flex justify-center -mt-2">
              <MundavalyaGarland />
            </div>

            {/* Ganesh Crest & Surnames */}
            <div className="text-center mt-2">
              <RoyalGaneshCrest color="#c2410c" size={36} />
              <p className="text-[10px] font-bold tracking-widest text-maroon-700 uppercase mt-0.5">
                {blessing}
              </p>
              {surnames && (
                <div className="my-2 inline-block rounded-lg bg-maroon-900/10 px-3 py-1 border border-maroon-900/20">
                  <span className="font-marathi-display text-sm font-black text-maroon-900 tracking-wider">
                    {surnames}
                  </span>
                </div>
              )}
            </div>

            {/* Names & Parents */}
            <div className="text-center my-2 space-y-1">
              <div>
                <p className="text-[11px] font-bold text-maroon-700">चि.</p>
                <h3 className="font-marathi-display text-2xl font-black text-maroon-950 leading-tight">
                  {personA}
                </h3>
                {parentsA && (
                  <p className="text-[10px] text-ink-600 leading-tight max-w-[220px] mx-auto mt-0.5">
                    {parentsA}
                  </p>
                )}
              </div>

              {personB && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-maroon-700">चि.सौ.कां.</p>
                  <h3 className="font-marathi-display text-2xl font-black text-maroon-950 leading-tight">
                    {personB}
                  </h3>
                  {parentsB && (
                    <p className="text-[10px] text-ink-600 leading-tight max-w-[220px] mx-auto mt-0.5">
                      {parentsB}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Event Title Badge */}
            <div className="text-center my-2">
              <div className="inline-block rounded-full bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 px-4 py-1 shadow-sm border border-gold-600">
                <span className="font-marathi-display text-sm font-black text-maroon-950 tracking-wide">
                  ॥ {title} ॥
                </span>
              </div>
            </div>

            {/* Date, Time & Venue */}
            <div className="rounded-xl border border-gold-400/40 bg-gold-50/60 p-2.5 text-center text-xs space-y-0.5 mt-2">
              <p className="font-bold text-maroon-900">{date} · {time}</p>
              <p className="font-semibold text-ink-800">{venue}</p>
              {city && <p className="text-ink-600 text-[11px]">{city}</p>}
            </div>

            {/* Bottom: Host & Location QR */}
            <div className="mt-3 pt-2 border-t border-gold-400/30 flex items-center justify-between gap-2">
              <div className="text-left text-[10px] leading-tight">
                <p className="font-bold text-maroon-900">{host}</p>
                <p className="text-ink-500 mt-0.5">{tagline}</p>
              </div>
              <LocationQrBadge qrValue={qrLocation} />
            </div>
          </div>

          {/* Right Side Couple Photo with Floral Rose Arch */}
          <div className="relative min-h-[300px] md:min-h-[480px] bg-gradient-to-b from-maroon-950 to-maroon-900 flex flex-col justify-end overflow-hidden p-4">
            {hasPhoto ? (
              <img
                src={photoUrl}
                alt="Couple"
                className="absolute inset-0 size-full object-cover"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-amber-100 to-amber-200 text-maroon-900 font-display font-bold">
                <div className="text-center p-4">
                  <span className="text-4xl">📸</span>
                  <p className="text-xs mt-2 font-bold">{isBlankPlaceholder ? "[कपल फोटो येथे दिसेल]" : "फोटो"}</p>
                </div>
              </div>
            )}
            {/* Subtle Gradient Shadow on Photo Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-maroon-950/90 to-transparent pointer-events-none" />
            <div className="relative text-center text-ivory-100 z-10">
              <p className="font-marathi-display text-lg font-bold drop-shadow">
                {surnames || "मंगल सोहळा"}
              </p>
              <p className="text-[11px] text-gold-300 font-semibold drop-shadow">
                {title}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 2: 3D GOLD RINGS & VELVET DRAPES (Reference Image 4 Style)
     Interlocking 3D gold diamond rings, red satin drapes, tutari vadak musicians
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "rings-velvet") {
    return (
      <div
        id={id}
        className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-ivory-100 select-none border-2 border-gold-500/70 print:shadow-none print:max-w-none print:rounded-none ${className}`}
        style={{
          background: "linear-gradient(175deg, #3d0716 0%, #20030a 55%, #100104 100%)",
        }}
      >
        {/* Red Satin Theatrical Drapes along top */}
        <VelvetCurtainDrapes />

        {/* Dual Gold Borders */}
        <div className="absolute inset-[8px] rounded-xl border border-gold-400/40 pointer-events-none" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10 text-center">
          {/* Blessing & Ganesh Icon */}
          <div className="flex flex-col items-center">
            <RoyalGaneshCrest color="#fbbf24" size={42} />
            <p className="mt-1 text-[11px] font-bold tracking-[0.25em] text-gold-300 uppercase">
              {blessing}
            </p>
          </div>

          {/* Surnames Banner */}
          {surnames && (
            <p className="mt-2 text-xs font-bold tracking-widest text-gold-200 uppercase">
              {surnames}
            </p>
          )}

          {/* Couple Names Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 items-center">
            <div className="text-right border-r border-gold-500/30 pr-3">
              <p className="text-[11px] font-semibold text-gold-300">चि.सौ.कां.</p>
              <h3 className="font-marathi-display text-xl sm:text-2xl font-black text-ivory-100 leading-snug">
                {personA}
              </h3>
              {parentsA && (
                <p className="text-[9.5px] text-ivory-100/70 leading-tight mt-0.5">
                  {parentsA}
                </p>
              )}
            </div>

            <div className="text-left pl-3">
              <p className="text-[11px] font-semibold text-gold-300">चि.</p>
              <h3 className="font-marathi-display text-xl sm:text-2xl font-black text-ivory-100 leading-snug">
                {personB || personA}
              </h3>
              {parentsB && (
                <p className="text-[9.5px] text-ivory-100/70 leading-tight mt-0.5">
                  {parentsB}
                </p>
              )}
            </div>
          </div>

          {/* 3D Interlocking Gold Rings Motif */}
          <div className="my-4">
            <InterlockedGoldRings size={68} />
          </div>

          {/* Ornate Purple Shield Badge for Title */}
          <div className="my-2">
            <div className="inline-block rounded-2xl bg-gradient-to-r from-purple-900 via-fuchsia-950 to-purple-900 px-6 py-2 border-2 border-gold-400 shadow-glow">
              <span className="font-marathi-display text-xl sm:text-2xl font-black text-gold-200 tracking-wide drop-shadow">
                {title}
              </span>
            </div>
          </div>

          {/* Date, Time & Auspicious Notice */}
          <div className="mt-3 space-y-1 text-xs text-ivory-100/90 leading-relaxed max-w-sm mx-auto">
            <p className="font-bold text-gold-300 text-sm">{date} · {time}</p>
            <p className="text-gold-100/80 text-[11.5px]">{tagline}</p>
          </div>

          {/* Venue & City Box */}
          <div className="mt-4 rounded-xl border border-gold-500/30 bg-maroon-950/60 p-3 max-w-md mx-auto">
            <p className="text-[10.5px] font-bold text-gold-300 uppercase tracking-widest">
              ॥ कार्यस्थळ ॥
            </p>
            <p className="mt-1 font-semibold text-ivory-100 text-xs sm:text-sm">{venue}</p>
            {city && <p className="text-ivory-100/70 text-[11px] mt-0.5">{city}</p>}
          </div>

          {/* Tutari Vadak Traditional Musicians */}
          <div className="mt-5">
            <TutariVadakMusicians color="#fde047" />
          </div>

          {/* Host Family Notice */}
          <div className="mt-3 text-center">
            <p className="text-xs font-bold text-gold-300">{host}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 3: KRISHNA FESTIVAL / POOJA (Reference Image 1 Style)
     Peacock feathers, brass temple bells, golden butter pot, flute, divine aura
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "krishna-divine") {
    return (
      <div
        id={id}
        className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-maroon-950 select-none bg-[#fdfbf7] border-2 border-amber-500/60 print:shadow-none print:max-w-none print:rounded-none ${className}`}
      >
        {/* Hanging Brass Bells from Top Corners */}
        <div className="absolute top-0 left-2 z-10">
          <HangingBrassTempleBells />
        </div>
        <div className="absolute top-0 right-2 z-10 -scale-x-100">
          <HangingBrassTempleBells />
        </div>

        {/* Top Center Peacock Feather Aura */}
        <div className="flex justify-center pt-4">
          <PeacockFeatherMotif size={64} />
        </div>

        <div className="relative px-6 pb-6 pt-2 sm:px-9 text-center">
          {/* Header Organization / Family Name */}
          <h2 className="font-marathi-display text-lg sm:text-xl font-black text-maroon-900">
            {personA}
          </h2>
          {surnames && (
            <p className="text-xs font-bold tracking-widest text-amber-700 uppercase mt-0.5">
              {surnames}
            </p>
          )}

          {/* Decorative Divider */}
          <div className="my-3 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-amber-600/40" />
            <span className="text-amber-600 text-xs">🪔</span>
            <span className="h-px w-12 bg-amber-600/40" />
          </div>

          {/* Divine Calligraphic Festival Title */}
          <div className="my-2">
            <h1 className="font-marathi-display text-3xl sm:text-4xl font-black text-sky-900 tracking-wide drop-shadow-sm">
              {title}
            </h1>
            <p className="text-xs font-bold text-amber-800 mt-1">
              की हार्दिक शुभकामनाएं / सप्रेम नमस्कार!
            </p>
          </div>

          {/* Divine Flute & Golden Butter Pot Motif */}
          <div className="my-4 flex justify-center">
            <FluteAndButterPot />
          </div>

          {/* Tagline / Shloka Blessing */}
          <div className="my-3 rounded-xl border border-amber-400/40 bg-amber-50/80 p-3 max-w-md mx-auto text-xs leading-relaxed text-maroon-900">
            <p className="font-medium">{tagline}</p>
          </div>

          {/* Date, Time & Venue */}
          <div className="space-y-1 text-xs">
            <p className="font-bold text-amber-900 text-sm">{date} · {time}</p>
            <p className="font-semibold text-ink-800">{venue}</p>
            {city && <p className="text-ink-600 text-[11px]">{city}</p>}
          </div>

          {/* Deep Navy Bottom Ribbon with "जय श्री कृष्ण" */}
          <div className="mt-5 -mx-6 -mb-6 sm:-mx-9 bg-gradient-to-r from-sky-950 via-indigo-900 to-sky-950 px-4 py-3 text-center text-ivory-100 border-t-2 border-amber-400">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs">🦚</span>
              <span className="font-marathi-display text-base font-black tracking-widest text-amber-300 uppercase">
                {blessing}
              </span>
              <span className="text-xs">🦚</span>
            </div>
            <p className="text-[10px] text-ivory-100/70 mt-0.5">{host}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 4: SCROLL & MARATHA KATYAR (Reference Image 3 & 5 Style)
     Royal Katyaar dagger, Haldi-kumkum thali, Elephant crest, location QR
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "scroll-katyar") {
    return (
      <div
        id={id}
        className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-maroon-950 select-none bg-[#fffdf9] border-2 border-gold-500/70 print:shadow-none print:max-w-none print:rounded-none ${className}`}
      >
        {/* Top Ribbon */}
        <div className="absolute top-0 right-4 z-10">
          <SnehNimantranRibbon />
        </div>

        {/* Outer Baroque Frame */}
        <BaroqueCorner color="#d4af37" className="absolute top-2 left-2" />
        <BaroqueCorner color="#d4af37" className="absolute bottom-2 right-2 -scale-x-100 -scale-y-100" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10 text-center">
          {/* Top Ganesh Crest */}
          <RoyalGaneshCrest color="#b45309" size={40} />
          <p className="text-[10px] font-bold tracking-widest text-maroon-800 uppercase mt-0.5">
            {blessing}
          </p>

          {/* Surnames Banner */}
          {surnames && (
            <div className="my-2.5 inline-block rounded-lg bg-gradient-to-r from-amber-500 via-gold-400 to-amber-500 px-5 py-1 text-maroon-950 shadow-xs border border-amber-600">
              <span className="font-marathi-display text-sm sm:text-base font-black tracking-wider">
                {surnames}
              </span>
            </div>
          )}

          {/* Names Grid */}
          <div className="my-3 space-y-2">
            <div>
              <p className="text-[11px] font-bold text-amber-800">चि.</p>
              <h2 className="font-marathi-display text-2xl sm:text-3xl font-black text-maroon-950">
                {personA}
              </h2>
              {parentsA && (
                <p className="text-[10px] text-ink-600 max-w-sm mx-auto mt-0.5">{parentsA}</p>
              )}
            </div>

            {personB && (
              <div>
                <p className="text-[11px] font-bold text-amber-800">चि.सौ.कां.</p>
                <h2 className="font-marathi-display text-2xl sm:text-3xl font-black text-maroon-950">
                  {personB}
                </h2>
                {parentsB && (
                  <p className="text-[10px] text-ink-600 max-w-sm mx-auto mt-0.5">{parentsB}</p>
                )}
              </div>
            )}
          </div>

          {/* 3D Calligraphic Title */}
          <div className="my-3">
            <h1 className="font-marathi-display text-3xl sm:text-4xl font-black text-amber-900 tracking-wide drop-shadow-xs">
              {title}
            </h1>
            <p className="text-xs text-ink-600 mt-1 max-w-sm mx-auto">{tagline}</p>
          </div>

          {/* Date, Time & Venue */}
          <div className="my-3 rounded-xl border border-amber-400/40 bg-amber-50/70 p-3 max-w-md mx-auto text-xs space-y-0.5">
            <p className="font-bold text-maroon-950 text-sm">{date} · {time}</p>
            <p className="font-semibold text-maroon-900">{venue}</p>
            {city && <p className="text-ink-600 text-[11px]">{city}</p>}
          </div>

          {/* Bottom Motifs: Royal Katyar on Left, Haldi-Kumkum on Right, QR in Center */}
          <div className="mt-4 pt-3 border-t border-amber-400/30 flex items-center justify-between gap-2">
            <div className="shrink-0 -ml-2">
              <RoyalMarathaKatyar />
            </div>
            <div className="text-center px-1">
              <p className="text-xs font-bold text-maroon-900">{host}</p>
              <div className="mt-1 flex justify-center">
                <LocationQrBadge qrValue={qrLocation} />
              </div>
            </div>
            <div className="shrink-0 -mr-2">
              <HaldiKumkumThali />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 5: PAITHANI ROYAL ZARI (Traditional Maharashtrian)
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "paithani-zari") {
    return (
      <div
        id={id}
        className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-ivory-100 select-none print:shadow-none print:max-w-none print:rounded-none ${className}`}
        style={{
          background: "linear-gradient(170deg, #5c1420 0%, #430d15 55%, #2e070d 100%)",
        }}
      >
        <LaceFretworkBorder color="#dfb150" className="absolute top-1 inset-x-0 z-10" />
        <LaceFretworkBorder color="#dfb150" flip className="absolute bottom-1 inset-x-0 z-10" />
        <div className="absolute inset-[10px] rounded-xl border border-gold-400/50 pointer-events-none" />

        <div className="relative px-6 py-9 sm:px-9 sm:py-11 text-center">
          <RoyalGaneshCrest color="#f3e1a6" size={42} />
          <p className="mt-1 text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
            {blessing}
          </p>
          <div className="my-2 h-px w-24 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />
          <p className="font-marathi-display text-sm font-semibold text-gold-200">{title}</p>

          <div className="my-4 space-y-1.5">
            <h2 className="font-marathi-display text-2xl sm:text-3xl font-black">
              <span className="gold-foil">{personA}</span>
            </h2>
            {personB && (
              <>
                <p className="text-xs text-gold-300 font-bold">आणि</p>
                <h2 className="font-marathi-display text-2xl sm:text-3xl font-black">
                  <span className="gold-foil">{personB}</span>
                </h2>
              </>
            )}
          </div>

          <div className="space-y-1 text-xs text-ivory-100/90 max-w-sm mx-auto">
            <p className="font-bold text-gold-300 text-sm">{date} · {time}</p>
            <p className="font-medium">{venue} · {city}</p>
            <p className="text-[11px] text-ivory-100/70 pt-1">{tagline}</p>
          </div>

          <div className="mt-5 pt-3 border-t border-gold-500/25">
            <p className="text-xs font-bold text-gold-300">{host}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     STYLE 6: TEMPLE ARCH DOME (Layered 3D Architectural)
     ══════════════════════════════════════════════════════════════════════ */
  if (template.cardStyle === "royal-arch") {
    return (
      <div
        id={id}
        className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-ivory-100 select-none print:shadow-none print:max-w-none print:rounded-none ${className}`}
        style={{
          background: "linear-gradient(180deg, #420f18 0%, #29080e 55%, #170307 100%)",
        }}
      >
        <div className="relative w-full">
          <TempleArchTop color="#fcedb8" fillTone="#330b13" />
          <div className="absolute top-2 inset-x-0 flex justify-center">
            <RoyalGaneshCrest color="#fcedb8" size={40} />
          </div>
        </div>

        <div className="absolute inset-[8px] rounded-xl border border-gold-500/40 pointer-events-none" />

        <div className="relative px-6 pb-9 -mt-8 sm:px-9 sm:pb-11 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-gold-300 uppercase">
            {blessing}
          </p>
          <p className="font-marathi-display text-sm font-semibold text-gold-200 mt-0.5">{title}</p>

          <div className="w-full max-w-[200px] mx-auto my-2">
            <FloralFlourishDivider color="#d4af37" />
          </div>

          <div className="my-3 space-y-1">
            <h2 className="font-marathi-display text-2xl sm:text-3xl font-black">
              <span className="gold-foil">{personA}</span>
            </h2>
            {personB && (
              <>
                <p className="text-xs text-gold-300 font-bold">आणि</p>
                <h2 className="font-marathi-display text-2xl sm:text-3xl font-black">
                  <span className="gold-foil">{personB}</span>
                </h2>
              </>
            )}
          </div>

          <div className="w-full max-w-[200px] mx-auto my-2">
            <FloralFlourishDivider color="#d4af37" className="rotate-180" />
          </div>

          <div className="space-y-1 text-xs text-ivory-100/90 max-w-sm mx-auto">
            <p className="font-bold text-gold-300 text-sm">{date} · {time}</p>
            <p className="font-medium">{venue}</p>
            {city && <p className="text-ivory-100/70 text-[11px]">{city}</p>}
            <p className="text-[11px] text-ivory-100/70 pt-1">{tagline}</p>
          </div>

          <div className="mt-5 pt-3 border-t border-gold-500/25">
            <p className="text-xs font-bold text-gold-300">{host}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     DEFAULT FALLBACK: ROYAL PLUM & BAROQUE GOLD
     ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      id={id}
      className={`relative w-full max-w-[540px] mx-auto overflow-hidden rounded-2xl shadow-premium text-ivory-100 select-none print:shadow-none print:max-w-none print:rounded-none ${className}`}
      style={{
        background: template.bgGradient || "linear-gradient(165deg, #320b4d 0%, #1f0631 55%, #12031d 100%)",
      }}
    >
      <div className="absolute inset-[8px] rounded-xl border-2 border-gold-500/70 pointer-events-none" />
      <div className="absolute inset-[13px] rounded-md border border-gold-400/40 pointer-events-none" />

      <BaroqueCorner color="#dfb150" className="absolute top-2.5 left-2.5" />
      <BaroqueCorner color="#dfb150" className="absolute top-2.5 right-2.5 -scale-x-100" />
      <BaroqueCorner color="#dfb150" className="absolute bottom-2.5 left-2.5 -scale-y-100" />
      <BaroqueCorner color="#dfb150" className="absolute bottom-2.5 right-2.5 -scale-x-100 -scale-y-100" />

      <div className="relative px-6 py-9 sm:px-9 sm:py-11 text-center">
        <ShreeGaneshayCalligraphy color="#f3e1a6" />
        <p className="font-marathi-display text-sm font-semibold text-gold-200 mt-2">{title}</p>
        {surnames && (
          <p className="text-xs font-bold text-gold-300/80 tracking-widest uppercase mt-0.5">{surnames}</p>
        )}

        <div className="my-4 space-y-1.5">
          <h2 className="font-marathi-display text-2xl sm:text-3xl font-black">
            <span className="gold-foil">{personA}</span>
          </h2>
          {personB && (
            <>
              <p className="text-xs text-gold-300 font-bold">आणि</p>
              <h2 className="font-marathi-display text-2xl sm:text-3xl font-black">
                <span className="gold-foil">{personB}</span>
              </h2>
            </>
          )}
        </div>

        <div className="space-y-1 text-xs text-ivory-100/90 max-w-sm mx-auto">
          <p className="font-bold text-gold-300 text-sm">{date} · {time}</p>
          <p className="font-medium">{venue}</p>
          {city && <p className="text-ivory-100/70 text-[11px]">{city}</p>}
          <p className="text-[11px] text-ivory-100/70 pt-1">{tagline}</p>
        </div>

        <div className="mt-5 pt-3 border-t border-gold-500/25">
          <p className="text-xs font-bold text-gold-300">{host}</p>
        </div>
      </div>
    </div>
  );
}
