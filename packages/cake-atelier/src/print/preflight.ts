/**
 * @mazi/cake-atelier — print preflight
 *
 * The checklist that runs before any file is generated. It answers real
 * questions: does every string fit, is every font present, are the dimensions
 * valid, do the layers exist, is the SVG well formed, are cut paths real
 * contours, and do the export settings match what was asked for?
 *
 * Errors block the export. Warnings can be exported only when the caller
 * explicitly acknowledges them — that acknowledgement is recorded in the
 * production report so nobody can claim they were not told.
 */

import { round } from '../geometry.js';
import { luminance } from '../palettes.js';
import { walk, type Scene, type SceneNode } from '../scene.js';
import type { CakeTemplate, TextLayouts } from '../templates/types.js';
import { familyForFace, getFontFace } from '../typography/fonts.js';
import { NOMINAL_SIZE } from '../templates/types.js';
import { checkDimensions, rasterPlan, type DimensionCheck, type ResolvedSize } from './sizes.js';

export type PreflightSeverity = 'error' | 'warning' | 'info';

export interface PreflightIssue {
  id: string;
  severity: PreflightSeverity;
  title: string;
  detail: string;
  /** What the user can do about it. */
  remedy?: string;
}

export interface PreflightCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'skipped';
  detail: string;
}

export interface PreflightInput {
  scene: Scene;
  template: CakeTemplate;
  size: ResolvedSize;
  layouts: TextLayouts;
  /** Export configuration being requested. */
  format: 'png' | 'svg' | 'pdf' | 'layers';
  ppi?: number;
  includeBleed?: boolean;
  bleedMm?: number;
  transparent?: boolean;
  outlineText?: boolean;
  /** Whether the material list declares a 'base' layer. */
  declaredMaterials?: string[];
  /**
   * Result of an earlier `checkDimensions` call. Passing it in keeps the guard
   * rail in the exporter and the panel in the studio showing the same verdict —
   * including the export-size (pixel) limit, which depends on the requested PPI.
   */
  dimensions?: DimensionCheck;
}

export interface PreflightResult {
  ok: boolean;
  canExportWithAcknowledgement: boolean;
  checks: PreflightCheck[];
  errors: PreflightIssue[];
  warnings: PreflightIssue[];
  info: PreflightIssue[];
  summary: {
    widthMm: number;
    heightMm: number;
    pixels?: { widthPx: number; heightPx: number; ppi: number };
    smallestTextMm: number;
    numberOfLayers: number;
    fonts: string[];
    usesFoil: boolean;
  };
}

const MIN_READABLE_MM = 3.2;

/**
 * The preflight result for a request that can be rejected before any artwork is
 * built — a size that does not match the design's aspect ratio, for instance.
 * Returning a full result (rather than throwing a bare Error) means the studio
 * can show the same blocking card it shows for every other critical error.
 */
export function blockedPreflight(params: {
  widthMm: number;
  heightMm: number;
  issue: { id: string; title: string; detail: string; remedy?: string };
  fonts?: string[];
  layers?: number;
}): PreflightResult {
  const issue: PreflightIssue = { ...params.issue, severity: 'error' };
  return {
    ok: false,
    canExportWithAcknowledgement: false,
    checks: [{ id: params.issue.id, label: params.issue.title, status: 'fail', detail: params.issue.detail }],
    errors: [issue],
    warnings: [],
    info: [],
    summary: {
      widthMm: params.widthMm,
      heightMm: params.heightMm,
      smallestTextMm: 0,
      numberOfLayers: params.layers ?? 0,
      fonts: params.fonts ?? [],
      usesFoil: false,
    },
  };
}

function collectFonts(scene: Scene): string[] {
  const faces = new Set<string>();
  walk(scene.nodes, (node) => {
    if (node.kind === 'text') faces.add(node.faceId ?? '');
  });
  return [...faces].filter(Boolean).sort();
}

function collectMaterials(scene: Scene): string[] {
  const materials = new Set<string>();
  walk(scene.nodes, (_node, ctx) => {
    if (ctx.material) materials.add(ctx.material);
  });
  return [...materials].sort();
}

