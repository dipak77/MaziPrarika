import { CanvaCanvasEditor } from "@/components/canva-canvas-editor";
import Link from "next/link";

export const metadata = {
  title: "कॅनव्हा प्रो स्टुडिओ — पूर्ण स्क्रीन कॅनव्हास संपादन | माझी पत्रिका",
  description: "संपूर्ण स्क्रीन स्पेस, ड्रॅग अँड ड्रॉप, ५०+ नमुने, सुवर्ण नक्षी व हाय-रिझोल्यूशन एक्सपोर्टसह प्रो स्टुडिओ कॅनव्हास.",
};

export default async function StudioEditorPage({
  searchParams,
}: {
  searchParams?: Promise<{ template?: string }>;
}) {
  const params = await searchParams;
  const initialTemplateId = params?.template;

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-maroon-deep text-white">
      {/* Top Bar Navigation for Dedicated Editor */}
      <header className="relative z-[10000] flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-maroon-950 px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white transition"
            title="स्टुडिओ मुख्य पानावर परत जा"
          >
            <span>←</span>
            <span>बॅक टू स्टुडिओ (Back to Studio)</span>
          </Link>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="font-display text-xs sm:text-sm font-bold text-white hidden sm:inline truncate max-w-xs">
            माझी पत्रिका — कॅनव्हा प्रो स्टुडिओ (Full View Workspace)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-gold-500/40 bg-gold-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-gold-300 shadow-xs animate-pulse">
            CANVA PRO FULL VIEW
          </span>
          <Link
            href="/studio"
            className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            ✕ बंद करा
          </Link>
        </div>
      </header>

      {/* Full Screen Canva Canvas Editor Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <CanvaCanvasEditor
          initialTemplateId={initialTemplateId}
          fullViewMode={true}
        />
      </div>
    </div>
  );
}
