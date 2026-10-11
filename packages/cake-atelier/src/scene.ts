/**
 * @mazi/cake-atelier — the scene
 *
 * A scene is a flat, serialisable description of one finished topper. It is the
 * contract between the templates that *draw* and the exporters that *write*:
 * SVG, PDF, PNG, cut-line files and the React canvas all consume exactly the
 * same structure, so the preview cannot drift from the printed piece.
 *
 * Nodes are layered (`role`) rather than boolean-ordered, which keeps the paint
 * order stable no matter how a template assembles its arrays.
 */

import { IDENTITY, applyMatrix, hashSeed, multiplyMatrix, num, type Matrix, type Point } from './geometry.js';

export const LAYER_ROLES = [
  'background',
  'backing',
  'illustration',
  'secondary',
  'nameplate',
  'title',
  'subtitle',
  'name',
  'age',
  'accents',
  'production',
] as const;

export type LayerRole = (typeof LAYER_ROLES)[number];

export interface GradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

export type Paint =
  | string
  | { type: 'linear'; from: Point; to: Point; stops: GradientStop[] }
  | { type: 'radial'; center: Point; radius: number; stops: GradientStop[] };

export interface Stroke {
  color: string;
  width: number;
  opacity?: number;
  dash?: number[];
  cap?: 'butt' | 'round' | 'square';
  join?: 'miter' | 'round' | 'bevel';
}

/** Physical paper a node is cut from. Untagged nodes inherit from their group. */
export type MaterialId = string;

interface NodeBase {
  id: string;
  role: LayerRole;
  material?: MaterialId;
  label?: string;
  opacity?: number;
  transform?: Matrix;
  clip?: string;
  hidden?: boolean;
  /** Contributes a cut contour in layered output. */
  cut?: boolean;
  /** Contributes a score (fold) line in layered output. */
  score?: boolean;
}

export interface ShapeNode extends NodeBase {
  kind: 'shape';
  d: string;
  fill?: Paint;
  stroke?: Stroke;
  fillRule?: 'nonzero' | 'evenodd';
}

export interface GroupNode extends NodeBase {
  kind: 'group';
  children: SceneNode[];
}

/** Options accepted by a group node (identical to a shape minus the paint). */
export type GroupOptions = Omit<ShapeOptions, 'd' | 'fill' | 'stroke' | 'fillRule'>;

export interface TextLine {
  text: string;
  /** Baseline start (anchor depends on `anchor`). */
  x: number;
  y: number;
  width: number;
}

export interface TextNode extends NodeBase {
  kind: 'text';
  lines: TextLine[];
  family: string;
  /** Resolved face id, e.g. `playfair-display-700`. */
  faceId?: string;
  weight: number;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  anchor: 'start' | 'middle' | 'end';
  fill: string;
  /** Baseline behaviour when converting to outlines. */
  baseline: 'alphabetic';
  /** Kept as live `<text>` in SVG output when the exporter is asked for editable text. */
  editable?: boolean;
  /** Optional hairline around the glyphs (used by dark-paper palettes). */
  stroke?: Stroke;
}

export type SceneNode = ShapeNode | GroupNode | TextNode;

export interface SceneMeta {
  templateId: string;
  templateVersion: number;
  paletteId: string;
  projectName: string;
  /** Deterministic content revision — the cache key for exports. */
  revision: string;
  generatedAt: string;
  widthMm: number;
  heightMm: number;
  [key: string]: string | number | boolean | undefined;
}

