import { NextResponse } from 'next/server';

import { toPrintHtml, type FoilStops, type SpecTheme } from '@mazi/renderer';

import { resolveDesign } from '@/lib/design-source';
import { FOIL_HEX, getPrintArt } from '@/lib/print-art';

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
  const doc = resolved.design as typeof resolved.design & { template?: string };
  const templateId = doc.template ?? doc.templateId ?? url.searchParams.get('template');
  const spec = templateId ? getPrintArt(templateId) : undefined;
  const variant = spec ? (spec.variants.find((v) => v.id === url.searchParams.get('variant')) ?? spec.variants[0]) : undefined;
  const theme: SpecTheme | undefined = spec && variant
    ? {
      bgGradient: variant.bgGradient,
      accentColor: variant.accentColor,
      textColor: variant.textColor,
      foil: variant.foil,
      motif: spec.motif,
      border: spec.border,
    }
    : undefined;
  const foilStops: FoilStops | undefined = variant ? FOIL_HEX[variant.foil] : undefined;

  const html = toPrintHtml(resolved.design, {
    fontBaseUrl: `${url.origin}/fonts`,
    autoPrint: url.searchParams.get('auto') === '1',
    ...(theme ? { theme } : {}),
    ...(foilStops ? { foilStops } : {}),
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
