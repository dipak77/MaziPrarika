import { describe, expect, it } from 'vitest';

import {
  BRAND_PALETTE,
  DESIGN_SCHEMA_VERSION,
  GOLD_FOIL_MIN_STROKE_MM,
  PAGE_PRESETS,
  SAFE_MARGIN_MM,
  TEMPLATE_PRESETS,
  createBlankDesign,
  designFromTemplate,
  getTemplatePreset,
  isCmykSafe,
  layoutWarnings,
  migrateDesign,
  parseDesign,
  preflight,
  type DesignDocument,
} from './index.js';

const ids = { id: 'd1', name: 'चाचणी पत्रिका' };

function withText(
  design: DesignDocument,
  overrides: { color?: string; x?: number; y?: number; width?: number } = {},
): DesignDocument {
  return {
    ...design,
    elements: [
      ...design.elements,
      {
        id: 'text-1', name: 'मजकूर', type: 'text', role: 'narrative',
        x: overrides.x ?? 20, y: overrides.y ?? 40, width: overrides.width ?? 80, height: 20,
        rotation: 0, opacity: 1, locked: false, text: 'शुभ मंगल',
        autoFit: true, minSizePt: 9,
        typography: {
          family: 'Noto Serif Devanagari', sizePt: 14, weight: 400,
          lineHeight: 1.45, letterSpacing: 0,
          color: overrides.color ?? BRAND_PALETTE.charcoal,
          align: 'center', trimTrailingSpace: true,
        },
      },
    ],
  };
}

describe('design-schema/page presets', () => {
  it('ships print presets with bleed, crop marks, 300dpi and cmyk-safe defaults', () => {
    const print = PAGE_PRESETS['invitation-5x7'];
    expect(print.widthMm).toBe(127);
    expect(print.heightMm).toBe(178);
    expect(print.bleedMm).toBe(3);
    expect(print.cropMarks).toBe(true);
    expect(print.dpi).toBe(300);
    expect(print.colorMode).toBe('cmyk-safe');
  });

  it('keeps screen presets bleed-free and rgb', () => {
    for (const preset of ['story-9x16', 'web-hero'] as const) {
      expect(PAGE_PRESETS[preset].bleedMm).toBe(0);
      expect(PAGE_PRESETS[preset].cropMarks).toBe(false);
      expect(PAGE_PRESETS[preset].colorMode).toBe('rgb');
    }
    expect(PAGE_PRESETS['story-9x16'].heightMm).toBeGreaterThan(PAGE_PRESETS['story-9x16'].widthMm);
  });

  it('creates a blank design carrying brand palette, fonts and safe margin', () => {
    const design = createBlankDesign({ ...ids, preset: 'invitation-a5', style: 'paithani' });
    expect(design.version).toBe(DESIGN_SCHEMA_VERSION);
    expect(design.page.safeMarginMm).toBe(SAFE_MARGIN_MM);
    expect(design.theme.palette.primary).toBe(BRAND_PALETTE.maroon);
    expect(design.theme.palette.accent).toBe(BRAND_PALETTE.gold);
    expect(design.theme.style).toBe('paithani');
    expect(design.elements).toEqual([]);
    expect(design.meta.print.goldFoil).toBe(false);
  });
});

