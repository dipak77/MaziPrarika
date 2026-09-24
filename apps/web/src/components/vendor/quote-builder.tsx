'use client';

import { useMemo, useState, useTransition } from 'react';

import { commissionRate, gatewayFeeBreakdown, priceQuote, type Quote } from '@mazi/commerce';
import { toDevanagariDigits } from '@mazi/marathi';

import { saveQuoteAction } from '@/app/vendor/actions';
import { percent } from '@/lib/format';

/**
 * Super-Class Line-Item Quote Builder.
 *
 * Shows what the customer pays and what the vendor takes home in real-time,
 * ensuring complete financial transparency and zero settlement surprises.
 */

interface Row {
  label: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

const TEMPLATES: Record<string, Row[]> = {
  photographer: [
    { label: 'मुख्य छायाचित्रण (कॅन्डिड + पारंपरिक)', quantity: '2', unit: 'दिवस', unitPrice: '45000' },
    { label: 'अल्बम ४० पाने (लेमिनेटेड)', quantity: '1', unit: 'नग', unitPrice: '22000' },
    { label: 'ड्रोन शॉट', quantity: '1', unit: 'नग', unitPrice: '11000' },
  ],
  caterer: [
    { label: 'भोजन — महाराष्ट्रीयन थाळी', quantity: '650', unit: 'थाळी', unitPrice: '520' },
    { label: 'स्वागत पेय व स्नॅक्स काउंटर', quantity: '1', unit: 'काउंटर', unitPrice: '18000' },
  ],
  decorator: [
    { label: 'मंडप व स्टेज सजावट', quantity: '1', unit: 'पॅकेज', unitPrice: '165000' },
    { label: 'फुलांची सजावट (मुख्य द्वार + हॉल)', quantity: '1', unit: 'पॅकेज', unitPrice: '68000' },
  ],
  printer: [
    { label: 'पत्रिका छपाई (मॅट ३०० जीएसएम, गोल्ड फॉइल)', quantity: '500', unit: 'कार्ड', unitPrice: '42' },
    { label: 'लिफाफा व मेणमुद्रा', quantity: '500', unit: 'नग', unitPrice: '9' },
  ],
  makeup: [{ label: 'नवरी मेकअप (हळदी + विवाह + रिसेप्शन)', quantity: '3', unit: 'लुक', unitPrice: '18000' }],
  priest: [
    { label: 'विवाह विधी व होमहवन', quantity: '1', unit: 'विधी', unitPrice: '21000' },
    { label: 'विधी साहित्य यादी व साहाय्य', quantity: '1', unit: 'पॅकेज', unitPrice: '6000' },
  ],
};

const rupees = (paise: number): string => `₹${toDevanagariDigits(Math.round(paise / 100).toLocaleString('en-IN'))}`;

export function QuoteBuilder({
  leadId,
  category,
  suggestedPricePaise,
}: {
  leadId: string;
  category: string;
  suggestedPricePaise: number;
}) {
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(
    TEMPLATES[category] ?? [
      { label: '', quantity: '1', unit: 'नग', unitPrice: String(Math.round(suggestedPricePaise / 100)) },
    ],
  );
  const [discount, setDiscount] = useState('0');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const totals = useMemo(() => {
    const items = rows
      .filter(
        (row) =>
          row.label.trim().length > 0 && (Number(row.quantity) || 0) > 0 && (Number(row.unitPrice) || 0) > 0,
      )
      .map((row) => ({
        label: row.label.trim(),
        quantity: Number(row.quantity) || 0,
        unit: row.unit || 'नग',
        unitPricePaise: Math.round((Number(row.unitPrice) || 0) * 100),
        optional: false,
      }));
    const breakdown = priceQuote({
      id: 'preview',
      vendorId: 'preview',
      category: category as Quote['category'],
      items,
      discountPaise: Math.max(0, Math.round((Number(discount) || 0) * 100)),
      validTill: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
      status: 'draft',
    });
    const gateway = gatewayFeeBreakdown(breakdown.taxablePaise);
    const gatewayTotalPaise = gateway.totalPaise;
    const payoutPaise = Math.max(
      0,
      breakdown.customerTotalPaise - breakdown.commissionPaise - gatewayTotalPaise,
    );
    return {
      subtotalPaise: breakdown.subtotalPaise,
      discountPaise: breakdown.discountPaise,
      taxablePaise: breakdown.taxablePaise,
      gstPaise: breakdown.gstPaise,
      totalPaise: breakdown.customerTotalPaise,
      commissionPaise: breakdown.commissionPaise,
      gatewayPaise: gatewayTotalPaise,
      payoutPaise,
      rate: commissionRate(category),
    };
  }, [rows, discount, category]);

  const shareParts = [
    { label: 'विक्रेता मिळकत', value: Math.max(0, totals.taxablePaise - totals.commissionPaise), className: 'bg-paithani' },
    { label: 'GST', value: totals.gstPaise, className: 'bg-maroon' },
    { label: 'प्लॅटफॉर्म कमिशन', value: totals.commissionPaise, className: 'bg-gold-bright' },
    { label: 'गेटवे शुल्क', value: totals.gatewayPaise, className: 'bg-charcoal-muted' },
  ];
  const shareTotal = shareParts.reduce((sum, part) => sum + part.value, 0) || 1;

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((current) => current.filter((_, i) => i !== index));
  };

