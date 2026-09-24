import type { MetadataRoute } from 'next';

/**
 * The installable app.
 *
 * Mazi Patrika is PWA-first by design (no native apps in the plan): a couple on a
 * mid-range Android phone in Chinchwad should be able to keep their invitation and
 * guest list on the home screen and open it at a wedding venue with one bar of
 * signal. Marathi is the app language, Mumbai/India the locale, and the colours
 * come from the same tokens the site uses.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'माझी पत्रिका — कार्यक्रम व्यवस्थापन',
    short_name: 'माझी पत्रिका',
    description:
      'पत्रिका तयार करा, मुहूर्त पाहा, बजेट व पाहुणे सांभाळा, विक्रेते शोधा व बुक करा — सर्व मराठीत, एका वर्कस्पेसमध्ये.',
    lang: 'mr-IN',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FBF7EF',
    theme_color: '#6B1D2A',
    categories: ['lifestyle', 'productivity', 'events'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'पत्रिका तयार करा', url: '/create' },
      { name: 'पंचांग व मुहूर्त', url: '/panchang' },
      { name: 'विक्रेता डेस्क', url: '/vendor' },
    ],
  };
}
