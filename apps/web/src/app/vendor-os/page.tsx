import Link from "next/link";

import { Chip, Icon, VerifiedBadge, type IconName } from "@/components/ui";
import { getStore } from "@/lib/store";
import { vendorDeskId } from "@/lib/vendor-desk";
import type { Lead } from "@mazi/store";
import { adPerformance } from "@mazi/commerce";
import { toDevanagariDigits } from "@mazi/marathi";
import { respondLeadAction, declineLeadAction } from "./actions";
import { categoryMr, formatINR, formatLakh, mrDateShort } from "@/lib/arch-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "व्हेंडर ओएस — माझी पत्रिका",
  description: "लीड्स, कोट्स, कॅलेंडर, पेमेंट्स आणि रिव्ह्यू — व्हेंडरसाठी संपूर्ण बिझनेस डॅशबोर्ड.",
};

const STATUS_MR: Record<string, { t: string; cls: string }> = {
  new: { t: "नवीन", cls: "bg-maroon-700/10 text-maroon-700 ring-maroon-700/30" },
  viewed: { t: "पाहिलं", cls: "bg-gold-400/15 text-gold-700 ring-gold-500/35" },
  responded: { t: "उत्तर दिलं", cls: "bg-gold-400/15 text-gold-700 ring-gold-500/35" },
  quoting: { t: "कोट तयार", cls: "bg-gold-400/15 text-gold-700 ring-gold-500/35" },
  quoted: { t: "कोट पाठवला", cls: "bg-leaf-600/10 text-leaf-700 ring-leaf-600/30" },
  won: { t: "बुक झालं 🎉", cls: "bg-leaf-600 text-white ring-leaf-600" },
  lost: { t: "नाकारलं", cls: "bg-ink-900/8 text-ink-400 ring-ink-900/15" },
  expired: { t: "मुदत संपली", cls: "bg-ink-900/8 text-ink-400 ring-ink-900/15" },
};

