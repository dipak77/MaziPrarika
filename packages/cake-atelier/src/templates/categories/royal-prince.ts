/**
 * Category A — Royal Prince
 *
 * 01 Royal Prince Crown · 02 Little King Throne · 03 Sapphire Royal Medallion
 * 04 Prince Castle & Shield · 05 Royal Baby Bear
 */

import { circlePath } from '../../geometry.js';
import { foilGradient } from '../../palettes.js';
import { group } from '../../scene.js';
import { ink } from '../../art/helpers.js';
import { crown, crest, castle, throne, flourish, diamondRule, rosette, gem, crownArch } from '../../art/royal.js';
import { bearFace } from '../../art/animals.js';
import { medallion, starCluster, paperStack, sparkle, banner } from '../../art/decor.js';
import { haloPlate } from '../../art/backgrounds.js';
import {
  assemble, composeCtx, drawText, nameplateFor, ageBadgeFor, on, layout,
  TYPOGRAPHY, MATERIAL_SETS, OPTIONAL_COMPONENTS, supportTabs,
} from '../scaffold.js';
import type { CakeTemplate } from '../types.js';

const FAM = { display: 'playfair-display', title: 'poppins', body: 'poppins' };
const OPTIONALS = [
  OPTIONAL_COMPONENTS.backing!,
  OPTIONAL_COMPONENTS.sparkles!,
  OPTIONAL_COMPONENTS.confetti!,
  OPTIONAL_COMPONENTS.cutline!,
  OPTIONAL_COMPONENTS.supportStick!,
];

