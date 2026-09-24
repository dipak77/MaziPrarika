/**
 * @mazi/design-schema — the canonical Design JSON (v3).
 *
 * One document format feeds every renderer:
 *   Editor (Konva/canvas) → SVG scene → Print PDF (bleed + crop marks)
 *                        → JPG/WebP social card → Invitation video → Event page
 *
 * Rules that keep print honest:
 *   • all geometry in **millimetres** (print truth), never pixels;
 *   • typography in points with explicit Devanagari font stacks;
 *   • `safeArea`, `bleed`, `cropMarks` are part of the document, not the renderer;
 *   • documents are versioned and migrated forward, never silently mutated.
 */

import { z } from 'zod';

export const DESIGN_SCHEMA_VERSION = 3 as const;

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

/** Brand palette: Ivory, Deep Maroon, Muted Gold, Charcoal. */
export const BRAND_PALETTE = {
  ivory: '#FBF7F0',
  ivoryDeep: '#F3EADB',
  maroon: '#6B1D2A',
  maroonDeep: '#4A121C',
  gold: '#C6A15B',
  goldSoft: '#E4CF9E',
  charcoal: '#221C1A',
  ink: '#3A3230',
  vermilion: '#B4452F',
  peacock: '#1F5C5A',
  leaf: '#4E6B3C',
} as const;

export const TypographyTokenSchema = z.object({
  /** CSS font family string — Devanagari families are listed first. */
  family: z.string().min(1),
  sizePt: z.number().min(6).max(200),
  weight: z.number().min(100).max(900).default(400),
  lineHeight: z.number().min(0.9).max(3).default(1.35),
  letterSpacing: z.number().min(-2).max(8).default(0),
  color: z.string().default(BRAND_PALETTE.charcoal),
  align: z.enum(['left', 'center', 'right', 'justify']).default('center'),
  /** Marathi display text often needs extra leading for matras. */
  trimTrailingSpace: z.boolean().default(true),
});
export type TypographyToken = z.infer<typeof TypographyTokenSchema>;

export const DEFAULT_FONTS = {
  /** Display / headings — traditional Marathi serif. */
  display: '"Noto Serif Devanagari", "Tiro Devanagari Marathi", serif',
  /** Body / invitation prose. */
  body: '"Noto Serif Devanagari", "Noto Sans Devanagari", serif',
  /** UI & numerals. */
  ui: '"Inter", "Noto Sans Devanagari", system-ui, sans-serif',
} as const;

/* ------------------------------------------------------------------ */
/* Elements                                                            */
/* ------------------------------------------------------------------ */

const BaseElement = {
  id: z.string().min(1),
  name: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().min(-360).max(360).default(0),
  opacity: z.number().min(0).max(1).default(1),
  locked: z.boolean().default(false),
  /** Region roles let the layout engine re-flow content intelligently. */
  role: z.enum(['invocation', 'headline', 'narrative', 'request', 'detail', 'footer', 'image', 'qr', 'decoration', 'free']).default('free'),
};

export const TextElementSchema = z.object({
  ...BaseElement,
  type: z.literal('text'),
  text: z.string(),
  typography: TypographyTokenSchema,
  /** CJK-style auto-shrink guard for print safety. */
  autoFit: z.boolean().default(true),
  minSizePt: z.number().min(6).max(48).default(9),
});
export type TextElement = z.infer<typeof TextElementSchema>;

export const ImageElementSchema = z.object({
  ...BaseElement,
  type: z.literal('image'),
  src: z.string(),
  fit: z.enum(['cover', 'contain']).default('cover'),
  /** Physical resolution check inputs (print gate). */
  sourceWidthPx: z.number().int().positive().optional(),
  sourceHeightPx: z.number().int().positive().optional(),
  cornerRadiusMm: z.number().min(0).default(0),
  frameColor: z.string().optional(),
});
export type ImageElement = z.infer<typeof ImageElementSchema>;

