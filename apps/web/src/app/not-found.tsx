import Link from 'next/link';

export const metadata = { title: 'पान सापडले नाही' };

export default function NotFound() {
  return (
    <div className="shell py-16 sm:py-24 text-center">
      <div className="mx-auto max-w-lg">
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-ivory-surface px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-ink">
          <span className="size-1.5 rounded-full bg-gold-bright" aria-hidden />
          ४०४ • पान सापडले नाही
        </p>
        <p className="mt-6 font-script text-3xl text-maroon" aria-hidden>
          ॥ श्री गणेशाय नमः ॥
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-charcoal sm:text-5xl">हे पान सापडले नाही</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal-soft sm:text-base">
          दुवा चुकीचा असू शकतो किंवा पान हलवले गेले असू शकते. ॥ सहर्ष स्वागतम् ॥ — खालील दुव्यांनी पुढे जा, तुमची तयारी सुरक्षित आहे.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-base btn-gold min-h-[44px] px-6 py-3 text-sm">
            मुखपृष्ठावर जा
          </Link>
          <Link href="/vendors" className="btn-base btn-outline min-h-[44px] px-6 py-3 text-sm">
            विक्रेते शोधा
          </Link>
          <Link href="/panchang" className="btn-base btn-ghost min-h-[44px] px-6 py-3 text-sm">
            पंचांग पाहा
          </Link>
        </div>
      </div>
    </div>
  );
}
