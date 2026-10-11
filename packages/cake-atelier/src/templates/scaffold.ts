/**
 * @mazi/cake-atelier — template scaffold
 *
 * Shared plumbing for the 60 templates: text-region declarations with sane
 * defaults, paper material sets, standard optional components and an assembler
 * that puts nodes in the correct paint order.
 *
 * Templates stay short because of this file — and consistent because of it.
 */

import { LAYER_ROLES, group, type LayerRole, type SceneNode, type TextNode } from '../scene.js';
import { artCtx, ink } from '../art/helpers.js';
import type { ArtCtx } from '../art/helpers.js';
import { ageBadge, nameplate, type NameplateStyle } from '../art/decor.js';
import { polygonPath, roundedRectPath } from '../geometry.js';
import type { Paint } from '../scene.js';
import type { TextRegionSpec, TextAnchor, VerticalAlign } from '../typography/measure.js';
import { textNode } from './layout.js';
import type { ComposeInput, MaterialSpec, OptionalComponentSpec, RegionId, TemplateTypography } from './types.js';

/* ------------------------------------------------------------------ */
/* Assembler                                                           */
/* ------------------------------------------------------------------ */

const ROLE_ORDER: Record<LayerRole, number> = {
  backing: 0,
  background: 1,
  illustration: 2,
  secondary: 3,
  nameplate: 4,
  title: 5,
  subtitle: 5,
  name: 6,
  age: 7,
  accents: 8,
  production: 9,
} as unknown as Record<LayerRole, number>;

type MaybeNode = SceneNode | SceneNode[] | null | undefined | false;

/**
 * What a template's `compose` accumulates before `assemble` flattens it: either
 * a single node or the array an art helper returned, in any order.
 */
export type TemplatePart = MaybeNode;

/**
 * Flatten the parts a template returns and sort into paint order. Sorting is
 * stable, so nodes declared in the same role keep author order.
 */
export function assemble(parts: MaybeNode[]): SceneNode[] {
  const flat: SceneNode[] = [];
  for (const part of parts) {
    if (!part) continue;
    if (Array.isArray(part)) flat.push(...part);
    else flat.push(part);
  }
  return flat
    .map((node, index) => ({ node, index, order: roleRank(node.role) }))
    .sort((a, b) => (a.order === b.order ? a.index - b.index : a.order - b.order))
    .map((entry) => entry.node);
}

function roleRank(role: LayerRole): number {
  const rank = ROLE_ORDER[role];
  return rank === undefined ? 2 : rank;
}

/** Group helper that tags a subtree as a single material for the layer split. */
export function paper(id: string, material: string, children: MaybeNode[], label?: string): SceneNode {
  return group(assemble(children), {
    id,
    role: 'illustration',
    material,
    ...(label ? { label } : {}),
  });
}

/* ------------------------------------------------------------------ */
/* Regions                                                             */
/* ------------------------------------------------------------------ */

export interface RegionOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  maxSizePt: number;
  minSizePt?: number;
  maxLines?: number;
  lineHeight?: number;
  anchor?: TextAnchor;
  verticalAlign?: VerticalAlign;
  families: string[];
  weights?: number[];
  breakWords?: boolean;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  letterSpacing?: { min: number; max: number; default: number };
}

export function region(options: RegionOptions): TextRegionSpec {
  const spec: TextRegionSpec = {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    anchor: options.anchor ?? 'middle',
    verticalAlign: options.verticalAlign ?? 'middle',
    maxSizePt: options.maxSizePt,
    minSizePt: options.minSizePt ?? 9,
    maxLines: options.maxLines ?? 1,
    lineHeight: options.lineHeight ?? 1.08,
    families: options.families,
    weights: options.weights ?? [700, 600, 800, 400],
  };
  if (options.breakWords) spec.breakWords = true;
  if (options.textTransform) spec.textTransform = options.textTransform;
  if (options.letterSpacing) spec.letterSpacing = options.letterSpacing;
  return spec;
}

