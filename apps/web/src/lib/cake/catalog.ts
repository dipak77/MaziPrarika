/**
 * Cake Atelier Pro — catalogue for the web app.
 *
 * A template contains functions (its `compose`), and a Server Component cannot
 * pass a function to a Client Component. So the browser receives a *summary*
 * built here: everything the gallery, the pickers and the editor need to render
 * a choice, and nothing that cannot cross the server boundary.
 *
 * The summaries come straight from the package registry, so the number shown in
 * the UI ("60 designs") is the number of designs that can actually be exported —
 * there is no second, hand-maintained list to drift out of date.
 */

import {
  CATEGORIES,
  NOMINAL_SIZE,
  PALETTES,
  SIMULATED_FOIL_NOTICE,
  allTemplates,
  filterTemplates,
  requireTemplate,
  templatesByCategory,
  DOCUMENT_SIZES,
  type CakeTemplate,
  type CategoryId,
  type TemplateFilter,
} from '@mazi/cake-atelier';

export interface CakeCollectionSummary {
  id: CategoryId;
  index: number;
  name: string;
  blurb: string;
  count: number;
  /** Template ids in this collection, in registry order. */
  templateIds: string[];
  /** Two representative illustrations, used for the collection card artwork. */
  heroTemplateIds: [string, string];
}

export interface CakeTemplateSummary {
  id: string;
  version: number;
  name: string;
  description: string;
  category: CategoryId;
  categoryName: string;
  categoryIndex: number;
  tags: { gender: string[]; styles: string[]; occasions: string[]; ages: [number, number] };
  aspect: CakeTemplate['aspect'];
  defaultPalette: string;
  paletteIds: string[];
  optionals: { id: string; label: string; default: boolean }[];
  materials: { id: string; label: string; color: string; simulatedFoil?: boolean }[];
  fonts: { name: string[]; title: string[]; subtitle: string[]; age: string[] };
  notes: string;
  safeInset: number;
  nominalMm: { w: number; h: number };
}

export interface CakeCatalog {
  collections: CakeCollectionSummary[];
  templates: CakeTemplateSummary[];
  palettes: {
    id: string;
    name: string;
    blurb: string;
    mood: string;
    tokens: Record<string, string>;
    swatches: string[];
  }[];
  sizes: {
    id: string;
    label: string;
    note: string;
    family: 'cake-topper' | 'cupcake' | 'banner' | 'card' | 'custom';
    widthMm: number;
    heightMm: number;
    shape: 'square' | 'round' | 'rect';
    aspect: 'square' | 'portrait' | 'landscape';
  }[];
  notice: string;
  totals: { templates: number; collections: number; palettes: number; sizes: number; layeredTemplates: number; foilTemplates: number };
}

/** Palette tokens that are colours (used for the small palette chips). */
const SWATCH_TOKENS = ['primary', 'secondary', 'accent', 'background', 'nameFill', 'titleFill'] as const;

function aspectOf(widthMm: number, heightMm: number): 'square' | 'portrait' | 'landscape' {
  const ratio = widthMm / heightMm;
  if (Math.abs(ratio - 1) < 0.02) return 'square';
  return ratio < 1 ? 'portrait' : 'landscape';
}

export function cakeCatalog(): CakeCatalog {
  // Built from the templates themselves (not the package's lighter summary) so
  // the gallery and the editor see exactly the same palette list, material list
  // and nominal size that the exporter will use.
  const templates = allTemplates().map(requireTemplateSummary);
  const palettes = PALETTES.map((palette) => {
    const tokens = palette.tokens as unknown as Record<string, string>;
    return {
      id: palette.id,
      name: palette.name,
      blurb: palette.blurb,
      mood: palette.mood,
      tokens,
      swatches: SWATCH_TOKENS.map((token) => tokens[token] ?? '#000000'),
    };
  });

  const collections: CakeCollectionSummary[] = CATEGORIES.map((category) => {
    const inCategory = templatesByCategory(category.id);
    const hero = inCategory.slice(0, 2).map((template) => template.id);
    return {
      id: category.id,
      index: category.index,
      name: category.name,
      blurb: category.blurb,
      count: inCategory.length,
      templateIds: inCategory.map((template) => template.id),
      heroTemplateIds: [hero[0] ?? inCategory[0]?.id ?? '', hero[1] ?? hero[0] ?? ''] as [string, string],
    };
  });

  return {
    collections,
    templates,
    palettes,
    sizes: DOCUMENT_SIZES.map((size) => ({
      id: size.id,
      label: size.label,
      note: size.note,
      family: size.family,
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      shape: size.shape,
      aspect: aspectOf(size.widthMm, size.heightMm),
    })),
    notice: SIMULATED_FOIL_NOTICE,
    totals: {
      templates: templates.length,
      collections: collections.length,
      palettes: palettes.length,
      sizes: DOCUMENT_SIZES.length,
      layeredTemplates: templatesByCategory('royal-prince').length > 0 ? templates.filter((t) => t.materials.length > 2).length : 0,
      foilTemplates: templates.filter((t) => t.materials.some((material) => material.simulatedFoil)).length,
    },
  };
}

/** Filter the catalogue for the gallery, using the package's own filter engine. */
export function filterCakeTemplates(filter: TemplateFilter): CakeTemplateSummary[] {
  return filterTemplates(filter).map((template) => requireTemplateSummary(template));
}

function requireTemplateSummary(template: CakeTemplate): CakeTemplateSummary {
  const collection = CATEGORIES.find((category) => category.id === template.category);
  return {
    id: template.id,
    version: template.version,
    name: template.name,
    description: template.description,
    category: template.category,
    categoryName: collection?.name ?? template.category,
    categoryIndex: collection?.index ?? 0,
    tags: template.tags as CakeTemplateSummary['tags'],
    aspect: template.aspect,
    defaultPalette: template.defaultPalette,
    paletteIds: Object.keys(template.paletteOverrides ?? {}).length
      ? [template.defaultPalette, ...Object.keys(template.paletteOverrides ?? {})].filter((value, index, all) => all.indexOf(value) === index)
      : PALETTES.map((palette) => palette.id),
    optionals: template.optionals.map((option) => ({ id: option.id, label: option.label, default: option.default })),
    materials: template.materials.map((material) => ({
      id: material.id,
      label: material.label,
      color: material.color,
      ...(material.simulatedFoil ? { simulatedFoil: true } : {}),
    })),
    fonts: {
      name: template.typography.name,
      title: template.typography.title,
      subtitle: template.typography.subtitle,
      age: template.typography.age,
    },
    notes: template.notes,
    safeInset: template.safeInset,
    nominalMm: NOMINAL_SIZE[template.aspect],
  };
}

export function templateSummary(id: string): CakeTemplateSummary | undefined {
  try {
    return requireTemplateSummary(requireTemplate(id));
  } catch {
    return undefined;
  }
}

export const CAKE_MOODS = ['classic', 'pastel', 'bright', 'earthy', 'editorial', 'festive'] as const;
export const CAKE_STYLES = ['royal', 'playful', 'pastel', 'bold', 'editorial', 'cute', 'adventurous', 'luxury'] as const;
export const CAKE_OCCASIONS = ['birthday', 'first-birthday', 'milestone', 'baby-shower', 'naming', 'anniversary', 'graduation'] as const;
