import Link from 'next/link';

import { adPerformance, trustBadges } from '@mazi/commerce';
import { formatMarathiDate, formatMarathiDateTime, leadStatusLabel, toDevanagariDigits } from '@mazi/marathi';

import { VendorCalendar } from '@/components/vendor/vendor-calendar';
import { getStore } from '@/lib/store';
import { vendorDeskId } from '@/lib/vendor-desk';
import { devRupees, percent } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'विक्रेता डेस्क — विनंत्या, कोट व कॅलेंडर' };

/**
 * The vendor's side of the marketplace.
 *
 * Design decisions that matter to a real vendor (a photographer with a phone,
 * not a laptop): the SLA clock is the first thing on every lead, the money they
 * will actually receive is shown next to the customer price, and the calendar is
 * one tap away. The vendor can see their own ad performance without asking us.
 */
export default async function VendorDeskPage() {
  const store = getStore();
  const vendorId = vendorDeskId();
  const vendor = store.vendors.byId(vendorId);
  if (!vendor) {
    return (
      <div className="shell py-16">
        <h1 className="font-display text-3xl font-bold text-maroon">विक्रेता डेस्क</h1>
        <p className="mt-3 text-charcoal-soft">डेटाबेसमध्ये विक्रेता सापडला नाही — `npm run db:reset` चालवा.</p>
      </div>
    );
  }

  const leads = store.marketplace.leadsForVendor(vendorId);
  const stats = store.marketplace.responseStats(vendorId);
  const quotes = leads.flatMap((lead) => store.marketplace.quotesForLead(lead.id));
  const bookings = store.bookings.list({ vendorId, limit: 50 });
  const settlements = store.bookings.settlements({ vendorId });
  const disputes = store.bookings.disputes().filter((dispute) => bookings.some((booking) => booking.id === dispute.bookingId));
  const campaigns = store.ads.campaignsForVendor(vendorId);

  const signals = {
    bookingsCompleted: vendor.bookingsCompleted,
    responseRate: stats.total ? stats.responded / stats.total : 0.5,
    verifiedReviews: store.vendors.reviews(vendorId).filter((review) => review.verifiedBooking).length,
    averageRating: vendor.rating,
    calendarFreshnessDays: vendor.calendarFreshAt
      ? Math.max(0, Math.round((Date.now() - new Date(vendor.calendarFreshAt).getTime()) / 86_400_000))
      : 30,
    identityVerified: vendor.identityVerified,
    gstVerified: vendor.gstVerified,
    disputeCount: vendor.disputeCount,
  };
  const trust = trustBadges(signals);

  const openLeads = leads.filter((lead) => !['won', 'lost', 'expired'].includes(lead.status));
  const wonLeads = leads.filter((lead) => lead.status === 'won');
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings
    .filter((booking) => booking.eventDate >= today && booking.state !== 'CANCELLED')
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  const monthStart = `${today.slice(0, 7)}-01`;
  const monthEnd = new Date(new Date(`${monthStart}T00:00:00Z`).getTime() + 31 * 86_400_000).toISOString().slice(0, 10);
  const totals = store.analytics.totals(monthStart, monthEnd);

  const payout = bookings.reduce((sum, booking) => sum + (booking.totalPaise - booking.commissionPaise), 0);
  const pendingSettlement = settlements.filter((settlement) => settlement.status !== 'paid').reduce((sum, s) => sum + s.amountPaise, 0);

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">Vendor OS</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-maroon">{vendor.name}</h1>
          <p className="mt-2 text-charcoal-soft">
            {vendor.city} • योजना {vendor.plan} • सेंद्रिय गुण {toDevanagariDigits(trust.organicScore)}/१००
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/vendors/${vendor.id}`} className="rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-charcoal">
            सार्वजनिक प्रोफाइल
          </Link>
          <Link href="/vendors" className="rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-ivory">
            नवीन विनंत्या कोठून येतात?
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'खुल्या विनंत्या', value: toDevanagariDigits(openLeads.length), note: `${toDevanagariDigits(leads.length)} एकूण` },
          { label: 'SLA पूर्तता', value: percent(stats.slaRate), note: `मध्यम प्रतिसाद ${toDevanagariDigits(stats.medianMinutes)} मिनिटे` },
          { label: 'जिंकलेल्या विनंत्या', value: toDevanagariDigits(wonLeads.length), note: `रूपांतरण ${percent(leads.length ? wonLeads.length / leads.length : 0)}` },
          { label: 'या महिन्याचे कोट', value: devRupees(quotes.reduce((sum, quote) => sum + quote.totalPaise, 0)), note: `${toDevanagariDigits(quotes.length)} कोट` },
        ].map((tile) => (
          <div key={tile.label} className="surface p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{tile.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-charcoal">{tile.value}</p>
            <p className="mt-0.5 text-xs text-charcoal-soft">{tile.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="surface p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-charcoal">विनंत्या (leads)</h2>
            <p className="font-ui text-xs text-charcoal-soft">प्रतिसाद मुदतीनुसार — SLA २ तास</p>
          </div>

          <ul className="mt-4 space-y-3">
            {openLeads.map((lead) => {
              const minutesLeft = Math.round((new Date(lead.responseDueAt).getTime() - Date.now()) / 60_000);
              const overdue = minutesLeft < 0;
              const event = lead.eventId ? store.events.byId(lead.eventId) : undefined;
              return (
                <li key={lead.id} className="rounded-xl border border-gold/25 bg-ivory p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">
                        {event ? event.title : 'कार्यक्रम'} • {lead.guestCount ? `${toDevanagariDigits(lead.guestCount)} पाहुणे` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal-soft">
                        {lead.category} • {lead.eventDate ? formatMarathiDate(lead.eventDate) : 'तारीख ठरलेली नाही'} • स्रोत {lead.source}
                        {lead.sponsored ? ' (प्रायोजित)' : ''}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-charcoal-soft">{lead.message}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          overdue
                            ? 'rounded-full border border-maroon/40 bg-maroon/8 px-2 py-0.5 text-[11px] text-maroon'
                            : 'rounded-full border border-gold/45 bg-gold/10 px-2 py-0.5 text-[11px] text-charcoal'
                        }
                      >
                        {leadStatusLabel(lead.status)}
                      </span>
                      <p className="mt-2 text-[11px] text-charcoal-soft">
                        {overdue
                          ? `मुदत संपली (${toDevanagariDigits(Math.abs(minutesLeft))} मिनिटांपूर्वी)`
                          : `${toDevanagariDigits(minutesLeft)} मिनिटांत प्रतिसाद द्या`}
                      </p>
                      {lead.budgetPaise ? (
                        <p className="mt-1 text-xs font-semibold text-maroon">बजेट {devRupees(lead.budgetPaise)}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/vendor/leads/${lead.id}`}
                      className="rounded-full bg-maroon px-4 py-2 text-xs font-semibold text-ivory"
                    >
                      उत्तर द्या व कोट तयार करा
                    </Link>
                    {lead.eventId ? (
                      <Link
                        href={`/studio/${store.events.byId(lead.eventId)?.slug ?? ''}`}
                        className="rounded-full border border-gold/50 px-4 py-2 text-xs font-semibold text-charcoal"
                      >
                        कार्यक्रम वर्कस्पेस पाहा
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
            {openLeads.length === 0 ? (
              <li className="rounded-xl border border-dashed border-gold/40 px-4 py-8 text-center text-sm text-charcoal-soft">
                सध्या खुली विनंती नाही. तुमचा प्रतिसाद दर {percent(stats.slaRate)} आहे — प्रोफाइल पूर्ण ठेवल्यास विनंत्या वाढतात.
              </li>
            ) : null}
          </ul>
        </section>

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">पैसे</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal-soft">एकूण बुकिंग मूल्य</dt>
                <dd className="font-semibold text-charcoal">{devRupees(bookings.reduce((sum, b) => sum + b.totalPaise, 0))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-soft">प्लॅटफॉर्म कमिशन</dt>
                <dd className="text-charcoal">−{devRupees(bookings.reduce((sum, b) => sum + b.commissionPaise, 0))}</dd>
              </div>
              <div className="flex justify-between border-t border-gold/30 pt-1.5">
                <dt className="font-semibold text-charcoal">तुमची देय रक्कम</dt>
                <dd className="font-display text-lg font-bold text-maroon">{devRupees(payout)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-soft">प्रलंबित सेटलमेंट</dt>
                <dd className="text-charcoal">{devRupees(pendingSettlement)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] text-charcoal-soft">
              कमिशन श्रेणीनुसार (छायाचित्रण १२%) — आगाऊ रक्कम मिळाल्यावरच लागू, आणि तक्रार असेल तर सेटलमेंट थांबते.
            </p>
          </section>

          <VendorCalendar vendorId={vendor.id} bookings={upcoming.map((booking) => ({ id: booking.id, eventDate: booking.eventDate, state: booking.state }))} />

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">जाहिरात कामगिरी</h2>
            {campaigns.length ? (
              <ul className="mt-3 space-y-3">
                {campaigns.map((campaign) => {
                  const perf = adPerformance(campaign);
                  return (
                    <li key={campaign.id} className="rounded-xl border border-gold/25 bg-ivory p-3">
                      <p className="text-sm font-semibold text-charcoal">{campaign.placement}</p>
                      <p className="mt-1 text-xs text-charcoal-soft">
                        खर्च {devRupees(campaign.spentPaise)} / बजेट {devRupees(campaign.budgetPaise)} • ROAS {toDevanagariDigits(perf.roas)}×
                      </p>
                      <p className="text-xs text-charcoal-soft">
                        प्रति लीड {devRupees(perf.costPerLeadPaise)} • प्रति बुकिंग {devRupees(perf.costPerBookingPaise)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-charcoal-soft">
                सध्या जाहिरात मोहीम नाही. प्रायोजित निकालासाठी सेंद्रिय गुण ५५+ आवश्यक आहे.
              </p>
            )}
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">तक्रारी व जोखीम</h2>
            {disputes.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {disputes.map((dispute) => (
                  <li key={dispute.id} className="rounded-xl border border-maroon/30 bg-maroon/5 p-3">
                    <p className="font-semibold text-maroon">{dispute.reason}</p>
                    <p className="text-xs text-charcoal-soft">
                      स्थिती: {dispute.status} • उघडले {formatMarathiDateTime(dispute.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-charcoal-soft">
                कोणतीही तक्रार नाही. तक्रार उघडल्यास सेटलमेंट तात्पुरती थांबते आणि दोन्ही बाजूंना उत्तर देण्याची संधी मिळते.
              </p>
            )}
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">या महिन्याची मंडळ आकडेवारी</h2>
            <ul className="mt-2 space-y-1 text-sm text-charcoal-soft">
              <li>विनंत्या: {toDevanagariDigits(totals.leads)}</li>
              <li>कोट: {toDevanagariDigits(totals.quotes)}</li>
              <li>बुकिंग: {toDevanagariDigits(totals.bookings)}</li>
              <li>रूपांतरण: {percent(totals.bookingConversion)}</li>
              <li>GMV: {devRupees(totals.gmvPaise)}</li>
              <li>प्रायोजित वाटा: {percent(totals.sponsoredShare)}</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
