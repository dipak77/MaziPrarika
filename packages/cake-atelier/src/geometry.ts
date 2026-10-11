/**
 * @mazi/cake-atelier — geometry
 *
 * Every shape in Cake Atelier Pro is a path built here from cubic Béziers.
 * Nothing else is allowed to invent coordinates: the exporters (SVG, PDF,
 * cut-line files and the raster pipeline) all consume the same path data, so a
 * circle is the same circle everywhere.
 *
 * Units: scene units are millimetres at the template's nominal size. Angles are
 * radians unless a name says otherwise.
 */

export const TAU = Math.PI * 2;
export const MM_PER_INCH = 25.4;
export const PT_PER_INCH = 72;
export const MM_PER_PT = MM_PER_INCH / PT_PER_INCH;

export type Point = readonly [number, number];
export type Matrix = readonly [number, number, number, number, number, number];

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Compact number formatting for path data and SVG output. */
export function num(value: number, decimals = 3): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = round(value, decimals);
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function deg(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Polar → cartesian, with 0° pointing right and angles growing clockwise (SVG convention). */
export function polar(cx: number, cy: number, radius: number, angle: number): Point {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function midpoint(a: Point, b: Point): Point {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Smooth perpendicular of a segment — used by ribbon and banner folds. */
export function normal(a: Point, b: Point, length: number): Point {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [(-dy / len) * length, (dx / len) * length];
}

/* ------------------------------------------------------------------ */
/* Matrices                                                            */
/* ------------------------------------------------------------------ */

export function multiplyMatrix(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

export function translateMatrix(dx: number, dy: number): Matrix {
  return [1, 0, 0, 1, dx, dy];
}

export function scaleMatrix(sx: number, sy: number = sx): Matrix {
  return [sx, 0, 0, sy, 0, 0];
}

export function rotateMatrix(angle: number): Matrix {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c, s, -s, c, 0, 0];
}

/**
 * Rotation matrix. Two call styles are supported because both read naturally:
 * `rotateMatrix(angle)` about the origin, and `rotateMatrix(angle, cx, cy)`
 * about a point (which is what the art library wants for rotated petals,
 * confetti and tilted crowns).
 */
export function rotationMatrix(angle: number, cx = 0, cy = 0): Matrix {
  return cx === 0 && cy === 0 ? rotateMatrix(angle) : rotateAbout(cx, cy, angle);
}

/** Rotate about a point: translate → rotate → translate back. */
export function rotateAbout(cx: number, cy: number, angle: number): Matrix {
  return multiplyMatrix(translateMatrix(cx, cy), multiplyMatrix(rotateMatrix(angle), translateMatrix(-cx, -cy)));
}

/** Matrix literal constructor — keeps call sites readable. */
export function matrix(a: number, b: number, c: number, d: number, e: number, f: number): Matrix {
  return [a, b, c, d, e, f];
}

/** Evenly spaced points on an arc — pearls, beads, lantern strings, garlands. */
export function distributeOnArc(cx: number, cy: number, r: number, from: number, to: number, count: number): Point[] {
  if (count <= 0) return [];
  if (count === 1) return [polar(cx, cy, r, (from + to) / 2)];
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) points.push(polar(cx, cy, r, lerp(from, to, i / (count - 1))));
  return points;
}

export function applyMatrix(m: Matrix, p: Point): Point {
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

/* ------------------------------------------------------------------ */
/* Path builder                                                        */
/* ------------------------------------------------------------------ */

type Command =
  | { kind: 'M'; to: Point }
  | { kind: 'L'; to: Point }
  | { kind: 'C'; c1: Point; c2: Point; to: Point }
  | { kind: 'Z' };

/** A tiny immutable-ish path builder: readable construction, exact output. */
export class PathBuilder {
  private commands: Command[] = [];

  static start(): PathBuilder {
    return new PathBuilder();
  }

  moveTo(x: number, y: number): this {
    this.commands.push({ kind: 'M', to: [x, y] });
    return this;
  }

  lineTo(x: number, y: number): this {
    this.commands.push({ kind: 'L', to: [x, y] });
    return this;
  }

  curveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): this {
    this.commands.push({ kind: 'C', c1: [c1x, c1y], c2: [c2x, c2y], to: [x, y] });
    return this;
  }

  close(): this {
    this.commands.push({ kind: 'Z' });
    return this;
  }

  /** Append raw cubic segments from another builder (keeping the current subpath open). */
  append(other: PathBuilder): this {
    for (const command of other.commands) this.commands.push(command);
    return this;
  }

  toString(decimals = 3): string {
    const parts: string[] = [];
    let cursor: Point | null = null;
    for (const command of this.commands) {
      switch (command.kind) {
        case 'M':
          parts.push(`M ${num(command.to[0], decimals)} ${num(command.to[1], decimals)}`);
          cursor = command.to;
          break;
        case 'L':
          parts.push(`L ${num(command.to[0], decimals)} ${num(command.to[1], decimals)}`);
          cursor = command.to;
          break;
        case 'C':
          parts.push(
            `C ${num(command.c1[0], decimals)} ${num(command.c1[1], decimals)} ${num(command.c2[0], decimals)} ${num(command.c2[1], decimals)} ${num(command.to[0], decimals)} ${num(command.to[1], decimals)}`,
          );
          cursor = command.to;
          break;
        case 'Z':
          parts.push('Z');
          cursor = null;
          break;
      }
    }
    void cursor;
    return parts.join(' ');
  }
}

/** Circle → four cubic segments. `k` is the classic 0.5522847498 magic number. */
export function circlePath(cx: number, cy: number, r: number): string {
  return ellipsePath(cx, cy, r, r);
}

export function ellipsePath(cx: number, cy: number, rx: number, ry: number, rotation = 0): string {
  const k = 0.5522847498307936;
  const ox = rx * k;
  const oy = ry * k;
  const p = PathBuilder.start();
  const rotate = (x: number, y: number): Point => {
    if (!rotation) return [x, y];
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };
  const move = (x: number, y: number, first = false): void => {
    const [px, py] = rotate(x, y);
    if (first) p.moveTo(px, py);
    else p.lineTo(px, py);
  };
  const curve = (c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void => {
    const [p1x, p1y] = rotate(c1x, c1y);
    const [p2x, p2y] = rotate(c2x, c2y);
    const [px, py] = rotate(x, y);
    p.curveTo(p1x, p1y, p2x, p2y, px, py);
  };
  move(cx + rx, cy, true);
  curve(cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry);
  curve(cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy);
  curve(cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry);
  curve(cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy);
  p.close();
  return p.toString();
}

export function ringPath(cx: number, cy: number, outer: number, inner: number): string {
  const p = PathBuilder.start();
  p.moveTo(cx + outer, cy);
  const k = 0.5522847498307936;
  const o = outer * k;
  p.curveTo(cx + outer, cy + o, cx + o, cy + outer, cx, cy + outer);
  p.curveTo(cx - o, cy + outer, cx - outer, cy + o, cx - outer, cy);
  p.curveTo(cx - outer, cy - o, cx - o, cy - outer, cx, cy - outer);
  p.curveTo(cx + o, cy - outer, cx + outer, cy - o, cx + outer, cy);
  p.close();
  const i = inner * k;
  p.moveTo(cx + inner, cy);
  p.curveTo(cx + inner, cy - i, cx + i, cy - inner, cx, cy - inner);
  p.curveTo(cx - i, cy - inner, cx - inner, cy - i, cx - inner, cy);
  p.curveTo(cx - inner, cy + i, cx - i, cy + inner, cx, cy + inner);
  p.curveTo(cx + i, cy + inner, cx + inner, cy + i, cx + inner, cy);
  p.close();
  return p.toString();
}

export function roundedRectPath(x: number, y: number, w: number, h: number, r: number | { tl?: number; tr?: number; br?: number; bl?: number }): string {
  const radii = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : { tl: r.tl ?? 0, tr: r.tr ?? 0, br: r.br ?? 0, bl: r.bl ?? 0 };
  const max = Math.min(w, h) / 2;
  const tl = clamp(radii.tl, 0, max);
  const tr = clamp(radii.tr, 0, max);
  const br = clamp(radii.br, 0, max);
  const bl = clamp(radii.bl, 0, max);
  const k = 0.5522847498307936;
  const p = PathBuilder.start();
  p.moveTo(x + tl, y);
  p.lineTo(x + w - tr, y);
  if (tr) p.curveTo(x + w - tr + tr * k, y, x + w, y + tr - tr * k, x + w, y + tr);
  p.lineTo(x + w, y + h - br);
  if (br) p.curveTo(x + w, y + h - br + br * k, x + w - br + br * k, y + h, x + w - br, y + h);
  p.lineTo(x + bl, y + h);
  if (bl) p.curveTo(x + bl - bl * k, y + h, x, y + h - bl + bl * k, x, y + h - bl);
  p.lineTo(x, y + tl);
  if (tl) p.curveTo(x, y + tl - tl * k, x + tl - tl * k, y, x + tl, y);
  p.close();
  return p.toString();
}

export function rectPath(x: number, y: number, w: number, h: number): string {
  return `M ${num(x)} ${num(y)} L ${num(x + w)} ${num(y)} L ${num(x + w)} ${num(y + h)} L ${num(x)} ${num(y + h)} Z`;
}

/** Polygon from points; `close` false leaves it as a polyline. */
export function polygonPath(points: readonly Point[], close = true): string {
  if (!points.length) return '';
  const p = PathBuilder.start();
  p.moveTo(points[0]![0], points[0]![1]);
  for (let i = 1; i < points.length; i += 1) p.lineTo(points[i]![0], points[i]![1]);
  if (close) p.close();
  return p.toString();
}

/** Catmull-Rom → cubic smoothing. Produces organic shapes from few points. */
export function smoothClosedPath(points: readonly Point[], tension = 0.5): string {
  return smoothPath(points, { closed: true, tension });
}

/**
 * Catmull-Rom → cubic smoothing. Accepts either an options object or the legacy
 * positional tension (`smoothPath(points, 0.5)`), because both read naturally at
 * different call sites and neither is worth breaking.
 */
export function smoothPath(
  points: readonly Point[],
  options: number | boolean | { closed?: boolean; tension?: number } = {},
): string {
  const { closed = false, tension = 0.5 } =
    typeof options === 'number'
      ? { closed: false, tension: options }
      : typeof options === 'boolean'
        ? { closed: options, tension: 0.5 }
        : { closed: options.closed ?? false, tension: options.tension ?? 0.5 };
  const pts = [...points];
  if (pts.length < 2) return '';
  const p = PathBuilder.start();
  p.moveTo(pts[0]![0], pts[0]![1]);
  const at = (index: number): Point => {
    if (closed) return pts[(index + pts.length) % pts.length]!;
    return pts[clamp(index, 0, pts.length - 1)]!;
  };
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2];
    const c2: Point = [p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2];
    p.curveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
  }
  if (closed) p.close();
  return p.toString();
}

/**
 * Elliptical arc between two angles, drawn as cubic segments.
 *
 * `rx`/`ry` allow the flattened ellipses the art library uses for smiles,
 * wave crests and anchor arms. `options.innerRadius` closes the arc back along
 * a concentric ellipse, producing an annular band (rings, halos, portholes).
 */
export function arcPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  options: { moveToCentre?: boolean; close?: boolean; innerRadius?: number } = {},
): string {
  let sweep = to - from;
  if (sweep < 0) sweep += TAU * Math.ceil(Math.abs(sweep) / TAU);
  const segments = Math.max(1, Math.ceil(sweep / (Math.PI / 2)));
  const step = sweep / segments;
  const point = (angle: number, radiusX: number, radiusY: number): Point => [cx + radiusX * Math.cos(angle), cy + radiusY * Math.sin(angle)];
  const p = PathBuilder.start();
  const start = point(from, rx, ry);
  if (options.moveToCentre) p.moveTo(cx, cy);
  p.moveTo(start[0], start[1]);
  const emit = (radiusX: number, radiusY: number, forward: boolean): void => {
    for (let i = 0; i < segments; i += 1) {
      const a0 = forward ? from + step * i : from + step * (segments - i);
      const a1 = a0 + (forward ? step : -step);
      const alpha = (4 / 3) * Math.tan((a1 - a0) / 4);
      const p0 = point(a0, radiusX, radiusY);
      const p1 = point(a1, radiusX, radiusY);
      const c1: Point = [p0[0] - Math.sin(a0) * alpha * radiusX, p0[1] + Math.cos(a0) * alpha * radiusY];
      const c2: Point = [p1[0] + Math.sin(a1) * alpha * radiusX, p1[1] - Math.cos(a1) * alpha * radiusY];
      p.curveTo(c1[0], c1[1], c2[0], c2[1], p1[0], p1[1]);
    }
  };
  emit(rx, ry, true);
  if (options.innerRadius !== undefined) {
    const inner = point(to, options.innerRadius, options.innerRadius * (ry / (rx || 1)));
    p.lineTo(inner[0], inner[1]);
    emit(options.innerRadius, options.innerRadius * (ry / (rx || 1)), false);
    p.close();
    return p.toString();
  }
  if (options.close) {
    p.lineTo(cx, cy);
    p.close();
  }
  return p.toString();
}

