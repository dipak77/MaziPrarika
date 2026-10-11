/**
 * Category G — Unicorn & Fantasy
 *
 * 31 Unicorn Rainbow Crown · 32 Magical Unicorn · 33 Rainbow Cloud Ride
 * 34 Unicorn Horn Sparkle · 35 Fairy Wings & Wand
 */

import { polygonPath, scatter } from '../../geometry.js';
import { mix } from '../../palettes.js';
import type { SceneNode } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { butterfly, fairyWings, unicornHead } from '../../art/animals.js';
import { cloud, flower, pearlChain, sparkle, starCluster, wreath, burst, banner } from '../../art/decor.js';
import { crescentMoon, rainbowArc, starrySky, sun } from '../../art/world.js';
import { crown } from '../../art/royal.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const SOFT = { display: 'quicksand', title: 'quicksand', body: 'quicksand' };
const FANCY = { display: 'playfair-display', title: 'poppins', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/* 31 — Unicorn Rainbow Crown */
const unicornRainbowCrown: CakeTemplate = {
  id: 'unicorn-rainbow-crown',
  version: 1,
  name: 'Unicorn Rainbow Crown',
  description: 'A pastel coronet above a rainbow arc, with a pearl collar and floating hearts.',
  category: 'unicorn',
  tags: { gender: ['girl', 'unisex'], styles: ['pastel', 'cute'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'blush-rose-gold',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', FANCY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['poppins', 'playfair-display'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.2 } },
  }),
  defaults: { name: 'Aaradhya', title: 'Happy Birthday', subtitle: 'Somewhere over the rainbow', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.85 },
  safeInset: 6,
  notes: 'The rainbow is drawn as four nested bands — cut the outer two if you want a subtler palette.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...rainbowArc(ctx, { cx, cy: 74, r: 46, bands: [t.primary, t.accent, t.secondarySoft, t.accentSoft], cloud: true }));
    nodes.push(crown(ctx, {
      cx, cy: 44, width: 60, height: 34, style: 'child',
      metal: t.accent, base: t.primary, jewel: t.secondary,
    }));
    nodes.push(...pearlChain(ctx, { cx, cy: 54, r: 46, from: Math.PI * 1.08, to: Math.PI * 1.92, count: 15, pearlR: 1.4, fill: t.highlight }));
    nodes.push(...heartPair(input, 30, 40, t.accentSoft), ...heartPair(input, 124, 36, t.accent));
    nodes.push(...starCluster(ctx, { points: [[44, 22], [110, 20], [76, 14]], r: 3, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'scallop', material: 'accent', fill: t.nameplate, edge: t.accentSoft, accent: t.primary }));
    nodes.push(...ageBadgeFor(input, { petals: 22, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function heartPair(input: Parameters<CakeTemplate['compose']>[0], cx: number, cy: number, fill: string): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  return [
    ink(ctx, 'heart', `M ${cx} ${cy + 6} C ${cx - 12} ${cy - 3} ${cx - 7} ${cy - 11} ${cx} ${cy - 5} C ${cx + 7} ${cy - 11} ${cx + 12} ${cy - 3} ${cx} ${cy + 6} Z`, fill, { role: 'accents', cut: true, label: 'Heart' }),
  ];
}

/* 32 — Magical Unicorn */
const magicalUnicorn: CakeTemplate = {
  id: 'magical-unicorn',
  version: 1,
  name: 'Magical Unicorn',
  description: 'A unicorn in profile with a five-colour mane and a golden horn on a soft glow.',
  category: 'unicorn',
  tags: { gender: ['girl', 'unisex'], styles: ['pastel', 'luxury'], occasions: ['birthday', 'first-birthday', 'baby-shower'], ages: [1, 10] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', SOFT, {
    name: { x: 13, y: 97, width: 126.4, height: 26, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Anvi', title: 'Happy Birthday', subtitle: 'A little magic every day', age: '2', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'glow', accent: 'secondarySoft' },
  safeInset: 6,
  notes: 'The horn is a separate layer so it can be printed in simulated gold without tinting the whole head.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...burst(ctx, { cx: input.width / 2, cy: 58, r: 50, spikes: 20, fill: t.surface, inner: t.accentSoft }));
    nodes.push(...unicornHead(ctx, { cx: 76, cy: 60, scale: 1.15, body: t.surfaceAlt, mane: t.primary, horn: t.accent, muzzle: t.primarySoft, ink: t.ink }));
    nodes.push(...flower(ctx, { cx: 30, cy: 88, r: 10, petals: 6, petalFill: t.primary, centerFill: t.accent, style: 'round' }));
    nodes.push(...flower(ctx, { cx: 124, cy: 34, r: 8, petals: 5, petalFill: t.accentSoft, centerFill: t.accent, style: 'daisy' }));
    nodes.push(...starCluster(ctx, { points: [[26, 26], [132, 82], [110, 18], [36, 106]], r: 3, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) {
      for (const [x, y] of scatter(6, { x: 20, y: 16, w: 112, h: 70 }, 3131, 12)) {
        nodes.push(...sparkle(ctx, { cx: x, cy: y, r: 2.6, fill: t.accentSoft }));
      }
    }
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 22, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 33 — Rainbow Cloud Ride */
const rainbowCloudRide: CakeTemplate = {
  id: 'rainbow-cloud-ride',
  version: 1,
  name: 'Rainbow Cloud Ride',
  description: 'A cloud carrying a crescent moon and stars along a wide rainbow — calm and dreamy.',
  category: 'unicorn',
  tags: { gender: ['unisex'], styles: ['pastel', 'cute'], occasions: ['baby-shower', 'first-birthday', 'naming'], ages: [0, 4] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 84, width: 124.4, height: 11, maxSizePt: 17, minSizePt: 9, families: ['quicksand'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.2 } },
    age: { x: 12, y: 12, width: 32, height: 32, maxSizePt: 26, minSizePt: 12, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Ira', title: 'Happy Birthday', subtitle: 'Sweet dreams and soft clouds', age: '1', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.9 },
  safeInset: 6,
  notes: 'Designed for 5 in and above — the rainbow bands drop below 2 mm on a 4 in topper.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...rainbowArc(ctx, { cx, cy: 78, r: 44, bands: [t.primary, t.accent, t.secondary, t.accentSoft], cloud: true }));
    nodes.push(...cloud(ctx, { cx, cy: 48, w: 74, h: 26, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...crescentMoon(ctx, { cx, cy: 42, r: 15, fill: t.accentSoft }));
    nodes.push(...starCluster(ctx, { points: [[34, 28], [116, 30], [76, 24], [100, 60]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(...sparkle(ctx, { cx: 128, cy: 58, r: 3, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'ticket', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.primary }));
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

/* 34 — Unicorn Horn Sparkle */
const unicornHornSparkle: CakeTemplate = {
  id: 'unicorn-horn-sparkle',
  version: 1,
  name: 'Unicorn Horn Sparkle',
  description: 'A single spiral horn at the centre of a sparkle field — minimal, modern fantasy.',
  category: 'unicorn',
  tags: { gender: ['girl', 'unisex'], styles: ['editorial', 'pastel'], occasions: ['birthday', 'milestone', 'naming'], ages: [3, 12] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('editorial', FANCY, {
    age: { x: 58, y: 112, width: 36, height: 36, maxSizePt: 26, minSizePt: 12, families: ['playfair-display', 'poppins'] },
  }),
  defaults: { name: 'Nyra', title: 'Happy Birthday', subtitle: 'Made of stardust', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.65 },
  safeInset: 9,
  notes: 'The spiral is drawn from thirteen stepped bands; print at 300 PPI or above so the steps stay crisp.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...hornSpiral(ctx, cx, 66, 74));
    nodes.push(...starrySky(ctx, { box: { x: 12, y: 12, w: 128, h: 120 }, rand: input.rand, count: 18, color: t.secondarySoft, sizes: [1.2, 3.4] }));
    nodes.push(...pearlChain(ctx, { cx, cy: 66, r: 52, from: Math.PI * 1.08, to: Math.PI * 1.92, count: 13, pearlR: 1.3, fill: t.highlight }));
    nodes.push(...sparkle(ctx, { cx: cx - 42, cy: 40, r: 4.2, fill: t.accentSoft }));
    nodes.push(...sparkle(ctx, { cx: cx + 40, cy: 92, r: 3.4, fill: t.accentSoft }));
    nodes.push(...wreath(ctx, { cx: 26, cy: 118, r: 14, from: Math.PI * 0.8, to: Math.PI * 2.2, leaves: 7, fill: t.foliage }));
    nodes.push(...wreath(ctx, { cx: 128, cy: 118, r: 14, from: Math.PI * 0.8, to: Math.PI * 2.2, leaves: 7, fill: t.foliage }));
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

/** Stepped spiral horn: thirteen shrinking bands, deterministic and cut-friendly. */
function hornSpiral(ctx: ReturnType<typeof composeCtx>, cx: number, cy: number, height: number): SceneNode[] {
  const t = ctx.pal;
  const out: SceneNode[] = [];
  const steps = 13;
  for (let i = 0; i < steps; i += 1) {
    const topW = 12 * (1 - i / steps) + 3;
    const bottomW = 12 * (1 - (i + 1) / steps) + 3;
    const y0 = cy - height / 2 + (height / steps) * i;
    const y1 = y0 + height / steps;
    out.push(
      ink(ctx, 'horn-band', polygonPath([[cx - bottomW / 2, y1], [cx - topW / 2 - 1.6, y0], [cx + topW / 2 + 1.6, y0], [cx + bottomW / 2, y1]]),
        mix(t.accent, t.secondary, i / steps), { role: 'illustration', cut: true, label: `Horn band ${i + 1}` }),
    );
  }
  out.push(ink(ctx, 'horn-tip', polygonPath([[cx - 4, cy - height / 2 + 2], [cx + 4, cy - height / 2 + 2], [cx, cy - height / 2 - 6]]), t.accent, { role: 'illustration', cut: true, label: 'Horn tip' }));
  return out;
}

/* 35 — Fairy Wings & Wand */
const fairyWingsWand: CakeTemplate = {
  id: 'fairy-wings-wand',
  version: 1,
  name: 'Fairy Wings & Wand',
  description: 'A pair of iridescent wings behind a star-tipped wand, surrounded by butterflies.',
  category: 'unicorn',
  tags: { gender: ['girl'], styles: ['pastel', 'cute'], occasions: ['birthday', 'first-birthday'], ages: [1, 7] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['quicksand', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
  }),
  defaults: { name: 'Kiara', title: 'Happy Birthday', subtitle: 'A sprinkle of fairy dust', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'bubbles', accent: 'accentSoft', opacity: 0.55 },
  safeInset: 6,
  notes: 'Wing veins are 0.4 mm printed hairlines; they are excluded from cut files automatically.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...fairyWings(ctx, { cx, cy: 54, scale: 1.12, fill: t.surface, vein: t.primarySoft }));
    nodes.push(ink(ctx, 'wand', polygonPath([[cx - 1.6, 58], [cx + 1.6, 58], [cx + 1.6, 96], [cx - 1.6, 96]]), t.accent, { role: 'secondary', cut: true, label: 'Wand' }));
    nodes.push(ink(ctx, 'wand-star', `M ${cx} 34 l 5.4 11.6 l 12.6 1.4 l -9.4 8.6 l 2.6 12.4 l -11.2 -6.2 l -11.2 6.2 l 2.6 -12.4 l -9.4 -8.6 l 12.6 -1.4 Z`, t.secondary, { role: 'secondary', cut: true, label: 'Wand star' }));
    nodes.push(...butterfly(ctx, { cx: 26, cy: 32, scale: 0.72, colors: [t.primary, t.accent, t.secondarySoft], spots: t.highlight }));
    nodes.push(...butterfly(ctx, { cx: 128, cy: 44, scale: 0.58, colors: [t.accent, t.primarySoft, t.secondary], spots: t.highlight }));
    nodes.push(...butterfly(ctx, { cx: 118, cy: 88, scale: 0.46, colors: [t.secondary, t.accentSoft, t.primary], spots: t.highlight }));
    nodes.push(...sun(ctx, { cx: 34, cy: 92, r: 12, fill: t.accentSoft, ray: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'ribbon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accentSoft }));
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

export const UNICORN_TEMPLATES: CakeTemplate[] = [
  unicornRainbowCrown,
  magicalUnicorn,
  rainbowCloudRide,
  unicornHornSparkle,
  fairyWingsWand,
];
