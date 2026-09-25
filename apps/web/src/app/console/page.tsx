import { Chip, Eyebrow, Icon } from "@/components/ui";
import { getStore } from "@/lib/store";
import { devRupees } from "@/lib/format";
import { settleBookingAction, refundBookingAction } from "@/app/vendor/actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "कन्सोल — माझी पत्रिका ॲडमिन",
  description: "मार्केटप्लेस आरोग्य, नॉर्थ-स्टार फनेल, GMV, टेक-रेट आणि व्हेंडर SLA ट्रॅकर.",
};

const FUNNEL = [
  { t: "भेट देणारे", v: 48200, pct: 100 },
  { t: "इव्हेंट तयार", v: 2140, pct: 40 },
  { t: "सक्रिय इव्हेंट (प्रकाशित)", v: 1580, pct: 30 },
  { t: "व्हेंडर चौकशी", v: 960, pct: 22 },
  { t: "कोट स्वीकारला", v: 410, pct: 12 },
  { t: "बुकिंग + पेमेंट", v: 206, pct: 7.5 },
];

const CATEGORY_DEMAND = [
  { c: "लॉन/हॉल", v: 96 },
  { c: "डेकोरेशन", v: 88 },
  { c: "फोटोग्राफी", v: 82 },
  { c: "कॅटरिंग", v: 74 },
  { c: "मेकअप", v: 58 },
  { c: "प्रिंटिंग", v: 44 },
];

const DEFAULT_BOOKINGS = [
  { id: "MZ-2417", fullId: "MZ-2417", ev: "देशमुख विवाह", vendor: "शिवनेरी लॉन्स", amt: "₹८५,०००", st: "बुक ✓", cls: "bg-leaf-600/10 text-leaf-700", state: "BOOKING_CONFIRMED" },
  { id: "MZ-2416", fullId: "MZ-2416", ev: "आर्वी नामकरण", vendor: "अथर्व मोमेंट्स", amt: "₹४२,०००", st: "बुक ✓", cls: "bg-leaf-600/10 text-leaf-700", state: "BOOKING_CONFIRMED" },
  { id: "MZ-2415", fullId: "MZ-2415", ev: "पाटील गृहप्रवेश", vendor: "स्वरांगी कॅटरर्स", amt: "₹६८,०००", st: "ठेव बाकी", cls: "bg-gold-400/15 text-gold-700", state: "PAYMENT_PENDING" },
  { id: "MZ-2414", fullId: "MZ-2414", ev: "जोशी साखरपुडा", vendor: "कलासंगर डेकोरेटर्स", amt: "₹७५,०००", st: "बुक ✓", cls: "bg-leaf-600/10 text-leaf-700", state: "BOOKING_CONFIRMED" },
  { id: "MZ-2413", fullId: "MZ-2413", ev: "कुलकर्णी पूजा", vendor: "भटजी सेवा मंडळ", amt: "₹११,०००", st: "रिफंड", cls: "bg-maroon-700/10 text-maroon-700", state: "REFUNDED" },
];

const RESPONSE = [
  { v: "शिवनेरी लॉन्स", cat: "व्हेन्यू", t: "०.८ तास", rate: 98 },
  { v: "कलासंगर डेकोरेटर्स", cat: "डेकोरेशन", t: "१.२ तास", rate: 94 },
  { v: "अथर्व मोमेंट्स", cat: "फोटो", t: "२.१ तास", rate: 91 },
  { v: "स्वरांगी कॅटरर्स", cat: "कॅटरिंग", t: "४.४ तास", rate: 78 },
];

