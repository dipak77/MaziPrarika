/**
 * Cake Atelier Pro — end-to-end export test.
 *
 * Builds real files for a real project and verifies the bytes: PNG signature and
 * true pixel dimensions, a PDF whose media box matches the physical size, an SVG
 * with physical units and live/outlined text as requested, and a layered ZIP
 * containing one file per paper layer plus the manifest and report.
 *
 * Nothing here is mocked: the same code path the API route uses is exercised.
 */

import { describe, expect, it } from 'vitest';

import {
  allTemplates,
  buildScene,
  createProject,
  generateExport,
  layerManifestFromScene,
  listZipEntries,
  readZipEntry,
  renderSceneToPdf,
  renderSceneToSvg,
  requireTemplate,
  resolveSize,
  validateRegistry,
  ExportBlockedError,
  isPdf,
  isPng,
  isZip,
  preflight,
  projectDiagnostics,
  withContent,
} from '../packages/cake-atelier/src/server.js';

const projectFor = (templateId: string, name = 'Aarav') =>
  createProject({
    templateId,
    content: { name, title: 'Happy Birthday', subtitle: 'Feel the joy', age: '5', date: '' },
    now: '2026-10-11T00:00:00.000Z',
    id: 'prj_testsample',
  });

describe('export pipeline', () => {
  it('renders a real PNG at the pixel size implied by the physical size', async () => {
    const project = projectFor('royal-prince-crown');
    const result = await generateExport({ project, generatedAt: '2026-10-11T00:00:00.000Z' });

    expect(result.format).toBe('png');
    expect(isPng(result.bytes)).toBe(true);
    // 6 in at 300 PPI is 1800 px, and the previous draft of this feature got it wrong.
    expect(result.report.raster?.widthPx).toBe(1800);
    expect(result.report.raster?.heightPx).toBe(1800);
    expect(result.report.raster?.ppi).toBe(300);
    expect(result.bytes.length).toBeGreaterThan(20_000);
    expect(result.report.fileSize).toBe(result.bytes.length);
    expect(result.fileName).toMatch(/^Aarav_royal-prince-crown_\d+x\d+mm_300ppi_/);
  });

  it('honours a 4 in / 150 PPI request without silently changing either', async () => {
    const base = projectFor('little-king-throne');
    const project = { ...base, size: { presetId: 'topper-4-round', widthMm: 101.6, heightMm: 101.6 } };
    const result = await generateExport({ project, settings: { ppi: 150 } });
    expect(result.report.raster?.widthPx).toBe(600);
    expect(result.report.raster?.ppi).toBe(150);
    expect(result.report.dimensions.widthMm).toBeCloseTo(101.6, 2);
  });

  it('writes an SVG with physical units, a viewBox, and outlines when asked', async () => {
    const project = projectFor('sapphire-royal-medallion');
    const result = await generateExport({ project, settings: { format: 'svg' } });
    const svg = new TextDecoder().decode(result.bytes);

    expect(result.mime).toBe('image/svg+xml');
    expect(svg.startsWith('<?xml')).toBe(true);
    expect(svg).toContain('width="152.4mm"');
    expect(svg).toContain('viewBox="0 0 152.4 152.4"');
    expect(svg).toContain('<title>');
    expect(svg).not.toContain('<script');
    expect(svg).not.toContain('foreignObject');
    expect(svg).not.toContain('http://f'); // no remote font hosts
    // Outlined: no live <text> remains when outlineText is on.
    expect(svg).not.toContain('font-family=');
    expect(result.report.typography.textMode).toBe('outlined');
  });

  it('keeps editable text in SVG when the caller asks for it', async () => {
    const project = projectFor('royal-baby-bear', 'Saanvi');
    const result = await generateExport({ project, settings: { format: 'svg', outlineText: false } });
    const svg = new TextDecoder().decode(result.bytes);
    expect(svg).toContain('font-family="quicksand"');
    expect(svg).toContain('Saanvi');
    expect(result.report.typography.textMode).toBe('editable');
    expect(result.report.notes.join(' ')).toMatch(/Editable text was kept/);
  });

  it('produces a PDF whose media box is the requested physical size', async () => {
    const project = projectFor('trex-roar', 'Rudra');
    const result = await generateExport({ project, settings: { format: 'pdf', bleedMm: 3 } });
    const text = new TextDecoder().decode(result.bytes);

    expect(isPdf(result.bytes)).toBe(true);
    expect(result.bytes.length).toBeGreaterThan(15_000);
    // 152.4 + 6 mm bleed = 158.4 mm = 449.0 pt
    const media = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(text);
    expect(media).toBeTruthy();
    expect(Number(media![1])).toBeCloseTo(449.0, 0);
    expect(Number(media![2])).toBeCloseTo(449.0, 0);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('%%EOF');
    // Outlined text means no font resources are needed at all.
    expect(text).not.toContain('/Font');
  });

  it('writes a layered cardstock ZIP with every expected member', async () => {
    const project = projectFor('prince-castle-shield', 'Kabir');
    const result = await generateExport({ project, settings: { format: 'layers' } });

    expect(isZip(result.bytes)).toBe(true);
    const entries = listZipEntries(result.bytes);
    const names = entries.map((entry) => entry.name);
    expect(names).toContain('manifest.json');
    expect(names).toContain('production-report.txt');
    expect(names).toContain('assembly-proof.svg');
    expect(names).toContain('README.txt');
    expect(names.some((name) => name.startsWith('layer-') && name.endsWith('.svg'))).toBe(true);
    expect(result.report.layers?.count).toBeGreaterThanOrEqual(2);

    const manifestBytes = readZipEntry(result.bytes, 'manifest.json');
    expect(manifestBytes).toBeTruthy();
    const manifest = JSON.parse(new TextDecoder().decode(manifestBytes!)) as {
      templateId: string;
      layers: { file: string; cutContours: number }[];
      assembly: { order: string[]; notes: string[]; tolerances: { cutMm: number } };
    };
    expect(manifest.templateId).toBe('prince-castle-shield');
    expect(manifest.layers.length).toBe(result.report.layers?.count);
    expect(manifest.assembly.order.length).toBeGreaterThan(0);
    expect(manifest.assembly.notes.join(' ')).toMatch(/magenta contour is a cut/i);

    const proof = new TextDecoder().decode(readZipEntry(result.bytes, 'assembly-proof.svg')!);
    expect(proof).toContain('data-cut="true"');
  });

  it('blocks the export when preflight finds a real problem and offers a report-only path', async () => {
    const base = projectFor('royal-prince-crown');
    // A 4 × 6 in size against a square design is a hard aspect mismatch.
    const project = { ...base, size: { presetId: 'topper-4x6-portrait', widthMm: 101.6, heightMm: 152.4 } };

    await expect(generateExport({ project, settings: { format: 'svg' } })).rejects.toBeInstanceOf(ExportBlockedError);

    const dry = await generateExport({ project, settings: { format: 'svg' }, reportOnly: true });
    expect(dry.bytes.length).toBe(0);
    expect(dry.preflight.ok).toBe(false);
    expect(dry.preflight.errors.some((issue) => issue.id === 'dimensions')).toBe(true);
  });

  it('reports the cardstock and cut area for a layered design', async () => {
    const project = projectFor('peony-blossom-frame');
    const diagnostics = projectDiagnostics(project);
    expect(diagnostics.materials.length).toBeGreaterThan(1);
    expect(diagnostics.layers.length).toBeGreaterThan(1);
    expect(diagnostics.preflight.summary.numberOfLayers).toBe(diagnostics.template.materials.length);
    expect(diagnostics.preflight.summary.smallestTextMm).toBeGreaterThan(0);
  });
});

