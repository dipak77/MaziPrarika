/**
 * @mazi/cake-atelier — vehicles, space, construction, aviation and landscape
 *
 * Flat, side-on silhouettes with a single colour block and one detail shape —
 * the visual language children's book paper art uses, and the one that survives
 * being cut out of cardstock at 100 mm.
 */

import {
  arcPath,
  burstPath,
  circlePath,
  ellipsePath,
  polygonPath,
  polar,
  ringPath,
  round,
  roundedRectPath,
  smoothClosedPath,
  rectPath,
  smoothPath,
  starPath,
  TAU,
  type Point,
} from '../geometry.js';
import { mix, shade, type PaletteTokens } from '../palettes.js';
import type { GroupNode, Paint, SceneNode } from '../scene.js';
import { group } from '../scene.js';
import { ink, line, type ArtCtx } from './helpers.js';
import { shadowPlate, starCluster } from './decor.js';
import { eyes } from './animals.js';

/* ------------------------------------------------------------------ */
/* Space                                                               */
/* ------------------------------------------------------------------ */

export function rocket(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    scale: number;
    body?: string;
    nose?: string;
    window?: string;
    flame?: string;
    tilt?: number;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.surface;
  const nose = options.nose ?? ctx.pal.accent;
  const win = options.window ?? ctx.pal.secondarySoft;
  const flame = options.flame ?? ctx.pal.secondary;
  const tilt = options.tilt ?? 0;
  const nodes: SceneNode[] = [
    // Fins
    ink(ctx, 'rocket-fin', polygonPath([
      [cx - s * 0.42, cy + s * 0.5],
      [cx - s * 1.05, cy + s * 1.15],
      [cx - s * 1.05, cy + s * 0.42],
      [cx - s * 0.42, cy + s * 0.24],
    ]), nose, { material: options.material, cut: true, label: 'Fin' }),
    ink(ctx, 'rocket-fin', polygonPath([
      [cx + s * 0.42, cy + s * 0.5],
      [cx + s * 1.05, cy + s * 1.15],
      [cx + s * 1.05, cy + s * 0.42],
      [cx + s * 0.42, cy + s * 0.24],
    ]), nose, { material: options.material, cut: true, label: 'Fin' }),
    ink(ctx, 'rocket-body', roundedRectPath(cx - s * 0.42, cy - s * 0.5, s * 0.84, s * 1.5, s * 0.2), body, {
      material: options.material,
      cut: true,
      label: 'Rocket body',
    }),
    ink(ctx, 'rocket-nose', smoothClosedPath(
      [
        [cx - s * 0.42, cy - s * 0.5],
        [cx - s * 0.3, cy - s * 1.05],
        [cx, cy - s * 1.5],
        [cx + s * 0.3, cy - s * 1.05],
        [cx + s * 0.42, cy - s * 0.5],
      ],
      0.4,
    ), nose, { material: options.material, cut: true, label: 'Nose cone' }),
    ink(ctx, 'rocket-window', ringPath(cx, cy - s * 0.42, s * 0.3, s * 0.21), win, {
      material: options.material,
      fillRule: 'evenodd',
    }),
    ink(ctx, 'rocket-window-glass', circlePath(cx, cy - s * 0.42, s * 0.21), mix(win, ctx.pal.secondary, 0.5), { material: options.material }),
    ink(ctx, 'rocket-band', roundedRectPath(cx - s * 0.44, cy + s * 0.3, s * 0.88, s * 0.16, s * 0.06), nose, { material: options.material }),
    ink(ctx, 'rocket-nozzle', polygonPath([
      [cx - s * 0.3, cy + s * 0.98],
      [cx + s * 0.3, cy + s * 0.98],
      [cx + s * 0.4, cy + s * 1.2],
      [cx - s * 0.4, cy + s * 1.2],
    ]), mix(body, ctx.pal.ink, 0.4), { material: options.material }),
    ink(ctx, 'rocket-flame-outer', smoothClosedPath(
      [
        [cx - s * 0.34, cy + s * 1.18],
        [cx, cy + s * 1.9],
        [cx + s * 0.34, cy + s * 1.18],
      ],
      0.6,
    ), flame, { material: options.material, cut: true, label: 'Flame' }),
    ink(ctx, 'rocket-flame-inner', smoothClosedPath(
      [
        [cx - s * 0.18, cy + s * 1.2],
        [cx, cy + s * 1.62],
        [cx + s * 0.18, cy + s * 1.2],
      ],
      0.6,
    ), mix(flame, ctx.pal.highlight, 0.55), { material: options.material }),
  ];
  if (tilt) {
    return [
      group(nodes.map((n) => ({ ...n, transform: [Math.cos(tilt), Math.sin(tilt), -Math.sin(tilt), Math.cos(tilt), cx - cx * Math.cos(tilt) + cy * Math.sin(tilt), cy - cx * Math.sin(tilt) - cy * Math.cos(tilt)] as const })), {
        id: ctx.id('rocket'),
        role: 'illustration',
        material: options.material ?? ctx.material,
        label: 'Rocket',
      }),
    ];
  }
  return [group(nodes, { id: ctx.id('rocket'), role: 'illustration', material: options.material ?? ctx.material, label: 'Rocket' })];
}

export function planet(
  ctx: ArtCtx,
  options: {
    cx: number;
    cy: number;
    r: number;
    fill?: Paint;
    band?: string;
    ring?: boolean;
    ringFill?: string;
    material?: string;
  },
): SceneNode[] {
  const { cx, cy, r } = options;
  const fill = options.fill ?? ctx.pal.primary;
  const band = options.band ?? ctx.pal.primarySoft;
  const nodes: SceneNode[] = [];
  if (options.ring) {
    nodes.push(
      ink(ctx, 'planet-ring', ellipsePath(cx, cy + r * 0.12, r * 1.62, r * 0.36), options.ringFill ?? ctx.pal.secondary, {
        material: options.material,
        cut: true,
        label: 'Planet ring',
        opacity: 0.95,
      }),
    );
    nodes.push(
      ink(ctx, 'planet-ring-inner', ellipsePath(cx, cy + r * 0.12, r * 1.24, r * 0.24), 'none', {
        stroke: { color: ctx.pal.background, width: r * 0.06 },
        material: options.material,
      }),
    );
  }
  nodes.push(ink(ctx, 'planet', circlePath(cx, cy, r), fill, { material: options.material, cut: true, label: 'Planet' }));
  nodes.push(
    ink(ctx, 'planet-band', smoothClosedPath(
      [
        [cx - r * 0.9, cy - r * 0.3],
        [cx, cy - r * 0.42],
        [cx + r * 0.9, cy - r * 0.26],
        [cx + r * 0.7, cy - r * 0.06],
        [cx - r * 0.7, cy - r * 0.08],
      ],
      0.5,
    ), band, { material: options.material, opacity: 0.85 }),
  );
  nodes.push(
    ink(ctx, 'planet-crater', circlePath(cx + r * 0.34, cy + r * 0.36, r * 0.18), mix(String(fill).slice(0, 7) || ctx.pal.primary, ctx.pal.ink, 0.18), {
      material: options.material,
      opacity: 0.85,
    }),
  );
  nodes.push(
    ink(ctx, 'planet-crater', circlePath(cx - r * 0.42, cy + r * 0.22, r * 0.12), mix(String(fill).slice(0, 7) || ctx.pal.primary, ctx.pal.ink, 0.18), {
      material: options.material,
      opacity: 0.85,
    }),
  );
  return [group(nodes, { id: ctx.id('planet'), role: 'illustration', material: options.material ?? ctx.material, label: 'Planet' })];
}