export const ShapeElementSchema = z.object({
  ...BaseElement,
  type: z.literal('shape'),
  shape: z.enum(['rect', 'circle', 'line', 'border', 'motif', 'divider', 'paisley', 'custom-path']),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidthMm: z.number().min(0).default(0.3),
  path: z.string().optional(),
  /** Cultural motif identifiers resolved by the renderer's motif library. */
  motif: z.enum(['warli', 'paithani', 'maharashtrian-border', 'mandala', 'temple-arch', 'none']).default('none'),
});
export type ShapeElement = z.infer<typeof ShapeElementSchema>;

export const QrElementSchema = z.object({
  ...BaseElement,
  type: z.literal('qr'),
  payload: z.string(),
  /** Quiet zone in millimetres — scanners need 4 modules minimum. */
  quietZoneMm: z.number().min(1).default(2),
  foreground: z.string().default(BRAND_PALETTE.charcoal),
  background: z.string().default('#FFFFFF'),
  /** Never fake a scannable code: the renderer encodes from `payload`. */
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
});
export type QrElement = z.infer<typeof QrElementSchema>;

export type GroupElement = {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  role: 'invocation' | 'headline' | 'narrative' | 'request' | 'detail' | 'footer' | 'image' | 'qr' | 'decoration' | 'free';
  type: 'group';
  children: DesignElement[];
};

export type DesignElement = TextElement | ImageElement | ShapeElement | QrElement | GroupElement;

export const GroupElementSchema: z.ZodType<GroupElement, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.object({
    ...BaseElement,
    type: z.literal('group'),
    children: z.array(DesignElementSchema).default([]),
  }),
) as unknown as z.ZodType<GroupElement, z.ZodTypeDef, unknown>;

export const DesignElementSchema: z.ZodType<DesignElement, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.union([
    TextElementSchema as unknown as z.ZodType<DesignElement>,
    ImageElementSchema as unknown as z.ZodType<DesignElement>,
    ShapeElementSchema as unknown as z.ZodType<DesignElement>,
    QrElementSchema as unknown as z.ZodType<DesignElement>,
    GroupElementSchema,
  ]),
);

/* ------------------------------------------------------------------ */
/* Page & document                                                     */
/* ------------------------------------------------------------------ */

export const PagePresetSchema = z.enum(['invitation-5x7', 'invitation-a5', 'invitation-square', 'card-a6', 'poster-a4', 'story-9x16', 'web-hero']);
export type PagePreset = z.infer<typeof PagePresetSchema>;

export interface PageSizeMm {
  widthMm: number;
  heightMm: number;
  /** Print bleed on all sides (3mm industry default). */
  bleedMm: number;
  cropMarks: boolean;
  dpi: number;
  /** 'cmyk-safe' warns when a colour cannot be reproduced in CMYK. */
  colorMode: 'cmyk-safe' | 'rgb';
}

export const PAGE_PRESETS: Record<PagePreset, PageSizeMm> = {
  'invitation-5x7': { widthMm: 127, heightMm: 178, bleedMm: 3, cropMarks: true, dpi: 300, colorMode: 'cmyk-safe' },
  'invitation-a5': { widthMm: 148, heightMm: 210, bleedMm: 3, cropMarks: true, dpi: 300, colorMode: 'cmyk-safe' },
  'invitation-square': { widthMm: 152.4, heightMm: 152.4, bleedMm: 3, cropMarks: true, dpi: 300, colorMode: 'cmyk-safe' },
  'card-a6': { widthMm: 105, heightMm: 148, bleedMm: 3, cropMarks: true, dpi: 300, colorMode: 'cmyk-safe' },
  'poster-a4': { widthMm: 210, heightMm: 297, bleedMm: 3, cropMarks: true, dpi: 300, colorMode: 'cmyk-safe' },
  'story-9x16': { widthMm: 108, heightMm: 192, bleedMm: 0, cropMarks: false, dpi: 144, colorMode: 'rgb' },
  'web-hero': { widthMm: 160, heightMm: 90, bleedMm: 0, cropMarks: false, dpi: 144, colorMode: 'rgb' },
};

