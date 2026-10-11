/**
 * @mazi/cake-atelier — layered cardstock output
 *
 * Splits a scene into one file per physical paper: only the shapes that belong
 * to that material, keeping their original coordinates so the layers align
 * perfectly when stacked. Cut contours and score lines stay separate from
 * printed colour, because a decorative hairline is not a place to run a blade.
 */

import { num, round } from '../geometry.js';
import { parsePath, stringifySegments, transformSegments } from '../path.js';
import { multiplyMatrix, IDENTITY, type Matrix } from '../geometry.js';
import { walk, type Scene, type SceneNode, type ShapeNode, type TextNode } from '../scene.js';
import type { MaterialSpec } from '../templates/types.js';
import { planMaterials, type MaterialUsage } from './materials.js';

export interface LayerContour {
  nodeId: string;
  d: string;
  /** `cut` for through-cuts, `score` for folds. */
  kind: 'cut' | 'score';
  label?: string;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface LayerPlan {
  material: string;
  label: string;
  color: string;
  weightGsm: number;
  note?: string;
  simulatedFoil?: boolean;
  /** Scene restricted to this material, ready for the SVG/PDF renderer. */
  scene: Scene;
  cutContours: LayerContour[];
  scoreContours: LayerContour[];
  usage: MaterialUsage;
}

export interface LayerPlanOptions {
  /** Material id used for nodes that were never tagged. */
  fallbackMaterial?: string;
  /** Keep printed colour in the cut files (useful for hand-cutting). */
  includeColor?: boolean;
  /** Only emit layers that actually have cut contours. */
  cutOnly?: boolean;
}

function extractContours(scene: Scene, material: string, fallback: string): { cuts: LayerContour[]; scores: LayerContour[] } {
  const cuts: LayerContour[] = [];
  const scores: LayerContour[] = [];

  const visit = (nodes: SceneNode[], inheritedMaterial: string | undefined, matrix: Matrix, hidden: boolean): void => {
    for (const node of nodes) {
      const hiddenNode = hidden || node.hidden === true;
      if (hiddenNode) continue;
      const materialId = node.material ?? inheritedMaterial ?? fallback;
      const nodeMatrix = node.transform ? multiplyMatrix(matrix, node.transform) : matrix;
      if (node.kind === 'group') {
        visit(node.children, materialId, nodeMatrix, hiddenNode);
        continue;
      }
      if (materialId !== material) continue;
      if (node.kind === 'text' || !node.cut && !node.score) continue;

      if (node.kind === 'shape') {
        const d = stringifySegments(transformSegments(parsePath(node.d), nodeMatrix), 3);
        const contour: LayerContour = {
          nodeId: node.id,
          d,
          kind: node.score ? 'score' : 'cut',
          ...(node.label ? { label: node.label } : {}),
          bounds: pathBoundsApprox(d),
        };
        if (node.score) scores.push(contour);
        else cuts.push(contour);
      }
    }
  };

  visit(scene.nodes, undefined, IDENTITY, false);
  return { cuts, scores };
}

function pathBoundsApprox(d: string): { minX: number; minY: number; maxX: number; maxY: number } {
  const numbers = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let i = 0; i + 1 < numbers.length; i += 2) {
    const x = numbers[i]!;
    const y = numbers[i + 1]!;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX: round(minX, 2), minY: round(minY, 2), maxX: round(maxX, 2), maxY: round(maxY, 2) };
}

function filterScene(scene: Scene, material: string, fallback: string): Scene {
  const visit = (nodes: SceneNode[], inherited: string | undefined): SceneNode[] => {
    const out: SceneNode[] = [];
    for (const node of nodes) {
      const materialId = node.material ?? inherited ?? fallback;
      if (node.kind === 'group') {
        const children = visit(node.children, materialId);
        if (children.length) out.push({ ...node, children });
        continue;
      }
      if (materialId === material) out.push(node);
    }
    return out;
  };
  return { ...scene, background: undefined, nodes: visit(scene.nodes, undefined) };
}

