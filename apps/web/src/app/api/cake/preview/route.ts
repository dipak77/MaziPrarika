import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildScene, renderSceneToSvg, requireTemplate, sceneFingerprint } from '@mazi/cake-atelier';

/**
 * GET /api/cake/preview
 *
 * Server-rendered SVG of a design — the same builder the exporter uses, minus
 * the rasteriser. Used for gallery thumbnails, social cards, `<img>` previews in
 * e-mail and any consumer that cannot run the editor's own React preview.
 *
 * Every parameter is validated and clamped: this endpoint renders artwork from
 * user input, so it is treated as untrusted input even though it only ever
 * produces shapes we drew ourselves.
 *
 * Query: templateId (required), name, title, subtitle, age, date, palette,
 *        widthMm, heightMm, cutline, guides, transparent, width (raster hint)
 */

export const runtime = 'nodejs';

const PreviewSchema = z.object({
  templateId: z.string().regex(/^[a-z0-9-]{3,48}$/, 'Unknown template id.'),
  name: z.string().max(60).optional(),
  title: z.string().max(48).optional(),
  subtitle: z.string().max(80).optional(),
  age: z.string().max(12).optional(),
  date: z.string().max(28).optional(),
  palette: z.string().max(40).optional(),
  widthMm: z.coerce.number().min(25).max(600).optional(),
  heightMm: z.coerce.number().min(25).max(600).optional(),
  cutline: z.enum(['0', '1']).optional(),
  guides: z.enum(['0', '1']).optional(),
  transparent: z.enum(['0', '1']).optional(),
  download: z.enum(['0', '1']).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = PreviewSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid preview request.', issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 400 },
    );
  }
  const query = parsed.data;

  let template;
  try {
    template = requireTemplate(query.templateId);
  } catch {
    return NextResponse.json({ error: `No design named “${query.templateId}”.` }, { status: 404 });
  }

  const nominal = template.aspect === 'portrait' ? { w: 127, h: 177.8 } : template.aspect === 'landscape' ? { w: 177.8, h: 127 } : { w: 152.4, h: 152.4 };
  const widthMm = query.widthMm ?? nominal.w;
  const heightMm = query.heightMm ?? nominal.h;
  const aspectError = Math.abs(widthMm / heightMm - nominal.w / nominal.h) / (nominal.w / nominal.h);
  if (aspectError > 0.02) {
    return NextResponse.json(
      {
        error: 'That size does not match this design.',
        detail: `${widthMm}×${heightMm} mm is ${(widthMm / heightMm).toFixed(2)}:1 but “${template.name}” is drawn ${(nominal.w / nominal.h).toFixed(2)}:1.`,
      },
      { status: 422 },
    );
  }

  try {
    const built = buildScene(template, {
      ...(query.palette ? { paletteId: query.palette } : {}),
      content: {
        name: query.name ?? template.defaults.name,
        title: query.title ?? template.defaults.title,
        subtitle: query.subtitle ?? template.defaults.subtitle,
        age: query.age ?? template.defaults.age,
        date: query.date ?? template.defaults.date,
      },
      sizeMm: { w: widthMm, h: heightMm },
      ...(query.transparent === '1' ? { transparent: true } : {}),
    });

    const svg = renderSceneToSvg(built.scene, {
      includeBackground: query.transparent !== '1',
      showCutline: query.cutline === '1',
      showGuides: query.guides === '1',
      title: `${template.name} — ${query.name ?? template.defaults.name}`,
      description: `Cake Atelier Pro · ${widthMm} × ${heightMm} mm`,
    });

    const fingerprint = sceneFingerprint(built.scene);
    const etag = `"${createHash('sha1').update(svg).digest('hex').slice(0, 24)}"`;
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `${query.download === '1' ? 'attachment' : 'inline'}; filename="${query.templateId}-preview.svg"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400',
        ETag: etag,
        'X-Cake-Fingerprint': fingerprint,
        'X-Content-Type-Options': 'nosniff',
        // Belt and braces: the SVG is generated from our own scene graph, and we
        // still refuse to let a browser treat it as a script document.
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'The preview could not be built.', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
