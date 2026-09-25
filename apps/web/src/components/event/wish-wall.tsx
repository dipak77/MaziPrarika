'use client';

import { useState, useTransition } from 'react';

import { toDevanagariDigits } from '@mazi/marathi';

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
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <section className="surface-elevated overflow-hidden p-0">
      <div className="paithani-edge h-1.5" aria-hidden />
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span aria-hidden className="grid size-8 place-items-center rounded-xl bg-gold/15 text-gold-deep ring-1 ring-gold/20">🪷</span>
          <h2 className="font-display text-xl font-bold tracking-tight text-charcoal">शुभेच्छा भिंत</h2>
          <span className="ml-auto rounded-full bg-ivory-deep px-2.5 py-1 text-xs font-semibold text-charcoal-soft ring-1 ring-gold/15">{toDevanagariDigits(wishes.length)} शुभेच्छा</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">इथे लिहिलेल्या शुभेच्छा कुटुंबाला वर्कस्पेसमध्ये दिसतात — छपाईच्या स्मरणिका पुस्तिकेसाठी निवडल्या जाऊ शकतात.</p>
        <form
          action={(formData) => {
            setResult(null);
            startTransition(async () => {
              try {
                const next = await wishAction(formData);
                setResult(next);
                if (next.ok) {
                  const name = String(formData.get('name') ?? '').trim();
                  const body = String(formData.get('body') ?? '').trim();
                  setWishes((current) => [{ id: `local_${Date.now()}`, body: `${name ? `${name}: ` : ''}${body}`, at: 'आत्ता' }, ...current].slice(0, 8));
                }
              } catch {
                setResult({ ok: false, message: 'शुभेच्छा पाठवता आली नाही — पुन्हा प्रयत्न करा.' });
              }
            });
          }}
          className="relative mt-4 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="text" name="_hp_family_name" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <input name="name" maxLength={80} placeholder="तुमचे नाव" className="min-h-11 rounded-xl border border-gold/30 bg-white px-3 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10" />
          <input name="body" required maxLength={500} placeholder="शुभेच्छा — उदा. नवदांपत्याला खूप खूप शुभेच्छा!" className="min-h-11 rounded-xl border border-gold/30 bg-white px-3 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon/50 focus:ring-2 focus:ring-maroon/10" />
          <button type="submit" disabled={pending} className="btn-base btn-maroon px-5 text-sm disabled:opacity-60">
            {pending ? 'पाठवत आहे…' : 'पाठवा'}
          </button>
        </form>
        {result ? (
          <p className={`mt-3 rounded-xl border px-3 py-2.5 text-xs font-medium ${result.ok ? 'border-paithani/30 bg-paithani-soft text-paithani' : 'border-maroon/20 bg-maroon-light text-maroon'}`} role={result.ok ? 'status' : 'alert'}>
            {result.message}
          </p>
        ) : null}
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {wishes.map((wish) => (
            <li key={wish.id} className="rounded-2xl border border-gold/15 bg-linear-to-br from-white to-ivory-deep px-3.5 py-3 shadow-2xs">
              <p className="text-sm leading-relaxed text-charcoal">{wish.body}</p>
              <p className="mt-1.5 font-ui text-xs font-medium text-charcoal-soft">{wish.at}</p>
            </li>
          ))}
          {wishes.length === 0 ? <li className="rounded-2xl border border-dashed border-gold/30 bg-ivory-deep/40 px-4 py-6 text-center text-sm text-charcoal-soft">पहिली शुभेच्छा तुम्ही लिहा — कुटुंबाला खूप आनंद होईल.</li> : null}
        </ul>
      </div>
    </section>
  );
}
