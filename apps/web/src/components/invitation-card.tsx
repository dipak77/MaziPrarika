import type { DesignData } from "@/lib/arch-data";
import { enDate, mrDate } from "@/lib/arch-data";

/* ══ Ornamental SVG building blocks ════════════════════════════════════ */

function CornerFlourish({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" stroke={color} strokeWidth="1.4" aria-hidden>
      <path d="M4 56C4 30 30 4 56 4" opacity="0.9" />
      <path d="M4 44C4 24 24 4 44 4" opacity="0.55" />
      <path d="M56 4c-6 8-14 10-18 6-4-4-2-12 6-18" opacity="0.8" />
      <circle cx="8" cy="52" r="2.4" fill={color} stroke="none" />
    </svg>
  );
}

function PaisleyBand({ color, flip = false }: { color: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 14"
      preserveAspectRatio="none"
      className={`h-[13px] w-full ${flip ? "rotate-180" : ""}`}
      aria-hidden
    >
      <g fill={color}>
        {Array.from({ length: 10 }).map((_, i) => (
          <path
            key={i}
            d={`M${i * 32 + 16} 2c4.5 3.4 4.5 6.6 0 10-4.5-3.4-4.5-6.6 0-10Z`}
            opacity={0.85}
          />
        ))}
      </g>
      <rect y="6.2" width="320" height="1.4" fill={color} opacity="0.4" />
    </svg>
  );
}

function WarliDancers({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 30" className="h-7 w-full" aria-hidden>
      {[15, 45, 75, 105].map((x) => (
        <g key={x} stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <circle cx={x} cy={7} r={3.4} fill="none" />
          <path d={`M${x} 10.5v7M${x} 13l-5 3.5M${x} 13l5 3.5M${x} 17.5l-4 8M${x} 17.5l4 8`} />
        </g>
      ))}
      <path d={`M8 16h104`} stroke={color} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.6" />
    </svg>
  );
}

function GaneshMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="mx-auto h-11 w-11" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="none" stroke={color} strokeWidth="1.2" opacity="0.45" />
      <circle cx="24" cy="24" r="19" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="1.5 2.5" opacity="0.6" />
      <path
        d="M24 10c3 0 5 2.2 5 5 0 2.2-1.3 4-3.2 4.6 2.4.6 4.2 2.8 4.2 5.4 0 3.2-2.7 5.8-6 5.8s-6-2.6-6-5.8c0-2.6 1.8-4.8 4.2-5.4-1.9-.6-3.2-2.4-3.2-4.6 0-2.8 2-5 5-5Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M21 17h6M24 14v6" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="24" cy="24" r="1.6" fill={color} />
      <path d="M24 31c0 2-2 4-5 4" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RajmudraSeal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 40" className="mx-auto h-9 w-9" aria-hidden>
      <path
        d="M20 4c2 3 5 4 8 4-2 3-6 4-8 9-2-5-6-6-8-9 3 0 6-1 8-4Z"
        fill={color}
        opacity="0.9"
      />
      <path d="M13 26c0-4 3-7 7-7s7 3 7 7-3 8-7 8-7-4-7-8Z" fill="none" stroke={color} strokeWidth="1.6" />
      <path d="M20 19v-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ══ The Card ══════════════════════════════════════════════════════════ */

