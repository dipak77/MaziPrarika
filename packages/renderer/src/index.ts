/**
 * @mazi/renderer — Design JSON → deterministic SVG scene → print/social output.
 *
 * Why SVG as the render model: it is text, so it diffs, caches, versions and
 * renders identically on the server (Chromium print → PDF), the edge, and the
 * browser. Canvas is used only for interactive editing; SVG is the source of
 * truth for anything that gets printed or shared.
 *
 * Smart Layout lives here: text that would overflow its region is shrunk to
 * the largest size that fits (never below `minSizePt`), and the layout engine
 * reports what it did so the quality gate can explain it to the user.
 */

import { createRequire } from 'node:module';

import {
  BRAND_PALETTE, DEFAULT_FONTS, PAGE_PRESETS,
  type DesignDocument, type DesignElement, type TextElement,
} from '@mazi/design-schema';

const require = createRequire(import.meta.url);
// `qrcode` is pure JS (no native deps) — real, scannable matrices, no fakery.
type QrMatrix = { size: number; data: Uint8Array | number[] };
type QrCreate = (text: string, opts: { errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' }) => { modules: QrMatrix };
const qrcode = require('qrcode') as { create: QrCreate };

export const RENDERER_VERSION = '1.0.0';

/* ------------------------------------------------------------------ */
/* Devanagari-aware text measurement                                   */
/* ------------------------------------------------------------------ */

export interface TextStyle {
  sizePt: number;
  family?: string;
  weight?: number;
  lineHeight?: number;
}

/**
 * Advance-width model for Devanagari (0.58em average incl. matras), Latin
 * (0.5em) and digits (0.52em). Calibrated against Noto Serif Devanagari at
 * 16pt and deliberately conservative — we would rather shrink text than clip it.
 */
export function measureTextWidthMm(text: string, style: TextStyle): number {
  const em = (style.sizePt * 25.4) / 72; // pt → mm
  const weightFactor = (style.weight ?? 400) >= 600 ? 1.04 : 1;
  let ems = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0900 && code <= 0x097f) ems += 0.58;
    else if (/[A-Za-z]/.test(ch)) ems += 0.5;
    else if (/\s/.test(ch)) ems += 0.28;
    else if (/[०-९0-9]/.test(ch)) ems += 0.52;
    else ems += 0.36;
  }
  return ems * em * weightFactor;
}

export interface WrappedText {
  lines: string[];
  /** Widest line in millimetres. */
  widthMm: number;
  heightMm: number;
  /** True when a single word is wider than the box (cannot be fixed by wrapping). */
  unbreakable: boolean;
}

/** Greedy wrap that never splits a Devanagari conjunct mid-way. */
export function wrapText(text: string, style: TextStyle, maxWidthMm: number): WrappedText {
  const words = text.split(/\s+/).filter(Boolean);
  let lines: string[] = [];
  let current = '';
  let unbreakable = false;

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureTextWidthMm(candidate, style) <= maxWidthMm || !current) {
      current = candidate;
      if (measureTextWidthMm(word, style) > maxWidthMm) unbreakable = true;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (!lines.length) lines = [''];

  const lineHeight = style.lineHeight ?? 1.35;
  const emMm = (style.sizePt * 25.4) / 72;
  return {
    lines,
    widthMm: Math.max(...lines.map((l) => measureTextWidthMm(l, style))),
    heightMm: lines.length * emMm * lineHeight,
    unbreakable,
  };
}

export interface FitResult {
  fontSizePt: number;
  wrapped: WrappedText;
  action: 'unchanged' | 'shrunk';
  /** Overflow ratio before fitting, for the QA report. */
  overflowRatio: number;
}