describe('design-schema/parsing & migration', () => {
  it('round-trips a valid v3 document', () => {
    const design = withText(createBlankDesign(ids));
    const result = parseDesign(JSON.parse(JSON.stringify(design)));
    expect(result.ok).toBe(true);
    expect(result.design?.elements).toHaveLength(1);
    expect(result.design?.elements[0]?.type).toBe('text');
  });

  it('rejects a document whose element type is unknown', () => {
    const design = createBlankDesign(ids) as unknown as { elements: unknown[] };
    design.elements.push({ id: 'x', type: 'hologram', x: 0, y: 0, width: 10, height: 10 });
    const result = parseDesign(design);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/elements/);
  });

  it('refuses to silently drop a future schema version', () => {
    const future = { ...createBlankDesign(ids), version: DESIGN_SCHEMA_VERSION + 1 };
    expect(() => migrateDesign(future)).toThrow(/newer than this build/);
  });

  it('migrates v1 pixel documents to millimetres with print defaults', () => {
    const v1 = {
      version: 1,
      id: 'legacy',
      name: 'जुनी पत्रिका',
      page: { width: 480, height: 672 },
      elements: [{ id: 't', type: 'text', x: 96, y: 96, width: 96, height: 48, text: 'जुनी' }],
    };
    const migrated = migrateDesign(v1) as Record<string, unknown>;
    const page = migrated.page as Record<string, number | string>;
    expect(migrated.version).toBe(DESIGN_SCHEMA_VERSION);
    // 480px @96dpi = 127mm, 672px = 177.8mm → the 5×7 invitation.
    expect(page.widthMm).toBeCloseTo(127, 1);
    expect(page.heightMm).toBeCloseTo(177.8, 1);
    expect(page.colorMode).toBe('rgb');

    const element = (migrated.elements as Array<Record<string, unknown>>)[0]!;
    expect(element.x).toBeCloseTo(25.4, 1);
    expect(element.width).toBeCloseTo(25.4, 1);
    expect(element.role).toBe('free');
    expect(element.locked).toBe(false);
    expect(element.opacity).toBe(1);
  });

  it('migrates v2 documents by adding roles and bindings without touching geometry', () => {
    const v2 = {
      version: 2,
      id: 'v2',
      name: 'v2 doc',
      preset: 'invitation-5x7',
      page: { widthMm: 127, heightMm: 178, bleedMm: 3, cropMarks: true, dpi: 300, colorMode: 'cmyk-safe', safeMarginMm: 8, background: '#FBF7F0' },
      elements: [{ id: 't', type: 'text', x: 10, y: 10, width: 50, height: 10, text: 'क' }],
      theme: { palette: {}, fonts: {}, style: 'traditional' },
      meta: { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    };
    const result = parseDesign(v2);
    expect(result.ok).toBe(true);
    expect(result.design?.elements[0]?.x).toBe(10);
    expect(result.design?.elements[0]?.role).toBe('free');
    expect(result.design?.bindings).toEqual({});
  });

  it('reports human-readable layout warnings for out-of-page elements', () => {
    const design = withText(createBlankDesign(ids), { x: 120, width: 60 });
    const warnings = layoutWarnings(design);
    expect(warnings.some((w) => w.includes('पृष्ठाच्या बाहेर जाते'))).toBe(true);
  });
});

describe('design-schema/preflight — the print gate', () => {
  it('flags text outside the safe area but ignores decoration', () => {
    const outside = withText(createBlankDesign(ids), { x: 1, y: 1 });
    const codes = preflight(outside).map((i) => i.code);
    expect(codes).toContain('out-of-safe-area');

    const decor = createBlankDesign(ids);
    decor.elements.push({
      id: 'border', name: 'कडा', type: 'shape', shape: 'border', motif: 'none', role: 'decoration',
      x: 0, y: 0, width: 127, height: 178, rotation: 0, opacity: 1, locked: true,
      stroke: BRAND_PALETTE.gold, strokeWidthMm: 0.6,
    });
    expect(preflight(decor).some((i) => i.code === 'out-of-safe-area')).toBe(false);
  });

  it('errors on low-resolution photos and warns below 300 DPI', () => {
    const base = createBlankDesign(ids);
    const withImage = (sourceWidthPx: number): DesignDocument => ({
      ...base,
      elements: [{
        id: 'img', name: 'फोटो', type: 'image', role: 'image',
        x: 10, y: 10, width: 50.8, height: 50.8, rotation: 0, opacity: 1, locked: false,
        src: 'photo.jpg', fit: 'cover', cornerRadiusMm: 0,
        sourceWidthPx, sourceHeightPx: sourceWidthPx,
      }],
    });
    // 50.8mm at 150dpi ⇒ 300px source
    const error = preflight(withImage(300)).find((i) => i.code === 'low-resolution');
    expect(error?.severity).toBe('error');
    const warning = preflight(withImage(500)).find((i) => i.code === 'low-resolution');
    expect(warning?.severity).toBe('warning');
    expect(preflight(withImage(700)).some((i) => i.code === 'low-resolution')).toBe(false);
  });

  it('warns when a gold-foil hairline is too thin to foil', () => {
    const design = createBlankDesign(ids);
    design.meta.print.goldFoil = true;
    design.elements.push({
      id: 'rule', name: 'रेषा', type: 'shape', shape: 'line', motif: 'none', role: 'decoration',
      x: 10, y: 10, width: 60, height: 0.2, rotation: 0, opacity: 1, locked: false,
      stroke: BRAND_PALETTE.gold, strokeWidthMm: GOLD_FOIL_MIN_STROKE_MM - 0.05,
    });
    const issue = preflight(design).find((i) => i.code === 'thin-gold-stroke');
    expect(issue).toBeDefined();
    expect(issue?.message).toContain(String(GOLD_FOIL_MIN_STROKE_MM));
  });

  it('errors when the QR code is too small to scan reliably', () => {
    const qr = {
      id: 'qr', name: 'QR', type: 'qr' as const, role: 'qr' as const,
      x: 20, y: 120, width: 15, height: 15, rotation: 0, opacity: 1, locked: false,
      payload: 'https://mazipatrika.in/e/abc', quietZoneMm: 2, foreground: '#000000',
      background: '#FFFFFF', errorCorrectionLevel: 'M' as const,
    };
    const small: DesignDocument = { ...createBlankDesign(ids), elements: [qr] };
    const issue = preflight(small).find((i) => i.code === 'qr-too-small');
    expect(issue?.severity).toBe('error');

    const bigger: DesignDocument = { ...createBlankDesign(ids), elements: [{ ...qr, width: 25, height: 25 }] };
    expect(preflight(bigger).some((i) => i.code === 'qr-too-small')).toBe(false);
  });

  it('warns when an edge-to-edge photo does not reach into the bleed', () => {
    const photo = {
      id: 'hero', name: 'मुखपृष्ठ फोटो', type: 'image' as const, role: 'image' as const,
      x: 0, y: 0, width: 127, height: 178, rotation: 0, opacity: 1, locked: false,
      src: 'hero.jpg', fit: 'cover' as const, cornerRadiusMm: 0,
      sourceWidthPx: 3000, sourceHeightPx: 4200,
    };
    const flush: DesignDocument = { ...createBlankDesign(ids), elements: [photo] };
    expect(preflight(flush).some((i) => i.code === 'missing-bleed-art')).toBe(true);

    const bled: DesignDocument = { ...createBlankDesign(ids), elements: [{ ...photo, x: -3, y: -3, width: 133, height: 184 }] };
    expect(preflight(bled).some((i) => i.code === 'missing-bleed-art')).toBe(false);
  });

  it('flags CMYK-unsafe fills and empty text boxes', () => {
    const design = withText(createBlankDesign(ids), { color: '#00FF00' });
    design.elements.push({
      id: 'empty', name: 'रिकामा', type: 'text', role: 'footer',
      x: 20, y: 150, width: 60, height: 8, rotation: 0, opacity: 1, locked: false,
      text: '   ', autoFit: true, minSizePt: 9,
      typography: {
        family: 'Noto Sans Devanagari', sizePt: 9, weight: 400, lineHeight: 1.35,
        letterSpacing: 0, color: BRAND_PALETTE.charcoal, align: 'center', trimTrailingSpace: true,
      },
    });
    const codes = preflight(design).map((i) => i.code);
    expect(codes).toContain('cmyk-unsafe');
    expect(codes).toContain('empty-text');
  });

  it('accepts a clean, print-ready invitation', () => {
    const design = designFromTemplate('tpl-paithani-royal', { id: 'clean', name: 'स्वच्छ' });
    const blocking = preflight(design).filter((i) => i.severity === 'error');
    expect(blocking).toEqual([]);
  });
});

