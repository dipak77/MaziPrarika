import { NextResponse } from 'next/server';

import { toPrintHtml } from '@mazi/renderer';

import { resolveDesign } from '@/lib/design-source';

/**
 * GET /api/designs/:id/print
 *
 * A print-ready HTML page: one sheet at the exact physical size (page size set in
 * CSS as millimetres), self-hosted fonts, crop marks in the bleed. Open with
 * `?auto=1` to send it straight to the browser print dialog — this is the proof a
 * printer checks, not a screenshot.
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

  // Fonts are served from this origin: the proof must never depend on a CDN, or a
  // printer opening it offline gets a fallback face and a wrong line break on the
  // card. The origin comes from the request, so the same build works on any host.
  const html = toPrintHtml(resolved.design, {
    fontBaseUrl: `${url.origin}/fonts`,
    autoPrint: url.searchParams.get('auto') === '1',
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, max-age=0, must-revalidate',
      'x-mazi-design': resolved.designId,
      'x-mazi-design-source': resolved.source,
      'x-mazi-print-dpi': String(resolved.design.page.dpi),
    },
  });
}
