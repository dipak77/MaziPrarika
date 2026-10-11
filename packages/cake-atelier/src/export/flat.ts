/**
 * @mazi/cake-atelier — flat-ink preparation
 *
 * Two jobs, both about honesty:
 *
 *  1. **Assembly proof.** A printer proof of a layered build should show each
 *     layer in the colour of the paper it is cut from, not in the simulated
 *     metallic gradient that only exists on screen.
 *  2. **Cut files.** A cutting machine wants silhouettes. Gradients, soft
 *     shadows and hairline details are removed so the blade follows a shape
 *     rather than a texture.
 */

import { foilFlat, mixColors, resolveTokens } from '../palettes.js';
import { walk, type Paint, type Scene, type SceneNode, type ShapeNode, type Stroke } from '../scene.js';

export interface FlatSceneOptions {
  /** Replace gradation with a single flat ink. */
  flattenGradients?: boolean;
  /** Drop stroke-only details (they are printed, never cut). */
  dropStrokes?: boolean;
  /** Drop the printed texture/shadow plates. */
  dropShadows?: boolean;
  /** Recolour every node to its material colour (assembly proof). */
  colorByMaterial?: boolean;
  /** Palette id used when recolouring by material. */
  paletteId?: string;
}

function flattenPaint(paint: Paint | undefined, foil: string): Paint | undefined {
  if (!paint || typeof paint === 'string') return paint;
  return foil;
}

function flattenNode(node: SceneNode, options: Required<Pick<FlatSceneOptions, 'flattenGradients' | 'dropStrokes' | 'dropShadows'>>, foil: string): SceneNode | undefined {
  if (node.kind === 'group') {
    const children = node.children
      .map((child) => flattenNode(child, options, foil))
      .filter((child): child is SceneNode => Boolean(child));
    if (!children.length) return undefined;
    return { ...node, children };
  }
  if (node.kind === 'text') return node;

  let next: ShapeNode = { ...node };
  if (options.flattenGradients) next.fill = flattenPaint(node.fill, foil);
  if (options.dropStrokes && node.stroke) {
    // A stroke-only decorative shape has no fill of its own; without the stroke
    // there is nothing to cut, so the node goes away entirely.
    if (next.fill === undefined || next.fill === 'none') return undefined;
    next = { ...next, stroke: undefined as unknown as Stroke };
    delete (next as { stroke?: Stroke }).stroke;
  }
  if (options.dropShadows && next.role === 'backing' && next.id.includes('shadow')) return undefined;
  return next;
}

/** Flatten a scene's gradients to flat ink (used for proofs and cut files). */
export function flatFoilScene(scene: Scene, options: FlatSceneOptions = {}): Scene {
  const tokens = resolveTokens(scene.meta.paletteId, {}, {});
  const foil = foilFlat(tokens);
  const resolved = {
    flattenGradients: options.flattenGradients ?? true,
    dropStrokes: options.dropStrokes ?? false,
    dropShadows: options.dropShadows ?? false,
  };
  const nodes = scene.nodes
    .map((node) => flattenNode(node, resolved, foil))
    .filter((node): node is SceneNode => Boolean(node));
  let next: Scene = { ...scene, nodes };
  if (options.colorByMaterial) next = colorByMaterial(next, options.paletteId ?? scene.meta.paletteId);
  return next;
}

/**
 * Recolour every node to a shade representing its paper layer, keeping the
 * relative tone of the artwork. This is the "assembly proof": what the stacked
 * paper will actually look like, without any simulated metal or shadow ink.
 */
export function colorByMaterial(scene: Scene, paletteId: string): Scene {
  const tokens = resolveTokens(paletteId, {}, {});
  const palette: Record<string, string> = {
    shadow: mixColors(tokens.outline, '#000000', 0.35),
    backing: tokens.secondarySoft,
    base: tokens.surface,
    mid: mixColors(tokens.primary, tokens.surface, 0.4),
    accent: tokens.accent,
    foil: foilFlat(tokens),
  };

  const visit = (nodes: SceneNode[]): SceneNode[] =>
    nodes.map((node) => {
      if (node.kind === 'group') return { ...node, children: visit(node.children) };
      if (node.kind === 'text') return node;
      const material = node.material ?? 'base';
      return {
        ...node,
        fill: palette[material] ?? tokens.surface,
        stroke: undefined as unknown as Stroke,
      };
    });

  return { ...scene, nodes: visit(scene.nodes) };
}

/**
 * A heavier flat ink for cut-line previews: the silhouette is drawn in a single
 * saturated colour so it is unmistakable against the artwork.
 */
export function boldFlatFoil(scene: Scene, color = '#ff2d95'): Scene {
  const visit = (nodes: SceneNode[]): SceneNode[] =>
    nodes.map((node) => {
      if (node.kind === 'group') return { ...node, children: visit(node.children) };
      if (node.kind === 'text') return { ...node, fill: color };
      return { ...node, fill: color, stroke: undefined as unknown as Stroke };
    });
  return { ...scene, nodes: visit(scene.nodes), background: undefined };
}

/** Silk-screen style flat conversion for the cut-line preview overlay. */
export function flatFoil(scene: Scene): Scene {
  return flatFoilScene(scene, { flattenGradients: true, dropStrokes: false });
}

/** Count nodes removed by flattening — reported by the studio for transparency. */
export function flattenReport(scene: Scene): { before: number; after: number; removed: number } {
  let before = 0;
  walk(scene.nodes, () => {
    before += 1;
  });
  const flat = flatFoilScene(scene, { dropStrokes: true, dropShadows: true });
  let after = 0;
  walk(flat.nodes, () => {
    after += 1;
  });
  return { before, after, removed: before - after };
}

export { foilFlat };
