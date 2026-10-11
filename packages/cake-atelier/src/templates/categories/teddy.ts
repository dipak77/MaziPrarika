/**
 * Category H — Teddy Bear & Woodland
 *
 * 36 Teddy Bear Balloons · 37 Baby Bear Cloud · 38 Bunny First Birthday
 * 39 Koala Cuddle · 40 Woodland Fox
 */

import { circlePath, scatter } from '../../geometry.js';
import type { SceneNode } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { bearFace, bunnyFace, foxSitting, koalaFace, teddySitting } from '../../art/animals.js';
import { balloonCluster, cloud, flower, heart, sparkle, starCluster, wreath } from '../../art/decor.js';
import { crescentMoon, pineTree, rainbowArc } from '../../art/world.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const SOFT = { display: 'quicksand', title: 'quicksand', body: 'quicksand' };
const PLAY = { display: 'baloo2', title: 'poppins', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/* 36 — Teddy Bear Balloons */
const teddyBearBalloons: CakeTemplate = {
  id: 'teddy-bear-balloons',
  version: 1,
  name: 'Teddy Bear Balloons',
  description: 'A teddy holding a bunch of balloons that rise past the top edge of the topper.',
  category: 'teddy',
  tags: { gender: ['unisex'], styles: ['cute', 'playful'], occasions: ['birthday', 'first-birthday'], ages: [1, 6] },
  aspect: 'square',
  defaultPalette: 'peach-cream',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 17, minSizePt: 9, families: ['quicksand', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
  }),
  defaults: { name: 'Aadya', title: 'Happy Birthday', subtitle: 'Hip hip hooray', age: '2', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'dots', accent: 'accentSoft', opacity: 0.45 },
  safeInset: 6,
  notes: 'The balloon strings are 0.8 mm strokes printed on the base layer, not cut.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...balloonCluster(ctx, { cx: 108, cy: 38, r: 9, colors: [t.accent, t.primary, t.secondary], stringColor: t.outline }));
    nodes.push(...teddySitting(ctx, { cx: 62, cy: 70, scale: 1.15, fur: t.primary, muzzle: t.surfaceAlt, bow: t.accent }));
    nodes.push(...cloud(ctx, { cx: 26, cy: 30, w: 34, h: 15, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...starCluster(ctx, { points: [[22, 62], [26, 96], [136, 88]], r: 2.8, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'scallop', material: 'accent', fill: t.nameplate, edge: t.accentSoft, accent: t.primary }));
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

/* 37 — Baby Bear Cloud */
const babyBearCloud: CakeTemplate = {
  id: 'baby-bear-cloud',
  version: 1,
  name: 'Baby Bear Cloud',
  description: 'A bear cub asleep on a cloud beneath a crescent moon — the softest design we make.',
  category: 'teddy',
  tags: { gender: ['unisex'], styles: ['pastel', 'cute'], occasions: ['baby-shower', 'naming', 'first-birthday'], ages: [0, 3] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 84, width: 124.4, height: 11, maxSizePt: 16, minSizePt: 9, families: ['quicksand'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.22 } },
    age: { x: 12, y: 12, width: 30, height: 30, maxSizePt: 24, minSizePt: 12, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Aarohi', title: 'Welcome Little One', subtitle: 'Sleep tight', age: '0', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'stars', accent: 'secondarySoft', opacity: 0.6 },
  safeInset: 6,
  notes: 'Uses the nursery type palette by default; the age badge can be switched off for a naming ceremony.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...crescentMoon(ctx, { cx: 118, cy: 32, r: 14, fill: t.accentSoft }));
    nodes.push(...cloud(ctx, { cx, cy: 74, w: 104, h: 30, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...bearFace(ctx, { cx, cy: 52, r: 26, fur: t.primarySoft, muzzle: t.surface, blush: t.accentSoft }));
    nodes.push(ink(ctx, 'bear-body', `M ${cx - 24} 70 C ${cx - 30} 56 ${cx + 30} 56 ${cx + 24} 70 Z`, t.primarySoft, { role: 'illustration', cut: true, label: 'Bear body' }));
    nodes.push(...starCluster(ctx, { points: [[26, 30], [40, 14], [130, 62], [22, 92]], r: 2.6, fill: t.secondarySoft }));
    nodes.push(...sparkle(ctx, { cx: 96, cy: 22, r: 3.2, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accentSoft }));
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

/* 38 — Bunny First Birthday */
const bunnyFirstBirthday: CakeTemplate = {
  id: 'bunny-first-birthday',
  version: 1,
  name: 'Bunny First Birthday',
  description: 'A bunny with long ears, a carrot-print bow tie and a rainbow behind it.',
  category: 'teddy',
  tags: { gender: ['unisex'], styles: ['cute', 'pastel'], occasions: ['first-birthday', 'baby-shower'], ages: [0, 3] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 17, minSizePt: 9, families: ['quicksand', 'poppins'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
  }),
  defaults: { name: 'Yuvaan', title: 'One Year Old', subtitle: 'One whole year of cuddles', age: '1', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'glow', accent: 'accentSoft' },
  safeInset: 6,
  notes: 'Tuned for a one-year milestone: the title reads “One Year Old” by default, and the age badge is 25 mm so it is easy to cut.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...rainbowArc(ctx, { cx, cy: 68, r: 42, bands: [t.primary, t.accentSoft, t.secondary], cloud: false }));
    nodes.push(...bunnyFace(ctx, { cx, cy: 56, r: 26, fur: t.surface, innerEar: t.accentSoft, earTilt: 0.42 }));
    nodes.push(...flower(ctx, { cx: 32, cy: 96, r: 9, petals: 6, petalFill: t.accentSoft, centerFill: t.accent, style: 'daisy' }));
    nodes.push(...flower(ctx, { cx: 122, cy: 92, r: 7.4, petals: 5, petalFill: t.accent, centerFill: t.secondary, style: 'round' }));
    nodes.push(...heart(ctx, { cx: 128, cy: 26, w: 16, h: 15, fill: t.accentSoft }));
    nodes.push(...starCluster(ctx, { points: [[24, 26], [52, 18], [108, 16]], r: 2.8, fill: t.secondarySoft }));
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

/* 39 — Koala Cuddle */
const koalaCuddle: CakeTemplate = {
  id: 'koala-cuddle',
  version: 1,
  name: 'Koala Cuddle',
  description: 'A koala holding a eucalyptus sprig on a gum-leaf wreath, in soft greys and greens.',
  category: 'teddy',
  tags: { gender: ['unisex'], styles: ['cute', 'editorial'], occasions: ['birthday', 'baby-shower', 'naming'], ages: [0, 6] },
  aspect: 'square',
  defaultPalette: 'sage-eucalyptus',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('medallion', SOFT, {
    name: { x: 34, y: 62, width: 84.4, height: 28, maxSizePt: 34, minSizePt: 11, maxLines: 2, breakWords: true, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Meher', title: 'Happy Birthday', subtitle: 'Eucalyptus and cuddles', age: '3', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'plain', accent: 'foliage' },
  safeInset: 8,
  notes: 'Gender-neutral by design — the sage palette and grey paper keep it suitable for any nursery.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...wreath(ctx, { cx, cy: 60, r: 44, from: 0, to: Math.PI * 2, leaves: 14, fill: t.foliage, leafLength: 15 }));
    nodes.push(...koalaFace(ctx, { cx, cy: 56, r: 28, fur: t.soft, blush: t.accentSoft }));
    nodes.push(ink(ctx, 'sprig', `M 40 92 C 52 84 58 76 62 66`, 'none', { stroke: { color: t.foliageDeep, width: 1.3, cap: 'round' }, role: 'accents' }));
    nodes.push(...starCluster(ctx, { points: [[36, 34], [118, 30], [124, 90]], r: 2.6, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'plaque', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.foliage }));
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

/* 40 — Woodland Fox */
const woodlandFox: CakeTemplate = {
  id: 'woodland-fox',
  version: 1,
  name: 'Woodland Fox',
  description: 'A sitting fox among pine trees and toadstools — autumnal and a little bit wild.',
  category: 'teddy',
  tags: { gender: ['unisex'], styles: ['cute', 'adventurous'], occasions: ['birthday'], ages: [1, 9] },
  aspect: 'square',
  defaultPalette: 'sunset-terracotta',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', PLAY, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 19, minSizePt: 9, families: ['poppins', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Reyansh', title: 'Happy Birthday', subtitle: 'Wild and wonderful', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'hills', accent: 'primarySoft', opacity: 0.45 },
  safeInset: 6,
  notes: 'Toadstools are two shapes each and stand clear of the nameplate so nothing is hidden by the text.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...pineTree(ctx, { cx: 26, cy: 66, h: 44, fill: t.foliage, trunk: t.accentDeep, tiers: 3 }));
    nodes.push(...pineTree(ctx, { cx: 132, cy: 60, h: 36, fill: t.foliageDeep, trunk: t.accentDeep, tiers: 3 }));
    nodes.push(...foxSitting(ctx, { cx: 72, cy: 68, scale: 1.15, fur: t.accent, cream: t.secondarySoft }));
    nodes.push(...toadstool(input, 106, 88, 1));
    nodes.push(...toadstool(input, 40, 92, 0.7));
    nodes.push(...starCluster(ctx, { points: [[28, 24], [52, 16], [130, 26]], r: 2.8, fill: t.accentSoft }));
    nodes.push(...heart(ctx, { cx: 46, cy: 34, w: 14, h: 13, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'hexagon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 18, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

function toadstool(input: Parameters<CakeTemplate['compose']>[0], cx: number, cy: number, scale: number): SceneNode[] {
  const ctx = composeCtx(input, 'accent');
  const t = input.tokens;
  const capW = 22 * scale;
  const out: SceneNode[] = [
    ink(ctx, 'toadstool-stem', `M ${cx - 3 * scale} ${cy} L ${cx - 2 * scale} ${cy - 12 * scale} L ${cx + 2 * scale} ${cy - 12 * scale} L ${cx + 3 * scale} ${cy} Z`, t.secondarySoft, { role: 'secondary', cut: true, label: 'Toadstool stem' }),
    ink(ctx, 'toadstool-cap', `M ${cx - capW / 2} ${cy - 11 * scale} C ${cx - capW / 2} ${cy - 22 * scale} ${cx + capW / 2} ${cy - 22 * scale} ${cx + capW / 2} ${cy - 11 * scale} Z`, t.accent, { role: 'secondary', cut: true, label: 'Toadstool cap' }),
  ];
  for (const [dx, dy] of scatter(3, { x: cx - capW * 0.32, y: cy - 20 * scale, w: capW * 0.64, h: 7 * scale }, 6100 + Math.round(cx))) {
    out.push(ink(ctx, 'toadstool-spot', circlePath(dx, dy, 1.6 * scale), t.surface, { role: 'accents' }));
  }
  return out;
}

export const TEDDY_TEMPLATES: CakeTemplate[] = [
  teddyBearBalloons,
  babyBearCloud,
  bunnyFirstBirthday,
  koalaCuddle,
  woodlandFox,
];