export interface Scene {
  widthMm: number;
  heightMm: number;
  background?: Paint;
  nodes: SceneNode[];
  meta: SceneMeta;
  /**
   * Extra clip paths referenced by `clip` ids on nodes. Kept next to the scene
   * so the SVG and PDF writers agree on what "inside" means.
   */
  clips: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/* Node constructors                                                   */
/* ------------------------------------------------------------------ */

let idCounter = 0;

/** Reset per build so generated ids are stable for identical input. */
export function resetIds(): void {
  idCounter = 0;
}

export function nid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export interface ShapeOptions {
  id?: string;
  role?: LayerRole;
  material?: MaterialId;
  label?: string;
  fill?: Paint;
  stroke?: Stroke;
  opacity?: number;
  transform?: Matrix;
  clip?: string;
  fillRule?: 'nonzero' | 'evenodd';
  cut?: boolean;
  score?: boolean;
}

export function shape(d: string, options: ShapeOptions = {}): ShapeNode {
  const node: ShapeNode = {
    kind: 'shape',
    id: options.id ?? nid('s'),
    role: options.role ?? 'illustration',
    d,
    cut: options.cut ?? (options.role === 'backing' || options.role === 'illustration'),
    ...(options.material !== undefined ? { material: options.material } : {}),
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.fill !== undefined ? { fill: options.fill } : {}),
    ...(options.stroke !== undefined ? { stroke: options.stroke } : {}),
    ...(options.opacity !== undefined ? { opacity: options.opacity } : {}),
    ...(options.transform !== undefined ? { transform: options.transform } : {}),
    ...(options.clip !== undefined ? { clip: options.clip } : {}),
    ...(options.fillRule !== undefined ? { fillRule: options.fillRule } : {}),
    ...(options.score !== undefined ? { score: options.score } : {}),
  };
  return node;
}

export function group(children: SceneNode[], options: GroupOptions = {}): GroupNode {
  return {
    kind: 'group',
    id: options.id ?? nid('g'),
    role: options.role ?? 'illustration',
    children,
    ...(options.material !== undefined ? { material: options.material } : {}),
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.opacity !== undefined ? { opacity: options.opacity } : {}),
    ...(options.transform !== undefined ? { transform: options.transform } : {}),
    ...(options.clip !== undefined ? { clip: options.clip } : {}),
    ...(options.cut !== undefined ? { cut: options.cut } : {}),
    ...(options.score !== undefined ? { score: options.score } : {}),
  };
}

export interface TextNodeOptions {
  id?: string;
  role?: LayerRole;
  material?: MaterialId;
  label?: string;
  anchor?: TextNode['anchor'];
  opacity?: number;
  transform?: Matrix;
  faceId?: string;
  hidden?: boolean;
  editable?: boolean;
}

export function text(
  value: string,
  options: {
    x: number;
    y: number;
    family: string;
    weight: number;
    size: number;
    lineHeight?: number;
    letterSpacing?: number;
    fill: string;
    width?: number;
  } & TextNodeOptions,
): TextNode {
  return {
    kind: 'text',
    id: options.id ?? nid('t'),
    role: options.role ?? 'name',
    lines: [{ text: value, x: options.x, y: options.y, width: options.width ?? 0 }],
    family: options.family,
    weight: options.weight,
    size: options.size,
    lineHeight: options.lineHeight ?? 1.15,
    letterSpacing: options.letterSpacing ?? 0,
    anchor: options.anchor ?? 'middle',
    fill: options.fill,
    baseline: 'alphabetic',
    ...(options.material !== undefined ? { material: options.material } : {}),
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.opacity !== undefined ? { opacity: options.opacity } : {}),
    ...(options.transform !== undefined ? { transform: options.transform } : {}),
    ...(options.faceId !== undefined ? { faceId: options.faceId } : {}),
    ...(options.hidden !== undefined ? { hidden: options.hidden } : {}),
    ...(options.editable !== undefined ? { editable: options.editable } : {}),
  };
}

export function multiLineText(
  lines: TextLine[],
  options: {
    family: string;
    weight: number;
    size: number;
    lineHeight?: number;
    letterSpacing?: number;
    fill: string;
  } & TextNodeOptions,
): TextNode {
  return {
    kind: 'text',
    id: options.id ?? nid('t'),
    role: options.role ?? 'name',
    lines,
    family: options.family,
    weight: options.weight,
    size: options.size,
    lineHeight: options.lineHeight ?? 1.15,
    letterSpacing: options.letterSpacing ?? 0,
    anchor: options.anchor ?? 'middle',
    fill: options.fill,
    baseline: 'alphabetic',
    ...(options.material !== undefined ? { material: options.material } : {}),
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.opacity !== undefined ? { opacity: options.opacity } : {}),
    ...(options.transform !== undefined ? { transform: options.transform } : {}),
    ...(options.faceId !== undefined ? { faceId: options.faceId } : {}),
    ...(options.hidden !== undefined ? { hidden: options.hidden } : {}),
    ...(options.editable !== undefined ? { editable: options.editable } : {}),
  };
}

