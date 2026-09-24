'use client';

import { useMemo, useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

import { saveQuoteAction } from '@/app/vendor/actions';

/**
 * Line-item quote builder.
 *
 * Two numbers are shown side by side on every keystroke: what the customer pays
 * and what the vendor takes home. Vendors on other platforms discover the
 * commission *after* the event; here it is part of writing the quote, which is
 * the only honest way to run a take-rate business.
 */

interface Row {
  label: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

const GST = 0.18;
const GATEWAY = 0.0236;
const GATEWAY_GST = 0.18;

const TEMPLATES: Record<string, Row[]> = {
  photographer: [
    { label: 'मुख्य छायाचित्रण (कॅन्डिड + पारंपरिक)', quantity: '2', unit: 'दिवस', unitPrice: '45000' },
    { label: 'अल्बम ४० पाने (लेमिनेटेड)', quantity: '1', unit: 'नग', unitPrice: '22000' },
    { label: 'ड्रोन शॉट', quantity: '1', unit: 'नग', unitPrice: '11000' },
  ],
  caterer: [
    { label: 'भोजन — महाराष्ट्रीयन थाळी', quantity: '650', unit: 'ताळी', unitPrice: '520' },
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
  takeRateHint,
  commissionLabel,
}: {
  leadId: string;
  category: string;
  suggestedPricePaise: number;
  takeRateHint: number;
  commissionLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>(
    TEMPLATES[category] ?? [
      { label: '', quantity: '1', unit: 'नग', unitPrice: String(Math.round(suggestedPricePaise / 100)) },
    ],
  );
  const [discount, setDiscount] = useState('0');
  const [message, setMessage] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotalPaise = rows.reduce(
      (sum, row) => sum + Math.round((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0) * 100),
      0,
    );
    const discountPaise = Math.round((Number(discount) || 0) * 100);
    const taxable = Math.max(0, subtotalPaise - discountPaise);
    const gstPaise = Math.round(taxable * GST);
    const totalPaise = taxable + gstPaise;
    const commissionPaise = Math.round(taxable * (commissionLabel === '१२%' ? 0.12 : 0.1));
    const gatewayPaise = Math.round(totalPaise * GATEWAY * (1 + GATEWAY_GST));
    const payoutPaise = Math.max(0, totalPaise - commissionPaise - gatewayPaise);
    return { subtotalPaise, discountPaise, gstPaise, totalPaise, commissionPaise, gatewayPaise, payoutPaise };
  }, [rows, discount, commissionLabel]);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <section className="surface p-5">
      <h2 className="font-display text-lg font-bold text-charcoal">कोट तयार करा</h2>
      <p className="mt-1 text-xs text-charcoal-soft">
        ओळी-वार दर द्या — ग्राहकाला काय मिळेल ते स्पष्ट दिसते, आणि नंतर वाद होत नाही.
      </p>

      <form
        action={(formData) => {
          startTransition(async () => {
            try {
              await saveQuoteAction(formData);
              setMessage('कोट पाठवला — ग्राहकाला विनंती स्थिती अद्ययावत झाली.');
            } catch (error) {
              setMessage(error instanceof Error ? error.message : 'कोट पाठवता आला नाही.');
            }
          });
        }}
        className="mt-4 space-y-3"
      >
        <input type="hidden" name="leadId" value={leadId} />
        <input type="hidden" name="discount" value={discount} />

        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-gold/25 bg-ivory p-3">
            <input
              name="label"
              value={row.label}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder="वस्तू / सेवा"
              className="w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5 text-sm outline-none focus:border-maroon"
            />
            <div className="mt-2 grid grid-cols-3 gap-2">
              <label className="text-[11px]">
                <span className="text-charcoal-soft">प्रमाण</span>
                <input
                  name="quantity"
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(event) => update(index, { quantity: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-[11px]">
                <span className="text-charcoal-soft">एकक</span>
                <input
                  name="unit"
                  value={row.unit}
                  onChange={(event) => update(index, { unit: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5 text-sm"
                />
              </label>
              <label className="text-[11px]">
                <span className="text-charcoal-soft">दर (₹)</span>
                <input
                  name="unitPrice"
                  inputMode="decimal"
                  value={row.unitPrice}
                  onChange={(event) => update(index, { unitPrice: event.target.value })}
                  className="mt-0.5 w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5 text-sm"
                />
              </label>
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRows((current) => [...current, { label: '', quantity: '1', unit: 'नग', unitPrice: '' }])}
            className="flex-1 rounded-lg border border-gold/50 px-3 py-2 text-xs font-semibold text-charcoal-soft"
          >
            + ओळ जोडा
          </button>
          <label className="flex-1 text-[11px]">
            <span className="text-charcoal-soft">सूट (₹)</span>
            <input
              inputMode="numeric"
              value={discount}
              onChange={(event) => setDiscount(event.target.value.replace(/[^0-9]/g, ''))}
              className="mt-0.5 w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        <dl className="space-y-1 rounded-xl border border-gold/30 bg-ivory-deep/40 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">उप-एकूण</dt>
            <dd className="text-charcoal">{rupees(totals.subtotalPaise)}</dd>
          </div>
          {totals.discountPaise > 0 ? (
            <div className="flex justify-between">
              <dt className="text-charcoal-soft">सूट</dt>
              <dd className="text-charcoal">−{rupees(totals.discountPaise)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">GST १८%</dt>
            <dd className="text-charcoal">{rupees(totals.gstPaise)}</dd>
          </div>
          <div className="flex justify-between border-t border-gold/30 pt-1.5">
            <dt className="font-semibold text-charcoal">ग्राहक देय</dt>
            <dd className="font-display text-lg font-bold text-maroon">{rupees(totals.totalPaise)}</dd>
          </div>
          <div className="flex justify-between border-t border-gold/30 pt-1.5">
            <dt className="text-charcoal-soft">प्लॅटफॉर्म कमिशन ({commissionLabel})</dt>
            <dd className="text-charcoal">−{rupees(totals.commissionPaise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-charcoal-soft">गेटवे शुल्क (अंदाजे)</dt>
            <dd className="text-charcoal">−{rupees(totals.gatewayPaise)}</dd>
          </div>
          <div className="flex justify-between border-t border-gold/30 pt-1.5">
            <dt className="font-semibold text-charcoal">तुमची देय रक्कम</dt>
            <dd className="font-display text-lg font-bold text-paithani">{rupees(totals.payoutPaise)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-maroon px-5 py-3 font-semibold text-ivory shadow-soft disabled:opacity-60"
        >
          {pending ? 'पाठवत आहे…' : 'कोट पाठवा'}
        </button>
        {message ? <p className="text-xs text-paithani">{message}</p> : null}
        <p className="text-[11px] text-charcoal-soft">
          कोट ७ दिवसांसाठी वैध. ग्राहकाने स्वीकारल्यावर तारीख राखीव होते आणि आगाऊ रकमेनंतर बुकिंग निश्चित.
          {takeRateHint > 0 ? ` (सूचना: या कार्यक्रमासाठी सरासरी कमिशन ${rupees(takeRateHint)})` : ''}
        </p>
      </form>
    </section>
  );
}