/** Largest font size (≤ requested) whose wrapped text fits the region. */
export function fitTextToRegion(text: string, element: TextElement): FitResult {
  const available = { width: element.width, height: element.height };
  let size = element.typography.sizePt;
  const styleAt = (pt: number): TextStyle => ({
    sizePt: pt, weight: element.typography.weight, lineHeight: element.typography.lineHeight,
  });

  const initial = wrapText(text, styleAt(element.typography.sizePt), available.width);
  const overflowRatio = initial.heightMm > available.height
    ? Number((initial.heightMm / available.height).toFixed(3))
    : 1;

  if (initial.heightMm <= available.height && !initial.unbreakable) {
    return { fontSizePt: size, wrapped: initial, action: 'unchanged', overflowRatio: 1 };
  }
  if (!element.autoFit) {
    return { fontSizePt: size, wrapped: initial, action: 'unchanged', overflowRatio };
  }

  const floor = element.minSizePt;
  let best = floor;
  for (let i = 0; i < 18 && size > floor; i += 1) {
    size = Math.max(floor, size - 0.5);
    const candidate = wrapText(text, styleAt(size), available.width);
    if (candidate.heightMm <= available.height && !candidate.unbreakable) {
      best = size;
      break;
    }
    best = size;
  }
  const finalWrap = wrapText(text, styleAt(best), available.width);
  return { fontSizePt: Number(best.toFixed(2)), wrapped: finalWrap, action: 'shrunk', overflowRatio };
}

/* ------------------------------------------------------------------ */
/* Smart Layout: fill document regions from composed invitation data   */
/* ------------------------------------------------------------------ */

export interface LayoutFillReport {
  elementId: string;
  role: string;
  action: 'unchanged' | 'shrunk' | 'empty';
  fontSizePt?: number;
  overflowRatio?: number;
}

export interface LayoutResult {
  design: DesignDocument;
  report: LayoutFillReport[];
}

/** Map composed invitation output onto the document's typed regions. */
export function applyLayout(
  design: DesignDocument,
  content: {
    invocation?: string | null;
    headline?: string;
    subheadline?: string;
    narrative: string[];
    request?: string;
    details?: Array<{ label: string; value: string }>;
    schedule?: Array<{ label: string; value: string }>;
    panchangLines?: string[];
    contacts?: Array<{ label: string; value: string }>;
    footer?: string;
  },
): LayoutResult {
  const report: LayoutFillReport[] = [];
  const elements = design.elements.map((el) => ({ ...el })) as DesignElement[];

  const fill = (role: string, text: string) => {
    const idx = elements.findIndex((e) => e.role === role && e.type === 'text');
    if (idx === -1) return;
    const element = elements[idx] as TextElement;
    if (!text.trim()) {
      elements[idx] = { ...element, text: '' };
      report.push({ elementId: element.id, role, action: 'empty' });
      return;
    }
    const fit = fitTextToRegion(text, element);
    elements[idx] = {
      ...element,
      text,
      typography: { ...element.typography, sizePt: fit.fontSizePt },
    } as TextElement;
    report.push({
      elementId: element.id,
      role,
      action: fit.action,
      fontSizePt: fit.fontSizePt,
      overflowRatio: fit.overflowRatio,
    });
  };

  fill('invocation', content.invocation ?? '');
  fill('headline', content.headline ?? '');
  fill('narrative', joinLines([
    ...content.narrative,
    ...(content.schedule ?? []).map((s) => `${s.label}: ${s.value}`),
  ]));
  fill('request', content.request ?? '');
  fill('detail', joinLines([
    ...(content.details ?? []).map((d) => `${d.label}: ${d.value}`),
    ...(content.panchangLines ?? []),
    ...(content.contacts ?? []).map((c) => `${c.label}: ${c.value}`),
  ]));
  fill('footer', content.footer ?? '');

  return { design: { ...design, elements, meta: { ...design.meta, updatedAt: new Date().toISOString() } }, report };
}

function joinLines(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join('\n');
}

/* ------------------------------------------------------------------ */
/* SVG scene                                                           */
/* ------------------------------------------------------------------ */

export interface RenderOptions {
  /** Include bleed + crop marks (print) or crop to page (screen). */
  print?: boolean;
  /** Embed @font-face rules referring to self-hosted woff2 (web/PDF). */
  fontBaseUrl?: string;
  /** Replace `{{binding}}` tokens before rendering. */
  bindings?: Record<string, string>;
  /** Adds an invisible structure layer for editors/tests. */
  includeMetadata?: boolean;
}

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function resolveBindings(text: string, bindings: Record<string, string>): string {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => bindings[key] ?? '');
}