export function linearGradient(from: Point, to: Point, stops: GradientStop[]): Paint {
  return { type: 'linear', from, to, stops };
}

export function radialGradient(center: Point, radius: number, stops: GradientStop[]): Paint {
  return { type: 'radial', center, radius, stops };
}

/** Hex + alpha → rgba() string, used for soft shadows and paper layers. */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return color;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/* ------------------------------------------------------------------ */
/* Traversal                                                           */
/* ------------------------------------------------------------------ */

export interface WalkContext {
  role: LayerRole;
  material?: MaterialId;
  matrix: Matrix;
  clip?: string;
  hidden: boolean;
  depth: number;
  cut: boolean;
}

/**
 * Depth-first visit with inherited material, transform, clip and cut flags.
 * Every consumer (renderers, layer planner, preflight, scene queries) uses this
 * one implementation so "what inherits what" has a single answer.
 */
export function walk(
  nodes: SceneNode[],
  visit: (node: SceneNode, context: WalkContext) => void,
  parent?: Partial<WalkContext>,
): void {
  const base: WalkContext = {
    role: parent?.role ?? 'illustration',
    matrix: parent?.matrix ?? IDENTITY,
    hidden: parent?.hidden ?? false,
    depth: parent?.depth ?? 0,
    cut: parent?.cut ?? false,
    ...(parent?.material !== undefined ? { material: parent.material } : {}),
    ...(parent?.clip !== undefined ? { clip: parent.clip } : {}),
  };
  for (const node of nodes) {
    const context: WalkContext = {
      role: node.role,
      material: node.material ?? base.material,
      matrix: node.transform ? multiplyMatrix(base.matrix, node.transform) : base.matrix,
      clip: node.clip ?? base.clip,
      hidden: base.hidden || node.hidden === true,
      depth: base.depth,
      cut: node.cut ?? base.cut,
    };
    visit(node, context);
    if (node.kind === 'group') walk(node.children, visit, { ...context, depth: context.depth + 1 });
  }
}

/** Collect the text nodes (used for font resolution, preflight and outlines). */
export function collectTextNodes(scene: Scene): TextNode[] {
  const out: TextNode[] = [];
  const visit = (nodes: SceneNode[]): void => {
    for (const node of nodes) {
      if (node.hidden) continue;
      if (node.kind === 'text') out.push(node);
      else if (node.kind === 'group') visit(node.children);
    }
  };
  visit(scene.nodes);
  return out;
}

/** Every distinct material used, in first-seen order. */
export function collectMaterials(scene: Scene): MaterialId[] {
  const seen: MaterialId[] = [];
  walk(scene.nodes, (node, context) => {
    if (context.hidden) return;
    const material = node.material ?? context.material;
    if (material && !seen.includes(material)) seen.push(material);
  });
  return seen;
}

/** Sub-scene containing only the nodes of one material (background stripped). */
export function sceneForMaterial(scene: Scene, material: MaterialId, fallback = 'base'): Scene {
  const filter = (nodes: SceneNode[], inherited?: MaterialId): SceneNode[] => {
    const out: SceneNode[] = [];
    for (const node of nodes) {
      const nodeMaterial = node.material ?? inherited ?? fallback;
      if (node.kind === 'group') {
        const children = filter(node.children, nodeMaterial);
        if (children.length) out.push({ ...node, children });
        continue;
      }
      if (nodeMaterial === material) out.push(node);
    }
    return out;
  };
  return { ...scene, background: undefined, nodes: filter(scene.nodes, undefined) };
}

/** Bounding box of a node's geometry, in scene units. */
export function nodeBounds(node: SceneNode): { minX: number; minY: number; maxX: number; maxY: number } | undefined {
  if (node.kind !== 'shape') return undefined;
  const numbers = node.d.match(/-?\d*\.?\d+/g);
  if (!numbers) return undefined;
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
  if (!Number.isFinite(minX)) return undefined;
  return { minX, minY, maxX, maxY };
}

