/**
 * @mazi/cake-atelier — template layout resolution
 *
 * Turns user content into fitted, positioned text for every declared region.
 * This runs *before* `compose`, so a template never has to think about fitting —
 * and no template can accidentally break the fixed-composition rule by
 * re-flowing artwork when a name gets longer.
 */

import { createRandom, hashSeed } from '../geometry.js';
import { foilFlat, type PaletteTokens } from '../palettes.js';
import { group, type SceneNode, type TextNode } from '../scene.js';
import { fitTextToRegion, type MeasureText, type TextFitResult, type TextRegionSpec } from '../typography/measure.js';
import { NOMINAL_SIZE, type CakeTemplate, type ComposeInput, type ContentToggles, type RegionId, type ResolvedContent, type TextLayouts } from './types.js';

export interface TypographyRequest {
  family?: Partial<Record<RegionId, string>>;
  weight?: number;
  /** Requested name size in pt. */
  nameSizePt?: number;
  titleSizePt?: number;
  /** Letter spacing in em for the name. */
  nameTracking?: number;
  lineHeight?: number;
}

export interface LayoutRequest {
  content: ResolvedContent;
  toggles: ContentToggles;
  measure?: MeasureText;
  typography?: TypographyRequest;
}

export const DEFAULT_TOGGLES: ContentToggles = { showSubtitle: true, showAge: true, showDate: false };

/**
 * Fit every region. Regions the template does not use (no subtitle spec) are
 * skipped silently; a region whose text is empty returns an empty layout so the
 * caller can decide whether to draw a placeholder.
 */
export function resolveLayout(template: CakeTemplate, request: LayoutRequest): TextLayouts {
  const { content, toggles } = request;
  const typography = request.typography ?? {};
  const layouts: TextLayouts = {};
  const measure = request.measure;

  const textFor: Partial<Record<RegionId, string>> = {
    name: content.name,
    title: content.title,
    subtitle: content.subtitle,
    age: content.age,
    date: content.date,
  };

  const visible: Record<RegionId, boolean> = {
    name: true,
    title: true,
    subtitle: toggles.showSubtitle,
    age: toggles.showAge,
    date: toggles.showDate,
  };

  for (const region of ['name', 'title', 'subtitle', 'age', 'date'] as RegionId[]) {
    const spec: TextRegionSpec | undefined = template.regions[region];
    if (!spec) continue;
    if (!visible[region]) continue;
    const text = textFor[region] ?? '';
    if (!text.trim()) continue;

    const requestedFamily = typography.family?.[region];
    const requestedSizePt =
      region === 'name'
        ? typography.nameSizePt
        : region === 'title'
          ? typography.titleSizePt
          : undefined;
    const requestedTracking = region === 'name' ? typography.nameTracking ?? template.typography.nameTracking : undefined;

    layouts[region] = fitTextToRegion(text, spec, {
      ...(measure ? { measure } : {}),
      ...(requestedFamily ? { requestedFamily } : {}),
      ...(typography.weight !== undefined ? { requestedWeight: typography.weight } : {}),
      ...(requestedSizePt !== undefined ? { requestedSizePt } : {}),
      ...(requestedTracking !== undefined ? { requestedLetterSpacingEm: requestedTracking } : {}),
      ...(typography.lineHeight !== undefined ? { lineHeight: typography.lineHeight } : {}),
    });
  }

  return layouts;
}

/**
 * Deterministic RNG for a design's *decoration*.
 *
 * The seed deliberately contains only the template identity and its design
 * version — not the name, the palette or the typography. That is what makes the
 * fixed-composition rule hold end to end: renaming a child or switching palette
 * changes ink and glyphs, never the position of a single scattered star. The
 * artwork a customer approved in the gallery is the artwork that gets printed.
 *
 * (Text placement is fully deterministic through `resolveLayout`; nothing that
 * depends on the words ever reads this generator.)
 */
export function designRandom(template: CakeTemplate, _content?: ResolvedContent, _paletteId?: string): () => number {
  const seed = hashSeed(`${template.id}|v${template.version}|decor`);
  const rand = createRandom(seed);
  // Burn a few values so visually adjacent template ids diverge.
  for (let i = 0; i < 3; i += 1) rand();
  return rand;
}

/**
 * Convert a fitted layout into a text node the renderers understand. Keeping
 * this in one place is what makes "change the name, nothing else moves" true.
 */
export function textNode(
  layout: TextFitResult,
  options: {
    id: string;
    role: TextNode['role'];
    fill: string;
    material: string;
    editable?: boolean;
    label?: string;
    stroke?: TextNode['stroke'];
  },
): TextNode {
  const node: TextNode = {
    kind: 'text',
    id: options.id,
    role: options.role,
    material: options.material,
    family: layout.familyId,
    faceId: layout.faceId,
    weight: layout.weight,
    size: layout.sizeMm,
    lineHeight: layout.lineHeight,
    letterSpacing: layout.letterSpacingMm,
    anchor: layout.anchor,
    baseline: 'alphabetic' as const,
    fill: options.fill,
    lines: layout.lines.map((line) => ({ text: line.text, x: line.x, y: line.y, width: line.width })),
    editable: options.editable ?? true,
    label: options.label,
  };
  if (options.stroke) node.stroke = options.stroke;
  return node;
}

/** Group text nodes so a layer visibility switch can hide all of them at once. */
export function textGroup(id: string, children: SceneNode[], material: string, label: string): SceneNode {
  return group(children, { id, role: 'name', material, label });
}

/** Convenience for templates: build the compose input. */
export function composeInput(
  template: CakeTemplate,
  tokens: PaletteTokens,
  paletteId: string,
  content: ResolvedContent,
  toggles: ContentToggles,
  layouts: TextLayouts,
  flags: Record<string, boolean>,
  clips: Record<string, string> = {},
): ComposeInput {
  const nominal = NOMINAL_SIZE[template.aspect];
  return {
    template,
    tokens,
    paletteId: paletteId as ComposeInput['paletteId'],
    content,
    toggles,
    flags,
    layouts,
    rand: designRandom(template, content, paletteId),
    width: nominal.w,
    height: nominal.h,
    clips,
  };
}

/** Foil colour used for flat (cut-layer) rendering of metallic shapes. */
export function flatFoil(tokens: PaletteTokens): string {
  return foilFlat(tokens);
}