/** Split a scene into per-material layers. */
export function planLayers(scene: Scene, declared: MaterialSpec[], options: LayerPlanOptions = {}): LayerPlan[] {
  const fallback = options.fallbackMaterial ?? 'base';
  const usage = planMaterials(scene, declared, fallback);
  const declaredById = new Map(declared.map((material) => [material.id, material]));
  const plans: LayerPlan[] = [];

  for (const entry of usage) {
    const spec = declaredById.get(entry.material);
    const { cuts, scores } = extractContours(scene, entry.material, fallback);
    if (options.cutOnly && !cuts.length) continue;
    plans.push({
      material: entry.material,
      label: spec?.label ?? entry.label,
      color: spec?.color ?? '#FFFFFF',
      weightGsm: spec?.weightGsm ?? 250,
      ...(spec?.note ? { note: spec.note } : {}),
      ...(spec?.simulatedFoil ? { simulatedFoil: true } : {}),
      scene: filterScene(scene, entry.material, fallback),
      cutContours: cuts,
      scoreContours: scores,
      usage: entry,
    });
  }

  return plans.sort((a, b) => layerRank(a.material) - layerRank(b.material) || a.material.localeCompare(b.material));
}

function layerRank(material: string): number {
  const order = ['shadow', 'backing', 'base', 'mid', 'accent', 'foil'];
  const index = order.indexOf(material);
  return index === -1 ? order.length : index;
}

/** SVG for a single layer: artwork in its paper colour plus its cut contours. */
export function renderLayerSvg(
  scene: Scene,
  layer: LayerPlan,
  options: {
    /** Emit the layer in a single flat colour (matte proof). */
    flat?: boolean;
    /** Include furniture: registration marks and contour labels. */
    registration?: boolean;
    showCutContours?: boolean;
    showScoreLines?: boolean;
    unitScale?: number;
  } = {},
): string {
  const pad = 6;
  const w = scene.widthMm;
  const h = scene.heightMm;
  const body: string[] = [];

  const paintFor = (node: ShapeNode): string => {
    if (!options.flat) {
      if (typeof node.fill === 'string') return node.fill;
      if (node.fill === undefined) return 'none';
      return node.fill.stops[0]?.color ?? '#cccccc';
    }
    return layer.color;
  };

  const visit = (nodes: SceneNode[], matrix: Matrix, inherited: string | undefined): void => {
    for (const node of nodes) {
      if (node.hidden) continue;
      const materialId = node.material ?? inherited ?? 'base';
      if (materialId !== layer.material) continue;
      const nodeMatrix = node.transform ? multiplyMatrix(matrix, node.transform) : matrix;
      if (node.kind === 'group') {
        visit(node.children, nodeMatrix, materialId);
        continue;
      }
      const transform = `matrix(${nodeMatrix.map((value) => num(value, 5)).join(' ')})`;
      if (node.kind === 'shape') {
        const rule = node.fillRule === 'evenodd' ? ' fill-rule="evenodd"' : '';
        const stroke = node.stroke
          ? ` stroke="${node.stroke.color}" stroke-width="${num(node.stroke.width, 3)}"`
          : '';
        body.push(`<path d="${node.d}" transform="${transform}" fill="${paintFor(node)}"${rule}${stroke} data-node="${node.id}"/>`);
      } else {
        const text = node as TextNode;
        for (const line of text.lines) {
          body.push(
            `<text x="${num(line.x, 3)}" y="${num(line.y, 3)}" font-family="${text.family}" font-size="${num(text.size, 3)}" font-weight="${text.weight}" text-anchor="${text.anchor}" letter-spacing="${num(text.letterSpacing, 4)}" transform="${transform}" fill="${layer.color}" data-node="${node.id}">${line.text.replace(/[<&>]/g, '')}</text>`,
          );
        }
      }
    }
  };
  visit(scene.nodes, IDENTITY, undefined);

  const contours: string[] = [];
  if (options.showCutContours !== false) {
    for (const contour of layer.cutContours) {
      contours.push(`<path d="${contour.d}" fill="none" stroke="#ff2d95" stroke-width="0.18" data-cut="true" data-node="${contour.nodeId}"/>`);
    }
  }
  if (options.showScoreLines) {
    for (const contour of layer.scoreContours) {
      contours.push(
        `<path d="${contour.d}" fill="none" stroke="#00a0ff" stroke-width="0.18" stroke-dasharray="2 1.5" data-score="true" data-node="${contour.nodeId}"/>`,
      );
    }
  }

  const furniture: string[] = [];
  if (options.registration) {
    furniture.push(
      `<rect x="${num(-pad * 0.6)}" y="${num(-pad * 0.6)}" width="${num(w + pad * 1.2)}" height="${num(h + pad * 1.2)}" fill="none" stroke="#9a9a9a" stroke-width="0.2" data-mark="bounds"/>`,
    );
    const mark = (x: number, y: number) =>
      `<path d="M ${num(x - 3)} ${num(y)} L ${num(x + 3)} ${num(y)} M ${num(x)} ${num(y - 3)} L ${num(x)} ${num(y + 3)}" stroke="#111" stroke-width="0.2" fill="none" data-mark="registration"/>`;
    furniture.push(mark(4, 4), mark(w - 4, 4), mark(4, h - 4), mark(w - 4, h - 4));
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${num(w)}mm" height="${num(h)}mm" viewBox="0 0 ${num(w)} ${num(h)}" data-layer="${layer.material}" data-label="${layer.label}">`,
    `<title>${layer.label} — cut layer</title>`,
    `<desc>Material: ${layer.material}. Cut contours are stroked in magenta; ${layer.cutContours.length} contour(s), ${layer.scoreContours.length} score line(s).</desc>`,
    `<g data-artwork="true">${body.join('')}</g>`,
    `<g data-contours="true">${contours.join('')}</g>`,
    `<g data-furniture="true">${furniture.join('')}</g>`,
    '</svg>',
  ].join('\n');
}

