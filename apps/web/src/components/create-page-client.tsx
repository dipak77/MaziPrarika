'use client';

import Link from 'next/link';
import { CreateWizard } from '@/components/create-wizard';
import { Kicker } from '@/components/ui';
import { useLanguage } from '@/context/language-context';
import { uiCopy } from '@/lib/i18n';

const EXAMPLES_MR = [
  'पुण्यात एप्रिल २०२७ मध्ये लग्न आहे, ६५० पाहुणे, बजेट १८ लाख. मुहूर्त आणि छायाचित्रकार शोधा.',
  'कोल्हापुरात गृहप्रवेश आहे, १२० पाहुणे, बजेट २ लाख — गुरुजी व केटरिंग हवे.',
  'मुंबईत मुलीचा वाढदिवस १०० पाहुण्यांसह, बजेट ५० हजार — केक व सजावट पाहिजे.',
  'नाशिकला सत्यनारायण पूजा, ६० पाहुणे, बजेट १ लाख — भटजी व पत्रिका छपाई.',
];

const EXAMPLES_EN = [
  'Wedding in Pune in April 2027, 650 guests, budget 18 Lakhs. Find muhurat and photographer.',
  'Housewarming in Kolhapur, 120 guests, budget 2 Lakhs — need guruji and catering.',
  'Daughter’s birthday in Mumbai with 100 guests, budget 50k — need cake and decor.',
  'Satyanarayan Puja in Nashik, 60 guests, budget 1 Lakh — need bhatji and card printing.',
];

const SAMPLE_EVENTS = [
  { href: '/studio/patil-patil-vivah-2027', mr: 'पाटील विवाह सोहळा', en: 'Patil Wedding Celebration' },
  { href: '/studio/deshmukh-gruhapravesh', mr: 'देशमुख गृहप्रवेश', en: 'Deshmukh Gruhapravesh' },
  { href: '/studio/advait-vadhdivas', mr: 'आद्वैतचा वाढदिवस', en: "Advait's Birthday" },
];

export function CreatePageClient() {
  const { lang, isEn } = useLanguage();
  const copy = uiCopy[lang].create;

  return (
    <div className="shell py-12" lang={isEn ? 'en' : 'mr'}>
      <header className="max-w-3xl">
        <Kicker>{copy.kicker}</Kicker>
        <h1 className="mt-2 font-display text-4xl font-bold text-maroon">{copy.title}</h1>
        <p className="mt-3 text-lg text-charcoal-soft">
          {copy.desc}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <CreateWizard examples={isEn ? EXAMPLES_EN : EXAMPLES_MR} />

        <aside className="space-y-6">
          <section className="surface-elevated p-5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="grid size-8 place-items-center rounded-xl bg-paithani-soft text-paithani ring-1 ring-paithani/20">✓</span>
              <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">{copy.whatGenerates}</h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-charcoal-soft">
              {copy.genItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-gold-bright shrink-0" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">{copy.whatWeDontDo}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-soft">
              {copy.dontItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-maroon font-bold" aria-hidden>—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-ivory-deep px-3 py-2 text-xs leading-relaxed text-charcoal-soft ring-1 ring-gold/15">
              {copy.privacyNote}
            </p>
          </section>

          <section className="surface-elevated p-5">
            <h2 className="font-display text-lg font-bold tracking-tight text-charcoal">{copy.sampleWorkspaces}</h2>
            <p className="mt-1 text-sm text-charcoal-soft">{copy.sampleSubtitle}</p>
            <div className="mt-4 grid gap-2">
              {SAMPLE_EVENTS.map((item) => (
                <Link
                  key={item.href}
                  href={`${item.href}?lang=${lang}`}
                  className="group flex items-center justify-between rounded-xl border border-gold/20 bg-white px-3.5 py-3 text-sm font-semibold text-maroon shadow-2xs transition hover:border-maroon/30 hover:bg-ivory-deep"
                >
                  {isEn ? item.en : item.mr}
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
