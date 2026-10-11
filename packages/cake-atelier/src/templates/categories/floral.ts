/**
 * Category J — Floral & Butterfly
 *
 * 46 Watercolour Rose Garden · 47 Boho Pampas Arch · 48 Daisy Meadow Wheel
 * 49 Peony Blossom Frame · 50 Botanical Leaf Wreath
 *
 * Floral paper art lives or dies on restraint: each design uses one petal shape,
 * one leaf shape and a single accent, repeated at three scales.
 */

import { circlePath, petalPath, polar } from '../../geometry.js';
import { mix } from '../../palettes.js';
import type { SceneNode } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { bee, butterfly } from '../../art/animals.js';
import { archFrame, dotGrid, flower, frameCorners, leafBranch, pearlChain, shadowPlate, sparkle, starCluster, wreath } from '../../art/decor.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const ROMAN = { display: 'playfair-display', title: 'poppins', body: 'poppins' };
const SOFT = { display: 'quicksand', title: 'quicksand', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/** A rose built from concentric offset petals — cheap to cut, expensive to look at. */
function rose(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, r: number, outer: string, inner: string): SceneNode[] {
  const nodes: SceneNode[] = [];
  for (let ring = 0; ring < 3; ring += 1) {
    const ringR = r * (1 - ring * 0.3);
    const petals = 6 - ring;
    const fill = mix(outer, inner, ring / 3);
    for (let i = 0; i < petals; i += 1) {
      const angle = (i / petals) * Math.PI * 2 + ring * 0.4;
      nodes.push(ink(ctx, 'rose-petal', petalPath(cx, cy, ringR, ringR * 0.9, angle), fill, { role: 'illustration', cut: ring === 0, label: ring === 0 ? 'Rose' : undefined }));
    }
  }
  nodes.push(ink(ctx, 'rose-centre', circlePath(cx, cy, r * 0.22), inner, { role: 'accents' }));
  return nodes;
}

/* 46 — Watercolour Rose Garden */
const watercolourRoseGarden: CakeTemplate = {
  id: 'watercolour-rose-garden',
  version: 1,
  name: 'Watercolour Rose Garden',
  description: 'Roses at three scales with leaf sprays and a soft wash background — romantic and full.',
  category: 'floral',
  tags: { gender: ['girl', 'unisex'], styles: ['pastel', 'luxury'], occasions: ['birthday', 'baby-shower', 'anniversary'], ages: [1, 12] },
  aspect: 'square',
  defaultPalette: 'blush-rose-gold',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('editorial', ROMAN, {
    name: { x: 26, y: 76, width: 100.4, height: 30, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true, families: [ROMAN.display, 'great-vibes', ROMAN.body] },
  }),
  defaults: { name: 'Ira', title: 'Happy Birthday', subtitle: 'Blooming lovely', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'glow', accent: 'primarySoft' },
  safeInset: 8,
  notes: 'The densest design in the collection: allow an extra 15 minutes for cutting the small blooms.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...rose(ctx, 32, 34, 17, t.primary, t.accent));
    nodes.push(...rose(ctx, 122, 40, 13, t.primarySoft, t.accent));
    nodes.push(...rose(ctx, 116, 100, 15, t.accent, t.primary));
    nodes.push(...leafBranch(ctx, { cx: 20, cy: 62, length: 40, angle: 1.2, leaves: 5, fill: t.foliage }));
    nodes.push(...leafBranch(ctx, { cx: 134, cy: 70, length: 36, angle: Math.PI - 1.2, leaves: 4, fill: t.foliageDeep }));
    nodes.push(...wreath(ctx, { cx: 76, cy: 62, r: 46, from: Math.PI * 0.62, to: Math.PI * 1.38, leaves: 9, fill: t.foliage }));
    nodes.push(...flower(ctx, { cx: 58, cy: 26, r: 8, petals: 5, petalFill: t.secondary, centerFill: t.accent, style: 'round' }));
    nodes.push(...flower(ctx, { cx: 96, cy: 92, r: 7, petals: 6, petalFill: t.secondarySoft, centerFill: t.accentDeep, style: 'daisy' }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx: 48, cy: 96, r: 3.2, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'minimal', material: 'accent', fill: 'none', edge: t.accent, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { shape: 'banner', fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 47 — Boho Pampas Arch */
const bohoPampasArch: CakeTemplate = {
  id: 'boho-pampas-arch',
  version: 1,
  name: 'Boho Pampas Arch',
  description: 'A dry-grass arch with pampas plumes and a crescent of dried florals at the base.',
  category: 'floral',
  tags: { gender: ['unisex'], styles: ['editorial', 'pastel'], occasions: ['baby-shower', 'naming', 'anniversary'], ages: [0, 12] },
  aspect: 'portrait',
  defaultPalette: 'sage-eucalyptus',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('poster', ROMAN, {
    name: { x: 16, y: 112, width: 95, height: 30, maxSizePt: 36, minSizePt: 11, maxLines: 2, breakWords: true, families: [ROMAN.display, 'great-vibes', ROMAN.body] },
    title: { x: 18, y: 100, width: 91, height: 11, maxSizePt: 16, minSizePt: 9, families: ['poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.36, default: 0.24 } },
    subtitle: { x: 20, y: 145, width: 87, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
    age: { x: 88, y: 14, width: 30, height: 30, maxSizePt: 24, minSizePt: 12, families: [ROMAN.display, ROMAN.body] },
    date: { x: 18, y: 169, width: 91, height: 8, maxSizePt: 10, minSizePt: 7, families: ['poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Meher', title: 'Welcome Little One', subtitle: 'Boho, calm and cosy', age: '0', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'plain', accent: 'foliage' },
  safeInset: 9,
  notes: 'Pampas plumes are drawn as stepped fronds so they can be cut with scissors if a machine is unavailable.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(archFrame(ctx, { x: 14, y: 16, w: 99, h: 176 }, { stroke: t.foliage, width: 1.6, cap: true }));
    nodes.push(...pampas(ctx, 40, 118, 1, t.secondarySoft, t.accentSoft));
    nodes.push(...pampas(ctx, 44, 122, 0.82, t.secondary, t.accent));
    nodes.push(...pampas(ctx, 92, 120, 0.94, t.secondarySoft, t.accentSoft));
    nodes.push(...flower(ctx, { cx: 66, cy: 128, r: 14, petals: 6, petalFill: t.primary, centerFill: t.accent, style: 'round' }));
    nodes.push(...leafBranch(ctx, { cx: 32, cy: 100, length: 42, angle: 1.35, leaves: 5, fill: t.foliage }));
    nodes.push(...leafBranch(ctx, { cx: 96, cy: 96, length: 42, angle: Math.PI - 1.35, leaves: 5, fill: t.foliageDeep }));
    nodes.push(...starCluster(ctx, { points: [[24, 40], [100, 34], [22, 74], [104, 70]], r: 2.4, fill: t.accentSoft }));
    nodes.push(...dotGrid(ctx, { box: { x: 20, y: 22, w: 88, h: 100 }, step: 11, r: 0.7, color: t.foliageDeep, opacity: 0.25 }));
    nodes.push(nameplateFor(input, { style: 'minimal', material: 'accent', fill: 'none', edge: t.accent, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { shape: 'banner', fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/** A pampas plume: a stem with stepped feather flanks. */
function pampas(ctx: ReturnType<typeof composeCtx>, x: number, y: number, scale: number, plume: string, tip: string): SceneNode[] {
  const out: SceneNode[] = [];
  out.push(ink(ctx, 'pampas-stem', `M ${x} ${y} C ${x - 3 * scale} ${y - 26 * scale} ${x + 2 * scale} ${y - 40 * scale} ${x + 1 * scale} ${y - 56 * scale}`, 'none', { stroke: { color: mix(plume, '#6b6a5a', 0.4), width: 1.1, cap: 'round' }, role: 'accents' }));
  for (let i = 0; i < 7; i += 1) {
    const yy = y - 22 * scale - i * 5 * scale;
    const spread = (7 - i) * 1.8 * scale;
    out.push(ink(ctx, 'pampas-frond', petalPath(x, yy, spread + 3 * scale, 3.4 * scale, Math.PI), mix(plume, tip, i / 8), { role: 'secondary' }));
    out.push(ink(ctx, 'pampas-frond', petalPath(x, yy, spread + 3 * scale, 3.4 * scale, 0), mix(plume, tip, i / 8), { role: 'secondary' }));
  }
  return out;
}

/* 48 — Daisy Meadow Wheel */
const daisyMeadowWheel: CakeTemplate = {
  id: 'daisy-meadow-wheel',
  version: 1,
  name: 'Daisy Meadow Wheel',
  description: 'A wheel of daisies with a bee in the middle of the flowers — bright and unfussy.',
  category: 'floral',
  tags: { gender: ['girl', 'unisex'], styles: ['playful', 'pastel'], occasions: ['birthday', 'first-birthday'], ages: [1, 7] },
  aspect: 'square',
  defaultPalette: 'peach-cream',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('medallion', SOFT, {
    name: { x: 34, y: 64, width: 84.4, height: 26, maxSizePt: 34, minSizePt: 11, maxLines: 2, breakWords: true, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Saanvi', title: 'Happy Birthday', subtitle: 'Daisy chains and sunshine', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'dots', accent: 'accentSoft', opacity: 0.42 },
  safeInset: 6,
  notes: 'Sixteen daisies at three radii; on a 4 in topper the count halves automatically through the paper scale.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [
      ink(ctx, 'meadow-disc', circlePath(cx, 60, 48), t.surface, { role: 'illustration', cut: true, label: 'Meadow disc', material: 'accent' }),
    ];
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = i % 2 === 0 ? 41 : 33;
      const [px, py] = polar(cx, 60, radius, angle);
      nodes.push(...flower(ctx, { cx: px, cy: py, r: i % 3 === 0 ? 7.4 : 5.8, petals: 6, petalFill: t.secondary, centerFill: t.accent, style: 'daisy' }));
    }
    nodes.push(...bee(ctx, { cx, cy: 60, scale: 0.78, body: t.accentSoft, stripe: t.outline, wing: t.surface }));
    nodes.push(...starCluster(ctx, { points: [[24, 20], [128, 24], [22, 104], [130, 100]], r: 2.6, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.accentSoft, accent: t.primary }));
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

/* 49 — Peony Blossom Frame */
const peonyBlossomFrame: CakeTemplate = {
  id: 'peony-blossom-frame',
  version: 1,
  name: 'Peony Blossom Frame',
  description: 'Two oversized peonies hold a slim frame — maximal flowers, minimal everything else.',
  category: 'floral',
  tags: { gender: ['girl', 'unisex'], styles: ['luxury', 'editorial'], occasions: ['birthday', 'anniversary', 'milestone'], ages: [1, 14] },
  aspect: 'square',
  defaultPalette: 'blush-rose-gold',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('editorial', ROMAN, {
    name: { x: 26, y: 72, width: 100.4, height: 32, maxSizePt: 42, minSizePt: 11, maxLines: 2, breakWords: true, families: [ROMAN.display, 'great-vibes', ROMAN.body] },
    age: { x: 58, y: 116, width: 36, height: 36, maxSizePt: 26, minSizePt: 12, families: [ROMAN.display, ROMAN.body] },
  }),
  defaults: { name: 'Nyra', title: 'Happy Birthday', subtitle: 'Full bloom', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'plain', accent: 'primarySoft' },
  safeInset: 10,
  notes: 'The peonies are the largest single cut pieces in the collection — check sheet size before printing.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...frameCorners(ctx, { x: 14, y: 14, w: input.width - 28, h: input.height - 28 }, { gap: 24, color: t.accent, thickness: 1.1, corner: 'bracket' }));
    nodes.push(...peony(ctx, 30, 30, 26, t.primary, t.accent, t.accentSoft));
    nodes.push(...peony(ctx, 124, 122, 22, t.primarySoft, t.accent, t.accentSoft));
    nodes.push(...leafBranch(ctx, { cx: 22, cy: 62, length: 36, angle: 1.3, leaves: 4, fill: t.foliage }));
    nodes.push(...leafBranch(ctx, { cx: 132, cy: 92, length: 34, angle: Math.PI - 1.3, leaves: 4, fill: t.foliageDeep }));
    nodes.push(...starCluster(ctx, { points: [[52, 20], [104, 18], [20, 96], [136, 52]], r: 2.4, fill: t.accentSoft }));
    nodes.push(shadowPlate(ctx, { d: `M 40 130 C 60 118 100 118 118 130`, dx: 0, dy: 2, opacity: 0.12 }));
    nodes.push(nameplateFor(input, { style: 'minimal', material: 'accent', fill: 'none', edge: t.accent, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { shape: 'disc', fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/** A peony: three ruffled rings plus a tight centre. */
function peony(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, r: number, base: string, mid: string, core: string): SceneNode[] {
  const out: SceneNode[] = [];
  const rings: [number, number, string][] = [
    [r, 8, base],
    [r * 0.74, 7, mid],
    [r * 0.5, 6, core],
  ];
  for (const [ringR, petals, fill] of rings) {
    for (let i = 0; i < petals; i += 1) {
      const angle = (i / petals) * Math.PI * 2 + ringR;
      out.push(ink(ctx, 'peony-petal', petalPath(cx, cy, ringR, ringR * 1.15, angle), fill, { role: 'illustration', cut: ringR === r, label: ringR === r ? 'Peony' : undefined }));
    }
  }
  out.push(ink(ctx, 'peony-heart', circlePath(cx, cy, r * 0.16), core, { role: 'accents' }));
  return out;
}

/* 50 — Botanical Leaf Wreath */
const botanicalLeafWreath: CakeTemplate = {
  id: 'botanical-leaf-wreath',
  version: 1,
  name: 'Botanical Leaf Wreath',
  description: 'A dense eucalyptus wreath drawn line-by-line — the editorial centrepiece of the range.',
  category: 'floral',
  tags: { gender: ['unisex'], styles: ['editorial', 'luxury'], occasions: ['naming', 'baby-shower', 'anniversary', 'graduation'], ages: [0, 18] },
  aspect: 'square',
  defaultPalette: 'sage-eucalyptus',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('medallion', ROMAN, {
    title: { x: 30, y: 52, width: 92.4, height: 11, maxSizePt: 16, minSizePt: 9, families: ['poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.36, default: 0.26 } },
    name: { x: 32, y: 68, width: 88.4, height: 30, maxSizePt: 36, minSizePt: 11, maxLines: 2, breakWords: true, families: [ROMAN.display, 'great-vibes', ROMAN.body] },
    subtitle: { x: 34, y: 100, width: 84.4, height: 9, maxSizePt: 12, minSizePt: 8, families: ['poppins'] },
    age: { x: 106, y: 104, width: 32, height: 32, maxSizePt: 24, minSizePt: 12, families: [ROMAN.display, ROMAN.body] },
  }),
  defaults: { name: 'Anaya', title: 'Happy Birthday', subtitle: 'Grown with love', age: '8', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'plain', accent: 'foliage' },
  safeInset: 8,
  notes: 'Leaves are drawn with a 0.4 mm stem so the wreath holds together when lifted off the cutting mat.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...wreath(ctx, { cx, cy: 66, r: 50, from: 0, to: Math.PI * 2, leaves: 22, fill: t.foliage, leafLength: 17 }));
    nodes.push(...leafBranch(ctx, { cx: cx - 30, cy: 108, length: 30, angle: 2.5, leaves: 3, fill: t.foliageDeep }));
    nodes.push(...leafBranch(ctx, { cx: cx + 30, cy: 108, length: 30, angle: Math.PI - 2.5, leaves: 3, fill: t.foliageDeep }));
    nodes.push(...pearlChain(ctx, { cx, cy: 66, r: 34, from: Math.PI * 0.9, to: Math.PI * 2.1, count: 13, pearlR: 1.3, fill: t.secondarySoft }));
    nodes.push(...visitingButterfly(input));
    nodes.push(...starCluster(ctx, { points: [[24, 26], [128, 30], [24, 106], [128, 100]], r: 2.6, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'minimal', material: 'accent', fill: 'none', edge: t.accent, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { shape: 'banner', fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/** A single visiting butterfly, placed to break the wreath's symmetry. */
function visitingButterfly(input: Parameters<CakeTemplate['compose']>[0]): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  return butterfly(ctx, { cx: 116, cy: 36, scale: 0.6, colors: [t.primary, t.accent, t.secondarySoft], spots: t.highlight });
}

export const FLORAL_TEMPLATES: CakeTemplate[] = [
  watercolourRoseGarden,
  bohoPampasArch,
  daisyMeadowWheel,
  peonyBlossomFrame,
  botanicalLeafWreath,
];
