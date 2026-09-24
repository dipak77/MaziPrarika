import Link from 'next/link';
import { notFound } from 'next/navigation';

import { availabilityState, trustBadges, type VendorSignals } from '@mazi/commerce';
import {
  formatMarathiDate,
  formatMarathiDateTime,
  toDevanagariDigits,
  vendorCategoryLabel,
} from '@mazi/marathi';

import { getStore } from '@/lib/store';
import { devRupees, percent } from '@/lib/format';

import { requestVendorQuoteAction } from './actions';

export const dynamic = 'force-dynamic';

const AVAILABILITY_LABEL: Record<string, string> = {
  available: 'उपलब्ध',
  tentative: 'चर्चेत',
  hold: 'तात्पुरता राखीव',
  booked: 'बुक झाले',
  blocked: 'राखीव ठेवले',
};

export default async function VendorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const store = getStore();
  const vendor = store.vendors.byId(id);
  if (!vendor) notFound();

  const eventSlug = typeof query.event === 'string' ? query.event : undefined;
  const events = store.events.listByOwner('usr_c_ramesh');
  const event = eventSlug ? store.events.bySlug(eventSlug) : events[0];

  const packages = store.vendors.packages(vendor.id);
  const reviews = store.vendors.reviews(vendor.id);
  const stats = store.marketplace.responseStats(vendor.id);
  const signals: VendorSignals = {
    bookingsCompleted: vendor.bookingsCompleted,
    responseRate: stats.total ? stats.responded / stats.total : 0.5,
    verifiedReviews: reviews.filter((review) => review.verifiedBooking).length,
    averageRating: vendor.rating,
    calendarFreshnessDays: vendor.calendarFreshAt
      ? Math.max(0, Math.round((Date.now() - new Date(vendor.calendarFreshAt).getTime()) / 86_400_000))
      : 30,
    identityVerified: vendor.identityVerified,
    gstVerified: vendor.gstVerified,
    disputeCount: vendor.disputeCount,
  };
  const trust = trustBadges(signals);

  const calendarDays = Array.from({ length: 21 }).map((_, index) => {
    const date = new Date(Date.now() + index * 86_400_000).toISOString().slice(0, 10);
    const state = availabilityState(store.vendors.availability(vendor.id, date, date), { vendorId: vendor.id, date });
    return { date, ...state };
  });

  const alreadyRequested = event
    ? store.marketplace.leadsForEvent(event.id).some((lead) => lead.vendorId === vendor.id && lead.status !== 'lost')
    : false;
  const lead = event
    ? store.marketplace.leadsForEvent(event.id).find((item) => item.vendorId === vendor.id)
    : undefined;
  const quotes = lead ? store.marketplace.quotesForLead(lead.id) : [];

  return (
    <div className="shell py-10">
      <nav aria-label="ब्रेडक्रम्ब" className="font-ui text-xs text-charcoal-soft">
        <Link href="/vendors" className="underline decoration-gold underline-offset-4">
          विक्रेते
        </Link>{' '}
        / {vendorCategoryLabel(vendor.category)}
      </nav>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">{vendorCategoryLabel(vendor.category)}</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-maroon">{vendor.name}</h1>
          <p className="mt-2 text-charcoal-soft">{vendor.about}</p>
          <p className="mt-2 text-sm text-charcoal-soft">
            {vendor.city}
            {vendor.pincode ? ` • ${vendor.pincode}` : ''} • भाषा: {vendor.languages.join(', ')} • योजना: {vendor.plan}
          </p>
        </div>
        <div className="surface p-5 text-center">
          <p className="font-display text-3xl font-bold text-maroon">{toDevanagariDigits(vendor.rating.toFixed(1))}</p>
          <p className="mt-1 text-xs text-charcoal-soft">
            {toDevanagariDigits(vendor.reviewCount)} अभिप्राय • {toDevanagariDigits(vendor.bookingsCompleted)} बुकिंग
          </p>
          <p className="mt-2 font-ui text-xs text-charcoal-soft">सेंद्रिय गुण {toDevanagariDigits(trust.organicScore)}/१००</p>
        </div>
      </header>

      <ul className="mt-5 flex flex-wrap gap-2">
        {trust.badges.length ? (
          trust.badges.map((badge) => (
            <li key={badge.code} className="rounded-full border border-paithani/40 bg-paithani/8 px-3 py-1 text-xs text-paithani">
              {badge.label}
            </li>
          ))
        ) : (
          <li className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs text-charcoal-soft">
            नवीन विक्रेता — पुरावा जमा होत आहे
          </li>
        )}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">पॅकेजेस</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {packages.map((pkg) => (
                <li key={pkg.id} className="rounded-xl border border-gold/25 bg-ivory p-4">
                  <p className="font-semibold text-charcoal">{pkg.title}</p>
                  <p className="mt-1 font-display text-lg font-bold text-maroon">{devRupees(pkg.pricePaise)}</p>
                  <ul className="mt-2 space-y-1 text-xs text-charcoal-soft">
                    {pkg.inclusions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                    {pkg.capacity ? <li>• क्षमता: {toDevanagariDigits(pkg.capacity)}</li> : null}
                  </ul>
                </li>
              ))}
              {packages.length === 0 ? (
                <li className="text-sm text-charcoal-soft">
                  या विक्रेत्याने पॅकेज जोडलेली नाहीत — विनंतीत तुमची आवश्यकता लिहा, ते कोट देईल.
                </li>
              ) : null}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">पुढील ३ आठवड्यांचे कॅलेंडर</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              विक्रेत्याचे स्वतःचे अद्ययावत कॅलेंडर — जुनी माहिती दिसली तर ती दाखवली जाते, लपवली जात नाही.
            </p>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {calendarDays.map((day) => (
                <li
                  key={day.date}
                  className={
                    day.bookable
                      ? 'rounded-lg border border-paithani/40 bg-paithani/8 px-2 py-1.5 text-[11px] text-paithani'
                      : 'rounded-lg border border-maroon/35 bg-maroon/8 px-2 py-1.5 text-[11px] text-maroon'
                  }
                  title={day.reason}
                >
                  <span className="block font-semibold">{formatMarathiDate(`${day.date}T00:00:00Z`, 'day-month')}</span>
                  <span className="block">{AVAILABILITY_LABEL[day.status] ?? day.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">अभिप्राय</h2>
            <ul className="mt-3 space-y-3">
              {reviews.slice(0, 6).map((review) => (
                <li key={review.id} className="border-b border-gold/20 pb-3 last:border-0">
                  <p className="text-sm font-semibold text-charcoal">
                    {review.authorName} • ★ {toDevanagariDigits(review.rating.toFixed(1))}
                    {review.verifiedBooking ? <span className="ml-2 text-[11px] text-paithani">पडताळलेले बुकिंग</span> : null}
                  </p>
                  {review.body ? <p className="mt-1 text-sm text-charcoal-soft">{review.body}</p> : null}
                  <p className="mt-1 font-ui text-[11px] text-charcoal-soft">
                    {formatMarathiDate(review.createdAt, 'day-month')}
                  </p>
                </li>
              ))}
              {reviews.length === 0 ? <li className="text-sm text-charcoal-soft">अजून अभिप्राय नाही.</li> : null}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">कोट मागवा</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              अपेक्षित प्रतिसाद: {toDevanagariDigits(stats.total ? stats.medianMinutes : vendor.responseMinutes)} मिनिटांत •
              SLA पूर्तता {percent(stats.slaRate)}
            </p>

            {alreadyRequested ? (
              <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-3 py-3 text-sm text-charcoal">
                <p className="font-semibold">विनंती आधीच पाठवली आहे.</p>
                {lead ? (
                  <p className="mt-1 text-xs text-charcoal-soft">
                    स्थिती: {lead.status} • प्रतिसाद मुदत {formatMarathiDateTime(lead.responseDueAt)}
                  </p>
                ) : null}
                {quotes.length ? (
                  <p className="mt-1 text-xs text-charcoal-soft">
                    {toDevanagariDigits(quotes.length)} कोट आले — {devRupees(quotes[0]!.totalPaise)} पासून
                  </p>
                ) : null}
              </div>
            ) : (
              <form action={requestVendorQuoteAction} className="mt-3 space-y-3">
                <input type="hidden" name="vendorId" value={vendor.id} />
                <label className="block text-sm">
                  <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">कार्यक्रम</span>
                  <select
                    name="eventSlug"
                    defaultValue={event?.slug ?? ''}
                    required
                    className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
                  >
                    {events.map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">तुमची गरज</span>
                  <textarea
                    name="message"
                    rows={3}
                    maxLength={600}
                    placeholder="उदा. ६५० पाहुणे, २ दिवस शूटिंग, अल्बम व ड्रोन"
                    className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm outline-none focus:border-maroon"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">अंदाजे बजेट (₹)</span>
                  <input
                    name="budgetPaise"
                    inputMode="numeric"
                    placeholder="125000"
                    className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-full bg-maroon px-5 py-3 font-semibold text-ivory shadow-soft transition hover:bg-maroon-soft"
                >
                  विनंती पाठवा (बुकिंग नाही)
                </button>
                <p className="text-[11px] text-charcoal-soft">
                  विनंती पाठवल्याने काहीही बुक होत नाही. दर, तारीख व अटी लेखी कोटमध्ये ठरतील, आणि तुम्ही संमती दिल्यावरच
                  बुकिंग निश्चित होते.
                </p>
              </form>
            )}
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">पडताळणी पुरावा</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-charcoal-soft">
              <li>• ओळख: {vendor.identityVerified ? 'पडताळलेली' : 'प्रलंबित'}</li>
              <li>• GST: {vendor.gstVerified ? vendor.gstNumber ?? 'नोंदणी पडताळली' : 'नोंदणी नाही'}</li>
              <li>• प्रतिसाद दर: {percent(signals.responseRate)}</li>
              <li>• पडताळलेले अभिप्राय: {toDevanagariDigits(signals.verifiedReviews)}</li>
              <li>• तक्रारी: {toDevanagariDigits(vendor.disputeCount)}</li>
              <li>• कॅलेंडर अद्ययावत: {vendor.calendarFreshAt ? formatMarathiDate(vendor.calendarFreshAt, 'day-month') : 'जुने'}</li>
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">
              प्लॅटफॉर्म फी श्रेणीनुसार ३–१५% — कोट स्वीकारल्यावरच लागू होते, आणि प्रत्येक रक्कम आमच्या स्वतःच्या लेजरमध्ये
              (गेटवे कधीच सत्यस्रोत नाही) नोंदली जाते.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
