/**
 * @mazi/cake-atelier — path normalisation
 *
 * Glyph outlines arrive as TrueType quadratics; authored art uses cubics; the
 * PDF emitter wants absolute `M/L/C/Z` only. This module converts one to the
 * other, exactly, once.
 *
 * Supported input commands: M m L l H h V v Q q T t C c S s A a Z z.
 * Output: absolute M, L, C, Z.
 */

import { applyMatrix, num, type Matrix, type Point } from './geometry.js';

export type Segment =
  | { type: 'M'; points: Point[] }
  | { type: 'L'; points: Point[] }
  | { type: 'C'; points: Point[] }
  | { type: 'Z'; points: Point[] };

interface Token {
  command: string;
  values: number[];
}

function tokenize(d: string): Token[] {
  const tokens: Token[] = [];
  const re = /([MmLlHhVvQqTtCcSsAaZz])([^MmLlHhVvQqTtCcSsAaZz]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(d)) !== null) {
    const values = (match[2]!.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []).map(Number);
    tokens.push({ command: match[1]!, values });
  }
  return tokens;
}

/**
 * Parse path data into absolute M/L/C/Z segments. Quadratics become cubics,
 * elliptical arcs become cubic approximations — no information is dropped, only
 * re-expressed.
 */
export function parsePath(d: string): Segment[] {
  const tokens = tokenize(d);
  const out: Segment[] = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let prevControl: Point | null = null;
  let prevType = '';

  const push = (segment: Segment) => out.push(segment);

  for (const token of tokens) {
    const cmd = token.command;
    const rel = cmd === cmd.toLowerCase() && cmd !== 'Z' && cmd !== 'z';
    const values = token.values;
    switch (cmd.toUpperCase()) {
      case 'M': {
        for (let i = 0; i + 1 < values.length; i += 2) {
          const x = rel ? cx + values[i]! : values[i]!;
          const y = rel ? cy + values[i + 1]! : values[i + 1]!;
          if (i === 0) {
            push({ type: 'M', points: [[x, y]] });
            sx = x;
            sy = y;
          } else {
            push({ type: 'L', points: [[x, y]] });
          }
          cx = x;
          cy = y;
        }
        prevControl = null;
        break;
      }
      case 'L': {
        for (let i = 0; i + 1 < values.length; i += 2) {
          const x = rel ? cx + values[i]! : values[i]!;
          const y = rel ? cy + values[i + 1]! : values[i + 1]!;
          push({ type: 'L', points: [[x, y]] });
          cx = x;
          cy = y;
        }
        prevControl = null;
        break;
      }
      case 'H': {
        for (const value of values) {
          const x = rel ? cx + value : value;
          push({ type: 'L', points: [[x, cy]] });
          cx = x;
        }
        prevControl = null;
        break;
      }
      case 'V': {
        for (const value of values) {
          const y = rel ? cy + value : value;
          push({ type: 'L', points: [[cx, y]] });
          cy = y;
        }
        prevControl = null;
        break;
      }
      case 'C': {
        for (let i = 0; i + 5 < values.length; i += 6) {
          const p1: Point = [rel ? cx + values[i]! : values[i]!, rel ? cy + values[i + 1]! : values[i + 1]!];
          const p2: Point = [rel ? cx + values[i + 2]! : values[i + 2]!, rel ? cy + values[i + 3]! : values[i + 3]!];
          const p3: Point = [rel ? cx + values[i + 4]! : values[i + 4]!, rel ? cy + values[i + 5]! : values[i + 5]!];
          push({ type: 'C', points: [p1, p2, p3] });
          prevControl = p2;
          cx = p3[0];
          cy = p3[1];
        }
        break;
      }
      case 'S': {
        for (let i = 0; i + 3 < values.length; i += 4) {
          const reflect: Point =
            (prevType === 'C' || prevType === 'S') && prevControl
              ? [2 * cx - prevControl[0], 2 * cy - prevControl[1]]
              : [cx, cy];
          const p2: Point = [rel ? cx + values[i]! : values[i]!, rel ? cy + values[i + 1]! : values[i + 1]!];
          const p3: Point = [rel ? cx + values[i + 2]! : values[i + 2]!, rel ? cy + values[i + 3]! : values[i + 3]!];
          push({ type: 'C', points: [reflect, p2, p3] });
          prevControl = p2;
          cx = p3[0];
          cy = p3[1];
        }
        break;
      }
      case 'Q': {
        for (let i = 0; i + 3 < values.length; i += 4) {
          const q: Point = [rel ? cx + values[i]! : values[i]!, rel ? cy + values[i + 1]! : values[i + 1]!];
          const end: Point = [rel ? cx + values[i + 2]! : values[i + 2]!, rel ? cy + values[i + 3]! : values[i + 3]!];
          push({ type: 'C', points: quadToCubic([cx, cy], q, end) });
          prevControl = q;
          cx = end[0];
          cy = end[1];
        }
        break;
      }
      case 'T': {
        for (let i = 0; i + 1 < values.length; i += 2) {
          const reflect: Point =
            (prevType === 'Q' || prevType === 'T') && prevControl
              ? [2 * cx - prevControl[0], 2 * cy - prevControl[1]]
              : [cx, cy];
          const end: Point = [rel ? cx + values[i]! : values[i]!, rel ? cy + values[i + 1]! : values[i + 1]!];
          push({ type: 'C', points: quadToCubic([cx, cy], reflect, end) });
          prevControl = reflect;
          cx = end[0];
          cy = end[1];
        }
        break;
      }
      case 'A': {
        for (let i = 0; i + 6 < values.length; i += 7) {
          const rx = values[i]!;
          const ry = values[i + 1]!;
          const rotation = (values[i + 2]! * Math.PI) / 180;
          const largeArc = values[i + 3]! !== 0;
          const sweep = values[i + 4]! !== 0;
          const end: Point = [rel ? cx + values[i + 5]! : values[i + 5]!, rel ? cy + values[i + 6]! : values[i + 6]!];
          for (const segment of arcToCubics([cx, cy], rx, ry, rotation, largeArc, sweep, end)) {
            push({ type: 'C', points: segment });
          }
          prevControl = null;
          cx = end[0];
          cy = end[1];
        }
        break;
      }
      case 'Z': {
        push({ type: 'Z', points: [] });
        cx = sx;
        cy = sy;
        prevControl = null;
        break;
      }
      default:
        break;
    }
    prevType = cmd.toUpperCase();
  }
  return out;
}

