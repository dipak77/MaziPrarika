import Link from 'next/link';

import { CreateWizard } from '@/components/create-wizard';
import { Kicker } from '@/components/ui';
import { toDevanagariDigits } from '@/lib/format';

export const metadata = {
  title: 'AI सेटअप — एका वाक्यात कार्यक्रम तयार',
  description: 'मराठीत कार्यक्रम सांगा — मुहूर्त, बजेट वाटप, कार्ये व विक्रेते आपोआप तयार होतात.',
};

const EXAMPLES = [
  'पुण्यात एप्रिल २०२७ मध्ये लग्न आहे, ६५० पाहुणे, बजेट १८ लाख. मुहूर्त आणि छायाचित्रकार शोधा.',
  'कोल्हापुरात गृहप्रवेश आहे, १२० पाहुणे, बजेट २ लाख — गुरुजी व केटरिंग हवे.',
  'मुंबईत मुलीचा वाढदिवस १०० पाहुण्यांसह, बजेट ५० हजार — केक व सजावट पाहिजे.',
  'नाशिकला सत्यनारायण पूजा, ६० पाहुणे, बजेट १ लाख — भटजी व पत्रिका छपाई.',
];

export default function CreatePage() {
  return (
    <div className="shell py-12">
      <header className="max-w-3xl">
        <Kicker>Create Studio</Kicker>
        <h1 className="mt-2 font-display text-4xl font-bold text-maroon">एका वाक्यात कार्यक्रम उभा करा</h1>
        <p className="mt-3 text-lg text-charcoal-soft">
          तुम्ही मराठीत लिहा — प्लॅटफॉर्म पंचांग गणनेने मुहूर्त शोधते, पारंपरिक बजेट रचनेनुसार वाटप करते, कार्ये
          तयार करते आणि पडताळलेल्या विक्रेत्यांची यादी देते. कोणतीही रक्कम किंवा तारीख AI स्वतः तयार करत नाही.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <CreateWizard examples={EXAMPLES} />

        <aside className="space-y-6">
          <section className="surface-elevated p-5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="grid size-8 place-items-center rounded-xl bg-paithani-soft text-paithani ring-1 ring-paithani/20">✓</span>
              <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">काय आपोआप तयार होते</h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-charcoal-soft">
              <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-gold-bright shrink-0" aria-hidden /><span>मुहूर्त अनुकूलता — सूर्योदय-आधारित तिथी, नक्षत्र व चौघडियांसह</span></li>
              <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-gold-bright shrink-0" aria-hidden /><span>बजेटचे श्रेणीवार वाटप — महाराष्ट्रीयन खर्च रचनेनुसार</span></li>
              <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-gold-bright shrink-0" aria-hidden /><span>{toDevanagariDigits(24)}+ टप्प्यांतील कार्यसूची — तारखांसह</span></li>
              <li className="flex gap-2"><span className="mt-2 size-1.5 rounded-full bg-gold-bright shrink-0" aria-hidden /><span>विक्रेते — उपलब्धता व प्रतिसाद वेळेसह</span></li>
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">आम्ही काय करत नाही</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-soft">
              <li className="flex gap-2"><span className="text-maroon" aria-hidden>—</span>विवाह-जुळवणी किंवा वधू-वर शोध</li>
              <li className="flex gap-2"><span className="text-maroon" aria-hidden>—</span>“शुभ/अशुभ दिवस” असे ठोकळ निर्णय — फक्त अनुकूलता</li>
              <li className="flex gap-2"><span className="text-maroon" aria-hidden>—</span>लगेच बुकिंग — विक्रेत्याची संमती आवश्यक</li>
              <li className="flex gap-2"><span className="text-maroon" aria-hidden>—</span>वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला</li>
            </ul>
            <p className="mt-4 rounded-xl bg-ivory-deep px-3 py-2 text-xs leading-relaxed text-charcoal-soft ring-1 ring-gold/15">
              आपली माहिती सुरक्षित आहे — आधार, PAN किंवा कार्ड क्रमांक कधीही मागितले जात नाहीत.
            </p>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">आधीच तयार कार्यक्रम</h2>
            <p className="mt-1 text-sm text-charcoal-soft">नमुना वर्कस्पेस उघडून पाहा — थेट प्रीव्ह्यू व बजेटसह.</p>
            <div className="mt-4 grid gap-2">
              {[
                { href: '/studio/patil-patil-vivah-2027', label: 'पाटील विवाह सोहळा' },
                { href: '/studio/deshmukh-gruhapravesh', label: 'देशमुख गृहप्रवेश' },
                { href: '/studio/advait-vadhdivas', label: 'आद्वैतचा वाढदिवस' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group flex items-center justify-between rounded-xl border border-gold/20 bg-white px-3.5 py-3 text-sm font-semibold text-maroon shadow-2xs transition hover:border-maroon/30 hover:bg-ivory-deep">
                  {item.label}
                  <span aria-hidden className="rounded-full bg-maroon px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">→</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