describe('scene determinism', () => {
  it('produces byte-identical SVG for identical input and different output for different names', () => {
    const template = requireTemplate('royal-prince-crown');
    const a = buildScene(template, {
      content: { name: 'Aarav', title: 'Happy Birthday', subtitle: '', age: '5', date: '' },
      generatedAt: '2026-10-11T00:00:00.000Z',
    });
    const b = buildScene(template, {
      content: { name: 'Aarav', title: 'Happy Birthday', subtitle: '', age: '5', date: '' },
      generatedAt: '2026-10-11T00:00:00.000Z',
    });
    const c = buildScene(template, {
      content: { name: 'Vihaan', title: 'Happy Birthday', subtitle: '', age: '5', date: '' },
      generatedAt: '2026-10-11T00:00:00.000Z',
    });

    const svgA = renderSceneToSvg(a.scene);
    const svgB = renderSceneToSvg(b.scene);
    const svgC = renderSceneToSvg(c.scene);
    expect(svgA).toBe(svgB);
    expect(svgC).not.toBe(svgA);

    // Everything except the name itself must be identical: same artwork, same
    // positions, same decoration. Only the name's glyphs and the document title
    // may differ — that is the fixed-composition rule expressed as bytes.
    const strip = (svg: string) =>
      svg
        .replace(/<title>[\s\S]*?<\/title>/g, '<title/>')
        .replace(/<g[^>]*id="[^"]*:name"[^>]*>[\s\S]*?<\/g>/g, '<g id="name"/>')
        .replace(/data-revision="[^"]*"/g, 'data-revision=""')
        .replace(/data-face="[^"]*"/g, 'data-face=""');
    expect(strip(svgA)).toBe(strip(svgC));
    // Sanity: the whole document really does differ, so the strip is not hiding
    // a total mismatch.
    expect(svgA).not.toBe(svgC);
  });

  it('changes the composition when the palette changes but never the layout', () => {
    const template = requireTemplate('little-king-throne');
    const content = { name: 'Vihaan', title: 'Little King', subtitle: '', age: '2', date: '' };
    const navy = buildScene(template, { paletteId: 'navy-silver', content, generatedAt: 'x' }).scene;
    const mint = buildScene(template, { paletteId: 'mint-candy', content, generatedAt: 'x' }).scene;

    const geometryOf = (scene: typeof navy) => scene.nodes.map((node) => ('d' in node ? node.d : node.id)).join('|');
    expect(geometryOf(mint)).toBe(geometryOf(navy));
    expect(renderSceneToSvg(mint)).not.toBe(renderSceneToSvg(navy));
  });
});