export interface LayerManifest {
  version: number;
  generatedAt: string;
  templateId: string;
  revision: string;
  widthMm: number;
  heightMm: number;
  layers: {
    file: string;
    material: string;
    label: string;
    color: string;
    weightGsm: number;
    cutContours: number;
    scoreContours: number;
    note?: string;
    simulatedFoil?: boolean;
  }[];
  assembly: {
    order: string[];
    notes: string[];
    registration: boolean;
    tolerances: { cutMm: number; glueMm: number };
  };
}

export interface ManifestOptions {
  generatedAt?: string;
  /** Cutting tolerance in millimetres baked into the advice. */
  cutToleranceMm?: number;
  registration?: boolean;
}

export function buildLayerManifest(
  plan: LayerPlan[],
  scene: Scene,
  options: ManifestOptions = {},
): LayerManifest {
  const cutTolerance = options.cutToleranceMm ?? 0.3;
  const manifest: LayerManifest = {
    version: 1,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    templateId: scene.meta.templateId,
    revision: scene.meta.revision,
    widthMm: scene.widthMm,
    heightMm: scene.heightMm,
    layers: plan.map((layer) => ({
      file: `layer-${layer.material}.svg`,
      material: layer.material,
      label: layer.label,
      color: layer.color,
      weightGsm: layer.weightGsm,
      cutContours: layer.cutContours.length,
      scoreContours: layer.scoreContours.length,
      ...(layer.note ? { note: layer.note } : {}),
      ...(layer.simulatedFoil ? { simulatedFoil: true } : {}),
    })),
    assembly: {
      order: plan.map((layer) => layer.material),
      notes: [
        'Cut every layer file first, then stack in the order listed — later layers sit on top.',
        `Cut on the contour with a ${cutTolerance} mm tolerance; test one piece before cutting the set.`,
        'Registration marks are printed on all four sides of every layer; align them before gluing.',
        'Keep glue at least 5 mm inside the contour so it does not squeeze out onto the front.',
        'The magenta contour is a cut; the dashed blue line is a score (fold), not a cut.',
      ],
      registration: options.registration ?? true,
      tolerances: { cutMm: cutTolerance, glueMm: 5 },
    },
  };
  return manifest;
}

/** The list of files a layered package contains (used by tests and the API). */
export function layerFileNames(plan: LayerPlan[]): string[] {
  return [...plan.map((layer) => `layer-${layer.material}.svg`), 'manifest.json', 'ASSEMBLY.txt'];
}