/* 01 — Royal Prince Crown */
const royalPrinceCrown: CakeTemplate = {
  id: 'royal-prince-crown',
  version: 1,
  name: 'Royal Prince Crown',
  description: 'A five-point coronet on a pearl-studded disc, with a gilt key rule under the name.',
  category: 'royal-prince',
  tags: { gender: ['boy', 'unisex'], styles: ['royal', 'luxury'], occasions: ['birthday', 'first-birthday', 'milestone'], ages: [1, 12] },
  aspect: 'square',
  defaultPalette: 'royal-blue-gold',
  paletteOverrides: {
    'blush-rose-gold': { primary: '#c98a8a', secondary: '#d69a90', accent: '#7f9c76' },
    'pastel-rainbow': { primary: '#8fc7e8', secondary: '#f7d774', accent: '#f4a699' },
  },
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('classic', FAM, {
    age: { x: 106, y: 10, width: 36, height: 36, maxSizePt: 32, minSizePt: 14, families: [FAM.display, FAM.body] },
  }),
  defaults: { name: 'Aarav', title: 'Happy Birthday', subtitle: 'A very royal celebration', age: '1', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'glow', accent: 'primarySoft' },
  safeInset: 6,
  notes: 'The age badge is its own cut piece. On 4 in toppers drop to the 2-layer variant from Print & Export.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes = [];
    if (on(input, 'backing')) {
      nodes.push(
        paperStack(ctx, { x: 12, y: 10, w: input.width - 24, h: 122 }, {
          layers: 2, inset: 2.6, radius: 6, tones: [t.primarySoft, t.surfaceAlt, t.surface],
        }),
      );
    }
    nodes.push(haloPlate(ctx, { cx, cy: 58, r: 43, fill: t.surface, ringColor: t.secondary, ringWidth: 1.5 }));
    nodes.push(
      crown(ctx, {
        cx, cy: 70, width: 76, height: 44, style: 'classic',
        metal: foilGradient(t, [cx - 38, 34], [cx + 38, 92]), base: t.primary, jewel: t.accent, pearl: t.highlight,
      }),
    );
    nodes.push(crownArch(ctx, { cx, cy: 30, r: 8.5, metal: t.secondary }));
    nodes.push(diamondRule(ctx, { x: 44, y: 84, width: 64.4, color: t.secondary }));
    nodes.push(flourish(ctx, { cx, cy: 92, width: 86, color: t.secondary }));
    nodes.push(...starCluster(ctx, { points: [[24, 26], [128, 30], [20, 84], [132, 78]], r: 3.2, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) {
      nodes.push(...sparkle(ctx, { cx: 46, cy: 20, r: 4, fill: t.highlight }), ...sparkle(ctx, { cx: 116, cy: 96, r: 3, fill: t.secondarySoft }));
    }
    nodes.push(nameplateFor(input, { style: 'ribbon', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge, accent: t.secondary }));
    nodes.push(...ageBadgeFor(input, { petals: 20 }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: input.textFill?.name ?? t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplateInk, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 02 — Little King Throne */
const littleKingThrone: CakeTemplate = {
  id: 'little-king-throne',
  version: 1,
  name: 'Little King Throne',
  description: 'A cushioned throne with gold finials and a small crown resting on the seatback.',
  category: 'royal-prince',
  tags: { gender: ['boy', 'unisex'], styles: ['royal', 'playful'], occasions: ['birthday', 'first-birthday'], ages: [1, 8] },
  aspect: 'square',
  defaultPalette: 'navy-silver',
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('band', FAM, {
    title: { x: 22, y: 60, width: 108.4, height: 14, maxSizePt: 22, families: [FAM.title, FAM.display], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.14 } },
    age: { x: 110, y: 12, width: 34, height: 34, maxSizePt: 30, minSizePt: 14, families: [FAM.display, FAM.body] },
  }),
  defaults: { name: 'Vihaan', title: 'Little King', subtitle: 'Sitting proudly on his throne', age: '2', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'rays', accent: 'accentSoft', opacity: 0.5 },
  safeInset: 6,
  notes: 'Designed around a short title (“Little King”, “Happy Birthday”). Long titles shrink to fit the banner.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes = [];
    if (on(input, 'backing')) {
      nodes.push(
        paperStack(ctx, { x: 14, y: 12, w: input.width - 28, h: 104 }, {
          layers: 2, inset: 2.4, radius: 5, tones: [t.primarySoft, t.surfaceAlt, t.surface],
        }),
      );
    }
    nodes.push(throne(ctx, { cx, cy: 52, w: 72, h: 70, fill: t.primary, cushion: t.accent, metal: t.secondary }));
    nodes.push(banner(ctx, { box: { x: 16, y: 56, w: input.width - 32, h: 22 }, fill: t.primaryDeep, edge: t.secondary, topBand: t.secondary }));
    nodes.push(...starCluster(ctx, { points: [[22, 40], [130, 44], [26, 98], [126, 94]], r: 3, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx, cy: 14, r: 4.4, fill: t.secondarySoft }));
    nodes.push(...ageBadgeFor(input, { petals: 18 }));
    nodes.push(nameplateFor(input, { style: 'plaque', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge }));
    nodes.push(drawText(input, 'title', { fill: t.accentSoft, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplateInk, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 03 — Sapphire Royal Medallion */
const sapphireRoyalMedallion: CakeTemplate = {
  id: 'sapphire-royal-medallion',
  version: 1,
  name: 'Sapphire Royal Medallion',
  description: 'A scalloped medallion with a jewelled crown finial, pearl collar and sapphire gems.',
  category: 'royal-prince',
  tags: { gender: ['boy', 'unisex'], styles: ['royal', 'luxury'], occasions: ['birthday', 'milestone', 'naming'], ages: [1, 16] },
  aspect: 'square',
  defaultPalette: 'royal-blue-gold',
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('medallion', FAM),
  defaults: { name: 'Reyansh', title: 'Happy Birthday', subtitle: 'One year of wonder', age: '1', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.classic!,
  background: { kind: 'dots', accent: 'secondarySoft', opacity: 0.45 },
  safeInset: 6,
  notes: 'The most formal composition in the collection. Pairs with Emerald & Champagne for a naming ceremony.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes = [];
    nodes.push(medallion(ctx, { cx, cy: 66, r: 51, petals: 24, rings: [0.11, 0.07, 0.045], center: t.surface, pearls: true }));
    nodes.push(
      crown(ctx, {
        cx, cy: 26, width: 42, height: 25, style: 'queen',
        metal: foilGradient(t, [cx - 21, 14], [cx + 21, 40]), base: t.primary, jewel: t.accent,
      }),
    );
    nodes.push(...gem(ctx, { cx: cx - 30, cy: 106, r: 6.5, fill: t.accent }));
    nodes.push(...gem(ctx, { cx: cx + 30, cy: 106, r: 6.5, fill: t.accent }));
    nodes.push(...starCluster(ctx, { points: [[26, 30], [126, 34], [22, 120], [130, 118]], r: 3, fill: t.secondarySoft }));
    if (on(input, 'confetti')) nodes.push(...rosette(ctx, { cx: 24, cy: 96, r: 11, petals: 8, fill: t.secondarySoft, center: t.secondary }));
    nodes.push(...ageBadgeFor(input, { petals: 22, fill: t.primary, ring: t.secondary }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: input.textFill?.name ?? t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplate, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 04 — Prince Castle & Shield */
const princeCastleShield: CakeTemplate = {
  id: 'prince-castle-shield',
  version: 1,
  name: 'Prince Castle & Shield',
  description: 'A three-tower castle below a heraldic shield, with the name on a tilted plate.',
  category: 'royal-prince',
  tags: { gender: ['boy', 'unisex'], styles: ['royal', 'adventurous'], occasions: ['birthday', 'naming'], ages: [2, 10] },
  aspect: 'square',
  defaultPalette: 'emerald-champagne',
  typography: TYPOGRAPHY.royalDisplay!,
  regions: layout('diagonal', FAM),
  defaults: { name: 'Kabir', title: 'Happy Birthday', subtitle: 'Defender of the castle', age: '5', date: '' },
  optionals: OPTIONALS,
  materials: MATERIAL_SETS.layered!,
  background: { kind: 'gradient', accent: 'secondarySoft' },
  safeInset: 6,
  notes: 'Artwork sits low-left, plate angles up-right. Keep the name under 10 characters for the best balance.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const nodes = [];
    nodes.push(
      castle(ctx, { cx: 56, cy: 104, w: 82, h: 66, fill: t.surfaceAlt, roof: t.primary, flag: t.accent, gate: t.primaryDeep }),
    );
    nodes.push(crest(ctx, { cx: 116, cy: 114, w: 40, h: 44, fill: t.primary, border: t.secondary, charge: 'star', chargeColor: t.accentSoft, bandColor: t.accent }));
    nodes.push(flourish(ctx, { cx: 116, cy: 64, width: 54, color: t.secondary }));
    nodes.push(...starCluster(ctx, { points: [[24, 24], [58, 16], [132, 26], [138, 58]], r: 3, fill: t.secondarySoft }));
    if (on(input, 'sparkles')) nodes.push(...sparkle(ctx, { cx: 96, cy: 90, r: 4, fill: t.highlight }));
    nodes.push(nameplateFor(input, { style: 'shield', material: 'accent', fill: t.nameplate, edge: t.nameplateEdge }));
    nodes.push(...ageBadgeFor(input, { petals: 18 }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: input.textFill?.name ?? t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplateInk, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

/* 05 — Royal Baby Bear */
const royalBabyBear: CakeTemplate = {
  id: 'royal-baby-bear',
  version: 1,
  name: 'Royal Baby Bear',
  description: 'A soft teddy wearing a paper crown — the gentle end of the royal range.',
  category: 'royal-prince',
  tags: { gender: ['boy', 'unisex'], styles: ['cute', 'royal'], occasions: ['first-birthday', 'baby-shower', 'naming'], ages: [0, 3] },
  aspect: 'square',
  defaultPalette: 'mint-cream',
  typography: TYPOGRAPHY.softNursery!,
  regions: layout('classic', { display: 'quicksand', title: 'poppins', body: 'quicksand' }, {
    title: { x: 14, y: 86, width: 124.4, height: 11, maxSizePt: 18, minSizePt: 8, families: ['poppins', 'quicksand'], textTransform: 'uppercase', letterSpacing: { min: 0, max: 0.3, default: 0.18 } },
    name: { x: 13, y: 97, width: 126.4, height: 26, maxSizePt: 38, minSizePt: 11, maxLines: 2, breakWords: true, families: ['quicksand', 'baloo2'] },
  }),
  defaults: { name: 'Yuvaan', title: 'Happy Birthday', subtitle: 'Our little prince', age: '1', date: '' },
  optionals: [OPTIONAL_COMPONENTS.backing!, OPTIONAL_COMPONENTS.confetti!, OPTIONAL_COMPONENTS.sparkles!, OPTIONAL_COMPONENTS.cutline!, OPTIONAL_COMPONENTS.supportStick!],
  materials: MATERIAL_SETS.pastel!,
  background: { kind: 'clouds', accent: 'primarySoft', opacity: 0.85 },
  safeInset: 6,
  notes: 'Chunky rounded shapes — the easiest design in the collection to cut by hand.',
  compose(input) {
    const ctx = composeCtx(input, 'base');
    const t = input.tokens;
    const cx = input.width / 2;
    const nodes = [];
    nodes.push(...bearFace(ctx, { cx, cy: 62, r: 37, fur: t.primarySoft, muzzle: t.surface, ink: t.ink, blush: t.accentSoft }));
    nodes.push(crown(ctx, { cx, cy: 26, width: 40, height: 23, style: 'child', metal: t.secondary, base: t.secondarySoft, jewel: t.accent }));
    nodes.push(...starCluster(ctx, { points: [[24, 34], [128, 38], [30, 96]], r: 3, fill: t.accentSoft }));
    if (on(input, 'confetti')) {
      const confettiNodes = [];
      for (let i = 0; i < 14; i += 1) {
        const x = 18 + input.rand() * (input.width - 36);
        const y = 98 + input.rand() * 12;
        confettiNodes.push(
          ink(ctx, 'confetti-dot', circlePath(x, y, 1.6 + input.rand() * 1.3), i % 2 === 0 ? t.accentSoft : t.secondarySoft, { role: 'accents', opacity: 0.85 }),
        );
      }
      nodes.push(group(confettiNodes, { id: `${input.template.id}:confetti`, role: 'accents', material: 'base', label: 'Confetti' }));
    }
    nodes.push(nameplateFor(input, { style: 'scallop', material: 'accent', fill: t.nameplate, edge: t.secondarySoft, accent: t.accent }));
    nodes.push(...ageBadgeFor(input, { petals: 20, fill: t.surface, ring: t.accent }));
    nodes.push(drawText(input, 'title', { fill: t.titleFill, material: 'base' }));
    nodes.push(drawText(input, 'name', { fill: input.textFill?.name ?? t.nameFill, material: 'base' }));
    nodes.push(drawText(input, 'subtitle', { fill: t.subtitleFill, material: 'base' }));
    nodes.push(drawText(input, 'age', { fill: t.nameplateInk, material: 'base' }));
    nodes.push(drawText(input, 'date', { fill: t.inkSoft, material: 'base' }));
    if (on(input, 'supportStick')) nodes.push(...supportTabs(input));
    return assemble(nodes);
  },
};

export const ROYAL_PRINCE_TEMPLATES: CakeTemplate[] = [
  royalPrinceCrown,
  littleKingThrone,
  sapphireRoyalMedallion,
  princeCastleShield,
  royalBabyBear,
];
