/**
 * Cake Atelier Pro — unit and integration suite.
 *
 * Covers the parts a customer never sees but a print shop always notices:
 * registry integrity, palette and font fallbacks, the name-fitting matrix
 * (short, long, hyphenated, multi-word, numeric, Marathi/Hindi), the millimetre ↔
 * pixel arithmetic, project serialisation, SVG sanitisation and export-request
 * validation.
 *
 * Nothing here mocks the engine: every assertion runs the real code paths.
 */

import { describe, expect, it } from 'vitest';

import {
  CATEGORIES,
  DOCUMENT_SIZES,
  FONT_FAMILIES,
  MAX_MM,
  MIN_MM,
  PALETTES,
  SIMULATED_FOIL_NOTICE,
  analyseScript,
  buildScene,
  checkPaletteForTemplate,
  createProject,
  defaultTextStyle,
  extractContours,
  fitTextToRegion,
  formatInch,
  formatMm,
  hasGlyph,
  hexToRgb,
  isHexColor,
  mmToPt,
  mmToPx,
  parseProject,
  layerFileNames,
  planLayers,
  ptToMm,
  pxToMm,
  rasterPlan,
  renderSceneToSvg,
  requireTemplate,
  resolveFace,
  resolveFamilyForText,
  resolveSize,
  sceneFingerprint,
  segmentClusters,
  toProjectFile,
  validateRegistry,
  wrapClusters,
  ExportRequestSchema,
  ProjectFileSchema,
} from '../packages/cake-atelier/src/server.js';

/* ------------------------------------------------------------------ */
/* registry                                                            */
/* ------------------------------------------------------------------ */

describe('registry integrity', () => {
  it('exposes sixty templates with unique ids and no duplicate names', () => {
    const validation = validateRegistry({ requireFullSet: true });
    expect(validation.templateCount).toBe(60);
    expect(validation.duplicateIds).toEqual([]);
    expect(validation.missingCategories).toEqual([]);
    for (const category of CATEGORIES) expect(validation.categoryCounts[category.id]).toBe(5);

    const summaries = validation.summaries ?? [];
    const names = new Set<string>();
    for (const summary of summaries) {
      expect(summary.id).toMatch(/^[a-z0-9-]+$/);
      expect(names.has(summary.name)).toBe(false);
      names.add(summary.name);
    }
  });

  it('gives every template real artwork, notes and a print-safe inset', () => {
    for (const category of CATEGORIES) {
      for (const template of validateRegistry({ requireFullSet: true }).templates ?? []) {
        if (template.category !== category.id) continue;
        expect(template.notes.length).toBeGreaterThan(20);
        expect(template.safeInset).toBeGreaterThan(0);
        expect(template.materials.length).toBeGreaterThanOrEqual(2);
        const built = buildScene(template, { generatedAt: 'x' });
        let shapes = 0;
        for (const node of built.scene.nodes) {
          if (node.kind === 'shape') shapes += 1;
          if (node.kind === 'group') shapes += node.children.length;
        }
        // A "design" that is three rectangles is a placeholder, not a design.
        expect(shapes).toBeGreaterThan(20);
      }
    }
  });

  it('builds identical scenes for identical input and stable fingerprints', () => {
    const template = requireTemplate('mermaid-lagoon');
    const a = buildScene(template, { generatedAt: 'x' });
    const b = buildScene(template, { generatedAt: 'x' });
    expect(sceneFingerprint(a.scene)).toBe(sceneFingerprint(b.scene));
    expect(renderSceneToSvg(a.scene)).toBe(renderSceneToSvg(b.scene));
  });
});

/* ------------------------------------------------------------------ */
/* palettes                                                            */
/* ------------------------------------------------------------------ */

