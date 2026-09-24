import Link from 'next/link';

import { CreateWizard } from '@/components/create-wizard';
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
        <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">Create Studio</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-maroon">एका वाक्यात कार्यक्रम उभा करा</h1>
        <p className="mt-3 text-lg text-charcoal-soft">
          तुम्ही मराठीत लिहा — प्लॅटफॉर्म पंचांग गणनेने मुहूर्त शोधते, पारंपरिक बजेट रचनेनुसार वाटप करते, कार्ये
          तयार करते आणि पडताळलेल्या विक्रेत्यांची यादी देते. कोणतीही रक्कम किंवा तारीख AI स्वतः तयार करत नाही.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <CreateWizard examples={EXAMPLES} />

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">काय आपोआप तयार होते</h2>
            <ul className="mt-3 space-y-2 text-sm text-charcoal-soft">
              <li>• मुहूर्त अनुकूलता — सूर्योदय-आधारित तिथी, नक्षत्र व चौघडियांसह</li>
              <li>• बजेटचे श्रेणीवार वाटप — महाराष्ट्रीयन खर्च रचनेनुसार</li>
              <li>• {toDevanagariDigits(24)}+ टप्प्यांतील कार्यसूची — तारखांसह</li>
              <li>• विक्रेते — उपलब्धता व प्रतिसाद वेळेसह</li>
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">आम्ही काय करत नाही</h2>
            <ul className="mt-3 space-y-2 text-sm text-charcoal-soft">
              <li>• विवाह-जुळवणी किंवा वधू-वर शोध</li>
              <li>• “शुभ/अशुभ दिवस” असे ठोकळ निर्णय — फक्त अनुकूलता</li>
              <li>• लगेच बुकिंग — विक्रेत्याची संमती आवश्यक</li>
              <li>• वैद्यकीय, कायदेशीर किंवा आर्थिक सल्ला</li>
            </ul>
            <p className="mt-4 text-xs text-charcoal-soft">
              आपली माहिती सुरक्षित आहे — आधार, PAN किंवा कार्ड क्रमांक कधीही मागितले जात नाहीत.
            </p>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">आधीच तयार कार्यक्रम</h2>
            <p className="mt-2 text-sm text-charcoal-soft">नमुना वर्कस्पेस उघडून पाहा.</p>
            <div className="mt-3 space-y-2">
              <Link href="/studio/patil-patil-vivah-2027" className="block text-sm font-semibold text-maroon">
                पाटील विवाह सोहळा →
              </Link>
              <Link href="/studio/deshmukh-gruhapravesh" className="block text-sm font-semibold text-maroon">
                देशमुख गृहप्रवेश →
              </Link>
              <Link href="/studio/advait-vadhdivas" className="block text-sm font-semibold text-maroon">
                आद्वैतचा वाढदिवस →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
