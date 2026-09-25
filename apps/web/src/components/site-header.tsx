import Link from 'next/link';
import { LangToggle } from '@/components/lang-toggle';

const NAV = [
  { href: '/studio', label: 'क्रिएट स्टुडिओ', badge: '६० FPS' },
  { href: '/create', label: 'AI सोहळा', badge: 'AI' },
  { href: '/vendors', label: 'व्हेंडर शोधा' },
  { href: '/events', label: 'इव्हेंट्स' },
  { href: '/vendor-os', label: 'व्हेंडर ओएस', badge: 'CRM' },
  { href: '/console', label: 'कन्सोल' },
  { href: '/panchang', label: 'पंचांग' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-ivory/95 backdrop-blur-xl shadow-xs">
      {/* Top Auspicious Micro-Bar */}
      <div className="border-b border-gold/20 bg-linear-to-r from-maroon-deep via-maroon to-maroon-deep px-4 py-1 text-center text-xs font-medium tracking-wider text-gold-shimmer">
        <div className="shell flex items-center justify-between">
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-90">
            <span className="size-1.5 rounded-full bg-gold-bright animate-pulse-subtle" />
            ॥ श्री गणेशाय नमः ॥
          </span>
          <span className="mx-auto sm:mx-0 font-medium">
            महाराष्ट्र आवृत्ती • सूर्यसिद्धांत पंचांग • अचूक छपाई व सुरक्षित खातेवही
          </span>
          <span className="hidden md:inline-flex items-center gap-2 text-gold/85">
            <span className="size-1.5 rounded-full bg-paithani-light" />
            थेट पंचांग सक्रिय
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="shell flex h-[4.5rem] items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="group flex items-center gap-3.5 focus-visible:ring-2 focus-visible:ring-gold-bright">
          <div className="relative">
            <span
              aria-hidden
              className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-maroon via-maroon-rich to-maroon-deep text-gold-shimmer shadow-md ring-1 ring-gold/40 transition group-hover:scale-105 group-hover:ring-gold"
            >
              <span className="font-script text-2xl font-bold leading-none drop-shadow-sm">मा</span>
            </span>
            <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-ivory bg-gold-bright" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-maroon group-hover:text-maroon-soft transition">
                माझी पत्रिका
              </span>
              <span className="rounded-sm bg-gold/15 px-1.5 py-0.5 text-xs font-semibold text-gold-deep border border-gold/30">
                PRO
              </span>
            </div>
            <span className="block font-ui text-xs uppercase tracking-[0.2em] text-charcoal-muted">
              Mazi Patrika • Maha OS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav aria-label="मुख्य नेव्हिगेशन" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative rounded-xl px-3.5 py-2 text-sm font-medium text-charcoal-soft transition hover:bg-gold/10 hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="flex items-center gap-1.5">
                {item.label}
                {item.badge ? (
                  <span className="rounded-full bg-maroon/10 px-1.5 py-0.5 text-xs font-bold text-maroon border border-maroon/20">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="absolute inset-x-3 -bottom-1.5 h-0.5 scale-x-0 bg-gold-bright transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* CTA Buttons & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <LangToggle compact />
          <Link
            href="/vendor"
            className="hidden sm:inline-flex min-h-11 items-center rounded-full border border-gold/45 bg-ivory px-3.5 text-xs font-semibold text-charcoal-soft transition hover:border-gold hover:bg-ivory-deep hover:text-maroon"
          >
            विक्रेता प्रवेश
          </Link>
          <Link
            href="/create"
            className="btn-base btn-gold px-3.5 sm:px-5 text-xs sm:text-sm"
          >
            <span className="flex items-center gap-1.5">
              <span>पत्रिका बनवा</span>
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Scroll Nav */}
      <nav aria-label="मोबाइल नेव्हिगेशन" className="shell flex gap-1.5 overflow-x-auto pb-2.5 pt-1 lg:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-gold/30 bg-ivory/80 px-3.5 text-xs font-medium text-charcoal-soft shadow-xs active:bg-gold/20"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

