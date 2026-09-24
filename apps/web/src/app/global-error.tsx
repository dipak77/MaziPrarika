'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="mr-IN">
      <body className="min-h-dvh antialiased">
        <div className="shell py-24 text-center" role="alert">
          <h1 className="font-display text-3xl font-bold text-maroon">माझी पत्रिका — तात्पुरती अडचण</h1>
          <p className="mt-3 text-sm text-charcoal-soft">कृपया पान रिफ्रेश करा. समस्या कायम राहिल्यास नंतर पुन्हा भेट द्या.</p>
          <button
            type="button"
            onClick={reset}
            className="btn-base btn-maroon mt-6 px-6 py-3 text-sm"
          >
            पुन्हा प्रयत्न करा
          </button>
        </div>
      </body>
    </html>
  );
}
