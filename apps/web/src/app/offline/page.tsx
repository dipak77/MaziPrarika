import Link from 'next/link';

export const metadata = { title: 'ऑफलाइन' };

/**
 * Offline fallback. Wedding venues in Maharashtra have famously thin signal, so the
 * shell degrades to this page instead of the browser's dinosaur — and it keeps the
 * invitation links the family already opened working from cache.
 */
export default function OfflinePage() {
  return (
    <div className="shell py-16">
      <div className="surface mx-auto max-w-xl p-8 text-center">
        <p className="font-ui text-xs uppercase tracking-[0.18em] text-gold">Offline</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-maroon">इंटरनेट नाही</h1>
        <p className="mt-3 text-charcoal-soft">
          मंगल कार्यालयात सिग्नल कमी असतो — काळजी नका. आधी उघडलेली पत्रिका ब्राउझरच्या कॅशेमधून पाहता येते;
          नवीन माहिती येण्यासाठी पुन्हा जोडणी लागेल.
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-charcoal-soft">
          <li>• पत्रिका छपाईसाठी दिलेली माहिती सुरक्षित आहे — पुन्हा पाठवावी लागत नाही.</li>
          <li>• पाहुण्यांची नावे व बजेट तुमच्या डिव्हाइसवर जतन राहते.</li>
          <li>• जोडणी आल्यावर आपोआप सिंक होते.</li>
        </ul>
        <Link href="/" className="mt-6 inline-block rounded-full bg-maroon px-6 py-3 text-sm font-semibold text-ivory">
          पुन्हा प्रयत्न करा
        </Link>
      </div>
    </div>
  );
}
