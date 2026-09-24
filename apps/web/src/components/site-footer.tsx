import Link from 'next/link';

import { EPHEMERIS_VERSION } from '@mazi/panchang';

const COLUMNS = [
  {
    title: 'तयार करा',
    links: [
      { href: '/create', label: 'AI सेटअप' },
      { href: '/studio/patil-patil-vivah-2027/invitation', label: 'पत्रिका स्टुडिओ' },
      { href: '/studio/patil-patil-vivah-2027', label: 'कार्यक्रम वर्कस्पेस' },
    ],
  },
  {
    title: 'शोधा व बुक करा',
    links: [
      { href: '/vendors', label: 'विक्रेते शोध' },
      { href: '/vendors?category=venue&city=पुणे', label: 'मंगल कार्यालय' },
      { href: '/panchang', label: 'पंचांग व मुहूर्त' },
    ],
  },
  {
    title: 'व्यवस्थापन',
    links: [
      { href: '/vendor', label: 'विक्रेता डेस्क' },
      { href: '/admin', label: 'मार्केटप्लेस आरोग्य' },
      { href: '/e/patil-patil-vivah-2027', label: 'सार्वजनिक पत्रिका' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-gold/30 bg-ivory-deep">
      <div className="shell grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold text-maroon">माझी पत्रिका</p>
          <p className="mt-2 max-w-xs text-sm text-charcoal-soft">
            मराठी कुटुंबांसाठी बनवलेले कार्यक्रम व्यवस्थापन — तयार करा, नियोजन करा, शोधा, बुक करा, छपाई करा, सांभाळा, साजरा करा.
          </p>
          <p className="mt-4 font-ui text-[0.7rem] uppercase tracking-[0.16em] text-charcoal-soft">
            Panchang engine {EPHEMERIS_VERSION} • Made in Maharashtra
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-display text-sm font-bold uppercase tracking-wider text-charcoal">{column.title}</p>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-charcoal-soft transition hover:text-maroon">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell flex flex-col gap-3 border-t border-gold/30 py-6 text-xs text-charcoal-soft md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getUTCFullYear()} माझी पत्रिका. पंचांग गणना सूर्यसिद्धांत-आधारित ग्रहगणितावर (लाहिरी अयनांश) आधारित आहे.</p>
        <p className="font-ui">
          मुहूर्त ही <strong className="font-semibold text-charcoal">अनुकूलता</strong> म्हणून दाखवली जाते; अंतिम निर्णय गुरुजींच्या सल्ल्याने.
        </p>
      </div>
    </footer>
  );
}
