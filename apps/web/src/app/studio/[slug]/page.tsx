import Link from 'next/link';
import { notFound } from 'next/navigation';

import { formatMarathiDate, formatMarathiDateTime, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { GuestPanel } from '@/components/studio/guest-panel';
import { ReadinessPanel } from '@/components/studio/readiness-panel';
import { TaskPanel } from '@/components/studio/task-panel';
import { VendorDeskPanel } from '@/components/studio/vendor-desk-panel';
import { getStore } from '@/lib/store';
import { devRupees, shortDate, slugify } from '@/lib/format';

import { readinessFor } from './actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getStore().events.bySlug(slug);
  if (!event) return { title: 'वर्कस्पेस' };
  return {
    title: `${event.title} — वर्कस्पेस`,
    description: `माझी पत्रिका वर्कस्पेस — कार्यसूची, अर्थसंकल्प, पाहुणे व विक्रेता एका ठिकाणी. ${event.city}.`,
  };
}

const BUDGET_STATUS_LABEL: Record<string, string> = {
  planned: 'नियोजित',
  quoted: 'कोट आले',
  committed: 'निश्चित',
  paid: 'पूर्ण',
};

const BUDGET_STATUS_STYLE: Record<string, string> = {
  planned: 'border-gold/25 bg-ivory-deep text-charcoal-soft',
  quoted: 'border-gold/40 bg-gold/10 text-gold-ink',
  committed: 'border-paithani/25 bg-paithani-soft text-paithani',
  paid: 'border-paithani/30 bg-paithani text-ivory',
};