/** Star: straight-edged or with a soft inner curve for a stylised look. */
export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5, rotation = -Math.PI / 2, roundness = 0): string {
  const pts: Point[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    pts.push(polar(cx, cy, radius, rotation + (i * Math.PI) / points));
  }
  return roundness > 0 ? smoothClosedPath(pts, roundness) : polygonPath(pts);
}

/** Scalloped circle — the classic "doily" edge used across the collection. */
export function scallopCirclePath(cx: number, cy: number, r: number, petals = 16, depth = 0.06, phase = 0): string {
  const pts: Point[] = [];
  const steps = Math.max(6, petals * 2);
  for (let i = 0; i < steps; i += 1) {
    const angle = phase + (i / steps) * TAU;
    const bulge = i % 2 === 0 ? 1 : 1 - depth;
    pts.push(polar(cx, cy, r * bulge, angle));
  }
  return smoothClosedPath(pts, 0.6);
}

/** Scalloped rectangle border (a "postage stamp" edge). */
export function scallopRectPath(x: number, y: number, w: number, h: number, scallops = 12, depth = 2.2): string {
  const pts: Point[] = [];
  const perSide = Math.max(3, Math.round(scallops / 4));
  const collect = (fromX: number, fromY: number, toX: number, toY: number, normalSign: number): void => {
    for (let i = 0; i < perSide; i += 1) {
      const t = (i + 0.5) / perSide;
      const base: Point = [lerp(fromX, toX, t), lerp(fromY, toY, t)];
      const dx = toX - fromX;
      const dy = toY - fromY;
      const len = Math.hypot(dx, dy) || 1;
      pts.push([base[0] + (-dy / len) * depth * normalSign, base[1] + (dx / len) * depth * normalSign]);
    }
  };
  collect(x, y, x + w, y, -1);
  collect(x + w, y, x + w, y + h, -1);
  collect(x + w, y + h, x, y + h, -1);
  collect(x, y + h, x, y, -1);
  return smoothClosedPath(pts, 0.35);
}

