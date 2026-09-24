import Link from 'next/link';
import { notFound } from 'next/navigation';

import { commissionRate } from '@mazi/commerce';
import { formatMarathiDate, formatMarathiDateTime, leadStatusLabel, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { QuoteBuilder } from '@/components/vendor/quote-builder';
import { getStore } from '@/lib/store';
import { devRupees, percent } from '@/lib/format';

export const dynamic = 'force-dynamic';

/**
 * Super-Class Vendor Command Center.
 *
 * Left: everything the vendor needs to decide (what the family asked for, what
 * they can spend, whether the date is free, how fast they answered). Right: the
 * line-item quote builder, which shows the vendor *their own payout* — not just
 * the customer price — before they send it.
 */
export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const lead = store.marketplace.leadById(id);
  if (!lead) notFound();

  const vendor = store.vendors.byId(lead.vendorId);
  const event = lead.eventId ? store.events.byId(lead.eventId) : undefined;
  const messages = store.marketplace.messages(lead.id);
  const quotes = store.marketplace.quotesForLead(lead.id);
  const booking = store.bookings.list({ eventId: lead.eventId ?? undefined, limit: 50 }).find((item) => item.leadId === lead.id);
  const stats = store.marketplace.responseStats(lead.vendorId);

  const availability = lead.eventDate
    ? store.vendors.availability(lead.vendorId, lead.eventDate, lead.eventDate)
    : [];

  const isResponded = Boolean(lead.respondedAt);
  const isWon = lead.status === 'won';
  const isQuoted = lead.status === 'quoted' || isWon;

  return (
    <div className="shell py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="ब्रेडक्रम्ब" className="flex items-center gap-2 font-ui text-xs text-charcoal-muted">
        <Link href="/vendor" className="transition hover:text-maroon flex items-center gap-1 font-medium">
          <span>🏛️</span>
          <span>विक्रेता डेस्क</span>
        </Link>
        <span>/</span>
        <span className="text-maroon font-semibold">विनंती #{lead.id}</span>
      </nav>

      {/* Main Header Card */}
      <header className="surface-royal mt-4 p-6 sm:p-8 relative overflow-hidden">
        <div aria-hidden className="absolute -right-16 -top-16 size-64 rounded-full bg-gold/10 blur-3xl" />
        <div aria-hidden className="paithani-edge absolute inset-x-0 top-0 h-1.5 opacity-90" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/20 px-3 py-0.5 text-xs font-semibold text-gold-shimmer backdrop-blur-md">
                <span>✦</span>
                <span>{vendorCategoryLabel(lead.category)}</span>
              </span>
              <span className="rounded-full bg-ivory/15 px-3 py-0.5 text-xs font-medium text-ivory/90">
                {event?.city ?? vendor?.city ?? 'महाराष्ट्र'}
              </span>
              {lead.sponsored ? (
                <span className="rounded-full bg-haldi/30 border border-haldi/50 px-2.5 py-0.5 text-xs font-bold text-haldi-soft">
                  प्रायोजित लीड
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold tracking-tight text-gold-shimmer">
              {event?.title ?? 'नवीन कार्यक्रम विनंती'}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ivory/80">
              <span className="flex items-center gap-1.5">
                <span className="text-gold-bright">📅</span>
                <strong className="text-ivory font-medium">
                  {lead.eventDate ? formatMarathiDate(lead.eventDate) : 'तारीख ठरलेली नाही'}
                </strong>
              </span>
              {lead.guestCount ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-gold-bright">👥</span>
                  <span>{toDevanagariDigits(lead.guestCount)} पाहुणे</span>
                </span>
              ) : null}
              {lead.budgetPaise ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-gold-bright">💰</span>
                  <span>बजेट: <strong className="text-gold-bright font-bold">{devRupees(lead.budgetPaise)}</strong></span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Status & SLA Badge */}
          <div className="flex flex-col items-start sm:items-end gap-2 bg-maroon-deep/40 rounded-2xl p-4 border border-gold/30 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-paithani-light animate-pulse-subtle" />
              <span className="font-semibold text-sm text-gold-shimmer">
                {leadStatusLabel(lead.status)}
              </span>
            </div>
            {isResponded ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-paithani/30 px-2.5 py-0.5 text-xs font-medium text-paithani-soft border border-paithani-light/40">
                ✓ SLA वेळेत प्रतिसाद दिला
              </span>
            ) : (
              <span className="text-xs text-haldi-soft">
                मुदत: {formatMarathiDateTime(lead.responseDueAt)}
              </span>
            )}
            <div className="text-xs text-ivory/70 text-right mt-1">
              <span>SLA दर: <strong className="text-gold-shimmer font-bold">{percent(stats.slaRate)}</strong></span>
              <span className="mx-1">•</span>
              <span>मध्यम: <strong className="text-gold-shimmer font-bold">{toDevanagariDigits(stats.medianMinutes)} मि.</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Left Content (2 Cols) + Right Sidebar (1 Col) */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_24rem]">
        <div className="space-y-8">
          {/* Confirmed Booking Hero Card (When booking exists, e.g. lead_2) */}
          {booking ? (
            <section className="surface-elevated border-2 border-paithani/50 p-6 relative overflow-hidden bg-linear-to-br from-ivory-surface via-paithani-soft/30 to-ivory">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paithani/25 pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-paithani text-ivory text-xl shadow-xs">
                    ✓
                  </span>
                  <div>
                    <span className="rounded-full bg-paithani/15 px-2.5 py-0.5 text-xs font-bold text-paithani border border-paithani/30">
                      बुकिंग पुष्टीकरण • {booking.state}
                    </span>
                    <h2 className="font-display text-xl font-bold text-charcoal mt-1">
                      करार क्रमांक #{booking.id}
                    </h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-charcoal-muted">एकूण करार मूल्य</p>
                  <p className="font-display text-2xl font-bold text-maroon">{devRupees(booking.totalPaise)}</p>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl border border-paithani/30 bg-ivory-surface/90 p-2.5">
                  <span className="text-xs text-paithani font-bold">१. विनंती प्राप्त</span>
                  <p className="text-xs text-charcoal-muted mt-0.5">पूर्ण ✓</p>
                </div>
                <div className="rounded-xl border border-paithani/30 bg-ivory-surface/90 p-2.5">
                  <span className="text-xs text-paithani font-bold">२. कोट पाठवला</span>
                  <p className="text-xs text-charcoal-muted mt-0.5">स्वीकृत ✓</p>
                </div>
                <div className="rounded-xl border border-paithani/30 bg-ivory-surface/90 p-2.5">
                  <span className="text-xs text-paithani font-bold">३. आगाऊ रक्कम</span>
                  <p className="text-xs text-paithani font-semibold mt-0.5">सुरक्षित एस्क्रो ✓</p>
                </div>
                <div className="rounded-xl border border-gold/40 bg-gold/15 p-2.5">
                  <span className="text-xs text-maroon font-bold">४. सेवा नियोजित</span>
                  <p className="text-xs text-maroon font-semibold mt-0.5">सक्रिय 🎯</p>
                </div>
              </div>

              {/* Financial Ledger Breakdown */}
              <div className="mt-6 rounded-2xl border border-gold/35 bg-ivory p-5 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-maroon mb-3">
                  ⚖️ डबल-एन्ट्री खातेवही वाटप (Ledger Breakdown)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl bg-ivory-surface p-3 border border-gold/25">
                    <p className="text-xs text-charcoal-muted">प्राप्त आगाऊ (Advance)</p>
                    <p className="font-display text-lg font-bold text-paithani mt-0.5">
                      {devRupees(booking.advancePaise)}
                    </p>
                    <span className="inline-block mt-1 text-xs text-paithani bg-paithani-soft px-2 py-0.5 rounded-full">
                      सुरक्षित एस्क्रो
                    </span>
                  </div>
                  <div className="rounded-xl bg-ivory-surface p-3 border border-gold/25">
                    <p className="text-xs text-charcoal-muted">प्लॅटफॉर्म कमिशन ({percent(commissionRate(lead.category))})</p>
                    <p className="font-display text-lg font-bold text-charcoal-soft mt-0.5">
                      {devRupees(booking.commissionPaise)}
                    </p>
                    <span className="inline-block mt-1 text-xs text-charcoal-muted bg-ivory-deep px-2 py-0.5 rounded-full">
                      पारदर्शक फी
                    </span>
                  </div>
                  <div className="rounded-xl bg-maroon-light p-3 border border-maroon/20">
                    <p className="text-xs text-maroon font-medium">विक्रेत्याची अंतिम देय रक्कम</p>
                    <p className="font-display text-lg font-bold text-maroon mt-0.5">
                      {devRupees(booking.totalPaise - booking.commissionPaise)}
                    </p>
                    <span className="inline-block mt-1 text-xs text-maroon font-bold bg-ivory-surface px-2 py-0.5 rounded-full">
                      कार्यक्रमानंतर थेट बँक खात्यात
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gold/20 flex flex-wrap items-center justify-between text-xs text-charcoal-muted">
                  <span>सुरक्षा हमी: कार्यक्रम संपन्न झाल्यानंतर ३ कामकाजाच्या दिवसांत NEFT/IMPS द्वारे वर्ग.</span>
                  <Link href="/vendor" className="font-semibold text-maroon hover:underline">
                    कॅलेंडरवर बुकिंग व्यवस्थापित करा →
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          {/* Customer Demand & Requirements Card */}
          <section className="surface-elevated p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-gold/25 pb-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-maroon/10 text-maroon text-lg">
                  📋
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-charcoal">ग्राहकाची मागणी व कार्यक्रम तपशील</h2>
                  <p className="text-xs text-charcoal-muted">थेट कुटुंबाकडून प्राप्त झालेली विनंती</p>
                </div>
              </div>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep border border-gold/30">
                स्रोत: {lead.source}
              </span>
            </div>

            {/* Quotation message */}
            <div className="mt-5 rounded-2xl border-l-4 border-gold-bright bg-ivory-deep/40 p-4 sm:p-5 shadow-2xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-maroon mb-1">
                ग्राहकाचा संदेश:
              </p>
              <p className="text-base text-charcoal font-medium leading-relaxed">
                “{lead.message}”
              </p>
            </div>

            {/* Detail Grid */}
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="rounded-xl border border-gold/25 bg-ivory p-3.5">
                <dt className="text-xs text-charcoal-muted">अपेक्षित बजेट</dt>
                <dd className="mt-1 font-display text-lg font-bold text-maroon">
                  {lead.budgetPaise ? devRupees(lead.budgetPaise) : 'उल्लेख नाही'}
                </dd>
              </div>
              <div className="rounded-xl border border-gold/25 bg-ivory p-3.5">
                <dt className="text-xs text-charcoal-muted">पाहुण्यांची संख्या</dt>
                <dd className="mt-1 font-display text-lg font-bold text-charcoal">
                  {lead.guestCount ? `${toDevanagariDigits(lead.guestCount)} पाहुणे` : '—'}
                </dd>
              </div>
              <div className="rounded-xl border border-gold/25 bg-ivory p-3.5">
                <dt className="text-xs text-charcoal-muted">कॅलेंडर उपलब्धता</dt>
                <dd className="mt-1 font-semibold text-paithani flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-paithani" />
                  <span>
                    {availability.length === 0
                      ? 'उपलब्ध (मुक्त दिवस)'
                      : availability.map((slot) => slot.status).join(', ')}
                  </span>
                </dd>
              </div>
              <div className="rounded-xl border border-gold/25 bg-ivory p-3.5">
                <dt className="text-xs text-charcoal-muted">नोंदणी तारीख</dt>
                <dd className="mt-1 font-medium text-charcoal text-xs">
                  {formatMarathiDateTime(lead.createdAt)}
                </dd>
              </div>
            </dl>

            {/* Quick WhatsApp Action */}
            <div className="mt-5 pt-4 border-t border-gold/20 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-charcoal-muted">
                कुटुंबाशी संपर्क साधण्यासाठी थेट संदेश पाठवा:
              </span>
              <a
                href={`https://api.whatsapp.com/send?phone=917709320496&text=${encodeURIComponent(`नमस्कार! माझी पत्रिका वरून सौ. पाटील व शिंदे कुटुंबाच्या कार्यक्रमासंदर्भात संपर्क करत आहे.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-paithani/40 bg-paithani-soft px-4 py-2 text-xs font-bold text-paithani hover:bg-paithani hover:text-ivory transition shadow-2xs"
              >
                <span>💬 WhatsApp वर चर्चा करा</span>
              </a>
            </div>
          </section>

          {/* Conversation & Messaging Thread */}
          <section className="surface-elevated p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-gold/25 pb-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gold/15 text-gold-deep text-lg">
                  💬
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-charcoal">ग्राहक संवाद व संदेश नोंद</h2>
                  <p className="text-xs text-charcoal-muted">सर्व संवाद ऑडिट लॉगमध्ये सुरक्षित नोंदवले जातात</p>
                </div>
              </div>
              <span className="text-xs text-charcoal-muted font-ui">
                {toDevanagariDigits(messages.length)} संदेश
              </span>
            </div>

            {/* Message Bubble List */}
            <ul className="mt-6 space-y-4 max-h-96 overflow-y-auto pr-1">
              {messages.map((message) => {
                const isVendor = message.sender === 'vendor';
                const isSystem = message.sender === 'system';
                return (
                  <li
                    key={message.id}
                    className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                        isVendor
                          ? 'bg-linear-to-br from-maroon via-maroon to-maroon-deep text-ivory border border-gold/30'
                          : isSystem
                            ? 'bg-ivory-deep border border-gold/30 text-charcoal text-xs'
                            : 'bg-ivory-surface border border-gold/35 text-charcoal'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs mb-1 opacity-80">
                        <span className="font-bold">
                          {isVendor ? '👤 तुम्ही (विक्रेता)' : isSystem ? '⚙️ प्रणाली सूचना' : '👨‍👩‍👧 ग्राहक'}
                        </span>
                        <span>{formatMarathiDateTime(message.createdAt)}</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{message.body}</p>
                    </div>
                  </li>
                );
              })}
              {messages.length === 0 ? (
                <li className="text-center py-6 text-sm text-charcoal-muted border border-dashed border-gold/30 rounded-2xl bg-ivory">
                  अजून कोणताही संदेश नाही. खालील फॉर्मद्वारे प्रथम उत्तर पाठवा.
                </li>
              ) : null}
            </ul>

            {/* Quick Reply Form */}
            <form
              action={async (formData: FormData) => {
                'use server';
                const { respondToLeadAction } = await import('@/app/vendor/actions');
                await respondToLeadAction(formData);
              }}
              className="mt-6 pt-5 border-t border-gold/25 space-y-3"
            >
              <input type="hidden" name="leadId" value={lead.id} />
              <label htmlFor="replyBody" className="block text-xs font-bold text-maroon uppercase tracking-wider">
                संदेश पाठवा:
              </label>
              <textarea
                id="replyBody"
                name="body"
                rows={3}
                required
                maxLength={800}
                placeholder="उदा. नमस्कार, ३१ जानेवारी २०२७ ही तारीख आमच्याकडे उपलब्ध आहे. आम्ही सर्वोत्तम सेवा देण्यास कटिबद्ध आहोत."
                className="w-full rounded-2xl border border-gold/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-gold/30"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-charcoal-muted">
                  उत्तर पाठवल्यास ग्राहकाला त्वरित ईमेल/एसएमएस सूचना जाईल.
                </span>
                <button
                  type="submit"
                  className="btn-base btn-maroon px-6 py-2.5 text-xs sm:text-sm font-semibold transition"
                >
                  उत्तर पाठवा ↵
                </button>
              </div>
            </form>
          </section>

          {/* Existing Sent Quotes List */}
          {quotes.length ? (
            <section className="surface-elevated p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-gold/25 pb-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-paithani/15 text-paithani text-lg">
                    📜
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-charcoal">पाठवलेले अधिकृत दरपत्रक (Quotes)</h2>
                    <p className="text-xs text-charcoal-muted">ग्राहकाला पाठवलेले कराराचे तपशील</p>
                  </div>
                </div>
              </div>

              <ul className="mt-5 space-y-5">
                {quotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="rounded-2xl border-2 border-gold/40 bg-linear-to-b from-ivory-surface to-ivory p-5 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold text-maroon">
                          कोट आवृत्ती #{toDevanagariDigits(quote.version)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            quote.status === 'accepted'
                              ? 'bg-paithani-soft text-paithani border border-paithani/30'
                              : 'bg-gold/20 text-gold-deep border border-gold/30'
                          }`}
                        >
                          {quote.status === 'accepted' ? 'स्वीकृत (Accepted) ✓' : quote.status}
                        </span>
                      </div>
                      <p className="font-display text-2xl font-bold text-maroon">{devRupees(quote.totalPaise)}</p>
                    </div>

                    <table className="mt-3 w-full text-sm">
                      <thead>
                        <tr className="border-b border-gold/20 text-xs font-bold text-charcoal-muted uppercase">
                          <th className="py-2 text-left">तपशील</th>
                          <th className="py-2 text-right">संख्या</th>
                          <th className="py-2 text-right">रक्कम</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item, index) => (
                          <tr key={`${quote.id}_${index}`} className="border-b border-gold/10">
                            <td className="py-2 text-charcoal font-medium">{item.label}</td>
                            <td className="py-2 text-right text-charcoal-muted">
                              {toDevanagariDigits(item.quantity)} {item.unit}
                            </td>
                            <td className="py-2 text-right font-semibold text-charcoal">
                              {devRupees(item.unitPricePaise * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ivory-deep/50 p-3 text-xs text-charcoal-muted">
                      <span>उप-एकूण: {devRupees(quote.subtotalPaise)} • GST (१८%): {devRupees(quote.gstPaise)}</span>
                      <span>वैधता: {formatMarathiDate(`${quote.validTill}T00:00:00Z`)} पर्यंत</span>
                    </div>

                    {quote.status === 'sent' ? (
                      <form
                        action={async (formData: FormData) => {
                          'use server';
                          const { acceptQuoteAsCustomerAction } = await import('@/app/vendor/actions');
                          await acceptQuoteAsCustomerAction(formData);
                        }}
                        className="mt-4 pt-3 border-t border-gold/20 flex justify-end"
                      >
                        <input type="hidden" name="quoteId" value={quote.id} />
                        <button
                          type="submit"
                          className="btn-base btn-gold px-5 py-2 text-xs font-bold transition shadow-xs"
                        >
                          ग्राहकाने स्वीकारले (डेमो स्वीकृती) → बुकिंग पूर्ण करा
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Sidebar: Quote Builder & Vendor Reliability Stats */}
        <aside className="space-y-6">
          <QuoteBuilder
            leadId={lead.id}
            category={lead.category}
            suggestedPricePaise={
              event && event.budgetTargetPaise > 0
                ? Math.min(lead.budgetPaise ?? event.budgetTargetPaise, event.budgetTargetPaise)
                : (lead.budgetPaise ?? vendor?.startingPricePaise ?? 5_000_000)
            }
          />

          {/* Vendor Trust & Standards Card */}
          <section className="surface-elevated p-6">
            <h3 className="font-display text-base font-bold text-maroon flex items-center gap-2">
              <span>🛡️</span>
              <span>प्लॅटफॉर्म विश्वास व नियम</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs text-charcoal-soft">
              <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                <span>विक्रेता रेटिंग</span>
                <span className="font-bold text-gold-deep">
                  ★ {toDevanagariDigits((vendor?.rating ?? 4.9).toFixed(1))} ({toDevanagariDigits(vendor?.reviewCount ?? 12)} परीक्षणे)
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                <span>यशस्वी बुकिंग</span>
                <strong className="text-charcoal font-semibold">
                  {toDevanagariDigits(vendor?.bookingsCompleted ?? 18)} कार्यक्रम
                </strong>
              </div>
              <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                <span>प्रतिसाद दर</span>
                <span className="font-bold text-paithani">
                  {percent(stats.total ? stats.responded / stats.total : 1)} वेळेत
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                <span>खाते योजना</span>
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold-deep border border-gold/30">
                  {vendor?.plan?.toUpperCase() ?? 'PRO'}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-ivory-deep/60 p-3 text-xs text-charcoal-muted leading-relaxed">
              💡 <strong>पारदर्शक व्यवहार हमी:</strong> कोट स्वीकारल्यावर ग्राहकाची आगाऊ रक्कम एस्क्रोमध्ये सुरक्षित ठेवली जाते. वाद उद्भवल्यास मध्यस्थी व २४ तासांत तोडगा.
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

