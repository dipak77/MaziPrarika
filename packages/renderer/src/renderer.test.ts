import { describe, expect, it } from 'vitest';

import {
  BRAND_PALETTE,
  PAGE_PRESETS,
  createBlankDesign,
  designFromTemplate,
  parseDesign,
  preflight,
  type DesignDocument,
  type TextElement,
} from '@mazi/design-schema';

import {
  RENDERER_VERSION,
  applyLayout,
  buildInvitationDesign,
  collectMissingBindings,
  fitTextToRegion,
  measureTextWidthMm,
  renderSvg,
  resolveBindings,
  toPrintHtml,
  toSocialSvg,
  toWebInlineSvg,
  wrapText,
} from './index.js';

const STYLE = { sizePt: 12, weight: 400, lineHeight: 1.45 };

function textElement(overrides: Partial<TextElement> = {}): TextElement {
  const base: TextElement = {
    id: 't', name: 'text', type: 'text', role: 'narrative',
    x: 12, y: 40, width: 103, height: 20, rotation: 0, opacity: 1, locked: false,
    text: '', autoFit: true, minSizePt: 9,
    typography: {
      family: 'Noto Serif Devanagari', sizePt: 12, weight: 400, lineHeight: 1.45,
      letterSpacing: 0, color: BRAND_PALETTE.charcoal, align: 'center', trimTrailingSpace: true,
    },
  };
  return { ...base, ...overrides };
}

describe('renderer/text measurement', () => {
  it('measures Devanagari wider than Latin at the same point size', () => {
    const latin = measureTextWidthMm('Shubh Mangal', STYLE);
    const devanagari = measureTextWidthMm('शुभ मंगल', STYLE);
    expect(devanagari).toBeGreaterThan(latin * 0.6);
    expect(devanagari).toBeLessThan(latin * 1.4);
  });

  it('scales linearly with point size and is monotonic', () => {
    const small = measureTextWidthMm('शुभ विवाह', { ...STYLE, sizePt: 10 });
    const large = measureTextWidthMm('शुभ विवाह', { ...STYLE, sizePt: 20 });
    expect(large).toBeCloseTo(small * 2, 3);
    expect(measureTextWidthMm('', STYLE)).toBe(0);
  });

  it('calculates a plausible physical width (12pt text ≈ 4.2 mm per em)', () => {
    const oneEm = measureTextWidthMm('अ', { sizePt: 12 });
    expect(oneEm).toBeGreaterThan(2);
    expect(oneEm).toBeLessThan(3);
  });
});

describe('renderer/text wrapping', () => {
  it('wraps at word boundaries and never splits a word', () => {
    const text = 'श्री. रमेश पाटील यांच्या सुपुत्राचा विवाह सोहळा';
    const wrapped = wrapText(text, STYLE, 60);
    expect(wrapped.lines.length).toBeGreaterThan(1);
    expect(wrapped.lines.join(' ')).toBe(text);
    expect(wrapped.widthMm).toBeLessThanOrEqual(60.5);
  });

  it('flags unbreakable words instead of pretending they fit', () => {
    const wrapped = wrapText('महाराष्ट्रराज्यस्तरीयसमारंभ', STYLE, 10);
    expect(wrapped.unbreakable).toBe(true);
  });

  it('grows height with line count using the line-height factor', () => {
    const oneLine = wrapText('शुभ', STYLE, 200);
    const many = wrapText(Array.from({ length: 20 }, () => 'शुभ').join(' '), STYLE, 20);
    expect(many.lines.length).toBeGreaterThan(oneLine.lines.length);
    expect(many.heightMm).toBeGreaterThan(oneLine.heightMm);
    expect(many.heightMm).toBeCloseTo(many.lines.length * (12 * 25.4 / 72) * 1.45, 2);
  });
});

