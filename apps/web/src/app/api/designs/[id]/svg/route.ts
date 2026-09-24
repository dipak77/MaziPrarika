import { NextResponse } from 'next/server';

import { renderSvg, toSocialSvg } from '@mazi/renderer';

import { resolveDesign } from '@/lib/design-source';

/**
 * GET /api/designs/:id/svg
 *
 * Returns the *same* SVG the studio shows and the printer receives: a saved design
 * renders from its stored document, an unsaved one is rebuilt deterministically
 * from its parameters, so a preview and a download can never diverge.
 *
 *   ?print=1      add bleed + crop marks (print proof)
 *   ?social=story 1080×1920 scene for social sharing (?social=square|landscape)
 *   ?download=1   send as an attachment
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);

  const resolved = resolveDesign(id, url.searchParams);
  if (!resolved) {
    return NextResponse.json({ error: 'पत्रिका सापडली नाही.' }, { status: 404 });
  }

  const social = url.searchParams.get('social');
  const svg = social
    ? toSocialSvg(resolved.design, social === 'square' || social === 'landscape' ? social : 'story')
    : renderSvg(resolved.design, { print: url.searchParams.get('print') === '1' });

  const download = url.searchParams.get('download') === '1';
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      // Deterministic output → safe to cache hard; the id changes with any edit.
      'cache-control': 'public, max-age=31536000, immutable',
      'x-mazi-design-source': resolved.source,
      ...(download ? { 'content-disposition': `attachment; filename="${id}.svg"` } : {}),
    },
  });
}
