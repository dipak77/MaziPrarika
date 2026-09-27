import Link from "next/link";
import { Chip, Eyebrow, Icon } from "@/components/ui";
import { ConsoleBanner } from "@/components/console-banner";
import { getStore } from "@/lib/store";
import { devRupees } from "@/lib/format";
import { toDevanagariDigits } from "@mazi/marathi";
import { categoryMr } from "@/lib/arch-data";
import { settleBookingAction, refundBookingAction } from "@/app/vendor/actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "कन्सोल — माझी पत्रिका ॲडमिन",
  description: "मार्केटप्लेस आरोग्य, नॉर्थ-स्टार फनेल, GMV, टेक-रेट आणि व्हेंडर SLA ट्रॅकर.",
};

export default async function ConsolePage() {
  const store = getStore();
  const allVendors = store.vendors.search({ limit: 50 });
  const allBookings = store.bookings.list({ limit: 50 });
  const leadsAll = allVendors.flatMap((v) => store.marketplace.leadsForVendor(v.id));

  const windowEnd = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const windowStart = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const totals = store.analytics.totals(windowStart, windowEnd);
  const publishedDesigns = store.designs.list({ limit: 200 }).filter((d) => d.status !== "draft").length;
  const printCount = store.designs.printOrders({}).length;

  const funnelRaw = [
    { t: "चौकशा", v: totals.leads },
    { t: "कोट", v: totals.quotes },
    { t: "बुकिंग", v: totals.bookings },
    { t: "प्रकाशित पत्रिका", v: publishedDesigns },
    { t: "छपाई ऑर्डर", v: printCount },
  ];
  const funnelTop = Math.max(1, funnelRaw[0]?.v ?? 1);
  const funnel = funnelRaw.map((f) => ({ ...f, pct: Math.max(2, Math.min(100, (f.v / funnelTop) * 100)) }));

  const categoryCounts = new Map<string, number>();
  for (const l of leadsAll) categoryCounts.set(l.category, (categoryCounts.get(l.category) ?? 0) + 1);
  const categoryDemand = [...categoryCounts.entries()]
    .map(([cat, v]) => ({ c: categoryMr(cat), v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 6);
  const categoryMax = Math.max(1, ...categoryDemand.map((c) => c.v));

  const responseLive = allVendors
    .map((v) => ({ vendor: v, stats: store.marketplace.responseStats(v.id) }))
    .filter((e) => e.stats.total > 0)
    .sort((a, b) => b.stats.slaRate - a.stats.slaRate)
    .slice(0, 4)
    .map((e) => ({
      v: e.vendor.name,
      cat: categoryMr(e.vendor.category),
      t: `${toDevanagariDigits(e.stats.medianMinutes)} मि.`,
      rate: Math.round(e.stats.slaRate * 100),
    }));

  const liveBookingsTotalPaise = allBookings.reduce((sum, b) => sum + (b.totalPaise ?? 0), 0);
  const liveCommissionPaise = allBookings.reduce((sum, b) => sum + (b.commissionPaise ?? 0), 0);
  const effectiveGmvRupees = liveBookingsTotalPaise / 100;
  const takeRate = liveBookingsTotalPaise > 0
    ? `${toDevanagariDigits(((liveCommissionPaise / liveBookingsTotalPaise) * 100).toFixed(1))}%`
    : `${toDevanagariDigits(0)}%`;
  const conversionLive = `${toDevanagariDigits((totals.bookingConversion * 100).toFixed(1))}%`;

  const renderedBookings = allBookings.slice(0, 8).map((b) => {
    const event = b.eventId ? store.events.byId(b.eventId) : undefined;
    const vendor = store.vendors.byId(b.vendorId);
    const isSettled = b.state === 'SETTLEMENT';
    const isConfirmed = b.state === 'BOOKING_CONFIRMED' || b.state === 'SERVICE_SCHEDULED' || b.state === 'SERVICE_COMPLETED';
    const isRefunded = b.state === 'REFUNDED' || b.state === 'REFUND_PENDING';
    const isDisputed = b.state === 'DISPUTED';

    return {
      id: b.id.replace(/^bk_qt_/, 'MZ-').slice(0, 10),
      fullId: b.id,
      ev: event?.title ?? 'सोहळा',
      vendor: vendor?.name ?? b.vendorId,
      amt: devRupees(b.totalPaise),
      st: isSettled ? 'सेटलमेंट ✓' : isConfirmed ? 'बुक ✓' : isRefunded ? 'रिफंड' : isDisputed ? 'वाद' : 'प्रलंबित',
      cls: isSettled
        ? 'bg-leaf-600/15 text-leaf-700'
        : isConfirmed
        ? 'bg-leaf-600/10 text-leaf-700'
        : isRefunded
        ? 'bg-maroon-700/10 text-maroon-700'
        : isDisputed
        ? 'bg-maroon-900 text-white'
        : 'bg-gold-400/15 text-gold-700',
      state: b.state,
      canSettle: b.state === 'BOOKING_CONFIRMED' || b.state === 'SERVICE_SCHEDULED' || b.state === 'SERVICE_COMPLETED',
      canRefund: b.state === 'BOOKING_CONFIRMED' || b.state === 'DISPUTED',
    };
  });

  return (
    <div className="bg-ivory-200/50 pb-16">
      <ConsoleBanner
        gmvLakh={`₹${(effectiveGmvRupees / 100000).toFixed(1)} Lakh`}
        takeRate={takeRate}
        conversionLive={conversionLive}
        activeVendors={toDevanagariDigits(allVendors.length)}
      />

      <div className="shell space-y-6 py-8">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gold-500/30 bg-white px-5 py-4 shadow-card">
          <Icon name="star" className="h-4.5 w-4.5 text-gold-600" />
          <p className="text-[13px] font-bold text-ink-700">या आठवड्याचा फोकस:</p>
          {["प्रतिसाद-वेळ < २ तास", `कोट→बुकिंग ${conversionLive}→२५%`, "पुण्यात २० नवे व्हेन्यू"].map((f) => (
            <Chip key={f} tone="maroon">{f}</Chip>
          ))}
          <span className="ml-auto flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0e0d26] px-3 py-1.5 text-[11.5px] font-bold text-white shadow-xs transition hover:bg-[#8247e5]"
            >
              <span className="size-2 rounded-full bg-[#8247e5] animate-pulse" />
              <span>डारोमा मॉडर्न डॅशबोर्ड ↗</span>
            </Link>
            <span className="flex items-center gap-1.5 text-[12px] font-extrabold text-leaf-700">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-leaf-600" /> थेट · {toDevanagariDigits(leadsAll.length)} ताज्या चौकशा
            </span>
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink-900">नॉर्थ-स्टार फनेल</h3>
              <Chip tone="gold">मागील ३० दिवस</Chip>
            </div>
            <div className="mt-5 space-y-3">
              {funnel.map((f, i) => (
                <div key={f.t}>
                  <div className="flex items-center justify-between text-[12.5px] font-bold">
                    <span className="text-ink-700">{f.t}</span>
                    <span className="text-ink-400">{toDevanagariDigits(f.v)}</span>
                  </div>
                  <div className="mt-1 h-5 overflow-hidden rounded-md bg-ivory-200">
                    <div
                      className="flex h-full items-center rounded-md bg-gradient-to-r from-maroon-800 to-maroon-600 pl-2 transition-all duration-700"
                      style={{ width: `${f.pct}%`, opacity: 1 - i * 0.09 }}
                    >
                      <span className="text-[10px] font-extrabold text-gold-300">{Math.round(f.pct)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink-900">श्रेणी-मागणी — पुणे</h3>
              <Chip tone="outline">GTM: पुणे प्रयोगशाळा</Chip>
            </div>
            <div className="mt-5 space-y-4">
              {categoryDemand.map((c) => (
                <div key={c.c}>
                  <div className="flex items-center justify-between text-[12.5px] font-bold">
                    <span className="text-ink-700">{c.c}</span>
                    <span className="text-gold-700">{toDevanagariDigits(c.v)} चौकशा</span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-ivory-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-maroon-700" style={{ width: `${(c.v / categoryMax) * 100}%` }} />
                  </div>
                </div>
              ))}
              {categoryDemand.length === 0 ? <p className="text-[12.5px] text-ink-400">अजून मागणी नोंद नाही.</p> : null}
            </div>
            <p className="mt-5 rounded-lg bg-leaf-600/8 px-3.5 py-3 text-[12px] leading-relaxed font-semibold text-leaf-700 ring-1 ring-leaf-600/20">
              एकूण {toDevanagariDigits(totals.leads)} चौकशा · {toDevanagariDigits(totals.bookings)} बुकिंग · रूपांतरण {conversionLive}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="border-b border-ivory-300 px-4 sm:px-6 py-4">
              <h3 className="text-[15px] font-extrabold text-ink-900">अलिकडची बुकिंग्स</h3>
            </div>
            <div className="divide-y divide-ivory-200">
              {renderedBookings.map((b) => (
                <div key={b.fullId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 px-4 sm:px-6 py-3.5 text-[13px]">
                  <div>
                    <span className="font-mono text-[11px] text-ink-400">{b.id} · </span>
                    <span className="font-bold text-ink-900">{b.ev}</span>
                    <span className="text-ink-500"> → {b.vendor}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-display font-semibold text-maroon-800">{b.amt}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${b.cls}`}>{b.st}</span>
                    {b.canSettle && (
                      <form action={settleBookingAction} className="inline">
                        <input type="hidden" name="bookingId" value={b.fullId} />
                        <button
                          type="submit"
                          className="rounded-md bg-gold-500/20 px-2 py-0.5 text-[11px] font-bold text-gold-800 hover:bg-gold-500/30 transition-colors"
                          title="सेटलमेंट पूर्ण करा"
                        >
                          सेटल
                        </button>
                      </form>
                    )}
                    {b.canRefund && (
                      <form action={refundBookingAction} className="inline">
                        <input type="hidden" name="bookingId" value={b.fullId} />
                        <button
                          type="submit"
                          className="rounded-md bg-maroon-700/10 px-2 py-0.5 text-[11px] font-bold text-maroon-700 hover:bg-maroon-700/20 transition-colors"
                          title="परतावा द्या"
                        >
                          रिफंड
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              {renderedBookings.length === 0 ? <p className="px-6 py-8 text-center text-[13px] text-ink-400">अजून बुकिंग नाही.</p> : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="border-b border-ivory-300 px-4 sm:px-6 py-4">
              <h3 className="text-[15px] font-extrabold text-ink-900">व्हेंडर प्रतिसाद SLA</h3>
            </div>
            <div className="divide-y divide-ivory-200">
              {responseLive.map((r) => (
                <div key={r.v} className="flex items-center justify-between px-4 sm:px-6 py-3.5 text-[13px]">
                  <div>
                    <p className="font-bold text-ink-900">{r.v}</p>
                    <p className="text-[11.5px] text-ink-400">{r.cat}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-leaf-700">{r.t}</p>
                    <p className="text-[11px] text-ink-400">{toDevanagariDigits(r.rate)}% SLA पाळलं</p>
                  </div>
                </div>
              ))}
              {responseLive.length === 0 ? <p className="px-6 py-8 text-center text-[13px] text-ink-400">अजून प्रतिसाद नोंद नाही.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