describe('renderer/Smart Layout fitting', () => {
  it('leaves text that already fits untouched', () => {
    const fit = fitTextToRegion('शुभ विवाह', textElement());
    expect(fit.action).toBe('unchanged');
    expect(fit.fontSizePt).toBe(12);
    expect(fit.overflowRatio).toBe(1);
  });

  it('shrinks oversized text in half-point steps until it fits, and reports overflow', () => {
    const long = Array.from({ length: 24 }, (_, i) => `ओळ क्रमांक ${i + 1} मजकूर`).join('\n');
    const fit = fitTextToRegion(long, textElement({ height: 30, minSizePt: 8 }));
    expect(fit.action).toBe('shrunk');
    expect(fit.fontSizePt).toBeLessThan(12);
    expect(fit.fontSizePt).toBeGreaterThanOrEqual(8);
    expect(fit.overflowRatio).toBeGreaterThan(1);
    expect(fit.wrapped.heightMm).toBeLessThanOrEqual(30.5);
  });

  it('respects autoFit:false by reporting the overflow instead of shrinking', () => {
    const long = Array.from({ length: 24 }, () => 'मजकूर').join('\n');
    const fit = fitTextToRegion(long, textElement({ height: 20, autoFit: false }));
    expect(fit.action).toBe('unchanged');
    expect(fit.overflowRatio).toBeGreaterThan(1);
  });

  it('never goes below the minimum print-safe size', () => {
    const long = Array.from({ length: 200 }, () => 'शब्द').join(' ');
    const fit = fitTextToRegion(long, textElement({ height: 6, minSizePt: 9 }));
    expect(fit.fontSizePt).toBeGreaterThanOrEqual(9);
  });
});

describe('renderer/applyLayout', () => {
  it('fills each typed region and reports the fill outcome per role', () => {
    const design = buildInvitationDesign({ id: 'inv', name: 'पत्रिका' });
    const { design: filled, report } = applyLayout(design, {
      invocation: '॥ श्री गणेशाय नमः ॥',
      headline: 'विवाह सोहळा',
      narrative: ['श्री. रमेश पाटील यांच्या सुपुत्राचा विवाह सोहळा सस्नेह आमंत्रण.'],
      request: 'आपल्या उपस्थितीने सोहळा लाभावा ही विनंती.',
      details: [{ label: 'दिनांक', value: 'गुरुवार, १९ मार्च २०२६' }],
      panchangLines: ['अभिजित मुहूर्त: दुपारी १२:१० ते १२:५५'],
      contacts: [{ label: 'संपर्क', value: '९८२२० १२३४५' }],
      footer: 'माझी पत्रिका',
    });

    const roles = report.map((r) => r.role);
    expect(roles).toContain('invocation');
    expect(roles).toContain('narrative');
    expect(roles).toContain('detail');
    expect(report.every((r) => r.action !== 'empty')).toBe(true);

    const narrative = filled.elements.find((e) => e.role === 'narrative') as TextElement;
    expect(narrative.text).toContain('विवाह सोहळा');
    const detail = filled.elements.find((e) => e.role === 'detail') as TextElement;
    expect(detail.text).toContain('अभिजित मुहूर्त');
    expect(detail.text).toContain('संपर्क');
  });

  it('marks absent regions as empty rather than leaving stale text', () => {
    const design = designFromTemplate('tpl-simple-ivory', { id: 'x', name: 'साधी' });
    const seeded = applyLayout(design, { narrative: ['पहिला मजकूर'] });
    const cleared = applyLayout(seeded.design, { narrative: [] });
    const narrative = cleared.design.elements.find((e) => e.role === 'narrative') as TextElement;
    expect(narrative.text).toBe('');
    expect(cleared.report.find((r) => r.role === 'narrative')?.action).toBe('empty');
  });

  it('records the shrink decision with the final font size for QA', () => {
    const design = buildInvitationDesign({ id: 'inv', name: 'पत्रिका' });
    const long = Array.from({ length: 30 }, (_, i) => `${i + 1}. कार्यक्रम तपशील ओळ`).join('\n');
    const { report } = applyLayout(design, { narrative: [long] });
    const entry = report.find((r) => r.role === 'narrative');
    expect(entry?.action).toBe('shrunk');
    expect(entry?.fontSizePt).toBeLessThan(12.5);
    expect(entry?.overflowRatio).toBeGreaterThan(1);
  });

  it('fills the subheadline region when one exists and clears it when absent', () => {
    const design = buildInvitationDesign({ id: 'sub', name: 'पत्रिका' });
    design.elements.push(textElement({
      id: 'subheadline', role: 'subheadline', y: 58, height: 12,
      text: 'पुराना उपशीर्षक',
    }));
    const filled = applyLayout(design, { headline: 'शुभ विवाह', subheadline: 'शुभ मंगल पर्व', narrative: ['ओळ'] });
    const sub = filled.design.elements.find((e) => e.role === 'subheadline') as TextElement;
    expect(sub.text).toBe('शुभ मंगल पर्व');
    expect(filled.report.find((r) => r.role === 'subheadline')?.action).toBe('unchanged');

    const cleared = applyLayout(filled.design, { headline: 'शुभ विवाह', narrative: ['ओळ'] });
    const emptied = cleared.design.elements.find((e) => e.role === 'subheadline') as TextElement;
    expect(emptied.text).toBe('');
    expect(cleared.report.find((r) => r.role === 'subheadline')?.action).toBe('empty');
  });
});