describe('palettes', () => {
  it('ships twelve palettes with the full semantic token set in valid hex', () => {
    expect(PALETTES).toHaveLength(12);
    const required = [
      'primary',
      'secondary',
      'accent',
      'background',
      'nameFill',
      'titleFill',
      'outline',
      'shadow',
      'cutline',
      'plaqueInk',
      'plaquePaper',
    ];
    for (const palette of PALETTES) {
      for (const token of required) {
        const value = (palette.tokens as unknown as Record<string, string>)[token];
        expect(value, `${palette.id}.${token}`).toBeTruthy();
        // Alpha is legitimate for shadow/soft tokens; everything else is hex.
        expect(isHexColor(value) || /^rgba?\(/.test(value), `${palette.id}.${token} = ${value}`).toBe(true);
        if (isHexColor(value)) {
          const { r, g, b } = hexToRgb(value);
          expect([r, g, b].every((channel) => channel >= 0 && channel <= 255)).toBe(true);
        }
      }
      expect(palette.blurb.length).toBeGreaterThan(10);
    }
  });

  it('flags an off-palette combination without blocking it', () => {
    const result = checkPaletteForTemplate('midnight-gold', ['blush-rose-gold']);
    expect(result.ok).toBe(true);
    expect(result.reason).toMatch(/not hand-tuned|curated/i);
    expect(checkPaletteForTemplate('not-a-palette', ['blush-rose-gold']).ok).toBe(false);
  });

  it('is explicit that metallic finishes are simulated', () => {
    expect(SIMULATED_FOIL_NOTICE).toMatch(/simulated/i);
    expect(SIMULATED_FOIL_NOTICE).toMatch(/not physical metal|not real metal/i);
  });
});

/* ------------------------------------------------------------------ */
/* fonts                                                               */
/* ------------------------------------------------------------------ */

describe('fonts', () => {
  it('resolves to a bundled face, falling back to the nearest weight', () => {
    const exact = resolveFace('poppins', 700);
    expect(exact.id).toBe('poppins-700');
    const nearest = resolveFace('poppins', 650);
    expect(FONT_FAMILIES.some((family) => family.faces.some((face) => face.id === nearest.id))).toBe(true);
    expect(nearest.family).toBe('poppins');
    // A family that does not exist must not silently produce a mystery face.
    expect(() => resolveFace('comic-sans', 400)).toThrow(/unknown font family/i);
  });

  it('reports Devanagari coverage honestly and substitutes a covering face', () => {
    expect(hasGlyph('noto-sans-devanagari-400', 'आ'.codePointAt(0)!)).toBe(true);
    expect(hasGlyph('bebas-neue-400', 'आ'.codePointAt(0)!)).toBe(false);

    const analysis = analyseScript('आरव', 'bebas-neue-400');
    expect(analysis.hasDevanagari).toBe(true);
    expect(analysis.unsupported.length).toBeGreaterThan(0);

    const substitution = resolveFamilyForText('bebas-neue', 'आरव');
    expect(substitution.familyId).toBe('noto-sans-devanagari');
    expect(substitution.substituted).toBe(true);
  });

  it('measures Marathi text without a glyph-precise claim but with real widths', () => {
    const region = { x: 0, y: 0, width: 120, height: 30, maxSizePt: 40, minSizePt: 11, maxLines: 2, families: ['noto-sans-devanagari'] };
    const result = fitTextToRegion('वाढदिवसाच्या शुभेच्छा', region, { requestedFamily: 'noto-sans-devanagari' });
    expect(result.blockWidth).toBeGreaterThan(0);
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.familyId).toBe('noto-sans-devanagari');
    // The engine must not pretend to be glyph-exact for complex scripts: it
    // reports the approximation through its conservative measure.
    expect(defaultTextStyle(region, 'noto-sans-devanagari').familyId).toBe('noto-sans-devanagari');
  });
});

/* ------------------------------------------------------------------ */
/* name fitting                                                        */
/* ------------------------------------------------------------------ */

