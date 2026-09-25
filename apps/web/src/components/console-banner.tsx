'use client';

import { Eyebrow } from "@/components/ui";
import { useLanguage } from "@/context/language-context";

interface ConsoleBannerProps {
  gmvLakh: string;
  takeRate: string;
  conversionLive: string;
  activeVendors: string;
}

export function ConsoleBanner({
  gmvLakh,
  takeRate,
  conversionLive,
  activeVendors,
}: ConsoleBannerProps) {
  const { isEn } = useLanguage();

  return (
    <div className="bg-paisley-dark text-ivory-100" lang={isEn ? 'en' : 'mr'}>
      <div className="shell py-12">
        <Eyebrow dark>{isEn ? 'Super Admin · Mazi Console' : 'सुपर ॲडमिन · मझी कन्सोल'}</Eyebrow>
        <h1 className="font-marathi-display text-4xl font-bold sm:text-[42px]">
          {isEn ? 'Marketplace Health & Operations' : 'मार्केटप्लेस आरोग्य'}
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] text-ivory-100/65">
          {isEn
            ? 'North Star: Not just created — active and successfully completed events. Live GMV + Net Revenue + Take Rate tracking.'
            : 'नॉर्थ स्टार: तयार झालेले नव्हे — सक्रिय व पूर्ण झालेले इव्हेंट्स. GMV + निव्वळ महसूल + टेक-रेट थेट येथे.'}
        </p>
        <div className="mt-7 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { l: isEn ? "GMV (This Month)" : "GMV (या महिन्यात)", v: gmvLakh },
            { l: isEn ? "Take Rate" : "टेक-रेट", v: takeRate },
            { l: isEn ? "Booking Conversion" : "बुकिंग रूपांतरण", v: conversionLive },
            { l: isEn ? "Active Vendors" : "सक्रिय व्हेंडर्स", v: activeVendors },
          ].map((k) => (
            <div key={k.l}>
              <div className="font-display text-[28px] font-semibold text-gold-300">{k.v}</div>
              <div className="mt-0.5 text-[11.5px] font-bold text-ivory-100/55">{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