function quadToCubic(from: Point, control: Point, to: Point): Point[] {
  const c1: Point = [from[0] + (2 / 3) * (control[0] - from[0]), from[1] + (2 / 3) * (control[1] - from[1])];
  const c2: Point = [to[0] + (2 / 3) * (control[0] - to[0]), to[1] + (2 / 3) * (control[1] - to[1])];
  return [c1, c2, to];
}

/** Endpoint → centre parameterisation of an SVG elliptical arc, then cubics. */
function arcToCubics(
  from: Point,
  rxIn: number,
  ryIn: number,
  rotation: number,
  largeArc: boolean,
  sweep: boolean,
  to: Point,
): Point[][] {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0) return [[from, to, to]];
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const dx = (from[0] - to[0]) / 2;
  const dy = (from[1] - to[1]) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }
  const sign = largeArc === sweep ? -1 : 1;
  const numerator = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const denominator = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const coef = sign * Math.sqrt(Math.max(0, numerator / denominator));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (from[0] + to[0]) / 2;
  const cy = sin * cxp + cos * cyp + (from[1] + to[1]) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const dot = ux * vx + uy * vy;
    const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    const a = Math.acos(Math.min(1, Math.max(-1, dot / (len || 1))));
    return ux * vy - uy * vx < 0 ? -a : a;
  };
  const startAngle = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let delta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && delta > 0) delta -= Math.PI * 2;
  if (sweep && delta < 0) delta += Math.PI * 2;

  const segments = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2)));
  const step = delta / segments;
  const out: Point[][] = [];
  let theta = startAngle;
  const pointAt = (t: number): Point => [
    cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
    cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
  ];
  for (let i = 0; i < segments; i += 1) {
    const t1 = theta + step;
    const k = (4 / 3) * Math.tan(step / 4);
    const p0 = pointAt(theta);
    const p1 = pointAt(t1);
    const d0: Point = [-rx * Math.sin(theta) * cos - ry * Math.cos(theta) * sin, -rx * Math.sin(theta) * sin + ry * Math.cos(theta) * cos];
    const d1: Point = [-rx * Math.sin(t1) * cos - ry * Math.cos(t1) * sin, -rx * Math.sin(t1) * sin + ry * Math.cos(t1) * cos];
    out.push([
      [p0[0] + k * d0[0], p0[1] + k * d0[1]],
      [p1[0] - k * d1[0], p1[1] - k * d1[1]],
      p1,
    ]);
    theta = t1;
  }
  return out;
}

function transformPoint(m: Matrix, p: Point): Point {
  return applyMatrix(m, p);
}

export function transformSegments(segments: readonly Segment[], matrix: Matrix): Segment[] {
  return segments.map((segment) => ({
    type: segment.type,
    points: segment.points.map((p) => transformPoint(matrix, p)),
  }));
}

export function stringifySegments(segments: readonly Segment[], decimals = 3): string {
  const parts: string[] = [];
  for (const segment of segments) {
    switch (segment.type) {
      case 'M':
        parts.push(`M ${num(segment.points[0]![0], decimals)} ${num(segment.points[0]![1], decimals)}`);
        break;
      case 'L':
        parts.push(`L ${num(segment.points[0]![0], decimals)} ${num(segment.points[0]![1], decimals)}`);
        break;
      case 'C':
        parts.push(
          `C ${segment.points
            .map((p) => `${num(p[0], decimals)} ${num(p[1], decimals)}`)
            .join(' ')}`,
        );
        break;
      case 'Z':
        parts.push('Z');
        break;
      default:
        break;
    }
  }
  return parts.join(' ');
}

/** Convenience: transform path data in one step. */
export function transformPath(d: string, matrix: Matrix, decimals = 3): string {
  return stringifySegments(transformSegments(parsePath(d), matrix), decimals);
}

/** Bounding box of path data (control-point hull — conservative, no curve maths). */
export function pathBounds(d: string): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const segment of parsePath(d)) {
    for (const [x, y] of segment.points) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  return { minX, minY, maxX, maxY };
}

export function pathSegmentCount(d: string): number {
  return parsePath(d).length;
}
