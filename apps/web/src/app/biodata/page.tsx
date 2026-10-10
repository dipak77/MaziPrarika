import { StudioEditor } from "@/components/studio-editor";
import { PageBanner } from "@/components/page-banner";
import { Reveal, Icon } from "@/components/ui";

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
        <PageBanner
          kicker="विवाह बायोडाटा मेकर · राजेशाही टेम्पलेट्स"
          title="रुबाबदार विवाह बायोडाटा — ५ राजेशाही टेम्पलेट्स"
          description="शाही जांभळा, किरमिजी दमास्क, राजमहाल कमान आणि हेरिटेज मारून अशा ५ भव्य डिझाइन्समध्ये वर-वधूंचा संपूर्ण बायोडाटा तयार करा. मराठीत थेट फोनिटिक टाइपिंग, फोटो अपलोड आणि १-क्लिक PDF/व्हॉट्सअॅप साठवणूक."
          actions={
            <>
              <a
                href="/biodata/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-maroon px-6 text-sm shadow-xl transition transform hover:-translate-y-0.5 active:scale-95"
              >
                <span>⤢</span>
                नवीन टॅबमध्ये पूर्ण स्क्रीन उघडा (Full View Mode)
              </a>
              <a
                href="#biodata-live"
                className="btn-base rounded-full bg-ivory-surface border border-gold-200 px-6 text-sm text-maroon-deep shadow-xs transition hover:bg-ivory-warm"
              >
                याच पानावर एडिट करा
                <Icon name="arrowRight" className="h-4 w-4" strokeWidth={2.4} />
              </a>
              <a
                href="/studio/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-base btn-outline px-6 text-sm transition"
              >
                लग्नाची पत्रिका बनवा (New Tab) ⤢
              </a>
            </>
          }
        />
      </Reveal>

      <Reveal delay={120}>
        <div id="biodata-live" className="mt-10 border-t border-gold/30 pt-10">
          <StudioEditor initialMode="biodata" />
        </div>
      </Reveal>
    </div>
  );
}
