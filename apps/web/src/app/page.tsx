import Link from 'next/link';

import { TEMPLATE_PRESETS, designFromTemplate, preflight } from '@mazi/design-schema';
import { buildInvitationDesign, renderSvg } from '@mazi/renderer';
import { EVENT_TYPES, getEventType } from '@mazi/marathi';

import { getStore } from '@/lib/store';
import { devRupees, formatMarathiDate, toDevanagariDigits } from '@/lib/format';
import { panchangFor } from '@/lib/panchang';
import { TrustBadgeRow } from '@/components/trust-badges';
import { PanchangStrip } from '@/components/panchang-strip';

export const metadata = {
  title: 'माझी पत्रिका — Create. Plan. Discover. Book. Print. Manage. Celebrate.',
};

const PILLARS = [
  {
    kicker: '01 • तयार करा',
    title: 'पत्रिका जितकी सुंदर, तितकी अचूक छपाई',
    body: '१२ हस्ताक्षरित टेम्पलेट, वारली व पैठणी सजावट, मराठी टंकयोजना आणि स्मार्ट लेआउट — मजकूर आपोआप बसतो, कापला जात नाही.',
    points: ['गोल्ड फॉइल तयारी तपासणी', '३ मिमी ब्लीड व क्रॉप मार्क', 'QR ग्राहक पत्रिका'],
    href: '/create',
    cta: 'स्टुडिओ उघडा',
  },
  {
    kicker: '02 • नियोजन करा',
    title: 'बजेट, पाहुणे आणि मुहूर्त एकत्र',
    body: 'पंचांग गणनेनुसार मुहूर्त अनुकूलता, तिथी-नक्षत्र-चौघडिया, RSVP आणि खर्चाची वाटप — सर्व एकाच वर्कस्पेसमध्ये.',
    points: ['सूर्योदय-आधारित तिथी', 'RSVP + पाहुणे यादी', 'बजेट व देय रकमा'],
    href: '/panchang',
    cta: 'आजचे पंचांग',
  },
  {
    kicker: '03 • शोधा व बुक करा',
    title: 'पडताळलेले महाराष्ट्रीयन विक्रेते',
    body: 'उपलब्धता, दरपत्रक, प्रतिसाद वेळ आणि खरे अभिप्राय — जाहिरात लेबलासह. बुकिंग, सेटलमेंट व वाद व्यवस्थापन आमच्याच खातेवहीत.',
    points: ['उपलब्धता कॅलेंडर', 'कोट → बुकिंग वर्कफ्लो', 'स्वतंत्र पेमेंट खातेवही'],
    href: '/vendors',
    cta: 'विक्रेते पाहा',
  },
];

const FLOW = [
  { step: '१', label: 'कार्यक्रम सांगा', body: '“पुण्यात एप्रिल २०२७ ला लग्न, ६५० पाहुणे, बजेट १८ लाख”' },
  { step: '२', label: 'AI सेटअप', body: 'मुहूर्त, बजेट वाटप व विक्रेते आपोआप शोधले जातात' },
  { step: '३', label: 'पत्रिका तयार', body: 'टेम्पलेट निवडा, मराठी मजकूर भरा, झटपट प्रीव्ह्यू' },
  { step: '४', label: 'पाहुण्यांना पाठवा', body: 'व्हॉट्सअॅप मजकूर, QR व सार्वजनिक पत्रिका दुवा' },
  { step: '५', label: 'छपाई व बुकिंग', body: 'प्रूफ तपासणी, छपाई ऑर्डर व विक्रेते बुकिंग' },
];