describe('name fitting', () => {
  const region = { x: 0, y: 0, width: 100, height: 30, maxSizePt: 40, minSizePt: 11, maxLines: 2, breakWords: true, families: ['playfair-display', 'poppins'] };

  const fit = (text: string) => fitTextToRegion(text, region, { requestedFamily: 'playfair-display' });

  it('fits the cases a parent actually types', () => {
    const cases = [
      'Aarav',
      'Meher',
      'Aadya',
      'Saanvi',
      'Vihaan',
      'अथर्व',
      'आरव',
      'Jeon-Jae-won',
      'Mary-Anne',
      'Aarav Kumar Sharma',
      'Zoya 5',
      'Fitzgerald-Smythe',
      'Ana María',
      'Đorđe Petrović',
    ];
    for (const text of cases) {
      const result = fit(text);
      expect(result.lines.length, text).toBeGreaterThan(0);
      expect(result.lines.length, text).toBeLessThanOrEqual(2);
      expect(Number.isFinite(result.sizeMm)).toBe(true);
      expect(result.sizeMm).toBeGreaterThanOrEqual(11 * (25.4 / 72) * 0.98);
      const joined = result.lines.map((line) => line.text).join(' ');
      expect(joined).not.toContain('…');
      // Every non-space character survives: wrapping is a layout decision, and
      // if it cannot be honoured the result says `overflow` instead.
      if (!result.overflow) {
        expect(joined.replace(/\s+/g, '')).toBe(text.replace(/\s+/g, ''));
      }
    }
  });

  it('wraps at word boundaries and only breaks words when allowed', () => {
    const wrapped = wrapClusters('Aarav Kumar Sharma', { maxWidth: 60, measure: (value) => value.length * 8, maxLines: 3 });
    expect(wrapped.lines.length).toBeGreaterThan(1);
    expect(wrapped.lines.every((line) => !line.startsWith(' '))).toBe(true);

    const hyphenated = wrapClusters('Bartholomew-Fitzgerald', { maxWidth: 60, measure: (value) => value.length * 8, maxLines: 3, breakWords: true });
    expect(hyphenated.lines.join('')).toContain('Fitz');
  });

  it('never reports a fit that is wider than the region', () => {
    for (const text of ['Aarav', 'Aarav Kumar Sharma', 'Bartholomew-Fitzgerald-Smythe']) {
      const result = fit(text);
      if (!result.overflow) {
        expect(result.blockWidth, text).toBeLessThanOrEqual(region.width + 0.2);
        expect(result.blockHeight, text).toBeLessThanOrEqual(region.height + 0.2);
      }
    }
  });

  it('keeps grapheme clusters together when splitting Devanagari', () => {
    const clusters = segmentClusters('शुभेच्छा');
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters.join('')).toBe('शुभेच्छा');
  });

  it('shrinks a long name before it gives up, and says so when it does', () => {
    const short = fit('Aarav');
    const long = fit('Bartholomew-Fitzgerald');
    expect(long.sizeMm).toBeLessThanOrEqual(short.sizeMm + 0.001);
    if (long.overflow) {
      expect(long.warnings.join(' ')).toMatch(/does not fit|line allowance/i);
    }
  });
});

/* ------------------------------------------------------------------ */
/* physical maths                                                      */
/* ------------------------------------------------------------------ */