/** Deterministic SVG for a design document (mm units, 1 user unit = 1 mm). */
export function renderSvg(design: DesignDocument, options: RenderOptions = {}): string {
  const { page } = design;
  const bleed = options.print ? page.bleedMm : 0;
  const width = page.widthMm + bleed * 2;
  const height = page.heightMm + bleed * 2;
  const bindings = options.bindings ?? design.bindings ?? {};

  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}mm" height="${round(height)}mm" viewBox="${-bleed} ${-bleed} ${round(width)} ${round(height)}" role="img" aria-label="${escapeXml(design.name)}">`);
  if (options.includeMetadata !== false) {
    parts.push(`<metadata>${escapeXml(JSON.stringify({ id: design.id, version: design.version, style: design.theme.style, renderer: RENDERER_VERSION }))}</metadata>`);
  }
  if (options.fontBaseUrl) parts.push(fontFaces(options.fontBaseUrl));

  parts.push(`<rect x="${-bleed}" y="${-bleed}" width="${round(width)}" height="${round(height)}" fill="${escapeXml(page.background)}"/>`);

  for (const el of design.elements) {
    // Full-page decorative artwork is stretched into the bleed so that trimming
    // never leaves a white sliver along the edge.
    const stretched = options.print && bleed > 0 && bleedsOut(el, page)
      ? { ...el, x: el.x - bleed, y: el.y - bleed, width: el.width + bleed * 2, height: el.height + bleed * 2 }
      : el;
    parts.push(renderElement(stretched as DesignElement, design, bindings, options));
  }

  if (options.print && page.cropMarks) parts.push(cropMarks(design));

  parts.push('</svg>');
  return parts.join('\n');
}

/** True when an element already spans the whole trim box (a background motif). */
function bleedsOut(el: DesignElement, page: DesignDocument['page']): boolean {
  if (el.role !== 'decoration' && el.type !== 'image') return false;
  const tolerance = 0.5;
  return el.x <= tolerance && el.y <= tolerance
    && el.x + el.width >= page.widthMm - tolerance
    && el.y + el.height >= page.heightMm - tolerance;
}

function renderElement(el: DesignElement, design: DesignDocument, bindings: Record<string, string>, options: RenderOptions): string {
  const opacity = el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';
  const transform = el.rotation ? ` transform="rotate(${el.rotation} ${round(el.x + el.width / 2)} ${round(el.y + el.height / 2)})"` : '';
  switch (el.type) {
    case 'text': {
      const text = resolveBindings(el.text, bindings);
      const fit = fitTextToRegion(text, el);
      const style = {
        sizePt: fit.fontSizePt, weight: el.typography.weight,
        lineHeight: el.typography.lineHeight, family: el.typography.family,
      };
      const wrapped = fit.wrapped;
      const lineHeightMm = (style.sizePt * 25.4) / 72 * (style.lineHeight ?? 1.35);
      const anchor = el.typography.align === 'left' ? 'start' : el.typography.align === 'right' ? 'end' : 'middle';
      const x = el.typography.align === 'left' ? el.x : el.typography.align === 'right' ? el.x + el.width : el.x + el.width / 2;
      const startY = el.y + (style.sizePt * 25.4) / 72;
      const tspans = wrapped.lines
        .map((line, i) => `<tspan x="${round(x)}" y="${round(startY + i * lineHeightMm)}">${escapeXml(line)}</tspan>`)
        .join('');
      return `<text id="${escapeXml(el.id)}" data-role="${el.role}" font-family="${escapeXml(style.family ?? DEFAULT_FONTS.body)}" font-size="${round(style.sizePt)}pt" font-weight="${style.weight}" fill="${escapeXml(el.typography.color)}" text-anchor="${anchor}"${opacity}${transform}>${tspans}</text>`;
    }
    case 'shape':
      return renderShape(el, design, opacity, transform);
    case 'image':
      return `<g id="${escapeXml(el.id)}" data-role="${el.role}"${opacity}${transform}><rect x="${round(el.x)}" y="${round(el.y)}" width="${round(el.width)}" height="${round(el.height)}" rx="${el.cornerRadiusMm}" fill="${escapeXml(el.frameColor ?? '#00000010')}" stroke="${el.frameColor ?? 'none'}"><title>${escapeXml(el.src)}</title></rect><text x="${round(el.x + el.width / 2)}" y="${round(el.y + el.height / 2)}" font-family="${escapeXml(DEFAULT_FONTS.ui)}" font-size="8pt" fill="#00000055" text-anchor="middle">फोटो: ${escapeXml(el.src.split('/').pop() ?? '')}</text></g>`;
    case 'qr':
      return renderQr(el, opacity, transform);
    case 'group':
      return `<g id="${escapeXml(el.id)}" data-role="${el.role}"${opacity}${transform}>${el.children.map((c) => renderElement(c as DesignElement, design, bindings, options)).join('')}</g>`;
  }
}

