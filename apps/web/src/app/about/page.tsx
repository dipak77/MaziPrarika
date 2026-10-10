import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'आमच्याविषयी',
  description:
    'माझी पत्रिका — महाराष्ट्राचा डिजिटल उत्सव आणि पत्रिका मंच. मराठी कुटुंबांसाठी निमंत्रण, पंचांग, विक्रेते व छपाई एकाच ठिकाणी.',
};

const PILLARS = [
  {
    title: 'पत्रिका व निमंत्रण',
    body: 'पायथणी शैलीतील डिझाइन, व्ह्यू-व्ह्यु-यट-प्रिंट प्रूफ आणि छपाईत शून्य चूक — घरबसल्या तयार.',
  },
  {
    title: 'पंचांग व मुहूर्त',
    body: 'सूर्योदयावर आधारित तिथी, नक्षत्र, चौघडिया व मुहूर्त अनुकूलता — शहरानुसार, पद्धतीसह.',
  },
  {
    title: 'विक्रेते व बुकिंग',
    body: 'स्वतंत्र लेजरवर आधारित पैशांचा स्पष्ट हिशोब, कोट, बुकिंग आणि सेटलमेंट — टाकाटाकीशिवाय.',
  },
  {
    title: 'व्यवस्थापन',
    body: 'पाहुणे, कार्यसूची, विक्रेता डेस्क आणि तयारीची लक्षणी — एका वर्कस्पेसमध्ये, मराठीत.',
  },
];

export default function AboutPage() {
  return (
    <main className="shell py-12 md:py-16">
      <header className="surface-elevated mb-10 p-8 md:p-12">
        <p className="kicker">॥ सहर्ष स्वागतम् ॥</p>
        <h1 className="mt-3 text-balance-marathi">
          माझी पत्रिका — महाराष्ट्राचा डिजिटल उत्सव आणि पत्रिका मंच
        </h1>
        <p className="mt-4 max-w-2xl text-charcoal-soft">
          लग्न, साखरपुडा, वास्तुशांती किंवा जन्मदिन — उत्सवाची तयारी आनंदाची असायला हवी, ताणाची नाही.
          माझी पत्रिका हे तुमच्या उत्सवाचे एकत्रित केंद्र आहे: निमंत्रण तयार करा, मुहूर्त निवडा,
          विक्रेते शोधा, बुक करा आणि छपाईसाठी मोकळ्या मनाने तयार व्हा.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/studio" className="btn-base btn-maroon px-6 text-sm">
            स्टुडिओ उघडा
          </Link>
          <Link href="/vendors" className="btn-base btn-outline px-6 text-sm">
            विक्रेते पाहा
          </Link>
        </div>
      </header>

      <section aria-labelledby="pillars-heading" className="grid gap-5 sm:grid-cols-2">
        <h2 id="pillars-heading" className="sr-only">
          आमच्या मुख्य गोष्टी
        </h2>
        {PILLARS.map((pillar) => (
          <article key={pillar.title} className="surface hover-lift p-6">
            <h3 className="text-lg">{pillar.title}</h3>
            <p className="mt-2 text-sm text-charcoal-soft">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="surface mt-10 p-6 md:p-8">
        <h2 className="text-xl">मूल्य तरतूद</h2>
        <ul className="mt-3 space-y-2 text-sm text-charcoal-soft">
          <li>प्रत्येक रुपयाचा स्पष्ट हिशोब — दुहेरी-नोंदणी लेजर, कोणताही लपलेला शुल्क नाही.</li>
          <li>छपाईपूर्वी डिझाइन तसाच छापली आहे याची खात्री — व्ह्यू-व्ह्यु-यट-प्रिंट प्रूफ.</li>
          <li>मराठी पहिल्या भाषेत — भाषेचा पर्याय असला तरी, मूळ अनुभव मराठीतच.</li>
          <li>तुमच्या कार्यक्रमाची माहिती तुमचीच — विक्रेत्याला फक्त लागणारी माहिती दिसते.</li>
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/contact" className="font-semibold text-maroon underline-offset-4 hover:underline">
            आम्हाला लिहा →
          </Link>
        </p>
      </section>
    </main>
  );
}