export const SAFE_MARGIN_MM = 8;
export const GOLD_FOIL_MIN_STROKE_MM = 0.35;

export const DesignDocumentSchema = z.object({
  version: z.literal(DESIGN_SCHEMA_VERSION).default(DESIGN_SCHEMA_VERSION),
  id: z.string().min(1),
  name: z.string().min(1),
  /** Template the document was instanced from (provenance for designers). */
  templateId: z.string().optional(),
  preset: PagePresetSchema.default('invitation-5x7'),
  page: z.object({
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
    bleedMm: z.number().min(0).max(10),
    cropMarks: z.boolean(),
    dpi: z.number().min(72).max(600),
    colorMode: z.enum(['cmyk-safe', 'rgb']),
    safeMarginMm: z.number().min(0).max(30).default(SAFE_MARGIN_MM),
    background: z.string().default(BRAND_PALETTE.ivory),
  }),
  elements: z.array(DesignElementSchema),
  theme: z.object({
    palette: z.record(z.string(), z.string()).default({}),
    fonts: z.record(z.string(), z.string()).default({}),
    style: z.enum(['traditional', 'maharashtrian', 'royal', 'paithani', 'warli', 'modern', 'minimal', 'premium']).default('traditional'),
  }),
  meta: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string().optional(),
    /** Print technician notes: paper, foil, finishing. */
    print: z.object({
      paper: z.string().optional(),
      finishing: z.array(z.string()).default([]),
      goldFoil: z.boolean().default(false),
      emboss: z.boolean().default(false),
    }).default({ finishing: [], goldFoil: false, emboss: false }),
  }),
  /** Bindings for template variables: `{{bride.name}}` etc. */
  bindings: z.record(z.string(), z.string()).default({}),
});

export type DesignDocument = z.infer<typeof DesignDocumentSchema>;

/* ------------------------------------------------------------------ */
/* Factories, parsing, migration                                       */
/* ------------------------------------------------------------------ */

export function createBlankDesign(args: {
  id: string;
  name: string;
  preset?: PagePreset;
  style?: DesignDocument['theme']['style'];
  templateId?: string;
  createdBy?: string;
}): DesignDocument {
  const preset = args.preset ?? 'invitation-5x7';
  const size = PAGE_PRESETS[preset];
  const now = new Date().toISOString();
  return {
    version: DESIGN_SCHEMA_VERSION,
    id: args.id,
    name: args.name,
    ...(args.templateId ? { templateId: args.templateId } : {}),
    preset,
    page: {
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      bleedMm: size.bleedMm,
      cropMarks: size.cropMarks,
      dpi: size.dpi,
      colorMode: size.colorMode,
      safeMarginMm: SAFE_MARGIN_MM,
      background: BRAND_PALETTE.ivory,
    },
    elements: [],
    theme: {
      palette: { primary: BRAND_PALETTE.maroon, accent: BRAND_PALETTE.gold, surface: BRAND_PALETTE.ivory, text: BRAND_PALETTE.charcoal },
      fonts: { display: DEFAULT_FONTS.display, body: DEFAULT_FONTS.body, ui: DEFAULT_FONTS.ui },
      style: args.style ?? 'traditional',
    },
    meta: {
      createdAt: now,
      updatedAt: now,
      ...(args.createdBy ? { createdBy: args.createdBy } : {}),
      print: { finishing: [], goldFoil: false, emboss: false },
    },
    bindings: {},
  };
}

export interface DesignParseResult {
  ok: boolean;
  design?: DesignDocument;
  errors: string[];
  warnings: string[];
}

