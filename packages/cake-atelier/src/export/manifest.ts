/**
 * @mazi/cake-atelier — export settings, filenames and the production report
 *
 * Every generated file is described by a report: what it is, how big it is, how
 * the fonts were handled, how many layers it has and what — if anything — the
 * preflight wanted to warn about. The report travels with the download, so a
 * printer can check the job without opening a design tool.
 */

import { round } from '../geometry.js';
import type { Scene } from '../scene.js';
import type { CakeTemplate } from '../templates/types.js';
import type { ExportSettings } from '../validation/schemas.js';
import { rasterPlan, type ResolvedSize } from '../print/sizes.js';
import type { LayerPlan } from '../print/layers.js';
import type { PreflightResult } from '../print/preflight.js';
import type { MaterialUsage } from '../print/materials.js';

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'png',
  ppi: 300,
  transparent: true,
  bleedMm: 0,
  includeCutline: false,
  includeRegistration: true,
  includeGuides: false,
  outlineText: true,
  cutToleranceMm: 0.3,
  layers: 'all',
};

export type ExportFormat = ExportSettings['format'];

export const FORMAT_META: Record<ExportFormat, { label: string; extension: string; mime: string; blurb: string }> = {
  png: {
    label: 'PNG (300 PPI raster)',
    extension: 'png',
    mime: 'image/png',
    blurb: 'Pixels at a true resolution calculated from the physical size — for home printers and Cricut-style print-then-cut.',
  },
  svg: {
    label: 'SVG (vector)',
    extension: 'svg',
    mime: 'image/svg+xml',
    blurb: 'Editable vector artwork with physical units, for Illustrator, Affinity, Inkscape and cutting software.',
  },
  pdf: {
    label: 'PDF (vector document)',
    extension: 'pdf',
    mime: 'application/pdf',
    blurb: 'A real PDF page at the exact physical size with outlined text, optional bleed and trim guides — what a print shop wants.',
  },
  layers: {
    label: 'Layered cardstock package (ZIP)',
    extension: 'zip',
    mime: 'application/zip',
    blurb: 'One SVG per paper colour, with cut contours, score lines, registration marks and an assembly manifest.',
  },
};

/** Strip anything that could escape a directory or confuse a shell. */
export function sanitizeFileName(input: string, fallback = 'cake-atelier'): string {
  const cleaned = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
  return cleaned.length ? cleaned : fallback;
}

export interface FileNameInput {
  projectName: string;
  childName: string;
  templateId: string;
  format: ExportFormat;
  widthMm: number;
  heightMm: number;
  revision?: string;
  ppi?: number;
  transparent?: boolean;
}

export function exportFileName(input: FileNameInput): string {
  const parts = [
    sanitizeFileName(input.childName || input.projectName, 'design'),
    sanitizeFileName(input.templateId, 'template'),
    `${round(input.widthMm, 0)}x${round(input.heightMm, 0)}mm`,
  ];
  if (input.format === 'png' && input.ppi) parts.push(`${input.ppi}ppi`);
  if (input.revision) parts.push(input.revision.slice(0, 6));
  return `${parts.join('_')}.${FORMAT_META[input.format].extension}`;
}

export interface ProductionReport {
  version: number;
  generatedAt: string;
  format: ExportFormat;
  fileName: string;
  mime: string;
  template: { id: string; name: string; version: number; aspect: string };
  project: { name: string; childName: string; paletteId: string; revision: string };
  dimensions: {
    widthMm: number;
    heightMm: number;
    widthIn: number;
    heightIn: number;
    bleedMm: number;
    trimBox: string;
    mediaBox: string;
  };
  raster?: { ppi: number; widthPx: number; heightPx: number; megapixels: number; estimatedBytes: number };
  typography: {
    /** live text vs outlines in this file */
    textMode: 'editable' | 'outlined' | 'mixed' | 'none';
    fonts: string[];
    smallestTextMm: number;
  };
  layers?: {
    count: number;
    names: string[];
    materials: { material: string; label: string; color: string; cutContours: number; simulatedFoil?: boolean }[];
    registration: boolean;
    cutToleranceMm: number;
  };
  cardstock: MaterialUsage[];
  preflight: {
    ok: boolean;
    errors: PreflightResult['errors'];
    warnings: PreflightResult['warnings'];
    info: PreflightResult['info'];
    checks: PreflightResult['checks'];
    acknowledged?: { acceptedWarnings: string[]; at: string };
  };
  notes: string[];
  fileSize?: number;
}

