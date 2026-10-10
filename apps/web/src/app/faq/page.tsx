import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'नेहमीच्या प्रश्न (FAQ)',
  description:
    'पत्रिका तयार करणे, मुहूर्त, छपाई, विक्रेते व बुकिंगबद्दल नेहमीचे प्रश्न — मराठीत उत्तरे.',
};

const FAQS = [
  {
    q: 'पत्रिका तयार करण्यासाठी पैसे लागतात का?',
    a: 'मूलभूत डिझाइन व पूर्वावलोकन मोफत आहे. छपाई, प्रीमियम डिझाइन किंवा विक्रेत्याद्वारे सेवा घेतल्यासच शुल्क लागते — प्रत्येक शुल्क आधी स्पष्ट दिसते.',
  },
  {
    q: 'मुहूर्त कसा काढला जातो?',
    a: 'सूर्योदयावर आधारित तिथी, नक्षत्र, योग, करण व राहूकाळ यांची गणना करून मुहूर्त अनुकूलता दाखवली जाते. आम्ही फक्त पद्धतीचे मूल्य दाखवतो — अंतिम निर्णय तुमचाच.',
  },
  {
    q: 'छपाईपूर्वी डिझाइन तशीच छापली आहे हे कसे खात्री होईल?',
    a: 'प्रत्येक डिझाइनसाठी व्ह्यू-व्ह्यु-यट-प्रिंट प्रूफ मिळतो — जे दिसेल तेच छापले जाईल. ब्लीड व क्रॉप मार्क्स आधीच तपासलेले असतात.',
  },
  {
    q: 'विक्रेते कसे निवडायचे?',
    a: '/vendors वर शहर व श्रेणीनुसार विक्रेते शोधा. प्रत्येक प्रोफाइलवर प्रतिसाद वेळ, बुकिंग व विश्वासार्हतेची पटकळ दिसते.',
  },
  {
    q: 'बुकिंग निश्चित झाल्यावर पैसे कुठे जातात?',
    a: 'पैसे स्वतंत्र दुहेरी-नोंदणी लेजरमध्ये नोंदवले जातात — प्लॅटफॉर्म, विक्रेता व कर हे स्पष्टपणे विभागले जाते. रद्दीकरणाची धोरणे आधीच दिलेली असतात.',
  },
  {
    q: 'कार्यक्रमाची तयारी एकाच ठिकाणी कसे ठेवायची?',
    a: 'स्टुडिओ वर्कस्पेसमध्ये कार्यसूची, पाहुणे (RSVP), विक्रेता डेस्क आणि तयारीची लक्षणी एकत्र दिसते. निमंत्रण पान व्हॉट्सॲपवर थेट पाठवता येते.',
  },
];

export default function FaqPage() {
  return (
    <main className="shell py-12 md:py-16">
      <header className="surface-elevated mb-10 p-8 md:p-12">
        <p className="kicker">नेहमीचे प्रश्न</p>
        <h1 className="mt-3">तुमच्या शंका, आमची उत्तरे</h1>
        <p className="mt-4 max-w-2xl text-charcoal-soft">
          पत्रिका, मुहूर्त, छपाई, विक्रेते व बुकिंग — सर्वात जास्त विचारले जाणारे प्रश्न येथे.
        </p>
      </header>

      <section aria-labelledby="faq-heading" className="space-y-4">
        <h2 id="faq-heading" className="sr-only">
          प्रश्नोत्तरे
        </h2>
        {FAQS.map((item) => (
          <details key={item.q} className="surface group p-6 open:ring-1 open:ring-gold/40">
            <summary className="min-h-[44px] cursor-pointer list-none pr-6 text-base font-semibold text-maroon marker:hidden">
              {item.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">{item.a}</p>
          </details>
        ))}
      </section>

      <section className="surface mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="text-sm text-charcoal-soft">उत्तर सापडले नाही? थेट विचारा.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn-base btn-maroon px-6 text-sm">
            आम्हाला लिहा
          </Link>
          <Link href="/panchang" className="btn-base btn-outline px-6 text-sm">
            पंचांग पाहा
          </Link>
        </div>
      </section>
    </main>
  );
}
