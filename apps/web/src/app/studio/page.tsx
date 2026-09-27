import { StudioEditor, type StudioMode } from "@/components/studio-editor";
import { StudioHero } from "@/components/studio-hero";
import { Reveal } from "@/components/ui";

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
  searchParams?: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const rawMode = params?.mode;
  const initialMode: StudioMode =
    typeof rawMode === "string" && (rawMode === "canva" || rawMode === "canvas")
      ? "pro-editor"
      : typeof rawMode === "string" && VALID_MODES.includes(rawMode as StudioMode)
        ? (rawMode as StudioMode)
        : "all-events";

  return (
    <div className="shell py-10 sm:py-14">
      <StudioHero />
      <Reveal delay={120}>
        <div id="studio-live" className="mt-10 border-t border-gold/30 pt-10">
          <StudioEditor key={initialMode} initialMode={initialMode} />
        </div>
      </Reveal>
    </div>
  );
}
