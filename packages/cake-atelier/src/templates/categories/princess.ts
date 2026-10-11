/**
 * Category B — Princess & Royal Celebration
 *
 * 06 Fairy Princess Tiara · 07 Princess Castle & Balloons · 08 Rose Gold Crown Frame
 * 09 Butterfly Princess Wand · 10 Princess Carriage
 */

import { arcPath, circlePath, polygonPath, roundedRectPath, scatter, sparklePath } from '../../geometry.js';
import { foilGradient } from '../../palettes.js';
import { shape, type SceneNode } from '../../scene.js';
import { ink, stack } from '../../art/helpers.js';
import { tiara, crown, flourish, gem, castle } from '../../art/royal.js';
import { butterfly, fairyWings } from '../../art/animals.js';
import { cloud, pearlChain, starCluster, sparkle, flower, wreath, balloonCluster, bunting } from '../../art/decor.js';
import { doilyEdge, haloPlate } from '../../art/backgrounds.js';
import { assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, supportTabs, layout, TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, type TemplatePart } from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const FAM = { display: 'playfair-display', title: 'poppins', body: 'quicksand' };
const SOFT = { display: 'baloo2', title: 'quicksand', body: 'quicksand' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];
const ROSE_GOLD = { 'royal-blue-gold': { primary: '#e8bfb4', secondary: '#fff7f2', accent: '#c98a72', nameFill: '#8d5b4c' } };

