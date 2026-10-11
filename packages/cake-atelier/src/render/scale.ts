/**
 * @mazi/cake-atelier — scene scaling
 *
 * Templates are authored at a nominal size (6 × 6 in by default) and every other
 * physical size is that design scaled uniformly. Scaling at the *scene* level —
 * path data, stroke widths, dash patterns, transforms, text sizes and gradient
 * coordinates — keeps the composition identical at 4 in and at 12 in, which is
 * exactly the promise the studio makes when a user changes size.
 */

import { multiplyMatrix, round, scaleMatrix, type Matrix } from '../geometry.js';
import { parsePath, stringifySegments, transformSegments } from '../path.js';
import type { Paint, Scene, SceneNode, ShapeNode, Stroke, TextNode } from '../scene.js';

function scalePaint(paint: Paint | undefined, factor: number): Paint | undefined {
  if (!paint || typeof paint === 'string') return paint;
  if (paint.type === 'linear') {
    return {
      ...paint,
      from: [paint.from[0] * factor, paint.from[1] * factor] as const,
      to: [paint.to[0] * factor, paint.to[1] * factor] as const,
    };
  }
  return { ...paint, center: [paint.center[0] * factor, paint.center[1] * factor] as const, radius: paint.radius * factor };
}

function scaleStroke(stroke: Stroke | undefined, factor: number): Stroke | undefined {
  if (!stroke) return stroke;
  const next: Stroke = { ...stroke, width: round(stroke.width * factor, 4) };
  if (stroke.dash) next.dash = stroke.dash.map((value: number) => round(value * factor, 4));
  return next;
}

function scaleNode(node: SceneNode, factor: number, cache: Map<string, string>): SceneNode {
  const transform: Matrix | undefined = node.transform ? multiplyMatrix(scaleMatrix(factor), node.transform) : undefined;

  if (node.kind === 'shape') {
    const cached = cache.get(node.d);
    const d = cached ?? stringifySegments(transformSegments(parsePath(node.d), scaleMatrix(factor)), 3);
    if (!cached) cache.set(node.d, d);
    const scaled: ShapeNode = { ...node, d, fill: scalePaint(node.fill, factor) };
    if (transform) scaled.transform = transform;
    if (node.stroke) scaled.stroke = scaleStroke(node.stroke, factor);
    return scaled;
  }
  if (node.kind === 'group') {
    const scaled = { ...node, children: node.children.map((child) => scaleNode(child, factor, cache)) };
    if (transform) scaled.transform = transform;
    return scaled;
  }
  const text: TextNode = { ...node };
  if (transform) text.transform = transform;
  text.size = round(node.size * factor, 4);
  text.letterSpacing = round(node.letterSpacing * factor, 4);
  if (node.stroke) text.stroke = scaleStroke(node.stroke, factor);
  text.fill = node.fill;
  text.lines = node.lines.map((line) => ({
    text: line.text,
    x: round(line.x * factor, 3),
    y: round(line.y * factor, 3),
    width: round(line.width * factor, 3),
  }));
  return text;
}

/** Uniformly scale a scene. Returns a new scene; the input is untouched. */
export function scaleScene(scene: Scene, factor: number): Scene {
  if (Math.abs(factor - 1) < 1e-9) return scene;
  const pathCache = new Map<string, string>();
  const clips: Record<string, string> = {};
  for (const [id, d] of Object.entries(scene.clips)) {
    clips[id] = stringifySegments(transformSegments(parsePath(d), scaleMatrix(factor)), 3);
  }
  return {
    ...scene,
    widthMm: round(scene.widthMm * factor, 4),
    heightMm: round(scene.heightMm * factor, 4),
    background: scalePaint(scene.background, factor),
    clips,
    nodes: scene.nodes.map((node) => scaleNode(node, factor, pathCache)),
    meta: {
      ...scene.meta,
      widthMm: round(scene.meta.widthMm * factor, 4),
      heightMm: round(scene.meta.heightMm * factor, 4),
    },
  };
}
