/**
 * @mazi/cake-atelier — canonical layouts
 *
 * Six composition skeletons the 60 templates share (with per-template tweaks):
 * where the artwork lives, where the title band sits, where the name is allowed
 * to grow, and where the age badge may be placed. Declaring them once means the
 * fixed-composition rule is enforced by numbers rather than by hope.
 */

import type { Box } from '../art/decor.js';
import { region, type RegionOptions } from './scaffold.js';
import type { RegionId } from './types.js';
import type { TextRegionSpec } from '../typography/measure.js';

export type LayoutPresetId = 'classic' | 'medallion' | 'editorial' | 'band' | 'diagonal' | 'poster';

export interface FamilySet {
  display: string;
  title: string;
  body: string;
}

export type RegionSet = Record<RegionId, TextRegionSpec> & { name: TextRegionSpec; title: TextRegionSpec };

/**
 * The canvas each preset was drawn for. `classic` and friends are composed for
 * the 6 in square topper; `poster` is composed for 5 × 7 in portrait. When a
 * template borrows a preset on a different aspect, `layout()` shifts the regions
 * that no longer fit back inside the canvas instead of letting the renderer draw
 * a nameplate off the edge.
 */
export const PRESET_CANVAS: Record<LayoutPresetId, { w: number; h: number }> = {
  classic: { w: 152.4, h: 152.4 },
  medallion: { w: 152.4, h: 152.4 },
  editorial: { w: 152.4, h: 152.4 },
  band: { w: 152.4, h: 152.4 },
  diagonal: { w: 152.4, h: 152.4 },
  poster: { w: 127, h: 177.8 },
};

function build(specs: Partial<Record<RegionId, RegionOptions>>): RegionSet {
  const out = {} as RegionSet;
  for (const [key, value] of Object.entries(specs)) {
    if (!value) continue;
    (out as unknown as Record<string, TextRegionSpec>)[key] = region(value);
  }
  return out;
}

/**
 * Keep every declared region inside the canvas. A region is moved by the smallest
 * amount that brings it in, and only if a region is physically wider or taller
 * than the canvas is it reduced — never below a printable size. Moving a region
 * keeps the artwork fixed, which is exactly what the fixed-composition rule asks
 * for: the plate follows the region, so a shifted region shifts its plate too.
 */
export function clampRegionsToCanvas(regions: RegionSet, canvas: { w: number; h: number }): RegionSet {
  const out = {} as RegionSet;
  for (const [key, spec] of Object.entries(regions) as [RegionId, TextRegionSpec][]) {
    if (!spec) continue;
    const margin = 2;
    const width = Math.min(spec.width, Math.max(4, canvas.w - margin * 2));
    const height = Math.min(spec.height, Math.max(4, canvas.h - margin * 2));
    const x = Math.min(Math.max(spec.x, margin), Math.max(margin, canvas.w - margin - width));
    const y = Math.min(Math.max(spec.y, margin), Math.max(margin, canvas.h - margin - height));
    (out as unknown as Record<string, TextRegionSpec>)[key] =
      x === spec.x && y === spec.y && width === spec.width && height === spec.height
        ? spec
        : { ...spec, x: round2(x), y: round2(y), width: round2(width), height: round2(height) };
  }
  return out;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Classic: illustration occupies the top two thirds, a letter-spaced title rule
 * sits under it, the name grows into a wide two-line band, the age badge lives
 * in the top-right corner.
 */
export function classicLayout(f: FamilySet, overrides: Partial<Record<RegionId, RegionOptions>> = {}): RegionSet {
  return build({
    title: {
      x: 14, y: 88, width: 124.4, height: 11, maxSizePt: 19, families: [f.title, f.display],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.18 }, verticalAlign: 'middle',
    },
    name: {
      x: 13, y: 99, width: 126.4, height: 26, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true,
      families: [f.display, f.title, f.body], letterSpacing: { min: -0.02, max: 0.1, default: 0.01 },
    },
    subtitle: {
      x: 22, y: 126, width: 108.4, height: 9, maxSizePt: 13, minSizePt: 8, families: [f.body, f.title], verticalAlign: 'top',
    },
    age: {
      x: 108, y: 8, width: 36, height: 36, maxSizePt: 34, minSizePt: 14, families: [f.display, f.body], weights: [800, 700, 400],
    },
    date: {
      x: 14, y: 139, width: 124.4, height: 8, maxSizePt: 11, minSizePt: 7, families: [f.body],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 },
    },
    ...overrides,
  });
}

/** Medallion: a scalloped disc owns the centre; the name sits inside it. */
export function medallionLayout(f: FamilySet, overrides: Partial<Record<RegionId, RegionOptions>> = {}): RegionSet {
  return build({
    title: {
      x: 30, y: 30, width: 92.4, height: 11, maxSizePt: 17, families: [f.title, f.display],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 },
    },
    name: {
      x: 32, y: 60, width: 88.4, height: 30, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true,
      families: [f.display, f.title, f.body],
    },
    subtitle: {
      x: 34, y: 92, width: 84.4, height: 9, maxSizePt: 12, minSizePt: 8, families: [f.body, f.title], verticalAlign: 'top',
    },
    age: {
      x: 106, y: 104, width: 38, height: 38, maxSizePt: 32, minSizePt: 14, families: [f.display, f.body], weights: [800, 700, 400],
    },
    date: {
      x: 26, y: 141, width: 100.4, height: 8, maxSizePt: 11, minSizePt: 7, families: [f.body],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.14 },
    },
    ...overrides,
  });
}