/* 06 — Fairy Princess Tiara */
const fairyPrincessTiara: CakeTemplate = {
  id: 'fairy-princess-tiara',
  version: 1,
  name: 'Fairy Princess Tiara',
  description: 'A pearl-tipped tiara resting on a scalloped disc with a soft glow behind it.',
  category: 'princess',
  tags: { gender: ['girl'], styles: ['royal', 'pastel'], occasions: ['birthday', 'first-birthday', 'naming'], ages: [1, 9] },
  aspect: 'square',
  defaultPalette: 'blush-rose-gold',
  paletteOverrides: { 'mint-candy': { primary: '#f4b8cb', secondary: '#fdf3f7', accent: '#c98a72' } },
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('classic', FAM, {
    age: { x: 108, y: 8, width: 34, height: 34, maxSizePt: 30, minSizePt: 14, families: [FAM.title, FAM.display] },
  }),
  defaults: { name: 'Aadya', title: 'Happy Birthday', subtitle: 'A little bit of magic', age: '3', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'glow', accent: 'primarySoft' },
  safeInset: 6,
  notes: 'The tiara is drawn as three cut layers — the pearls are printed dots, not separate pieces, so nothing tiny goes missing.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    if (on(input, 'backing')) nodes.push(...(doilyEdge(ctx, { w: input.width, y: 26, count: 26, fill: t.surfaceAlt })));
    nodes.push(haloPlate(ctx, { cx, cy: 52, r: 40, fill: t.surface, ringColor: t.secondarySoft, ringWidth: 1.2 }));
    nodes.push(tiara(ctx, {
      cx, cy: 58, width: 78, height: 40, style: 'pearl',
      metal: foilGradient(t, [cx - 39, 38], [cx + 39, 78]), stone: t.accent, pearl: t.highlight,
    }));
    nodes.push(flourish(ctx, { cx, cy: 82, width: 84, color: t.secondarySoft }));
    nodes.push(pearlChain(ctx, { cx, cy: 46, r: 44, from: Math.PI * 1.06, to: Math.PI * 1.94, count: 13, pearlR: 1.5, fill: t.highlight }));
    if (on(input, 'sparkles')) {
      for (const [x, y] of scatter(7, { x: 18, y: 16, w: 116, h: 66 }, 4106)) {
        nodes.push(...sparkle(ctx, { cx: x, cy: y, r: 2.4 + input.rand() * 1.6, fill: t.secondarySoft }));
      }
    }
    nodes.push(nameplateFor(input, { style: 'oval', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.accentSoft }));
    nodes.push(...ageBadgeFor(input, { petals: 22, fill: t.surface, ring: t.secondarySoft }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.accentDeep, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 07 — Princess Castle & Balloons */
const princessCastleBalloons: CakeTemplate = {
  id: 'princess-castle-balloons',
  version: 1,
  name: 'Princess Castle & Balloons',
  description: 'A turreted castle with a balloon cluster rising past the battlements.',
  category: 'princess',
  tags: { gender: ['girl', 'unisex'], styles: ['playful', 'pastel'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'lavender-silver',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 84, width: 124.4, height: 12, maxSizePt: 20, minSizePt: 9, families: ['quicksand', 'baloo2'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
    age: { x: 12, y: 12, width: 32, height: 32, maxSizePt: 28, minSizePt: 14, families: ['baloo2', 'quicksand'] },
  }),
  defaults: { name: 'Myra', title: 'Happy Birthday', subtitle: 'Once upon a party', age: '4', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.85 },
  safeInset: 6,
  notes: 'Balloons are printed as flat paper discs with a highlight crescent — no knots, no strings thinner than 1.2 mm.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes: TemplatePart[] = [];
    nodes.push(...cloud(ctx, { cx: 30, cy: 26, w: 38, h: 18, fill: t.surface, shade: t.primarySoft }));
    nodes.push(...cloud(ctx, { cx: 122, cy: 20, w: 30, h: 15, fill: t.surface, shade: t.primarySoft }));
    nodes.push(castle(ctx, { cx: 74, cy: 66, w: 84, h: 56, fill: t.surfaceAlt, roof: t.primary, flag: t.accent, gate: t.primaryDeep }));
    nodes.push(...balloonCluster(ctx, { cx: 108, cy: 40, r: 8.5, colors: [t.accent, t.primary, t.secondarySoft], stringColor: t.outline }));
    nodes.push(...bunting(ctx, { cx: input.width / 2, y: 12, width: 108, sag: 9, flags: 9, colors: [t.primary, t.accent, t.secondary], alternate: true }));
    nodes.push(...starCluster(ctx, { points: [[24, 70], [132, 66], [30, 96]], r: 2.8, fill: t.secondarySoft }));
    nodes.push(nameplateFor(input, { style: 'scallop', material: 'accent', fill: t.nameplate, edge: t.accent, accent: t.primary }));
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

/* 08 — Rose Gold Crown Frame */
const roseGoldCrownFrame: CakeTemplate = {
  id: 'rose-gold-crown-frame',
  version: 1,
  name: 'Rose Gold Crown Frame',
  description: 'A slim double-rule frame with a rose-gold crown and blossoms in two corners.',
  category: 'princess',
  tags: { gender: ['girl', 'unisex'], styles: ['luxury', 'editorial'], occasions: ['birthday', 'milestone', 'baby-shower'], ages: [1, 12] },
  aspect: 'square',
  defaultPalette: 'blush-rose-gold',
  paletteOverrides: ROSE_GOLD,
  typography: TYPOGRAPHY.editorialLuxury!,
  regions: layout('editorial', FAM, {
    name: { x: 26, y: 74, width: 100.4, height: 30, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true, families: [FAM.display, FAM.body], letterSpacing: { min: -0.02, max: 0.12, default: 0.03 } },
  }),
  defaults: { name: 'Ira', title: 'Happy Birthday', subtitle: 'With all our love', age: '2', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'plain', accent: 'primarySoft' },
  safeInset: 11,
  notes: 'The thinnest frame in the collection: keep bleed at 3 mm or more when printing on a home inkjet.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const metal = foilGradient(t, [10, 8], [142, 60]);
    const frame: ReturnType<typeof shape>[] = [
      ink(ctx, 'frame-outer', roundedRectPath(9, 9, input.width - 18, input.height - 18, 4), 'none', { stroke: { color: t.outline, width: 0.9 }, role: 'secondary' }),
      ink(ctx, 'frame-rule', roundedRectPath(12.5, 12.5, input.width - 25, input.height - 25, 3), 'none', { stroke: { color: t.accent, width: 0.5 }, role: 'secondary' }),
    ];
    const nodes: TemplatePart[] = [stack(ctx, 'frame', frame)];
    nodes.push(crown(ctx, { cx: input.width / 2, cy: 30, width: 46, height: 27, style: 'queen', metal, base: t.primary, jewel: t.accent, pearl: t.highlight }));
    nodes.push(...flower(ctx, { cx: 22, cy: 128, r: 13, petals: 6, petalFill: t.primary, centerFill: t.accent, style: 'round' }));
    nodes.push(...flower(ctx, { cx: 132, cy: 33, r: 10, petals: 5, petalFill: t.primarySoft, centerFill: t.accent, style: 'daisy' }));
    nodes.push(...wreath(ctx, { cx: 132, cy: 128, r: 15, from: Math.PI * 0.9, to: Math.PI * 2.1, leaves: 7, fill: t.foliage }));
    nodes.push(...starCluster(ctx, { points: [[26, 40], [128, 66], [30, 82]], r: 2.6, fill: t.accentSoft }));
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

/* 09 — Butterfly Princess Wand */
const butterflyPrincessWand: CakeTemplate = {
  id: 'butterfly-princess-wand',
  version: 1,
  name: 'Butterfly Princess Wand',
  description: 'A star-tipped wand with fairy wings and three butterflies on a dotted field.',
  category: 'princess',
  tags: { gender: ['girl'], styles: ['cute', 'pastel'], occasions: ['birthday', 'first-birthday'], ages: [1, 7] },
  aspect: 'square',
  defaultPalette: 'mint-candy',
  typography: TYPOGRAPHY.playfulRound!,
  regions: layout('classic', SOFT, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['baloo2', 'quicksand'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.16 } },
  }),
  defaults: { name: 'Saanvi', title: 'Happy Birthday', subtitle: 'Wishes do come true', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'dots', accent: 'accentSoft', opacity: 0.5 },
  safeInset: 6,
  notes: 'Wings use a mirrored pair of shapes; the veins are printed hairlines at 0.4 mm so they survive a 4 in cut.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes: TemplatePart[] = [];
    nodes.push(...fairyWings(ctx, { cx, cy: 50, scale: 1.05, fill: t.surface, vein: t.primarySoft }));
    nodes.push(...butterfly(ctx, { cx, cy: 50, scale: 1.5, colors: [t.primary, t.accent, t.secondarySoft], spots: t.highlight }));
    nodes.push(ink(ctx, 'wand-stick', roundedRectPath(cx + 18, 34, 3.2, 62, 1.6), t.accent, { role: 'secondary', cut: true, label: 'Wand stick' }));
    nodes.push(ink(ctx, 'wand-star', sparklePath(cx + 19.6, 30, 13), t.secondary, { role: 'secondary', cut: true, label: 'Wand star' }));
    nodes.push(...gem(ctx, { cx: cx + 19.6, cy: 30, r: 4.6, fill: t.accent }));
    nodes.push(...butterfly(ctx, { cx: 26, cy: 30, scale: 0.62, colors: [t.accent, t.primarySoft, t.secondary], spots: t.highlight }));
    nodes.push(...butterfly(ctx, { cx: 128, cy: 82, scale: 0.5, colors: [t.secondary, t.accentSoft, t.primary], spots: t.highlight }));
    if (on(input, 'sparkles')) {
      nodes.push(...sparkle(ctx, { cx: 38, cy: 74, r: 3.4, fill: t.accentSoft }), ...sparkle(ctx, { cx: 118, cy: 40, r: 2.8, fill: t.secondarySoft }));
    }
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

/* 10 — Princess Carriage */
const princessCarriage: CakeTemplate = {
  id: 'princess-carriage',
  version: 1,
  name: 'Princess Carriage',
  description: 'A storybook carriage with spoked wheels, a pearl chain and a lantern glow.',
  category: 'princess',
  tags: { gender: ['girl', 'unisex'], styles: ['royal', 'cute'], occasions: ['birthday', 'baby-shower', 'naming'], ages: [1, 6] },
  aspect: 'square',
  defaultPalette: 'peach-cream',
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('classic', FAM, {
    title: { x: 14, y: 88, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 9, families: ['poppins', 'playfair-display'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.32, default: 0.2 } },
  }),
  defaults: { name: 'Amaira', title: 'Happy Birthday', subtitle: 'Off to the ball', age: '6', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'stars', accent: 'accentSoft', opacity: 0.6 },
  safeInset: 6,
  notes: 'The carriage body is one cut piece; the wheels are separate discs joined on a single axle strip so they stay aligned.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const body: SceneNode[] = [];
    body.push(ink(ctx, 'carriage-body', arcPath(cx, 62, 33, 26, Math.PI, Math.PI * 2, { close: true }), t.primary, { cut: true, role: 'illustration', label: 'Carriage body' }));
    body.push(ink(ctx, 'carriage-rail', roundedRectPath(cx - 33, 58, 66, 4, 2), t.accent, { cut: true, role: 'secondary', label: 'Carriage rail' }));
    body.push(ink(ctx, 'carriage-window', circlePath(cx, 48, 9), t.surface, { cut: true, role: 'secondary', label: 'Window' }));
    body.push(ink(ctx, 'carriage-window-ring', circlePath(cx, 48, 9), 'none', { stroke: { color: t.accent, width: 1.1 }, role: 'secondary' }));
    body.push(ink(ctx, 'carriage-door', roundedRectPath(cx - 8, 60, 16, 22, 3), t.primaryDeep, { cut: true, role: 'secondary', label: 'Door' }));
    for (const dir of [-1, 1] as const) {
      const wheelX = cx + dir * 26;
      body.push(ink(ctx, 'wheel', circlePath(wheelX, 78, 8.5), t.outline, { cut: true, role: 'illustration', label: 'Wheel' }));
      body.push(ink(ctx, 'wheel-hub', circlePath(wheelX, 78, 3.2), t.accent, { role: 'secondary' }));
      for (let i = 0; i < 6; i += 1) {
        const angle = (i / 6) * Math.PI * 2;
        body.push(ink(ctx, 'spoke', polygonPath([
          [wheelX + Math.cos(angle) * 3, 78 + Math.sin(angle) * 3],
          [wheelX + Math.cos(angle) * 8, 78 + Math.sin(angle) * 8],
        ], false), 'none', { stroke: { color: t.accent, width: 0.8 }, role: 'secondary' }));
      }
    }
    body.push(...gem(ctx, { cx: cx - 33, cy: 62, r: 4.4, fill: t.secondary }));
    const nodes: TemplatePart[] = [stack(ctx, 'carriage', body)];
    nodes.push(...pearlChain(ctx, { cx, cy: 44, r: 40, from: Math.PI * 1.08, to: Math.PI * 1.92, count: 11, pearlR: 1.4, fill: t.highlight }));
    nodes.push(...starCluster(ctx, { points: [[24, 30], [128, 26], [130, 96], [22, 96]], r: 2.8, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx: 118, cy: 60, r: 3.4, fill: t.accentSoft }));
    nodes.push(nameplateFor(input, { style: 'arch', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge }));
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

export const PRINCESS_TEMPLATES: CakeTemplate[] = [
  fairyPrincessTiara,
  princessCastleBalloons,
  roseGoldCrownFrame,
  butterflyPrincessWand,
  princessCarriage,
];