describe('design-schema/CMYK safety', () => {
  it('rejects pure RGB-only hues and accepts the brand palette', () => {
    expect(isCmykSafe('#00FF00')).toBe(false);
    expect(isCmykSafe('#ff00ff')).toBe(false);
    for (const colour of Object.values(BRAND_PALETTE)) {
      expect(isCmykSafe(colour)).toBe(true);
    }
  });
});

describe('design-schema/templates', () => {
  it('ships the curated starter set with unique ids and real elements', () => {
    expect(TEMPLATE_PRESETS.length).toBeGreaterThanOrEqual(12);
    const seen = new Set<string>();
    for (const preset of TEMPLATE_PRESETS) {
      expect(seen.has(preset.id)).toBe(false);
      seen.add(preset.id);
      expect(preset.name.length).toBeGreaterThan(1);
      expect(preset.motifs.length).toBeGreaterThan(0);
      expect(preset.tags.length).toBeGreaterThan(0);
      expect(Object.keys(preset.palette).length).toBeGreaterThan(0);
    }
    expect(seen.has('tpl-paithani-royal')).toBe(true);
    expect(seen.has('tpl-warli-heritage')).toBe(true);
  });

  it('instances a template into a valid, preflight-clean document with bindings', () => {
    for (const preset of TEMPLATE_PRESETS) {
      const design = designFromTemplate(preset.id, { id: `d-${preset.id}`, name: preset.name });
      const result = parseDesign(design);
      expect(result.ok, `${preset.id} should parse: ${result.errors.join('; ')}`).toBe(true);
      expect(design.templateId).toBe(preset.id);
      expect(design.elements.length).toBeGreaterThan(0);
      expect(preflight(design).filter((i) => i.severity === 'error')).toEqual([]);
    }
  });

  it('carries template style and palette into the instance', () => {
    const design = designFromTemplate('tpl-warli-heritage', { id: 'w', name: 'वारली' });
    expect(design.theme.style).toBe('warli');
    expect(Object.keys(design.theme.palette).length).toBeGreaterThan(0);
  });

  it('returns undefined for an unknown template id', () => {
    expect(getTemplatePreset('tpl-does-not-exist')).toBeUndefined();
    expect(() => designFromTemplate('tpl-does-not-exist', { id: 'x', name: 'x' })).toThrow(/अज्ञात|unknown/i);
  });
});
