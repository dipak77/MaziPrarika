/**
 * Category F — Original Superhero Designs
 *
 * 26 Superhero Emblem · 27 Lightning Bolt Hero · 28 Comic Burst Cape
 * 29 Hero Mask & Shield · 30 Skyline Guardian
 *
 * Everything here is generic comic-book language — stars, bolts, masks, capes
 * and city silhouettes. No character, logo or costume from any existing
 * property is referenced or imitated.
 */

import { circlePath, polygonPath, roundedRectPath, scatter } from '../../geometry.js';
import type { SceneNode } from '../../scene.js';
import { ink, line, stack } from '../../art/helpers.js';
import { capeWings, explosionBurst, halftoneRays, heroEmblem, heroMask, lightningBolt } from '../../art/motifs.js';
import { burst, foilSwash, sparkle, starCluster } from '../../art/decor.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const SPORT = { display: 'bebas-neue', title: 'bebas-neue', body: 'poppins' };
const PLAY = { display: 'baloo2', title: 'poppins', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/** Halftone dot field — the printing texture that makes comic panels read. */
function halftoneField(input: Parameters<CakeTemplate['compose']>[0], box: { x: number; y: number; w: number; h: number }): SceneNode[] {
  const ctx = composeCtx(input, 'base');
  const t = input.tokens;
  const out: SceneNode[] = [];
  const step = 5.4;
  for (let x = box.x; x < box.x + box.w; x += step) {
    for (let y = box.y; y < box.y + box.h; y += step) {
      const radius = 0.5 + 0.9 * input.rand();
      out.push(ink(ctx, 'halftone', circlePath(x, y, radius), t.secondarySoft, { role: 'accents', opacity: 0.7 }));
    }
  }
  return out;
}

/* 26 — Superhero Emblem */
const superheroEmblem: CakeTemplate = {
  id: 'superhero-emblem',
  version: 1,
  name: 'Superhero Emblem',
  description: 'A heraldic shield with a star charge, halftone rays and two lightning bolts.',
  category: 'hero',
  tags: { gender: ['boy', 'unisex'], styles: ['bold'], occasions: ['birthday'], ages: [3, 10] },
  aspect: 'square',
  defaultPalette: 'rainbow-pop',
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('medallion', SPORT, {
    title: { x: 30, y: 26, width: 92.4, height: 12, maxSizePt: 19, minSizePt: 9, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.36, default: 0.24 } },
    name: { x: 28, y: 82, width: 96.4, height: 26, maxSizePt: 36, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'], letterSpacing: { min: 0, max: 0.18, default: 0.06 } },
    subtitle: { x: 32, y: 110, width: 88.4, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
  }),
  defaults: { name: 'Aarav', title: 'Happy Birthday', subtitle: 'Saving the day since 2021', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'sunburst', accent: 'accentSoft', opacity: 0.6 },
  safeInset: 6,
  notes: 'Designed to be readable from across a room: bold shapes, one strong contrast, no thin outlines.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...halftoneRays(ctx, { cx, cy: 60, rInner: 30, rOuter: 62, count: 22, color: t.secondarySoft }));
    nodes.push(...heroEmblem(ctx, { cx, cy: 60, r: 40, shape: 'shield', fill: t.primary, border: t.secondary, charge: t.accent, chargeKind: 'star' }));
    nodes.push(...lightningBolt(ctx, { cx: 22, cy: 62, h: 44, fill: t.accent, glow: t.accentSoft, cut: true }));
    nodes.push(...lightningBolt(ctx, { cx: 132, cy: 62, h: 44, fill: t.accent, glow: t.accentSoft, cut: true }));
    nodes.push(...starCluster(ctx, { points: [[40, 22], [112, 22], [76, 16]], r: 3.4, fill: t.secondary }));
    nodes.push(nameplateFor(input, { style: 'shield', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 20, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 27 — Lightning Bolt Hero */
const lightningBoltHero: CakeTemplate = {
  id: 'lightning-bolt-hero',
  version: 1,
  name: 'Lightning Bolt Hero',
  description: 'One enormous bolt splitting an action burst, with comic speed lines behind it.',
  category: 'hero',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'playful'], occasions: ['birthday', 'milestone'], ages: [3, 12] },
  aspect: 'square',
  defaultPalette: 'sunshine-sky',
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('band', SPORT, {
    title: { x: 20, y: 60, width: 112.4, height: 14, maxSizePt: 24, minSizePt: 10, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
    name: { x: 16, y: 76, width: 120.4, height: 28, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'] },
    age: { x: 110, y: 12, width: 32, height: 32, maxSizePt: 26, minSizePt: 12, families: ['bebas-neue', 'poppins'] },
  }),
  defaults: { name: 'Veer', title: 'Happy Birthday', subtitle: 'Faster than a birthday candle', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'rays', accent: 'accentSoft', opacity: 0.55 },
  safeInset: 6,
  notes: 'Speed lines are strokes, not shapes — they never enter the cut file, so the piece stays one clean silhouette.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const lines: SceneNode[] = [];
    for (let i = 0; i < 14; i += 1) {
      const y = 10 + i * 4.6;
      const inset = i % 2 === 0 ? 6 : 14;
      lines.push(line(ctx, 'speed', polygonPath([[inset, y], [input.width - inset, y - 2]], false), t.secondarySoft, 0.8, { opacity: 0.55, role: 'accents' }));
    }
    const nodes: TemplatePart[] = [stack(ctx, 'speed-lines', lines)];
    nodes.push(...explosionBurst(ctx, { cx, cy: 48, r: 46, fill: t.accent, inner: t.secondary, spikes: 14 }));
    nodes.push(...lightningBolt(ctx, { cx, cy: 48, h: 74, fill: t.primary, glow: t.surface, cut: true }));
    nodes.push(...starCluster(ctx, { points: [[28, 20], [124, 24], [34, 84], [120, 88]], r: 3, fill: t.secondary }));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.primary }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.primaryDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 28 — Comic Burst Cape */
const comicBurstCape: CakeTemplate = {
  id: 'comic-burst-cape',
  version: 1,
  name: 'Comic Burst Cape',
  description: 'A spread cape above a comic panel of halftone dots and a lettered burst.',
  category: 'hero',
  tags: { gender: ['unisex'], styles: ['bold', 'playful'], occasions: ['birthday'], ages: [3, 11] },
  aspect: 'square',
  defaultPalette: 'rainbow-pop',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['baloo2', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Reeyansh', title: 'Happy Birthday', subtitle: 'With great cake comes great responsibility', age: '7', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'dots', accent: 'accentSoft', opacity: 0.5 },
  safeInset: 6,
  notes: 'Cape folds are drawn as filled crescents so they read on dark card as well as light.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(stack(ctx, 'halftone', halftoneField(input, { x: 12, y: 12, w: 128, h: 70 })));
    nodes.push(...capeWings(ctx, { cx, cy: 52, w: 108, h: 74, fill: t.primary, trim: t.accent }));
    nodes.push(...burstPanel(input, cx));
    nodes.push(...starCluster(ctx, { points: [[30, 30], [122, 30], [76, 20]], r: 3.2, fill: t.secondary }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx: 120, cy: 66, r: 3.6, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'ribbon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 20, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/** The comic "POW" panel: a starburst with a short word set as artwork. */
function burstPanel(input: Parameters<CakeTemplate['compose']>[0], cx: number): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  const out: SceneNode[] = [];
  for (const [x, y, w] of [[34, 74, 44], [118, 70, 38]] as [number, number, number][]) {
    out.push(...burst(ctx, { cx: x, cy: y, r: w * 0.62, spikes: 12, fill: t.surface, inner: t.accentSoft }));
    out.push(line(ctx, 'panel-rule', polygonPath([[x - w / 2, y + 8], [x + w / 2, y + 8]], false), t.outline, 0.7, { role: 'accents' }));
  }
  out.push(...foilSwash(ctx, { x: cx - 46, y: 34, width: 92, thickness: 3.2, curve: 0.35 }));
  return out;
}

/* 29 — Hero Mask & Shield */
const heroMaskShield: CakeTemplate = {
  id: 'hero-mask-shield',
  version: 1,
  name: 'Hero Mask & Shield',
  description: 'A domino mask above a layered shield badge, with an optional cape tab.',
  category: 'hero',
  tags: { gender: ['boy', 'unisex'], styles: ['bold', 'playful'], occasions: ['birthday', 'baby-shower'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'monochrome-ink',
  paletteOverrides: { 'rainbow-pop': { primary: '#2f6fd0', accent: '#ef4b4b' } },
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('classic', SPORT, {
    title: { x: 14, y: 88, width: 124.4, height: 12, maxSizePt: 21, minSizePt: 9, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.22 } },
    name: { x: 13, y: 100, width: 126.4, height: 24, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'] },
  }),
  defaults: { name: 'Kabir', title: 'Happy Birthday', subtitle: 'Defender of the cake', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'stripes', accent: 'accentSoft', opacity: 0.35 },
  safeInset: 6,
  notes: 'Monochrome by default — the studio shows a red/blue variant when Rainbow Pop is selected.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...halftoneRays(ctx, { cx, cy: 56, rInner: 22, rOuter: 60, count: 18, color: t.soft, opacity: 0.6 }));
    nodes.push(...heroMask(ctx, { cx, cy: 40, w: 58, h: 30, fill: t.primary, lens: t.highlight }));
    nodes.push(...heroEmblem(ctx, { cx, cy: 72, r: 30, shape: 'burst', fill: t.secondary, border: t.primary, charge: t.accent, chargeKind: 'bolt', spikes: 10 }));
    nodes.push(...starCluster(ctx, { points: [[26, 26], [126, 30], [24, 92], [128, 88]], r: 3, fill: t.accent }));
    if (on(input, 'confetti')) {
      for (const [x, y] of scatter(10, { x: 18, y: 20, w: 116, h: 58 }, 7788, 9)) {
        nodes.push(ink(ctx, 'swoosh', roundedRectPath(x, y, 6, 2.2, 1.1), t.accentSoft, { role: 'accents', opacity: 0.85 }));
      }
    }
    nodes.push(nameplateFor(input, { style: 'ticket', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.primary }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 30 — Skyline Guardian */
const skylineGuardian: CakeTemplate = {
  id: 'skyline-guardian',
  version: 1,
  name: 'Skyline Guardian',
  description: 'A city skyline at night with a searchlight beam and a small caped silhouette on a rooftop.',
  category: 'hero',
  tags: { gender: ['unisex'], styles: ['bold', 'editorial'], occasions: ['birthday', 'milestone'], ages: [5, 14] },
  aspect: 'square',
  defaultPalette: 'midnight-gold',
  typography: TYPOGRAPHY.boldSport!,
  regions: layout('poster', SPORT, {
    title: { x: 16, y: 92, width: 120.4, height: 13, maxSizePt: 22, minSizePt: 9, families: ['bebas-neue', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.34, default: 0.24 } },
    name: { x: 14, y: 104, width: 124.4, height: 26, maxSizePt: 38, minSizePt: 12, maxLines: 2, breakWords: true, families: ['bebas-neue', 'poppins'] },
    subtitle: { x: 20, y: 132, width: 112.4, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
  }, { w: 152.4, h: 152.4 }),
  defaults: { name: 'Shaurya', title: 'Happy Birthday', subtitle: 'The city sleeps, the cake does not', age: '9', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.7 },
  safeInset: 6,
  notes: 'Windows are printed dots in a warm ink; the skyline silhouette is the only large cut piece besides the plate.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...searchlight(ctx, input.width));
    nodes.push(...citySkyline(ctx, input.width));
    nodes.push(...starCluster(ctx, { points: [[26, 22], [118, 18], [140, 40]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(...capedFigure(ctx, 116, 74));
    nodes.push(nameplateFor(input, { style: 'pennant', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.secondary }));
    nodes.push(...ageBadgeFor(input, { petals: 20, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function citySkyline(ctx: ReturnType<typeof composeCtx>, width: number): SceneNode[] {
  const t = ctx.pal;
  const out: SceneNode[] = [];
  const blocks: [number, number, number][] = [
    [0, 96, 20], [22, 82, 16], [40, 104, 22], [64, 74, 18], [84, 98, 20], [106, 84, 16], [124, 100, 28],
  ];
  const windows: SceneNode[] = [];
  for (const [x, y, w] of blocks) {
    out.push(ink(ctx, 'building', polygonPath([[x, y], [x + w, y], [x + w, 132], [x, 132]]), t.primary, { role: 'illustration', cut: true, label: 'Building' }));
    out.push(line(ctx, 'roof', polygonPath([[x, y], [x + w, y]], false), t.accentSoft, 1.1, { role: 'accents', opacity: 0.8 }));
    for (let wy = y + 5; wy < 128; wy += 8) {
      for (let wx = x + 4; wx < x + w - 3; wx += 6) {
        windows.push(ink(ctx, 'window', roundedRectPath(wx, wy, 2.4, 3, 0.8), t.secondarySoft, { role: 'accents', opacity: 0.75 }));
      }
    }
  }
  return [...out, stack(ctx, 'windows', windows)];
}

function searchlight(ctx: ReturnType<typeof composeCtx>, width: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'searchlight', polygonPath([[width - 8, 12], [width + 6, 20], [width + 6, 4]]), t.secondarySoft, { role: 'accents', opacity: 0.5 }),
    ink(ctx, 'city-glow', circlePath(width / 2, 96, 52), t.accentSoft, { role: 'accents', opacity: 0.16 }),
  ];
}

function capedFigure(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number): SceneNode[] {
  const t = ctx.pal;
  return [
    ink(ctx, 'hero-cape', polygonPath([[cx - 12, cy + 14], [cx - 2, cy - 2], [cx + 8, cy + 2], [cx + 14, cy + 14]]), t.accent, { role: 'secondary', cut: true, label: 'Caped figure' }),
    ink(ctx, 'hero-head', circlePath(cx, cy - 4, 4.2), t.secondary, { role: 'secondary' }),
    ink(ctx, 'hero-ears', polygonPath([[cx - 3.6, cy - 7], [cx - 6.4, cy - 12], [cx - 1.2, cy - 8.4]]), t.secondary, { role: 'secondary' }),
    ink(ctx, 'hero-ears-2', polygonPath([[cx + 3.6, cy - 7], [cx + 6.4, cy - 12], [cx + 1.2, cy - 8.4]]), t.secondary, { role: 'secondary' }),
  ];
}

export const HERO_TEMPLATES: CakeTemplate[] = [
  superheroEmblem,
  lightningBoltHero,
  comicBurstCape,
  heroMaskShield,
  skylineGuardian,
];
