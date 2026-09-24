import Link from 'next/link';
import { notFound } from 'next/navigation';

import { formatMarathiDate, formatMarathiDateTime, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { GuestPanel } from '@/components/studio/guest-panel';
import { ReadinessPanel } from '@/components/studio/readiness-panel';
import { TaskPanel } from '@/components/studio/task-panel';
import { VendorDeskPanel } from '@/components/studio/vendor-desk-panel';
import { getStore } from '@/lib/store';
import { devNumber, devRupees, shortDate, slugify } from '@/lib/format';

import { readinessFor } from './actions';

export const dynamic = 'force-dynamic';

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

  const suggested = store.vendors
    .search({ city: event.city, limit: 8 })
    .filter((vendor) => !leads.some((lead) => lead.vendorId === vendor.id));

  const eventType = store.events.bySlug(slug)?.eventType ?? 'other';
  const openTasks = tasks.filter((task) => task.status === 'open');
  const overdue = openTasks.filter((task) => task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10));

  return (
    <div className="shell py-10">
      <nav aria-label="ब्रेडक्रम्ब" className="font-ui text-xs text-charcoal-soft">
        <Link href="/create" className="underline decoration-gold underline-offset-4">
          तयार करा
        </Link>{' '}
        / वर्कस्पेस
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">
            {eventType} • {event.city}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-maroon">{event.title}</h1>
          <p className="mt-2 text-charcoal-soft">
            {event.eventDate ? (
              <>
                {formatMarathiDate(event.eventDate)} • {toDevanagariDigits(daysToEvent)} दिवस शिल्लक
              </>
            ) : (
              'तारीख निश्चित नाही'
            )}
            {event.venueName ? ` • ${event.venueName}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/studio/${slug}/invitation`} className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory shadow-soft">
            पत्रिका स्टुडिओ
          </Link>
          <Link href={`/studio/${slug}/print`} className="rounded-full border border-maroon/30 px-5 py-2.5 text-sm font-semibold text-maroon">
            छपाई ऑर्डर
          </Link>
          <Link href={`/e/${slug}`} className="rounded-full border border-gold/50 px-5 py-2.5 text-sm font-semibold text-charcoal">
            डिजिटल पान
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <ReadinessPanel report={report} daysToEvent={daysToEvent} />
        <section className="surface p-5 lg:col-span-2">
          <h2 className="font-display text-xl font-bold text-charcoal">अर्थसंकल्प</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'लक्ष्य', value: event.budgetTargetPaise },
              { label: 'कमिटेड', value: committed },
              { label: 'दिलेली रक्कम', value: paid },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-gold/25 bg-ivory-deep/50 p-3">
                <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">{item.label}</p>
                <p className="mt-1 font-display text-xl font-bold text-maroon">{devRupees(item.value)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-ivory-deep">
            <div
              className="h-full rounded-full bg-paithani transition-all"
              style={{ width: `${Math.min(100, Math.round((committed / Math.max(1, event.budgetTargetPaise)) * 100))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-charcoal-soft">
            लक्ष्याच्या {toDevanagariDigits(Math.round((committed / Math.max(1, event.budgetTargetPaise)) * 100))}% वाटप झाले आहे •
            प्लॅटफॉर्म मध्यस्थी: {devRupees(commissions)} (केलेल्या बुकिंगवर)
          </p>

          <table className="mt-5 w-full text-sm">
            <thead>
              <tr className="border-b border-gold/30 text-left font-ui text-xs uppercase tracking-wider text-charcoal-soft">
                <th className="py-2">श्रेणी</th>
                <th className="py-2 text-right">अंदाज</th>
                <th className="py-2 text-right">कमिटेड</th>
                <th className="py-2 text-right">देय</th>
                <th className="py-2">स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {budget.slice(0, 10).map((item) => (
                <tr key={item.id} className="border-b border-gold/15">
                  <td className="py-2 text-charcoal">{item.label}</td>
                  <td className="py-2 text-right text-charcoal-soft">{devRupees(item.estimatedPaise)}</td>
                  <td className="py-2 text-right text-charcoal">{devRupees(item.committedPaise)}</td>
                  <td className="py-2 text-right text-charcoal-soft">{devRupees(item.paidPaise)}</td>
                  <td className="py-2 text-xs text-charcoal-soft">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <TaskPanel slug={slug} tasks={tasks} overdue={overdue.length} />

        <div className="space-y-6">
          <VendorDeskPanel slug={slug} leads={leads} suggested={suggested.map((v) => ({ id: v.id, name: v.name, category: v.category, city: v.city, rating: v.rating }))} />

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">पत्रिका व छपाई</h2>
            {designs.length ? (
              <ul className="mt-3 space-y-3">
                {designs.map((design) => (
                  <li key={design.id} className="rounded-xl border border-gold/25 bg-ivory p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-charcoal">{design.name}</p>
                        <p className="mt-0.5 text-xs text-charcoal-soft">
                          आवृत्ती {toDevanagariDigits(design.version)} • {design.preset} • {design.scheme} • {design.status}
                        </p>
                      </div>
                      <Link href={`/studio/${slug}/invitation?design=${design.id}`} className="text-xs font-semibold text-maroon">
                        उघडा →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-charcoal-soft">
                अजून पत्रिका नाही.{' '}
                <Link href={`/studio/${slug}/invitation`} className="font-semibold text-maroon">
                  स्टुडिओत तयार करा →
                </Link>
              </p>
            )}
            <Link
              href={`/studio/${slug}/invitation`}
              className="mt-4 inline-block rounded-full bg-maroon px-4 py-2 text-xs font-semibold text-ivory"
            >
              नवीन पत्रिका तयार करा
            </Link>
          </section>
        </div>
      </div>

      <GuestPanel slug={slug} rsvp={rsvp} guests={store.events.guests(event.id)} />

      <section className="surface mt-6 p-5">
        <h2 className="font-display text-xl font-bold text-charcoal">कालक्रम</h2>
        <ol className="mt-4 space-y-4 border-l border-gold/40 pl-5">
          {[
            { at: event.createdAt, title: 'कार्यक्रम वर्कस्पेस तयार', detail: `वर्ग: ${eventType} • ${event.city}` },
            ...leads.map((lead) => ({
              at: lead.createdAt,
              title: `विक्रेता विनंती — ${vendorCategoryLabel(lead.category)}`,
              detail: `${lead.status} • ${lead.sponsored ? 'प्रायोजित' : 'सेंद्रिय'} • प्रतिसाद मुदत ${formatMarathiDateTime(lead.responseDueAt)}`,
            })),
            ...bookings.map((booking) => ({
              at: booking.createdAt,
              title: `बुकिंग ${booking.state}`,
              detail: `एकूण ${devRupees(booking.totalPaise)} • आगाऊ ${devRupees(booking.advancePaise)} • कमिशन ${devRupees(booking.commissionPaise)}`,
            })),
            ...designs.map((design) => ({
              at: design.updatedAt,
              title: `पत्रिका — ${design.name}`,
              detail: `आवृत्ती ${design.version} • ${design.status}`,
            })),
          ]
            .sort((a, b) => (a.at < b.at ? 1 : -1))
            .slice(0, 12)
            .map((row) => (
              <li key={`${row.at}-${row.title}`} className="relative">
                <span aria-hidden className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-gold" />
                <p className="font-semibold text-charcoal">{row.title}</p>
                <p className="text-xs text-charcoal-soft">
                  {shortDate(row.at)} • {row.detail}
                </p>
              </li>
            ))}
        </ol>
      </section>

      <p className="mt-6 text-xs text-charcoal-soft">
        वर्कस्पेस शेअर लिंक: <span className="font-ui">/studio/{slugify(event.title)}</span> — विक्रेत्यांना आमंत्रित करण्यासाठी सुरक्षित लिंक वापरा. आर्थिक नोंदी
        बदलल्या जात नाहीत (append-only लेजर) आणि प्रत्येक बदल <span className="font-ui">audit</span> मध्ये नोंदवला जातो.
      </p>
    </div>
  );
}