/** Parse + structurally validate a stored/edited document. */
function describeIssue(issue: z.ZodIssue): string {
  const where = issue.path.join('.') || '(root)';
  const unionErrors = (issue as { unionErrors?: z.ZodError[] }).unionErrors;
  if (unionErrors?.length) {
    const variants = unionErrors.map((variantError) => {
      const first = variantError.issues[0];
      const detail = first ? `${first.path.slice(-1).join('.')}: ${first.message}` : 'जुळले नाही';
      return `${first?.path[1] ?? '?'} → ${detail}`;
    });
    return `${where}: कोणताही घटक प्रकार जुळला नाही (${variants.join(' | ')})`;
  }
  return `${where}: ${issue.message}`;
}

export function parseDesign(input: unknown): DesignParseResult {
  const migrated = migrateDesign(input);
  const parsed = DesignDocumentSchema.safeParse(migrated);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map(describeIssue), warnings: [] };
  }
  return { ok: true, design: parsed.data, errors: [], warnings: layoutWarnings(parsed.data) };
}

/** Forward-migrate older documents; unknown/future versions are rejected loudly. */
export function migrateDesign(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input;
  const doc = { ...(input as Record<string, unknown>) };
  const version = Number(doc.version ?? 2);
  if (version > DESIGN_SCHEMA_VERSION) {
    throw new Error(`Design version ${version} is newer than this build supports (${DESIGN_SCHEMA_VERSION}).`);
  }
  if (version < 2) {
    // v1: pixels at 96dpi, no bleed information.
    const page = (doc.page ?? {}) as Record<string, number>;
    const pxToMm = (px: number) => Number(((px / 96) * 25.4).toFixed(2));
    doc.page = {
      widthMm: pxToMm(page.width ?? 480), heightMm: pxToMm(page.height ?? 672),
      bleedMm: 0, cropMarks: false, dpi: 96, colorMode: 'rgb', safeMarginMm: 5,
    };
    doc.elements = ((doc.elements as Array<Record<string, unknown>>) ?? []).map((el) => ({
      ...el,
      x: pxToMm(Number(el.x ?? 0)), y: pxToMm(Number(el.y ?? 0)),
      width: pxToMm(Number(el.width ?? 100)), height: pxToMm(Number(el.height ?? 40)),
    }));
    doc.version = 2;
  }
  if (version < 3) {
    // v2: no roles/bindings, flat typography fields, `source`/`strokeWidth` names.
    doc.elements = ((doc.elements as Array<Record<string, unknown>>) ?? []).map((el) => upgradeElementToV3(el));
    doc.bindings = {};
    doc.meta = doc.meta ?? { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    doc.version = DESIGN_SCHEMA_VERSION;
  }
  return doc;
}

/** Map one pre-v3 element onto the v3 shape without losing user intent. */
function upgradeElementToV3(el: Record<string, unknown>): Record<string, unknown> {
  const upgraded: Record<string, unknown> = {
    role: 'free', locked: false, opacity: 1, rotation: 0, ...el,
  };

  if (el.type === 'text' && !el.typography) {
    upgraded.typography = {
      family: (el.fontFamily as string | undefined) ?? DEFAULT_FONTS.body,
      sizePt: Number(el.fontSizePt ?? 12),
      weight: Number(el.fontWeight ?? 400),
      lineHeight: Number(el.lineHeight ?? 1.45),
      letterSpacing: Number(el.letterSpacing ?? 0),
      color: (el.color as string | undefined) ?? BRAND_PALETTE.charcoal,
      align: (el.align as string | undefined) ?? 'center',
      trimTrailingSpace: true,
    };
  }
  if (el.type === 'image' && !el.src && typeof el.source === 'string') upgraded.src = el.source;
  if (el.type === 'shape' && el.strokeWidthMm === undefined && el.strokeWidth !== undefined) {
    upgraded.strokeWidthMm = Number(el.strokeWidth);
  }
  if (el.type === 'group' && Array.isArray(el.children)) {
    upgraded.children = (el.children as Array<Record<string, unknown>>).map((child) => upgradeElementToV3(child));
  }
  return upgraded;
}

/* ------------------------------------------------------------------ */
/* Pre-flight checks (the print gate)                                  */
/* ------------------------------------------------------------------ */

export interface LayoutIssue {
  elementId: string;
  severity: 'error' | 'warning';
  code: 'out-of-safe-area' | 'missing-bleed-art' | 'low-resolution' | 'thin-gold-stroke' | 'cmyk-unsafe' | 'qr-too-small' | 'empty-text';
  message: string;
}

/** All elements inside page + bleed, ignoring locked decoration layers is *not* allowed. */
export function layoutWarnings(design: DesignDocument): string[] {
  const warnings: string[] = [];
  const { page } = design;
  for (const el of design.elements) {
    if (el.x < -page.bleedMm || el.y < -page.bleedMm) {
      warnings.push(`${el.name ?? el.id}: क्षेत्राबाहेर (bleed मर्यादेपलीकडे)`);
    }
    if (el.x + el.width > page.widthMm + page.bleedMm || el.y + el.height > page.heightMm + page.bleedMm) {
      warnings.push(`${el.name ?? el.id}: पृष्ठाच्या बाहेर जाते`);
    }
  }
  return warnings;
}

/** Every printable colour a element carries — text ink, stroke and fill. */
function coloursOf(el: DesignDocument['elements'][number]): string[] {
  const colours: string[] = [];
  if (el.type === 'text') colours.push(el.typography.color);
  if (el.type === 'shape') {
    if (typeof el.fill === 'string') colours.push(el.fill);
    if (typeof el.stroke === 'string') colours.push(el.stroke);
  }
  if (el.type === 'qr') colours.push(el.foreground, el.background);
  if (el.type === 'group') for (const child of el.children) colours.push(...coloursOf(child));
  return colours.filter((c) => typeof c === 'string' && c.startsWith('#'));
}

export function preflight(design: DesignDocument): LayoutIssue[] {
  const issues: LayoutIssue[] = [];
  const { page } = design;
  const safe = page.safeMarginMm;
  const fullW = page.widthMm + page.bleedMm * 2;
  const fullH = page.heightMm + page.bleedMm * 2;

  for (const el of design.elements) {
    const x = el.x + page.bleedMm;
    const y = el.y + page.bleedMm;

    if (el.role !== 'decoration' && el.role !== 'image') {
      if (x < safe || y < safe || x + el.width > fullW - safe || y + el.height > fullH - safe) {
        issues.push({
          elementId: el.id, severity: 'warning', code: 'out-of-safe-area',
          message: `${el.name ?? el.id}: सुरक्षित क्षेत्राबाहेर — कापताना काही भाग जाऊ शकतो`,
        });
      }
    }

    // A photo that runs off the page edge must be extended into the bleed,
    // otherwise the trimmer can leave a white sliver.
    if (el.type === 'image') {
      const touchesEdge =
        el.x <= 1 || el.y <= 1 ||
        el.x + el.width >= page.widthMm - 1 || el.y + el.height >= page.heightMm - 1;
      const coversBleed =
        el.x <= -page.bleedMm + 0.5 && el.y <= -page.bleedMm + 0.5 &&
        el.x + el.width >= page.widthMm + page.bleedMm - 0.5 &&
        el.y + el.height >= page.heightMm + page.bleedMm - 0.5;
      if (page.bleedMm > 0 && touchesEdge && !coversBleed) {
        issues.push({
          elementId: el.id, severity: 'warning', code: 'missing-bleed-art',
          message: `${el.name ?? el.id}: फोटो कडेपर्यंत आहे पण bleed (${page.bleedMm}मिमी) पर्यंत पोहोचत नाही — कापताना पांढरी धार दिसू शकते`,
        });
      }
    }

    if (el.type === 'image' && el.sourceWidthPx && el.sourceHeightPx) {
      const dpiX = el.sourceWidthPx / (el.width / 25.4);
      const dpiY = el.sourceHeightPx / (el.height / 25.4);
      const effective = Math.min(dpiX, dpiY);
      if (effective < 200) {
        issues.push({
          elementId: el.id, severity: 'error', code: 'low-resolution',
          message: `${el.name ?? el.id}: फोटो ठराव ${Math.round(effective)} DPI — छपाईसाठी ३०० DPI आवश्यक`,
        });
      } else if (effective < 300) {
        issues.push({
          elementId: el.id, severity: 'warning', code: 'low-resolution',
          message: `${el.name ?? el.id}: फोटो ठराव ${Math.round(effective)} DPI — ३०० DPI शिफारस`,
        });
      }
    }

    if (el.type === 'shape' && design.meta.print.goldFoil && el.strokeWidthMm > 0 && el.strokeWidthMm < GOLD_FOIL_MIN_STROKE_MM) {
      issues.push({
        elementId: el.id, severity: 'warning', code: 'thin-gold-stroke',
        message: `${el.name ?? el.id}: गोल्ड फॉइलसाठी रेषा ${GOLD_FOIL_MIN_STROKE_MM}मिमी पेक्षा जाड असावी`,
      });
    }

    if (el.type === 'qr') {
      if (el.width < 20) {
        issues.push({
          elementId: el.id, severity: 'error', code: 'qr-too-small',
          message: `${el.name ?? el.id}: QR कोड २० मिमी पेक्षा मोठा असावा`,
        });
      }
    }

    if (el.type === 'text' && el.text.trim().length === 0) {
      issues.push({ elementId: el.id, severity: 'warning', code: 'empty-text', message: `${el.name ?? el.id}: मजकूर रिकामा` });
    }

    if (page.colorMode === 'cmyk-safe') {
      for (const colour of coloursOf(el)) {
        if (!isCmykSafe(colour)) {
          issues.push({
            elementId: el.id, severity: 'warning', code: 'cmyk-unsafe',
            message: `${el.name ?? el.id}: रंग ${colour} CMYK मध्ये हुबेहूब छापता येत नाही — जवळचा रंग वापरा`,
          });
        }
      }
    }
  }
  return issues;
}

/** Fluorescent/RGB-only hexes that printers cannot reproduce faithfully. */
const CMYK_RISKY = new Set(['#00FFFF', '#FF00FF', '#00FF00', '#0000FF', '#FF0000', '#7FFF00', '#FF7F50']);

export function isCmykSafe(hex: string): boolean {
  const normalised = hex.toUpperCase();
  if (CMYK_RISKY.has(normalised)) return false;
  // Very saturated greens/blues are the usual disappointment in CMYK.
  const match = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/.exec(normalised);
  if (!match) return true;
  const [r, g, b] = [match[1]!, match[2]!, match[3]!].map((v) => parseInt(v, 16)) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return saturation < 0.92;
}

/* ------------------------------------------------------------------ */
/* Template presets — curated premium starters (designer-authored)     */
/* ------------------------------------------------------------------ */

export interface TemplatePreset {
  id: string;
  name: string;
  style: DesignDocument['theme']['style'];
  preset: PagePreset;
  /** Palette overrides applied over the brand palette. */
  palette: Record<string, string>;
  motifs: ShapeElement['motif'][];
  fontTheme: 'traditional-serif' | 'temple' | 'royal' | 'warli' | 'modern-minimal' | 'paithani';
  tags: string[];
}

const P = BRAND_PALETTE;

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'tpl-paithani-royal', name: 'पैठणी रॉयल', style: 'paithani', preset: 'invitation-5x7',
    palette: { primary: P.maroon, accent: P.gold, surface: P.ivory, text: P.charcoal },
    motifs: ['paithani', 'maharashtrian-border'], fontTheme: 'paithani', tags: ['विवाह', 'प्रीमियम', 'गोल्ड फॉइल'],
  },
  {
    id: 'tpl-warli-heritage', name: 'वारली वारसा', style: 'warli', preset: 'invitation-5x7',
    palette: { primary: P.charcoal, accent: P.vermilion, surface: '#F6EFE3', text: P.charcoal },
    motifs: ['warli'], fontTheme: 'warli', tags: ['विवाह', 'हस्तकला', 'आदिवासी'],
  },
  {
    id: 'tpl-temple-arch', name: 'देवालय कमान', style: 'traditional', preset: 'invitation-a5',
    palette: { primary: P.maroonDeep, accent: P.gold, surface: P.ivory, text: P.ink },
    motifs: ['temple-arch', 'mandala'], fontTheme: 'temple', tags: ['सत्यनारायण पूजा', 'गृहप्रवेश'],
  },
  {
    id: 'tpl-mandala-gold', name: 'मंडल सुवर्ण', style: 'royal', preset: 'invitation-square',
    palette: { primary: P.maroon, accent: P.goldSoft, surface: '#2A1A16', text: '#F7EEDC' },
    motifs: ['mandala'], fontTheme: 'royal', tags: ['रिसेप्शन', 'स्वागत समारंभ'],
  },
  {
    id: 'tpl-simple-ivory', name: 'साधे हस्तीदंत', style: 'minimal', preset: 'invitation-5x7',
    palette: { primary: P.ink, accent: P.gold, surface: P.ivory, text: P.charcoal },
    motifs: ['none'], fontTheme: 'modern-minimal', tags: ['सर्व कार्यक्रम', 'साधे'],
  },
  {
    id: 'tpl-birthday-kids', name: 'बाल वाढदिवस करंडा', style: 'modern', preset: 'invitation-square',
    palette: { primary: '#C2445A', accent: '#F0B94A', surface: '#FFF7E8', text: '#3A3230' },
    motifs: ['none'], fontTheme: 'modern-minimal', tags: ['वाढदिवस', 'मुले'],
  },
  {
    id: 'tpl-gruhapravesh-bless', name: 'गृहप्रवेश आशीर्वाद', style: 'maharashtrian', preset: 'invitation-a5',
    palette: { primary: '#8A3B1E', accent: P.gold, surface: '#FBF3E4', text: P.charcoal },
    motifs: ['maharashtrian-border', 'temple-arch'], fontTheme: 'traditional-serif', tags: ['गृहप्रवेश', 'पूजा'],
  },
  {
    id: 'tpl-naming-lotus', name: 'नामकरण कमळ', style: 'traditional', preset: 'invitation-square',
    palette: { primary: '#8C2B45', accent: '#D8A24A', surface: '#FFF9F0', text: '#332B29' },
    motifs: ['mandala'], fontTheme: 'traditional-serif', tags: ['नामकरण', 'अन्नप्राशन'],
  },
  {
    id: 'tpl-thread-gold', name: 'उपनयन सुवर्ण', style: 'traditional', preset: 'invitation-5x7',
    palette: { primary: P.maroonDeep, accent: P.gold, surface: '#FCF6EA', text: P.ink },
    motifs: ['maharashtrian-border'], fontTheme: 'temple', tags: ['मुंज', 'उपनयन'],
  },
  {
    id: 'tpl-sangeet-night', name: 'संगीत रात्र', style: 'modern', preset: 'story-9x16',
    palette: { primary: '#1B1B2F', accent: '#E0B75B', surface: '#101024', text: '#F4EAD8' },
    motifs: ['mandala'], fontTheme: 'modern-minimal', tags: ['संगीत', 'सोशल मीडिया'],
  },
  {
    id: 'tpl-haldi-marigold', name: 'हळदी झेंडू', style: 'modern', preset: 'invitation-5x7',
    palette: { primary: '#C97B14', accent: '#E8B33C', surface: '#FFF6E0', text: '#40352A' },
    motifs: ['none'], fontTheme: 'modern-minimal', tags: ['हळदी', 'मेहंदी'],
  },
  {
    id: 'tpl-corporate-clean', name: 'कॉर्पोरेट शुद्ध', style: 'modern', preset: 'poster-a4',
    palette: { primary: '#15324F', accent: '#5B8FB9', surface: '#FFFFFF', text: '#1C2733' },
    motifs: ['none'], fontTheme: 'modern-minimal', tags: ['कॉर्पोरेट', 'संस्थात्मक'],
  },
];