export function astronaut(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; suit?: string; visor?: string; trim?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const suit = options.suit ?? ctx.pal.surface;
  const visor = options.visor ?? ctx.pal.primaryDeep;
  const trim = options.trim ?? ctx.pal.accent;
  return [
    group(
      [
        shadowPlate(ctx, { d: ellipsePath(cx, cy + s * 1.55, s * 1.1, s * 0.24), dx: 0, dy: 0, opacity: 0.1 }),
        ink(ctx, 'astro-tank', roundedRectPath(cx + s * 0.5, cy + s * 0.1, s * 0.4, s * 0.9, s * 0.16), trim, { material: options.material, cut: true }),
        ink(ctx, 'astro-body', roundedRectPath(cx - s * 0.62, cy + s * 0.05, s * 1.05, s * 1.1, s * 0.28), suit, { material: options.material, cut: true, label: 'Suit' }),
        ink(ctx, 'astro-chest', roundedRectPath(cx - s * 0.4, cy + s * 0.22, s * 0.62, s * 0.42, s * 0.14), mix(suit, ctx.pal.primarySoft, 0.4), { material: options.material }),
        ink(ctx, 'astro-arm', roundedRectPath(cx - s * 1.0, cy + s * 0.2, s * 0.36, s * 0.86, s * 0.18), suit, { material: options.material, cut: true }),
        ink(ctx, 'astro-arm', roundedRectPath(cx + s * 0.34, cy + s * 0.2, s * 0.36, s * 0.86, s * 0.18), suit, { material: options.material, cut: true }),
        ink(ctx, 'astro-leg', roundedRectPath(cx - s * 0.56, cy + s * 1.0, s * 0.42, s * 0.62, s * 0.16), suit, { material: options.material, cut: true }),
        ink(ctx, 'astro-leg', roundedRectPath(cx + s * 0.14, cy + s * 1.0, s * 0.42, s * 0.62, s * 0.16), suit, { material: options.material, cut: true }),
        ink(ctx, 'astro-boot', roundedRectPath(cx - s * 0.64, cy + s * 1.5, s * 0.56, s * 0.24, s * 0.1), trim, { material: options.material, cut: true }),
        ink(ctx, 'astro-boot', roundedRectPath(cx + s * 0.06, cy + s * 1.5, s * 0.56, s * 0.24, s * 0.1), trim, { material: options.material, cut: true }),
        ink(ctx, 'astro-helmet', circlePath(cx, cy - s * 0.62, s * 0.66), suit, { material: options.material, cut: true, label: 'Helmet' }),
        ink(ctx, 'astro-visor', ellipsePath(cx, cy - s * 0.6, s * 0.48, s * 0.4), visor, { material: options.material, cut: true }),
        ink(ctx, 'astro-visor-shine', ellipsePath(cx - s * 0.16, cy - s * 0.74, s * 0.16, s * 0.1), ctx.pal.highlight, { material: options.material, opacity: 0.6 }),
      ],
      { id: ctx.id('astronaut'), role: 'illustration', material: options.material ?? ctx.material, label: 'Astronaut' },
    ),
  ];
}

export function moon(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; face?: boolean; ink?: string; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const fill = options.fill ?? ctx.pal.secondarySoft;
  const nodes: SceneNode[] = [
    ink(ctx, 'moon', circlePath(cx, cy, r), fill, { material: options.material, cut: true, label: 'Moon' }),
    ink(ctx, 'moon-crater', circlePath(cx - r * 0.3, cy - r * 0.34, r * 0.16), mix(String(fill).slice(0, 7) || '#ffffff', ctx.pal.secondary, 0.35), { material: options.material, opacity: 0.8 }),
    ink(ctx, 'moon-crater', circlePath(cx + r * 0.34, cy - r * 0.1, r * 0.11), mix(String(fill).slice(0, 7) || '#ffffff', ctx.pal.secondary, 0.35), { material: options.material, opacity: 0.8 }),
    ink(ctx, 'moon-crater', circlePath(cx - r * 0.12, cy + r * 0.44, r * 0.13), mix(String(fill).slice(0, 7) || '#ffffff', ctx.pal.secondary, 0.35), { material: options.material, opacity: 0.8 }),
  ];
  if (options.face !== false) {
    nodes.push(...eyes(ctx, cx, cy + r * 0.06, r * 0.1, options.ink ?? ctx.pal.ink));
    nodes.push(ink(ctx, 'moon-smile', arcPath(cx, cy + r * 0.3, r * 0.3, r * 0.24, Math.PI * 0.2, Math.PI * 0.8), 'none', {
      stroke: { color: options.ink ?? ctx.pal.ink, width: r * 0.07, cap: 'round' },
      material: options.material,
    }));
  }
  return [group(nodes, { id: ctx.id('moon'), role: 'illustration', material: options.material ?? ctx.material, label: 'Moon' })];
}

export function crescentMoon(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const outer = circlePath(cx, cy, r);
  const inner = circlePath(cx + r * 0.42, cy - r * 0.22, r * 0.92);
  return [
    ink(ctx, 'crescent', `${outer} ${inner}`, options.fill ?? ctx.pal.secondarySoft, {
      material: options.material,
      fillRule: 'evenodd',
      cut: true,
      label: 'Crescent moon',
    }),
  ];
}

export function orbitArc(
  ctx: ArtCtx,
  options: { cx: number; cy: number; rx: number; ry: number; rotate?: number; color?: string; dashes?: boolean; material?: string },
): SceneNode[] {
  const d = arcPath(options.cx, options.cy, options.rx, options.ry, 0, TAU);
  return [
    ink(ctx, 'orbit', d, 'none', {
      stroke: {
        color: options.color ?? ctx.pal.primarySoft,
        width: 0.6,
        ...(options.dashes ? { dash: [3, 2.4] } : {}),
      },
      role: 'accents',
      material: options.material,
      ...(options.rotate ? { transform: [Math.cos(options.rotate), Math.sin(options.rotate), -Math.sin(options.rotate), Math.cos(options.rotate), options.cx - options.cx * Math.cos(options.rotate) + options.cy * Math.sin(options.rotate), options.cy - options.cx * Math.sin(options.rotate) - options.cy * Math.cos(options.rotate)] as const } : {}),
    }),
  ];
}

