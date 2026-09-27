import { BiodataEditor } from "@/components/biodata-editor";
import Link from "next/link";

export const metadata = {
  title: "विवाह बायोडाटा मेकर (फुल व्ह्यू) — माझी पत्रिका | Royal Biodata Pro Full View",
  description:
    "विवाह बायोडाटा मेकरचे संपूर्ण स्क्रीन (Full View) व्हर्जन. कोणत्याही अडथळ्याविना संपूर्ण जागेत १०००+ पर्याय, ५ राजेशाही टेम्पलेट्स, थेट मराठी टायपिंग व हाय-रिझोल्यूशन PDF एक्सपोर्ट.",
};

export default function BiodataFullViewEditorPage() {
  return (
    <main className="min-h-screen w-full bg-[#12080c] text-ivory flex flex-col">
      {/* Top Pro Header Bar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gold-500/25 bg-[#1a0a10]/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/biodata"
            className="flex items-center gap-1.5 rounded-lg border border-gold-500/30 bg-white/5 px-3 py-1.5 text-xs font-bold text-gold-300 hover:bg-gold-500/20 hover:text-gold-200 transition"
          >
            <span>←</span>
            <span>बायोडाटा पृष्ठावर परत</span>
          </Link>
          <div className="hidden h-5 w-px bg-gold-500/20 sm:block" />
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="font-marathi-display text-sm font-bold tracking-wide text-ivory sm:text-base">
              विवाह बायोडाटा मेकर — <span className="text-gold-400">फुल व्ह्यू मोड</span>
            </h1>
            <span className="rounded bg-gradient-to-r from-amber-500 to-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
              BIODATA PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/studio/editor"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-bold text-gold-300 hover:bg-gold-500/20 hover:text-gold-100 transition"
          >
            <span>🎨</span>
            <span>कॅनव्हा प्रो स्टुडिओ (New Tab) ⤢</span>
          </Link>
          <Link
            href="/biodata"
            className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-[#fef3c7]/70 hover:bg-white/10 hover:text-white transition"
            title="बायोडाटा पृष्ठावर जा"
          >
            ✕ बंद करा
          </Link>
        </div>
      </header>

      {/* 100% Space Full View Editor Workspace */}
      <div className="flex-1 w-full p-2 sm:p-4 max-w-[1800px] mx-auto">
        <BiodataEditor />
      </div>
    </main>
  );
}
