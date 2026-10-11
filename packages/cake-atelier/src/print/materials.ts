/**
 * @mazi/cake-atelier — paper materials and cut planning
 *
 * A layered paper design is a stack of physical sheets. Each scene node is
 * tagged with the material it is cut from; this module turns those tags into a
 * plan a human can act on: how many sheets, which colour, how much area, and
 * which contours are cuts versus scores.
 */

import { round } from '../geometry.js';
import { walk, type Scene, type SceneNode, type ShapeNode } from '../scene.js';
import type { MaterialSpec } from '../templates/types.js';

export interface MaterialUsage {
  material: string;
  label: string;
  color: string;
  weightGsm: number;
  note?: string;
  simulatedFoil?: boolean;
  /** Number of nodes drawn from this material. */
  nodeCount: number;
  /** Sum of the bounding-box areas of its cut contours, in mm². */
  cutAreaMm2: number;
  /** True when the layer contributes cut contours. */
  hasCutContours: boolean;
  /** True when the layer only carries printed detail on another sheet. */
  printOnly: boolean;
}

function boundsArea(d: string): number {
  // A cheap area proxy: bounding box of the numbers in the path data. Good
  // enough for a "how much paper do I need" estimate and never overstates.
  const numbers = d.match(/-?\d*\.?\d+/g);
  if (!numbers || numbers.length < 4) return 0;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const x = Number(numbers[i]);
    const y = Number(numbers[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) return 0;
  return Math.max(0, (maxX - minX) * (maxY - minY));
}

/**
 * Which material a node belongs to. Explicit tags win; otherwise the fallback
 * material is used (so an untagged decorative shape never disappears from the
 * layer list and silently stops being cut).
 */
export function materialOf(node: SceneNode, inherited: string | undefined, fallback: string): string {
  return node.material ?? inherited ?? fallback;
}

export function planMaterials(scene: Scene, declared: MaterialSpec[], fallback = 'base'): MaterialUsage[] {
  const usage = new Map<string, MaterialUsage>();
  const declaredById = new Map(declared.map((material) => [material.id, material]));

  const ensure = (id: string): MaterialUsage => {
    const existing = usage.get(id);
    if (existing) return existing;
    const spec = declaredById.get(id);
    const created: MaterialUsage = {
      material: id,
      label: spec?.label ?? `${id} (undeclared)`,
      color: spec?.color ?? '#FFFFFF',
      weightGsm: spec?.weightGsm ?? 250,
      ...(spec?.note ? { note: spec.note } : {}),
      ...(spec?.simulatedFoil ? { simulatedFoil: true } : {}),
      nodeCount: 0,
      cutAreaMm2: 0,
      hasCutContours: false,
      printOnly: true,
    };
    usage.set(id, created);
    return created;
  };

  walk(scene.nodes, (node, ctx) => {
    if (ctx.hidden) return;
    const id = materialOf(node, ctx.material, fallback);
    const entry = ensure(id);
    entry.nodeCount += 1;
    if (ctx.cut && node.kind === 'shape') {
      entry.hasCutContours = true;
      entry.printOnly = false;
      entry.cutAreaMm2 += boundsArea((node as ShapeNode).d);
    }
  });

  return [...usage.values()]
    .map((entry) => ({ ...entry, cutAreaMm2: round(entry.cutAreaMm2, 1) }))
    .sort((a, b) => a.material.localeCompare(b.material));
}

/** Human-readable cardstock breakdown for the production panel and report. */
export function cardstockBreakdown(plan: MaterialUsage[]): { material: string; label: string; color: string; sheets?: string; note?: string }[] {
  return plan.map((entry) => ({
    material: entry.material,
    label: entry.label,
    color: entry.color,
    ...(entry.simulatedFoil ? { note: 'Simulated metal gradient on the print — this is not a foil stamp unless your printer produces one.' } : {}),
    ...(entry.printOnly ? { note: entry.note ?? 'Printed detail only; no cut contour on this layer.' } : {}),
  }));
}

/**
 * Foil honesty: returns the note we show whenever a design uses a simulated
 * metallic gradient, and the optional separate spot-colour layer name.
 */
export function foilNotice(usesFoil: boolean): string | undefined {
  if (!usesFoil) return undefined;
  return 'Metallic areas are rendered as an RGB gradient that *looks* like foil. Ordinary inkjet/laser printing cannot produce metal. Ask your printer for a foil stamp or a metallic spot colour if you need the real thing — the layered export includes a separate foil layer for exactly that hand-off.';
}

export function totalCutArea(plan: MaterialUsage[]): number {
  return round(plan.reduce((sum, entry) => sum + entry.cutAreaMm2, 0), 1);
}