export function satellite(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; panel?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.surfaceAlt;
  const panel = options.panel ?? ctx.pal.primary;
  return [
    group(
      [
        ink(ctx, 'sat-panel', roundedRectPath(cx - s * 1.9, cy - s * 0.34, s * 1.1, s * 0.68, s * 0.08), panel, { material: options.material, cut: true, label: 'Solar panel' }),
        ink(ctx, 'sat-panel', roundedRectPath(cx + s * 0.8, cy - s * 0.34, s * 1.1, s * 0.68, s * 0.08), panel, { material: options.material, cut: true }),
        ...[-1, 1].flatMap((dir) =>
          [0, 1, 2].map((i) =>
            ink(ctx, 'sat-cell', polygonPath([
              [cx + dir * (s * 0.84 + i * s * 0.34), cy - s * 0.28],
              [cx + dir * (s * 0.84 + i * s * 0.34 + s * 0.02), cy - s * 0.28],
              [cx + dir * (s * 0.84 + i * s * 0.34 + s * 0.02), cy + s * 0.28],
              [cx + dir * (s * 0.84 + i * s * 0.34), cy + s * 0.28],
            ]), 'none', { stroke: { color: mix(panel, ctx.pal.ink, 0.3), width: s * 0.02 }, material: options.material }),
          ),
        ),
        ink(ctx, 'sat-body', roundedRectPath(cx - s * 0.55, cy - s * 0.5, s * 1.1, s, s * 0.16), body, { material: options.material, cut: true, label: 'Satellite' }),
        ink(ctx, 'sat-dish', arcPath(cx, cy - s * 0.95, s * 0.5, s * 0.4, Math.PI, TAU), 'none', {
          stroke: { color: ctx.pal.secondary, width: s * 0.12, cap: 'round' },
          material: options.material,
        }),
        ink(ctx, 'sat-antenna', polygonPath([[cx, cy - s * 0.5], [cx, cy - s * 0.9]], false), 'none', {
          stroke: { color: ctx.pal.secondary, width: s * 0.06 },
          material: options.material,
        }),
      ],
      { id: ctx.id('satellite'), role: 'illustration', material: options.material ?? ctx.material, label: 'Satellite' },
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Vehicles                                                            */
/* ------------------------------------------------------------------ */

export function raceCar(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; trim?: string; wheel?: string; number?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.accent;
  const trim = options.trim ?? ctx.pal.surface;
  const wheel = options.wheel ?? ctx.pal.ink;
  const nodes: SceneNode[] = [
    ink(ctx, 'car-body', smoothClosedPath(
      [
        [cx - s * 1.85, cy + s * 0.42],
        [cx - s * 1.6, cy - s * 0.16],
        [cx - s * 0.86, cy - s * 0.62],
        [cx - s * 0.1, cy - s * 0.66],
        [cx + s * 0.6, cy - s * 0.24],
        [cx + s * 1.5, cy - s * 0.06],
        [cx + s * 1.85, cy + s * 0.2],
        [cx + s * 1.8, cy + s * 0.5],
        [cx - s * 1.8, cy + s * 0.5],
      ],
      0.35,
    ), body, { material: options.material, cut: true, label: 'Race car' }),
    ink(ctx, 'car-window', smoothClosedPath(
      [
        [cx - s * 0.78, cy - s * 0.52],
        [cx - s * 0.16, cy - s * 0.55],
        [cx + s * 0.42, cy - s * 0.2],
        [cx - s * 0.72, cy - s * 0.16],
      ],
      0.35,
    ), mix(trim, ctx.pal.primarySoft, 0.5), { material: options.material, cut: true }),
    ink(ctx, 'car-splitter', polygonPath([
      [cx + s * 1.6, cy - s * 0.28],
      [cx + s * 2.05, cy - s * 0.1],
      [cx + s * 2.0, cy + s * 0.06],
      [cx + s * 1.68, cy - s * 0.06],
    ]), mix(body, ctx.pal.ink, 0.3), { material: options.material, cut: true }),
    ink(ctx, 'car-stripe', roundedRectPath(cx - s * 1.5, cy + s * 0.08, s * 3.1, s * 0.16, s * 0.06), trim, { material: options.material }),
    ink(ctx, 'car-wheel', circlePath(cx - s * 1.1, cy + s * 0.52, s * 0.44), wheel, { material: options.material, cut: true, label: 'Wheel' }),
    ink(ctx, 'car-wheel', circlePath(cx + s * 1.15, cy + s * 0.52, s * 0.44), wheel, { material: options.material, cut: true }),
    ink(ctx, 'car-rim', circlePath(cx - s * 1.1, cy + s * 0.52, s * 0.2), ctx.pal.surface, { material: options.material }),
    ink(ctx, 'car-rim', circlePath(cx + s * 1.15, cy + s * 0.52, s * 0.2), ctx.pal.surface, { material: options.material }),
    ink(ctx, 'car-lamp', roundedRectPath(cx + s * 1.42, cy + s * 0.06, s * 0.2, s * 0.16, s * 0.06), ctx.pal.secondarySoft, { material: options.material, role: 'accents' }),
  ];
  if (options.number !== false) {
    nodes.push(ink(ctx, 'car-number-plate', circlePath(cx - s * 0.28, cy - s * 0.02, s * 0.34), ctx.pal.surface, { material: options.material, role: 'accents' }));
  }
  // Speed lines.
  for (let i = 0; i < 3; i += 1) {
    nodes.push(
      ink(ctx, 'car-speed', roundedRectPath(cx - s * 2.7 - i * s * 0.34, cy - s * 0.2 + i * s * 0.3, s * 0.7, s * 0.1, s * 0.05), mix(body, ctx.pal.surface, 0.4), {
        role: 'accents',
        opacity: 0.8,
      }),
    );
  }
  return [group(nodes, { id: ctx.id('race-car'), role: 'illustration', material: options.material ?? ctx.material, label: 'Race car' })];
}

export function monsterTruck(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; trim?: string; wheel?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.primary;
  const wheel = options.wheel ?? ctx.pal.ink;
  const nodes: SceneNode[] = [
    ink(ctx, 'truck-body', polygonPath([
      [cx - s * 1.5, cy + s * 0.1],
      [cx - s * 1.42, cy - s * 0.7],
      [cx - s * 0.35, cy - s * 0.78],
      [cx - s * 0.2, cy - s * 1.0],
      [cx + s * 0.7, cy - s * 1.0],
      [cx + s * 0.95, cy - s * 0.7],
      [cx + s * 0.5, cy + s * 0.1],
    ]), body, { material: options.material, cut: true, label: 'Monster truck' }),
    ink(ctx, 'truck-window', polygonPath([
      [cx - s * 0.12, cy - s * 0.94],
      [cx + s * 0.64, cy - s * 0.94],
      [cx + s * 0.8, cy - s * 0.72],
      [cx - s * 0.14, cy - s * 0.72],
    ]), mix(ctx.pal.primarySoft, ctx.pal.surface, 0.4), { material: options.material, cut: true }),
    ink(ctx, 'truck-grille', roundedRectPath(cx - s * 1.46, cy - s * 0.6, s * 0.16, s * 0.5, s * 0.06), options.trim ?? ctx.pal.secondary, { material: options.material }),
    ink(ctx, 'truck-flag', polygonPath([
      [cx - s * 1.5, cy - s * 0.7],
      [cx - s * 2.0, cy - s * 0.9],
      [cx - s * 1.5, cy - s * 1.0],
    ]), ctx.pal.accent, { material: options.material, role: 'accents' }),
  ];
  for (const [dx, r] of [
    [-1.0, 0.62],
    [0.95, 0.62],
  ] as [number, number][]) {
    nodes.push(ink(ctx, 'truck-wheel', circlePath(cx + dx * s, cy + s * 0.62, s * r), wheel, { material: options.material, cut: true, label: 'Wheel' }));
    nodes.push(ink(ctx, 'truck-rim', circlePath(cx + dx * s, cy + s * 0.62, s * 0.24), ctx.pal.surface, { material: options.material }));
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * TAU + 0.4;
      nodes.push(ink(ctx, 'truck-lug', circlePath(...(polar(cx + dx * s, cy + s * 0.62, s * 0.36, a) as [number, number]), s * 0.07), wheel, { material: options.material }));
    }
  }
  nodes.push(ink(ctx, 'truck-shock', roundedRectPath(cx - s * 1.3, cy + s * 0.02, s * 0.16, s * 0.3, s * 0.06), ctx.pal.secondary, { material: options.material }));
  nodes.push(ink(ctx, 'truck-shock', roundedRectPath(cx + s * 0.7, cy + s * 0.02, s * 0.16, s * 0.3, s * 0.06), ctx.pal.secondary, { material: options.material }));
  return [group(nodes, { id: ctx.id('monster-truck'), role: 'illustration', material: options.material ?? ctx.material, label: 'Monster truck' })];
}

export function digger(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; metal?: string; wheel?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.secondary;
  const metal = options.metal ?? ctx.pal.accent;
  const wheel = options.wheel ?? ctx.pal.ink;
  return [
    group(
      [
        ink(ctx, 'digger-boom', smoothClosedPath(
          [
            [cx - s * 0.4, cy - s * 0.3],
            [cx + s * 0.5, cy - s * 1.2],
            [cx + s * 1.5, cy - s * 1.05],
            [cx + s * 1.4, cy - s * 0.8],
            [cx + s * 0.55, cy - s * 0.85],
          ],
          0.35,
        ), metal, { material: options.material, cut: true, label: 'Boom' }),
        ink(ctx, 'digger-bucket', polygonPath([
          [cx + s * 1.4, cy - s * 0.95],
          [cx + s * 2.0, cy - s * 0.6],
          [cx + s * 1.9, cy - s * 0.1],
          [cx + s * 1.4, cy - s * 0.05],
          [cx + s * 1.45, cy - s * 0.4],
        ]), metal, { material: options.material, cut: true, label: 'Bucket' }),
        ink(ctx, 'digger-teeth', polygonPath([
          [cx + s * 1.42, cy - s * 0.05],
          [cx + s * 1.9, cy - s * 0.1],
          [cx + s * 1.88, cy + s * 0.02],
          [cx + s * 1.44, cy + s * 0.08],
        ]), mix(metal, ctx.pal.ink, 0.35), { material: options.material }),
        ink(ctx, 'digger-cab', roundedRectPath(cx - s * 0.45, cy - s * 1.0, s * 1.0, s * 1.1, s * 0.16), body, { material: options.material, cut: true, label: 'Cab' }),
        ink(ctx, 'digger-window', roundedRectPath(cx + s * 0.02, cy - s * 0.92, s * 0.42, s * 0.44, s * 0.1), mix(ctx.pal.primarySoft, ctx.pal.surface, 0.4), { material: options.material, cut: true }),
        ink(ctx, 'digger-hood', roundedRectPath(cx - s * 1.5, cy - s * 0.35, s * 1.1, s * 0.6, s * 0.14), body, { material: options.material, cut: true }),
        ink(ctx, 'digger-tread', roundedRectPath(cx - s * 1.7, cy + s * 0.3, s * 3.2, s * 0.7, s * 0.32), wheel, { material: options.material, cut: true, label: 'Tracks' }),
      ],
      { id: ctx.id('digger'), role: 'illustration', material: options.material ?? ctx.material, label: 'Digger' },
    ),
  ];
}

export function formulaCar(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; trim?: string; wheel?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.primary;
  const trim = options.trim ?? ctx.pal.accent;
  return [
    group(
      [
        ink(ctx, 'f1-wing-back', roundedRectPath(cx - s * 1.9, cy - s * 0.5, s * 0.5, s * 0.16, s * 0.06), trim, { material: options.material, cut: true }),
        ink(ctx, 'f1-body', smoothClosedPath(
          [
            [cx - s * 1.7, cy + s * 0.14],
            [cx - s * 1.2, cy - s * 0.16],
            [cx - s * 0.2, cy - s * 0.2],
            [cx + s * 0.6, cy - s * 0.1],
            [cx + s * 1.7, cy - s * 0.02],
            [cx + s * 1.95, cy + s * 0.12],
            [cx + s * 0.4, cy + s * 0.26],
            [cx - s * 1.2, cy + s * 0.28],
          ],
          0.3,
        ), body, { material: options.material, cut: true, label: 'Formula car' }),
        ink(ctx, 'f1-cockpit', smoothClosedPath(
          [
            [cx - s * 0.3, cy - s * 0.18],
            [cx + s * 0.18, cy - s * 0.18],
            [cx + s * 0.3, cy + s * 0.04],
            [cx - s * 0.34, cy + s * 0.04],
          ],
          0.4,
        ), mix(body, ctx.pal.ink, 0.45), { material: options.material }),
        ink(ctx, 'f1-helmet', circlePath(cx - s * 0.08, cy - s * 0.34, s * 0.2), trim, { material: options.material, cut: true }),
        ink(ctx, 'f1-wing-front', roundedRectPath(cx + s * 1.5, cy - s * 0.02, s * 0.75, s * 0.14, s * 0.05), trim, { material: options.material, cut: true }),
        ink(ctx, 'f1-sidepod', roundedRectPath(cx - s * 0.5, cy + s * 0.04, s * 1.1, s * 0.24, s * 0.1), mix(body, ctx.pal.highlight, 0.15), { material: options.material }),
      ],
      { id: ctx.id('formula-car'), role: 'illustration', material: options.material ?? ctx.material, label: 'Formula car' },
    ),
  ];
}

export function airplane(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; trim?: string; window?: string; propeller?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.surface;
  const trim = options.trim ?? ctx.pal.primary;
  const nodes: SceneNode[] = [
    ink(ctx, 'plane-body', smoothClosedPath(
      [
        [cx - s * 1.9, cy - s * 0.1],
        [cx - s * 1.0, cy - s * 0.5],
        [cx + s * 0.9, cy - s * 0.46],
        [cx + s * 1.9, cy - s * 0.1],
        [cx + s * 1.0, cy + s * 0.34],
        [cx - s * 1.1, cy + s * 0.3],
      ],
      0.4,
    ), body, { material: options.material, cut: true, label: 'Airplane' }),
    ink(ctx, 'plane-tail', polygonPath([
      [cx - s * 1.6, cy - s * 0.28],
      [cx - s * 2.3, cy - s * 1.0],
      [cx - s * 1.5, cy - s * 0.9],
      [cx - s * 1.15, cy - s * 0.36],
    ]), trim, { material: options.material, cut: true, label: 'Tail' }),
    ink(ctx, 'plane-wing', polygonPath([
      [cx - s * 0.5, cy + s * 0.12],
      [cx + s * 0.5, cy + s * 0.12],
      [cx + s * 0.1, cy + s * 1.05],
      [cx - s * 0.7, cy + s * 0.95],
    ]), trim, { material: options.material, cut: true, label: 'Wing' }),
    ink(ctx, 'plane-cockpit', smoothClosedPath(
      [
        [cx + s * 0.9, cy - s * 0.44],
        [cx + s * 1.6, cy - s * 0.36],
        [cx + s * 1.4, cy - s * 0.18],
        [cx + s * 0.9, cy - s * 0.2],
      ],
      0.5,
    ), options.window ?? ctx.pal.primarySoft, { material: options.material, cut: true }),
  ];
  for (let i = 0; i < 4; i += 1) {
    nodes.push(ink(ctx, 'plane-window', circlePath(cx - s * 0.7 + i * s * 0.42, cy - s * 0.16, s * 0.09), options.window ?? ctx.pal.primarySoft, { material: options.material }));
  }
  if (options.propeller !== false) {
    nodes.push(ink(ctx, 'plane-prop', polygonPath([
      [cx + s * 1.82, cy - s * 0.7],
      [cx + s * 1.96, cy - s * 0.7],
      [cx + s * 1.96, cy + s * 0.5],
      [cx + s * 1.82, cy + s * 0.5],
    ]), ctx.pal.accentDeep, { material: options.material, cut: true }));
    nodes.push(ink(ctx, 'plane-prop-hub', circlePath(cx + s * 1.9, cy - s * 0.1, s * 0.12), ctx.pal.accent, { material: options.material }));
  }
  return [group(nodes, { id: ctx.id('airplane'), role: 'illustration', material: options.material ?? ctx.material, label: 'Airplane' })];
}

export function hotAirBalloon(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; stripes: [string, string, string]; basket?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const [a, b, c] = options.stripes;
  const basket = options.basket ?? ctx.pal.secondaryDeep;
  const envelope = smoothClosedPath(
    [
      [cx - s * 1.05, cy - s * 0.2],
      [cx - s * 1.15, cy - s * 1.1],
      [cx - s * 0.6, cy - s * 1.85],
      [cx, cy - s * 2.05],
      [cx + s * 0.6, cy - s * 1.85],
      [cx + s * 1.15, cy - s * 1.1],
      [cx + s * 1.05, cy - s * 0.2],
      [cx, cy + s * 0.1],
    ],
    0.5,
  );
  return [
    group(
      [
        shadowPlate(ctx, { d: envelope, dx: 0, dy: 1.6, opacity: 0.1 }),
        ink(ctx, 'balloon-envelope', envelope, a, { material: options.material, cut: true, label: 'Balloon envelope' }),
        ink(ctx, 'balloon-stripe', smoothClosedPath(
          [
            [cx - s * 0.16, cy - s * 2.0],
            [cx + s * 0.16, cy - s * 2.0],
            [cx + s * 0.34, cy + s * 0.05],
            [cx - s * 0.34, cy + s * 0.05],
          ],
          0.5,
        ), b, { material: options.material, cut: true }),
        ink(ctx, 'balloon-stripe', smoothClosedPath(
          [
            [cx - s * 0.72, cy - s * 1.8],
            [cx - s * 0.5, cy - s * 1.86],
            [cx - s * 0.72, cy + s * 0.02],
            [cx - s * 1.0, cy - s * 0.1],
          ],
          0.5,
        ), c, { material: options.material, cut: true }),
        ink(ctx, 'balloon-stripe', smoothClosedPath(
          [
            [cx + s * 0.72, cy - s * 1.8],
            [cx + s * 0.5, cy - s * 1.86],
            [cx + s * 0.72, cy + s * 0.02],
            [cx + s * 1.0, cy - s * 0.1],
          ],
          0.5,
        ), c, { material: options.material, cut: true }),
        ink(ctx, 'balloon-sandbag', roundedRectPath(cx - s * 0.42, cy + s * 0.5, s * 0.84, s * 0.6, s * 0.12), basket, {
          material: options.material,
          cut: true,
          label: 'Basket',
        }),
        ink(ctx, 'balloon-rope', polygonPath([[cx - s * 0.42, cy + s * 0.2], [cx - s * 0.42, cy + s * 0.5]], false), 'none', {
          stroke: { color: ctx.pal.outline, width: 0.4 },
          material: options.material,
        }),
        ink(ctx, 'balloon-rope', polygonPath([[cx + s * 0.42, cy + s * 0.2], [cx + s * 0.42, cy + s * 0.5]], false), 'none', {
          stroke: { color: ctx.pal.outline, width: 0.4 },
          material: options.material,
        }),
        ink(ctx, 'balloon-weave', roundedRectPath(cx - s * 0.42, cy + s * 0.62, s * 0.84, s * 0.1, s * 0.03), mix(basket, ctx.pal.highlight, 0.4), { material: options.material }),
      ],
      { id: ctx.id('hot-air-balloon'), role: 'illustration', material: options.material ?? ctx.material, label: 'Hot-air balloon' },
    ),
  ];
}

export function tractor(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; trim?: string; wheel?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.accent;
  const wheel = options.wheel ?? ctx.pal.ink;
  return [
    group(
      [
        ink(ctx, 'tractor-wheel-back', circlePath(cx - s * 1.2, cy + s * 0.5, s * 0.88), wheel, { material: options.material, cut: true, label: 'Rear wheel' }),
        ink(ctx, 'tractor-rim-back', circlePath(cx - s * 1.2, cy + s * 0.5, s * 0.4), ctx.pal.surfaceAlt, { material: options.material }),
        ink(ctx, 'tractor-body', polygonPath([
          [cx - s * 1.3, cy - s * 0.3],
          [cx - s * 0.2, cy - s * 0.36],
          [cx + s * 0.1, cy - s * 0.9],
          [cx + s * 0.9, cy - s * 0.9],
          [cx + s * 1.0, cy - s * 0.2],
          [cx + s * 1.3, cy - s * 0.14],
          [cx + s * 1.3, cy + s * 0.3],
          [cx - s * 1.3, cy + s * 0.3],
        ]), body, { material: options.material, cut: true, label: 'Tractor' }),
        ink(ctx, 'tractor-cab', roundedRectPath(cx - s * 0.3, cy - s * 1.5, s * 1.1, s * 0.7, s * 0.14), body, { material: options.material, cut: true }),
        ink(ctx, 'tractor-window', roundedRectPath(cx - s * 0.2, cy - s * 1.42, s * 0.9, s * 0.46, s * 0.1), mix(ctx.pal.primarySoft, ctx.pal.surface, 0.45), { material: options.material, cut: true }),
        ink(ctx, 'tractor-exhaust', roundedRectPath(cx - s * 0.1, cy - s * 2.0, s * 0.16, s * 0.6, s * 0.06), wheel, { material: options.material }),
        ink(ctx, 'tractor-wheel-front', circlePath(cx + s * 1.2, cy + s * 0.72, s * 0.5), wheel, { material: options.material, cut: true }),
        ink(ctx, 'tractor-rim-front', circlePath(cx + s * 1.2, cy + s * 0.72, s * 0.22), ctx.pal.surfaceAlt, { material: options.material }),
      ],
      { id: ctx.id('tractor'), role: 'illustration', material: options.material ?? ctx.material, label: 'Tractor' },
    ),
  ];
}

/* ------------------------------------------------------------------ */
/* Landscape & farm                                                    */
/* ------------------------------------------------------------------ */

export function barn(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; body?: string; roof?: string; door?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const body = options.body ?? ctx.pal.accentSoft;
  const roof = options.roof ?? ctx.pal.primary;
  const door = options.door ?? ctx.pal.primaryDeep;
  const left = cx - w / 2;
  const top = cy - h / 2;
  return [
    group(
      [
        ink(ctx, 'barn-body', rectPath(left, top + h * 0.34, w, h * 0.66), body, { material: options.material, cut: true, label: 'Barn' }),
        ink(ctx, 'barn-roof', polygonPath([
          [left - w * 0.08, top + h * 0.38],
          [cx, top],
          [left + w + w * 0.08, top + h * 0.38],
        ]), roof, { material: options.material, cut: true, label: 'Barn roof' }),
        ink(ctx, 'barn-door', polygonPath([
          [cx - w * 0.16, top + h],
          [cx - w * 0.16, top + h * 0.62],
          [cx, top + h * 0.5],
          [cx + w * 0.16, top + h * 0.62],
          [cx + w * 0.16, top + h],
        ]), door, { material: options.material, cut: true, label: 'Barn door' }),
        ink(ctx, 'barn-door-line', polygonPath([[cx, top + h * 0.52], [cx, top + h]], false), 'none', {
          stroke: { color: mix(door, ctx.pal.ink, 0.3), width: 0.5 },
          material: options.material,
        }),
        ink(ctx, 'barn-loft', ringPath(cx, top + h * 0.22, w * 0.1, w * 0.07), door, { material: options.material, fillRule: 'evenodd' }),
        ink(ctx, 'barn-cross', polygonPath([
          [cx - w * 0.4, top + h * 0.42],
          [cx - w * 0.3, top + h * 0.42],
          [cx + w * 0.3, top + h * 0.96],
          [cx + w * 0.4, top + h * 0.96],
        ]), mix(roof, ctx.pal.surface, 0.35), { material: options.material, opacity: 0.7 }),
      ],
      { id: ctx.id('barn'), role: 'illustration', material: options.material ?? ctx.material, label: 'Barn' },
    ),
  ];
}

export function windmill(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; body?: string; blade?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const body = options.body ?? ctx.pal.surface;
  const blade = options.blade ?? ctx.pal.secondary;
  const nodes: SceneNode[] = [
    ink(ctx, 'windmill-tower', polygonPath([
      [cx - s * 0.55, cy + s * 1.5],
      [cx - s * 0.28, cy - s * 0.6],
      [cx + s * 0.28, cy - s * 0.6],
      [cx + s * 0.55, cy + s * 1.5],
    ]), body, { material: options.material, cut: true, label: 'Windmill' }),
    ink(ctx, 'windmill-cap', smoothClosedPath(
      [
        [cx - s * 0.36, cy - s * 0.6],
        [cx, cy - s * 1.05],
        [cx + s * 0.36, cy - s * 0.6],
      ],
      0.5,
    ), ctx.pal.accent, { material: options.material, cut: true }),
    ink(ctx, 'windmill-hub', circlePath(cx, cy - s * 0.72, s * 0.16), ctx.pal.ink, { material: options.material }),
  ];
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * TAU + 0.35;
    nodes.push(
      ink(ctx, 'windmill-blade', smoothClosedPath(
        [
          [cx, cy - s * 0.72],
          [cx + Math.cos(a) * s * 1.6, cy - s * 0.72 + Math.sin(a) * s * 1.6],
          [cx + Math.cos(a + 0.34) * s * 1.5, cy - s * 0.72 + Math.sin(a + 0.34) * s * 1.5],
        ],
        0.4,
      ), blade, { material: options.material, cut: true, label: 'Blade' }),
    );
  }
  return [group(nodes, { id: ctx.id('windmill'), role: 'illustration', material: options.material ?? ctx.material, label: 'Windmill' })];
}

export function mountainRange(
  ctx: ArtCtx,
  options: { x: number; y: number; w: number; h: number; back?: string; front?: string; snow?: string; peaks?: number; material?: string },
): SceneNode[] {
  const peaks = options.peaks ?? 3;
  const nodes: SceneNode[] = [];
  const step = options.w / peaks;
  for (let i = 0; i < peaks; i += 1) {
    const x0 = options.x + i * step;
    const peakH = options.h * (0.68 + 0.32 * ((i * 7) % 3) / 2);
    nodes.push(
      ink(ctx, 'mountain', polygonPath([
        [x0, options.y + options.h],
        [x0 + step / 2, options.y + options.h - peakH],
        [x0 + step, options.y + options.h],
      ]), i % 2 === 0 ? options.front ?? ctx.pal.primaryDeep : options.back ?? ctx.pal.primary, {
        material: options.material,
        cut: true,
        label: 'Mountain',
      }),
    );
    nodes.push(
      ink(ctx, 'snow-cap', polygonPath([
        [x0 + step * 0.36, options.y + options.h - peakH * 0.78],
        [x0 + step / 2, options.y + options.h - peakH],
        [x0 + step * 0.64, options.y + options.h - peakH * 0.78],
        [x0 + step * 0.56, options.y + options.h - peakH * 0.84],
      ]), options.snow ?? ctx.pal.surface, { material: options.material, role: 'accents' }),
    );
  }
  return nodes;
}

export function pineTree(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; fill?: string; trunk?: string; tiers?: number; material?: string },
): SceneNode[] {
  const tiers = options.tiers ?? 3;
  const nodes: SceneNode[] = [
    ink(ctx, 'pine-trunk', roundedRectPath(options.cx - options.h * 0.05, options.cy + options.h * 0.28, options.h * 0.1, options.h * 0.26, options.h * 0.02), options.trunk ?? ctx.pal.foliageDeep, {
      material: options.material,
      cut: true,
    }),
  ];
  for (let i = 0; i < tiers; i += 1) {
    const t = i / tiers;
    const width = options.h * (0.42 - t * 0.1);
    const y = options.cy + options.h * (0.3 - t * 0.28);
    nodes.push(
      ink(ctx, 'pine-tier', polygonPath([
        [options.cx - width, y],
        [options.cx, y - options.h * 0.34],
        [options.cx + width, y],
      ]), options.fill ?? ctx.pal.foliage, { material: options.material, cut: true, label: 'Pine' }),
    );
  }
  return nodes;
}

