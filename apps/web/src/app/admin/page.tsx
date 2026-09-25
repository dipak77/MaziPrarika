import Link from 'next/link';
import type { Metadata } from 'next';

import { adPerformance, calculateRefund, COMMISSION_RATES, gatewayFeeBreakdown, priceQuote, reconcileLedger, trustBadges, type LedgerEntry, type Quote } from '@mazi/commerce';
import { formatMarathiDate, formatMarathiDateTime, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { getStore } from '@/lib/store';
import { assistantLedger } from '@/lib/assistant';
import { devNumber, devRupees, percent } from '@/lib/format';
import { refundBookingAction } from '@/app/vendor/actions';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'प्रशासन — मार्केटप्लेस आरोग्य',
  description: 'मार्केटप्लेस आरोग्य, लेजर अखंडता, रूपांतरण व विक्रेते कामगिरीचे अंतर्गत प्रशासकीय डॅशबोर्ड.',
  robots: { index: false, follow: false },
};

async function resolveDisputeRowAction(formData: FormData): Promise<void> {
  'use server';
  const store = getStore();
  const id = String(formData.get('disputeId') ?? '').slice(0, 80);
  if (!id) return;
  const resolution = String(formData.get('resolution') ?? '').trim().slice(0, 500) || 'तोडगा नोंदवला';
  const status = String(formData.get('status') ?? 'resolved') === 'rejected' ? 'rejected' as const : 'resolved' as const;
  const at = new Date().toISOString();
  store.transaction(() => {
    store.bookings.resolveDispute(id, resolution, status, at);
    store.audit.record({
      actor: 'admin',
      action: status === 'resolved' ? 'dispute.resolved' : 'dispute.rejected',
      entity: 'dispute',
      entityId: id,
      after: { resolution },
      at,
    });
  });
  revalidatePath('/admin');
}

async function markSettlementPaidAction(formData: FormData): Promise<void> {
  'use server';
  const store = getStore();
  const id = String(formData.get('settlementId') ?? '').slice(0, 80);
  const utr = String(formData.get('utr') ?? '').trim().slice(0, 40) || `UTR${Date.now().toString(36)}`;
  if (!id) return;
  const at = new Date().toISOString();
  store.transaction(() => {
    store.bookings.markSettlementPaid(id, utr, at);
    store.audit.record({
      actor: 'admin',
      action: 'settlement.paid',
      entity: 'settlement',
      entityId: id,
      after: { utr },
      at,
    });
  });
  revalidatePath('/admin');
}

