/**
 * @mazi/cake-atelier — scene builder
 *
 * The single entry point used by the studio, the exporters and the tests:
 * `buildScene(template, options) → Scene`.
 *
 * Everything downstream is a pure function of that scene, so the on-screen
 * preview and the printed file can never disagree.
 */

import { hashSeed, round } from '../geometry.js';
import { backgroundDecor, backgroundPaint } from '../art/backgrounds.js';
import { artCtx } from '../art/helpers.js';
import { resolveTokens, type TokenOverrides } from '../palettes.js';
import { cloneScene, type Scene, type SceneNode } from '../scene.js';
import { scaleScene } from '../render/scale.js';
import type { MeasureText } from '../typography/measure.js';
import { composeInput, designRandom, resolveLayout, DEFAULT_TOGGLES, type TypographyRequest } from './layout.js';
import { defaultFlags } from './scaffold.js';
import { NOMINAL_SIZE, type CakeTemplate, type ContentToggles, type ResolvedContent } from './types.js';

export interface BuildOptions {
  paletteId?: string;
  tokenOverrides?: TokenOverrides;
  content?: Partial<ResolvedContent>;
  toggles?: Partial<ContentToggles>;
  flags?: Record<string, boolean>;
  typography?: TypographyRequest;
  measure?: MeasureText;
  /** Physical output size in millimetres. Defaults to the nominal design size. */
  sizeMm?: { w: number; h: number };
  /** Leave the background transparent (PNG/SVG exports may want this). */
  transparent?: boolean;
  /** Hide specific node ids (layer visibility toggles). */
  hiddenIds?: string[];
  /** Project name recorded in the scene metadata. */
  projectName?: string;
  /** Timestamp for the metadata; pass a fixed value in tests for determinism. */
  generatedAt?: string;
}

export interface BuiltScene {
  scene: Scene;
  /** The physical/nominal scale factor between design units and millimetres. */
  designScale: number;
  warnings: string[];
  /** Per-region fit results, for the typography panel and preflight. */
  layouts: ReturnType<typeof resolveLayout>;
  content: ResolvedContent;
  toggles: ContentToggles;
  flags: Record<string, boolean>;
}

const ISO_FALLBACK = '1970-01-01T00:00:00.000Z';

export function buildScene(template: CakeTemplate, options: BuildOptions = {}): BuiltScene {
  const paletteId = options.paletteId ?? template.defaultPalette;
  const tokens = resolveTokens(paletteId, template.paletteOverrides ?? {}, options.tokenOverrides ?? {});

  const content: ResolvedContent = {
    ...template.defaults,
    ...(options.content ?? {}),
    name: (options.content?.name ?? template.defaults.name).normalize('NFC'),
  };

  const toggles: ContentToggles = {
    ...DEFAULT_TOGGLES,
    showSubtitle: Boolean(content.subtitle.trim()),
    showAge: Boolean(content.age.trim()),
    showDate: Boolean(content.date.trim()),
    ...(options.toggles ?? {}),
  };

  const flags = { ...defaultFlags(template), ...(options.flags ?? {}) };

  const layouts = resolveLayout(template, {
    content,
    toggles,
    ...(options.measure ? { measure: options.measure } : {}),
    ...(options.typography ? { typography: options.typography } : {}),
  });

  const nominal = NOMINAL_SIZE[template.aspect];
  const clips: Record<string, string> = {};
  const input = {
    ...composeInput(template, tokens, paletteId, content, toggles, layouts, flags),
    clips,
  };

  const ctx = artCtx(tokens, 'base', template.id);
  const background = options.transparent ? undefined : backgroundPaint(template.background.kind, ctx, nominal.w, nominal.h, template.background.paint);
  const decor = options.transparent ? [] : backgroundDecor(template.background, { w: nominal.w, h: nominal.h, ctx, rand: designRandom(template, content, paletteId) });
  const composed = template.compose(input);

  const nodes: SceneNode[] = [...decor, ...composed];

  const revision = round(
    hashSeed(
      [
        template.id,
        template.version,
        paletteId,
        JSON.stringify(options.tokenOverrides ?? {}),
        content.name,
        content.title,
        content.subtitle,
        content.age,
        content.date,
        options.toggles?.showSubtitle ?? true,
        options.toggles?.showAge ?? true,
        JSON.stringify(options.typography ?? {}),
        Object.entries(flags)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}:${value}`)
          .join(','),
      ].join('|'),
    ) / 0xffffffff,
    6,
  );

  let scene: Scene = {
    widthMm: nominal.w,
    heightMm: nominal.h,
    ...(background !== undefined ? { background } : {}),
    nodes,
    clips,
    meta: {
      templateId: template.id,
      templateVersion: template.version,
      widthMm: nominal.w,
      heightMm: nominal.h,
      projectName: options.projectName ?? `${template.name} — ${content.name || 'untitled'}`,
      paletteId,
      generatedAt: options.generatedAt ?? new Date().toISOString(),
      revision: String(revision),
    },
  };

  const target = options.sizeMm ?? nominal;
  const designScale = round(target.w / nominal.w, 6);
  const heightScale = round(target.h / nominal.h, 6);
  if (Math.abs(designScale - heightScale) > 0.002) {
    // Aspect mismatches are validated earlier; this is the last line of defence.
    throw new Error(
      `cake-atelier: ${template.id} aspect mismatch — requested ${target.w}×${target.h} mm does not match the ${template.aspect} design (${nominal.w}×${nominal.h} mm).`,
    );
  }
  if (Math.abs(designScale - 1) > 1e-9) scene = scaleScene(scene, designScale);

  if (options.hiddenIds?.length) {
    const hidden = new Set(options.hiddenIds);
    scene = hideById(scene, hidden);
  }
  scene = cloneScene(scene);
  scene.meta.projectName = options.projectName ?? scene.meta.projectName;

  const warnings: string[] = [];
  for (const layout of Object.values(layouts)) {
    if (!layout) continue;
    for (const warning of layout.warnings) if (!warnings.includes(warning)) warnings.push(warning);
  }

  return { scene, designScale, warnings, layouts, content, toggles, flags };
}

function hideById(scene: Scene, hidden: Set<string>): Scene {
  const visit = (nodes: SceneNode[]): SceneNode[] =>
    nodes.map((node) => {
      if (hidden.has(node.id)) return { ...node, hidden: true };
      if (node.kind === 'group') return { ...node, children: visit(node.children) };
      return node;
    });
  return { ...scene, nodes: visit(scene.nodes) };
}

/** Convenience for thumbnail generation — background plus main artwork only. */
export function buildThumbnailScene(template: CakeTemplate, paletteId?: string): Scene {
  return buildScene(template, {
    ...(paletteId ? { paletteId } : {}),
    content: { name: '', title: '', subtitle: '', age: '', date: '' },
    toggles: { showSubtitle: false, showAge: false, showDate: false },
    flags: { backing: false, cutline: false, supportStick: false, sparkles: true, confetti: true },
    generatedAt: ISO_FALLBACK,
  }).scene;
}