/** Editorial: an arch frame, a small uppercase title, a tall centred name. */
export function editorialLayout(f: FamilySet, overrides: Partial<Record<RegionId, RegionOptions>> = {}): RegionSet {
  return build({
    title: {
      x: 24, y: 40, width: 104.4, height: 11, maxSizePt: 18, families: [f.title, f.display],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.4, default: 0.24 },
    },
    name: {
      x: 24, y: 70, width: 104.4, height: 34, maxSizePt: 42, minSizePt: 11, maxLines: 2, breakWords: true,
      families: [f.display, f.title, f.body], letterSpacing: { min: -0.02, max: 0.16, default: 0.04 },
    },
    subtitle: {
      x: 30, y: 106, width: 92.4, height: 9, maxSizePt: 12, minSizePt: 8, families: [f.body, f.title], verticalAlign: 'top',
    },
    age: {
      x: 58, y: 112, width: 36, height: 36, maxSizePt: 28, minSizePt: 12, families: [f.display, f.body],
    },
    date: {
      x: 24, y: 140, width: 104.4, height: 8, maxSizePt: 10, minSizePt: 7, families: [f.body],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.32, default: 0.18 },
    },
    ...overrides,
  });
}

/** Band: a full-width banner across the middle holding the title. */
export function bandLayout(f: FamilySet, overrides: Partial<Record<RegionId, RegionOptions>> = {}): RegionSet {
  return build({
    title: {
      x: 22, y: 58, width: 108.4, height: 13, maxSizePt: 22, families: [f.title, f.display],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.14 },
    },
    name: {
      x: 14, y: 84, width: 124.4, height: 28, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true,
      families: [f.display, f.title, f.body],
    },
    subtitle: {
      x: 22, y: 114, width: 108.4, height: 9, maxSizePt: 13, minSizePt: 8, families: [f.body, f.title], verticalAlign: 'top',
    },
    age: {
      x: 12, y: 10, width: 36, height: 36, maxSizePt: 32, minSizePt: 14, families: [f.display, f.body], weights: [800, 700, 400],
    },
    date: {
      x: 22, y: 136, width: 108.4, height: 8, maxSizePt: 11, minSizePt: 7, families: [f.body],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 },
    },
    ...overrides,
  });
}

/** Diagonal: artwork in the lower-left, a tilted plate in the upper-right. */
export function diagonalLayout(f: FamilySet, overrides: Partial<Record<RegionId, RegionOptions>> = {}): RegionSet {
  return build({
    title: {
      x: 30, y: 20, width: 108.4, height: 11, maxSizePt: 17, families: [f.title, f.display],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 },
    },
    name: {
      x: 28, y: 34, width: 110.4, height: 30, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true,
      families: [f.display, f.title, f.body],
    },
    subtitle: {
      x: 34, y: 66, width: 98.4, height: 9, maxSizePt: 12, minSizePt: 8, families: [f.body, f.title], verticalAlign: 'top',
    },
    age: {
      x: 12, y: 104, width: 36, height: 36, maxSizePt: 30, minSizePt: 13, families: [f.display, f.body],
    },
    date: {
      x: 30, y: 138, width: 108.4, height: 8, maxSizePt: 11, minSizePt: 7, families: [f.body],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 },
    },
    ...overrides,
  });
}

/** Poster: 5 × 7 in portrait — big artwork panel, centred name, footed details. */
export function posterLayout(f: FamilySet, overrides: Partial<Record<RegionId, RegionOptions>> = {}): RegionSet {
  return build({
    title: {
      x: 14, y: 100, width: 99, height: 11, maxSizePt: 20, families: [f.title, f.display],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.18 },
    },
    name: {
      x: 12, y: 114, width: 103, height: 30, maxSizePt: 44, minSizePt: 12, maxLines: 2, breakWords: true,
      families: [f.display, f.title, f.body],
    },
    subtitle: {
      x: 18, y: 144, width: 91, height: 9, maxSizePt: 13, minSizePt: 8, families: [f.body, f.title], verticalAlign: 'top',
    },
    age: {
      x: 86, y: 8, width: 36, height: 36, maxSizePt: 32, minSizePt: 14, families: [f.display, f.body],
    },
    date: {
      x: 14, y: 162, width: 99, height: 8, maxSizePt: 11, minSizePt: 7, families: [f.body],
      textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 },
    },
    ...overrides,
  });
}

/** Box of a declared region — templates draw plates around exactly this space. */
export function regionBox(regions: RegionSet, id: RegionId, pad = 0): Box {
  const spec = regions[id];
  return { x: spec.x - pad, y: spec.y - pad, w: spec.width + pad * 2, h: spec.height + pad * 2 };
}

export const PRESETS: Record<LayoutPresetId, (f: FamilySet, overrides?: Partial<Record<RegionId, RegionOptions>>) => RegionSet> = {
  classic: classicLayout,
  medallion: medallionLayout,
  editorial: editorialLayout,
  band: bandLayout,
  diagonal: diagonalLayout,
  poster: posterLayout,
};

export function layout(
  preset: LayoutPresetId,
  families: FamilySet,
  overrides: Partial<Record<RegionId, RegionOptions>> = {},
  canvas?: { w: number; h: number },
): RegionSet {
  const regions = PRESETS[preset](families, overrides);
  const target = canvas ?? PRESET_CANVAS[preset];
  return clampRegionsToCanvas(regions, target);
}