/** Deterministic organic blob from a seed — used for clouds, foliage and landforms. */
export function blobPath(cx: number, cy: number, rx: number, ry: number, seed = 1, wobble = 0.12, points = 10): string {
  const random = mulberry32(seed);
  const pts: Point[] = [];
  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * TAU;
    const scale = 1 + (random() - 0.5) * 2 * wobble;
    pts.push([cx + Math.cos(angle) * rx * scale, cy + Math.sin(angle) * ry * scale]);
  }
  return smoothClosedPath(pts, 0.7);
}

export function heartPath(cx: number, cy: number, size: number): string {
  const w = size;
  const h = size;
  const p = PathBuilder.start();
  p.moveTo(cx, cy + h * 0.32);
  p.curveTo(cx - w * 0.62, cy - h * 0.1, cx - w * 0.34, cy - h * 0.52, cx, cy - h * 0.2);
  p.curveTo(cx + w * 0.34, cy - h * 0.52, cx + w * 0.62, cy - h * 0.1, cx, cy + h * 0.32);
  p.close();
  return p.toString();
}

export function leafPath(cx: number, cy: number, length: number, width: number, angle = 0): string {
  const tip = polar(cx, cy, length / 2, angle);
  const base = polar(cx, cy, length / 2, angle + Math.PI);
  const side = normal(base, tip, width / 2);
  const p = PathBuilder.start();
  p.moveTo(base[0], base[1]);
  p.curveTo(base[0] + side[0] * 1.4, base[1] + side[1] * 1.4, tip[0] + side[0] * 1.4, tip[1] + side[1] * 1.4, tip[0], tip[1]);
  p.curveTo(tip[0] - side[0] * 1.4, tip[1] - side[1] * 1.4, base[0] - side[0] * 1.4, base[1] - side[1] * 1.4, base[0], base[1]);
  p.close();
  return p.toString();
}

