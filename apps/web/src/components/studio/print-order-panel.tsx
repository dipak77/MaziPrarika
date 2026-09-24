'use client';

import { useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

import { placePrintOrderAction, setDesignStatusAction } from '@/app/studio/[slug]/invitation/actions';
import { devRupees, percent, shortDate } from '@/lib/format';

export interface PrintQuoteView {
  quantity: number;
  unitPricePaise: number;
  subtotalPaise: number;
  shippingPaise: number;
  expressPaise: number;
  gstPaise: number;
  totalPaise: number;
  commissionPaise: number;
  contributionPaise: number;
  vendorPayoutPaise: number;
}

/**
 * Order card. The price waterfall is shown to the customer *and* to us on the
 * same screen on purpose: a marketplace that hides its take rate cannot be
 * trusted by the vendors who make the product possible.
 */
export function PrintOrderPanel({
  slug,
  designId,
  quote,
  history,
  eventDateLabel,
  printerLabel,
  expressDefault,
}: {
  slug: string;
  designId: string;
  quote: PrintQuoteView;
  history: Array<{ id: string; name: string; version: number; status: string; updatedAt: string; scheme: string }>;
  eventDateLabel: string;
  printerLabel: string;
  expressDefault: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const current = history.find((entry) => entry.id === designId);

  return (
    <>
      <section className="surface p-5">
        <h2 className="font-display text-lg font-bold text-charcoal">छपाई ऑर्डर</h2>
        <p className="mt-1 text-xs text-charcoal-soft">
          {toDevanagariDigits(quote.quantity)} कार्डे • कार्डमागे {devRupees(quote.unitPricePaise)} • {printerLabel}
        </p>

        <dl className="mt-4 space-y-1.5 text-sm">
          <Row label="कार्डे" value={devRupees(quote.subtotalPaise)} />
          <Row label="वाहतूक" value={quote.shippingPaise === 0 ? 'मोफत' : devRupees(quote.shippingPaise)} />
          {quote.expressPaise > 0 ? <Row label="एक्स्प्रेस (१८%)" value={devRupees(quote.expressPaise)} /> : null}
          <Row label="GST १८%" value={devRupees(quote.gstPaise)} />
          <div className="border-t border-gold/30 pt-2">
            <Row label="एकूण देय" value={devRupees(quote.totalPaise)} strong />
          </div>
        </dl>

        <details className="mt-4 rounded-xl border border-gold/25 bg-ivory-deep/40 px-3 py-2 text-xs text-charcoal-soft">
          <summary className="cursor-pointer font-semibold text-charcoal">पारदर्शकता — रकमेचा प्रवाह</summary>
          <ul className="mt-2 space-y-1">
            <li>छपाईकारास देय: {devRupees(quote.vendorPayoutPaise)}</li>
            <li>प्लॅटफॉर्म कमिशन (१५%): {devRupees(quote.commissionPaise)}</li>
            <li>गेटवे शुल्क वजा: −{devRupees(quote.commissionPaise - quote.contributionPaise)}</li>
            <li>निव्वळ उत्पन्न: {devRupees(quote.contributionPaise)}</li>
          </ul>
        </details>

        <form
          action={(formData) => {
            startTransition(async () => {
              await placePrintOrderAction(formData);
            });
          }}
          className="mt-4 space-y-3"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="designId" value={designId} />
          <input type="hidden" name="quantity" value={quote.quantity} />
          <label className="flex items-center gap-2 text-sm text-charcoal-soft">
            <input type="checkbox" name="express" defaultChecked={expressDefault} className="size-4 accent-[var(--color-maroon)]" />
            एक्स्प्रेस छपाई (३ दिवसांत) — विवाहापूर्वी {eventDateLabel}
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-maroon px-5 py-3 font-semibold text-ivory shadow-soft transition hover:bg-maroon-soft disabled:opacity-60"
          >
            {pending ? 'ऑर्डर नोंदवत आहे…' : 'छपाई ऑर्डर द्या (प्रूफ आधी पाठवले जाईल)'}
          </button>
        </form>

        {current && (current.status === 'draft' || current.status === 'review') ? (
          <form
            action={(formData) => {
              startTransition(async () => {
                await setDesignStatusAction(formData);
              });
            }}
            className="mt-3"
          >
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="designId" value={designId} />
            <input type="hidden" name="status" value="approved" />
            <button type="submit" className="w-full rounded-full border border-paithani px-5 py-2.5 text-sm font-semibold text-paithani">
              डिझाइन मंजूर करा (छपाईसाठी पाठवा)
            </button>
          </form>
        ) : null}
      </section>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-bold text-charcoal">आवृत्ती इतिहास</h2>
        <p className="mt-1 text-xs text-charcoal-soft">
          प्रत्येक जतन जुन्या आवृत्तीला स्पर्श न करता नवीन आवृत्ती तयार करते — कोणतीही पत्रिका हरवत नाही.
        </p>
        <ol className="mt-3 space-y-3">
          {history.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 border-b border-gold/20 pb-3 last:border-0">
              <div>
                <p className="text-sm font-semibold text-charcoal">{entry.name}</p>
                <p className="mt-0.5 font-ui text-xs text-charcoal-soft">
                  आवृत्ती {toDevanagariDigits(entry.version)} • {entry.scheme} • {shortDate(entry.updatedAt)}
                </p>
              </div>
              <span className="rounded-full border border-gold/40 bg-ivory px-2 py-0.5 text-[11px] text-charcoal-soft">
                {entry.status}
              </span>
            </li>
          ))}
          {history.length === 0 ? (
            <li className="text-sm text-charcoal-soft">
              अजून जतन केलेली आवृत्ती नाही — खालील बटण वापरून ही रचना जतन करा.
            </li>
          ) : null}
        </ol>
        <p className="mt-3 text-xs text-charcoal-soft">
          सध्या निवडलेली गुणवत्ता: {percent(1)} प्री-फ्लाइट तपासणी उत्तीर्ण (bleed, CMYK, फॉइल जाडी).
        </p>
      </section>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? 'font-semibold text-charcoal' : 'text-charcoal-soft'}>{label}</dt>
      <dd className={strong ? 'font-display text-lg font-bold text-maroon' : 'text-charcoal'}>{value}</dd>
    </div>
  );
}