/** Region set for a square 152.4 mm topper with an illustration up top. */
export function squareRegions(options: {
  nameY: number;
  nameHeight: number;
  nameSizePt: number;
  families: { display: string; title: string; body: string };
  nameAnchor?: TextAnchor;
  titleY?: number;
  titleSizePt?: number;
  subtitleY?: number;
  ageBox?: { x: number; y: number; size: number; sizePt: number };
  width?: number;
  x?: number;
}): Record<RegionId, TextRegionSpec> & { name: TextRegionSpec; title: TextRegionSpec } {
  const w = options.width ?? 152.4;
  const x = options.x ?? 18;
  const name = region({
    x,
    y: options.nameY,
    width: w - x * 2,
    height: options.nameHeight,
    maxSizePt: options.nameSizePt,
    families: [options.families.display, options.families.title, options.families.body],
    maxLines: 2,
    breakWords: true,
    letterSpacing: { min: -0.02, max: 0.1, default: 0.01 },
  });
  const title = region({
    x,
    y: options.titleY ?? options.nameY - 16,
    width: w - x * 2,
    height: 12,
    maxSizePt: options.titleSizePt ?? 19,
    families: [options.families.title, options.families.display],
    anchor: options.nameAnchor ?? 'middle',
    textTransform: 'uppercase',
    letterSpacing: { min: 0, max: 0.34, default: 0.16 },
  });
  const subtitle = region({
    x: x + 6,
    y: options.subtitleY ?? options.nameY + options.nameHeight + 1,
    width: w - (x + 6) * 2,
    height: 9,
    maxSizePt: 13,
    families: [options.families.body, options.families.title],
    verticalAlign: 'top',
  });
  const ageBox = options.ageBox ?? { x: w - 42, y: w - 42, size: 26, sizePt: 34 };
  const age = region({
    x: ageBox.x,
    y: ageBox.y,
    width: ageBox.size,
    height: ageBox.size,
    maxSizePt: ageBox.sizePt,
    minSizePt: 12,
    families: options.families.display === 'bebas-neue' ? [options.families.body] : [options.families.display, options.families.body],
    weights: [800, 700, 600],
    lineHeight: 1,
  });
  const date = region({
    x,
    y: w - 20,
    width: w - x * 2,
    height: 8,
    maxSizePt: 11,
    minSizePt: 7,
    families: [options.families.body],
    letterSpacing: { min: 0, max: 0.3, default: 0.14 },
    textTransform: 'uppercase',
  });
  return { name, title, subtitle, age, date };
}

/* ------------------------------------------------------------------ */
/* Typography presets                                                  */
/* ------------------------------------------------------------------ */

export const TYPOGRAPHY: Record<string, TemplateTypography> = {
  royalDisplay: {
    name: ['playfair-display', 'baloo2'],
    title: ['poppins', 'playfair-display'],
    subtitle: ['poppins'],
    age: ['playfair-display', 'poppins'],
    weights: [700, 900, 600, 400],
    allowScript: false,
    nameTracking: 0.02,
  },
  playfulRound: {
    name: ['baloo2', 'quicksand'],
    title: ['baloo2', 'poppins'],
    subtitle: ['quicksand'],
    age: ['baloo2'],
    weights: [800, 700, 600, 400],
    allowScript: false,
    nameTracking: 0.01,
  },
  softNursery: {
    name: ['quicksand', 'baloo2'],
    title: ['quicksand', 'poppins'],
    subtitle: ['quicksand'],
    age: ['baloo2', 'quicksand'],
    weights: [600, 700, 400],
    allowScript: false,
    nameTracking: 0.02,
  },
  boldSport: {
    name: ['bebas-neue', 'poppins'],
    title: ['bebas-neue', 'poppins'],
    subtitle: ['poppins'],
    age: ['bebas-neue'],
    weights: [400, 700],
    allowScript: false,
    nameTracking: 0.06,
  },
  editorialLuxury: {
    name: ['playfair-display', 'great-vibes'],
    title: ['poppins', 'playfair-display'],
    subtitle: ['poppins'],
    age: ['playfair-display'],
    weights: [400, 500, 700],
    allowScript: true,
    nameTracking: 0.14,
  },
  handmadeScript: {
    name: ['great-vibes', 'playfair-display'],
    title: ['playfair-display', 'poppins'],
    subtitle: ['poppins'],
    age: ['playfair-display'],
    weights: [400, 500],
    allowScript: true,
    nameTracking: 0.02,
  },
};

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