function renderShape(el: Extract<DesignElement, { type: 'shape' }>, design: DesignDocument, opacity: string, transform: string): string {
  const common = `id="${escapeXml(el.id)}" data-role="${el.role}"${opacity}${transform}`;
  const fill = el.fill ?? 'none';
  const stroke = el.stroke ?? 'none';
  switch (el.shape) {
    case 'rect':
      return `<rect ${common} x="${round(el.x)}" y="${round(el.y)}" width="${round(el.width)}" height="${round(el.height)}" fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${el.strokeWidthMm}"/>`;
    case 'circle':
      return `<circle ${common} cx="${round(el.x + el.width / 2)}" cy="${round(el.y + el.height / 2)}" r="${round(Math.min(el.width, el.height) / 2)}" fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${el.strokeWidthMm}"/>`;
    case 'line':
      return `<line ${common} x1="${round(el.x)}" y1="${round(el.y)}" x2="${round(el.x + el.width)}" y2="${round(el.y)}" stroke="${escapeXml(stroke)}" stroke-width="${el.strokeWidthMm}"/>`;
    case 'border':
      return `<rect ${common} x="${round(el.x)}" y="${round(el.y)}" width="${round(el.width)}" height="${round(el.height)}" fill="none" stroke="${escapeXml(stroke)}" stroke-width="${el.strokeWidthMm}"/>`;
    case 'divider':
      return divider(el, common, stroke);
    case 'motif':
      return motif(el, design, common, stroke);
    case 'custom-path':
      return `<path ${common} d="${escapeXml(el.path ?? '')}" fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${el.strokeWidthMm}"/>`;
    default:
      return '';
  }
}

function divider(el: Extract<DesignElement, { type: 'shape' }>, common: string, stroke: string): string {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const w = el.width;
  const s = escapeXml(stroke === 'none' ? BRAND_PALETTE.gold : stroke);
  return `<g ${common}>
  <line x1="${round(cx - w / 2)}" y1="${round(cy)}" x2="${round(cx - w * 0.06)}" y2="${round(cy)}" stroke="${s}" stroke-width="${el.strokeWidthMm}"/>
  <line x1="${round(cx + w * 0.06)}" y1="${round(cy)}" x2="${round(cx + w / 2)}" y2="${round(cy)}" stroke="${s}" stroke-width="${el.strokeWidthMm}"/>
  <circle cx="${round(cx)}" cy="${round(cy)}" r="${round(el.height * 0.12)}" fill="${s}"/>
  <circle cx="${round(cx - w * 0.16)}" cy="${round(cy)}" r="${round(el.height * 0.06)}" fill="${s}"/>
  <circle cx="${round(cx + w * 0.16)}" cy="${round(cy)}" r="${round(el.height * 0.06)}" fill="${s}"/>
</g>`;
}

/**
 * Cultural motif library — deterministic vector artwork so print output never
 * depends on a downloaded asset. (Warli, Paithani border, temple arch, mandala.)
 */
