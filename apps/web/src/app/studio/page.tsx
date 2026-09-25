import { StudioEditor } from "@/components/studio-editor";
import { StudioHero } from "@/components/studio-hero";
import { Reveal } from "@/components/ui";

export const metadata = {
  title: "क्रिएट स्टुडिओ — माझी पत्रिका",
  description: "पैठणी, वारली, शुभ्र व राजमुद्रा टेम्पलेटवर ६० FPS थेट संपादन व क्वालिटी गार्डसह अचूक छपाई.",
};

export default function StudioPage() {
  return (
    <div className="shell py-10 sm:py-14">
      <StudioHero />
      <Reveal delay={120}>
        <div id="studio-live" className="mt-10 border-t border-gold/30 pt-10">
          <StudioEditor />
        </div>
      </Reveal>
    </div>
  );
}