export function getTemplatePreset(id: string): TemplatePreset | undefined {
  return TEMPLATE_PRESETS.find((t) => t.id === id);
}

/** Instance a template preset into an editable document. */
export function designFromTemplate(presetId: string, args: { id: string; name: string; createdBy?: string }): DesignDocument {
  const tpl = getTemplatePreset(presetId);
  if (!tpl) throw new Error(`अज्ञात टेम्पलेट: ${presetId} (unknown template id)`);
  const doc = createBlankDesign({
    id: args.id,
    name: args.name,
    preset: tpl.preset,
    style: tpl.style,
    templateId: presetId,
    ...(args.createdBy ? { createdBy: args.createdBy } : {}),
  });
  doc.theme.palette = { ...doc.theme.palette, ...tpl.palette };
  doc.page.background = tpl.palette.surface ?? doc.page.background;
  const margin = doc.page.safeMarginMm;
  const inner = {
    x: margin, y: margin,
    width: doc.page.widthMm - margin * 2,
    height: doc.page.heightMm - margin * 2,
  };
  // Decorative motifs sit in the bleed, behind content.
  if (tpl.motifs.some((m) => m !== 'none')) {
    doc.elements.push({
      id: 'motif-border', name: 'सजावट चौकट', type: 'shape', shape: 'motif',
      motif: tpl.motifs[0] ?? 'none',
      x: 0, y: 0, width: doc.page.widthMm, height: doc.page.heightMm,
      rotation: 0, opacity: 1, locked: true, role: 'decoration',
      stroke: tpl.palette.accent ?? BRAND_PALETTE.gold, strokeWidthMm: 0.6,
    });
  }
  const slots: Array<{ id: string; role: TextElement['role']; h: number; sizePt: number; weight: number }> = [
    { id: 'invocation', role: 'invocation', h: 10, sizePt: 11, weight: 500 },
    { id: 'headline', role: 'headline', h: 18, sizePt: 26, weight: 700 },
    { id: 'narrative', role: 'narrative', h: 70, sizePt: 13, weight: 400 },
    { id: 'request', role: 'request', h: 16, sizePt: 12, weight: 500 },
    { id: 'details', role: 'detail', h: 26, sizePt: 11, weight: 400 },
    { id: 'footer', role: 'footer', h: 8, sizePt: 9, weight: 400 },
  ];
  const totalH = slots.reduce((s, x) => s + x.h, 0);
  let cursor = inner.y + (inner.height - totalH) / 2 - 6;
  for (const slot of slots) {
    doc.elements.push({
      id: slot.id,
      name: slot.role,
      type: 'text',
      text: '',
      role: slot.role,
      x: inner.x, y: cursor, width: inner.width, height: slot.h,
      rotation: 0, opacity: 1, locked: false,
      autoFit: true, minSizePt: 9,
      typography: {
        family: tpl.fontTheme === 'modern-minimal' ? DEFAULT_FONTS.ui : DEFAULT_FONTS.display,
        sizePt: slot.sizePt, weight: slot.weight,
        lineHeight: 1.45, letterSpacing: 0,
        color: tpl.palette.text ?? BRAND_PALETTE.charcoal,
        align: 'center', trimTrailingSpace: true,
      },
    });
    cursor += slot.h;
  }
  return doc;
}
