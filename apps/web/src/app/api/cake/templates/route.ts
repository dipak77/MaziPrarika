import { NextResponse } from 'next/server';
import { z } from 'zod';

import { CATEGORIES, type CategoryId } from '@mazi/cake-atelier';

import { CAKE_OCCASIONS, CAKE_STYLES, cakeCatalog, filterCakeTemplates } from '@/lib/cake/catalog';

/**
 * GET /api/cake/templates
 *
 * The design library as JSON: collections, palettes, physical sizes and every
 * template summary. Template summaries are metadata only — the artwork is
 * generated on demand by /api/cake/preview and /api/cake/export, so the payload
 * stays small enough to cache in the browser.
 *
 * Query: search, category, gender, style, occasion, age, sort, limit
 */

export const runtime = 'nodejs';

const CATEGORY_IDS = CATEGORIES.map((category) => category.id) as [CategoryId, ...CategoryId[]];

const FilterSchema = z.object({
  search: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORY_IDS).optional(),
  gender: z.enum(['boy', 'girl', 'unisex']).optional(),
  style: z.enum(CAKE_STYLES).optional(),
  occasion: z.enum(CAKE_OCCASIONS).optional(),
  age: z.coerce.number().int().min(0).max(30).optional(),
  sort: z.enum(['name', 'category', 'recent', 'popular']).optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = FilterSchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid filter.', issues: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'filter'}: ${issue.message}`) },
      { status: 400 },
    );
  }

  const catalog = cakeCatalog();
  const filter = parsed.data;
  const hasFilter = Object.keys(filter).some((key) => filter[key as keyof typeof filter] !== undefined);
  const templates = hasFilter
    ? filterCakeTemplates({
        ...(filter.search ? { search: filter.search } : {}),
        ...(filter.category ? { category: filter.category } : {}),
        ...(filter.gender ? { gender: filter.gender } : {}),
        ...(filter.style ? { style: filter.style } : {}),
        ...(filter.occasion ? { occasion: filter.occasion } : {}),
        ...(filter.age !== undefined ? { age: filter.age } : {}),
        ...(filter.sort ? { sort: filter.sort } : {}),
      }).slice(0, filter.limit ?? 60)
    : catalog.templates;

  return NextResponse.json(
    { ...catalog, templates, matched: templates.length },
    {
      headers: {
        // The registry changes only when the app is redeployed; the browser may
        // reuse the catalogue for a day and revalidate in the background.
        'Cache-Control': 'public, max-age=600, s-maxage=86400, stale-while-revalidate=86400',
      },
    },
  );
}