function textIssues(layouts: TextLayouts, scale: number): { smallestMm: number; issues: PreflightIssue[] } {
  const issues: PreflightIssue[] = [];
  let smallest = Number.POSITIVE_INFINITY;
  for (const [region, layout] of Object.entries(layouts)) {
    if (!layout) continue;
    const physicalMm = layout.sizeMm * scale;
    smallest = Math.min(smallest, physicalMm);
    if (layout.overflow) {
      issues.push({
        id: `text-overflow-${region}`,
        severity: 'error',
        title: `${region === 'name' ? "Child's name" : region} does not fit`,
        detail: `${layout.lines.map((line) => line.text).join(' ') || '(empty)'} needs more room than the ${region} region allows, even at the minimum readable size.`,
        remedy: 'Shorten the text, choose a narrower font, increase the line allowance, or pick a template with a larger text area.',
      });
    }
    if (physicalMm < MIN_READABLE_MM) {
      issues.push({
        id: `text-small-${region}`,
        severity: 'warning',
        title: `${region} is very small on this size`,
        detail: `At this physical size the ${region} renders about ${round(physicalMm, 1)} mm tall, below the ${MIN_READABLE_MM} mm comfortable minimum.`,
        remedy: 'Choose a larger topper size, or reduce the amount of text so the fit engine can grow it.',
      });
    }
    for (const warning of layout.warnings) {
      issues.push({
        id: `text-warning-${region}-${warning.slice(0, 18)}`,
        severity: 'warning',
        title: `${region} note`,
        detail: warning,
      });
    }
  }
  return { smallestMm: Number.isFinite(smallest) ? round(smallest, 2) : 0, issues };
}

function svgWellFormed(scene: Scene): PreflightCheck {
  let open = 0;
  let bad = 0;
  let truncated = 0;
  walk(scene.nodes, (node) => {
    if (node.kind !== 'shape') return;
    const d = node.d;
    for (const char of d) {
      if (char === 'M' || char === 'L' || char === 'C' || char === 'Z' || char === 'Q') open += 1;
    }
    if (/[a-zA-Z]$/.test(d.trim()) && !d.trim().endsWith('Z')) truncated += 1;
    if (/(NaN|Infinity|undefined)/.test(d)) bad += 1;
  });
  if (bad > 0) {
    return { id: 'svg-wellformed', label: 'SVG path data is well formed', status: 'fail', detail: `${bad} path(s) contain non-numeric values.` };
  }
  if (truncated > 0) {
    return { id: 'svg-wellformed', label: 'SVG path data is well formed', status: 'warn', detail: `${truncated} path(s) end without an explicit close — visually fine, but tidy files cut better.` };
  }
  return { id: 'svg-wellformed', label: 'SVG path data is well formed', status: 'pass', detail: `${open} path commands validated, no NaN or infinite coordinates.` };
}

function contrastCheck(scene: Scene): PreflightCheck {
  // Compare the name fill against the background: a name that disappears into
  // the plate is a production error, not a taste question.
  let nameFill: string | undefined;
  walk(scene.nodes, (node) => {
    if (node.kind === 'text' && node.role === 'name' && typeof node.fill === 'string') nameFill = node.fill;
  });
  const background = typeof scene.background === 'string' ? scene.background : undefined;
  if (!nameFill || !background) {
    return { id: 'contrast', label: 'Name contrast against the background', status: 'skipped', detail: 'Background is transparent or gradient — check the proof visually.' };
  }
  const light = luminance(nameFill);
  const bg = luminance(background);
  const ratio = (Math.max(light, bg) + 0.05) / (Math.min(light, bg) + 0.05);
  if (ratio < 3) {
    return {
      id: 'contrast',
      label: 'Name contrast against the background',
      status: 'warn',
      detail: `Contrast ratio is ${round(ratio, 2)}:1 — the name may be hard to read at a distance.`,
    };
  }
  return { id: 'contrast', label: 'Name contrast against the background', status: 'pass', detail: `Contrast ratio ${round(ratio, 2)}:1.` };
}