export function tent(
  ctx: ArtCtx,
  options: { cx: number; cy: number; w: number; h: number; fill?: string; trim?: string; material?: string },
): SceneNode[] {
  const { cx, cy, w, h } = options;
  const fill = options.fill ?? ctx.pal.accent;
  return [
    ink(ctx, 'tent', polygonPath([
      [cx - w / 2, cy + h / 2],
      [cx, cy - h / 2],
      [cx + w / 2, cy + h / 2],
    ]), fill, { material: options.material, cut: true, label: 'Tent' }),
    ink(ctx, 'tent-door', polygonPath([
      [cx - w * 0.16, cy + h / 2],
      [cx, cy - h * 0.1],
      [cx + w * 0.16, cy + h / 2],
    ]), mix(fill, ctx.pal.ink, 0.35), { material: options.material, cut: true }),
    ink(ctx, 'tent-pole', polygonPath([[cx, cy - h / 2], [cx, cy - h * 0.72]], false), 'none', {
      stroke: { color: options.trim ?? ctx.pal.ink, width: 0.6 },
      material: options.material,
    }),
    ink(ctx, 'tent-flag', polygonPath([
      [cx, cy - h * 0.72],
      [cx + w * 0.22, cy - h * 0.62],
      [cx, cy - h * 0.52],
    ]), ctx.pal.secondary, { material: options.material, role: 'accents', cut: true }),
  ];
}