function motif(el: Extract<DesignElement, { type: 'shape' }>, design: DesignDocument, common: string, stroke: string): string {
  const color = escapeXml(stroke === 'none' ? (design.theme.palette.accent ?? BRAND_PALETTE.gold) : stroke);
  const { x, y, width, height } = el;
  const inset = Math.min(width, height) * 0.035;
  switch (el.motif) {
    case 'maharashtrian-border': {
      const teeth = 26;
      const step = width / teeth;
      let path = `M ${round(x)} ${round(y + inset)}`;
      for (let i = 0; i < teeth; i += 1) {
        const px = x + i * step;
        path += ` L ${round(px + step / 2)} ${round(y + inset * 2.6)} L ${round(px + step)} ${round(y + inset)}`;
      }
      let lower = `M ${round(x)} ${round(y + height - inset)}`;
      for (let i = 0; i < teeth; i += 1) {
        const px = x + i * step;
        lower += ` L ${round(px + step / 2)} ${round(y + height - inset * 2.6)} L ${round(px + step)} ${round(y + height - inset)}`;
      }
      return `<g ${common}>
  <rect x="${round(x + inset)}" y="${round(y + inset)}" width="${round(width - inset * 2)}" height="${round(height - inset * 2)}" fill="none" stroke="${color}" stroke-width="${el.strokeWidthMm}"/>
  <rect x="${round(x + inset * 2.2)}" y="${round(y + inset * 2.2)}" width="${round(width - inset * 4.4)}" height="${round(height - inset * 4.4)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.5)}"/>
  <path d="${path}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.6)}"/>
  <path d="${lower}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.6)}"/>
</g>`;
    }
    case 'warli': {
      // Warli grammar: triangles, circles, stick figures in white on earthen base.
      const size = Math.min(width, height) * 0.06;
      const cxo = x + width / 2;
      const cyo = y + height * 0.14;
      const figures = Array.from({ length: 5 }, (_, i) => {
        const fx = x + (width / 6) * (i + 1);
        return `<g><circle cx="${round(fx)}" cy="${round(cyo)}" r="${round(size * 0.22)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.8)}"/>
  <line x1="${round(fx)}" y1="${round(cyo + size * 0.22)}" x2="${round(fx)}" y2="${round(cyo + size * 0.9)}" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.8)}"/>
  <line x1="${round(fx - size * 0.3)}" y1="${round(cyo + size * 1.2)}" x2="${round(fx)}" y2="${round(cyo + size * 0.6)}" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.8)}"/>
  <line x1="${round(fx + size * 0.3)}" y1="${round(cyo + size * 1.2)}" x2="${round(fx)}" y2="${round(cyo + size * 0.6)}" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.8)}"/>
  <line x1="${round(fx - size * 0.35)}" y1="${round(cyo + size * 0.5)}" x2="${round(fx + size * 0.35)}" y2="${round(cyo + size * 0.5)}" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.8)}"/></g>`;
      }).join('\n');
      return `<g ${common}>
  <rect x="${round(x + inset)}" y="${round(y + inset)}" width="${round(width - inset * 2)}" height="${round(height - inset * 2)}" fill="none" stroke="${color}" stroke-width="${el.strokeWidthMm}"/>
  <path d="M ${round(x + inset * 2)} ${round(y + height * 0.24)} L ${round(cxo)} ${round(y + height * 0.10)} L ${round(x + width - inset * 2)} ${round(y + height * 0.24)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.7)}"/>
  ${figures}
</g>`;
    }
    case 'temple-arch': {
      const cxo = x + width / 2;
      const archTop = y + height * 0.08;
      const archBase = y + height * 0.3;
      return `<g ${common}>
  <path d="M ${round(x + inset)} ${round(archBase)} L ${round(x + inset)} ${round(y + height - inset)} L ${round(x + width - inset)} ${round(y + height - inset)} L ${round(x + width - inset)} ${round(archBase)} Q ${round(cxo)} ${round(archTop)} ${round(x + inset)} ${round(archBase)} Z" fill="none" stroke="${color}" stroke-width="${el.strokeWidthMm}"/>
  <path d="M ${round(cxo - width * 0.06)} ${round(archBase)} L ${round(cxo)} ${round(archTop + height * 0.05)} L ${round(cxo + width * 0.06)} ${round(archBase)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.7)}"/>
</g>`;
    }
    case 'mandala': {
      const cxo = x + width / 2;
      const cyo = y + height / 2;
      const r = Math.min(width, height) * 0.34;
      const petals = Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const px = cxo + Math.cos(angle) * r * 0.72;
        const py = cyo + Math.sin(angle) * r * 0.72;
        return `<circle cx="${round(px)}" cy="${round(py)}" r="${round(r * 0.06)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.5)}"/>`;
      }).join('');
      return `<g ${common}>
  <circle cx="${round(cxo)}" cy="${round(cyo)}" r="${round(r)}" fill="none" stroke="${color}" stroke-width="${el.strokeWidthMm}"/>
  <circle cx="${round(cxo)}" cy="${round(cyo)}" r="${round(r * 0.86)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.5)}"/>
  <circle cx="${round(cxo)}" cy="${round(cyo)}" r="${round(r * 0.34)}" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.7)}"/>
  ${petals}
</g>`;
    }
    case 'paithani': {
      const cells = 16;
      const sw = width / cells;
      const motifs = Array.from({ length: cells }, (_, i) => {
        const left = x + i * sw;
        return `<g><path d="M ${round(left + sw * 0.15)} ${round(y + height * 0.5)} Q ${round(left + sw * 0.5)} ${round(y + height * 0.12)} ${round(left + sw * 0.85)} ${round(y + height * 0.5)} Q ${round(left + sw * 0.5)} ${round(y + height * 0.88)} ${round(left + sw * 0.15)} ${round(y + height * 0.5)} Z" fill="none" stroke="${color}" stroke-width="${round(el.strokeWidthMm * 0.6)}"/><circle cx="${round(left + sw * 0.5)}" cy="${round(y + height * 0.5)}" r="${round(sw * 0.06)}" fill="${color}"/></g>`;
      }).join('');
      return `<g ${common}>${motifs}</g>`;
    }
    default:
      return '';
  }
}

