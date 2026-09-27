import { StudioEditor } from "@/components/studio-editor";
import { Reveal, Eyebrow, Icon } from "@/components/ui";

export const metadata = {
  title: "विवाह बायोडाटा मेकर — माझी पत्रिका | Royal Marriage Biodata Templates",
  description:
    "शाही जांभळा, किरमिजी दमास्क, राजमहाल कमान आणि हेरिटेज मारून अशा ५ राजेशाही टेम्पलेट्सवर विवाह बायोडाटा तयार करा, थेट मराठीत टाइप करा आणि PDF/व्हॉट्सअॅप शेअर करा.",
};

export default function BiodataPage() {
  return (
    <div className="shell py-10 sm:py-14">
      {/* Hero Header for Biodata Creator */}
      <Reveal>
        <section
          aria-labelledby="biodata-hero-title"
          className="relative overflow-hidden rounded-3xl bg-paisley-dark px-6 py-10 shadow-card sm:px-10 sm:py-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-maroon-700/40 blur-3xl"
          />

          <div className="relative">
            <Eyebrow dark>विवाह बायोडाटा मेकर · राजेशाही टेम्पलेट्स</Eyebrow>
            <h1
              id="biodata-hero-title"
              className="max-w-3xl font-marathi-display text-4xl leading-[1.14] font-bold text-balance text-ivory-100 sm:text-[50px]"
            >
              रुबाबदार विवाह बायोडाटा —{" "}
              <span className="gold-foil">५ राजेशाही टेम्पलेट्स</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory-100/75">
              शाही जांभळा, किरमिजी दमास्क, राजमहाल कमान आणि हेरिटेज मारून अशा ५ भव्य
              डिझाइन्समध्ये वर-वधूंचा संपूर्ण बायोडाटा तयार करा. मराठीत थेट फोनिटिक
              टाइपिंग, फोटो अपलोड आणि १-क्लिक PDF/व्हॉट्सअॅप साठवणूक.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#biodata-live"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-[14.5px] font-bold text-maroon-950 transition hover:bg-gold-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
              >
                बायोडाटा तयार करा
                <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2.4} />
              </a>
              <a
                href="/studio"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ivory-100/25 px-6 py-3 text-[14.5px] font-bold text-ivory-100 transition hover:border-gold-400/60 hover:text-gold-200"
              >
                लग्नाची पत्रिका बनवा
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <div id="biodata-live" className="mt-10 border-t border-gold/30 pt-10">
          <StudioEditor initialMode="biodata" />
        </div>
      </Reveal>
    </div>
  );
}