/** Petal (used by flowers, manes, wings and scalloped medallions). */
export function petalPath(cx: number, cy: number, length: number, width: number, angle: number): string {
  const tip = polar(cx, cy, length, angle);
  const spread = width / 2;
  const c1 = polar(cx, cy, length * 0.45, angle - 0.5);
  const c2 = polar(cx, cy, length * 0.45, angle + 0.5);
  const p = PathBuilder.start();
  p.moveTo(cx, cy);
  p.curveTo(c1[0] + spread * 0.2, c1[1], tip[0] - spread, tip[1] - spread * 0.3, tip[0], tip[1]);
  p.curveTo(tip[0] + spread, tip[1] - spread * 0.3, c2[0] - spread * 0.2, c2[1], cx, cy);
  p.close();
  return p.toString();
}

export function eggPath(cx: number, cy: number, rx: number, ry: number): string {
  const p = PathBuilder.start();
  const k = 0.5522847498307936;
  // Narrow at the top, round at the base.
  p.moveTo(cx, cy - ry);
  p.curveTo(cx + rx * 0.62, cy - ry * 0.92, cx + rx, cy - ry * 0.34, cx + rx, cy + ry * 0.18);
  p.curveTo(cx + rx, cy + ry * 0.72, cx + rx * 0.56, cy + ry, cx, cy + ry);
  p.curveTo(cx - rx * 0.56, cy + ry, cx - rx, cy + ry * 0.72, cx - rx, cy + ry * 0.18);
  p.curveTo(cx - rx, cy - ry * 0.34, cx - rx * 0.62, cy - ry * 0.92, cx, cy - ry);
  p.close();
  void k;
  return p.toString();
}