function renderQr(el: Extract<DesignElement, { type: 'qr' }>, opacity: string, transform: string): string {
  const payload = el.payload || 'https://mazipatrika.in';
  const { modules } = qrcode.create(payload, { errorCorrectionLevel: el.errorCorrectionLevel });
  const size = modules.size;
  const moduleMm = el.width / size;
  const data = modules.data;
  const rects: string[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (data[row * size + col]) {
        rects.push(`<rect x="${round(el.x + col * moduleMm)}" y="${round(el.y + row * moduleMm)}" width="${round(moduleMm + 0.02)}" height="${round(moduleMm + 0.02)}"/>`);
      }
    }
  }
  return `<g id="${escapeXml(el.id)}" data-role="${el.role}"${opacity}${transform}><rect x="${round(el.x)}" y="${round(el.y)}" width="${round(el.width)}" height="${round(el.height)}" fill="${escapeXml(el.background)}"/><g fill="${escapeXml(el.foreground)}">${rects.join('')}</g><title>QR: ${escapeXml(payload)}</title></g>`;
}

/**
 * Printer's crop marks. Two short dashes per trim corner, living inside the
 * bleed margin (0.45 mm clear of the corner, 0.2 mm hairline) so the trimmer
 * can align the guillotine without the marks ever touching artwork.
 */
function cropMarks(design: DesignDocument): string {
  const { page } = design;
  const b = page.bleedMm;
  const w = page.widthMm;
  const h = page.heightMm;
  const gap = Math.min(0.6, b * 0.15);
  const len = Math.max(1.2, b - gap * 2);
  const stroke = BRAND_PALETTE.charcoal;
  const corners: Array<[number, number]> = [[0, 0], [w, 0], [0, h], [w, h]];

  const marks = corners.map(([cx, cy]) => {
    const sx = cx === 0 ? -1 : 1;
    const sy = cy === 0 ? -1 : 1;
    const x0 = round(cx + sx * gap);
    return `<line x1="${x0}" y1="${round(cy)}" x2="${round(cx + sx * (gap + len))}" y2="${round(cy)}" stroke="${stroke}" stroke-width="0.2"/>
    <line x1="${round(cx)}" y1="${round(cy + sy * gap)}" x2="${round(cx)}" y2="${round(cy + sy * (gap + len))}" stroke="${stroke}" stroke-width="0.2"/>`;
  }).join('\n');

  return `<g id="crop-marks" data-role="decoration" aria-hidden="true" stroke="${stroke}" fill="none">
${marks}</g>`;
}

/**
 * @font-face rules pointing at the self-hosted woff2 files in
 * `apps/web/public/fonts` — never a remote font CDN, so print output is
 * reproducible offline and no third party sees the guest's IP address.
 * Weights are declared only where the family actually ships them.
 */
