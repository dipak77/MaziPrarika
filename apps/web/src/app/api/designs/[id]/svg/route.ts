import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';

import { renderSvg, toSocialSvg, type FoilStops, type SpecTheme } from '@mazi/renderer';

import { resolveDesign } from '@/lib/design-source';
import { FOIL_HEX, getPrintArt } from '@/lib/print-art';

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

  const social = url.searchParams.get('social');
  const themed = { ...(theme ? { theme } : {}), ...(foilStops ? { foilStops } : {}) };
  const svg = social
    ? toSocialSvg(resolved.design, social === 'square' || social === 'landscape' ? social : 'story', themed)
    : renderSvg(resolved.design, { print: url.searchParams.get('print') === '1', ...themed });

  const download = url.searchParams.get('download') === '1';
  const variantKey = url.searchParams.get('variant') ?? variant?.id ?? '';
  const variantPart = [
    resolved.source,
    String(resolved.version),
    url.searchParams.get('print') ?? '',
    social ?? '',
    url.searchParams.get('template') ?? templateId ?? '',
    url.searchParams.get('scheme') ?? '',
    variantKey,
  ].join('|');
  const etag = `"${createHash('sha1').update(`${id}|${variantPart}`).digest('hex').slice(0, 16)}"`;
  const headers = {
    'content-type': 'image/svg+xml; charset=utf-8',
    etag,
    // The design id is stable across edits. Revalidate; do not pin for a year.
    'cache-control': 'public, max-age=60, must-revalidate',
    'x-mazi-design-source': resolved.source,
    'x-mazi-design-version': String(resolved.version),
  };
  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  const safeName = id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'patrika';
  return new NextResponse(svg, {
    status: 200,
    headers: {
      ...headers,
      ...(download ? { 'content-disposition': `attachment; filename="${safeName}.svg"` } : {}),
    },
  });
}