/** A wavy band: `waves` crests across the width, wrapping bottom to top. */
export function waveBandPath(x: number, y: number, w: number, h: number, waves = 3, amplitude = 0.4): string {
  const p = PathBuilder.start();
  const mid = y + h / 2;
  const amp = (h / 2) * clamp(amplitude, 0.05, 1);
  p.moveTo(x, mid);
  const step = w / waves;
  for (let i = 0; i < waves; i += 1) {
    const x0 = x + step * i;
    const x1 = x0 + step;
    p.curveTo(x0 + step * 0.35, mid - amp * 1.6, x1 - step * 0.35, mid + amp * 1.6, x1, mid);
  }
  p.lineTo(x + w, y + h);
  p.lineTo(x, y + h);
  p.close();
  return p.toString();
}

/** Cloud: three overlapping arcs closed to a flat base. */
export function cloudPath(cx: number, cy: number, w: number, h: number): string {
  const p = PathBuilder.start();
  const left = cx - w / 2;
  const right = cx + w / 2;
  p.moveTo(left, cy + h / 2);
  p.curveTo(left - w * 0.04, cy - h * 0.18, left + w * 0.14, cy - h * 0.5, left + w * 0.3, cy - h * 0.42);
  p.curveTo(left + w * 0.38, cy - h * 0.78, left + w * 0.66, cy - h * 0.78, left + w * 0.7, cy - h * 0.44);
  p.curveTo(right - w * 0.06, cy - h * 0.5, right + w * 0.04, cy - h * 0.06, right - w * 0.04, cy + h / 2);
  p.close();
  return p.toString();
}

/** Speech/comic bubble with a tail at `tailAngle`. */
export function bubblePath(cx: number, cy: number, w: number, h: number, tailAngle = Math.PI / 2, tailLength = 0.22): string {
  const r = Math.min(w, h) / 2;
  const tail = polar(cx, cy, r, tailAngle);
  const base = [tail[0], tail[1]] as Point;
  const p = PathBuilder.start();
  const k = 0.5522847498307936;
  p.moveTo(cx + w / 2, cy);
  p.curveTo(cx + w / 2, cy + h * k * 0.5, cx + (w / 2) * k, cy + h / 2, cx, cy + h / 2);
  p.lineTo(tail[0] + (tailLength * w) / 2, tail[1] + tailLength * h * 0.4);
  p.lineTo(tail[0], tail[1] + tailLength * h);
  p.lineTo(tail[0] - (tailLength * w) / 2, tail[1] + tailLength * h * 0.4);
  p.lineTo(cx - (w / 2) / 2, cy + h / 2);
  p.curveTo(cx - (w / 2) * k, cy + h / 2, cx - w / 2, cy + h * k * 0.5, cx - w / 2, cy);
  p.curveTo(cx - w / 2, cy - h * k * 0.5, cx - (w / 2) * k, cy - h / 2, cx, cy - h / 2);
  p.curveTo(cx + (w / 2) * k, cy - h / 2, cx + w / 2, cy - h * k * 0.5, cx + w / 2, cy);
  p.close();
  void base;
  return p.toString();
}