export function InvitationCard({
  design,
  className = "",
  id,
}: {
  design: DesignData;
  className?: string;
  id?: string;
}) {
  const isCouple = design.eventType === "wedding" || design.eventType === "engagement";
  const isEn = design.lang === "en";

  const title = isEn
    ? design.eventType === "wedding"
      ? "॥ Wedding Ceremony ॥"
      : design.eventType === "engagement"
        ? "॥ Engagement Ceremony ॥"
        : design.eventType === "birthday"
          ? "॥ Birthday Celebration ॥"
          : design.eventType === "naming"
            ? "॥ Naming Ceremony ॥"
            : design.eventType === "gruhapravesh"
              ? "॥ Housewarming Ceremony ॥"
              : "॥ Auspicious Celebration ॥"
    : design.eventType === "wedding"
      ? "॥ शुभ विवाह ॥"
      : design.eventType === "engagement"
        ? "॥ शुभ साखरपुडा ॥"
        : design.eventType === "birthday"
          ? "॥ वाढदिवसाचे निमित्त ॥"
          : design.eventType === "naming"
            ? "॥ नामकरण सोहळा ॥"
            : design.eventType === "gruhapravesh"
              ? "॥ गृहप्रवेश सोहळा ॥"
              : "॥ शुभ कार्यक्रम ॥";

  const dateDisplay = isEn ? enDate(design.date) : mrDate(design.date);
  const conj = isEn ? "&" : "आणि";
  const blessing = design.blessing || (isEn ? "॥ Shri Ganeshaya Namah ॥" : "श्री गणेशाय नमः");
  const hostNotice = design.host
    ? isEn
      ? `Invited by — ${design.host}`
      : `विनंती — ${design.host}`
    : isEn
      ? "The Family"
      : "यजमान कुटुंब";
  const fallbackName = isEn ? "Name here" : "नाव येथे";
  const fallbackVenue = isEn ? "Venue here" : "स्थळ येथे";
  const fallbackTime = isEn ? "Time later" : "वेळ नंतर कळवू";

  switch (design.template) {
    case "warli":
      return (
        <div
          id={id}
          className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-[#f3e9d8] shadow-card ${className}`}
        >
          <div className="absolute inset-[7px] rounded-lg border-2 border-[#a4552e]/70" />
          <div className="absolute inset-[13px] rounded-md border border-[#a4552e]/40" />
          <div className="absolute inset-x-6 top-5 opacity-80">
            <WarliDancers color="#8a4524" />
          </div>
          <div className="absolute inset-x-6 bottom-5 rotate-180 opacity-80">
            <WarliDancers color="#8a4524" />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#8a4524]">{blessing}</p>
            <div className="gold-hairline my-3 h-px w-24 opacity-90" />
            <p className="font-marathi-display text-[15px] text-[#6d3418]">{title}</p>
            <h3 className="font-marathi-display mt-4 text-[clamp(19px,4.6vmin,27px)] leading-snug font-bold text-[#4a2312]">
              {design.personA || fallbackName}
            </h3>
            {isCouple && (
              <>
                <p className="font-marathi-display my-1.5 text-[14px] text-[#8a4524]">{conj}</p>
                <h3 className="font-marathi-display text-[clamp(19px,4.6vmin,27px)] leading-snug font-bold text-[#4a2312]">
                  {design.personB || fallbackName}
                </h3>
              </>
            )}
            <div className="mt-5 space-y-1 text-[12.5px] leading-relaxed text-[#5f3c22]">
              <p className="font-semibold">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              <p className="pt-1 text-[11px] text-[#8a4524]/90">{hostNotice}</p>
            </div>
          </div>
        </div>
      );

    case "shubhra":
      return (
        <div
          id={id}
          className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-ivory-50 shadow-card ring-1 ring-ink-900/10 ${className}`}
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600" />
          <CornerFlourish className="absolute top-5 left-5 h-10 w-10 text-gold-500" color="currentColor" />
          <CornerFlourish className="absolute right-5 bottom-5 h-10 w-10 rotate-180 text-gold-500" color="currentColor" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <p className="text-[10.5px] font-extrabold tracking-[0.34em] text-ink-500 uppercase">
              {design.city || (isEn ? "Pune" : "पुणे")} · {design.date ? new Date(design.date + "T00:00:00").getFullYear() : ""}
            </p>
            <div className="mt-4 h-10 w-px bg-gradient-to-b from-transparent via-gold-500 to-transparent" />
            <h3 className="font-display mt-5 text-[clamp(20px,4.8vmin,29px)] leading-tight font-medium text-ink-900">
              {design.personA.split(" ").slice(0, 2).join(" ") || fallbackName}
            </h3>
            {isCouple && (
              <>
                <p className="font-display my-1 text-[15px] text-gold-600 italic">&amp;</p>
                <h3 className="font-display text-[clamp(20px,4.8vmin,29px)] leading-tight font-medium text-ink-900">
                  {design.personB.split(" ").slice(0, 2).join(" ") || fallbackName}
                </h3>
              </>
            )}
            <div className="mt-5 h-px w-24 bg-ink-900/20" />
            <p className="font-marathi-display mt-4 text-[14px] text-maroon-800">{title}</p>
            <div className="mt-3 space-y-0.5 text-[12px] text-ink-500">
              <p className="font-semibold text-ink-700">{dateDisplay}</p>
              <p>{design.time || "—"} · {design.venue || fallbackVenue}</p>
            </div>
          </div>
          <p className="absolute bottom-6 inset-x-0 text-center text-[10.5px] tracking-[0.22em] text-ink-400 uppercase">
            {design.host || (isEn ? "The Family" : "यजमान कुटुंब")}
          </p>
        </div>
      );

    case "rajmudra":
      return (
        <div
          id={id}
          className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-maroon-950 shadow-card ${className}`}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(at 50% 0%, rgb(199 162 79 / 0.28) 0, transparent 52%), radial-gradient(at 50% 100%, rgb(138 47 58 / 0.5) 0, transparent 56%)",
            }}
          />
          <div className="absolute inset-[8px] rounded-lg border border-gold-500/50" />
          <div className="absolute inset-[12px] rounded-md border border-gold-500/25" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <RajmudraSeal color="#d9b96c" />
            <p className="mt-4 text-[10.5px] font-bold tracking-[0.3em] text-gold-400/90 uppercase">
              {blessing}
            </p>
            <h3 className="font-marathi-display mt-3 text-[clamp(20px,4.8vmin,28px)] leading-snug font-bold">
              <span className="gold-foil">{design.personA || fallbackName}</span>
            </h3>
            {isCouple && (
              <>
                <p className="font-marathi-display my-1 text-[14px] text-gold-400">{conj}</p>
                <h3 className="font-marathi-display text-[clamp(20px,4.8vmin,28px)] leading-snug font-bold">
                  <span className="gold-foil">{design.personB || fallbackName}</span>
                </h3>
              </>
            )}
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-500/50" />
              <span className="font-marathi-display text-[14px] text-ivory-100">{title}</span>
              <span className="h-px w-10 bg-gold-500/50" />
            </div>
            <div className="mt-3 space-y-0.5 text-[12px] text-ivory-100/75">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || "—"} · {design.venue || fallbackVenue}</p>
            </div>
          </div>
          <p className="absolute bottom-5 inset-x-0 text-center text-[10.5px] tracking-[0.2em] text-gold-400/80">
            {hostNotice}
          </p>
        </div>
      );

    default: // paithani
      return (
        <div
          id={id}
          className={`relative aspect-[3/4] overflow-hidden rounded-xl shadow-card ${className}`}
          style={{
            background: "linear-gradient(170deg, #5c1420 0%, #430d15 55%, #2e070d 100%)",
          }}
        >
          {/* Paithani zari border */}
          <div
            className="absolute inset-0"
            style={{
              border: "9px solid transparent",
              borderImage:
                "repeating-linear-gradient(45deg, #c7a24f 0 6px, #8a6a2b 6px 12px, #e8d189 12px 14px) 9",
            }}
          />
          <div className="absolute inset-[13px] rounded-md border border-gold-400/60" />
          <div className="absolute inset-x-[13px] top-[13px] pt-2">
            <PaisleyBand color="#d9b96c" />
          </div>
          <div className="absolute inset-x-[13px] bottom-[13px] pb-2">
            <PaisleyBand color="#d9b96c" flip />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
            <GaneshMark color="#e6cf92" />
            <p className="mt-2 text-[11px] font-bold tracking-[0.22em] text-gold-300">{blessing}</p>
            <div className="gold-hairline my-3 h-px w-28" />
            <p className="font-marathi-display text-[15.5px] text-gold-200">{title}</p>
            <h3 className="font-marathi-display mt-3.5 text-[clamp(19px,4.6vmin,27px)] leading-snug font-bold text-ivory-100">
              {design.personA || fallbackName}
            </h3>
            {isCouple && (
              <>
                <p className="font-marathi-display my-1.5 text-[14px] text-gold-300">{conj}</p>
                <h3 className="font-marathi-display text-[clamp(19px,4.6vmin,27px)] leading-snug font-bold text-ivory-100">
                  {design.personB || fallbackName}
                </h3>
              </>
            )}
            <div className="mt-5 space-y-1 text-[12.5px] leading-relaxed text-ivory-100/85">
              <p className="font-semibold text-gold-300">{dateDisplay}</p>
              <p>{design.time || fallbackTime} · {design.venue || fallbackVenue}</p>
              <p className="pt-1.5 text-[11px] text-gold-200/85">
                {hostNotice}
              </p>
            </div>
          </div>
        </div>
      );
  }
}
