import type { Metadata } from 'next';
import Link from 'next/link';

import { CATEGORIES } from '@mazi/cake-atelier';

import { cakeCatalog } from '@/lib/cake/catalog';

/**
 * Cake Atelier Pro — section shell.
 *
 * The three routes of the studio (library, editor, print) share one header so the
 * customer always knows where they are and what comes next. The whole section is
 * client-side state plus local storage: nothing about a child's birthday leaves
 * the browser until the customer chooses to export a file.
 */

export const metadata: Metadata = {
  title: 'Cake Atelier Pro · Paper-art cake toppers',
  description:
    'Design a paper-art birthday cake topper from 60 original illustrations, personalise the name, and export print-ready PNG, SVG, PDF or a layered cardstock pack.',
};

const STEPS = [
  { href: '/cake', label: 'Overview' },
  { href: '/cake/templates', label: 'Designs' },
  { href: '/cake/editor', label: 'Editor' },
  { href: '/cake/print', label: 'Print studio' },
];

export default function CakeLayout({ children }: { children: React.ReactNode }) {
  const catalog = cakeCatalog();
  return (
    <div className="min-h-screen bg-ivory-50">
      {/*
        The bundled Cake Atelier fonts, copied into /public by `npm run
        fonts:sync`. Loading them here (and not in the root layout) keeps the
        extra ~3 MB off every other page of the site; React hoists the tag into
        <head>. They are needed so the editor's live text preview renders in the
        same faces the exporter shapes with.
      */}
      <link rel="stylesheet" href="/cake-fonts/fonts.css" precedence="cake-fonts" />

      <div className="border-b border-ivory-300/80 bg-gradient-to-r from-ivory-100 via-ivory-50 to-ivory-100">
        <div className="shell py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Mazi Patrika · Cake Atelier Pro</p>
              <h1 className="font-display text-3xl font-semibold text-maroon-900 sm:text-4xl">Paper-art cake toppers</h1>
              <p className="mt-1 max-w-2xl text-sm text-ink-500">
                {catalog.totals.templates} original designs across {catalog.totals.collections} collections, {catalog.totals.palettes} curated
                palettes and {catalog.totals.sizes} print sizes. Print-ready PNG, SVG, PDF or a layered cardstock pack — with the
                measurements written down.
              </p>
            </div>
            <nav aria-label="Cake Atelier sections" className="flex flex-wrap gap-1.5">
              {STEPS.map((step) => (
                <Link key={step.href} href={step.href} className="btn-outline px-3 py-1.5 text-[12px] no-underline">
                  {step.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="shell py-6">{children}</div>
      <footer className="border-t border-ivory-300/80 bg-white/60">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] text-ink-400">
          <p>
            {CATEGORIES.length} collections · simulated metallic finishes are labelled as such · fonts are open-licence (OFL) and
            bundled with the app.
          </p>
          <Link href="/studio" className="no-underline hover:text-maroon-800">
            Mazi Patrika studio →
          </Link>
        </div>
      </footer>
    </div>
  );
}