describe('preflight as a user-facing contract', () => {
  it('explains a name that cannot fit instead of silently truncating it', () => {
    const template = requireTemplate('rose-gold-crown-frame');
    const longName = 'Bartholomew-Fitzgerald-Smythe';
    const project = withContent(projectFor('rose-gold-crown-frame'), { name: longName });
    const built = buildScene(template, {
      content: project.content,
      paletteId: project.paletteId,
      generatedAt: 'x',
    });
    const size = resolveSize(project.size);
    const result = preflight({
      scene: built.scene,
      template,
      size,
      layouts: built.layouts,
      format: 'svg',
      declaredMaterials: template.materials.map((material) => material.id),
    });

    expect(result.summary.smallestTextMm).toBeGreaterThan(0);
    expect(result.checks.some((check) => check.id === 'text-fit')).toBe(true);
    const allMessages = [...result.warnings, ...result.errors]
      .map((issue) => `${issue.title} ${issue.detail} ${issue.remedy ?? ''}`)
      .join(' ');

    // The generated wording must never be silently shortened: no ellipsis is
    // inserted anywhere, and the fitted lines keep a recognisable prefix.
    const nameLayout = built.layouts.name!;
    const fitted = nameLayout.lines.map((line) => line.text).join(' ').replace(/\s+/g, '');
    expect(fitted).not.toContain('…');
    expect(fitted.length).toBeGreaterThan(6);
    expect(longName.replace(/[\s-]+/g, '')).toContain(fitted.slice(0, 6));

    // Either it fits (shrinking is fine), or the user is told why not.
    if (nameLayout.overflow) {
      expect(allMessages).toMatch(/does not fit/);
      expect(result.ok).toBe(false);
    } else {
      expect(nameLayout.status).toMatch(/fits|shrunk|clamped-min-size|needs-extra-line/);
      if (nameLayout.status !== 'fits') {
        expect(allMessages).toMatch(/does not fit|line allowance|more room/i);
      }
    }
  });

  it('never blocks on warnings alone', () => {
    const template = requireTemplate('boho-pampas-arch');
    const built = buildScene(template, { content: { name: 'Meher', title: 'Welcome', subtitle: '', age: '0', date: '' }, generatedAt: 'x' });
    const result = preflight({
      scene: built.scene,
      template,
      size: resolveSize({ presetId: 'topper-5x7-portrait', widthMm: 127, heightMm: 177.8 }),
      layouts: built.layouts,
      format: 'png',
      declaredMaterials: template.materials.map((material) => material.id),
    });
    expect(result.errors).toHaveLength(0);
    expect(result.ok).toBe(true);
  });
});

describe('registry integrity', () => {
  it('ships sixty templates across twelve collections with unique ids', () => {
    const validation = validateRegistry({ requireFullSet: true });
    expect(validation.duplicateIds).toEqual([]);
    expect(validation.missingCategories).toEqual([]);
    expect(validation.templateCount).toBe(60);
    for (const count of Object.values(validation.categoryCounts)) expect(count).toBe(5);
    expect(validation.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
  });
});

describe('layer manifest helper', () => {
  it('describes one file per declared material', () => {
    const template = requireTemplate('skyline-guardian');
    const built = buildScene(template, { content: { name: 'Shaurya', title: 'Happy Birthday', subtitle: '', age: '9', date: '' }, generatedAt: 'x' });
    const manifest = layerManifestFromScene(built.scene, template);
    expect(manifest.layers.length).toBeGreaterThanOrEqual(2);
    for (const layer of manifest.layers) {
      expect(layer.file).toMatch(/^layer-[a-z]+\.svg$/);
      expect(Number.isFinite(layer.cutContours)).toBe(true);
    }
  });

  it('writes a PDF for every registered template without throwing', () => {
    const templates = allTemplates();
    expect(templates).toHaveLength(60);
    for (const template of templates) {
      const built = buildScene(template, { generatedAt: 'x' });
      const pdf = renderSceneToPdf(built.scene, { includeGuides: false });
      expect(isPdf(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(5_000);
    }
  }, 120_000);
});