export const MATERIAL_SETS: Record<string, MaterialSpec[]> = {
  /** Three-layer classic: printed base, accent paper, foil simulation. */
  classic: [
    { id: 'base', label: 'Ivory 250 gsm card', color: '#FFFDF8', weightGsm: 250, note: 'Main plate — print the full artwork here.' },
    { id: 'accent', label: 'Accent card', color: '#F2C9C2', weightGsm: 220, note: 'Decorative shapes lifted for depth.' },
    { id: 'foil', label: 'Foil / spot-colour pass', color: '#D4AF37', weightGsm: 0, simulatedFoil: true, note: 'Simulated metal gradient on the print, or a real foil stamp if your printer supports it.' },
  ],
  /** Two-layer pastel: base and one accent. */
  pastel: [
    { id: 'base', label: 'White 250 gsm card', color: '#FFFFFF', weightGsm: 250 },
    { id: 'accent', label: 'Pastel accent card', color: '#C6BCEC', weightGsm: 220 },
  ],
  /** Four-layer depth: shadow plate, base, mid, accent. */
  layered: [
    { id: 'shadow', label: 'Charcoal shadow card', color: '#2E2A33', weightGsm: 200, note: 'Sits 1–2 mm offset behind the base for the paper shadow.' },
    { id: 'base', label: 'White 300 gsm card', color: '#FFFFFF', weightGsm: 300, note: 'Rigid base — use the heaviest stock you have.' },
    { id: 'mid', label: 'Mid tone card', color: '#8FD6CF', weightGsm: 220 },
    { id: 'accent', label: 'Accent card', color: '#F2836B', weightGsm: 220 },
  ],
};

/* ------------------------------------------------------------------ */
/* Optionals                                                           */
/* ------------------------------------------------------------------ */

export const OPTIONAL_COMPONENTS: Record<string, OptionalComponentSpec> = {
  backing: {
    id: 'backing',
    label: 'Backing plate',
    default: true,
    description: 'Extra paper plate behind the design — gives the topper body and a soft edge shadow.',
  },
  sparkles: {
    id: 'sparkles',
    label: 'Sparkle accents',
    default: true,
    description: 'Scattered stars and glints sized to the composition.',
  },
  confetti: {
    id: 'confetti',
    label: 'Confetti scatter',
    default: true,
    description: 'Deterministic confetti — the same design always scatters identically.',
  },
  supportStick: {
    id: 'supportStick',
    label: 'Support-stick tabs',
    default: false,
    description: 'Adds two glue tabs and a stick seat to the cut file for cake insertion.',
  },
  registration: {
    id: 'registration',
    label: 'Registration marks',
    default: true,
    description: 'Corner alignment marks for layered assembly (production overlay, never printed on the artwork).',
  },
  cutline: {
    id: 'cutline',
    label: 'Cutline outline',
    default: false,
    description: 'Adds the cut contour to the artwork layer as a technical guide.',
  },
};

/* ------------------------------------------------------------------ */
/* Text placement                                                      */
/* ------------------------------------------------------------------ */

export interface DrawTextOptions {
  fill: string;
  material: string;
  role?: TextNode['role'];
  editable?: boolean;
  label?: string;
}

/** Draw a fitted region, or nothing when the region is empty/hidden. */
export function drawText(input: ComposeInput, regionId: RegionId, options: DrawTextOptions): SceneNode | null {
  const layout = input.layouts[regionId];
  if (!layout || !layout.lines.length) return null;
  return textNode(layout, {
    id: `${input.template.id}:${regionId}`,
    role: options.role ?? (regionId === 'name' ? 'name' : regionId === 'age' ? 'age' : regionId === 'title' ? 'title' : 'subtitle'),
    fill: options.fill,
    material: options.material,
    editable: options.editable ?? true,
    label: options.label ?? `${regionId[0]!.toUpperCase()}${regionId.slice(1)}`,
  });
}

/** Convenience: is an optional component enabled? */
export function on(input: ComposeInput, id: string, fallback = false): boolean {
  const flag = input.flags[id];
  if (flag === undefined) {
    const found = input.template.optionals.find((option) => option.id === id);
    return found ? found.default : fallback;
  }
  return flag;
}

export function opt(input: ComposeInput, id: string): boolean {
  return on(input, id, false);
}

/** Template-declared default flag values. */
export function defaultFlags(template: { optionals: OptionalComponentSpec[] }): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  for (const optional of template.optionals) flags[optional.id] = optional.default;
  return flags;
}

export { LAYER_ROLES, group };
export type { SceneNode };

/* ------------------------------------------------------------------ */
/* Composition helpers                                                 */
/* ------------------------------------------------------------------ */