export default async function AdminPage() {
  const store = getStore();
  const today = new Date().toISOString().slice(0, 10);
  const windowStart = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const windowEnd = new Date(Date.now() + 1 * 86_400_000).toISOString().slice(0, 10);

  const totals = store.analytics.totals(windowStart, windowEnd);
  const series = store.analytics.range(windowStart, windowEnd);

  const leads = store.vendors.search({ limit: 500 }).flatMap((vendor) => store.marketplace.leadsForVendor(vendor.id));
  const bookings = store.bookings.list({ limit: 500 });
  const disputes = store.bookings.disputes();
  const settlements = store.bookings.settlements();
  const payments = bookings.flatMap((booking) => store.bookings.payments(booking.id));

  const ledgerEntries: LedgerEntry[] = bookings.flatMap((booking) =>
    store.bookings.ledger(booking.id).map((row) => ({
      id: row.id,
      orderId: row.bookingId,
      account: row.account as LedgerEntry['account'],
      amountPaise: row.amountPaise,
      at: row.createdAt,
      memo: row.memo,
      idempotencyKey: row.idempotencyKey,
    })),
  );
  const ledger = reconcileLedger(ledgerEntries);
  const unbalanced = bookings
    .map((booking) => ({ booking, sum: store.bookings.ledger(booking.id).reduce((total, row) => total + row.amountPaise, 0) }))
    .filter((entry) => entry.sum !== 0);

  const gmv = bookings.reduce((sum, booking) => sum + booking.totalPaise, 0);
  const commission = bookings.reduce((sum, booking) => sum + booking.commissionPaise, 0);
  const gatewayFees = payments.reduce((sum, payment) => sum + gatewayFeeBreakdown(payment.amountPaise).totalPaise, 0);
  const contribution = commission - gatewayFees;

  const aiSpendUsd = assistantLedger().totalUsd();
  const aiSpendInr = Number((aiSpendUsd * 88).toFixed(2));
  const costPerEventInr = Number((aiSpendInr / Math.max(1, store.events.list({ limit: 500 }).length)).toFixed(2));

  const ads = store.vendors.search({ limit: 500 }).flatMap((vendor) => store.ads.campaignsForVendor(vendor.id));
  const adSpend = ads.reduce((sum, campaign) => sum + campaign.spentPaise, 0);
  const adRevenueShare = Math.round(adSpend * 0.6);

  const responseStats = store.vendors.search({ limit: 500 }).map((vendor) => ({
    vendor,
    stats: store.marketplace.responseStats(vendor.id),
  }));
  const slaBreaches = responseStats
    .filter((entry) => entry.stats.total > 0 && entry.stats.slaRate < 0.8)
    .sort((a, b) => a.stats.slaRate - b.stats.slaRate)
    .slice(0, 6);

  const rankedVendors = responseStats
    .map((entry) => ({ ...entry, trust: trustBadges({
      bookingsCompleted: entry.vendor.bookingsCompleted,
      responseRate: entry.stats.total ? entry.stats.responded / entry.stats.total : 0.5,
      verifiedReviews: store.vendors.reviews(entry.vendor.id).filter((review) => review.verifiedBooking).length,
      averageRating: entry.vendor.rating,
      calendarFreshnessDays: entry.vendor.calendarFreshAt
        ? Math.max(0, Math.round((Date.now() - new Date(entry.vendor.calendarFreshAt).getTime()) / 86_400_000))
        : 30,
      identityVerified: entry.vendor.identityVerified,
      gstVerified: entry.vendor.gstVerified,
      disputeCount: entry.vendor.disputeCount,
    }) }))
    .sort((a, b) => b.trust.organicScore - a.trust.organicScore)
    .slice(0, 8);

  const stuckSettlements = settlements.filter((settlement) => settlement.status === 'pending' || settlement.status === 'processing');
  const openDisputes = disputes.filter((dispute) => dispute.status === 'open' || dispute.status === 'investigating');
  const recentAudit = store.audit.recent(12);

  const funnel = [
    { stage: 'विनंत्या', value: totals.leads },
    { stage: 'कोट', value: totals.quotes },
    { stage: 'बुकिंग', value: totals.bookings },
    { stage: 'प्रकाशित पत्रिका', value: store.designs.list({ limit: 200 }).filter((design) => design.status !== 'draft').length },
    { stage: 'छपाई ऑर्डर', value: store.designs.printOrders({}).length },
  ];
  // Stage-over-stage conversion is the honest view: 158 bookings from 987 leads
  // looks like "16%" but hides that quoting is where the real drop-off happens.
  const stageConversion = (index: number): number => {
    if (index === 0) return 1;
    const previous = funnel[index - 1]?.value ?? 0;
    return previous ? (funnel[index]?.value ?? 0) / previous : 0;
  };
  const funnelTop = Math.max(1, funnel[0]?.value ?? 1);

  const chartDays = series.slice(-30);
  const chartMax = Math.max(1, ...series.map((entry) => Math.max(entry.leads, entry.bookings)));

  const integrityChecks = [
    {
      label: 'लेजर शून्य-योग',
      ok: ledger.balanced,
      detail: ledger.balanced ? `${toDevanagariDigits(ledgerEntries.length)} नोंदी, सर्व बुकिंग शून्यावर` : `${toDevanagariDigits(unbalanced.length)} बुकिंग असंतुलित`,
    },
    {
      label: 'दुहेरी आयडेंपोटन्सी की',
      ok: ledger.duplicateKeys.length === 0,
      detail: ledger.duplicateKeys.length === 0 ? 'पेमेंट पुन्हा नोंदवले जात नाही' : `${toDevanagariDigits(ledger.duplicateKeys.length)} डुप्लिकेट`,
    },
    {
      label: 'प्रलंबित सेटलमेंट',
      ok: stuckSettlements.length < 5,
      detail: `${toDevanagariDigits(stuckSettlements.length)} विक्रेत्यांची रक्कम प्रलंबित`,
    },
    {
      label: 'तक्रारी',
      ok: openDisputes.length < 3,
      detail: `${toDevanagariDigits(openDisputes.length)} चालू तक्रार`,
    },
    {
      label: 'मुहूर्त पद्धत',
      ok: true,
      detail: 'गणना-आधारित सूटेबिलिटी; कोणतेही शुभ/अशुभ ठोकळ निर्णय नाही',
    },
    {
      label: 'AI खर्च मर्यादा',
      ok: aiSpendInr < 500,
      detail: `${devRupees(Math.round(aiSpendInr * 100))} एकूण (प्रति कार्यक्रम ${devRupees(Math.round(costPerEventInr * 100))})`,
    },
  ];

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">Operations</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-maroon">प्रशासन — मार्केटप्लेस आरोग्य</h1>
          <p className="mt-2 text-charcoal-soft">
            {formatMarathiDate(`${windowStart}T00:00:00Z`)} ते {formatMarathiDate(`${today}T00:00:00Z`)} • सर्व आकडे थेट डेटाबेसमधून
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/api/health" className="rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-charcoal">
            हेल्थ चेक
          </Link>
          <Link href="/vendor" className="btn-base btn-maroon px-4 py-2 text-sm">
            विक्रेता डेस्क
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'GMV (३० दिवस)', value: devRupees(totals.gmvPaise), note: 'सर्व निश्चित बुकिंगचे मूल्य' },
          { label: 'कमिशन उत्पन्न', value: devRupees(totals.commissionPaise), note: `सरासरी टेक रेट ${percent(totals.gmvPaise ? totals.commissionPaise / totals.gmvPaise : 0, 1)}` },
          { label: 'बुकिंग रूपांतरण', value: percent(totals.bookingConversion), note: `${toDevanagariDigits(totals.quotes)} कोट → ${toDevanagariDigits(totals.bookings)} बुकिंग` },
          { label: 'मध्यम प्रतिसाद', value: `${toDevanagariDigits(totals.medianResponseMinutes)} मिनिटे`, note: 'SLA लक्ष्य १२० मिनिटे' },
        ].map((tile) => (
          <div key={tile.label} className="surface p-4">
            <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{tile.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-charcoal">{tile.value}</p>
            <p className="mt-0.5 text-xs text-charcoal-soft">{tile.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">आर्थिक अखंडता</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              गेटवे कधीच सत्यस्रोत नाही — आमचा स्वतःचा लेजर आहे, आणि तो शून्यावर बसला पाहिजे. खालील आकडे प्रत्यक्षात
              नोंदवलेल्या बुकिंगचे आहेत; वरील ३०-दिवसांचे आकडे प्लॅटफॉर्म-व्यापी मेट्रिक्सचे (प्लॅटफॉर्म इतिहास).
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="एकूण ग्राहक देय" value={devRupees(bookings.reduce((sum, booking) => sum + booking.totalPaise, 0))} />
              <Metric label="कमिशन" value={devRupees(commission)} />
              <Metric label="गेटवे शुल्क वजा" value={`−${devRupees(gatewayFees)}`} />
              <Metric label="निव्वळ योगदान" value={devRupees(contribution)} tone={contribution >= 0 ? 'good' : 'bad'} />
              <Metric label="विक्रेत्यांची देय" value={devRupees(bookings.reduce((sum, booking) => sum + (booking.totalPaise - booking.commissionPaise), 0))} />
              <Metric label="जाहिरात महसूल वाटा" value={devRupees(adRevenueShare)} />
            </div>

            <ul className="mt-4 space-y-2">
              {integrityChecks.map((check) => (
                <li key={check.label} className="flex items-start gap-3 rounded-xl border border-gold/20 bg-ivory px-3 py-2">
                  <span
                    aria-hidden
                    className={
                      check.ok
                        ? 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-paithani text-xs text-ivory'
                        : 'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-maroon text-xs text-ivory'
                    }
                  >
                    {check.ok ? '✓' : '!'}
                  </span>
                  <span className="sr-only">{check.ok ? 'ठीक' : 'तक्रार'}</span>
                  <span>
                    <span className="text-sm font-semibold text-charcoal">{check.label}</span>
                    <span className="block text-xs text-charcoal-soft">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">रूपांतरण साखळी</h2>
            <ul className="mt-4 space-y-3">
              {funnel.map((step, index) => (
                <li key={step.stage}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-charcoal">{step.stage}</span>
                    <span className="text-charcoal-soft">
                      {devNumber(step.value)}
                      {index === 0 ? ' (आधार)' : ` • मागील टप्प्यापासून ${percent(stageConversion(index))}`}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ivory-deep">
                    <div
                      className="h-full rounded-full bg-maroon"
                      style={{ width: `${Math.max(2, Math.min(100, (step.value / funnelTop) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">३० दिवसांचा ओघ</h2>
            <p className="mt-1 text-xs text-charcoal-soft">दैनंदिन विनंत्या व बुकिंग — आडवा आकार वार-आधारित मागणी दाखवतो.</p>
            <div className="mt-4 flex h-40 items-end gap-1" role="img" aria-label={`गेल्या ३० दिवसांचा दैनंदिन विनंत्या व बुकिंग ओघ — एकूण ${toDevanagariDigits(chartDays.reduce((sum, day) => sum + day.leads, 0))} विनंत्या, ${toDevanagariDigits(chartDays.reduce((sum, day) => sum + day.bookings, 0))} बुकिंग`}>
              {chartDays.map((day) => (
                <div key={day.date} className="group relative flex-1" title={`${day.date}: ${day.leads} विनंत्या, ${day.bookings} बुकिंग`}>
                  <div className="w-full rounded-t bg-gold/40" style={{ height: `${(day.leads / chartMax) * 100}%` }} />
                  <div className="w-full rounded-b bg-maroon" style={{ height: `${(day.bookings / chartMax) * 100}%` }} />
                </div>
              ))}
            </div>
            <table className="sr-only">
              <caption>गेल्या ३० दिवसांचे दैनंदिन आकडे</caption>
              <thead>
                <tr>
                  <th scope="col">तारीख</th>
                  <th scope="col">विनंत्या</th>
                  <th scope="col">बुकिंग</th>
                </tr>
              </thead>
              <tbody>
                {chartDays.map((day) => (
                  <tr key={day.date}>
                    <td>{day.date}</td>
                    <td>{toDevanagariDigits(day.leads)}</td>
                    <td>{toDevanagariDigits(day.bookings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-charcoal-soft">
              <span className="mr-3 inline-flex items-center gap-1"><span className="size-2 rounded-full bg-gold/60" /> विनंत्या</span>
              <span className="inline-flex items-center gap-1"><span className="size-2 rounded-full bg-maroon" /> बुकिंग</span>
            </p>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">जाहिरात कामगिरी</h2>
            <ul className="mt-3 space-y-3">
              {ads.map((campaign) => {
                const perf = adPerformance(campaign);
                const vendor = store.vendors.byId(campaign.vendorId);
                return (
                  <li key={campaign.id} className="rounded-xl border border-gold/25 bg-ivory p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-charcoal">
                        {vendor?.name} • {campaign.placement}
                      </p>
                      <p className="text-xs text-charcoal-soft">
                        खर्च {devRupees(campaign.spentPaise)} / {devRupees(campaign.budgetPaise)}
                      </p>
                    </div>
                    <ul className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                      {perf.funnel.map((stage) => (
                        <li key={stage.stage} className="rounded-lg bg-ivory-deep/50 px-2 py-1">
                          <span className="block text-charcoal-soft">{stage.stage}</span>
                          <span className="font-semibold text-charcoal">{devNumber(stage.count)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-charcoal-soft">
                      ROAS {toDevanagariDigits(perf.roas)}× • प्रति बुकिंग {devRupees(perf.costPerBookingPaise)} • प्रायोजित वाटा{' '}
                      {percent(totals.sponsoredShare)}
                    </p>
                  </li>
                );
              })}
              {ads.length === 0 ? <li className="text-sm text-charcoal-soft">सक्रिय मोहीम नाही.</li> : null}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">नुकतीच ऑडिट नोंदी</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {recentAudit.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gold/15 pb-2 last:border-0">
                  <span className="text-charcoal">
                    <span className="font-ui text-xs text-charcoal-soft">{entry.action}</span> • {entry.entity}
                    {entry.entityId ? ` ${entry.entityId}` : ''}
                  </span>
                  <span className="font-ui text-xs text-charcoal-soft">
                    {entry.actor} • {formatMarathiDateTime(entry.at)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">SLA उल्लंघन</h2>
            <ul className="mt-3 space-y-3">
              {slaBreaches.map((entry) => (
                <li key={entry.vendor.id} className="rounded-xl border border-maroon/25 bg-maroon/5 p-3">
                  <p className="text-sm font-semibold text-charcoal">{entry.vendor.name}</p>
                  <p className="text-xs text-charcoal-soft">
                    SLA {percent(entry.stats.slaRate)} • मध्यम {toDevanagariDigits(entry.stats.medianMinutes)} मिनिटे •{' '}
                    {toDevanagariDigits(entry.stats.total)} विनंत्या
                  </p>
                  <Link href={`/vendors/${entry.vendor.id}`} className="mt-1 inline-block text-xs font-semibold text-maroon">
                    प्रोफाइल →
                  </Link>
                </li>
              ))}
              {slaBreaches.length === 0 ? <li className="text-sm text-charcoal-soft">सर्व विक्रेते SLA मध्ये.</li> : null}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">अव्वल विक्रेते</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {rankedVendors.map((entry, index) => (
                <li key={entry.vendor.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-charcoal">
                    {toDevanagariDigits(index + 1)}. {entry.vendor.name}
                  </span>
                  <span className="font-ui text-xs text-charcoal-soft">{toDevanagariDigits(entry.trust.organicScore)}/१००</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-charcoal-soft">
              क्रमवारी केवळ सेंद्रिय पुराव्यावर — जाहिरात गुण वाढवत नाही, फक्त योग्य विक्रेत्याला वर आणते.
            </p>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">श्रेणीनुसार टेक रेट</h2>
            <ul className="mt-2 space-y-1 text-xs text-charcoal-soft">
              {Object.entries(COMMISSION_RATES)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([category, rate]) => (
                  <li key={category} className="flex justify-between gap-2">
                    <span className="truncate">{vendorCategoryLabel(category)}</span>
                    <span className="font-semibold text-charcoal">{percent(rate)}</span>
                  </li>
                ))}
            </ul>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">तक्रारी व सेटलमेंट</h2>
            <h3 className="mt-4 text-sm font-bold text-charcoal">सेटलमेंट रांग — {toDevanagariDigits(stuckSettlements.length)} प्रलंबित</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {stuckSettlements.slice(0, 8).map((settlement) => (
                <li key={settlement.id} className="rounded-xl border border-gold/25 bg-ivory p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-charcoal">
                      {settlement.bookingId.slice(0, 14)} • {devRupees(settlement.amountPaise)}
                    </p>
                    <p className="text-xs text-charcoal-soft">{settlement.status}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-charcoal-soft">
                    विक्रेता {settlement.vendorId.slice(0, 18)} • {formatMarathiDateTime(settlement.createdAt)}
                  </p>
                  <form action={markSettlementPaidAction} className="mt-2 flex flex-wrap gap-2">
                    <input type="hidden" name="settlementId" value={settlement.id} />
                    <input name="utr" placeholder="UTR" maxLength={40} className="min-w-0 flex-1 rounded-lg border border-gold/40 bg-white px-2 py-1 text-xs" />
                    <button type="submit" className="rounded-lg bg-maroon px-3 py-1 text-xs font-bold text-white">
                      पैसे दिले
                    </button>
                  </form>
                </li>
              ))}
              {stuckSettlements.length === 0 ? <li className="text-sm text-charcoal-soft">प्रलंबित सेटलमेंट नाही.</li> : null}
            </ul>
            <h3 className="mt-5 text-sm font-bold text-charcoal">चालू तक्रारी — {toDevanagariDigits(openDisputes.length)}</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {openDisputes.map((dispute) => {
                const booking = bookings.find((b) => b.id === dispute.bookingId);
                const quote = booking?.quoteId ? store.marketplace.quoteById(booking.quoteId) : undefined;
                const lead = booking?.leadId ? store.marketplace.leadById(booking.leadId) : undefined;
                const breakdown = quote && lead
                  ? priceQuote({
                      id: quote.id,
                      vendorId: booking!.vendorId,
                      ...(booking!.eventId || lead.eventId ? { eventId: (booking!.eventId ?? lead.eventId)! } : {}),
                      category: lead.category as Quote['category'],
                      items: quote.items,
                      discountPaise: quote.discountPaise,
                      validTill: quote.validTill,
                      status: 'accepted',
                    })
                  : undefined;
                const daysBefore = booking ? Math.max(0, Math.round((new Date(booking.eventDate).getTime() - Date.now()) / 86_400_000)) : 0;
                const suggestion = breakdown ? calculateRefund({ breakdown, daysBeforeEvent: daysBefore, fault: 'customer' }) : undefined;
                return (
                  <li key={dispute.id} className="rounded-xl border border-maroon/25 bg-maroon/5 p-3">
                    <p className="font-semibold text-maroon">{dispute.reason}</p>
                    <p className="text-xs text-charcoal-soft">
                      उघडले {formatMarathiDateTime(dispute.createdAt)} • {dispute.raisedBy} • बुकिंग {dispute.bookingId.slice(0, 14)}
                    </p>
                    {suggestion ? (
                      <p className="mt-1 text-xs text-charcoal-soft">
                        सुचवलेला परतावा {devRupees(suggestion.refundPaise)} • {suggestion.policyNote}
                      </p>
                    ) : null}
                    <form action={resolveDisputeRowAction} className="mt-2 space-y-2">
                      <input type="hidden" name="disputeId" value={dispute.id} />
                      <input name="resolution" placeholder="तोडगा लिहा" maxLength={500} className="w-full rounded-lg border border-gold/40 bg-white px-2 py-1 text-xs" />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" name="status" value="resolved" className="rounded-lg bg-maroon px-3 py-1 text-xs font-bold text-white">
                          तक्रार सोडवा
                        </button>
                        <button type="submit" name="status" value="rejected" className="rounded-lg border border-maroon/40 px-3 py-1 text-xs font-bold text-maroon">
                          फेटाळा
                        </button>
                      </div>
                    </form>
                    {booking ? (
                      <form action={refundBookingAction} className="mt-2 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <input type="hidden" name="reason" value={dispute.reason} />
                        <input type="hidden" name="refundRupees" value={suggestion ? String(suggestion.refundPaise / 100) : String(booking.advancePaise / 100)} />
                        <button type="submit" className="rounded-lg border border-gold/50 px-3 py-1 text-xs font-bold text-charcoal">
                          परतावा द्या
                        </button>
                        <Link href={`/vendor/leads/${booking.leadId ?? ''}`} className="text-xs font-semibold text-maroon">
                          लीड पाहा →
                        </Link>
                      </form>
                    ) : null}
                  </li>
                );
              })}
              {openDisputes.length === 0 ? <li className="text-sm text-charcoal-soft">चालू तक्रार नाही.</li> : null}
              <li className="pt-2 text-xs text-charcoal-soft">
                प्रलंबित सेटलमेंट: {toDevanagariDigits(stuckSettlements.length)} • एकूण पेमेंट नोंदी{' '}
                {toDevanagariDigits(payments.length)}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-ivory-deep/40 px-3 py-2">
      <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{label}</p>
      <p
        className={
          tone === 'bad'
            ? 'mt-0.5 font-display text-lg font-bold text-maroon'
            : tone === 'good'
              ? 'mt-0.5 font-display text-lg font-bold text-paithani'
              : 'mt-0.5 font-display text-lg font-bold text-charcoal'
        }
      >
        {value}
      </p>
    </div>
  );
}