function fontFaces(baseUrl: string): string {
  const families: Array<{ family: string; slug: string; weights: number[] }> = [
    { family: 'Noto Serif Devanagari', slug: 'noto-serif-devanagari', weights: [400, 700] },
    { family: 'Noto Sans Devanagari', slug: 'noto-sans-devanagari', weights: [400, 700] },
    { family: 'Tiro Devanagari Marathi', slug: 'tiro-devanagari-marathi', weights: [400] },
    { family: 'Inter', slug: 'inter', weights: [] },
  ];
  const rules: string[] = [];
  for (const { family, slug, weights } of families) {
    for (const weight of weights) {
      rules.push(`
    @font-face { font-family: '${family}'; src: url('${baseUrl}/${slug}/${slug}-devanagari-${weight}-normal.woff2') format('woff2'); font-weight: ${weight}; font-display: swap; }`);
    }
  }
  // Variable Inter covers the UI copy on exports that mix Marathi and English.
  rules.push(`
    @font-face { font-family: 'Inter'; src: url('${baseUrl}/inter-latin-wght-normal.woff2') format('woff2-variations'); font-weight: 100 900; font-display: swap; }`);
  return `<style type="text/css">${rules.join('')}</style>`;
}

const round = (n: number): number => Math.round(n * 1000) / 1000;

/* ------------------------------------------------------------------ */
/* Output adapters                                                     */
/* ------------------------------------------------------------------ */

/** Print-ready HTML page: @page size, embedded SVG, auto-print hook. */
export function toPrintHtml(design: DesignDocument, opts: { fontBaseUrl?: string; autoPrint?: boolean } = {}): string {
  const svg = renderSvg(design, { print: true, ...(opts.fontBaseUrl ? { fontBaseUrl: opts.fontBaseUrl } : {}), includeMetadata: false });
  const { widthMm, heightMm, bleedMm } = design.page;
  return `<!doctype html>
<html lang="mr"><head><meta charset="utf-8"/>
<title>${escapeXml(design.name)} — माझी पत्रिका</title>
<style>
  @page { size: ${round(widthMm + bleedMm * 2)}mm ${round(heightMm + bleedMm * 2)}mm; margin: 0; }
  html, body { margin: 0; padding: 0; background: #6b6b6b; }
  .sheet { width: ${round(widthMm + bleedMm * 2)}mm; height: ${round(heightMm + bleedMm * 2)}mm; margin: 0 auto; background: ${design.page.background}; }
  .sheet svg { display: block; width: 100%; height: 100%; }
  ${opts.autoPrint ? 'body { background: #6b6b6b; }\n  .toolbar { display: none; }' : ''}
</style></head>
<body><div class="sheet">${svg}</div>
${opts.autoPrint ? '<script>window.addEventListener("load", () => window.print());</script>' : ''}
</body></html>`;
}

/** Same SVG, sized for social/story export via raster pipeline (sharp/Playwright). */
export function toSocialSvg(design: DesignDocument, target: 'story' | 'square' | 'landscape' = 'story'): string {
  const dims = target === 'story' ? [1080, 1920] : target === 'square' ? [1080, 1080] : [1200, 630];
  const svg = renderSvg(design, { print: false, includeMetadata: false });
  return svg.replace('<svg ', `<svg data-target="${target}" data-size="${dims[0]}x${dims[1]}" `);
}

/** Public event page hero: the same design, screen-optimised. */
export function toWebInlineSvg(design: DesignDocument): string {
  const svg = renderSvg(design, { print: false, includeMetadata: false });
  return svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ');
}

/** Presets exported for the studio UI. */
export { PAGE_PRESETS };

/** The canonical document type, re-exported so consumers need one import. */
export type { DesignDocument, DesignElement, TextElement } from '@mazi/design-schema';

/** Content → design composition (invitations, biodata, certificates). */
export * from './invitation-design.js';

/* ------------------------------------------------------------------ */
/* Preview document used by the studio and tests                       */
/* ------------------------------------------------------------------ */