export function campfire(
  ctx: ArtCtx,
  options: { cx: number; cy: number; scale: number; flame?: string; log?: string; material?: string },
): SceneNode[] {
  const { cx, cy, scale: s } = options;
  const flame = options.flame ?? ctx.pal.accent;
  const log = options.log ?? '#8a5a3b';
  return [
    group(
      [
        ink(ctx, 'campfire-flame', smoothClosedPath(
          [
            [cx - s * 0.5, cy + s * 0.2],
            [cx - s * 0.24, cy - s * 0.5],
            [cx, cy - s * 1.0],
            [cx + s * 0.26, cy - s * 0.44],
            [cx + s * 0.5, cy + s * 0.2],
            [cx, cy + s * 0.42],
          ],
          0.5,
        ), flame, { material: options.material, cut: true, label: 'Campfire' }),
        ink(ctx, 'campfire-flame-inner', smoothClosedPath(
          [
            [cx - s * 0.22, cy + s * 0.24],
            [cx, cy - s * 0.5],
            [cx + s * 0.22, cy + s * 0.24],
          ],
          0.5,
        ), mix(flame, ctx.pal.highlight, 0.5), { material: options.material }),
        ink(ctx, 'campfire-log', roundedRectPath(cx - s * 0.7, cy + s * 0.3, s * 1.4, s * 0.2, s * 0.1), log, {
          material: options.material,
          cut: true,
          transform: [Math.cos(0.2), Math.sin(0.2), -Math.sin(0.2), Math.cos(0.2), cx - cx * Math.cos(0.2) + (cy + s * 0.4) * Math.sin(0.2), cy + s * 0.4 - cx * Math.sin(0.2) - (cy + s * 0.4) * Math.cos(0.2)],
        }),
        ink(ctx, 'campfire-log', roundedRectPath(cx - s * 0.7, cy + s * 0.3, s * 1.4, s * 0.2, s * 0.1), mix(log, ctx.pal.ink, 0.25), {
          material: options.material,
          cut: true,
          transform: [Math.cos(-0.2), Math.sin(-0.2), -Math.sin(-0.2), Math.cos(-0.2), cx - cx * Math.cos(-0.2) + (cy + s * 0.5) * Math.sin(-0.2), cy + s * 0.5 - cx * Math.sin(-0.2) - (cy + s * 0.5) * Math.cos(-0.2)],
        }),
      ],
      { id: ctx.id('campfire'), role: 'illustration', material: options.material ?? ctx.material, label: 'Campfire' },
    ),
  ];
}

