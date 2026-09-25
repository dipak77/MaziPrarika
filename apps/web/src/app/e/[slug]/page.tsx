import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { TEMPLATE_PRESETS, type DesignDocument } from '@mazi/design-schema';
import { formatMarathiDate, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';
import { renderSvg } from '@mazi/renderer';

import { RsvpForm } from '@/components/event/rsvp-form';
import { WishWall } from '@/components/event/wish-wall';
import { ShagunPanel } from '@/components/event/shagun-panel';
import { LangToggle } from '@/components/lang-toggle';
import { DPO_NOTE, panchangFor } from '@/lib/panchang';
import { getStore } from '@/lib/store';
import { devNumber, devRupees, shortDate } from '@/lib/format';
import { getCardCopy, parseCardLang, resolvePreferredLang } from '@/lib/i18n';

import { designForEvent } from '@/app/studio/[slug]/invitation/studio';
import { agendaFor } from './actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ogImage = `/api/og/invite?slug=${slug}`;
  try {
    const { agendaFor } = await import('./actions');
    const data = await agendaFor(slug);
    if (!data) return { title: 'पत्रिका सापडली नाही' };
    const title = `${data.event.title} • डिजिटल पत्रिका`;
    const description = `${data.event.title} — ${data.event.city} • ${data.event.eventDate ?? ''} • RSVP, शुभेच्छा व मुहूर्त एकाच पानावर.`;
    return {
      title,
      description,
      openGraph: { title, description, locale: 'mr_IN', type: 'website', images: [ogImage] },
      twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    };
  } catch {
    return {
      title: 'डिजिटल पत्रिका • माझी पत्रिका',
      openGraph: { images: [ogImage] },
      twitter: { card: 'summary_large_image', images: [ogImage] },
    };
  }
}

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  let cookieLang: string | undefined;
  try {
    const cookieStore = await cookies();
    cookieLang = cookieStore.get('mazi_lang')?.value;
  } catch {}
  const lang = resolvePreferredLang({
    query: typeof query.lang === 'string' ? query.lang : undefined,
    cookie: cookieLang,
  });
  const copy = getCardCopy(lang);
  const data = await agendaFor(slug);
  if (!data) notFound();

  const { event, leads, bookings, wishes } = data;
  const store = getStore();
  const rsvp = store.events.rsvpSummary(event.id);
  const guests = store.events.guests(event.id);
  const ownerPhone = store.users.byId(event.ownerUserId)?.phone;

  const date = event.eventDate ?? new Date().toISOString().slice(0, 10);
  const panchang = panchangFor(event.city, new Date(`${date}T00:00:00Z`));
  const saved = store.designs.list({ eventId: event.id, limit: 8 }).find((row) => {
    const doc = row.doc as Partial<DesignDocument> | undefined;
    return Boolean(doc?.page?.widthMm && Array.isArray(doc.elements) && doc.elements.length);
  });
  const built = saved ? undefined : designForEvent({ slug, templateId: TEMPLATE_PRESETS[0]!.id, schemeId: 'paithani' });
  const design = (saved?.doc as DesignDocument | undefined) ?? built!.design;
  const designVersion = saved?.version ?? 1;
  const heroSvg = renderSvg(design, { print: false });
  const inviteCode = typeof query.code === 'string' ? query.code.slice(0, 40) : undefined;

  const confirmedVendors = bookings
    .filter((booking) => booking.state !== 'CANCELLED')
    .map((booking) => store.vendors.byId(booking.vendorId))
    .filter(Boolean);

  const liveWishes = wishes.slice(0, 8);
  const rsvpStatus = typeof query.rsvp === 'string' ? query.rsvp : undefined;

  const num = (value: number) => (lang === 'mr' ? toDevanagariDigits(value) : String(value));
  const rupees = (paise: number) =>
    lang === 'mr' ? devRupees(paise) : `₹${(Math.round(paise) / 100).toLocaleString('en-IN')}`;
  const dateLabel =
    lang === 'mr'
      ? formatMarathiDate(event.eventDate ?? date, 'long')
      : new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const destination = `${event.venueName ?? event.city}, ${event.city}, Maharashtra`;
  const encodedDestination = encodeURIComponent(destination);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
  const uberUrl = `https://m.uber.com/go/home?dropoff%5Bformatted_address%5D=${encodedDestination}`;
  const olaUrl = `https://book.olacabs.com/?drop_text=${encodedDestination}`;
  const rapidoUrl = `https://www.rapido.bike/Home?destination=${encodedDestination}`;
  const svgDownloadUrl = `/api/designs/${(saved?.id ?? design.id)}/svg?slug=${encodeURIComponent(slug)}&v=${designVersion}&download=1`;

  const waDigits = ownerPhone ? ownerPhone.replace(/\D/g, '') : '';
  const waNumber = waDigits.length === 10 ? `91${waDigits}` : waDigits;
  const waText = `नमस्कार! ${event.title} साठी मी येणार आहे. व्यक्ती: २${inviteCode ? ` कोड: ${inviteCode}` : ''} ॥ सहर्ष स्वागतम् ॥`;
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}` : undefined;

  const panchangRows =
    lang === 'mr'
      ? [
          { label: 'तिथी', value: `${panchang.tithi.paksha} ${panchang.tithi.name}` },
          { label: 'नक्षत्र', value: `${panchang.nakshatra.name} (पद ${toDevanagariDigits(panchang.nakshatra.pada)})` },
          { label: 'सूर्योदय', value: panchang.sunrise ?? '—' },
          { label: 'सूर्यास्त', value: panchang.sunset ?? '—' },
          { label: 'अभिजित मुहूर्त', value: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}` },
          { label: 'गोधुळी मुहूर्त', value: `${panchang.godhuliMuhurat.start} – ${panchang.godhuliMuhurat.end}` },
        ]
      : [
          { label: 'Tithi', value: `${panchang.tithi.paksha} ${panchang.tithi.name}` },
          { label: 'Nakshatra', value: `${panchang.nakshatra.name} (pada ${panchang.nakshatra.pada})` },
          { label: 'Sunrise', value: panchang.sunrise ?? '—' },
          { label: 'Sunset', value: panchang.sunset ?? '—' },
          { label: 'Abhijit muhurat', value: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}` },
          { label: 'Godhuli muhurat', value: `${panchang.godhuliMuhurat.start} – ${panchang.godhuliMuhurat.end}` },
        ];

  return (
    <div className="min-h-screen bg-ivory">
      <div className="paithani-edge h-2" aria-hidden />

      <header className="shell py-8 text-center">
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-gold-ink">{copy.blessing}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-maroon sm:text-4xl">{event.title}</h1>
        <p className="mt-2 text-charcoal-soft">
          {dateLabel} • {event.city}
        </p>
        {event.venueName ? <p className="mt-1 text-sm text-charcoal-soft">{event.venueName}</p> : null}
        <div className="mt-4 flex justify-center">
          <LangToggle lang={lang} />
        </div>
      </header>

      <div className="shell grid gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-8">
          <section aria-labelledby="invite-heading" className="surface overflow-hidden p-0">
            <h2 id="invite-heading" className="sr-only">
              {event.title}
            </h2>
            <div
              className="grid place-items-center bg-ivory-deep/40 p-4"
              dangerouslySetInnerHTML={{ __html: heroSvg }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/25 px-5 py-3 text-xs text-charcoal-soft">
              <span>{copy.digitalNote}</span>
              <a
                href={svgDownloadUrl}
                className="inline-flex min-h-11 items-center font-semibold text-maroon"
              >
                {copy.downloadSvg}
              </a>
            </div>
          </section>

          <section aria-labelledby="muhurat-heading" className="surface p-5">
            <h2 id="muhurat-heading" className="font-display text-xl font-bold text-charcoal">
              {copy.muhuratTitle}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {panchangRows.map((row) => (
                <div key={row.label} className="rounded-xl border border-gold/25 bg-ivory-deep/40 px-4 py-3">
                  <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{row.label}</p>
                  <p className="mt-1 font-semibold text-charcoal">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-gold/30 bg-ivory px-4 py-3">
              <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
                {lang === 'mr' ? 'राहुकाळ (या काळात मुख्य विधी टाळावा)' : 'Rahukaal (avoid main rites during this time)'}
              </p>
              <p className="mt-1 font-semibold text-maroon">
                {panchang.rahuKaal.start} – {panchang.rahuKaal.end}
              </p>
            </div>
            <p className="mt-3 text-xs text-charcoal-soft">
              {panchang.method.ephemeris} • {lang === 'mr' ? `अयनांश ${toDevanagariDigits(panchang.ayanamsa.toFixed(3))}°` : `Ayanamsa ${panchang.ayanamsa.toFixed(3)}°`} • {DPO_NOTE}
            </p>
          </section>

          <section aria-labelledby="agenda-heading" className="surface p-5">
            <h2 id="agenda-heading" className="font-display text-xl font-bold text-charcoal">
              {copy.agendaTitle}
            </h2>
            <ol className="mt-4 space-y-4 border-l border-gold/40 pl-5">
              <AgendaItem
                title={copy.agendaWelcome}
                time={lang === 'mr' ? `${panchang.godhuliMuhurat.start} पासून` : `from ${panchang.godhuliMuhurat.start}`}
                detail={event.venueName ? `${event.venueName}, ${event.city}` : event.city}
              />
              <AgendaItem
                title={copy.agendaRite}
                time={
                  lang === 'mr'
                    ? `अभिजित मुहूर्त ${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`
                    : `Abhijit muhurat ${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`
                }
                detail={lang === 'mr' ? 'मंगलचिन्ह व गणेश पूजनानंतर' : 'After Mangalchinha and Ganesh pujan'}
              />
              <AgendaItem
                title={copy.agendaReception}
                time={lang === 'mr' ? `${panchang.sunset ?? 'सायंकाळ'} नंतर` : `after ${panchang.sunset ?? 'evening'}`}
                detail={lang === 'mr' ? 'आसन व्यवस्था व जेवण सुरू' : 'Seating and dinner begin'}
              />
            </ol>
            {confirmedVendors.length ? (
              <div className="mt-5 border-t border-gold/25 pt-4">
                <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{copy.vendorsTitle}</p>
                <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                  {confirmedVendors.map((vendor) => (
                    <li key={vendor!.id} className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-charcoal-soft">
                      {vendorCategoryLabel(vendor!.category)} — {vendor!.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <WishWall
            slug={slug}
            initial={liveWishes.map((wish) => ({
              id: wish.id,
              body: wish.guestName ? `${wish.guestName}: ${wish.body}` : wish.body,
              at: shortDate(wish.createdAt),
            }))}
          />
        </main>

        <aside className="space-y-6">
          <section id="rsvp" aria-labelledby="rsvp-heading" className="surface p-5">
            <h2 id="rsvp-heading" className="font-display text-lg font-bold text-charcoal">
              {copy.rsvpTitle}
            </h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              {lang === 'mr'
                ? `${toDevanagariDigits(rsvp.yes)} कुटुंबांनी होकार दिला आहे • एकूण ${toDevanagariDigits(rsvp.expectedHeads)} व्यक्ती अपेक्षित`
                : `${rsvp.yes} families confirmed • ${rsvp.expectedHeads} guests expected`}
            </p>
            {rsvpStatus === 'ok' ? (
              <p role="status" className="mt-3 rounded-xl border border-paithani/50 bg-paithani/10 px-3 py-2 text-sm text-paithani">
                {copy.rsvpThanks}
              </p>
            ) : null}
            <RsvpForm slug={slug} code={inviteCode} />
            <p className="mt-3 text-xs text-charcoal-soft">{copy.rsvpDashboardNote}</p>
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.rsvpWhatsapp}
                className="btn-base mt-3 inline-flex min-h-11 w-full items-center justify-center border border-paithani/40 px-4 py-2 text-sm font-semibold text-paithani"
              >
                {copy.rsvpWhatsapp}
              </a>
            ) : null}
          </section>

          <section aria-labelledby="venue-heading" className="surface p-5">
            <h2 id="venue-heading" className="font-display text-lg font-bold text-charcoal">
              {copy.venueTitle}
            </h2>
            <p className="mt-2 text-sm text-charcoal-soft">
              {event.venueName ?? event.city}
              {event.venueAddress ? `, ${event.venueAddress}` : ''}
            </p>
            <p className="mt-1 text-sm text-charcoal">Venue (English): {destination}</p>
            {event.venueAddress ? <p className="mt-1 text-xs text-charcoal-soft">{copy.venueParking}</p> : null}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-maroon mt-3 inline-flex min-h-11 items-center justify-center px-4 py-2 text-sm"
            >
              {copy.openMap}
            </a>
            <p className="mt-4 font-ui text-xs uppercase tracking-wider text-charcoal-soft">{copy.rideTitle}</p>
            <div className="mt-2 grid gap-2">
              <a
                href={uberUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.rideUber}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm font-semibold text-charcoal"
              >
                {copy.rideUber} →
              </a>
              <a
                href={olaUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.rideOla}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm font-semibold text-charcoal"
              >
                {copy.rideOla} →
              </a>
              <a
                href={rapidoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.rideRapido}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm font-semibold text-charcoal"
              >
                {copy.rideRapido} →
              </a>
            </div>
          </section>

          <ShagunPanel title={event.title} ownerPhone={ownerPhone ?? undefined} lang={lang} />

          <section aria-labelledby="print-hubs-heading" className="surface p-5">
            <h2 id="print-hubs-heading" className="font-display text-lg font-bold text-charcoal">
              {copy.printHubsTitle}
            </h2>
            <ul className="mt-2 space-y-2 text-sm text-charcoal-soft">
              {copy.printHubs.map((hub) => (
                <li key={hub} className="flex min-h-11 items-center gap-2 rounded-xl border border-gold/25 bg-ivory-deep/40 px-3 py-2">
                  <span aria-hidden>📍</span>
                  <span>{hub}</span>
                </li>
              ))}
              <li className="flex min-h-11 items-center gap-2 rounded-xl border border-gold/25 bg-ivory-deep/40 px-3 py-2">
                <span aria-hidden>🚚</span>
                <span>{copy.printDoorstep}</span>
              </li>
            </ul>
            <p className="mt-2 text-xs text-charcoal-soft">{copy.printHubsNote}</p>
            <a
              href={svgDownloadUrl}
              aria-label={copy.downloadSvg}
              className="mt-3 inline-flex min-h-11 items-center font-semibold text-maroon"
            >
              {copy.downloadSvg}
            </a>
          </section>

          <section aria-labelledby="help-heading" className="surface p-5">
            <h2 id="help-heading" className="font-display text-lg font-bold text-charcoal">
              {copy.helpTitle}
            </h2>
            <ul className="mt-2 space-y-2 text-sm text-charcoal-soft">
              {copy.helpItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">{copy.safetyNote}</p>
          </section>

          <section aria-labelledby="platform-heading" className="surface p-5">
            <h2 id="platform-heading" className="font-display text-lg font-bold text-charcoal">
              {copy.platformTitle}
            </h2>
            <ul className="mt-2 space-y-1 text-xs text-charcoal-soft">
              <li>
                {lang === 'mr' ? `पत्रिका आवृत्ती ${toDevanagariDigits(designVersion)} • रेंडरर सर्व्हर-साइड` : `Invitation version ${designVersion} • server-side renderer`}
              </li>
              <li>
                {lang === 'mr' ? `पंचांग: ${panchang.method.ephemeris} (${toDevanagariDigits(panchang.method.ayanamsa)})` : `Panchang: ${panchang.method.ephemeris} (${panchang.method.ayanamsa})`}
              </li>
              <li>{lang === 'mr' ? `एकूण पाहुणे नोंदी ${toDevanagariDigits(guests.length)}` : `Total guest entries ${guests.length}`}</li>
              <li>
                {lang === 'mr'
                  ? 'अंदाजे कार्यक्रम खर्च प्रकट केलेला नाही — कुटुंबाने निवडल्यासच दिसेल'
                  : 'Estimated event cost is hidden — shown only if the family opts in'}
              </li>
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">
              {lang === 'mr' ? `${devNumber(leads.length)} विक्रेता विनंत्या • वाटप खर्च ${devRupees(0)} (पाहुण्यांसाठी मोफत)` : `${leads.length} vendor requests • sharing cost ${rupees(0)} (free for guests)`}
            </p>
            <Link href="/create" className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-maroon">
              {copy.createOwn}
            </Link>
          </section>
        </aside>
      </div>

      <footer className="border-t border-gold/30 bg-ivory-deep/40 py-6 text-center text-xs text-charcoal-soft">
        <p>{copy.footerLine1}</p>
        <p className="mt-1">{copy.footerLine2}</p>
        <p className="mt-1">{lang === 'mr' ? `आवृत्ती ${toDevanagariDigits(designVersion)} • ${num(guests.length)} नोंदी` : `Version ${designVersion} • ${guests.length} entries`}</p>
      </footer>
    </div>
  );
}

function AgendaItem({ title, time, detail }: { title: string; time: string; detail: string }) {
  return (
    <li className="relative">
      <span aria-hidden className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-gold" />
      <p className="font-semibold text-charcoal">{title}</p>
      <p className="text-sm text-charcoal-soft">{time}</p>
      <p className="text-xs text-charcoal-soft">{detail}</p>
    </li>
  );
}
