/**
 * @mazi/cake-atelier — export orchestration (Node)
 *
 * One function, `generateExport`, turns a validated project into a file. It is
 * the *only* place that decides what a download contains, so:
 *
 *   • the browser preview, the API route and the tests all agree;
 *   • preflight runs before anything is rendered, and blocks on errors;
 *   • every artifact is accompanied by a production report describing exactly
 *     what was produced, how fonts were handled, and what was warned about.
 */

import { buildScene, type BuildOptions } from '../templates/build.js';
import { requireTemplate } from '../templates/registry.js';
import { renderSceneToSvg } from '../render/svg.js';
import { renderSceneToPdf } from '../render/pdf.js';
import { prepareForPrint, renderSceneToPng } from '../render/png.js';
import { extractContours, sceneFingerprint, type Scene } from '../scene.js';
import { buildLayerManifest, planLayers, renderLayerSvg, layerFileNames, type LayerPlan } from '../print/layers.js';
import { cardstockBreakdown, foilNotice, planMaterials, totalCutArea } from '../print/materials.js';
import { blockedPreflight, preflight as runPreflight, countCutContours, hasLiveText, type PreflightResult } from '../print/preflight.js';
import { checkDimensions, formatInch, formatMm, rasterPlan, resolveSize } from '../print/sizes.js';
import { NOMINAL_SIZE, type CakeTemplate } from '../templates/types.js';
import { boldFlatFoil, flatFoilScene } from './flat.js';
import { createZip } from './zip.js';
import {
  FORMAT_META,
  buildProductionReport,
  exportFileName,
  reportToText,
  assemblyInstructions,
  type ExportFormat,
  type ProductionReport,
} from './manifest.js';
import type { DesignProject, ExportSettings } from '../validation/schemas.js';

export interface GenerateExportOptions {
  project: DesignProject;
  /** Overrides the project's stored settings (the studio passes live values). */
  settings?: Partial<ExportSettings>;
  /** Live content overrides, e.g. while the user is still typing. */
  content?: BuildOptions['content'];
  /** Warnings the user has seen and accepted. */
  acknowledged?: { acceptedWarnings: string[]; at: string };
  /** Skip rasterisation but return the plan and report (studio previews). */
  reportOnly?: boolean;
  generatedAt?: string;
}

export interface GeneratedExport {
  format: ExportFormat;
  fileName: string;
  mime: string;
  bytes: Uint8Array;
  report: ProductionReport;
  preflight: PreflightResult;
  scene: Scene;
  /** Files inside the package, for layered exports. */
  files: string[];
}

export class ExportBlockedError extends Error {
  readonly preflight: PreflightResult;
  constructor(message: string, preflight: PreflightResult) {
    super(message);
    this.name = 'ExportBlockedError';
    this.preflight = preflight;
  }
}

/** Merge stored export settings with a per-request override. */
export function mergeSettings(project: DesignProject, override: Partial<ExportSettings> = {}): ExportSettings {
  return { ...project.export, ...override };
}

function sceneForProject(
  project: DesignProject,
  settings: ExportSettings,
  content?: BuildOptions['content'],
  options: { forceNominalSize?: boolean } = {},
): ReturnType<typeof buildScene> {
  const template = requireTemplate(project.templateId);
  const nominal = NOMINAL_SIZE[template.aspect];
  const scale = options.forceNominalSize ? 1 : project.size.widthMm / nominal.w;
  return buildScene(template, {
    paletteId: project.paletteId,
    tokenOverrides: project.tokenOverrides,
    content: { ...project.content, ...(content ?? {}) },
    flags: project.optionals,
    typography: {
      ...(project.typography.family ? { family: project.typography.family } : {}),
      ...(project.typography.nameSizePt !== undefined ? { nameSizePt: project.typography.nameSizePt } : {}),
      ...(project.typography.titleSizePt !== undefined ? { titleSizePt: project.typography.titleSizePt } : {}),
      ...(project.typography.nameTracking !== undefined ? { nameTracking: project.typography.nameTracking } : {}),
      ...(project.typography.weight !== undefined ? { weight: project.typography.weight } : {}),
      ...(project.typography.lineHeight !== undefined ? { lineHeight: project.typography.lineHeight } : {}),
    },
    hiddenIds: project.hiddenIds,
    projectName: project.name,
    ...(scale !== 1 ? { sizeMm: { w: project.size.widthMm, h: project.size.heightMm } } : {}),
    ...(settings.format === 'png' && settings.transparent ? { transparent: true } : {}),
  });
}

