import Link from "next/link";

import { Chip, Icon, VerifiedBadge, type IconName } from "@/components/ui";
import { getStore } from "@/lib/store";
import type { Lead } from "@mazi/store";
import { advanceLeadAction, declineLeadAction } from "./actions";
import { categoryMr, formatINR, formatLakh, mrDateShort } from "@/lib/arch-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "व्हेंडर ओएस — माझी पत्रिका",
  description: "लीड्स, कोट्स, कॅलेंडर, पेमेंट्स आणि रिव्ह्यू — व्हेंडरसाठी संपूर्ण बिझनेस डॅशबोर्ड.",
};

const REVENUE = [1.2, 1.8, 1.5, 2.4, 2.1, 3.2, 2.8, 3.6, 4.1, 3.9, 4.8, 5.6]; // लाख
const MONTHS = ["जाने", "फेब्रु", "मार्च", "एप्रि", "मे", "जून", "जुलै", "ऑग", "सप्टें", "ऑक्टो", "नोव्हें", "डिसें"];
const LEAD_SOURCES = [
  { s: "मझी सर्च", v: 42, c: "bg-maroon-700" },
  { s: "फीचर्ड लिस्टिंग", v: 23, c: "bg-gold-500" },
  { s: "रेफरल", v: 14, c: "bg-leaf-600" },
  { s: "इव्हेंट पान", v: 9, c: "bg-maroon-400" },
];

const STATUS_MR: Record<string, { t: string; cls: string }> = {
  new: { t: "नवीन", cls: "bg-maroon-700/10 text-maroon-700 ring-maroon-700/30" },
  contacted: { t: "संपर्क झाला", cls: "bg-gold-400/15 text-gold-700 ring-gold-500/35" },
  quoted: { t: "कोट पाठवला", cls: "bg-leaf-600/10 text-leaf-700 ring-leaf-600/30" },
  won: { t: "बुक झालं 🎉", cls: "bg-leaf-600 text-white ring-leaf-600" },
  lost: { t: "नाकारलं", cls: "bg-ink-900/8 text-ink-400 ring-ink-900/15" },
};

const NEXT_ACTION: Record<string, string | null> = {
  new: "कोट पाठवा →",
  contacted: "कोट पाठवा →",
  quoted: "बुकिंग पूर्ण करा →",
  won: null,
  lost: null,
};

