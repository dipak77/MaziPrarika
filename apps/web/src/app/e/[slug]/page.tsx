import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TEMPLATE_PRESETS } from '@mazi/design-schema';
import { formatMarathiDate, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';
import { renderSvg } from '@mazi/renderer';

import { RsvpForm } from '@/components/event/rsvp-form';
import { WishWall } from '@/components/event/wish-wall';
import { DPO_NOTE, panchangFor } from '@/lib/panchang';
import { getStore } from '@/lib/store';
import { devNumber, devRupees, shortDate } from '@/lib/format';

import { designForEvent } from '@/app/studio/[slug]/invitation/studio';
import { agendaFor } from './actions';

export const dynamic = 'force-dynamic';

/**
 * The public digital page behind every QR code on every printed card.
 *
 * It is the bridge between the physical invitation and the operational event:
 * the guest sees the invitation, the muhurat, the venue with a map link, and can
 * RSVP without installing anything. The family sees those RSVPs land in the
 * studio. No login, no app, works on a 3G phone in a village.
 */
export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await agendaFor(slug);
  if (!data) notFound();

  const { event, leads, bookings, wishes } = data;
  const store = getStore();
  const rsvp = store.events.rsvpSummary(event.id);
  const guests = store.events.guests(event.id);

  const date = event.eventDate ?? new Date().toISOString().slice(0, 10);
  const panchang = panchangFor(event.city, new Date(`${date}T00:00:00Z`));
  const { design } = designForEvent({ slug, templateId: TEMPLATE_PRESETS[0]!.id, schemeId: 'paithani' });
  const heroSvg = renderSvg(design, { print: false });

  const confirmedVendors = bookings
    .filter((booking) => booking.state !== 'CANCELLED')
    .map((booking) => store.vendors.byId(booking.vendorId))
    .filter(Boolean);

  const liveWishes = wishes.slice(0, 8);
  const rsvpStatus = typeof query.rsvp === 'string' ? query.rsvp : undefined;

  return (
    <div className="min-h-screen bg-ivory">
      <div className="paithani-edge h-2" aria-hidden />

      <header className="shell py-8 text-center">
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-gold">॥ श्री गणेशाय नमः ॥</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-maroon sm:text-4xl">{event.title}</h1>
        <p className="mt-2 text-charcoal-soft">
          {formatMarathiDate(event.eventDate ?? date, 'long')} • {event.city}
        </p>
        {event.venueName ? <p className="mt-1 text-sm text-charcoal-soft">{event.venueName}</p> : null}
      </header>

      <div className="shell grid gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-8">
          <section className="surface overflow-hidden p-0">
            <div
              className="grid place-items-center bg-ivory-deep/40 p-4"
              // The invitation the family approved, rendered from the same document.
              dangerouslySetInnerHTML={{ __html: heroSvg }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/25 px-5 py-3 text-xs text-charcoal-soft">
              <span>पत्रिका डिजिटल स्वरूपात — छपाईची प्रत जशीच्या तशी.</span>
              <a
                href={`/api/designs/${design.id}/svg?slug=${encodeURIComponent(slug)}&download=1`}
                className="font-semibold text-maroon"
              >
                पत्रिका डाउनलोड करा (SVG) ↓
              </a>
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">मुहूर्त व पंचांग</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'तिथी', value: `${panchang.tithi.paksha} ${panchang.tithi.name}` },
                { label: 'नक्षत्र', value: `${panchang.nakshatra.name} (पद ${toDevanagariDigits(panchang.nakshatra.pada)})` },
                { label: 'सूर्योदय', value: panchang.sunrise ?? '—' },
                { label: 'सूर्यास्त', value: panchang.sunset ?? '—' },
                { label: 'अभिजित मुहूर्त', value: `${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}` },
                { label: 'गोधुळी मुहूर्त', value: `${panchang.godhuliMuhurat.start} – ${panchang.godhuliMuhurat.end}` },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-gold/25 bg-ivory-deep/40 px-4 py-3">
                  <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{row.label}</p>
                  <p className="mt-1 font-semibold text-charcoal">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-gold/30 bg-ivory px-4 py-3">
              <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">
                राहुकाळ (या काळात मुख्य विधी टाळावा)
              </p>
              <p className="mt-1 font-semibold text-maroon">
                {panchang.rahuKaal.start} – {panchang.rahuKaal.end}
              </p>
            </div>
            <p className="mt-3 text-xs text-charcoal-soft">
              {panchang.method.ephemeris} • अयनांश {toDevanagariDigits(panchang.ayanamsa.toFixed(3))}° • {DPO_NOTE}
            </p>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">कार्यक्रमाची मांडणी</h2>
            <ol className="mt-4 space-y-4 border-l border-gold/40 pl-5">
              <AgendaItem
                title="स्वागत व नोंदणी"
                time={`${panchang.godhuliMuhurat.start} पासून`}
                detail={event.venueName ? `${event.venueName}, ${event.city}` : event.city}
              />
              <AgendaItem
                title="मुख्य विधी"
                time={`अभिजित मुहूर्त ${panchang.abhijitMuhurat.start} – ${panchang.abhijitMuhurat.end}`}
                detail="मंगलचिन्ह व गणेश पूजनानंतर"
              />
              <AgendaItem
                title="स्वागत समारंभ व भोजन"
                time={`${panchang.sunset ?? 'सायंकाळ'} नंतर`}
                detail="आसन व्यवस्था व जेवण सुरू"
              />
            </ol>
            {confirmedVendors.length ? (
              <div className="mt-5 border-t border-gold/25 pt-4">
                <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">सेवा देणारे</p>
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
          <section id="rsvp" className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">येण्याची खात्री कळवा</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              {toDevanagariDigits(rsvp.yes)} कुटुंबांनी होकार दिला आहे • एकूण {toDevanagariDigits(rsvp.expectedHeads)} व्यक्ती अपेक्षित
            </p>
            {rsvpStatus === 'ok' ? (
              <p className="mt-3 rounded-xl border border-paithani/50 bg-paithani/10 px-3 py-2 text-sm text-paithani">
                धन्यवाद! तुमची नोंद झाली.
              </p>
            ) : null}
            <RsvpForm slug={slug} />
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">स्थळ व नकाशा</h2>
            <p className="mt-2 text-sm text-charcoal-soft">
              {event.venueName ?? event.city}
              {event.venueAddress ? `, ${event.venueAddress}` : ''}
            </p>
            {event.venueAddress ? (
              <p className="mt-1 text-xs text-charcoal-soft">घरगुती पत्ता — पार्किंगसाठी प्रवेशद्वारावर मार्गदर्शन आहे.</p>
            ) : null}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venueName ?? event.city}, ${event.city}, Maharashtra`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-ivory"
            >
              नकाशात उघडा →
            </a>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">पाहुण्यांसाठी मदत</h2>
            <ul className="mt-2 space-y-2 text-sm text-charcoal-soft">
              <li>• निवास व्यवस्था हवी असल्यास कृपया आधी कळवा</li>
              <li>• मुलांसाठी स्वतंत्र बैठक व्यवस्था आहे</li>
              <li>• वाहन पार्किंग मोफत — प्रवेशद्वाराजवळ</li>
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">
              डिजिटल पान सुरक्षित लिंक — हा दुवा कुटुंबियांनाच पाठवा. आम्ही कधीही आधार किंवा कार्ड माहिती मागत नाही.
            </p>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">प्लॅटफॉर्म माहिती</h2>
            <ul className="mt-2 space-y-1 text-xs text-charcoal-soft">
              <li>पत्रिका आवृत्ती {toDevanagariDigits(design.version)} • रेंडरर सर्व्हर-साइड</li>
              <li>पंचांग: {panchang.method.ephemeris} ({toDevanagariDigits(panchang.method.ayanamsa)})</li>
              <li>एकूण पाहुणे नोंदी {toDevanagariDigits(guests.length)}</li>
              <li>अंदाजे कार्यक्रम खर्च प्रकट केलेला नाही — कुटुंबाने निवडल्यासच दिसेल</li>
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">
              {devNumber(leads.length)} विक्रेता विनंत्या • वाटप खर्च {devRupees(0)} (पाहुण्यांसाठी मोफत)
            </p>
            <Link href="/create" className="mt-3 inline-block text-xs font-semibold text-maroon">
              स्वतःची पत्रिका तयार करा →
            </Link>
          </section>
        </aside>
      </div>

      <footer className="border-t border-gold/30 bg-ivory-deep/40 py-6 text-center text-xs text-charcoal-soft">
        <p>माझी पत्रिका — मराठी कार्यक्रम व्यवस्थापन व छपाई प्लॅटफॉर्म</p>
        <p className="mt-1">पंचांग गणना पारंपरिक पद्धतीने; अंतिम विधी-निर्णय कुटुंब व गुरुजींचा.</p>
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
