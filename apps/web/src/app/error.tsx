'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell py-16 sm:py-24 text-center" role="alert">
      <div className="mx-auto max-w-md">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-maroon-light text-maroon ring-1 ring-maroon/15">!</div>
        <p className="mt-4 font-ui text-xs font-bold uppercase tracking-[0.2em] text-maroon">काहीतरी चुकले</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-charcoal">पुन्हा प्रयत्न करा</h1>
        <p className="mx-auto mt-3 text-sm leading-relaxed text-charcoal-soft">तात्पुरती अडचण आली आहे. तुमचे काम सुरक्षित आहे — एकदा रिफ्रेश करून पाहा.</p>
        {error?.digest ? <p className="mt-2 rounded-full bg-ivory-deep px-3 py-1 font-ui text-xs font-medium text-charcoal-muted inline-block">संदर्भ: {error.digest}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-base btn-maroon px-6 py-3 text-sm">
            पुन्हा लोड करा
          </button>
          <a href="/" className="btn-base btn-outline px-6 py-3 text-sm">
            मुखपृष्ठ
          </a>
        </div>
      </div>
    </div>
  );
}