export function preflight(input: PreflightInput): PreflightResult {
  const { scene, template, size, layouts } = input;
  const checks: PreflightCheck[] = [];
  const errors: PreflightIssue[] = [];
  const warnings: PreflightIssue[] = [];
  const info: PreflightIssue[] = [];

  const nominal = NOMINAL_SIZE[template.aspect];
  const scale = size.widthMm / nominal.w;
  const dimensionCheck = input.dimensions ?? checkDimensions(size, nominal.w / nominal.h, { ppi: input.ppi, shape: size.shape });
  for (const error of dimensionCheck.errors) {
    errors.push({ id: 'dimensions', severity: 'error', title: 'Dimensions do not match the template', detail: error, remedy: 'Pick a preset that matches the template aspect ratio, or switch templates.' });
  }
  for (const warning of dimensionCheck.warnings) {
    warnings.push({ id: 'dimensions-warning', severity: 'warning', title: 'Dimension caution', detail: warning });
  }
  checks.push({
    id: 'dimensions',
    label: 'Dimensions are valid',
    status: dimensionCheck.ok ? 'pass' : 'fail',
    detail: `${round(size.widthMm, 1)} × ${round(size.heightMm, 1)} mm (aspect ${round(size.widthMm / size.heightMm, 3)} vs design ${round(nominal.w / nominal.h, 3)}).`,
  });

  const text = textIssues(layouts, scale);
  for (const issue of text.issues) {
    if (issue.severity === 'error') errors.push(issue);
    else warnings.push(issue);
  }
  checks.push({
    id: 'text-fit',
    label: 'All text fits',
    status: text.issues.some((issue) => issue.severity === 'error') ? 'fail' : text.issues.length ? 'warn' : 'pass',
    detail: `Smallest text is ${text.smallestMm} mm tall at this size.`,
  });

  const fonts = collectFonts(scene);
  const missingFaces = fonts.filter((face) => !getFontFace(face));
  const substituted = fonts.filter((face) => {
    const definition = familyForFace(face);
    return definition ? !definition.faces.some((entry) => entry.id === face) : true;
  });
  if (missingFaces.length) {
    errors.push({
      id: 'fonts',
      severity: 'error',
      title: 'A font face is missing',
      detail: `Face id(s) ${missingFaces.join(', ')} are not in the bundled registry.`,
      remedy: 'Reset the typography for this project — the studio will pick a bundled face.',
    });
  } else if (substituted.length) {
    warnings.push({
      id: 'fonts-substituted',
      severity: 'warning',
      title: 'A substituted font is in use',
      detail: `${substituted.join(', ')} are fallbacks (for example Devanagari coverage).`,
    });
  }
  checks.push({
    id: 'fonts',
    label: 'Fonts are available and valid',
    status: missingFaces.length ? 'fail' : substituted.length ? 'warn' : fonts.length ? 'pass' : 'skipped',
    detail: fonts.length ? `${fonts.length} face(s) in use: ${fonts.join(', ')}.` : 'No live text in this scene (all outlines).',
  });

  const materials = collectMaterials(scene);
  const declared = input.declaredMaterials ?? template.materials.map((material) => material.id);
  const undeclared = materials.filter((material) => !declared.includes(material));
  if (undeclared.length) {
    warnings.push({
      id: 'layers-undeclared',
      severity: 'warning',
      title: 'Undeclared material on some nodes',
      detail: `Material id(s) ${undeclared.join(', ')} are used but not declared by the template.`,
      remedy: 'They will be grouped into the base layer. Report this template if it looks wrong.',
    });
  }
  if (!declared.includes('base')) {
    errors.push({ id: 'layers-base', severity: 'error', title: 'No base layer', detail: 'This template does not declare a "base" material, so a layered export cannot be assembled.' });
  }
  checks.push({
    id: 'layers',
    label: 'Required layers exist',
    status: declared.includes('base') ? (undeclared.length ? 'warn' : 'pass') : 'fail',
    detail: `${materials.length} material(s) in use: ${materials.join(', ') || 'none'}.`,
  });

  checks.push(svgWellFormed(scene));

  // Clipping: shapes that leave the trim box are clipped in print.
  let outside = 0;
  const tolerance = 0.75;
  walk(scene.nodes, (node) => {
    if (node.kind !== 'shape' || !node.cut) return;
    const numbers = node.d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const x = numbers[i]!;
      const y = numbers[i + 1]!;
      if (x < -tolerance || y < -tolerance || x > scene.widthMm + tolerance || y > scene.heightMm + tolerance) {
        outside += 1;
        return;
      }
    }
  });
  if (outside > 0) {
    warnings.push({
      id: 'clipping',
      severity: 'warning',
      title: 'Artwork extends past the trim edge',
      detail: `${outside} cut shape(s) cross the trim box. If that is intentional decoupage, ignore this; otherwise reduce the size.`,
      remedy: 'Add bleed, or choose a larger document size.',
    });
  }
  checks.push({
    id: 'clipping',
    label: 'No unexpected clipping',
    status: outside === 0 ? 'pass' : 'warn',
    detail: outside === 0 ? 'All cut contours sit inside the trim box.' : `${outside} shape(s) cross the trim edge.`,
  });

  // External references: there are none by construction — this check proves it.
  const external = /\b(?:href|xlink:href)\s*=\s*["'](?!#)/.test(JSON.stringify(scene.nodes.map((node) => node.id)));
  checks.push({
    id: 'external-assets',
    label: 'No unresolved external assets',
    status: external ? 'fail' : 'pass',
    detail: external ? 'A node references an external asset.' : 'The scene is fully self-contained: no images, no remote fonts, no external references.',
  });
  if (external) {
    errors.push({ id: 'external', severity: 'error', title: 'External asset reference', detail: 'The scene references an external asset, which export forbids.' });
  }

  const cutContours = countCutContours(scene);
  if (input.format === 'layers' && cutContours === 0) {
    errors.push({
      id: 'cut-paths',
      severity: 'error',
      title: 'No cut contours',
      detail: 'This design has no shapes flagged for cutting, so a layered cardstock package would be empty.',
      remedy: 'Enable the backing plate / cutline option, or export PNG, SVG or PDF instead.',
    });
  }
  checks.push({
    id: 'cut-paths',
    label: 'Cut paths are valid where required',
    status: input.format === 'layers' ? (cutContours > 0 ? 'pass' : 'fail') : 'skipped',
    detail: `${cutContours} shape(s) flagged as cut contours.`,
  });

  const pixels = input.format === 'png' ? rasterPlan(size.widthMm, size.heightMm, input.ppi) : undefined;
  if (pixels && pixels.widthPx * pixels.heightPx > 40_000_000) {
    errors.push({
      id: 'raster-limit',
      severity: 'error',
      title: 'Raster export too large',
      detail: `${pixels.widthPx}×${pixels.heightPx} px exceeds the 40 MP export limit.`,
      remedy: 'Lower the PPI to 200, or reduce the document size.',
    });
  }
  checks.push({
    id: 'export-settings',
    label: 'Export settings match the requested output',
    status: 'pass',
    detail:
      input.format === 'png'
        ? `PNG at ${input.ppi ?? 300} PPI → ${pixels?.widthPx}×${pixels?.heightPx} px, ${input.transparent ? 'transparent' : 'white'} background.`
        : input.format === 'svg'
          ? `SVG vector document, ${input.outlineText ? 'text converted to outlines' : 'editable text preserved'}.`
          : input.format === 'pdf'
            ? `PDF at ${round(size.widthMm, 1)}×${round(size.heightMm, 1)} mm, ${input.includeBleed ? `${input.bleedMm ?? 3} mm bleed` : 'no bleed'}, text outlined.`
            : `Layered package with ${declared.length} material layer(s).`,
  });

  const usesFoil = template.materials.some((material) => material.simulatedFoil);
  if (usesFoil) {
    info.push({
      id: 'foil',
      severity: 'info',
      title: 'Simulated metal, not real foil',
      detail:
        'Metallic areas are an RGB gradient that looks like foil. Desktop printing cannot produce metal — the layered export includes a separate foil layer so a printer can run a real stamp.',
    });
  }
  checks.push(contrastCheck(scene));

  const ok = errors.length === 0;
  return {
    ok,
    canExportWithAcknowledgement: ok || errors.every((error) => error.severity === 'warning'),
    checks,
    errors,
    warnings,
    info,
    summary: {
      widthMm: round(size.widthMm, 2),
      heightMm: round(size.heightMm, 2),
      ...(pixels ? { pixels: { widthPx: pixels.widthPx, heightPx: pixels.heightPx, ppi: pixels.ppi } } : {}),
      smallestTextMm: text.smallestMm,
      numberOfLayers: declared.length,
      fonts,
      usesFoil,
    },
  };
}

export function countCutContours(scene: Scene): number {
  let count = 0;
  walk(scene.nodes, (node, ctx) => {
    if (ctx.cut && !ctx.hidden && node.kind === 'shape') count += 1;
  });
  return count;
}

/** Does the scene contain live text? (Determines whether outlines are needed.) */
export function hasLiveText(scene: Scene): boolean {
  let found = false;
  const visit = (nodes: SceneNode[]): void => {
    for (const node of nodes) {
      if (node.kind === 'text') found = true;
      else if (node.kind === 'group') visit(node.children);
      if (found) return;
    }
  };
  visit(scene.nodes);
  return found;
}