export function lighthouse(
  ctx: ArtCtx,
  options: { cx: number; cy: number; h: number; body?: string; stripe?: string; light?: string; material?: string },
): SceneNode[] {
  const { cx, cy, h } = options;
  const body = options.body ?? ctx.pal.surface;
  const stripe = options.stripe ?? ctx.pal.accent;
  return [
    group(
      [
        ink(ctx, 'lh-base', roundedRectPath(cx - h * 0.22, cy + h * 0.36, h * 0.44, h * 0.14, h * 0.03), mix(body, ctx.pal.ink, 0.2), { material: options.material, cut: true }),
        ink(ctx, 'lh-tower', polygonPath([
          [cx - h * 0.16, cy + h * 0.38],
          [cx - h * 0.11, cy - h * 0.34],
          [cx + h * 0.11, cy - h * 0.34],
          [cx + h * 0.16, cy + h * 0.38],
        ]), body, { material: options.material, cut: true, label: 'Lighthouse' }),
        ink(ctx, 'lh-stripe', polygonPath([
          [cx - h * 0.145, cy + h * 0.1],
          [cx + h * 0.145, cy + h * 0.1],
          [cx + h * 0.15, cy + h * 0.22],
          [cx - h * 0.15, cy + h * 0.22],
        ]), stripe, { material: options.material }),
        ink(ctx, 'lh-gallery', roundedRectPath(cx - h * 0.16, cy - h * 0.4, h * 0.32, h * 0.06, h * 0.02), stripe, { material: options.material, cut: true }),
        ink(ctx, 'lh-lamp', roundedRectPath(cx - h * 0.1, cy - h * 0.56, h * 0.2, h * 0.16, h * 0.03), options.light ?? ctx.pal.secondarySoft, {
          material: options.material,
          cut: true,
        }),
        ink(ctx, 'lh-roof', polygonPath([
          [cx - h * 0.13, cy - h * 0.56],
          [cx, cy - h * 0.7],
          [cx + h * 0.13, cy - h * 0.56],
        ]), stripe, { material: options.material, cut: true }),
        ink(ctx, 'lh-beam', polygonPath([
          [cx + h * 0.1, cy - h * 0.52],
          [cx + h * 0.7, cy - h * 0.66],
          [cx + h * 0.7, cy - h * 0.4],
          [cx + h * 0.1, cy - h * 0.46],
        ]), ctx.pal.secondarySoft, { material: options.material, role: 'accents', opacity: 0.55 }),
        ink(ctx, 'lh-beam', polygonPath([
          [cx - h * 0.1, cy - h * 0.52],
          [cx - h * 0.7, cy - h * 0.66],
          [cx - h * 0.7, cy - h * 0.4],
          [cx - h * 0.1, cy - h * 0.46],
        ]), ctx.pal.secondarySoft, { material: options.material, role: 'accents', opacity: 0.55 }),
      ],
      { id: ctx.id('lighthouse'), role: 'illustration', material: options.material ?? ctx.material, label: 'Lighthouse' },
    ),
  ];
}