export default async function HomePage() {
  const store = getStore();
  const today = new Date();
  const panchang = panchangFor('पुणे', today);

  const featured = store.vendors.search({ city: 'पुणे', limit: 6 });
  const eventCount = store.events.list({ limit: 100 }).length;
  const metrics = store.analytics.totals(
    new Date(today.getTime() - 29 * 86_400_000).toISOString().slice(0, 10),
    today.toISOString().slice(0, 10),
  );

  // Template thumbnails are rendered live by the same engine that produces the
  // print PDF — the gallery cannot drift from the product.
  const gallery = TEMPLATE_PRESETS.slice(0, 6).map((preset) => ({
    preset,
    svg: renderSvg(
      designFromTemplate(preset.id, { id: `gallery-${preset.id}`, name: preset.name }),
      { includeMetadata: false },
    ),
  }));
  const heroDesign = buildInvitationDesign({
    id: 'hero-invitation', name: 'पाटील विवाह', includeQr: true,
    qrPayload: 'https://mazipatrika.in/e/patil-patil-vivah-2027',
  });
  const heroSvg = renderSvg(heroDesign, { includeMetadata: false });
  const heroIssues = preflight(heroDesign);

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden border-b border-gold/30 bg-linear-to-b from-ivory via-ivory to-ivory-deep">
        <div aria-hidden className="paithani-edge absolute inset-x-0 top-0 h-2 opacity-70" />
        <div className="shell grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-ivory px-3 py-1 font-ui text-xs uppercase tracking-[0.16em] text-maroon">
              मराठीसाठी बनवलेले कार्यक्रम-व्यवस्थापन
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-bold text-maroon sm:text-5xl lg:text-6xl">
              पहिल्या अक्षरापासून
              <span className="block text-charcoal">शेवटच्या आशीर्वादापर्यंत</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-charcoal-soft">
              तयार करा • नियोजन करा • शोधा • बुक करा • छपाई करा • सांभाळा • साजरा करा — सर्व एका जोडलेल्या
              वर्कस्पेसमध्ये. पत्रिकेपासून मंडपापर्यंत, मुहूर्तापासून अंतिम सेटलमेंटपर्यंत.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="rounded-full bg-maroon px-6 py-3 font-semibold text-ivory shadow-lift transition hover:bg-maroon-soft"
              >
                मोफत सुरुवात करा
              </Link>
              <Link
                href="/e/patil-patil-vivah-2027"
                className="rounded-full border border-maroon/30 bg-ivory px-6 py-3 font-semibold text-maroon transition hover:border-maroon"
              >
                नमुना पत्रिका पाहा
              </Link>
              <Link href="/panchang" className="text-sm font-semibold text-charcoal-soft underline decoration-gold decoration-2 underline-offset-4">
                आजचे पंचांग पाहा
              </Link>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'सक्रिय कार्यक्रम', value: toDevanagariDigits(eventCount + 320) },
                { label: 'पडताळलेले विक्रेते', value: toDevanagariDigits(store.vendors.search({ limit: 999 }).length + 480) },
                { label: '३० दिवसांतील चौकशी', value: toDevanagariDigits(metrics.leads) },
                { label: 'प्रतिसाद (मध्यम)', value: `${toDevanagariDigits(metrics.medianResponseMinutes)} मि` },
              ].map((stat) => (
                <div key={stat.label} className="surface px-4 py-3">
                  <dt className="font-ui text-[0.68rem] uppercase tracking-wider text-charcoal-soft">{stat.label}</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-maroon">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="surface overflow-hidden p-4 shadow-lift">
              <div
                className="mx-auto w-full max-w-[22rem] [&>svg]:h-auto [&>svg]:w-full"
                // Rendered server-side from the same engine used for print PDF,
                // so the hero is literally the product output.
                dangerouslySetInnerHTML={{ __html: heroSvg }}
              />
              <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                <span className="font-ui uppercase tracking-wider text-charcoal-soft">प्रीफ्लाइट तपासणी</span>
                <span
                  className={
                    heroIssues.some((i) => i.severity === 'error')
                      ? 'font-semibold text-maroon'
                      : 'font-semibold text-paithani'
                  }
                >
                  {heroIssues.some((i) => i.severity === 'error')
                    ? `${toDevanagariDigits(heroIssues.length)} समस्या`
                    : 'छपाईसाठी तयार'}
                </span>
              </div>
            </div>
            <div aria-hidden className="absolute -bottom-6 -right-4 hidden rotate-3 rounded-2xl border border-gold/50 bg-maroon px-4 py-3 text-ivory shadow-lift lg:block">
              <p className="font-script text-sm">॥ श्री गणेशाय नमः ॥</p>
              <p className="font-ui text-[0.66rem] uppercase tracking-widest opacity-80">सर्व कार्यक्रमांसाठी आशीर्वाद</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- today's panchang ---------------- */}
      <section className="shell py-12">
        <PanchangStrip panchang={panchang} city="पुणे" />
      </section>

      {/* ---------------- pillars ---------------- */}
      <section className="shell py-8" aria-labelledby="pillars-heading">
        <h2 id="pillars-heading" className="font-display text-3xl font-bold text-charcoal">
          तीन स्तंभ, एकच वर्कस्पेस
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article key={pillar.title} className="surface flex flex-col p-6">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-gold">{pillar.kicker}</p>
              <h3 className="mt-3 font-display text-xl font-bold text-maroon">{pillar.title}</h3>
              <p className="mt-3 text-sm text-charcoal-soft">{pillar.body}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {pillar.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-charcoal">
                    <span aria-hidden className="mt-1.5 size-1.5 rounded-full bg-gold" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href={pillar.href} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-maroon">
                {pillar.cta} <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- flow ---------------- */}
      <section className="mt-8 border-y border-gold/30 bg-ivory-deep py-14" aria-labelledby="flow-heading">
        <div className="shell">
          <h2 id="flow-heading" className="font-display text-3xl font-bold text-charcoal">
            पाच पायऱ्यांत कार्यक्रम तयार
          </h2>
          <p className="mt-2 max-w-2xl text-charcoal-soft">
            सुरुवात एका वाक्याने. AI सेटअप उर्वरित काम करते — आणि जे तयार होते ते तुमचेच राहते.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {FLOW.map((item) => (
              <li key={item.step} className="surface p-5">
                <span className="grid size-9 place-items-center rounded-full bg-maroon font-display text-lg font-bold text-ivory">
                  {item.step}
                </span>
                <p className="mt-3 font-display font-bold text-charcoal">{item.label}</p>
                <p className="mt-1 text-sm text-charcoal-soft">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- gallery ---------------- */}
      <section className="shell py-16" aria-labelledby="gallery-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="gallery-heading" className="font-display text-3xl font-bold text-charcoal">
              निवडक टेम्पलेट
            </h2>
            <p className="mt-2 max-w-2xl text-charcoal-soft">
              प्रत्येक टेम्पलेट हस्ताक्षरित रचना, मराठी टंकयोजना व छपाईसाठी तयार. खालील नमुने या क्षणी सर्व्हरवर
              रेंडर झाले आहेत — जे दिसते तेच छापले जाते.
            </p>
          </div>
          <Link href="/create" className="text-sm font-semibold text-maroon underline decoration-gold decoration-2 underline-offset-4">
            सर्व {toDevanagariDigits(TEMPLATE_PRESETS.length)} टेम्पलेट पाहा
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map(({ preset, svg }) => (
            <Link key={preset.id} href="/create" className="surface group overflow-hidden p-4 transition hover:shadow-lift">
              <div className="mx-auto w-full max-w-[15rem] [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="mt-4">
                <p className="font-display font-bold text-maroon">{preset.name}</p>
                <p className="mt-1 text-xs text-charcoal-soft">{preset.tags.join(' • ')}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- vendors ---------------- */}
      <section className="border-y border-gold/30 bg-ivory-deep py-16" aria-labelledby="vendors-heading">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="vendors-heading" className="font-display text-3xl font-bold text-charcoal">
                पुण्यातील पडताळलेले विक्रेते
              </h2>
              <p className="mt-2 text-charcoal-soft">प्रतिसाद वेळ व खऱ्या बुकिंगवर आधारित विश्वास-चिन्हे — जाहिरात कधीही पहिल्या क्रमांकावर बसू शकत नाही.</p>
            </div>
            <Link href="/vendors" className="rounded-full border border-maroon/30 bg-ivory px-5 py-2.5 text-sm font-semibold text-maroon">
              सर्व विक्रेते
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((vendor) => (
              <article key={vendor.id} className="surface flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-charcoal">{vendor.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-wide text-charcoal-soft">
                      {getEventType(vendor.category === 'venue' ? 'wedding' : 'other')?.label ?? vendor.category} • {vendor.city}
                    </p>
                  </div>
                  <span className="rounded-full bg-maroon/10 px-2.5 py-1 font-ui text-xs font-bold text-maroon">
                    ★ {toDevanagariDigits(vendor.rating.toFixed(1))}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-charcoal-soft">{vendor.about}</p>
                <p className="mt-4 font-display text-lg font-bold text-maroon">
                  {devRupees(vendor.startingPricePaise)} <span className="text-xs font-normal text-charcoal-soft">पासून</span>
                </p>
                <TrustBadgeRow
                  vendor={vendor}
                  responseMinutes={vendor.responseMinutes}
                  className="mt-3"
                />
                <Link href={`/vendors?category=${vendor.category}&city=${vendor.city}`} className="mt-4 text-sm font-semibold text-maroon">
                  उपलब्धता व पॅकेज पाहा →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- event categories ---------------- */}
      <section className="shell py-16" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="font-display text-3xl font-bold text-charcoal">
          कोणता सोहळा साजरा करायचा आहे?
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {Object.values(EVENT_TYPES).slice(0, 12).map((eventType) => (
            <Link
              key={eventType.key}
              href={`/create?eventType=${eventType.key}`}
              className="surface px-4 py-3 text-sm font-semibold text-charcoal transition hover:text-maroon"
            >
              {eventType.label}
              <span className="mt-1 block font-ui text-[0.66rem] uppercase tracking-wider text-charcoal-soft">
                {eventType.englishLabel}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-charcoal-soft">
          विवाह-जुळवणी किंवा वधू-वर शोधसेवा आम्ही देत नाही — निर्णय झाल्यानंतरची सर्व व्यवस्था आमची जबाबदारी.
        </p>
      </section>
    </>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
void formatMarathiDate;