/** Art context for a template compose pass (stable ids, default material). */
export function composeCtx(input: ComposeInput, material = 'base'): ArtCtx {
  return artCtx(input.tokens, material, input.template.id);
}

export interface PlateOptions {
  style: NameplateStyle;
  material?: string;
  fill?: Paint;
  edge?: string;
  accent?: Paint;
  tails?: boolean;
  pad?: number;
  /** Region to wrap — defaults to the name region. */
  regionId?: RegionId;
}

/** Draw the nameplate around the *declared* name region, so plate and text agree. */
export function nameplateFor(input: ComposeInput, options: PlateOptions): SceneNode[] {
  const ctx = composeCtx(input, options.material ?? 'accent');
  const spec = input.template.regions[options.regionId ?? 'name'];
  const pad = options.pad ?? 5.4;
  const box = { x: spec.x - pad, y: spec.y - pad * 0.7, w: spec.width + pad * 2, h: spec.height + pad * 1.4 };
  return nameplate(ctx, {
    style: options.style,
    box,
    ...(options.fill ? { fill: options.fill } : {}),
    ...(options.edge ? { edge: options.edge } : {}),
    ...(options.accent ? { accent: options.accent } : {}),
    ...(options.tails !== undefined ? { tails: options.tails } : {}),
  });
}

export interface AgeBadgeOptions {
  material?: string;
  fill?: Paint;
  ring?: string;
  petals?: number;
  /** `disc` (default) or `banner` for a rounded rectangle. */
  shape?: 'disc' | 'banner';
}

/** Badge drawn around the declared age region. */
export function ageBadgeFor(input: ComposeInput, options: AgeBadgeOptions = {}): SceneNode[] {
  const ctx = composeCtx(input, options.material ?? 'accent');
  const spec = input.template.regions.age;
  const cx = spec.x + spec.width / 2;
  const cy = spec.y + spec.height / 2;
  const r = Math.min(spec.width, spec.height) / 2;
  if (options.shape === 'banner') {
    return [
      ink(ctx, 'age-banner', roundedRectPath(cx - r * 1.24, cy - r * 0.72, r * 2.48, r * 1.44, r * 0.28), options.fill ?? ctx.pal.surface, {
        role: 'age',
        cut: true,
        label: 'Age banner',
      }),
      ink(ctx, 'age-banner-ring', roundedRectPath(cx - r * 1.1, cy - r * 0.58, r * 2.2, r * 1.16, r * 0.22), 'none', {
        stroke: { color: options.ring ?? ctx.pal.secondary, width: 0.9 },
        role: 'age',
      }),
    ];
  }
  return ageBadge(ctx, {
    cx,
    cy,
    r,
    ...(options.fill ? { fill: options.fill } : {}),
    ...(options.ring ? { ring: options.ring } : {}),
    ...(options.petals ? { petals: options.petals } : {}),
  });
}

/** Two glue tabs + a stick seat, added to the cut file when requested. */
export function supportTabs(input: ComposeInput): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const w = input.width;
  const tab = 16;
  return [
    ink(ctx, 'tab', polygonPath([[w * 0.5 - tab / 2, input.height - 1], [w * 0.5 + tab / 2, input.height - 1], [w * 0.5 + tab / 2, input.height + 9], [w * 0.5 - tab / 2, input.height + 9]]), ctx.pal.surfaceAlt, {
      role: 'production',
      cut: true,
      label: 'Support tab (fold)',
    }),
    ink(ctx, 'tab-score', polygonPath([[w * 0.5 - tab / 2, input.height - 1], [w * 0.5 + tab / 2, input.height - 1]], false), 'none', {
      stroke: { color: ctx.pal.cutline, width: 0.5, dash: [2, 1.6] },
      role: 'production',
      score: true,
      label: 'Fold line',
    }),
  ];
}

export { artCtx, ink, line, stack } from '../art/helpers.js';
export type { ArtCtx } from '../art/helpers.js';
export { nameplate, ageBadge, paperStack, ribbonBow, starCluster, sparkle, bunting, vine, confetti, dotGrid, medallion, shadowPlate, burst } from '../art/decor.js';
export type { NameplateStyle, Box } from '../art/decor.js';
export { roundedRectPath, polygonPath } from '../geometry.js';
export { regionBox, layout } from './presets.js';
export type { RegionSet, FamilySet, LayoutPresetId } from './presets.js';
