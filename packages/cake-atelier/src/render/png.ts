/**
 * @mazi/cake-atelier — raster output (Node only)
 *
 * Rasterisation runs through resvg, which implements the SVG 1.1 static subset
 * with real font shaping via the bundled TTFs. The pixel dimensions are computed
 * from the *physical* size and the requested PPI, so "300 DPI" is arithmetic
 * rather than a label: a 152.4 mm topper is 1800 px wide, not a 900 px image
 * that a print dialog rescales.
 */

import { Resvg } from '@resvg/resvg-js';

import { renderSceneToSvg, type SvgRenderOptions } from './svg.js';
import { rasterPlan, type RasterPlan } from '../print/sizes.js';
import { outlineScene, resolveFontDir } from '../typography/outline.js';
import type { Scene } from '../scene.js';

export interface PngOptions {
  ppi?: number;
  /** Background colour when `transparent` is false. */
  background?: string;
  transparent?: boolean;
  /** Physical size to render at (defaults to the scene size). */
  widthMm?: number;
  heightMm?: number;
  /** Extra SVG options: bleed, guides, cutline. */
  svg?: SvgRenderOptions;
  /** Convert text to outlines before rasterising (removes any font dependency). */
  outlineText?: boolean;
}

export interface PngResult {
  data: Uint8Array;
  plan: RasterPlan;
  /** SVG actually rasterised — returned so callers can cache or debug it. */
  svg: string;
}

/** Physical size of the scene after bleed is added. */
export function scenePhysicalSize(scene: Scene, bleedMm = 0): { widthMm: number; heightMm: number } {
  return { widthMm: scene.widthMm + bleedMm * 2, heightMm: scene.heightMm + bleedMm * 2 };
}

export async function renderSceneToPng(scene: Scene, options: PngOptions = {}): Promise<PngResult> {
  const ppi = options.ppi ?? 300;
  const bleed = options.svg?.bleedMm ?? 0;
  const size = {
    widthMm: options.widthMm ?? scene.widthMm + bleed * 2,
    heightMm: options.heightMm ?? scene.heightMm + bleed * 2,
  };
  const plan = rasterPlan(size.widthMm, size.heightMm, ppi);

  // Outline the text so the raster never depends on a font being found at run
  // time — the shapes are already in the scene.
  const prepared = options.outlineText === false ? scene : outlineScene(scene).scene;
  const svg = renderSceneToSvg(prepared, {
    includeBackground: options.transparent === false,
    title: scene.meta.projectName,
    ...(options.svg ?? {}),
  });

  const renderer = new Resvg(svg, {
    fitTo: { mode: 'width', value: plan.widthPx },
    background: options.transparent === false ? options.background ?? '#ffffff' : undefined,
    font: { loadSystemFonts: false, fontDirs: [resolveFontDir()], defaultFontFamily: 'Poppins' },
    shapeRendering: 2,
    textRendering: 1,
    imageRendering: 0,
    logLevel: 'error',
  });

  const png = renderer.render().asPng();
  if (!png || png.length < 8) {
    throw new Error('cake-atelier: rasterisation produced no image data.');
  }
  return { data: new Uint8Array(png), plan, svg };
}

/**
 * Render every material layer of a layered build as its own PNG.
 * Used for the layered proof sheet in the studio.
 */
export async function renderLayersToPng(
  layers: { material: string; scene: Scene }[],
  options: PngOptions = {},
): Promise<{ material: string; data: Uint8Array; plan: RasterPlan }[]> {
  const out: { material: string; data: Uint8Array; plan: RasterPlan }[] = [];
  for (const layer of layers) {
    const result = await renderSceneToPng(layer.scene, { ...options, transparent: true, outlineText: true });
    out.push({ material: layer.material, data: result.data, plan: result.plan });
  }
  return out;
}

/**
 * Outline every text node and report which faces were used. The PDF writer and
 * the cut-file writer both start here, so neither can ever depend on a font
 * being installed on the machine that opens the file.
 */
export function prepareForPrint(scene: Scene): { scene: Scene; fonts: string[]; missing: string[] } {
  const { scene: outlined, report } = outlineScene(scene);
  return {
    scene: outlined,
    fonts: report.faces,
    missing: [...new Set(report.missingGlyphs.flatMap((entry) => entry.characters))],
  };
}

export const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

export function isPng(data: Uint8Array): boolean {
  return PNG_MAGIC.every((byte, index) => data[index] === byte);
}
