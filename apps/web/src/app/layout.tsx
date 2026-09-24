import type { Metadata, Viewport } from 'next';

import { ServiceWorkerRegistrar } from '@/components/service-worker';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'माझी पत्रिका — कार्यक्रम व्यवस्थापन, मराठीत',
    template: '%s • माझी पत्रिका',
  },
  description:
    'मराठी कुटुंबांसाठी संपूर्ण कार्यक्रम व्यवस्थापन — पत्रिका तयार करा, मुहूर्त पाहा, बजेट ठेवा, पाहुणे व विक्रेते एकाच ठिकाणी व्यवस्थापित करा. तयार करा, नियोजन करा, बुक करा, छपाई करा, साजरा करा.',
  keywords: ['मराठी निमंत्रण पत्रिका', 'लग्न नियोजन', 'पंचांग', 'मुहूर्त', 'विक्रेते', 'महाराष्ट्र'],
  applicationName: 'माझी पत्रिका',
  authors: [{ name: 'Mazi Patrika' }],
  openGraph: {
    type: 'website',
    locale: 'mr_IN',
    siteName: 'माझी पत्रिका',
    title: 'माझी पत्रिका — Create. Plan. Discover. Book. Print. Manage. Celebrate.',
    description: 'कार्यक्रमाचे संपूर्ण व्यवस्थापन एका जोडलेल्या वर्कस्पेसमध्ये — मराठीत, पहिल्या अक्षरापासून.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'माझी पत्रिका', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#6B1D2A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr-IN">
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-maroon focus:px-4 focus:py-2 focus:text-ivory"
        >
          मुख्य मजकुराकडे जा
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