export default async function VendorOsPage() {
  const store = getStore();
  const deskVendorId = await vendorDeskId();
  const allVendors = store.vendors.search({ limit: 10 });
  const vendor = store.vendors.byId(deskVendorId) ?? allVendors[0] ?? {
    id: "vnd_pune_kulkarni_studio",
    name: "कुलकर्णी फोटोग्राफी स्टुडिओ",
    category: "photographer",
    city: "पुणे",
    rating: 4.9,
    plan: "growth" as const,
  };

  const vendorLeads: Lead[] = store.marketplace.leadsForVendor(vendor.id);
  const stats = store.marketplace.responseStats(vendor.id);
  const bookings = store.bookings.list({ vendorId: vendor.id, limit: 50 });
  const packages = store.vendors.packages(vendor.id);
  const campaigns = store.ads.campaignsForVendor(vendor.id);
  const reviews = store.vendors.reviews(vendor.id);
  const verifiedReviews = reviews.filter((r) => r.verifiedBooking);

  const total = vendorLeads.length;
  const newCount = vendorLeads.filter((l: Lead) => l.status === "new" || l.status === "viewed").length;
  const booked = vendorLeads.filter((l: Lead) => l.status === "won").length;
  const pipeline = vendorLeads.filter((l: Lead) => (["new", "viewed", "responded", "quoting", "quoted"] as string[]).includes(l.status)).length;
  const openCount = vendorLeads.filter((l: Lead) => !["won", "lost", "expired"].includes(l.status)).length;
  const revenue = Math.round(bookings.reduce((sum, booking) => sum + booking.totalPaise, 0) / 100);
  const responseRate = stats.total ? stats.responded / stats.total : 0;
  const responsePct = `${toDevanagariDigits(Math.round(responseRate * 100))}%`;

  const now = new Date();
  const monthLabel = new Intl.DateTimeFormat("mr-IN", { month: "long", year: "numeric" }).format(now);
  const rangeStart = now.toISOString().slice(0, 10);
  const rangeEndDate = new Date(now.getTime() + 29 * 86_400_000);
  const rangeEnd = rangeEndDate.toISOString().slice(0, 10);
  const availability = store.vendors.availability(vendor.id, rangeStart, rangeEnd);
  const availabilityByDate = new Map(availability.map((a) => [a.date, a.status]));
  const calendarDays: { date: string; day: string; status: "booked" | "hold" | "free" }[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    const raw = availabilityByDate.get(iso);
    return {
      date: iso,
      day: String(d.getUTCDate()),
      status: raw === "booked" ? "booked" : raw === "hold" || raw === "tentative" ? "hold" : "free",
    };
  });

  const monthKeys: string[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const monthLabels: string[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return new Intl.DateTimeFormat("mr-IN", { month: "short" }).format(d);
  });
  const monthlyRupees: number[] = monthKeys.map((key) =>
    Math.round(
      bookings
        .filter((b) => (b.createdAt ?? b.eventDate ?? "").slice(0, 7) === key)
        .reduce((sum, b) => sum + b.totalPaise, 0) / 100,
    ),
  );
  const monthlyLakh: number[] = monthlyRupees.map((r) => r / 100000);

  const sourceCounts = new Map<string, number>();
  for (const l of vendorLeads) sourceCounts.set(l.source, (sourceCounts.get(l.source) ?? 0) + 1);
  const sources = [...sourceCounts.entries()].map(([s, v]) => ({ s, v })).sort((a, b) => b.v - a.v).slice(0, 5);
  const sourceMax = Math.max(1, ...sources.map((s) => s.v));
  const sponsoredCount = vendorLeads.filter((l) => l.sponsored).length;

  const liveRoas = campaigns.length ? adPerformance(campaigns[0]!).roas : null;

  const sidebar: { icon: IconName; t: string; href: string; active?: boolean }[] = [
    { icon: "chart", t: "डॅशबोर्ड", href: "#dashboard", active: true },
    { icon: "bell", t: "लीड्स", href: "#leads" },
    { icon: "wallet", t: "कोट्स व पेमेंट्स", href: "#payments" },
    { icon: "calendar", t: "कॅलेंडर", href: "#calendar" },
    { icon: "star", t: "रिव्ह्यूज", href: "#reviews" },
    { icon: "mic", t: "जाहिराती", href: "#ads" },
  ];

  return (
    <div className="bg-ivory-200/50 py-8">
      <div className="shell grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="bg-paisley-dark p-4 sm:p-5 text-ivory-100 flex items-center gap-3.5 lg:block">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-xl sm:text-2xl font-bold text-gold-300 ring-2 ring-gold-400/60 lg:mb-3">
                {vendor.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="font-marathi-display text-[15px] sm:text-[17px] leading-snug font-bold truncate">{vendor.name}</p>
                <p className="mt-0.5 text-[11px] sm:text-[11.5px] text-ivory-100/60 truncate">{categoryMr(vendor.category)} · {vendor.city}</p>
                <div className="mt-1.5 sm:mt-2.5"><VerifiedBadge compact /></div>
              </div>
            </div>
            <nav className="flex lg:flex-col overflow-x-auto no-scrollbar gap-1.5 p-2 lg:p-3">
              {sidebar.map((s) => (
                <Link
                  key={s.t}
                  href={s.href}
                  className={`flex shrink-0 items-center gap-2 lg:gap-3 rounded-xl px-3.5 py-2 lg:px-4 lg:py-2.5 text-xs lg:text-[13.5px] font-bold whitespace-nowrap transition ${
                    s.active ? "bg-maroon-800 text-ivory-100 shadow-luxe" : "text-ink-500 hover:bg-ivory-100"
                  }`}
                >
                  <Icon name={s.icon} className={`h-4 w-4 lg:h-4.5 lg:w-4.5 ${s.active ? "text-gold-300" : ""}`} />
                  {s.t}
                </Link>
              ))}
            </nav>
            <div className="hidden lg:block border-t border-ivory-300 p-4">
              <div className="rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/5 p-4 ring-1 ring-gold-500/30">
                <p className="text-[11px] font-extrabold tracking-widest text-gold-700 uppercase">ग्रोथ प्लॅन</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-600">{vendor.plan} योजना · {toDevanagariDigits(openCount)} खुल्या चौकशा · एकूण {toDevanagariDigits(total)}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div id="dashboard" className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-marathi-display text-2xl sm:text-3xl font-bold text-maroon-900">डॅशबोर्ड</h1>
              <p className="mt-1 text-[13px] sm:text-[13.5px] text-ink-500">
                शुभ सकाळ 👋 — आज {toDevanagariDigits(newCount)} नवीन चौकशा आल्या आहेत
              </p>
            </div>
            <Chip tone="gold">
              <Icon name="zap" className="h-3 w-3" strokeWidth={2.2} /> प्रतिसाद-दर {responsePct} · {toDevanagariDigits(openCount)} खुल्या
            </Chip>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <Kpi icon="bell" label="एकूण चौकशा (३० दिवस)" value={toDevanagariDigits(total)} delta={`${toDevanagariDigits(booked)} जिंकल्या`} up />
            <Kpi icon="checklist" label="पाइपलाइनमध्ये" value={toDevanagariDigits(pipeline)} delta={`${toDevanagariDigits(booked)} बुकिंग्स`} />
            <Kpi icon="wallet" label="बुकिंग मूल्य (महिना)" value={formatLakh(revenue)} delta={`मध्यम प्रतिसाद ${toDevanagariDigits(stats.medianMinutes)} मि.`} up />
            <Kpi icon="star" label="रेटिंग" value={`★ ${vendor.rating.toFixed(1)}`} delta={`${toDevanagariDigits(verifiedReviews.length)} सत्य रिव्ह्यू`} />
          </div>

          <div id="payments" className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-maroon-900/10 bg-white p-4 sm:p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-extrabold text-ink-900">महसूल — गेली १२ महिने</h3>
                {liveRoas !== null ? <Chip tone="leaf">ROAS {toDevanagariDigits(liveRoas)}×</Chip> : <Chip tone="outline">जाहिरात नाही</Chip>}
              </div>
              <RevenueChart values={monthlyLakh} labels={monthLabels} amounts={monthlyRupees} />
            </div>

            <div className="rounded-2xl border border-maroon-900/10 bg-white p-4 sm:p-6 shadow-card">
              <h3 className="text-[15px] font-extrabold text-ink-900">चौकशा कुठून आल्या?</h3>
              <div className="mt-5 space-y-4">
                {sources.map((l) => (
                  <div key={l.s}>
                    <div className="flex items-center justify-between text-[12.5px] font-bold">
                      <span className="text-ink-700">{l.s}</span>
                      <span className="text-ink-400">{toDevanagariDigits(l.v)}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ivory-200">
                      <div className="h-full rounded-full bg-maroon-700" style={{ width: `${(l.v / sourceMax) * 100}%` }} />
                    </div>
                  </div>
                ))}
                {sources.length === 0 ? <p className="text-[12.5px] text-ink-400">अजून चौकशा नाहीत.</p> : null}
              </div>
              <p className="mt-5 rounded-lg bg-gold-400/10 px-3.5 py-3 text-[12px] leading-relaxed font-semibold text-gold-700 ring-1 ring-gold-500/25">
                एकूण {toDevanagariDigits(total)} चौकशांपैकी {toDevanagariDigits(sponsoredCount)} प्रायोजित · प्रतिसाद-दर {responsePct}
              </p>
            </div>
          </div>

          <div id="leads" className="overflow-hidden rounded-2xl border border-maroon-900/10 bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-ivory-300 px-4 sm:px-6 py-4">
              <h3 className="text-[15px] font-extrabold text-ink-900">लीड्स — चौकशी ते बुकिंग</h3>
              <span className="text-[12px] font-bold text-ink-400">एकूण {toDevanagariDigits(total)} · थेट डेटाबेसमधून</span>
            </div>
            {total === 0 ? (
              <p className="px-6 py-10 text-center text-[14px] text-ink-500">
                अजून चौकशा नाहीत — <a href="/vendors" className="font-bold text-maroon-800 underline">व्हेंडर पानावरून</a> स्वतःच एक चाचणी-चौकशी पाठवून पाहा!
              </p>
            ) : (
              <div className="divide-y divide-ivory-200">
                {vendorLeads.map((l: Lead) => {
                  const st = STATUS_MR[l.status] ?? STATUS_MR.new ?? { t: l.status, cls: "bg-ivory-200 text-ink-700 ring-ink-900/20" };
                  const quoteCount = store.marketplace.quotesForLead(l.id).length;
                  return (
                    <div key={l.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 transition hover:bg-ivory-50/70">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14.5px] font-bold text-ink-900">
                            {l.id} · {categoryMr(l.category)}
                          </p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ring-1 ${st.cls}`}>{st.t}</span>
                        </div>
                        <p className="mt-0.5 text-[12px] text-ink-400">
                          {mrDateShort(l.createdAt)} · प्रतिसाद मुदत {new Date(l.responseDueAt).toLocaleTimeString("mr-IN", { hour: "2-digit", minute: "2-digit" })}
                          {quoteCount > 0 ? ` · ${toDevanagariDigits(quoteCount)} कोट` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        {(l.status === "new" || l.status === "viewed") && (
                          <form action={async () => { "use server"; await respondLeadAction(l.id); }} className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto min-h-9 justify-center rounded-full bg-maroon-800 px-4 py-2 text-[12px] font-bold text-ivory-100 transition hover:bg-maroon-700">उत्तर द्या →</button>
                          </form>
                        )}
                        {(l.status === "responded" || l.status === "quoting") && (
                          <Link href={`/vendor/leads/${l.id}`} className="w-full sm:w-auto min-h-9 inline-flex justify-center items-center rounded-full bg-maroon-800 px-4 py-2 text-[12px] font-bold text-ivory-100 transition hover:bg-maroon-700">
                            कोट पाठवा →
                          </Link>
                        )}
                        {l.status === "quoted" && (
                          <Link href={`/vendor/leads/${l.id}`} className="w-full sm:w-auto min-h-9 inline-flex justify-center items-center rounded-full bg-maroon-800 px-4 py-2 text-[12px] font-bold text-ivory-100 transition hover:bg-maroon-700">
                            बुकिंग पूर्ण करा →
                          </Link>
                        )}
                        {l.status !== "won" && l.status !== "lost" && l.status !== "expired" && (
                          <form action={async () => { "use server"; await declineLeadAction(l.id); }} className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto min-h-9 justify-center rounded-full border border-maroon-800/20 px-4 py-2 text-[12px] font-bold text-ink-500 transition hover:border-maroon-700 hover:text-maroon-700">नाकारा</button>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div id="calendar" className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-extrabold text-ink-900">उपलब्धता — {monthLabel}</h3>
                <div className="flex items-center gap-4 text-[11px] font-bold text-ink-400">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-leaf-600" /> मोकळं</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gold-500" /> होल्ड</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-maroon-700" /> बुक</span>
                </div>
              </div>
              <AvailabilityGrid days={calendarDays} />
            </div>

            <div className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
              <h3 className="text-[15px] font-extrabold text-ink-900">पॅकेजेस</h3>
              <div className="mt-4 space-y-3">
                {packages.map((p, idx) => (
                  <div key={p.id} className={`rounded-xl p-4 ring-1 transition ${idx === 1 ? "bg-gold-400/10 ring-gold-500/40" : "ring-ink-900/10 hover:ring-gold-500/30"}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-extrabold text-ink-900">{p.title}</p>
                      <p className="font-display text-[16px] font-semibold text-maroon-800">{formatINR(p.pricePaise / 100)}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-500">{p.inclusions.join(" + ")}</p>
                  </div>
                ))}
                {packages.length === 0 ? <p className="text-[12.5px] text-ink-400">अजून पॅकेज नाहीत.</p> : null}
              </div>
              <p className="mt-4 text-center text-[12px] font-semibold text-ink-400">व्हेंडर ओएसमधूनच कोट पाठवा — {toDevanagariDigits(quoteCountTotal(store, vendorLeads))} कोट पाठवले</p>
            </div>
          </div>

          <div id="reviews" className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
            <h3 className="text-[15px] font-extrabold text-ink-900">रिव्ह्यूज — {toDevanagariDigits(reviews.length)} अभिप्राय · {toDevanagariDigits(verifiedReviews.length)} सत्यापित</h3>
            <div className="mt-4 space-y-3">
              {reviews.slice(0, 4).map((r) => (
                <div key={r.id} className="rounded-xl p-4 ring-1 ring-ink-900/10">
                  <div className="flex items-center justify-between">
                    <p className="text-[13.5px] font-extrabold text-ink-900">{r.authorName}</p>
                    <p className="text-[12.5px] font-bold text-gold-700">★ {r.rating.toFixed(1)}{r.verifiedBooking ? " · सत्यापित" : ""}</p>
                  </div>
                  {r.body ? <p className="mt-1 text-[12.5px] text-ink-500">{r.body}</p> : null}
                </div>
              ))}
              {reviews.length === 0 ? <p className="text-[12.5px] text-ink-400">अजून रिव्ह्यू नाहीत.</p> : null}
            </div>
          </div>

          <div id="ads" className="rounded-2xl border border-maroon-900/10 bg-white p-6 shadow-card">
            <h3 className="text-[15px] font-extrabold text-ink-900">जाहिराती — {toDevanagariDigits(campaigns.length)} मोहिमा</h3>
            <div className="mt-4 space-y-3">
              {campaigns.map((c) => {
                const perf = adPerformance(c);
                return (
                  <div key={c.id} className="rounded-xl p-4 ring-1 ring-ink-900/10">
                    <div className="flex items-center justify-between">
                      <p className="text-[13.5px] font-extrabold text-ink-900">{c.placement}</p>
                      <p className="text-[12px] font-bold text-ink-500">खर्च {formatINR(c.spentPaise / 100)} / {formatINR(c.budgetPaise / 100)} · ROAS {toDevanagariDigits(perf.roas)}×</p>
                    </div>
                    <p className="mt-1 text-[12px] text-ink-500">लीड {toDevanagariDigits(c.metrics.leads)} · बुकिंग {toDevanagariDigits(c.metrics.bookings)}</p>
                  </div>
                );
              })}
              {campaigns.length === 0 ? <p className="text-[12.5px] text-ink-400">सध्या जाहिरात मोहीम नाही.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function quoteCountTotal(store: ReturnType<typeof getStore>, leads: Lead[]): number {
  return leads.reduce((sum, l) => sum + store.marketplace.quotesForLead(l.id).length, 0);
}

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

function RevenueChart({ values, labels, amounts }: { values: number[]; labels: string[]; amounts: number[] }) {
  const w = 640, h = 190, pad = 10;
  const max = Math.max(0.1, ...values) * 1.15;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y, v };
  });
  const firstPt = pts[0] ?? { x: pad, y: h - pad, v: 0 };
  const lastPt = pts[pts.length - 1] ?? { x: w - pad, y: h - pad, v: 0 };
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${lastPt.x} ${h - pad} L${firstPt.x} ${h - pad} Z`;
  const lastAmount = amounts[amounts.length - 1] ?? 0;

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
          <rect x={lastPt.x - 62} y={lastPt.y - 44} width="76" height="26" rx="7" fill="#430d15" />
          <text x={lastPt.x - 24} y={lastPt.y - 27} textAnchor="middle" fill="#e6cf92" fontSize="12.5" fontWeight="800">{formatLakh(lastAmount)}</text>
        </g>
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] font-bold text-ink-400">
        {labels.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  );
}

function AvailabilityGrid({ days }: { days: { date: string; day: string; status: "booked" | "hold" | "free" }[] }) {
  return (
    <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-10">
      {days.map((d) => (
        <div
          key={d.date}
          title={`${d.date} — ${d.status === "booked" ? "बुक" : d.status === "hold" ? "होल्ड" : "मोकळं"}`}
          className={`grid aspect-square place-items-center rounded-lg text-[11.5px] font-bold transition hover:scale-110 ${
            d.status === "booked" ? "bg-maroon-700 text-ivory-100" : d.status === "hold" ? "bg-gold-500 text-maroon-950" : "bg-leaf-600/12 text-leaf-700 ring-1 ring-leaf-600/25"
          }`}
        >
          {d.day}
        </div>
      ))}
    </div>
  );
}
