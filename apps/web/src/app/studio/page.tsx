import { StudioEditor } from "@/components/studio-editor";
import { Eyebrow, Icon, Reveal, type IconName } from "@/components/ui";
import { TEMPLATES } from "@/lib/arch-data";
import { toDevanagariDigits } from "@/lib/format";

export const metadata = {
  title: "क्रिएट स्टुडिओ — माझी पत्रिका",
  description: "पैठणी, वारली, शुभ्र व राजमुद्रा टेम्पलेटवर ६० FPS थेट संपादन व क्वालिटी गार्डसह अचूक छपाई.",
};

export default function StudioPage() {
  const stats: { icon: IconName; value: string; label: string }[] = [
    { icon: "layers", value: `${toDevanagariDigits(TEMPLATES.length)} प्रीमियम`, label: "हस्तकला टेम्पलेट" },
    { icon: "printer", value: "१००% प्रिंट रेडी", label: "WYSIWYP · ब्लीड सहित" },
    { icon: "zap", value: "६० FPS", label: "थेट प्रिव्ह्यू" },
  ];
  return (
    <div className="shell py-10 sm:py-14">
      <Reveal>
        <section
          aria-labelledby="studio-hero-title"
          className="relative overflow-hidden rounded-3xl bg-paisley-dark px-6 py-10 shadow-card sm:px-10 sm:py-14"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-gold-400/10 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-maroon-700/40 blur-3xl" />
          <div className="relative">
            <Eyebrow dark>क्रिएट स्टुडिओ · थेट संपादन</Eyebrow>
            <h1
              id="studio-hero-title"
              className="max-w-3xl font-marathi-display text-4xl leading-[1.12] font-bold text-balance text-ivory-100 sm:text-[52px]"
            >
              पत्रिका बनवा — <span className="gold-foil">हस्तकलेचा ठसा</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory-100/70">
              टेम्पलेट निवडा, तपशील भरा आणि लाइव्ह प्रिव्ह्यू पाहा. नाव कितीही मोठं असलं तरी
              स्मार्ट लेआउट इंजिन त्याला आपोआप सुंदर बसवतं — शून्य ओव्हरफ्लो, १००% प्रिंट रेडी.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-gold-400/20 pt-6 sm:gap-6">
              {stats.map((s) => (
                <div key={s.label} className="min-w-0">
                  <dt className="flex min-h-[20px] items-center gap-1.5 text-[10.5px] font-bold tracking-[0.12em] text-ivory-100/55 uppercase sm:text-[11px]">
                    <Icon name={s.icon} className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                    <span className="truncate">{s.label}</span>
                  </dt>
                  <dd className="mt-1.5 font-display text-[17px] font-semibold text-gold-300 sm:text-2xl">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#design-form"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[14.5px] font-bold text-maroon-950 transition hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
              >
                संपादन सुरू करा
                <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2.4} />
              </a>
              <a
                href="#studio-preview"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ivory-100/25 px-6 py-3 text-[14.5px] font-bold text-ivory-100 transition hover:border-gold-400/60 hover:text-gold-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
              >
                <Icon name="eye" className="h-4 w-4" />
                थेट प्रिव्ह्यू पाहा
              </a>
            </div>
          </div>
        </section>
      </Reveal>
      <Reveal delay={120}>
        <div id="studio-live" className="mt-10 border-t border-gold/30 pt-10">
          <StudioEditor />
        </div>
      </Reveal>
    </div>
  );
}