export interface BuildReportInput {
  scene: Scene;
  template: CakeTemplate;
  projectName: string;
  childName: string;
  size: ResolvedSize;
  settings: ExportSettings;
  preflight: PreflightResult;
  fileName: string;
  cardstock: MaterialUsage[];
  layerPlan?: LayerPlan[];
  textMode: ProductionReport['typography']['textMode'];
  notes?: string[];
  generatedAt?: string;
  acknowledged?: { acceptedWarnings: string[]; at: string };
}

export function buildProductionReport(input: BuildReportInput): ProductionReport {
  const { scene, template, size, settings, preflight } = input;
  const bleed = settings.bleedMm ?? 0;
  const report: ProductionReport = {
    version: 1,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    format: settings.format,
    fileName: input.fileName,
    mime: FORMAT_META[settings.format].mime,
    template: { id: template.id, name: template.name, version: template.version, aspect: template.aspect },
    project: {
      name: input.projectName,
      childName: input.childName,
      paletteId: scene.meta.paletteId,
      revision: scene.meta.revision,
    },
    dimensions: {
      widthMm: round(size.widthMm, 2),
      heightMm: round(size.heightMm, 2),
      widthIn: round(size.widthMm / 25.4, 3),
      heightIn: round(size.heightMm / 25.4, 3),
      bleedMm: bleed,
      trimBox: `0 0 ${round(size.widthMm, 2)} ${round(size.heightMm, 2)}`,
      mediaBox: `${round(-bleed, 2)} ${round(-bleed, 2)} ${round(size.widthMm + bleed * 2, 2)} ${round(size.heightMm + bleed * 2, 2)}`,
    },
    typography: {
      textMode: input.textMode,
      fonts: preflight.summary.fonts,
      smallestTextMm: preflight.summary.smallestTextMm,
    },
    cardstock: input.cardstock,
    preflight: {
      ok: preflight.ok,
      errors: preflight.errors,
      warnings: preflight.warnings,
      info: preflight.info,
      checks: preflight.checks,
      ...(input.acknowledged ? { acknowledged: input.acknowledged } : {}),
    },
    notes: [
      ...(input.notes ?? []),
      'Dimensions are stated in millimetres and inches; the PDF and SVG carry physical units so no scaling is applied on open.',
      'Fonts are outlined in print files unless editable text was explicitly requested, so no font substitution can occur on another machine.',
    ],
  };

  if (settings.format === 'png') {
    const plan = rasterPlan(size.widthMm + bleed * 2, size.heightMm + bleed * 2, settings.ppi);
    report.raster = {
      ppi: plan.ppi,
      widthPx: plan.widthPx,
      heightPx: plan.heightPx,
      megapixels: plan.megapixels,
      estimatedBytes: plan.estimatedBytes,
    };
  }

  if (input.layerPlan?.length) {
    report.layers = {
      count: input.layerPlan.length,
      names: input.layerPlan.map((layer) => `layer-${layer.material}.svg`),
      materials: input.layerPlan.map((layer) => ({
        material: layer.material,
        label: layer.label,
        color: layer.color,
        cutContours: layer.cutContours.length,
        ...(layer.simulatedFoil ? { simulatedFoil: true } : {}),
      })),
      registration: settings.includeRegistration,
      cutToleranceMm: settings.cutToleranceMm,
    };
  }

  return report;
}

