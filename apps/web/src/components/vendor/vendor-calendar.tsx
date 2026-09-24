'use client';

import { useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

import { setVacationAction } from '@/app/vendor/actions';

/**
 * Calendar control.
 *
 * A photographer blocks a date in ten seconds, from the car, between shoots.
 * Anything more elaborate than that does not get used — which is exactly why
 * real vendor calendars go stale, and why we surface freshness as a trust signal
 * instead of pretending it does not happen.
 */
export function VendorCalendar({
  vendorId,
  bookings,
}: {
  vendorId: string;
  bookings: Array<{ id: string; eventDate: string; state: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'blocked' | 'available'>('blocked');

  return (
    <section className="surface p-5">
      <h2 className="font-display text-lg font-bold text-charcoal">कॅलेंडर</h2>
      <p className="mt-1 text-xs text-charcoal-soft">
        {toDevanagariDigits(bookings.length)} आगामी बुकिंग. तारखा राखीव ठेवल्यास ग्राहकांना ते लगेच दिसते.
      </p>

      <ul className="mt-3 space-y-2">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="flex items-center justify-between rounded-xl border border-paithani/35 bg-paithani/8 px-3 py-2 text-sm"
          >
            <span className="font-semibold text-charcoal">{booking.eventDate}</span>
            <span className="text-xs text-charcoal-soft">{booking.state}</span>
          </li>
        ))}
        {bookings.length === 0 ? <li className="text-sm text-charcoal-soft">आगामी बुकिंग नाही.</li> : null}
      </ul>

      <form
        action={(formData) => {
          startTransition(async () => {
            try {
              await setVacationAction(formData);
              setMessage(status === 'blocked' ? 'तारखा राखीव ठेवल्या.' : 'तारखा उपलब्ध केल्या.');
            } catch (error) {
              setMessage(error instanceof Error ? error.message : 'अद्ययावत करता आले नाही.');
            }
          });
        }}
        className="mt-4 space-y-2"
      >
        <input type="hidden" name="vendorId" value={vendorId} />
        <input type="hidden" name="status" value={status} />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs">
            <span className="font-ui uppercase tracking-wider text-charcoal-soft">पासून</span>
            <input type="date" name="from" required className="mt-1 w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5" />
          </label>
          <label className="text-xs">
            <span className="font-ui uppercase tracking-wider text-charcoal-soft">पर्यंत</span>
            <input type="date" name="to" required className="mt-1 w-full rounded-lg border border-gold/40 bg-ivory px-2 py-1.5" />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus('blocked')}
            className={
              status === 'blocked'
                ? 'flex-1 rounded-lg bg-maroon px-3 py-2 text-xs font-semibold text-ivory'
                : 'flex-1 rounded-lg border border-gold/40 px-3 py-2 text-xs text-charcoal-soft'
            }
          >
            राखीव ठेवा
          </button>
          <button
            type="button"
            onClick={() => setStatus('available')}
            className={
              status === 'available'
                ? 'flex-1 rounded-lg bg-paithani px-3 py-2 text-xs font-semibold text-ivory'
                : 'flex-1 rounded-lg border border-gold/40 px-3 py-2 text-xs text-charcoal-soft'
            }
          >
            उपलब्ध करा
          </button>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-charcoal px-4 py-2.5 text-xs font-semibold text-ivory disabled:opacity-60"
        >
          {pending ? 'जतन करत आहे…' : 'कॅलेंडर अद्ययावत करा'}
        </button>
        <p className="text-[11px] text-charcoal-soft">
          अद्ययावत केल्याची नोंद प्रोफाइलवर «कॅलेंडर आज अद्ययावत» अशी दिसते — ताजे कॅलेंडर जास्त विनंत्या मिळवते.
        </p>
      </form>
      {message ? <p className="mt-2 text-xs text-paithani">{message}</p> : null}
    </section>
  );
}