/** Quick, dependency-free summary used by the studio panels. */
export function projectDiagnostics(project: DesignProject, content?: BuildOptions['content']) {
  const template = requireTemplate(project.templateId);
  const settings = mergeSettings(project);
  const built = sceneForProject(project, settings, content);
  const size = resolveSize({ presetId: project.size.presetId, widthMm: project.size.widthMm, heightMm: project.size.heightMm });
  const nominal = NOMINAL_SIZE[template.aspect];
  const preflight = runPreflight({
    scene: built.scene,
    template,
    size: { ...size, warnings: [...size.warnings, ...checkDimensions(size, nominal.w / nominal.h, { ppi: settings.ppi }).warnings] },
    layouts: built.layouts,
    format: settings.format,
    ppi: settings.ppi,
    bleedMm: settings.bleedMm,
    includeBleed: settings.bleedMm > 0,
    transparent: settings.transparent,
    outlineText: settings.outlineText,
    declaredMaterials: template.materials.map((material) => material.id),
  });
  const materials = planMaterials(built.scene, template.materials);
  const layers = planLayers(built.scene, template.materials, { cutOnly: settings.layers === 'cut-only' });
  return { built, template, size, settings, preflight, materials, layers, nominal };
}

/** Generate a file (or a plan, when `reportOnly` is set). */
export async function generateExport(options: GenerateExportOptions): Promise<GeneratedExport> {
  const { project } = options;
  const template = requireTemplate(project.templateId);
  const settings = mergeSettings(project, options.settings);
  const nominal = NOMINAL_SIZE[template.aspect];
  const size = resolveSize({ presetId: project.size.presetId, widthMm: project.size.widthMm, heightMm: project.size.heightMm });

  // Cheap, scene-free rejection first: a size whose aspect cannot match the
  // design is a configuration mistake, and it is reported as a preflight error
  // rather than as a crash from deep inside the scene builder.
  const dimensions = checkDimensions(
    { widthMm: size.widthMm, heightMm: size.heightMm },
    nominal.w / nominal.h,
    { ppi: settings.ppi, shape: size.shape },
  );
  const dimensionBlocked = !dimensions.ok;
  if (dimensionBlocked && !options.reportOnly) {
    throw new ExportBlockedError(dimensions.errors[0] ?? 'The selected size does not match this design.', blockedPreflight({
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      issue: {
        id: 'dimensions',
        title: 'Size does not match this design',
        detail: dimensions.errors[0] ?? 'The selected document size has the wrong aspect ratio for this template.',
        remedy: 'Pick a size from the presets offered for this design, or switch to a template drawn for the size you need.',
      },
      layers: template.materials.length,
    }));
  }

  // A report-only request still builds, but at the design's own size, so the
  // panel can show the artwork next to the blocking dimension warning.
  const built = sceneForProject(project, settings, options.content, { forceNominalSize: dimensionBlocked });
  const scene = built.scene;

  const preflight = runPreflight({
    scene,
    template,
    size,
    layouts: built.layouts,
    format: settings.format,
    ppi: settings.ppi,
    bleedMm: settings.bleedMm,
    includeBleed: settings.bleedMm > 0,
    transparent: settings.transparent,
    outlineText: settings.outlineText,
    declaredMaterials: template.materials.map((material) => material.id),
    dimensions,
  });

  if (!preflight.ok && !options.reportOnly) {
    const first = preflight.errors[0];
    throw new ExportBlockedError(
      first ? `${first.title}: ${first.detail}` : 'Preflight found blocking errors; nothing was exported.',
      preflight,
    );
  }

  const fileName = exportFileName({
    projectName: project.name,
    childName: project.content.name,
    templateId: template.id,
    format: settings.format,
    widthMm: project.size.widthMm,
    heightMm: project.size.heightMm,
    revision: scene.meta.revision,
    ppi: settings.ppi,
    transparent: settings.transparent,
  });

  const materials = planMaterials(scene, template.materials);
  const needsLayers = settings.format === 'layers';
  const layerPlan = needsLayers ? planLayers(scene, template.materials, { cutOnly: settings.layers === 'cut-only' }) : undefined;
  const usesFoil = template.materials.some((material) => material.simulatedFoil) || sceneUsesFoil(scene, template);

  const cards = cardstockBreakdown(materials);
  const notes: string[] = [];
  const foil = foilNotice(usesFoil);
  if (foil) notes.push(foil);
  if (materials.length > 1) {
    notes.push(`Cut ${materials.length} layers. Total cut area ≈ ${totalCutArea(materials)} mm² — about ${estimateSheets(materials)} A4 sheet(s) of card.`);
  }
  if (settings.bleedMm === 0) {
    notes.push('No bleed was added. For inkjet printing at home, 2–3 mm of bleed prevents a white sliver at the trim edge.');
  }
  if (settings.format === 'svg' && !settings.outlineText) {
    notes.push('Editable text was kept in this SVG. If another machine opens it without the bundled fonts, the wording will substitute — export again with text converted to outlines for printing.');
  }

  const reportInput = {
    scene,
    template,
    projectName: project.name,
    childName: project.content.name,
    size,
    settings,
    preflight,
    fileName,
    cardstock: materials,
    textMode: textModeFor(settings, scene),
    notes,
    ...(options.generatedAt ? { generatedAt: options.generatedAt } : {}),
    ...(options.acknowledged ? { acknowledged: options.acknowledged } : {}),
  } as const;

  if (options.reportOnly) {
    const report = buildProductionReport({
      ...reportInput,
      ...(layerPlan ? { layerPlan } : {}),
    });
    return {
      format: settings.format,
      fileName,
      mime: FORMAT_META[settings.format].mime,
      bytes: new Uint8Array(),
      report,
      preflight,
      scene,
      files: layerPlan ? layerFileNames(layerPlan) : [fileName],
    };
  }

  switch (settings.format) {
    case 'svg': {
      const svgScene = settings.outlineText ? prepareForPrint(scene).scene : scene;
      const svg = renderSceneToSvg(svgScene, {
        includeBackground: !settings.transparent,
        bleedMm: settings.bleedMm,
        showGuides: settings.includeGuides,
        showRegistration: settings.includeRegistration && settings.bleedMm > 0,
        title: `${template.name} — ${project.content.name || 'topper'}`,
        description: `Cake Atelier Pro · ${formatMm(size.widthMm)} × ${formatMm(size.heightMm)} (${formatInch(size.widthMm)} × ${formatInch(size.heightMm)}) · ${settings.outlineText ? 'text outlined' : 'editable text'} · ${scene.meta.paletteId}`,
      });
      const report = buildProductionReport(reportInput);
      const bytes = new TextEncoder().encode(svg);
      return { format: 'svg', fileName, mime: FORMAT_META.svg.mime, bytes, report: withSize(report, bytes.length), preflight, scene, files: [fileName] };
    }
    case 'png': {
      const result = await renderSceneToPng(scene, {
        ppi: settings.ppi,
        transparent: settings.transparent,
        background: '#ffffff',
        outlineText: settings.outlineText,
        svg: {
          bleedMm: settings.bleedMm,
          showGuides: settings.includeGuides,
          showRegistration: settings.includeRegistration && settings.bleedMm > 0,
        },
      });
      const report = buildProductionReport(reportInput);
      return { format: 'png', fileName, mime: FORMAT_META.png.mime, bytes: result.data, report: withSize(report, result.data.length), preflight, scene, files: [fileName] };
    }
    case 'pdf': {
      const outlined = prepareForPrint(scene).scene;
      const data = renderSceneToPdf(outlined, {
        bleedMm: settings.bleedMm,
        includeGuides: settings.includeGuides,
        includeRegistration: settings.includeRegistration,
        includeBackground: !settings.transparent,
        title: `${template.name} — ${project.content.name || 'topper'}`,
        subject: `Cake topper ${formatMm(size.widthMm)} × ${formatMm(size.heightMm)} · ${template.id} · palette ${scene.meta.paletteId}`,
        ...(options.generatedAt ? { createdAt: options.generatedAt } : {}),
      });
      const report = buildProductionReport(reportInput);
      return { format: 'pdf', fileName, mime: FORMAT_META.pdf.mime, bytes: data, report: withSize(report, data.length), preflight, scene, files: [fileName] };
    }
    case 'layers':
    default: {
      if (!layerPlan) throw new ExportBlockedError('Layered export requested without a layer plan.', preflight);
      const outlined = prepareForPrint(scene).scene;
      const outlinedLayers = planLayers(outlined, template.materials, { cutOnly: settings.layers === 'cut-only' });
      const entries = outlinedLayers.map((layer) => ({
        name: `layer-${layer.material}.svg`,
        data: renderLayerSvg(scene, layer, {
          flat: false,
          registration: settings.includeRegistration,
          showCutContours: true,
          showScoreLines: true,
        }),
      }));
      const manifest = buildLayerManifest(layerPlan, scene, {
        cutToleranceMm: settings.cutToleranceMm,
        registration: settings.includeRegistration,
        ...(options.generatedAt ? { generatedAt: options.generatedAt } : {}),
      });
      const report = buildProductionReport({ ...reportInput, ...(layerPlan ? { layerPlan } : {}) });
      const readme = assemblyInstructions(report);
      const reportText = reportToText(report);
      const preview = renderSceneToSvg(flatFoilScene(scene), {
        includeBackground: true,
        showCutline: true,
        title: `${template.name} — assembly proof`,
        description: 'Flat assembly proof: every layer in its paper colour with the cut contours visible.',
      });
      const data = createZip([
        ...entries,
        { name: 'assembly-proof.svg', data: preview },
        { name: 'manifest.json', data: `${JSON.stringify(manifest, null, 2)}\n` },
        { name: 'production-report.txt', data: `${reportText}\n` },
        { name: 'ASSEMBLY.txt', data: `${readme}\n` },
        { name: 'README.txt', data: readmeText(template, size, outlinedLayers) },
      ], options.generatedAt ? { date: new Date(options.generatedAt) } : {});
      return {
        format: 'layers',
        fileName,
        mime: FORMAT_META.layers.mime,
        bytes: data,
        report: withSize(report, data.length),
        preflight,
        scene,
        files: [...entries.map((entry) => entry.name), 'assembly-proof.svg', 'manifest.json', 'production-report.txt', 'ASSEMBLY.txt', 'README.txt'],
      };
    }
  }
}

