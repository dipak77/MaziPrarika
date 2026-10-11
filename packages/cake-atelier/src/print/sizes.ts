/**
 * @mazi/cake-atelier — physical sizes and raster maths
 *
 * "300 DPI" is a claim about pixel dimensions: 152.4 mm at 300 PPI is 1800 px,
 * not 900 px relabelled. Everything here exists so that claim is arithmetic
 * rather than marketing.
 */

import { MM_PER_INCH, round } from '../geometry.js';

export interface DocumentSize {
  id: string;
  label: string;
  /** Short description for the studio picker. */
  note: string;
  widthMm: number;
  heightMm: number;
  /** Common shape for this size, used for the preview silhouette. */
  shape: 'square' | 'round' | 'rect';
  /** Aspect ratio (w/h) the design must match. */
  aspect: number;
  family: 'cake-topper' | 'cupcake' | 'banner' | 'card' | 'custom';
}

export const MIN_MM = 25;
export const MAX_MM = 600;

const size = (
  id: string,
  label: string,
  note: string,
  widthMm: number,
  heightMm: number,
  shape: DocumentSize['shape'],
  family: DocumentSize['family'],
): DocumentSize => ({
  id,
  label,
  note,
  widthMm: round(widthMm, 2),
  heightMm: round(heightMm, 2),
  shape,
  aspect: round(widthMm / heightMm, 6),
  family,
});

export const DOCUMENT_SIZES: DocumentSize[] = [
  size('topper-4-round', '4 in round topper', 'Smallest common cake topper — cut carefully.', 101.6, 101.6, 'round', 'cake-topper'),
  size('topper-5-round', '5 in round topper', 'Fits a 6 in cake comfortably.', 127, 127, 'round', 'cake-topper'),
  size('topper-6-round', '6 in round topper', 'The studio default: 1/6 sheet of A4.', 152.4, 152.4, 'round', 'cake-topper'),
  size('topper-8-round', '8 in round topper', 'For 8–10 in cakes and shop windows.', 203.2, 203.2, 'round', 'cake-topper'),
  size('topper-10-round', '10 in round topper', 'Large celebration cake.', 254, 254, 'round', 'cake-topper'),
  size('topper-12-round', '12 in round topper', 'Tiered cakes and display boards.', 304.8, 304.8, 'round', 'cake-topper'),
  size('topper-4x6-portrait', '4 × 6 in portrait', 'Tall cake pick.', 101.6, 152.4, 'rect', 'cake-topper'),
  size('topper-5x7-portrait', '5 × 7 in portrait', 'Poster-style cake plaque.', 127, 177.8, 'rect', 'cake-topper'),
  size('topper-6x8-portrait', '6 × 8 in portrait', 'Tall statement piece.', 152.4, 203.2, 'rect', 'cake-topper'),
  size('cupcake-2-5', '2.5 in cupcake disc', 'Cupcake toppers and favour tags.', 63.5, 63.5, 'round', 'cupcake'),
  size('cupcake-2', '2 in cupcake disc', 'Small cupcake discs.', 50.8, 50.8, 'round', 'cupcake'),
  size('banner-4x6-landscape', '4 × 6 in landscape', 'Cake-board banner strip.', 152.4, 101.6, 'rect', 'banner'),
  size('card-a5', 'A5 card (148 × 210 mm)', 'Greeting card insert.', 148, 210, 'rect', 'card'),
  size('card-a4', 'A4 sheet (210 × 297 mm)', 'Full sheet — cut multiple pieces.', 210, 297, 'rect', 'card'),
  size('card-12x12', '12 × 12 in paper (304.8 mm)', 'Scrapbook stock for layered builds.', 304.8, 304.8, 'square', 'card'),
];

export function getSize(id: string): DocumentSize | undefined {
  return DOCUMENT_SIZES.find((entry) => entry.id === id);
}

export interface SizeRequest {
  /** Preset id, or `custom`. */
  presetId?: string;
  widthMm?: number;
  heightMm?: number;
  /** Preferred unit for the UI (display only — the model is always mm). */
  unit?: 'mm' | 'in';
}

export interface ResolvedSize {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  aspect: number;
  shape: DocumentSize['shape'];
  family: DocumentSize['family'];
  warnings: string[];
}