export default async function VendorOsPage() {
  const store = getStore();
  const allVendors = store.vendors.search({ limit: 10 });
  const vendor = allVendors[0] ?? {
    id: "vnd_pune_kulkarni_studio",
    name: "कुलकर्णी फोटोग्राफी स्टुडिओ",
    category: "photographer",
    city: "पुणे",
    rating: 4.9,
    startingPricePaise: 4500000,
  };

  let vendorLeads: Lead[] = store.marketplace.leadsForVendor(vendor.id);
  if (vendorLeads.length === 0) {
    const allLeadRows = store.db.prepare('SELECT id FROM leads ORDER BY created_at DESC LIMIT 30').all() as { id: string }[];
    vendorLeads = allLeadRows.map((r) => store.marketplace.leadById(r.id)).filter((l): l is Lead => Boolean(l));
  }
  const total = vendorLeads.length;
  const booked = vendorLeads.filter((l: Lead) => l.status === "won").length;
  const pipeline = vendorLeads.filter((l: Lead) => (["new", "quoted", "contacted"] as string[]).includes(l.status)).length;
  const revenue = Math.round(
    store.bookings.list({ vendorId: vendor.id, limit: 50 }).reduce((sum, booking) => sum + booking.totalPaise, 0) / 100,
  );

  const sidebar: { icon: IconName; t: string; active?: boolean }[] = [
    { icon: "chart", t: "डॅशबोर्ड", active: true },
    { icon: "bell", t: "लीड्स" },
    { icon: "wallet", t: "कोट्स व पेमेंट्स" },
    { icon: "calendar", t: "कॅलेंडर" },
    { icon: "star", t: "रिव्ह्यूज" },
    { icon: "mic", t: "जाहिराती" },
  ];

  return (
    <div className="bg-ivory-200/50 py-8">
      <div className="shell grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* ── sidebar ── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="bg-paisley-dark p-5 text-ivory-100">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/20 text-2xl font-bold text-gold-300 ring-2 ring-gold-400/60">
                {vendor.name.slice(0, 1)}
              </div>
              <p className="font-marathi-display text-[17px] leading-snug font-bold">{vendor.name}</p>
              <p className="mt-0.5 text-[11.5px] text-ivory-100/60">{categoryMr(vendor.category)} · {vendor.city}</p>
              <div className="mt-2.5"><VerifiedBadge compact /></div>
            </div>
            <nav className="p-3">
              {sidebar.map((s) => (
                <Link
                  key={s.t}
                  href="/vendor"
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition ${
                    s.active ? "bg-maroon-800 text-ivory-100 shadow-luxe" : "text-ink-500 hover:bg-ivory-100"
                  }`}
                >
                  <Icon name={s.icon} className={`h-4.5 w-4.5 ${s.active ? "text-gold-300" : ""}`} />
                  {s.t}
                </Link>
              ))}
            </nav>
            <div className="border-t border-ivory-300 p-4">
              <div className="rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/5 p-4 ring-1 ring-gold-500/30">
                <p className="text-[11px] font-extrabold tracking-widest text-gold-700 uppercase">ग्रोथ प्लॅन</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-600">१८/२५ लीड क्रेडिट्स शिल्लक · नूतनीकरण ३ जाने</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── main ── */}
        <div className="min-w-0 space-y-6">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-marathi-display text-3xl font-bold text-maroon-900">डॅशबोर्ड</h1>
              <p className="mt-1 text-[13.5px] text-ink-500">
                शुभ सकाळ 👋 — आज {vendorLeads.filter((l: Lead) => l.status === "new").length} नवीन चौकशा आल्या आहेत
              </p>
            </div>
            <Chip tone="gold">
              <Icon name="zap" className="h-3 w-3" strokeWidth={2.2} /> प्रतिसाद-दर ९४% · आज कॅलेंडर अपडेट ✓
            </Chip>
          </div>

          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon="bell" label="एकूण चौकशा (३० दिवस)" value={String(total)} delta={`${booked} जिंकल्या`} up />
            <Kpi icon="checklist" label="पाइपलाइनमध्ये" value={String(pipeline)} delta={`${booked} बुकिंग्स`} />
            <Kpi icon="wallet" label="बुकिंग मूल्य (महिना)" value={formatLakh(revenue)} delta="+२४%" up />
            <Kpi icon="star" label="रेटिंग" value={`★ ${vendor.rating.toFixed(1)}`} delta="२८ सत्य रिव्ह्यू" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* revenue chart */}
            <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-extrabold text-ink-900">महसूल — गेली १२ महिने</h3>
                <Chip tone="leaf">ROAS ९.६×</Chip>
              </div>
              <RevenueChart />
            </div>

            {/* lead sources */}
            <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
              <h3 className="text-[15px] font-extrabold text-ink-900">चौकशा कुठून आल्या?</h3>
              <div className="mt-5 space-y-4">
                {LEAD_SOURCES.map((l) => (
                  <div key={l.s}>
                    <div className="flex items-center justify-between text-[12.5px] font-bold">
                      <span className="text-ink-700">{l.s}</span>
                      <span className="text-ink-400">{l.v}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ivory-200">
                      <div className={`h-full rounded-full ${l.c}`} style={{ width: `${(l.v / 42) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-lg bg-gold-400/10 px-3.5 py-3 text-[12px] leading-relaxed font-semibold text-gold-700 ring-1 ring-gold-500/25">
                💡 फीचर्ड लिस्टिंगमुळे या महिन्यात २३ अतिरिक्त चौकशा — खर्च ₹९९९, परतावा ९.६ पट.
              </p>
            </div>
          </div>

          {/* leads table */}
          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ivory-300 px-6 py-4">
              <h3 className="text-[15px] font-extrabold text-ink-900">लीड्स — चौकशी ते बुकिंग</h3>
              <span className="text-[12px] font-bold text-ink-400">एकूण {total} · थेट डेटाबेसमधून</span>
            </div>
            {total === 0 ? (
              <p className="px-6 py-10 text-center text-[14px] text-ink-500">
                अजून चौकशा नाहीत — <a href="/vendors" className="font-bold text-maroon-800 underline">व्हेंडर पानावरून</a> स्वतःच एक चाचणी-चौकशी पाठवून पाहा!
              </p>
            ) : (
              <div className="divide-y divide-ivory-200">
                {vendorLeads.map((l: Lead) => {
                  const st = STATUS_MR[l.status] ?? STATUS_MR.new ?? { t: l.status, cls: "bg-ivory-200 text-ink-700 ring-ink-900/20" };
                  const next = NEXT_ACTION[l.status];
                  return (
                    <div key={l.id} className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-ivory-50/70">
                      <div className="min-w-[180px] flex-1">
                        <p className="text-[14.5px] font-bold text-ink-900">
                          {l.id} · {categoryMr(l.category)}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-400">
                          {mrDateShort(l.createdAt)} · प्रतिसाद मुदत {new Date(l.responseDueAt).toLocaleTimeString("mr-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11.5px] font-extrabold ring-1 ${st.cls}`}>{st.t}</span>
                      <div className="flex gap-2">
                        {next && (
                          <form action={async () => { "use server"; await advanceLeadAction(l.id); }}>
                            <button className="rounded-full bg-maroon-800 px-4 py-2 text-[12px] font-bold text-ivory-100 transition hover:bg-maroon-700">{next}</button>
                          </form>
                        )}
                        {l.status !== "won" && l.status !== "lost" && (
                          <form action={async () => { "use server"; await declineLeadAction(l.id); }}>
                            <button className="rounded-full border border-maroon-800/20 px-4 py-2 text-[12px] font-bold text-ink-500 transition hover:border-maroon-700 hover:text-maroon-700">नाकारा</button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* calendar + packages */}
          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-extrabold text-ink-900">उपलब्धता — नोव्हेंबर २०२६</h3>
                <div className="flex items-center gap-4 text-[11px] font-bold text-ink-400">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-leaf-600" /> मोकळं</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gold-500" /> होल्ड</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-maroon-700" /> बुक</span>
                </div>
              </div>
              <AvailabilityGrid />
            </div>

            <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
              <h3 className="text-[15px] font-extrabold text-ink-900">पॅकेजेस</h3>
              <div className="mt-4 space-y-3">
                {[
                  { t: "बेसिक — फुलांचा मंडप", p: "₹४०,०००", d: "मंडप + स्टेज + एंट्रान्स" },
                  { t: "स्टँडर्ड — थीम डेकोर", p: "₹७५,०००", d: "+ फोटो पॉइंट + लाइटिंग", hot: true },
                  { t: "प्रीमियम — दरबारी", p: "₹१,२५,०००", d: "+ एलईडी + फ्लॉवर वॉल + टीम १२" },
                ].map((p) => (
                  <div key={p.t} className={`rounded-xl p-4 ring-1 transition ${p.hot ? "bg-gold-400/10 ring-gold-500/40" : "ring-ink-900/10 hover:ring-gold-500/30"}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-extrabold text-ink-900">{p.t}</p>
                      <p className="font-display text-[16px] font-semibold text-maroon-800">{p.p}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-500">{p.d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-[12px] font-semibold text-ink-400">व्हेंडर ओएसमधूनच कोट पाठवा — सरासरी बंद-दर २.३ पट वाढतो</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── subcomponents ── */

function Kpi({ icon, label, value, delta, up = false }: { icon: IconName; label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="rounded-2xl border border-maroon-900/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-luxe">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-maroon-800/8 text-maroon-800 ring-1 ring-maroon-800/15">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        {up && <span className="rounded-full bg-leaf-600/10 px-2 py-0.5 text-[10.5px] font-extrabold text-leaf-700">▲ {delta}</span>}
      </div>
      <div className="font-display mt-4 text-[30px] leading-none font-semibold text-maroon-800">{value}</div>
      <div className="mt-1.5 text-[12px] font-semibold text-ink-500">{label}{!up && <span className="text-gold-600"> · {delta}</span>}</div>
    </div>
  );
}

function RevenueChart() {
  const w = 640, h = 190, pad = 10;
  const max = Math.max(...REVENUE) * 1.15;
  const pts = REVENUE.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (REVENUE.length - 1);
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y, v };
  });
  const firstPt = pts[0] ?? { x: pad, y: h - pad, v: 0 };
  const lastPt = pts[pts.length - 1] ?? { x: w - pad, y: h - pad, v: 0 };
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${lastPt.x} ${h - pad} L${firstPt.x} ${h - pad} Z`;
  const p11 = pts[11] ?? lastPt;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c7a24f" stopOpacity="0.5" />
            <stop offset="1" stopColor="#c7a24f" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={w - pad} y1={h * f} y2={h * f} stroke="#ece1c6" strokeDasharray="3 5" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#rev)" />
        <path d={line} fill="none" stroke="#a97f35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? "#71202c" : "#fff"} stroke="#a97f35" strokeWidth="2" />
        ))}
        <g>
          <rect x={p11.x - 62} y={p11.y - 44} width="76" height="26" rx="7" fill="#430d15" />
          <text x={p11.x - 24} y={p11.y - 27} textAnchor="middle" fill="#e6cf92" fontSize="12.5" fontWeight="800">₹५.६ लाख</text>
        </g>
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] font-bold text-ink-400">
        {MONTHS.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
}

function AvailabilityGrid() {
  const states = Array.from({ length: 30 }, (_, i) => {
    if ([5, 6, 12, 19, 20, 26, 27].includes(i + 1)) return "booked";
    if ([8, 14, 22].includes(i + 1)) return "hold";
    return "free";
  });
  return (
    <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-10">
      {states.map((s, i) => (
        <div
          key={i}
          title={`${i + 1} नोव्हें — ${s === "booked" ? "बुक" : s === "hold" ? "होल्ड" : "मोकळं"}`}
          className={`grid aspect-square place-items-center rounded-lg text-[11.5px] font-bold transition hover:scale-110 ${
            s === "booked" ? "bg-maroon-700 text-ivory-100" : s === "hold" ? "bg-gold-500 text-maroon-950" : "bg-leaf-600/12 text-leaf-700 ring-1 ring-leaf-600/25"
          }`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}