function withSize(report: ProductionReport, size: number): ProductionReport {
  return { ...report, fileSize: size };
}

function textModeFor(settings: ExportSettings, scene: Scene): ProductionReport['typography']['textMode'] {
  if (!hasLiveText(scene)) return 'none';
  if (settings.format === 'svg' && !settings.outlineText) return 'editable';
  return 'outlined';
}

function sceneUsesFoil(scene: Scene, template: CakeTemplate): boolean {
  const foilMaterials = new Set(template.materials.filter((material) => material.simulatedFoil).map((material) => material.id));
  let found = false;
  if (foilMaterials.has('foil')) {
    // Only claim foil when something actually lands on the foil layer.
    found = planMaterials(scene, template.materials).some((entry) => entry.material === 'foil' && entry.nodeCount > 0);
  }
  return found;
}

function estimateSheets(materials: { cutAreaMm2: number }[]): number {
  const area = materials.reduce((sum, entry) => sum + entry.cutAreaMm2, 0);
  // A4 usable area, then round up to a whole sheet with a 30% cutting margin.
  return Math.max(1, Math.ceil((area * 1.3) / (210 * 297)));
}

function readmeText(template: CakeTemplate, size: { widthMm: number; heightMm: number }, layers: LayerPlan[]): string {
  return [
    'CAKE ATELIER PRO — LAYERED CARDSTOCK PACKAGE',
    '='.repeat(52),
    '',
    `Design      : ${template.name} (${template.id})`,
    `Fingerprint : ${sceneFingerprint({ nodes: layers.flatMap((layer) => layer.scene.nodes), widthMm: size.widthMm, heightMm: size.heightMm, clips: {}, meta: layers[0]?.scene.meta ?? ({} as never) })}`,
    `Size        : ${formatMm(size.widthMm)} × ${formatMm(size.heightMm)} (${formatInch(size.widthMm)} × ${formatInch(size.heightMm)})`,
    '',
    'FILES',
    ...layers.map((layer) => `  layer-${layer.material}.svg   ${layer.label} — ${layer.cutContours.length} cut contour(s), ${layer.scoreContours.length} score line(s)`),
    '  assembly-proof.svg      Every layer in its paper colour with cut contours',
    '  manifest.json           Machine-readable layer list and tolerances',
    '  production-report.txt   Every measurement, font and warning',
    '  ASSEMBLY.txt            Step-by-step assembly',
    '',
    'PRINTING',
    '  • Print at 100%. Every file is in millimetres; do not "fit to page".',
    '  • Magenta line = cut. Dashed blue line = score (fold, do not cut).',
    '  • Verify the first sheet measures the trim width exactly before cutting the set.',
    '',
    'METALLICS',
    '  Gold and silver areas are an RGB gradient that imitates foil. Real metal needs a',
    '  foil stamp or spot colour — hand the foil layer file to your printer for that pass.',
    '',
    `Generated ${new Date().toISOString()}`,
  ].join('\n');
}

export { boldFlatFoil, countCutContours, extractContours, rasterPlan };