export function sun(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; fill?: Paint; ray?: string; face?: boolean; material?: string },
): SceneNode[] {
  const { cx, cy, r } = options;
  const fill = options.fill ?? ctx.pal.secondary;
  const rayColor = options.ray ?? mix(String(fill).slice(0, 7) || ctx.pal.secondary, ctx.pal.highlight, 0.35);
  const nodes: SceneNode[] = [];
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * TAU;
    nodes.push(
      ink(ctx, 'sun-ray', polygonPath([
        [...polar(cx, cy, r * 1.02, a - 0.12)] as Point,
        [...polar(cx, cy, r * 1.42, a)] as Point,
        [...polar(cx, cy, r * 1.02, a + 0.12)] as Point,
      ]), rayColor, { material: options.material, role: 'accents', cut: true }),
    );
  }
  nodes.push(ink(ctx, 'sun', circlePath(cx, cy, r), fill, { material: options.material, cut: true, label: 'Sun' }));
  if (options.face !== false) {
    nodes.push(...eyes(ctx, cx, cy - r * 0.1, r * 0.1, ctx.pal.ink));
    nodes.push(ink(ctx, 'sun-smile', arcPath(cx, cy + r * 0.16, r * 0.36, r * 0.28, Math.PI * 0.18, Math.PI * 0.82), 'none', {
      stroke: { color: ctx.pal.ink, width: r * 0.08, cap: 'round' },
      material: options.material,
    }));
  }
  return [group(nodes, { id: ctx.id('sun'), role: 'illustration', material: options.material ?? ctx.material, label: 'Sun' })];
}

