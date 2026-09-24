import type { DesignDocument } from '@mazi/renderer';

import { designForEvent } from '@/app/studio/[slug]/invitation/studio';
import { getStore } from '@/lib/store';

/**
 * Resolve the design document behind an `/api/designs/:id/...` request.
 *
 * Two sources, one contract:
 *
 *   1. **A saved design** renders from its immutable stored document, so the SVG a
 *      printer downloads is byte-for-byte what the family approved.
 *   2. **A design that was never saved** (or a row written before the document
 *      existed) is rebuilt deterministically from the event and the requested
 *      template/scheme, so a preview link still works.
 *
 * Returns `undefined` when neither path can produce a document — the caller turns
 * that into a 404 rather than into a broken SVG.
 */
export type ResolvedDesign = { design: DesignDocument; source: 'stored' | 'rebuilt'; designId: string };

function isRenderable(doc: unknown): doc is DesignDocument {
  if (!doc || typeof doc !== 'object') return false;
  const candidate = doc as Partial<DesignDocument>;
  return Boolean(candidate.page?.widthMm && candidate.page?.heightMm && Array.isArray(candidate.elements) && candidate.elements.length);
}

export function resolveDesign(id: string, searchParams: URLSearchParams): ResolvedDesign | undefined {
  const store = getStore();
  const record = store.designs.byId(id);

  if (isRenderable(record?.doc)) {
    return { design: record.doc, source: 'stored', designId: id };
  }

  const event = record?.eventId ? store.events.byId(record.eventId) : undefined;
  const slug = searchParams.get('slug') ?? event?.slug;
  if (!slug) return undefined;

  const rebuilt = designForEvent({
    slug,
    name: record?.name,
    templateId: searchParams.get('template') ?? record?.templateId ?? undefined,
    schemeId: searchParams.get('scheme') ?? record?.scheme ?? undefined,
    includeEnglish: searchParams.get('english') === '1',
    includePanchang: searchParams.get('panchang') !== '0',
    includeQr: searchParams.get('qr') !== '0',
  });

  return { design: rebuilt.design, source: 'rebuilt', designId: id };
}
