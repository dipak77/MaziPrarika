'use client';

import { useState, useTransition } from 'react';

import { rsvpAction } from '@/app/e/[slug]/actions';

/**
 * RSVP form.
 *
 * Designed for a relative on a mid-range Android with patchy data: one screen,
 * big targets, no required account, and an optimistic confirmation so the guest
 * never wonders whether the reply was received.
 */
export function RsvpForm({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<'idle' | 'yes' | 'no' | 'maybe'>('yes');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const outcome = await rsvpAction(formData);
          setResult(outcome);
        });
      }}
      className="mt-4 space-y-3"
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="status" value={state} />

      <div className="flex gap-2">
        {(
          [
            { key: 'yes' as const, label: 'येऊ', tone: 'bg-paithani text-ivory' },
            { key: 'maybe' as const, label: 'कदाचित', tone: 'bg-gold text-ivory' },
            { key: 'no' as const, label: 'येऊ शकत नाही', tone: 'bg-maroon text-ivory' },
          ]
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setState(option.key)}
            className={
              state === option.key
                ? `flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${option.tone}`
                : 'flex-1 rounded-xl border border-gold/50 bg-ivory px-3 py-2 text-sm font-semibold text-charcoal-soft'
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="block text-sm">
        <span className="sr-only">नाव</span>
        <input
          name="name"
          required
          maxLength={120}
          placeholder="तुमचे पूर्ण नाव"
          className="w-full rounded-xl border border-gold/40 bg-ivory px-3 py-3 text-base text-charcoal outline-none focus:border-maroon"
        />
      </label>

      <label className="block text-sm">
        <span className="sr-only">मोबाइल</span>
        <input
          name="phone"
          inputMode="tel"
          maxLength={15}
          placeholder="मोबाइल क्रमांक (ऐच्छिक)"
          className="w-full rounded-xl border border-gold/40 bg-ivory px-3 py-3 text-base text-charcoal outline-none focus:border-maroon"
        />
      </label>

      <label className="block text-sm">
        <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">किती व्यक्ती येतील?</span>
        <input
          name="heads"
          type="number"
          min={1}
          max={20}
          defaultValue={2}
          className="mt-1 w-full rounded-xl border border-gold/40 bg-ivory px-3 py-3 text-base text-charcoal outline-none focus:border-maroon"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-maroon px-5 py-3 font-semibold text-ivory shadow-soft disabled:opacity-60"
      >
        {pending ? 'पाठवत आहे…' : 'नोंदवा'}
      </button>

      {result ? (
        <p
          className={
            result.ok
              ? 'rounded-xl border border-paithani/50 bg-paithani/10 px-3 py-2 text-sm text-paithani'
              : 'rounded-xl border border-maroon/40 bg-maroon/8 px-3 py-2 text-sm text-maroon'
          }
          role="status"
        >
          {result.message}
        </p>
      ) : null}

      <p className="text-[11px] text-charcoal-soft">
        आम्ही फक्त नाव व ऐच्छिक मोबाइल क्रमांक घेतो — पाहुण्यांची यादी इतरांना दिसत नाही.
      </p>
    </form>
  );
}