export default async function ConsolePage() {
  const store = getStore();
  const allLeads = store.db.prepare('SELECT id FROM leads ORDER BY created_at DESC LIMIT 50').all() as { id: string }[];
  const allVendors = store.vendors.search({ limit: 50 });
  const allBookings = store.bookings.list({ limit: 50 });

  const liveBookingsTotalPaise = allBookings.reduce((sum, b) => sum + (b.totalPaise ?? 0), 0);
  const liveCommissionPaise = allBookings.reduce((sum, b) => sum + (b.commissionPaise ?? 0), 0);
  const effectiveGmvRupees = liveBookingsTotalPaise > 0 ? liveBookingsTotalPaise / 100 : 580000;
  const takeRate = liveBookingsTotalPaise > 0
    ? `${((liveCommissionPaise / liveBookingsTotalPaise) * 100).toFixed(1)}%`
    : "८.२%";

  const renderedBookings = allBookings.length > 0
    ? allBookings.slice(0, 8).map((b) => {
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
      })
    : DEFAULT_BOOKINGS.map((b) => ({ ...b, canSettle: false, canRefund: false }));

  return (
    <div className="bg-ivory-200/50 pb-16">
      {/* header */}
      <div className="bg-paisley-dark text-ivory-100">
        <div className="shell py-12">
          <Eyebrow dark>सुपर ॲडमिन · मझी कन्सोल</Eyebrow>
          <h1 className="font-marathi-display text-4xl font-bold sm:text-[42px]">मार्केटप्लेस आरोग्य</h1>
          <p className="mt-3 max-w-2xl text-[14.5px] text-ivory-100/65">
            नॉर्थ स्टार: तयार झालेले नव्हे — <strong className="text-gold-300">सक्रिय व पूर्ण झालेले इव्हेंट्स</strong>.
            GMV + निव्वळ महसूल + टेक-रेट थेट येथे.
          </p>
          <div className="mt-7 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { l: "GMV (या महिन्यात)", v: `₹${(effectiveGmvRupees / 100000).toFixed(1)} लाख` },
              { l: "टेक-रेट", v: takeRate },
              { l: "बुकिंग रूपांतरण", v: "२१.५%" },
              { l: "सक्रिय व्हेंडर्स", v: String(allVendors.length) },
            ].map((k) => (
              <div key={k.l}>
                <div className="font-display text-[28px] font-semibold text-gold-300">{k.v}</div>
                <div className="mt-0.5 text-[11.5px] font-bold text-ivory-100/55">{k.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shell space-y-6 py-8">
        {/* north star strip */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gold-500/30 bg-white px-5 py-4 shadow-card">
          <Icon name="star" className="h-4.5 w-4.5 text-gold-600" />
          <p className="text-[13px] font-bold text-ink-700">या आठवड्याचा फोकस:</p>
          {["प्रतिसाद-वेळ < २ तास", "कोट→बुकिंग २१%→२५%", "पुण्यात २० नवे व्हेन्यू"].map((f) => (
            <Chip key={f} tone="maroon">{f}</Chip>
          ))}
          <span className="ml-auto flex items-center gap-1.5 text-[12px] font-extrabold text-leaf-700">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-leaf-600" /> थेट · {allLeads.length} ताज्या चौकशा
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* funnel */}
          <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink-900">नॉर्थ-स्टार फनेल</h3>
              <Chip tone="gold">मागील ३० दिवस</Chip>
            </div>
            <div className="mt-5 space-y-3">
              {FUNNEL.map((f, i) => (
                <div key={f.t}>
                  <div className="flex items-center justify-between text-[12.5px] font-bold">
                    <span className="text-ink-700">{f.t}</span>
                    <span className="text-ink-400">{f.v.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="mt-1 h-5 overflow-hidden rounded-md bg-ivory-200">
                    <div
                      className="flex h-full items-center rounded-md bg-gradient-to-r from-maroon-800 to-maroon-600 pl-2 transition-all duration-700"
                      style={{ width: `${f.pct}%`, opacity: 1 - i * 0.09 }}
                    >
                      <span className="text-[10px] font-extrabold text-gold-300">{f.pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* category demand */}
          <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-ink-900">श्रेणी-मागणी — पुणे</h3>
              <Chip tone="outline">GTM: पुणे प्रयोगशाळा</Chip>
            </div>
            <div className="mt-5 space-y-4">
              {CATEGORY_DEMAND.map((c) => (
                <div key={c.c}>
                  <div className="flex items-center justify-between text-[12.5px] font-bold">
                    <span className="text-ink-700">{c.c}</span>
                    <span className="text-gold-700">{c.v} चौकशा</span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-ivory-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-maroon-700" style={{ width: `${c.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-lg bg-leaf-600/8 px-3.5 py-3 text-[12px] leading-relaxed font-semibold text-leaf-700 ring-1 ring-leaf-600/20">
              ✓ शिफारस: व्हेन्यू-श्रेणीत पुरवठा कमी — २० नवे लॉन जोडा, रूपांतरण १२% वाढण्याचा अंदाज.
            </p>
          </div>
        </div>

        {/* bookings + SLA */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="border-b border-ivory-300 px-6 py-4">
              <h3 className="text-[15px] font-extrabold text-ink-900">अलिकडची बुकिंग्स</h3>
            </div>
            <div className="divide-y divide-ivory-200">
              {renderedBookings.map((b) => (
                <div key={b.fullId} className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 text-[13px]">
                  <div>
                    <span className="font-mono text-[11px] text-ink-400">{b.id} · </span>
                    <span className="font-bold text-ink-900">{b.ev}</span>
                    <span className="text-ink-500"> → {b.vendor}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="border-b border-ivory-300 px-6 py-4">
              <h3 className="text-[15px] font-extrabold text-ink-900">व्हेंडर प्रतिसाद SLA</h3>
            </div>
            <div className="divide-y divide-ivory-200">
              {RESPONSE.map((r) => (
                <div key={r.v} className="flex items-center justify-between px-6 py-3.5 text-[13px]">
                  <div>
                    <p className="font-bold text-ink-900">{r.v}</p>
                    <p className="text-[11.5px] text-ink-400">{r.cat}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-leaf-700">{r.t}</p>
                    <p className="text-[11px] text-ink-400">{r.rate}% SLA पाळलं</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
