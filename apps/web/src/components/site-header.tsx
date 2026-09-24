import Link from 'next/link';

const NAV = [
  { href: '/create', label: 'तयार करा' },
  { href: '/vendors', label: 'विक्रेते शोधा' },
  { href: '/events', label: 'सार्वजनिक पत्रिका' },
  { href: '/vendor', label: 'विक्रेता डेस्क' },
  { href: '/panchang', label: 'पंचांग' },
  { href: '/admin', label: 'प्रशासन' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-ivory/90 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-maroon text-ivory shadow-soft">
            <span className="font-script text-lg leading-none">मा</span>
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-maroon">माझी पत्रिका</span>
            <span className="block font-ui text-[0.66rem] uppercase tracking-[0.18em] text-charcoal-soft">
              Mazi Patrika
            </span>
          </span>
        </Link>

        <nav aria-label="मुख्य नेव्हिगेशन" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-charcoal-soft transition hover:bg-ivory-deep hover:text-maroon"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/create"
            className="rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-ivory shadow-soft transition hover:bg-maroon-soft"
          >
            पत्रिका बनवा
          </Link>
        </div>
      </div>
      <nav aria-label="मोबाइल नेव्हिगेशन" className="shell flex gap-1 overflow-x-auto pb-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full border border-gold/40 bg-ivory px-3 py-1.5 text-xs font-medium text-charcoal-soft"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
