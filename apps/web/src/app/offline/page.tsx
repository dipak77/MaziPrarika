import Link from 'next/link';
import { PageBanner } from '@/components/page-banner';

export const metadata = { title: 'ऑफलाइन' };

/**
 * Offline fallback. Wedding venues in Maharashtra have famously thin signal, so the
 * shell degrades to this page instead of the browser's dinosaur — and it keeps the
 * invitation links the family already opened working from cache.
 */
export default function OfflinePage() {
  return (
    <div className="shell py-16">
      <div className="mx-auto max-w-xl text-center">
        <PageBanner
          kicker="Offline"
          title="इंटरनेट नाही"
          description="मंगल कार्यालयात सिग्नल कमी असतो — काळजी नका. आधी उघडलेली पत्रिका ब्राउझरच्या कॅशेमधून पाहता येते; नवीन माहिती येण्यासाठी पुन्हा जोडणी लागेल."
        />
        <div className="surface mt-4 p-8 text-center">
          <ul className="space-y-2 text-left text-sm text-charcoal-soft">
            <li>• पत्रिका छपाईसाठी दिलेली माहिती सुरक्षित आहे — पुन्हा पाठवावी लागत नाही.</li>
            <li>• पाहुण्यांची नावे व बजेट तुमच्या डिव्हाइसवर जतन राहते.</li>
            <li>• जोडणी आल्यावर आपोआप सिंक होते.</li>
          </ul>
          <Link href="/" className="btn-base btn-maroon mt-6 px-6 text-sm">
            पुन्हा प्रयत्न करा
          </Link>
        </div>
      </div>
    </div>
  );
}