/** Printable plain-text version, included inside layered packages. */
export function reportToText(report: ProductionReport): string {
  const lines: string[] = [];
  lines.push('CAKE ATELIER PRO — PRODUCTION REPORT');
  lines.push('='.repeat(52));
  lines.push(`File            : ${report.fileName}`);
  lines.push(`Format          : ${report.format.toUpperCase()} (${report.mime})`);
  lines.push(`Generated       : ${report.generatedAt}`);
  lines.push(`Template        : ${report.template.name} (${report.template.id} v${report.template.version}, ${report.template.aspect})`);
  lines.push(`Project         : ${report.project.name}`);
  lines.push(`Name on design  : ${report.project.childName}`);
  lines.push(`Palette         : ${report.project.paletteId}`);
  lines.push(`Revision        : ${report.project.revision}`);
  lines.push('');
  lines.push('DIMENSIONS');
  lines.push(`  Trim  : ${report.dimensions.widthMm} × ${report.dimensions.heightMm} mm (${report.dimensions.widthIn} × ${report.dimensions.heightIn} in)`);
  lines.push(`  Bleed : ${report.dimensions.bleedMm} mm`);
  if (report.raster) {
    lines.push(`  Raster: ${report.raster.widthPx} × ${report.raster.heightPx} px at ${report.raster.ppi} PPI (${report.raster.megapixels} MP)`);
  }
  lines.push('');
  lines.push('TYPOGRAPHY');
  lines.push(`  Mode   : ${report.typography.textMode}`);
  lines.push(`  Fonts  : ${report.typography.fonts.join(', ') || 'none'}`);
  lines.push(`  Smallest text: ${report.typography.smallestTextMm} mm`);
  if (report.layers) {
    lines.push('');
    lines.push('LAYERS');
    for (const material of report.layers.materials) {
      lines.push(`  - ${material.material.padEnd(8)} ${material.label} (${material.color}) — ${material.cutContours} cut contour(s)${material.simulatedFoil ? ' [simulated foil]' : ''}`);
    }
    lines.push(`  Cut tolerance: ${report.layers.cutToleranceMm} mm`);
  }
  lines.push('');
  lines.push('PREFLIGHT');
  for (const check of report.preflight.checks) {
    lines.push(`  [${check.status.toUpperCase().padEnd(7)}] ${check.label} — ${check.detail}`);
  }
  if (report.preflight.warnings.length) {
    lines.push('');
    lines.push('WARNINGS');
    for (const warning of report.preflight.warnings) lines.push(`  ! ${warning.title}: ${warning.detail}`);
  }
  if (report.preflight.acknowledged) {
    lines.push('');
    lines.push(`Acknowledged by the user at ${report.preflight.acknowledged.at}: ${report.preflight.acknowledged.acceptedWarnings.join(', ') || '(none)'}`);
  }
  if (report.notes.length) {
    lines.push('');
    lines.push('NOTES');
    for (const note of report.notes) lines.push(`  - ${note}`);
  }
  return lines.join('\n');
}

/** Assembly instructions placed in every layered ZIP. */
export function assemblyInstructions(report: ProductionReport): string {
  return [
    'CAKE ATELIER PRO — ASSEMBLY INSTRUCTIONS',
    '='.repeat(52),
    '',
    `Design: ${report.project.name} · ${report.dimensions.widthMm} × ${report.dimensions.heightMm} mm`,
    '',
    '1. Print each layer file at 100% scale (no "fit to page").',
    '   Every file carries its physical size in millimetres, so a correctly',
    '   configured printer needs no scaling at all.',
    '2. Verify scale on the first sheet: the trim box must measure exactly',
    `   ${report.dimensions.widthMm} mm wide. If it does not, fix the print settings before cutting.`,
    '3. Cut along the magenta contours. Dashed blue lines are scores — fold them, do not cut them.',
    '4. Stack in the order listed in manifest.json (bottom to top).',
    '5. Align on the four registration marks before gluing; keep glue 5 mm inside the edge.',
    '6. Add the support stick tab if you enabled it, then mount on the cake.',
    '',
    report.layers ? `Layers in this package: ${report.layers.materials.map((material) => material.material).join(', ')}` : '',
    '',
    'Note: metallic areas are an RGB gradient that imitates foil. Real foil requires a',
    'separate foil or spot-colour pass at your printer; the foil layer in this package',
    'is provided for exactly that hand-off.',
  ].join('\n');
}
