/**
 * @mazi/cake-atelier — art primitives: shared plumbing
 *
 * Every template composes these. The context carries the resolved palette, the
 * paper material the shapes belong to (used by the layered export) and a
 * deterministic id factory so re-renders never reorder the DOM or invalidate the
 * outline cache.
 */

import { round } from '../geometry.js';
import type { PaletteTokens } from '../palettes.js';
import { group, shape, type GroupNode, type Paint, type SceneNode, type ShapeNode, type ShapeOptions, type GroupOptions } from '../scene.js';

export interface ArtCtx {
  pal: PaletteTokens;
  /** Material id for shapes drawn without an explicit override. */
  material: string;
  /** Stable per-label id generator. */
  id: (label: string) => string;
  /** Marks shapes as cut contours for the selected labels. */
  cutLabels?: (label: string) => boolean;
}

export function artCtx(pal: PaletteTokens, material: string, namespace: string): ArtCtx {
  const counters = new Map<string, number>();
  return {
    pal,
    material,
    id: (label: string) => {
      const next = (counters.get(label) ?? 0) + 1;
      counters.set(label, next);
      return `${namespace}:${label}-${next}`;
    },
  };
}

/** Shape helper bound to a context (fill is required — art is never invisible). */
export function ink(ctx: ArtCtx, label: string, d: string, fill: Paint, options: ShapeOptions = {}): ShapeNode {
  // Options are spread first so that an explicit `undefined` never clobbers a
  // computed default: `{ material: undefined }` means "inherit", not "clear".
  return shape(d, {
    ...options,
    id: options.id ?? ctx.id(label),
    role: options.role ?? 'illustration',
    material: options.material ?? ctx.material,
    fill,
  });
}

export function stack(ctx: ArtCtx, label: string, children: SceneNode[], options: GroupOptions = {}): GroupNode {
  return group(children, {
    ...options,
    id: options.id ?? ctx.id(label),
    role: options.role ?? 'illustration',
    material: options.material ?? ctx.material,
    label: options.label ?? label,
  });
}

/** Stroke-only detail (seams, smile lines, spokes). Never a cut contour. */
export function line(
  ctx: ArtCtx,
  label: string,
  d: string,
  color: string,
  width: number,
  options: ShapeOptions = {},
): ShapeNode {
  return shape(d, {
    ...options,
    id: options.id ?? ctx.id(label),
    role: options.role ?? 'illustration',
    material: options.material ?? ctx.material,
    stroke: { color, width: round(width, 3), cap: 'round', join: 'round' },
    fill: undefined,
  });
}

export const deg = (d: number): number => (d * Math.PI) / 180;

/** Rotate a point around a centre — handy for petals, rays and flags. */
export function rotateAround(
  cx: number,
  cy: number,
  x: number,
  y: number,
  angle: number,
): [number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - cx;
  const dy = y - cy;
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
}