export function buildInvitationDesign(args: {
  id: string;
  name: string;
  preset?: keyof typeof PAGE_PRESETS;
  palette?: Record<string, string>;
  style?: DesignDocument['theme']['style'];
  includeQr?: boolean;
  qrPayload?: string;
  motifs?: Array<Extract<DesignElement, { type: 'shape' }>['motif']>;
}): DesignDocument {
  const preset = args.preset ?? 'invitation-5x7';
  const size = PAGE_PRESETS[preset];
  const palette = {
    primary: BRAND_PALETTE.maroon, accent: BRAND_PALETTE.gold,
    surface: BRAND_PALETTE.ivory, text: BRAND_PALETTE.charcoal, ...args.palette,
  };
  const now = new Date().toISOString();
  const margin = 12;
  const innerW = size.widthMm - margin * 2;
  const elements: DesignElement[] = [];

  for (const motif of args.motifs ?? ['maharashtrian-border']) {
    if (motif === 'none') continue;
    elements.push({
      id: `motif-${motif}`, name: motif, type: 'shape', shape: 'motif', motif,
      x: 0, y: 0, width: size.widthMm, height: size.heightMm,
      rotation: 0, opacity: 1, locked: true, role: 'decoration',
      stroke: palette.accent, strokeWidthMm: 0.55,
    });
  }

  elements.push({
    id: 'rule-top', name: 'सुवर्ण रेषा', type: 'shape', shape: 'divider', motif: 'none',
    x: margin, y: margin + 6, width: innerW, height: 6,
    rotation: 0, opacity: 1, locked: false, role: 'decoration',
    stroke: palette.accent, strokeWidthMm: 0.4,
  });

  const slots: Array<{ id: string; role: TextElement['role']; y: number; h: number; size: number; weight: number }> = [
    { id: 'invocation', role: 'invocation', y: margin + 16, h: 8, size: 10, weight: 500 },
    { id: 'headline', role: 'headline', y: margin + 26, h: 16, size: 24, weight: 700 },
    { id: 'narrative', role: 'narrative', y: margin + 46, h: size.heightMm - margin * 2 - 92, size: 12.5, weight: 400 },
    { id: 'request', role: 'request', y: size.heightMm - margin - 44, h: 14, size: 11.5, weight: 500 },
    { id: 'detail', role: 'detail', y: size.heightMm - margin - 28, h: 20, size: 10.5, weight: 400 },
    { id: 'footer', role: 'footer', y: size.heightMm - margin - 6, h: 6, size: 8.5, weight: 400 },
  ];

  for (const slot of slots) {
    elements.push({
      id: slot.id, name: slot.role, type: 'text', text: '', role: slot.role,
      x: margin, y: slot.y, width: innerW, height: slot.h,
      rotation: 0, opacity: 1, locked: false, autoFit: true, minSizePt: 8.5,
      typography: {
        family: DEFAULT_FONTS.display, sizePt: slot.size, weight: slot.weight,
        lineHeight: 1.45, letterSpacing: 0, color: palette.text!, align: 'center', trimTrailingSpace: true,
      },
    });
  }

  if (args.includeQr !== false) {
    elements.push({
      id: 'qr', name: 'QR कोड', type: 'qr',
      payload: args.qrPayload ?? 'https://mazipatrika.in/w/demo',
      x: size.widthMm / 2 - 12, y: size.heightMm - margin - 2, width: 24, height: 24,
      rotation: 0, opacity: 1, locked: false, role: 'qr', quietZoneMm: 2,
      foreground: palette.text!, background: palette.surface!,
      errorCorrectionLevel: 'M',
    });
  }

  return {
    version: 3, id: args.id, name: args.name, preset,
    page: {
      widthMm: size.widthMm, heightMm: size.heightMm, bleedMm: size.bleedMm,
      cropMarks: size.cropMarks, dpi: size.dpi, colorMode: size.colorMode,
      safeMarginMm: 8, background: palette.surface!,
    },
    elements,
    theme: { palette, fonts: { display: DEFAULT_FONTS.display, body: DEFAULT_FONTS.body, ui: DEFAULT_FONTS.ui }, style: args.style ?? 'paithani' },
    meta: { createdAt: now, updatedAt: now, print: { finishing: args.style === 'paithani' ? ['gold-foil'] : [], goldFoil: args.style === 'paithani', emboss: false } },
    bindings: {},
  };
}