describe('millimetres, pixels and points', () => {
  it('converts both ways without drift', () => {
    for (const ppi of [72, 150, 300, 600]) {
      for (const mm of [25, 101.6, 152.4, 600]) {
        const px = mmToPx(mm, ppi);
        expect(pxToMm(px, ppi)).toBeCloseTo(mm, 6);
      }
    }
    expect(mmToPx(152.4, 300)).toBeCloseTo(1800, 6);
    expect(mmToPt(152.4)).toBeCloseTo(432, 0);
    expect(ptToMm(mmToPt(50))).toBeCloseTo(50, 6);
  });

  it('computes a raster plan that matches the requested PPI', () => {
    const plan = rasterPlan(152.4, 152.4, 300);
    expect(plan.widthPx).toBe(1800);
    expect(plan.heightPx).toBe(1800);
    expect(plan.megapixels).toBeCloseTo(3.24, 2);
    const low = rasterPlan(101.6, 101.6, 150);
    expect(low.widthPx).toBe(600);
  });

  it('resolves presets, rejects nonsense and warns about extremes', () => {
    const preset = resolveSize({ presetId: DOCUMENT_SIZES[0]!.id });
    expect(preset.widthMm).toBe(DOCUMENT_SIZES[0]!.widthMm);

    const custom = resolveSize({ presetId: 'custom', widthMm: 120, heightMm: 120 });
    expect(custom.widthMm).toBe(120);
    expect(custom.aspect).toBeCloseTo(1, 3);

    // A size far from what the design was drawn for earns a warning, not a
    // silent clamp: a 40 mm topper is legal but the layered text will be tiny.
    // Below the validated minimum the resolver clamps and says so rather than
    // handing the renderer a size it cannot print.
    const tiny = resolveSize({ presetId: 'custom', widthMm: 10, heightMm: 10 });
    expect(tiny.warnings.length).toBeGreaterThan(0);
    expect(tiny.warnings.join(' ')).toMatch(/minimum|fragile/i);
    expect(tiny.widthMm).toBe(MIN_MM);

    const clamped = resolveSize({ presetId: 'custom', widthMm: MIN_MM / 2, heightMm: MAX_MM * 2 });
    expect(clamped.widthMm).toBeGreaterThanOrEqual(MIN_MM);
    expect(clamped.heightMm).toBeLessThanOrEqual(MAX_MM);
  });

  it('formats millimetres and inches the way a print shop reads them', () => {
    expect(formatMm(152.4)).toMatch(/152[,.]4\s?mm/);
    expect(formatInch(152.4)).toMatch(/6([.,]0)?\s?(in|")/);
  });
});

/* ------------------------------------------------------------------ */
/* projects                                                            */
/* ------------------------------------------------------------------ */

describe('projects', () => {
  it('round-trips through a project file, including token overrides', () => {
    const project = createProject({ templateId: 'garden-bee-and-sunflower', id: 'prj_unit0001', now: '2026-01-01T00:00:00.000Z' });
    const customised = {
      ...project,
      content: { ...project.content, name: 'Ira', age: '4' },
      tokenOverrides: { nameFill: '#123456' },
      optionals: { ...project.optionals, sparkles: false },
      size: { presetId: 'custom', widthMm: 120, heightMm: 120 },
    };
    const file = toProjectFile(customised, '1.0.0', '2026-01-01T00:00:00.000Z');
    const parsed = parseProject(file);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.project.content.name).toBe('Ira');
    expect(parsed.project.tokenOverrides.nameFill).toBe('#123456');
    expect(parsed.project.size.widthMm).toBe(120);
    expect(ProjectFileSchema.safeParse(file).success).toBe(true);
  });

  it('rejects a project that tries to smuggle markup into the artwork', () => {
    const base = createProject({ templateId: 'royal-prince-crown', id: 'prj_unit0004', now: '2026-01-01T00:00:00.000Z' });
    const result = parseProject({ ...base, content: { ...base.content, name: '<script>alert(1)</script>' } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/markup|script|control/i);
  });

  it('rejects a project with an impossible size and keeps the reason', () => {
    const base = createProject({ templateId: 'royal-prince-crown', id: 'prj_unit0005', now: '2026-01-01T00:00:00.000Z' });
    const result = parseProject({ ...base, size: { presetId: 'custom', widthMm: 5, heightMm: 5 } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toMatch(/25|size|width/i);
  });

  it('caps every text field instead of accepting an unbounded string', () => {
    const project = createProject({ templateId: 'royal-prince-crown', id: 'prj_unit0002', now: '2026-01-01T00:00:00.000Z' });
    const parsed = parseProject({ ...project, content: { ...project.content, name: 'x'.repeat(61) } });
    expect(parsed.ok).toBe(false);
    const ok = parseProject({ ...project, content: { ...project.content, name: 'x'.repeat(60) } });
    expect(ok.ok).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* SVG output and sanitisation                                         */
/* ------------------------------------------------------------------ */

describe('SVG output', () => {
  it('escapes hostile text and never emits scriptable markup', () => {
    const template = requireTemplate('royal-prince-crown');
    const built = buildScene(template, {
      content: { name: '"Aarav" <b>&co</b>', title: 'Happy & Joyful', subtitle: 'a > b < c', age: '5', date: '' },
      generatedAt: 'x',
    });
    const svg = renderSceneToSvg(built.scene);
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain('foreignObject');
    expect(svg).not.toContain('onload=');
    expect(svg).not.toMatch(/xlink:href="http/i);
    expect(svg).toContain('&amp;');
    expect(svg).toContain('&lt;');
    // The raw markup the customer typed must not survive as markup.
    expect(svg).not.toContain('<b>&co</b>');
  });

  it('carries physical units, a viewBox and a title', () => {
    const template = requireTemplate('little-astronaut');
    const built = buildScene(template, { generatedAt: 'x' });
    const svg = renderSceneToSvg(built.scene, { title: 'Test topper' });
    expect(svg).toContain('width="152.4mm"');
    expect(svg).toContain('height="152.4mm"');
    expect(svg).toContain('viewBox="0 0 152.4 152.4"');
    expect(svg).toContain('<title>Test topper</title>');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* cut contours and layers                                             */
/* ------------------------------------------------------------------ */

describe('cut contours and paper layers', () => {
  it('separates cuts from scores and produces a file per material', () => {
    const template = requireTemplate('windmill-wheat-field');
    const built = buildScene(template, { generatedAt: 'x' });
    const contours = extractContours(built.scene);
    expect(contours.cuts.length).toBeGreaterThan(0);
    expect(contours.cuts.every((contour) => contour.d.startsWith('M'))).toBe(true);
    expect(contours.cuts.every((contour) => contour.id.length > 0)).toBe(true);

    const layers = planLayers(built.scene, template.materials);
    expect(layers.length).toBeGreaterThanOrEqual(2);
    const materials = layers.map((layer) => layer.material);
    expect(new Set(materials).size).toBe(materials.length);
    for (const layer of layers) {
      // File naming lives in one place (the manifest builder), so the test
      // checks the shipped helper rather than a hard-coded pattern.
      expect(layerFileNames(layers)).toContain(`layer-${layer.material}.svg`);
      expect(Array.isArray(layer.cutContours)).toBe(true);
      expect(layer.scene.nodes.length).toBeGreaterThan(0);
    }
  });
});

/* ------------------------------------------------------------------ */
/* export request validation                                           */
/* ------------------------------------------------------------------ */

describe('export request validation', () => {
  const project = createProject({ templateId: 'royal-prince-crown', id: 'prj_unit0003', now: '2026-01-01T00:00:00.000Z' });

  it('accepts the requests the studio makes', () => {
    for (const format of ['png', 'svg', 'pdf', 'layers'] as const) {
      const parsed = ExportRequestSchema.safeParse({ project, format, ppi: 300, bleedMm: 3, dryRun: true });
      expect(parsed.success, format).toBe(true);
    }
  });

  it('rejects out-of-range settings rather than clamping them silently', () => {
    const cases: [string, unknown][] = [
      ['ppi below 72', { project, format: 'png', ppi: 71 }],
      ['ppi above 600', { project, format: 'png', ppi: 601 }],
      ['negative bleed', { project, format: 'pdf', bleedMm: -1 }],
      ['bleed above 10 mm', { project, format: 'pdf', bleedMm: 11 }],
      ['tolerance above 2 mm', { project, format: 'layers', cutToleranceMm: 3 }],
      ['unknown format', { project, format: 'tiff' }],
      ['missing project', { format: 'png' }],
    ];
    for (const [label, body] of cases) {
      expect(ExportRequestSchema.safeParse(body).success, label).toBe(false);
    }
  });
});
