import Link from 'next/link';
import { notFound } from 'next/navigation';

import { priceQuote, type Quote } from '@mazi/commerce';
import { formatMarathiDate, formatMarathiDateTime, leadStatusLabel, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { QuoteBuilder } from '@/components/vendor/quote-builder';
import { getStore } from '@/lib/store';
import { devRupees, percent } from '@/lib/format';

export const dynamic = 'force-dynamic';

/**
 * One enquiry, worked end to end.
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

  const sampleQuote: Quote | null = event
    ? {
        id: 'preview',
        vendorId: lead.vendorId,
        category: (lead.category as Quote['category']) ?? 'other',
        items: [
          {
            label: `${vendorCategoryLabel(lead.category)} — मुख्य पॅकेज`,
            quantity: 1,
            unit: 'पॅकेज',
            unitPricePaise: vendor?.startingPricePaise ?? 5_000_000,
            optional: false,
          },
        ],
        discountPaise: 0,
        validTill: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
        status: 'draft',
      }
    : null;
  const previewWaterfall = sampleQuote ? priceQuote(sampleQuote) : null;

  return (
    <div className="shell py-10">
      <nav aria-label="ब्रेडक्रम्ब" className="font-ui text-xs text-charcoal-soft">
        <Link href="/vendor" className="underline decoration-gold underline-offset-4">
          विक्रेता डेस्क
        </Link>{' '}
        / विनंती
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">{vendorCategoryLabel(lead.category)}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-maroon">{event?.title ?? 'कार्यक्रम विनंती'}</h1>
          <p className="mt-2 text-charcoal-soft">
            {lead.eventDate ? formatMarathiDate(lead.eventDate) : 'तारीख ठरलेली नाही'}
            {lead.guestCount ? ` • ${toDevanagariDigits(lead.guestCount)} पाहुणे` : ''}
            {event ? ` • ${event.city}` : ''}
          </p>
        </div>
        <div className="text-right">
          <span className="rounded-full border border-gold/45 bg-gold/10 px-3 py-1 text-xs text-charcoal">
            {leadStatusLabel(lead.status)}
          </span>
          <p className="mt-2 text-xs text-charcoal-soft">
            प्रतिसाद मुदत {formatMarathiDateTime(lead.responseDueAt)}
          </p>
          <p className="text-xs text-charcoal-soft">
            तुमचा SLA: {percent(stats.slaRate)} • मध्यम {toDevanagariDigits(stats.medianMinutes)} मिनिटे
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">ग्राहकाची मागणी</h2>
            <p className="mt-2 rounded-xl border border-gold/25 bg-ivory px-4 py-3 text-sm text-charcoal">{lead.message}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-charcoal-soft">बजेट</dt>
                <dd className="font-semibold text-maroon">{lead.budgetPaise ? devRupees(lead.budgetPaise) : 'सांगितलेले नाही'}</dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">स्रोत</dt>
                <dd className="text-charcoal">{lead.source}{lead.sponsored ? ' (प्रायोजित)' : ''}</dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">तारखेची स्थिती</dt>
                <dd className="text-charcoal">
                  {availability.length === 0
                    ? 'उपलब्ध (नोंद नाही)'
                    : availability.map((slot) => slot.status).join(', ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">विनंती आली</dt>
                <dd className="text-charcoal">{formatMarathiDateTime(lead.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">संवाद</h2>
            <ul className="mt-3 space-y-3">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={
                    message.sender === 'vendor'
                      ? 'ml-6 rounded-xl border border-maroon/25 bg-maroon/5 px-4 py-2'
                      : 'mr-6 rounded-xl border border-gold/25 bg-ivory px-4 py-2'
                  }
                >
                  <p className="text-xs text-charcoal-soft">
                    {message.sender === 'vendor' ? 'तुम्ही' : message.sender === 'customer' ? 'ग्राहक' : 'सिस्टम'} •{' '}
                    {formatMarathiDateTime(message.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-charcoal">{message.body}</p>
                </li>
              ))}
              {messages.length === 0 ? <li className="text-sm text-charcoal-soft">अजून संवाद नाही.</li> : null}
            </ul>

            <form action={async (formData: FormData) => {
              'use server';
              const { respondToLeadAction } = await import('@/app/vendor/actions');
              await respondToLeadAction(formData);
            }} className="mt-4 space-y-2">
              <input type="hidden" name="leadId" value={lead.id} />
              <textarea
                name="body"
                rows={3}
                required
                maxLength={800}
                placeholder="उत्तर लिहा — उदा. हो, तारीख उपलब्ध आहे. कॅन्डिड पॅकेजचे दर पाठवत आहे."
                className="w-full rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm outline-none focus:border-maroon"
              />
              <button type="submit" className="rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-ivory">
                उत्तर पाठवा
              </button>
            </form>
          </section>

          {quotes.length ? (
            <section className="surface p-5">
              <h2 className="font-display text-xl font-bold text-charcoal">पाठवलेले कोट</h2>
              <ul className="mt-3 space-y-4">
                {quotes.map((quote) => (
                  <li key={quote.id} className="rounded-xl border border-gold/25 bg-ivory p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-charcoal">
                        कोट {toDevanagariDigits(quote.version)} • {quote.status}
                      </p>
                      <p className="font-display text-lg font-bold text-maroon">{devRupees(quote.totalPaise)}</p>
                    </div>
                    <table className="mt-2 w-full text-sm">
                      <tbody>
                        {quote.items.map((item, index) => (
                          <tr key={`${quote.id}_${index}`} className="border-b border-gold/15">
                            <td className="py-1 text-charcoal">{item.label}</td>
                            <td className="py-1 text-right text-charcoal-soft">
                              {toDevanagariDigits(item.quantity)} {item.unit}
                            </td>
                            <td className="py-1 text-right text-charcoal">{devRupees(item.unitPricePaise * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-2 text-xs text-charcoal-soft">
                      उप-एकूण {devRupees(quote.subtotalPaise)} • GST {devRupees(quote.gstPaise)} • वैधता {formatMarathiDate(`${quote.validTill}T00:00:00Z`)}
                    </p>
                    {quote.status === 'sent' ? (
                      <form action={async (formData: FormData) => {
                        'use server';
                        const { acceptQuoteAsCustomerAction } = await import('@/app/vendor/actions');
                        await acceptQuoteAsCustomerAction(formData);
                      }} className="mt-3">
                        <input type="hidden" name="quoteId" value={quote.id} />
                        <button type="submit" className="rounded-full border border-paithani px-4 py-2 text-xs font-semibold text-paithani">
                          ग्राहकाने स्वीकारले (डेमो) → बुकिंग तयार करा
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {booking ? (
            <section className="surface p-5">
              <h2 className="font-display text-xl font-bold text-charcoal">बुकिंग</h2>
              <p className="mt-2 text-sm text-charcoal">
                स्थिती {booking.state} • एकूण {devRupees(booking.totalPaise)} • आगाऊ {devRupees(booking.advancePaise)}
              </p>
              <p className="mt-1 text-xs text-charcoal-soft">
                कमिशन {devRupees(booking.commissionPaise)} • सेवा पूर्ण झाल्यावर सेटलमेंट दिले जाते
              </p>
              <Link href="/vendor" className="mt-3 inline-block text-sm font-semibold text-maroon">
                कॅलेंडरवर पाहा →
              </Link>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <QuoteBuilder
            leadId={lead.id}
            category={lead.category}
            suggestedPricePaise={
              event && event.budgetTargetPaise > 0
                ? Math.min(lead.budgetPaise ?? event.budgetTargetPaise, event.budgetTargetPaise)
                : (lead.budgetPaise ?? vendor?.startingPricePaise ?? 5_000_000)
            }
            takeRateHint={previewWaterfall ? previewWaterfall.commissionPaise : 0}
            commissionLabel="१२%"
          />

          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">विक्रेता माहिती</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-charcoal-soft">
              <li>• रेटिंग ★ {toDevanagariDigits((vendor?.rating ?? 0).toFixed(1))} ({toDevanagariDigits(vendor?.reviewCount ?? 0)})</li>
              <li>• पूर्ण बुकिंग {toDevanagariDigits(vendor?.bookingsCompleted ?? 0)}</li>
              <li>• प्रतिसाद दर {percent(stats.total ? stats.responded / stats.total : 0)}</li>
              <li>• योजना {vendor?.plan ?? 'free'}</li>
            </ul>
            <p className="mt-3 text-xs text-charcoal-soft">
              कोट स्वीकारल्यावर ग्राहकाची आगाऊ रक्कम आमच्या लेजरमध्ये नोंदली जाते; सेटलमेंट सेवा पूर्ण झाल्यावर आणि तक्रार
              नसल्यास ३ कामकाजाच्या दिवसांत.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