/** Explosion / comic burst with an irregular spiky edge. */
export function burstPath(cx: number, cy: number, r: number, spikes = 12, inner = 0.68, seed = 7, rotation = 0): string {
  const random = mulberry32(seed);
  const pts: Point[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = (i % 2 === 0 ? r : r * inner) * (0.92 + random() * 0.16);
    pts.push(polar(cx, cy, radius, rotation + (i * Math.PI) / spikes));
  }
  return polygonPath(pts);
}

/** Lightning bolt normalised into a box. */
export function lightningPath(x: number, y: number, w: number, h: number): string {
  const pts: Point[] = [
    [x + w * 0.55, y],
    [x + w * 0.12, y + h * 0.56],
    [x + w * 0.45, y + h * 0.56],
    [x + w * 0.3, y + h],
    [x + w * 0.9, y + h * 0.4],
    [x + w * 0.52, y + h * 0.4],
    [x + w * 0.78, y],
  ];
  return polygonPath(pts);
}

export function plusPath(cx: number, cy: number, size: number, thickness: number): string {
  const h = size / 2;
  const t = thickness / 2;
  const pts: Point[] = [
    [cx - t, cy - h],
    [cx + t, cy - h],
    [cx + t, cy - t],
    [cx + h, cy - t],
    [cx + h, cy + t],
    [cx + t, cy + t],
    [cx + t, cy + h],
    [cx - t, cy + h],
    [cx - t, cy + t],
    [cx - h, cy + t],
    [cx - h, cy - t],
    [cx - t, cy - t],
  ];
  return polygonPath(pts);
}

/** Four-point sparkle (the classic paper-craft twinkle). */
export function sparklePath(cx: number, cy: number, r: number, waist = 0.18): string {
  const inner = r * waist;
  const p = PathBuilder.start();
  p.moveTo(cx, cy - r);
  p.curveTo(cx + inner, cy - inner, cx + inner, cy - inner, cx + r, cy);
  p.curveTo(cx + inner, cy + inner, cx + inner, cy + inner, cx, cy + r);
  p.curveTo(cx - inner, cy + inner, cx - inner, cy + inner, cx - r, cy);
  p.curveTo(cx - inner, cy - inner, cx - inner, cy - inner, cx, cy - r);
  p.close();
  return p.toString();
}

/** Smooth hill silhouette used as ground in landscape templates. */
export function hillPath(x: number, y: number, w: number, h: number, peaks = 2, seed = 3): string {
  const random = mulberry32(seed);
  const p = PathBuilder.start();
  p.moveTo(x, y + h);
  p.lineTo(x, y + h * 0.55);
  const step = w / peaks;
  for (let i = 0; i < peaks; i += 1) {
    const x0 = x + step * i;
    const x1 = x0 + step;
    const peak = y + h * (0.05 + random() * 0.3);
    p.curveTo(x0 + step * 0.3, peak + h * 0.1, x1 - step * 0.35, peak - h * 0.05, x1, y + h * 0.55);
  }
  p.lineTo(x + w, y + h);
  p.close();
  return p.toString();
}

/* ------------------------------------------------------------------ */
/* Random                                                              */
/* ------------------------------------------------------------------ */

/** Deterministic 32-bit PRNG. Same seed ⇒ same scatter, forever. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded random as a plain function — the studio and templates both use this. */
export function createRandom(seed: number | string): () => number {
  return mulberry32(typeof seed === 'string' ? hashSeed(seed) : seed);
}

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Scatter points inside a box with deterministic jitter and a minimum spacing. */
export function scatter(
  count: number,
  box: { x: number; y: number; w: number; h: number },
  seed: number,
  minDistance = 0,
): Point[] {
  const random = mulberry32(seed);
  const points: Point[] = [];
  let guard = 0;
  while (points.length < count && guard < count * 60) {
    guard += 1;
    const candidate: Point = [box.x + random() * box.w, box.y + random() * box.h];
    if (minDistance > 0 && points.some((p) => distance(p, candidate) < minDistance)) continue;
    points.push(candidate);
  }
  return points;
}

/* ------------------------------------------------------------------ */
/* Unit conversions used by print                                     */
/* ------------------------------------------------------------------ */

export function mmToPx(mm: number, ppi: number): number {
  return (mm / MM_PER_INCH) * ppi;
}

export function pxToMm(px: number, ppi: number): number {
  return (px / ppi) * MM_PER_INCH;
}

export function mmToPt(mm: number): number {
  return mm / MM_PER_PT;
}

export function ptToMm(pt: number): number {
  return pt * MM_PER_PT;
}
