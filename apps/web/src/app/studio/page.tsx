import Link from "next/link";
import { StudioEditor, type StudioMode } from "@/components/studio-editor";
import { PageBanner } from "@/components/page-banner";

export const metadata = {
  title: "क्रिएट स्टुडिओ — माझी पत्रिका",
  description: "पैठणी, वारली, शुभ्र व राजमुद्रा टेम्पलेटवर ६० FPS थेट संपादन व क्वालिटी गार्डसह अचूक छपाई.",
};

const VALID_MODES: StudioMode[] = [
  "all-events",
  "pro-editor",
  "invitation",
  "biodata",
  "video-studio",
  "effects-lab",
];

export default async function StudioPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; template?: string }>;
}) {
  const params = await searchParams;
  const rawMode = params?.mode;
  const initialTemplateId = params?.template;
  const initialMode: StudioMode =
    typeof rawMode === "string" && (rawMode === "canva" || rawMode === "canvas")
      ? "pro-editor"
      : typeof rawMode === "string" && VALID_MODES.includes(rawMode as StudioMode)
        ? (rawMode as StudioMode)
        : "all-events";

  return (
    <div className="shell py-6 sm:py-8 space-y-6">
      <PageBanner
        kicker="क्रिएट स्टुडिओ • थेट संपादन व प्रिंटिंग"
        title="मराठी डिजिटल पत्रिका व कॅनव्हास स्टुडिओ"
        description="५०+ राजेशाही टेम्पलेट्स, त्रिभाषिक Devanagari टायपिंग, ६० FPS थेट संपादन व ३०० DPI हाय-रिझोल्यूशन प्रिंट-रेडी फाइल."
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              href="/templates"
              className="btn-base btn-outline text-xs sm:text-sm"
            >
              <span>👑 सर्व टेम्पलेट्स पाहा</span>
            </Link>
            <Link
              href="/studio/editor"
              target="_blank"
              className="btn-base btn-maroon text-xs sm:text-sm"
            >
              <span>🎨 कॅनव्हा प्रो (फुल स्क्रीन) ⤢</span>
            </Link>
          </div>
        }
      />

      <div id="studio-live">
        <StudioEditor
          key={`${initialMode}-${initialTemplateId || "default"}`}
          initialMode={initialMode}
          initialTemplateId={initialTemplateId}
        />
      </div>
    </div>
  );
}