/** Resolve a size request, clamping to safe physical limits. */
export function resolveSize(request: SizeRequest): ResolvedSize {
  const warnings: string[] = [];
  let base: DocumentSize | undefined = request.presetId && request.presetId !== 'custom' ? getSize(request.presetId) : undefined;
  let widthMm = request.widthMm ?? base?.widthMm ?? 152.4;
  let heightMm = request.heightMm ?? base?.heightMm ?? 152.4;

  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm <= 0 || heightMm <= 0) {
    warnings.push('Invalid dimensions supplied; falling back to a 6 in square topper.');
    widthMm = 152.4;
    heightMm = 152.4;
    base = undefined;
  }
  if (widthMm < MIN_MM || heightMm < MIN_MM) {
    warnings.push(`Dimensions below ${MIN_MM} mm are structurally fragile; clamped to the minimum.`);
    widthMm = Math.max(MIN_MM, widthMm);
    heightMm = Math.max(MIN_MM, heightMm);
  }
  if (widthMm > MAX_MM || heightMm > MAX_MM) {
    warnings.push(`Dimensions above ${MAX_MM} mm exceed our validated range; clamped.`);
    widthMm = Math.min(MAX_MM, widthMm);
    heightMm = Math.min(MAX_MM, heightMm);
  }

  return {
    id: base?.id ?? 'custom',
    label: base?.label ?? `${round(widthMm, 1)} × ${round(heightMm, 1)} mm (custom)`,
    widthMm: round(widthMm, 2),
    heightMm: round(heightMm, 2),
    aspect: round(widthMm / heightMm, 6),
    shape: base?.shape ?? (Math.abs(widthMm - heightMm) < 0.5 ? 'square' : 'rect'),
    family: base?.family ?? 'custom',
    warnings,
  };
}

export interface RasterPlan {
  ppi: number;
  widthPx: number;
  heightPx: number;
  megapixels: number;
  /** Estimated uncompressed bytes. */
  estimatedBytes: number;
}

export const DEFAULT_PPI = 300;
export const MAX_PIXELS = 40_000_000;

/** Physical millimetres + PPI ⇒ real pixel dimensions. */
export function rasterPlan(widthMm: number, heightMm: number, ppi = DEFAULT_PPI): RasterPlan {
  const widthPx = Math.max(1, Math.round((widthMm / MM_PER_INCH) * ppi));
  const heightPx = Math.max(1, Math.round((heightMm / MM_PER_INCH) * ppi));
  const megapixels = (widthPx * heightPx) / 1_000_000;
  return {
    ppi,
    widthPx,
    heightPx,
    megapixels: round(megapixels, 3),
    estimatedBytes: widthPx * heightPx * 4,
  };
}

/** Pixels per millimetre for a given PPI (used by the SVG→raster step). */
export function pxPerMm(ppi = DEFAULT_PPI): number {
  return ppi / MM_PER_INCH;
}

export interface DimensionCheck {
  ok: boolean
  errors: string[];
  warnings: string[];
}

/** Validate dimensions against the template's declared aspect ratio. */
export function checkDimensions(
  size: { widthMm: number; heightMm: number },
  templateAspect: number,
  options: { tolerance?: number; ppi?: number; shape?: DocumentSize['shape'] } = {},
): DimensionCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tolerance = options.tolerance ?? 0.02;

  const aspect = size.widthMm / size.heightMm;
  const relative = Math.abs(aspect - templateAspect) / templateAspect;
  if (relative > tolerance) {
    errors.push(
      `Selected size ${round(size.widthMm, 1)}×${round(size.heightMm, 1)} mm has aspect ${round(aspect, 3)} but this template is designed at ${round(templateAspect, 3)}. Choose a matching size or change the template.`,
    );
  }

  const plan = rasterPlan(size.widthMm, size.heightMm, options.ppi ?? DEFAULT_PPI);
  if (plan.widthPx * plan.heightPx > MAX_PIXELS) {
    errors.push(
      `Requested raster is ${plan.widthPx}×${plan.heightPx} px (${plan.megapixels} MP), above the ${MAX_PIXELS / 1_000_000} MP export limit. Reduce the size or the PPI.`,
    );
  }
  if (size.widthMm < 50 || size.heightMm < 50) {
    warnings.push('Very small toppers make layered text hard to read; consider a 5 in size or larger.');
  }
  if (size.widthMm > 305 || size.heightMm > 305) {
    warnings.push('Large pieces on lightweight card will bow — use 300 gsm or mount on a backing board.');
  }
  if (options.shape === 'round' && Math.abs(size.widthMm - size.heightMm) > 0.5) {
    warnings.push('A round cutter needs a square bounding box; the export will be rectangular.');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function formatMm(value: number): string {
  return `${round(value, 1)} mm`;
}

export function formatInch(value: number): string {
  return `${round(value / MM_PER_INCH, 2)} in`;
}
