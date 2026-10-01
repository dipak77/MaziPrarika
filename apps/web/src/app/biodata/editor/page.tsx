import { BiodataEditor } from "@/components/biodata-editor";
import Link from "next/link";

export const metadata = {
  title: "विवाह बायोडाटा मेकर (फुल व्ह्यू) — माझी पत्रिका | Royal Biodata Pro Full View",
  description:
    "विवाह बायोडाटा मेकरचे संपूर्ण स्क्रीन (Full View) व्हर्जन. कोणत्याही अडथळ्याविना संपूर्ण जागेत १०००+ पर्याय, ५ राजेशाही टेम्पलेट्स, थेट मराठी टायपिंग व हाय-रिझोल्यूशन PDF एक्सपोर्ट.",
};

export default function BiodataFullViewEditorPage() {
  return (
    <main className="min-h-screen w-full bg-[#f4f5fa] text-[#0e0d26] flex flex-col">
      {/* Top Pro Header Bar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/biodata"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <span>←</span>
            <span>बायोडाटा पृष्ठावर परत</span>
          </Link>
          <div className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-marathi-display text-sm font-bold tracking-wide text-[#0e0d26] sm:text-base">
              विवाह बायोडाटा मेकर — <span className="text-[#7c3aed]">फुल व्ह्यू मोड</span>
            </h1>
            <span className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6366f1] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
              BIODATA PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/studio/editor"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-[#7c3aed] hover:bg-violet-100 transition"
          >
            <span>🎨</span>
            <span>कॅनव्हा प्रो स्टुडिओ (New Tab) ⤢</span>
          </Link>
          <Link
            href="/biodata"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
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