export default async function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await readinessFor(slug);
  if (!data) notFound();

  const store = getStore();
  const { event, report, rsvp, budget, tasks, leads, designs, daysToEvent } = data;

  const bookings = store.bookings.list({ eventId: event.id, limit: 50 });
  const commissions = bookings.reduce((sum, booking) => sum + booking.commissionPaise, 0);
  const committed = budget.reduce((sum, item) => sum + item.committedPaise, 0);
  const paid = budget.reduce((sum, item) => sum + item.paidPaise, 0);
  const target = event.budgetTargetPaise;
  const budgetPct = target > 0 ? Math.min(100, Math.round((committed / target) * 100)) : 0;
  const overBudget = target > 0 && committed > target;
  const remaining = target - committed;

  const suggested = store.vendors
    .search({ city: event.city, limit: 8 })
    .filter((vendor) => !leads.some((lead) => lead.vendorId === vendor.id));

  const eventType = store.events.bySlug(slug)?.eventType ?? 'other';
  const openTasks = tasks.filter((task) => task.status === 'open');
  const overdue = openTasks.filter((task) => task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10));

  const timeline: Array<{ at: string; title: string; detail: string; kind: 'event' | 'lead' | 'booking' | 'design' }> = [
    { at: event.createdAt, title: 'कार्यक्रम वर्कस्पेस तयार', detail: `वर्ग: ${eventType} • ${event.city}`, kind: 'event' as const },
    ...leads.map((lead) => ({
      at: lead.createdAt,
      title: `विक्रेता विनंती — ${vendorCategoryLabel(lead.category)}`,
      detail: `${lead.status} • ${lead.sponsored ? 'प्रायोजित' : 'सेंद्रिय'} • प्रतिसाद मुदत ${formatMarathiDateTime(lead.responseDueAt)}`,
      kind: 'lead' as const,
    })),
    ...bookings.map((booking) => ({
      at: booking.createdAt,
      title: `बुकिंग ${booking.state}`,
      detail: `एकूण ${devRupees(booking.totalPaise)} • आगाऊ ${devRupees(booking.advancePaise)} • कमिशन ${devRupees(booking.commissionPaise)}`,
      kind: 'booking' as const,
    })),
    ...designs.map((design) => ({
      at: design.updatedAt,
      title: `पत्रिका — ${design.name}`,
      detail: `आवृत्ती ${toDevanagariDigits(design.version)} • ${design.status}`,
      kind: 'design' as const,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 12);

  const countdownLabel = daysToEvent <= 0 ? 'शुभदिन आज' : `${toDevanagariDigits(daysToEvent)} दिवस शिल्लक`;

  return (
    <div className="shell animate-fade-up pb-12 pt-6 sm:pt-10">
      <nav aria-label="ब्रेडक्रम्ब" className="font-ui text-xs text-charcoal-soft">
        <Link href="/create" className="min-h-11 rounded-md underline decoration-gold underline-offset-4">
          तयार करा
        </Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="font-semibold text-charcoal">वर्कस्पेस</span>
      </nav>

      <header className="surface-royal grain relative mt-4 overflow-hidden p-6 sm:p-9">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-gold-bright/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="paithani-edge absolute inset-x-0 top-0 h-1.5" />
        <div className="relative">
          <p className="kicker-light">{eventType} • {event.city}</p>
          <h1 className="mt-2 max-w-3xl text-gold-shimmer">{event.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-ui text-xs font-semibold text-gold-shimmer ring-1 ring-white/20">
              <span aria-hidden className="animate-pulse-dot inline-block size-2 rounded-full bg-gold-bright" />
              {event.eventDate ? formatMarathiDate(event.eventDate) : 'तारीख निश्चित नाही'}
              <span aria-hidden>•</span>
              {countdownLabel}
            </span>
            {event.venueName ? (
              <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 font-ui text-xs font-medium text-gold-shimmer/90 ring-1 ring-white/15">
                <span aria-hidden>⌖</span>
                {event.venueName}
              </span>
            ) : null}
            <span className="inline-flex min-h-11 items-center rounded-full bg-gold-bright/15 px-4 py-2 font-ui text-xs font-semibold text-gold-soft ring-1 ring-gold-bright/30">
              {toDevanagariDigits(rsvp.invited)} पाहुणे • {toDevanagariDigits(openTasks.length)} कार्ये शिल्लक
            </span>
          </div>
        </div>
      </header>

      <div className="sticky top-3 z-20 mt-5">
        <div className="glass flex flex-col gap-2 rounded-3xl p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full sm:px-2.5">
          <p className="sr-only">वर्कस्पेस कृती</p>
          <Link href={`/studio/${slug}/invitation`} className="btn-base btn-maroon min-h-11 flex-1 px-5 text-sm shadow-sm">
            <span aria-hidden>✒</span>
            पत्रिका स्टुडिओ
          </Link>
          <Link href={`/studio/${slug}/invitation`} className="btn-base btn-outline min-h-11 flex-1 px-5 text-sm">
            <span aria-hidden>⎙</span>
            छपाई
          </Link>
          <Link href={`/e/${slug}`} className="btn-base btn-outline min-h-11 flex-1 px-5 text-sm">
            <span aria-hidden>◈</span>
            डिजिटल पान
          </Link>
        </div>
      </div>

      <div className="stagger mt-6 grid gap-6 lg:grid-cols-3">
        <ReadinessPanel report={report} daysToEvent={daysToEvent} />
        <section aria-labelledby="budget-heading" className="surface-elevated overflow-hidden p-0 lg:col-span-2">
          <div aria-hidden className="paithani-edge h-1.5" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="budget-heading" className="tracking-tight text-charcoal">अर्थसंकल्प</h2>
                <p className="mt-1 font-ui text-xs font-medium uppercase tracking-wider text-charcoal-soft">लक्ष्य • कमिटेड • दिलेली रक्कम</p>
              </div>
              <span className="inline-flex min-h-11 items-center rounded-full bg-paithani-soft px-4 py-2 font-ui text-xs font-bold text-paithani ring-1 ring-paithani/20">
                लक्ष्याच्या {toDevanagariDigits(budgetPct)}% वाटप
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'लक्ष्य', value: target },
                { label: 'कमिटेड', value: committed },
                { label: 'दिलेली रक्कम', value: paid },
              ].map((item) => (
                <div key={item.label} className="shimmer-sweep rounded-2xl border border-gold/25 bg-ivory-deep/50 p-4">
                  <p className="font-ui text-xs font-bold uppercase tracking-wider text-charcoal-soft">{item.label}</p>
                  <p className="mt-1 font-display text-xl font-bold tabular-nums text-maroon">{devRupees(item.value)}</p>
                </div>
              ))}
            </div>

            <div
              className="mt-4 h-3.5 overflow-hidden rounded-full bg-ivory-deep ring-1 ring-gold/20"
              role="progressbar"
              aria-valuenow={budgetPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="अर्थसंकल्प वाटप प्रगती"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${overBudget ? 'bg-maroon' : 'bg-paithani'}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>

            {overBudget ? (
              <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-2xl border border-maroon/25 bg-maroon-light px-4 py-3 text-xs leading-relaxed text-maroon">
                <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-maroon font-bold text-white">!</span>
                <p>
                  <span className="font-bold">लक्ष्य ओलांडले — {devRupees(committed - target)} जास्त.</span>
                  {' '}श्रेणीनिहाय अंदाज तपासा किंवा लक्ष्य वाढवा. शिल्लक {devRupees(remaining)} (उणे).
                </p>
              </div>
            ) : (
              <p className="mt-2.5 text-xs leading-relaxed text-charcoal-soft">
                लक्ष्याच्या {toDevanagariDigits(budgetPct)}% वाटप झाले आहे • शिल्लक {devRupees(Math.max(0, remaining))} •
                प्लॅटफॉर्म मध्यस्थी: {devRupees(commissions)} (केलेल्या बुकिंगवर)
              </p>
            )}

            <div className="table-wrap mt-5">
              <table className="data-table">
                <caption className="sr-only">अंदाजपत्रक — श्रेणीनिहाय अंदाज, कमिटेड व देय रक्कम</caption>
                <thead>
                  <tr>
                    <th scope="col">श्रेणी</th>
                    <th scope="col" className="text-right">अंदाज</th>
                    <th scope="col" className="text-right">कमिटेड</th>
                    <th scope="col" className="text-right">देय</th>
                    <th scope="col">स्थिती</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-charcoal">{item.label}</td>
                      <td className="text-right tabular-nums text-charcoal-soft">{devRupees(item.estimatedPaise)}</td>
                      <td className="text-right font-semibold tabular-nums text-charcoal">{devRupees(item.committedPaise)}</td>
                      <td className="text-right tabular-nums text-charcoal-soft">{devRupees(item.paidPaise)}</td>
                      <td>
                        <span className={`inline-flex min-h-11 items-center rounded-full border px-2.5 py-1 text-xs font-bold ${BUDGET_STATUS_STYLE[item.status] ?? BUDGET_STATUS_STYLE.planned}`}>
                          {BUDGET_STATUS_LABEL[item.status] ?? item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {budget.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <p className="font-display font-bold text-charcoal">अंदाजपत्रक रिकामे आहे</p>
                        <p className="mt-1 text-sm text-charcoal-soft">विक्रेता बुकिंग होताच श्रेणीनिहाय खर्च येथे दिसेल.</p>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <TaskPanel slug={slug} tasks={tasks} overdue={overdue.length} />

        <div className="space-y-6">
          <VendorDeskPanel slug={slug} leads={leads} suggested={suggested.map((v) => ({ id: v.id, name: v.name, category: v.category, city: v.city, rating: v.rating }))} />

          <section aria-labelledby="designs-heading" className="surface-elevated overflow-hidden p-0">
            <div aria-hidden className="paithani-edge h-1.5" />
            <div className="p-5">
              <h2 id="designs-heading" className="tracking-tight text-charcoal">पत्रिका व छपाई</h2>
              {designs.length ? (
                <ul className="mt-3 space-y-3">
                  {designs.map((design) => (
                    <li key={design.id} className="rounded-2xl border border-gold/25 bg-ivory p-3.5 transition hover:border-gold/45 hover:shadow-soft">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-charcoal">{design.name}</p>
                          <p className="mt-0.5 text-xs text-charcoal-soft">
                            आवृत्ती {toDevanagariDigits(design.version)} • {design.preset} • {design.scheme} • {design.status}
                          </p>
                        </div>
                        <Link href={`/studio/${slug}/invitation?design=${design.id}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-gold/30 px-3 text-xs font-bold text-maroon transition hover:bg-maroon-light">
                          उघडा →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-gold/35 bg-ivory-deep/50 px-4 py-8 text-center">
                  <p className="font-display font-bold text-charcoal">अजून पत्रिका नाही</p>
                  <p className="mt-1 text-sm text-charcoal-soft">स्टुडिओत शुभमुहूर्त, मजकूर व डिझाइन एकत्र करा.</p>
                  <Link href={`/studio/${slug}/invitation`} className="btn-base btn-outline mt-4 min-h-11 px-5 text-xs">
                    स्टुडिओत तयार करा →
                  </Link>
                </div>
              )}
              <Link href={`/studio/${slug}/invitation`} className="btn-base btn-maroon mt-4 min-h-11 w-full px-4 text-xs sm:w-auto">
                <span aria-hidden>✒</span>
                नवीन पत्रिका तयार करा
              </Link>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-6">
        <GuestPanel slug={slug} rsvp={rsvp} guests={store.events.guests(event.id)} />
      </div>

      <section aria-labelledby="timeline-heading" className="surface mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="timeline-heading" className="tracking-tight text-charcoal">कालक्रम</h2>
            <p className="mt-1 font-ui text-xs font-medium uppercase tracking-wider text-charcoal-soft">ताज्या घडामोडी • नवीन प्रथम</p>
          </div>
          <span className="inline-flex min-h-11 items-center rounded-full bg-ivory-deep px-4 py-2 font-ui text-xs font-bold text-charcoal-soft ring-1 ring-gold/20">
            {toDevanagariDigits(timeline.length)} नोंदी
          </span>
        </div>
        {timeline.length ? (
          <ol className="relative mt-6 space-y-5 border-l-2 border-gold/30 pl-6">
            {timeline.map((row, index) => (
              <li key={`${row.at}-${row.title}`} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[33px] top-1 grid size-4 place-items-center rounded-full ring-4 ring-ivory ${index === 0 ? 'animate-pulse-dot bg-maroon' : row.kind === 'booking' ? 'bg-paithani' : row.kind === 'design' ? 'bg-gold-bright' : 'bg-gold'}`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex min-h-11 items-center rounded-full bg-ivory-deep px-3 py-1 font-ui text-xs font-bold text-charcoal-soft ring-1 ring-gold/15">
                    {shortDate(row.at)}
                  </span>
                  {index === 0 ? (
                    <span className="inline-flex min-h-11 items-center rounded-full bg-maroon px-3 py-1 font-ui text-xs font-bold text-white">ताजे</span>
                  ) : null}
                </div>
                <p className="mt-1.5 font-semibold leading-snug text-charcoal">{row.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-charcoal-soft">{row.detail}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-gold/35 bg-ivory-deep/50 px-4 py-10 text-center">
            <p className="font-display font-bold text-charcoal">अजून घडामोड नाही</p>
            <p className="mt-1 text-sm text-charcoal-soft">विक्रेता विनंती किंवा पत्रिका तयार होताच कालक्रम येथे दिसेल.</p>
            <Link href={`/studio/${slug}/invitation`} className="btn-base btn-maroon mt-4 min-h-11 px-5 text-xs">
              पत्रिका सुरू करा →
            </Link>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-relaxed text-charcoal-soft">
        वर्कस्पेस शेअर लिंक: <span className="font-ui">/studio/{slugify(event.title)}</span> — विक्रेत्यांना आमंत्रित करण्यासाठी सुरक्षित लिंक वापरा. आर्थिक नोंदी
        बदलल्या जात नाहीत (append-only लेजर) आणि प्रत्येक बदल <span className="font-ui">audit</span> मध्ये नोंदवला जातो.
      </p>
    </div>
  );
}
