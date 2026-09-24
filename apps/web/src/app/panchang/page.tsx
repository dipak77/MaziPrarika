import Link from 'next/link';

import { EVENT_TYPES, formatMarathiDate, getEventType, toDevanagariDigits } from '@mazi/marathi';
import { findMuhurats } from '@mazi/panchang';

import { PanchangMonth } from '@/components/panchang-month';
import { CITY_OPTIONS, DPO_NOTE, locationFor, panchangFor } from '@/lib/panchang';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'पंचांग व मुहूर्त — महाराष्ट्र',
  description: 'तिथी, नक्षत्र, चौघडिया, राहुकाळ व मुहूर्त अनुकूलता — शहरानुसार गणना, पद्धतीसह.',
};

const EVENT_CHOICES = Object.values(EVENT_TYPES).filter((spec) => spec.muhuratSensitive).slice(0, 8);

export default async function PanchangPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const first = (value: string | string[] | undefined, fallback: string): string =>
    typeof value === 'string' && value.length ? value : fallback;

  const city = first(query.city, 'पुणे');
  const dateParam = first(query.date, new Date().toISOString().slice(0, 10));
  const eventType = first(query.event, 'wedding');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : new Date().toISOString().slice(0, 10);

  const location = locationFor(city);
  const panchang = panchangFor(city, new Date(`${date}T00:00:00Z`));
  const store = getStore();

  const monthStart = `${date.slice(0, 7)}-01`;
  const monthEnd = new Date(new Date(`${monthStart}T00:00:00Z`).getTime() + 32 * 86_400_000).toISOString().slice(0, 10);
  const muhurats = findMuhurats({
    eventType,
    location: { city, latitude: location.latitude, longitude: location.longitude, tzOffsetHours: location.tzOffsetHours },
    from: date,
    to: new Date(new Date(`${date}T00:00:00Z`).getTime() + 60 * 86_400_000).toISOString().slice(0, 10),
    limit: 40,
  });

  const monthDays = Array.from({ length: 31 })
    .map((_, index) => {
      const day = new Date(new Date(`${monthStart}T00:00:00Z`).getTime() + index * 86_400_000);
      if (day.toISOString().slice(0, 7) !== monthStart.slice(0, 7)) return null;
      return panchangFor(city, day);
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  const topMuhurats = muhurats.filter((entry) => entry.score >= 70).slice(0, 8);
  const spec = getEventType(eventType);

  const festivalNotes = monthDays
    .filter((day) => day.tithi.isPurnima || day.tithi.isAmavasya)
    .map((day) => ({ date: day.date, label: day.tithi.isPurnima ? 'पौर्णिमा' : 'अमावास्या' }));

  return (
    <div className="shell py-10">
      <header className="max-w-3xl">
        <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">Panchang Engine</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-maroon">पंचांग व मुहूर्त</h1>
        <p className="mt-3 text-lg text-charcoal-soft">
          प्रत्येक गणना शहरानुसार — सूर्योदय महाराष्ट्रात २० मिनिटांपर्यंत बदलतो, आणि तिथीची सीमा त्यावर ठरते. {DPO_NOTE}
        </p>
      </header>

      <form className="surface mt-6 grid gap-3 p-5 sm:grid-cols-3" method="get">
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">शहर</span>
          <select name="city" defaultValue={city} className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm">
            {CITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">तारीख</span>
          <input type="date" name="date" defaultValue={date} className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">
          <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">कार्यक्रम प्रकार</span>
          <select name="event" defaultValue={eventType} className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm">
            {EVENT_CHOICES.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory sm:col-span-3">
          पंचांग पाहा
        </button>
      </form>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'तिथी', value: `${panchang.tithi.paksha} ${panchang.tithi.name}`, note: `समाप्ती ${panchang.tithi.endsAt}` },
          { label: 'नक्षत्र', value: panchang.nakshatra.name, note: `पद ${toDevanagariDigits(panchang.nakshatra.pada)} • समाप्ती ${panchang.nakshatra.endsAt}` },
          { label: 'योग', value: panchang.yoga.name, note: `करण ${panchang.karana.name}` },
          { label: 'मास / संवत', value: `${panchang.masa}`, note: `शके ${toDevanagariDigits(panchang.shakaYear)} • वि.सं. ${toDevanagariDigits(panchang.vikramSamvat)}` },
        ].map((tile) => (
          <div key={tile.label} className="surface p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{tile.label}</p>
            <p className="mt-1 font-display text-xl font-bold text-maroon">{tile.value}</p>
            <p className="mt-0.5 text-xs text-charcoal-soft">{tile.note}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">दिवसाचे वेळापत्रक</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'सूर्योदय', value: panchang.sunrise ?? '—', tone: 'neutral' },
                { label: 'सूर्यास्त', value: panchang.sunset ?? '—', tone: 'neutral' },
                { label: 'अभिजित मुहूर्त', value: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`, tone: 'good' },
                { label: 'ब्रह्म मुहूर्त', value: `${panchang.brahmaMuhurat.start} – ${panchang.brahmaMuhurat.end}`, tone: 'good' },
                { label: 'विजय मुहूर्त', value: `${panchang.vijayaMuhurat.start} – ${panchang.vijayaMuhurat.end}`, tone: 'good' },
                { label: 'गोधुळी मुहूर्त', value: `${panchang.godhuliMuhurat.start} – ${panchang.godhuliMuhurat.end}`, tone: 'good' },
                { label: 'राहुकाळ', value: `${panchang.rahuKaal.start} – ${panchang.rahuKaal.end}`, tone: 'bad' },
                { label: 'यमगंड', value: `${panchang.yamaganda.start} – ${panchang.yamaganda.end}`, tone: 'bad' },
                { label: 'गुलिक काळ', value: `${panchang.gulikaKaal.start} – ${panchang.gulikaKaal.end}`, tone: 'bad' },
              ].map((row) => (
                <div
                  key={row.label}
                  className={
                    row.tone === 'bad'
                      ? 'rounded-xl border border-maroon/30 bg-maroon/5 px-4 py-3'
                      : row.tone === 'good'
                        ? 'rounded-xl border border-paithani/35 bg-paithani/8 px-4 py-3'
                        : 'rounded-xl border border-gold/25 bg-ivory-deep/40 px-4 py-3'
                  }
                >
                  <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{row.label}</p>
                  <p className="mt-1 font-semibold text-charcoal">{row.value}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 font-display text-lg font-bold text-charcoal">चौघडिया (दिवस)</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {panchang.choghadiyaDay.map((window) => (
                <li
                  key={`${window.startIso}-${window.label}`}
                  className={
                    window.quality === 'शुभ'
                      ? 'rounded-lg border border-paithani/35 bg-paithani/8 px-3 py-2 text-xs'
                      : window.quality === 'अशुभ'
                        ? 'rounded-lg border border-maroon/30 bg-maroon/5 px-3 py-2 text-xs'
                        : 'rounded-lg border border-gold/30 bg-ivory px-3 py-2 text-xs'
                  }
                >
                  <p className="font-semibold text-charcoal">{window.label}</p>
                  <p className="text-charcoal-soft">
                    {window.start} – {window.end}
                  </p>
                  <p className="text-charcoal-soft">{window.quality}</p>
                </li>
              ))}
            </ul>
          </section>

          <PanchangMonth
            city={city}
            monthLabel={formatMarathiDate(`${monthStart}T00:00:00Z`, 'month-year')}
            days={monthDays.map((day) => ({
              date: day.date,
              weekday: day.weekdayName,
              tithi: `${day.tithi.paksha} ${day.tithi.name}`,
              nakshatra: day.nakshatra.name,
              isPurnima: day.tithi.isPurnima,
              isAmavasya: day.tithi.isAmavasya,
              muhuratScore: muhurats.find((entry) => entry.date === day.date)?.score ?? null,
            }))}
          />

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">
              {spec.label} — पुढील ६० दिवसांतील अनुकूलता
            </h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              पद्धत: {muhurats[0]?.methodology.name ?? 'सामान्य शुभ मुहूर्त'} • गणना {muhurats[0]?.panchang.method.ephemeris ?? ''} •
              अयनांश {muhurats[0] ? toDevanagariDigits(muhurats[0].panchang.ayanamsa.toFixed(2)) : ''}°
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {topMuhurats.map((entry) => (
                <li key={entry.date} className="rounded-xl border border-gold/25 bg-ivory p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-charcoal">
                      {entry.weekday}, {formatMarathiDate(`${entry.date}T00:00:00Z`)}
                    </p>
                    <span className="rounded-full border border-gold/45 bg-gold/10 px-2 py-0.5 text-[11px] text-charcoal">
                      {toDevanagariDigits(entry.score)}/१००
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal-soft">
                    {entry.panchang.tithi.paksha} {entry.panchang.tithi.name} • {entry.panchang.nakshatra.name} • {entry.band}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-charcoal-soft">
                    {entry.recommendedWindows.slice(0, 2).map((window) => (
                      <li key={`${window.startIso}-${window.label}`}>
                        ✓ {window.label}: {window.start} – {window.end}
                      </li>
                    ))}
                    {entry.avoidWindows.slice(0, 1).map((window) => (
                      <li key={`${window.startIso}-avoid`}>
                        ✕ {window.label}: {window.start} – {window.end}
                      </li>
                    ))}
                  </ul>
                  <details className="mt-2 text-xs text-charcoal-soft">
                    <summary className="cursor-pointer font-semibold text-charcoal">गुणांकन कारणे ({toDevanagariDigits(entry.factors.length)})</summary>
                    <ul className="mt-1 space-y-1">
                      {entry.factors.map((factor) => (
                        <li key={factor.id}>
                          {factor.impact === 'positive' ? '＋' : factor.impact === 'negative' ? '−' : '·'} {factor.label} (
                          {toDevanagariDigits(factor.delta)}) — {factor.detail}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">
              ही अनुकूलता गणना आहे — “शुभ/अशुभ दिवस” असा ठोकळ निर्णय आम्ही देत नाही. अंतिम निर्णय कुटुंब व गुरुजींचा.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">या महिन्यातील विशेष तिथी</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-charcoal-soft">
              {festivalNotes.map((note) => (
                <li key={note.date} className="flex justify-between gap-2">
                  <span>{formatMarathiDate(`${note.date}T00:00:00Z`, 'day-month')}</span>
                  <span className="font-semibold text-charcoal">{note.label}</span>
                </li>
              ))}
              {festivalNotes.length === 0 ? <li>या महिन्यात नोंद नाही.</li> : null}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">जवळची मंगल कार्यालये</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {store.vendors.search({ category: 'venue', city, limit: 3 }).map((vendor) => (
                <li key={vendor.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-charcoal">{vendor.name}</span>
                  <Link href={`/vendors/${vendor.id}`} className="text-xs font-semibold text-maroon">
                    उपलब्धता
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/create`} className="mt-3 inline-block text-xs font-semibold text-maroon">
              या मुहूर्तावर कार्यक्रम तयार करा →
            </Link>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">गणना पद्धत</h2>
            <ul className="mt-2 space-y-1.5 text-xs text-charcoal-soft">
              <li>• इफेमेरिस: {panchang.method.ephemeris}</li>
              <li>• अयनांश: {toDevanagariDigits(panchang.ayanamsa.toFixed(3))}° (लाहिरी)</li>
              <li>• दिवसाची लांबी: {panchang.dayLength}</li>
              <li>• सूर्य राशी: {panchang.sunRashi} • चंद्र राशी: {panchang.moonRashi}</li>
              <li>• स्थान: {location.label} ({toDevanagariDigits(location.latitude.toFixed(3))}°N, {toDevanagariDigits(location.longitude.toFixed(3))}°E)</li>
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">{panchang.method.accuracyNote}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