export interface SceneBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function sceneBounds(scene: Scene, options: { cutOnly?: boolean } = {}): SceneBounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  walk(scene.nodes, (node, context) => {
    if (context.hidden) return;
    if (options.cutOnly && !context.cut) return;
    const box = nodeBounds(node);
    if (!box) return;
    minX = Math.min(minX, box.minX);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX);
    maxY = Math.max(maxY, box.maxY);
  });
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: scene.widthMm, maxY: scene.heightMm, width: scene.widthMm, height: scene.heightMm };
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Cut contours (through-cuts) and score lines, in scene coordinates. */
export function extractContours(scene: Scene): { cuts: { id: string; d: string; material?: MaterialId }[]; scores: { id: string; d: string }[] } {
  const cuts: { id: string; d: string; material?: MaterialId }[] = [];
  const scores: { id: string; d: string }[] = [];
  walk(scene.nodes, (node, context) => {
    if (context.hidden || node.kind !== 'shape') return;
    if (node.score) {
      scores.push({ id: node.id, d: node.d });
      return;
    }
    if (context.cut) {
      cuts.push({ id: node.id, d: node.d, ...(node.material !== undefined ? { material: node.material } : context.material !== undefined ? { material: context.material } : {}) });
    }
  });
  return { cuts, scores };
}

/** Stable content hash of a scene — the export cache key and revision stamp. */
export function sceneFingerprint(scene: Scene): string {
  const parts: string[] = [`${scene.widthMm}x${scene.heightMm}`, scene.meta.templateId, String(scene.meta.templateVersion), scene.meta.paletteId];
  let hash = 2166136261;
  const mix = (value: string): void => {
    hash ^= hashSeed(value);
    hash = Math.imul(hash, 16777619) >>> 0;
  };
  for (const part of parts) mix(part);
  walk(scene.nodes, (node, context) => {
    if (context.hidden) return;
    mix(`${node.kind}:${node.role}:${node.material ?? ''}:${context.cut ? '1' : '0'}`);
    if (node.kind === 'shape') {
      mix(node.d);
      mix(typeof node.fill === 'string' ? node.fill : node.fill ? JSON.stringify(node.fill) : '');
      mix(node.stroke ? `${node.stroke.color}:${node.stroke.width}` : '');
    } else if (node.kind === 'text') {
      mix(`${node.family}:${node.weight}:${node.size}:${node.letterSpacing}:${node.anchor}`);
      for (const line of node.lines) mix(`${line.text}@${line.x},${line.y}`);
    }
  });
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Apply a matrix to every node (used for size scaling and preview transforms). */
export function transformScene(scene: Scene, matrix: Matrix): Scene {
  const apply = (nodes: SceneNode[]): SceneNode[] =>
    nodes.map((node) => {
      if (node.kind === 'group') {
        return { ...node, transform: node.transform ? multiplyMatrix(node.transform, matrix) : matrix, children: apply(node.children) };
      }
      return { ...node, transform: node.transform ? multiplyMatrix(node.transform, matrix) : matrix };
    });
  return { ...scene, nodes: apply(scene.nodes) };
}

/** Where a node's geometry ends up after inherited transforms (for reports). */
export function resolveNodePoint(context: { matrix: Matrix }, point: Point): Point {
  return applyMatrix(context.matrix, point);
}

export function formatPoint(point: Point): string {
  return `${num(point[0])},${num(point[1])}`;
}

/** Deep-ish clone: nodes are copied so callers can mutate freely. */
export function cloneScene(scene: Scene): Scene {
  const clone = (nodes: SceneNode[]): SceneNode[] =>
    nodes.map((node) => {
      const copy: SceneNode = { ...node };
      if (copy.kind === 'group') copy.children = clone(node.kind === 'group' ? node.children : []);
      if (copy.kind === 'text') copy.lines = node.kind === 'text' ? node.lines.map((line) => ({ ...line })) : [];
      return copy;
    });
  return { ...scene, nodes: clone(scene.nodes), clips: { ...scene.clips } };
}

/** Sorting by role keeps the paint order identical for every exporter. */
export function sortByRole(nodes: SceneNode[]): SceneNode[] {
  const rank = new Map(LAYER_ROLES.map((role, index) => [role, index]));
  return [...nodes].sort((a, b) => (rank.get(a.role) ?? 99) - (rank.get(b.role) ?? 99));
}