export function rainbowArc(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; bands?: string[]; cloud?: boolean; material?: string },
): SceneNode[] {
  const bands = options.bands ?? [ctx.pal.accent, ctx.pal.secondary, ctx.pal.foliage, ctx.pal.primarySoft, ctx.pal.secondarySoft];
  const nodes: SceneNode[] = [];
  const thickness = options.r * 0.11;
  bands.forEach((color, i) => {
    const r = options.r - i * thickness;
    nodes.push(
      ink(ctx, 'rainbow-band', ringPath(options.cx, options.cy, r, r - thickness * 0.92), color, {
        material: options.material,
        fillRule: 'evenodd',
        role: 'accents',
        clip: 'rainbow',
        opacity: 0.95,
      }),
    );
  });
  return [
    group(nodes, {
      id: ctx.id('rainbow'),
      role: 'illustration',
      material: options.material ?? ctx.material,
      label: 'Rainbow',
      clip: 'rainbow',
    }),
  ];
}

/** Half-disc clip path used to keep rainbows above the horizon. */
export function rainbowClip(id: string, cx: number, cy: number, r: number): { id: string; d: string } {
  return { id, d: polygonPath([[cx - r * 1.1, cy], [cx + r * 1.1, cy], [cx + r * 1.1, cy - r * 1.4], [cx - r * 1.1, cy - r * 1.4]]) };
}

export function starrySky(
  ctx: ArtCtx,
  options: { box: { x: number; y: number; w: number; h: number }; rand: () => number; count?: number; color?: Paint; sizes?: [number, number] },
): SceneNode[] {
  const count = options.count ?? 22;
  const [minSize, maxSize] = options.sizes ?? [1.2, 3];
  const nodes: SceneNode[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = options.box.x + options.rand() * options.box.w;
    const y = options.box.y + options.rand() * options.box.h;
    const r = minSize + options.rand() * (maxSize - minSize);
    nodes.push(
      options.rand() > 0.55
        ? ink(ctx, 'sky-star', starPath(x, y, r, r * 0.4, 4), options.color ?? ctx.pal.highlight)
        : ink(ctx, 'sky-dot', circlePath(x, y, r * 0.34), options.color ?? ctx.pal.highlight),
    );
  }
  return nodes;
}

export function galaxySwirl(
  ctx: ArtCtx,
  options: { cx: number; cy: number; r: number; color?: string; arm?: string; material?: string },
): SceneNode[] {
  const nodes: SceneNode[] = [];
  for (const dir of [1, -1] as const) {
    const pts: Point[] = [];
    for (let i = 0; i <= 24; i += 1) {
      const t = i / 24;
      const a = dir * t * 3.2;
      pts.push(polar(options.cx, options.cy, options.r * (0.16 + t * 0.84), a));
    }
    nodes.push(
      ink(ctx, 'galaxy-arm', smoothPath(pts, 0.5), 'none', {
        stroke: { color: options.arm ?? ctx.pal.primarySoft, width: options.r * 0.12, cap: 'round' },
        material: options.material,
        opacity: 0.85,
        role: 'accents',
      }),
    );
  }
  nodes.push(
    ink(ctx, 'galaxy-core', circlePath(options.cx, options.cy, options.r * 0.2), options.color ?? ctx.pal.secondarySoft, {
      material: options.material,
      opacity: 0.9,
      role: 'accents',
    }),
  );
  return nodes;
}

export function cometTrail(
  ctx: ArtCtx,
  options: { cx: number; cy: number; length: number; angle: number; color?: string; material?: string },
): SceneNode[] {
  const tail: Point[] = [];
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    const spread = Math.sin(Math.PI * t) * options.length * 0.1;
    tail.push(polar(options.cx, options.cy, options.length * t, options.angle + Math.PI));
    if (spread > 0.2) tail.push(polar(options.cx, options.cy, options.length * t, options.angle + Math.PI + 0.05));
  }
  return [
    ink(ctx, 'comet-core', circlePath(options.cx, options.cy, options.length * 0.09), ctx.pal.highlight, { material: options.material, cut: true }),
    ink(ctx, 'comet-tail', smoothClosedPath(tail.slice(0, 12), 0.4), options.color ?? ctx.pal.secondarySoft, {
      material: options.material,
      opacity: 0.7,
      role: 'accents',
    }),
  ];
}

export { burstPath, line, starCluster, shade, type PaletteTokens };