describe('renderer/SVG output', () => {
  it('renders millimetre-accurate SVG with viewBox offset by the bleed', () => {
    const design = buildInvitationDesign({ id: 'a', name: 'पत्रिका' });
    const svg = renderSvg(design, { print: true });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('width="133mm"');
    expect(svg).toContain('height="184mm"');
    expect(svg).toContain('viewBox="-3 -3 133 184"');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('is byte-for-byte deterministic for the same document', () => {
    const design = buildInvitationDesign({ id: 'det', name: 'निर्धारक', qrPayload: 'https://mazipatrika.in/e/det' });
    const a = renderSvg(design, { print: true, includeMetadata: false });
    const b = renderSvg(design, { print: true, includeMetadata: false });
    expect(a).toBe(b);
  });

  it('drops bleed and crop marks for screen output', () => {
    const design = buildInvitationDesign({ id: 's', name: 'स्क्रीन' });
    const svg = renderSvg(design, { print: false });
    expect(svg).toContain('viewBox="0 0 127 178"');
    expect(svg).not.toContain('crop-marks');
  });

  it('draws eight real crop-mark lines (four corners, two dashes each)', () => {
    const svg = renderSvg(buildInvitationDesign({ id: 'c', name: 'कापणी' }), { print: true });
    const markGroup = /<g id="crop-marks"[\s\S]*?<\/g>/.exec(svg)?.[0] ?? '';
    const lines = markGroup.match(/<line [^>]*\/>/g) ?? [];
    expect(lines).toHaveLength(8);
    for (const line of lines) {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((attr) => Number(new RegExp(`${attr}="([-\\d.]+)"`).exec(line)?.[1]));
      expect(x1 !== x2 || y1 !== y2).toBe(true);
    }
  });

  it('stretches full-page decoration into the bleed when printing', () => {
    const design = createBlankDesign({ id: 'bleed', name: 'ब्लीड' });
    design.elements = [{
      id: 'bg-art', name: 'पार्श्वभूमी', type: 'shape', shape: 'rect', motif: 'none', role: 'decoration',
      x: 0, y: 0, width: 127, height: 178, rotation: 0, opacity: 1, locked: true,
      fill: 'none', stroke: BRAND_PALETTE.gold, strokeWidthMm: 1,
    }];
    const screen = renderSvg(design, { print: false, includeMetadata: false });
    const print = renderSvg(design, { print: true, includeMetadata: false });
    expect(screen).toMatch(/id="bg-art"[^>]*x="0" y="0" width="127" height="178"/);
    expect(print).toMatch(/id="bg-art"[^>]*x="-3" y="-3" width="133" height="184"/);

    // A card-sized decoration is left exactly where the designer put it.
    const inner = { ...design.elements[0]!, id: 'inner-art', x: 12, y: 12, width: 60, height: 40 };
    const withInner: DesignDocument = { ...design, elements: [inner] };
    expect(renderSvg(withInner, { print: true, includeMetadata: false }))
      .toMatch(/id="inner-art"[^>]*x="12" y="12" width="60" height="40"/);
  });

  it('escapes user text so a name can never break the document', () => {
    const design = createBlankDesign({ id: 'esc', name: '<script>' });
    design.elements = [textElement({ text: 'पाटील & Sons <b>' })];
    const svg = renderSvg(design, { includeMetadata: false });
    expect(svg).toContain('पाटील &amp; Sons &lt;b&gt;');
    expect(svg).not.toContain('<script>');
    expect(svg).not.toContain('<b>');
  });

  it('injects @font-face rules pointing at self-hosted woff2 only', () => {
    const svg = renderSvg(buildInvitationDesign({ id: 'f', name: 'फॉन्ट' }), { fontBaseUrl: '/fonts' });
    expect(svg).toContain("@font-face");
    expect(svg).toContain('/fonts/noto-serif-devanagari');
    expect(svg).toContain('format(\'woff2\')');
    expect(svg).not.toContain('fonts.googleapis.com');
  });

  it('resolves {{binding}} tokens and blanks unknown ones', () => {
    expect(resolveBindings('श्री. {{groom.father}} यांचे', { 'groom.father': 'रमेश पाटील' }))
      .toBe('श्री. रमेश पाटील यांचे');
    expect(resolveBindings('फोन: {{missing}}', {})).toBe('फोन: ');
  });

  it('reports missing bindings instead of only rendering blanks', () => {
    const design = createBlankDesign({ id: 'bind', name: 'बाइंडिंग' });
    design.bindings = { 'groom.father': 'रमेश पाटील' };
    design.elements = [
      textElement({ id: 'a', text: 'श्री. {{groom.father}} यांचे' }),
      textElement({ id: 'b', text: '{{groom.mother}} यांची' }),
      textElement({ id: 'c', text: 'फोन: {{missing}} व {{groom.mother}}' }),
    ];
    expect(collectMissingBindings(design)).toEqual(['groom.mother', 'missing']);
    expect(collectMissingBindings(design, {
      'groom.father': 'रमेश पाटील', 'groom.mother': 'सौ. सुनीता', missing: 'x',
    })).toEqual([]);
  });

  it('carries renderer provenance in metadata for the export audit trail', () => {
    const svg = renderSvg(buildInvitationDesign({ id: 'm', name: 'मेटा' }));
    expect(svg).toContain('<metadata>');
    expect(svg).toContain(RENDERER_VERSION);
  });
});

describe('renderer/QR codes', () => {
  /** Module pitch and geometry of the rendered QR content box. */
  function qrGeometry(svg: string): { size: number; boxMm: number; contentMm: number; padMm: number } {
    const qrGroup = /<g id="qr"[\s\S]*?<\/g>/.exec(svg)?.[0] ?? '';
    const rects = [...qrGroup.matchAll(/<rect x="([-\d.]+)" y="[-\d.]+" width="([\d.]+)"/g)]
      .map((m) => ({ x: Number(m[1]), w: Number(m[2]) }));
    const bg = rects[0] ?? { x: 0, w: 0 };
    const moduleXs = [...new Set(rects.slice(1).map((r) => r.x))].sort((a, b) => a - b);
    const pitches = moduleXs.slice(1).map((x, i) => Number((x - moduleXs[i]!).toFixed(3))).filter((p) => p > 0.05);
    const pitch = Math.min(...pitches);
    const minX = moduleXs[0]!;
    const maxX = moduleXs[moduleXs.length - 1]!;
    const contentMm = maxX + pitch - minX;
    return {
      size: Math.round(contentMm / pitch),
      boxMm: bg.w,
      contentMm,
      padMm: minX - bg.x,
    };
  }

  it('encodes a real QR symbol: version 1 for a short payload, bigger for a URL', () => {
    const short = renderSvg(buildInvitationDesign({ id: 'q', name: 'QR', qrPayload: 'MAZI' }), { includeMetadata: false });
    expect(qrGeometry(short).size).toBe(21);

    const long = renderSvg(buildInvitationDesign({
      id: 'q2', name: 'QR2', qrPayload: 'https://mazipatrika.in/e/patil-vivah-2026/rsvp?guest=9822012345&src=print',
    }), { includeMetadata: false });
    const size = qrGeometry(long).size;
    expect(size).toBeGreaterThan(21);
    expect((size - 17) % 4).toBe(0); // every QR version increments by 4 modules
  });

  it('produces a denser matrix for a long event URL', () => {
    const short = renderSvg(buildInvitationDesign({ id: 'a', name: 'A', qrPayload: 'MAZI' }), { includeMetadata: false });
    const long = renderSvg(buildInvitationDesign({
      id: 'b', name: 'B',
      qrPayload: 'https://mazipatrika.in/e/patil-vivah-2026/rsvp?guest=9822012345&src=print',
    }), { includeMetadata: false });
    const count = (svg: string) => ((/<g id="qr"[\s\S]*?<\/g>/.exec(svg)?.[0] ?? '').match(/<rect /g) ?? []).length;
    expect(count(long)).toBeGreaterThan(count(short));
  });

  it('renders the QR inside its declared box with a real quiet zone', () => {
    const design = createBlankDesign({ id: 'qr', name: 'QR' });
    design.elements = [{
      id: 'qr', name: 'QR', type: 'qr', role: 'qr',
      x: 40, y: 120, width: 30, height: 30, rotation: 0, opacity: 1, locked: false,
      payload: 'https://mazipatrika.in/e/demo', quietZoneMm: 2,
      foreground: '#000000', background: '#FFFFFF', errorCorrectionLevel: 'M',
    }];
    const svg = renderSvg(design, { includeMetadata: false });
    expect(svg).toContain('x="40" y="120" width="30" height="30"');
    const geometry = qrGeometry(svg);
    expect(geometry.contentMm).toBeGreaterThan(0);
    expect(geometry.contentMm).toBeLessThan(geometry.boxMm);
    const pitch = geometry.contentMm / geometry.size;
    expect(geometry.padMm).toBeGreaterThanOrEqual(pitch * 4 - 0.01);
    expect(geometry.padMm).toBeGreaterThanOrEqual(2 - 0.01);
    expect(preflight(design).some((i) => i.code === 'qr-too-small')).toBe(false);
  });
});

describe('renderer/motif library', () => {
  it('draws deterministic procedural artwork for every cultural motif', () => {
    for (const motif of ['maharashtrian-border', 'warli', 'temple-arch', 'mandala', 'paithani'] as const) {
      const design = createBlankDesign({ id: `m-${motif}`, name: motif });
      design.elements = [{
        id: 'motif', name: motif, type: 'shape', shape: 'motif', motif,
        x: 0, y: 0, width: 127, height: 178, rotation: 0, opacity: 1, locked: true,
        role: 'decoration', stroke: BRAND_PALETTE.gold, strokeWidthMm: 0.6,
      }];
      const svg = renderSvg(design, { includeMetadata: false });
      // Every motif is pure vector geometry — no raster assets, no remote files.
      expect(svg, motif).toMatch(/<(path|circle|rect|line)/);
      expect(svg.length).toBeGreaterThan(400);
      expect(renderSvg(design, { includeMetadata: false })).toBe(svg);
    }
  });

  it('emits no Google Fonts or remote asset references anywhere', () => {
    const svg = renderSvg(designFromTemplate('tpl-paithani-royal', { id: 'p', name: 'पैठणी' }), { print: true });
    expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
  });

  it('renders schema-valid paisley shapes as real scaled paths', () => {
    const design = createBlankDesign({ id: 'paisley', name: 'कमळपान' });
    design.elements = [{
      id: 'pais', name: 'paisley', type: 'shape', shape: 'paisley', motif: 'none', role: 'decoration',
      x: 20, y: 40, width: 40, height: 60, rotation: 0, opacity: 1, locked: false,
      fill: BRAND_PALETTE.gold, stroke: BRAND_PALETTE.maroon, strokeWidthMm: 0.5,
    }];
    expect(parseDesign(design).ok).toBe(true);
    const svg = renderSvg(design, { includeMetadata: false });
    expect(svg).toMatch(/id="pais"[^>]*d="M [\d.]+ [\d.]+ C /);
    expect(svg).not.toMatch(/id="pais"[^>]*><\/path>/);
  });
});

describe('renderer/exporters', () => {
  it('builds print HTML with an exact @page size including bleed', () => {
    const design = designFromTemplate('tpl-paithani-royal', { id: 'print', name: 'छपाई' });
    const html = toPrintHtml(design);
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('@page { size: 133mm 184mm; margin: 0; }');
    expect(html).toContain('class="sheet"');
    expect(html).toContain('<svg');
    expect(html).toContain('lang="mr"');
  });

  it('exposes the auto-print hook only when asked', () => {
    const design = buildInvitationDesign({ id: 'auto', name: 'ऑटो' });
    expect(toPrintHtml(design)).not.toContain('window.print()');
    expect(toPrintHtml(design, { autoPrint: true })).toContain('window.print()');
  });

  it('tags social exports with platform dimensions and no bleed', () => {
    const design = buildInvitationDesign({ id: 'social', name: 'सोशल', preset: 'story-9x16' });
    const story = toSocialSvg(design, 'story');
    expect(story).toContain('data-target="story"');
    expect(story).toContain('data-size="1080x1920"');
    expect(story).not.toContain('crop-marks');
    expect(toSocialSvg(design, 'landscape')).toContain('data-size="1200x630"');
  });

  it('produces a web-embeddable inline SVG that scales responsively', () => {
    const svg = toWebInlineSvg(buildInvitationDesign({ id: 'web', name: 'वेब' }));
    expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
    expect(svg).not.toContain('<metadata>');
  });
});

describe('renderer/preview document integrity', () => {
  it('buildInvitationDesign produces a schema-valid, preflight-clean invitation', () => {
    for (const preset of ['invitation-5x7', 'invitation-a5', 'invitation-square'] as const) {
      const design = buildInvitationDesign({ id: `d-${preset}`, name: 'पत्रिका', preset, includeQr: true });
      const parsed = parseDesign(design);
      expect(parsed.ok, `${preset}: ${parsed.errors.join('; ')}`).toBe(true);
      expect(preflight(design).filter((i) => i.severity === 'error')).toEqual([]);
      expect(design.page.widthMm).toBe(PAGE_PRESETS[preset].widthMm);
    }
  });

  it('keeps every text region inside the printable safe area', () => {
    const design = buildInvitationDesign({ id: 'safe', name: 'सुरक्षित' });
    const texts = design.elements.filter((e) => e.type === 'text') as TextElement[];
    expect(texts.length).toBeGreaterThanOrEqual(5);
    for (const text of texts) {
      expect(text.x).toBeGreaterThanOrEqual(design.page.safeMarginMm - 0.5);
      expect(text.x + text.width).toBeLessThanOrEqual(design.page.widthMm - design.page.safeMarginMm + 0.5);
    }
  });
});
