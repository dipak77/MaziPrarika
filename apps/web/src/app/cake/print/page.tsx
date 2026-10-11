import type { Metadata } from 'next';

import { CakePrintStudio } from '@/components/cake/cake-print-studio';
import { cakeCatalog } from '@/lib/cake/catalog';

/**
 * /cake/print — the print studio.
 *
 * The preflight, production report, layer plan and every export measurement in
 * this view come from the server (`POST /api/cake/export` with `dryRun`), so what
 * is shown here is not a client-side guess: it is what the download will contain.
 */

export const metadata: Metadata = {
  title: 'Print studio · Cake Atelier Pro',
  description: 'Set up a print job: size, resolution, bleed, cut tolerance, paper layers, preflight checklist and production report.',
};

export default function CakePrintPage() {
  return <CakePrintStudio catalog={cakeCatalog()} />;
}