  return (
    <section className="surface-elevated p-6 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-gold/25 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-gold/15 text-gold-deep text-base">
            ✍️
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-charcoal">कोट तयार करा (Quote Builder)</h2>
            <p className="text-[0.72rem] text-charcoal-muted">पारदर्शक ओळी-वार दर व थेट नफा हिशोब</p>
          </div>
        </div>
        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.68rem] font-bold text-maroon border border-gold/30">
          GST १८%
        </span>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            try {
              await saveQuoteAction(formData);
              setNotice({ kind: 'success', text: '✓ कोट यशस्वीरीत्या पाठवला! ग्राहकाला सूचना दिली गेली.' });
            } catch (error) {
              setNotice({
                kind: 'error',
                text: error instanceof Error ? error.message : 'कोट पाठवता आला नाही.',
              });
            }
          });
        }}
        className="mt-5 space-y-4"
      >
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="discount" value={discount} />

        {/* Item Rows */}
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gold/30 bg-ivory p-3.5 shadow-2xs transition hover:border-gold/60"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  name="label"
                  value={row.label}
                  onChange={(event) => update(index, { label: event.target.value })}
                  placeholder="वस्तू / सेवेचे नाव (उदा. अल्बम, स्टेज सजावट)"
                  required
                  className="w-full rounded-xl border border-gold/35 bg-ivory px-3 py-1.5 text-xs sm:text-sm font-medium text-charcoal outline-none focus:border-maroon focus:ring-1 focus:ring-maroon/20"
                />
                {rows.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="size-7 shrink-0 grid place-items-center rounded-lg text-charcoal-muted hover:bg-maroon-light hover:text-maroon text-xs"
                    title="ओळ काढा"
                  >
                    ✕
                  </button>
                ) : null}
              </div>

              <div className="mt-2.5 grid grid-cols-3 gap-2">
                <label className="text-xs font-medium text-charcoal-muted">
                  <span>प्रमाण</span>
                  <input
                    name="quantity"
                    inputMode="decimal"
                    value={row.quantity}
                    onChange={(event) => update(index, { quantity: event.target.value })}
                    required
                    className="mt-0.5 w-full rounded-lg border border-gold/35 bg-ivory px-2.5 py-1 text-xs sm:text-sm font-semibold text-charcoal outline-none focus:border-maroon"
                  />
                </label>
                <label className="text-xs font-medium text-charcoal-muted">
                  <span>एकक (Unit)</span>
                  <input
                    name="unit"
                    value={row.unit}
                    onChange={(event) => update(index, { unit: event.target.value })}
                    required
                    className="mt-0.5 w-full rounded-lg border border-gold/35 bg-ivory px-2.5 py-1 text-xs sm:text-sm font-medium text-charcoal outline-none focus:border-maroon"
                  />
                </label>
                <label className="text-xs font-medium text-charcoal-muted">
                  <span>दर प्रति एकक (₹)</span>
                  <input
                    name="unitPrice"
                    inputMode="decimal"
                    value={row.unitPrice}
                    onChange={(event) => update(index, { unitPrice: event.target.value })}
                    required
                    className="mt-0.5 w-full rounded-lg border border-gold/35 bg-ivory px-2.5 py-1 text-xs sm:text-sm font-bold text-maroon outline-none focus:border-maroon"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons: Add Item & Discount */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setRows((current) => [...current, { label: '', quantity: '1', unit: 'नग', unitPrice: '' }])}
            className="flex-1 rounded-xl border border-gold/45 bg-ivory py-2 text-xs font-bold text-charcoal-soft hover:bg-gold/15 transition shadow-2xs"
          >
            + नवीन ओळ जोडा
          </button>
          <label className="flex-1 text-xs font-medium text-charcoal-muted">
            <span className="block mb-0.5">सूट / डिस्काउंट (₹)</span>
            <input
              inputMode="numeric"
              value={discount}
              placeholder="0"
              onChange={(event) => setDiscount(event.target.value.replace(/[^0-9]/g, ''))}
              className="w-full rounded-xl border border-gold/40 bg-ivory px-3 py-1.5 text-xs font-semibold text-charcoal outline-none focus:border-maroon"
            />
          </label>
        </div>

        {/* Visual Revenue Share Bar */}
        <div className="rounded-xl border border-gold/25 bg-ivory-deep/40 p-3">
          <div className="flex items-center justify-between text-[0.72rem] font-bold text-charcoal-muted mb-1.5">
            <span>रक्कम विभागणी अंदाज</span>
            <span className="text-paithani">विक्रेता नफा: ~{percent(totals.totalPaise ? totals.payoutPaise / totals.totalPaise : 0.85)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-deep flex">
            {shareParts.map((part) => (
              <div
                key={part.label}
                style={{ width: `${(part.value / shareTotal) * 100}%` }}
                className={part.className}
                title={part.label}
              />
            ))}
          </div>
        </div>

        {/* Calculation Table Card */}
        <dl className="space-y-1.5 rounded-2xl border border-gold/35 bg-linear-to-b from-ivory-surface to-ivory p-4 text-xs shadow-2xs">
          <div className="flex justify-between text-charcoal-muted">
            <dt>एकूण सेवा मूल्य (Subtotal)</dt>
            <dd className="font-semibold text-charcoal">{rupees(totals.subtotalPaise)}</dd>
          </div>
          {totals.discountPaise > 0 ? (
            <div className="flex justify-between text-paithani font-medium">
              <dt>सूट (Discount)</dt>
              <dd>−{rupees(totals.discountPaise)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between text-charcoal-muted">
            <dt>GST (१८% कर)</dt>
            <dd className="font-semibold text-charcoal">{rupees(totals.gstPaise)}</dd>
          </div>
          <div className="flex justify-between border-t border-gold/30 pt-2 text-sm font-bold">
            <dt className="text-charcoal">ग्राहकाचे देयक (Total)</dt>
            <dd className="font-display text-lg text-maroon">{rupees(totals.totalPaise)}</dd>
          </div>
          <div className="flex justify-between border-t border-gold/20 pt-2 text-[0.72rem] text-charcoal-muted">
            <dt>प्लॅटफॉर्म कमिशन ({percent(totals.rate)})</dt>
            <dd className="font-medium text-charcoal">−{rupees(totals.commissionPaise)}</dd>
          </div>
          <div className="flex justify-between text-[0.72rem] text-charcoal-muted">
            <dt>गेटवे हाताळणी शुल्क</dt>
            <dd className="font-medium text-charcoal">−{rupees(totals.gatewayPaise)}</dd>
          </div>
          <div className="flex justify-between border-t-2 border-paithani/40 pt-2 text-xs font-bold bg-paithani-soft/40 -mx-4 -mb-4 p-3 rounded-b-2xl">
            <dt className="text-paithani">तुमची थेट देय रक्कम (Net Payout)</dt>
            <dd className="font-display text-base text-paithani">{rupees(totals.payoutPaise)}</dd>
          </div>
        </dl>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={pending}
          className="btn-base btn-maroon w-full py-3.5 text-sm shadow-md"
        >
          {pending ? 'कोट तयार होत आहे…' : 'ग्राहकाला अधिकृत कोट पाठवा ↵'}
        </button>

        {notice ? (
          <div
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className={
              notice.kind === 'error'
                ? 'rounded-xl border border-maroon/40 bg-maroon-light p-2.5 text-center text-xs font-semibold text-maroon'
                : 'rounded-xl border border-paithani/40 bg-paithani-soft p-2.5 text-center text-xs font-semibold text-paithani'
            }
          >
            {notice.text}
          </div>
        ) : null}

        <p className="text-center text-[0.7rem] text-charcoal-muted">
          कोट ७ दिवस वैध राहील. स्वीकारल्यानंतर कॅलेंडरवर दिवस आपोआप बुक केला जाईल.
        </p>
      </form>
    </section>
  );
}
