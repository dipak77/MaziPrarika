'use client';

import { useState, useTransition } from 'react';

import { wishAction } from '@/app/e/[slug]/actions';

export function WishWall({
  slug,
  initial,
}: {
  slug: string;
  initial: Array<{ id: string; body: string; at: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [wishes, setWishes] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="surface p-5">
      <h2 className="font-display text-xl font-bold text-charcoal">शुभेच्छा भिंत</h2>
      <p className="mt-1 text-xs text-charcoal-soft">
        इथे लिहिलेल्या शुभेच्छा कुटुंबाला वर्कस्पेसमध्ये दिसतात — छपाईच्या स्मरणिका पुस्तिकेसाठी निवडल्या जाऊ शकतात.
      </p>

      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await wishAction(formData);
            setMessage(result.message);
            if (result.ok) {
              const name = String(formData.get('name') ?? '').trim();
              const body = String(formData.get('body') ?? '').trim();
              setWishes((current) => [{ id: `local_${Date.now()}`, body: `${name ? `${name}: ` : ''}${body}`, at: 'आत्ता' }, ...current].slice(0, 8));
            }
          });
        }}
        className="mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
      >
        <input type="hidden" name="slug" value={slug} />
        <input
          name="name"
          maxLength={80}
          placeholder="तुमचे नाव"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <input
          name="body"
          required
          maxLength={500}
          placeholder="शुभेच्छा — उदा. नवदांपत्याला खूप खूप शुभेच्छा!"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <button type="submit" disabled={pending} className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-ivory disabled:opacity-60">
          पाठवा
        </button>
      </form>

      {message ? <p className="mt-2 text-xs text-paithani">{message}</p> : null}

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {wishes.map((wish) => (
          <li key={wish.id} className="rounded-xl border border-gold/25 bg-ivory px-3 py-2">
            <p className="text-sm text-charcoal">{wish.body}</p>
            <p className="mt-1 font-ui text-[11px] text-charcoal-soft">{wish.at}</p>
          </li>
        ))}
        {wishes.length === 0 ? (
          <li className="text-sm text-charcoal-soft">पहिली शुभेच्छा तुम्ही लिहा.</li>
        ) : null}
      </ul>
    </section>
  );
}
