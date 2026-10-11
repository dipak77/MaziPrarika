import type { Metadata } from 'next';

import { CakeGallery } from '@/components/cake/cake-gallery';
import { cakeCatalog } from '@/lib/cake/catalog';

/**
 * /cake/templates — the library.
 *
 * The catalogue is serialised on the server (60 summaries, ~60 kB) and handed to
 * the client gallery, which filters instantly without another request. The
 * artwork itself is fetched per card from /api/cake/preview, lazily, so opening
 * the page does not render sixty full designs up front.
 */

export const metadata: Metadata = {
  title: 'Design library · Cake Atelier Pro',
  description: 'Browse 60 original paper-art cake topper designs across twelve collections, filter by age, style and occasion.',
};

export const dynamic = 'force-static';
export const revalidate = 86400;

export default function CakeTemplatesPage() {
  const catalog = cakeCatalog();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-maroon-900">Design library</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-500">
          Every design is drawn as vector artwork in code — no stock illustrations, no photographs, no emoji, and nothing
          generated at request time. Open one in the editor to personalise it; the thumbnail you see is the artwork that
          prints.
        </p>
      </div>
      <CakeGallery catalog={catalog} />
    </div>
  );
}
