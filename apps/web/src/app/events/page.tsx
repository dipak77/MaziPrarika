import Link from 'next/link';

import { EVENT_TYPES, formatMarathiDate, toDevanagariDigits } from '@mazi/marathi';

import { CITY_OPTIONS, DPO_NOTE, panchangFor } from '@/lib/panchang';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'सार्वजनिक पत्रिका — महाराष्ट्र',
  description: 'कुटुंबांनी स्वेच्छेने सार्वजनिक केलेल्या कार्यक्रमांची पत्रिका — तारीख, ठिकाण, पंचांग व शुभेच्छा.',
};

const TODAY = new Date().toISOString().slice(0, 10);
const ONE_YEAR = new Date(Date.now() + 366 * 86_400_000).toISOString().slice(0, 10);

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const first = (value: string | string[] | undefined): string => (typeof value === 'string' ? value : '');
  const city = first(query.city);
  const type = first(query.type);

  const store = getStore();
  // Discovery is opt-in: `is_public` defaults to 0, so nothing a family did not
  // publish can ever appear here.
  const events = store.events
    .list({ publicOnly: true, limit: 60 })
    .filter((event) => event.eventDate && event.eventDate >= TODAY && event.eventDate <= ONE_YEAR)
    .filter((event) => (city ? event.city === city : true))
    .filter((event) => (type ? event.eventType === type : true))
    .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)));

  const publicCount = store.events.list({ publicOnly: true, limit: 100 }).length;

  return (
    <div className="shell py-10">
      <header className="max-w-3xl">
        <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">Event Discovery</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-maroon">सार्वजनिक पत्रिका</h1>
        <p className="mt-3 text-lg text-charcoal-soft">
          काही कुटुंबे आपली पत्रिका सार्वजनिक करतात — मग नातेवाईक, मित्र व नवीन पाहुणे ती शोधू शकतात. नोंदणी न करता
          पाहता येते; शुभेच्छा देण्यासाठी नाव लिहावे लागते.
        </p>
      </header>

      <form className="surface mt-6 grid gap-3 p-5 sm:grid-cols-3" method="get">
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">शहर</span>
          <select name="city" defaultValue={city} className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm">
            <option value="">सर्व शहरे</option>
            {CITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">प्रकार</span>
          <select name="type" defaultValue={type} className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm">
            <option value="">सर्व प्रकार</option>
            {Object.values(EVENT_TYPES).map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="self-end rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory">
          पत्रिका शोधा
        </button>
      </form>

      <p className="mt-4 text-xs text-charcoal-soft">
        एकूण सार्वजनिक पत्रिका: {toDevanagariDigits(publicCount)} • पुढील १२ महिन्यांतील: {toDevanagariDigits(events.length)} •{' '}
        {DPO_NOTE}
      </p>

      <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const spec = EVENT_TYPES[event.eventType as keyof typeof EVENT_TYPES];
          const panchang = event.eventDate ? panchangFor(event.city, new Date(`${event.eventDate}T00:00:00Z`)) : null;
          const rsvp = store.events.rsvpSummary(event.id);
          const wishes = store.events.wishes(event.id).length;
          return (
            <li key={event.id} className="surface flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-gold/45 bg-gold/10 px-2.5 py-1 text-[11px] font-medium text-charcoal">
                  {spec?.label ?? event.eventType}
                </span>
                <span className="font-ui text-[11px] text-charcoal-soft">{event.city}</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold text-maroon">{event.title}</h2>
              <p className="mt-1 text-sm text-charcoal-soft">
                {event.hostNames.length ? `${event.hostNames.join(' व ')} यांचा सोहळा` : 'कौटुंबिक सोहळा'}
              </p>
              <dl className="mt-3 space-y-1 text-xs text-charcoal-soft">
                <div className="flex justify-between gap-2">
                  <dt>तारीख</dt>
                  <dd className="font-semibold text-charcoal">
                    {event.eventDate ? formatMarathiDate(`${event.eventDate}T00:00:00Z`, 'full') : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>तिथी</dt>
                  <dd className="text-charcoal">
                    {panchang ? `${panchang.tithi.paksha} ${panchang.tithi.name}` : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>ठिकाण</dt>
                  <dd className="text-right text-charcoal">{event.venueName ?? event.city}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>स्वागत</dt>
                  <dd className="text-charcoal">
                    {toDevanagariDigits(rsvp.yes + rsvp.maybe)} / {toDevanagariDigits(rsvp.invited)} धन्यवाद
                  </dd>
                </div>
              </dl>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <span className="text-[11px] text-charcoal-soft">
                  {toDevanagariDigits(wishes)} शुभेच्छा
                </span>
                <Link
                  href={`/e/${event.slug}`}
                  className="rounded-full bg-maroon px-4 py-2 text-xs font-semibold text-ivory"
                >
                  पत्रिका पाहा →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {events.length === 0 ? (
        <div className="surface mt-6 p-8 text-center">
          <p className="font-display text-xl font-bold text-maroon">या फिल्टरसाठी पत्रिका सापडली नाही</p>
          <p className="mt-2 text-sm text-charcoal-soft">
            पत्रिका सार्वजनिक करणे हे कुटुंबाच्या हातात आहे — कोणतीही पत्रिका स्वतःहून इथे येत नाही.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/events" className="rounded-full border border-gold/45 px-4 py-2 text-xs font-semibold text-maroon">
              फिल्टर साफ करा
            </Link>
            <Link href="/create" className="rounded-full bg-maroon px-4 py-2 text-xs font-semibold text-ivory">
              स्वतःची पत्रिका बनवा
            </Link>
          </div>
        </div>
      ) : null}

      <section className="surface mt-6 p-6">
        <h2 className="font-display text-xl font-bold text-charcoal">पत्रिका सार्वजनिक करायची की नाही?</h2>
        <p className="mt-2 text-sm text-charcoal-soft">
          प्रत्येक कार्यक्रम डिफॉल्टनुसार खाजगी असतो. इन्व्हिएशन स्टुडिओत “सार्वजनिक पत्रिका” सुरू केल्यावरच ती इथे
          दिसते, आणि बंद केल्यावर ती लगेच लपते. पाहुण्यांचे आकडे, बजेट व फोन नंबर कधीही सार्वजनिक होत नाहीत.
        </p>
      </section>
    </div>
  );
}
