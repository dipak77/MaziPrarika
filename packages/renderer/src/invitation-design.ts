/**
 * @mazi/renderer — invitation composition.
 *
 * The bridge between *content* (`@mazi/marathi` composes the actual Marathi
 * sentences, honouring kinship, tone and ritual) and *form* (the canonical
 * Design JSON v3 document). Keeping this here — rather than in the web app —
 * means the print pipeline, the studio preview, the digital page and the
 * WhatsApp export all render the identical document from the identical input.
 */

import {
  composeInvitation,
  type ComposedInvitation,
  type InvitationInput,
  toDevanagariDigits,
} from '@mazi/marathi';

import {
  BRAND_PALETTE,
  DEFAULT_FONTS,
  designFromTemplate,
  getTemplatePreset,
  PAGE_PRESETS,
  type DesignDocument,
  type DesignElement,
  type PagePreset,
  type TextElement,
} from '@mazi/design-schema';

export interface InvitationDesignRequest {
  id: string;
  name: string;
  /** Template preset id from `TEMPLATE_PRESETS`. */
  templateId: string;
  invitation: InvitationInput;
  /** Overrides the template's page preset (e.g. print 5×7 → social 9:16). */
  pagePreset?: PagePreset;
  /** Public digital-page URL, embedded as a scannable QR on the card. */
  qrPayload?: string;
  /** English transliteration block, printed under the Marathi narrative. */
  includeEnglish?: boolean;
  /** Adds the printable panchang block (tithi / nakshatra / muhurat). */
  includePanchang?: boolean;
  /** Free-text line rendered above the footer, e.g. "आपल्या आशीर्वादासाठी". */
  note?: string;
}

export interface InvitationDesignResult {
  design: DesignDocument;
  composed: ComposedInvitation;
}

const SLOT_BY_EMPHASIS: Record<string, string> = {
  invocation: 'invocation',
  headline: 'headline',
  subheadline: 'subheadline',
  narrative: 'narrative',
  request: 'request',
  detail: 'details',
  note: 'note',
  closing: 'footer',
};

function pick(doc: DesignDocument, id: string): TextElement | undefined {
  const found = doc.elements.find((el) => el.id === id);
  return found && found.type === 'text' ? found : undefined;
}

function setText(doc: DesignDocument, id: string, text: string, sizePt?: number, weight?: number): void {
  const el = pick(doc, id);
  if (!el) return;
  el.text = text;
  if (sizePt) el.typography.sizePt = sizePt;
  if (weight) el.typography.weight = weight;
}

/** Long blocks get a slightly larger box; short ones stay optically centred. */
function growBox(el: TextElement, extraHeightMm: number): void {
  el.height += extraHeightMm;
}

function bulletLines(items: string[]): string {
  return items.filter(Boolean).join('\n');
}

/**
 * Build a print-ready invitation design from composed Marathi content.
 * Deterministic: same request in, same Design JSON out (no clock, no RNG).
 */
export function buildInvitationFromTemplate(request: InvitationDesignRequest): InvitationDesignResult {
  const preset = getTemplatePreset(request.templateId);
  if (!preset) throw new Error(`अज्ञात टेम्पलेट: ${request.templateId}`);

  const composed = composeInvitation({
    ...request.invitation,
    ...(request.includeEnglish ? { english: true } : {}),
    showBranding: request.invitation.showBranding ?? false,
  });

  const doc = designFromTemplate(request.templateId, { id: request.id, name: request.name });
  const pagePreset = request.pagePreset ?? preset.preset;
  if (pagePreset !== preset.preset) {
    const size = PAGE_PRESETS[pagePreset];
    const scale = Math.min(size.widthMm / doc.page.widthMm, size.heightMm / doc.page.heightMm);
    doc.preset = pagePreset;
    doc.page = {
      ...doc.page,
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      bleedMm: size.bleedMm,
      cropMarks: size.cropMarks,
      dpi: size.dpi,
      colorMode: size.colorMode,
    };
    for (const el of doc.elements) {
      el.x *= scale;
      el.y *= scale;
      el.width *= scale;
      el.height *= scale;
    }
  }

  const margin = doc.page.safeMarginMm;
  const width = doc.page.widthMm - margin * 2;

  /* ---- slot the composed lines into the template's text frames ---- */
  const head = pick(doc, 'headline');
  setText(doc, 'invocation', composed.invocation ?? '');
  if (!composed.invocation && head) head.y -= 8;
  setText(doc, 'headline', composed.headline, undefined, 700);
  setText(doc, 'subheadline', composed.subheadline ?? '');

  const narrative = composed.lines
    .filter((line) => line.emphasis === 'narrative')
    .map((line) => line.text);
  const narrativeEl = pick(doc, 'narrative');
  if (narrativeEl) {
    narrativeEl.text = narrative.join('\n');
    narrativeEl.role = 'narrative';
    if (narrative.length > 3) growBox(narrativeEl, (narrative.length - 3) * 4);
  }

  const detailLines = composed.details.map((detail) => `${detail.label}: ${detail.value}`);
  const scheduleLines = composed.schedule.map((item) => `${item.label} — ${item.value}`);

  const detailsEl = pick(doc, 'details');
  if (detailsEl) {
    const blocks = [
      ...(request.includePanchang ? composed.panchangLines : []),
      ...scheduleLines,
      ...detailLines,
      ...composed.contacts.map((contact) => `${contact.label}: ${contact.value}`),
    ];
    detailsEl.text = bulletLines(blocks);
    detailsEl.typography.sizePt = blocks.length > 8 ? 8.5 : 10;
    detailsEl.height = Math.max(detailsEl.height, 8 * blocks.length);
  }

  setText(doc, 'request', composed.request);
  setText(
    doc,
    'note',
    [request.note, composed.footer.rsvp].filter(Boolean).join('\n'),
    undefined,
    400,
  );
  setText(doc, 'footer', composed.footer.branding ?? '', 8, 400);

  if (request.includeEnglish && composed.englishText) {
    const source = pick(doc, 'narrative');
    if (source) {
      const english: TextElement = {
        ...source,
        id: 'english',
        name: 'english',
        text: composed.englishText,
        typography: { ...source.typography, family: DEFAULT_FONTS.ui, sizePt: 9, weight: 400, color: '#6B5B52' },
      };
      english.y = source.y + source.height + 3;
      english.height = 24;
      doc.elements.push(english);
    }
  }

  /* ---- QR back to the digital page (RSVP + maps + gallery) ---- */
  if (request.qrPayload) {
    const size = Math.min(26, width * 0.4);
    doc.elements.push({
      id: 'qr-digital',
      name: 'डिजिटल पान QR',
      type: 'qr',
      payload: request.qrPayload,
      x: doc.page.widthMm / 2 - size / 2,
      y: doc.page.heightMm - margin - size - 6,
      width: size,
      height: size,
      rotation: 0,
      opacity: 1,
      locked: false,
      role: 'decoration',
      foreground: BRAND_PALETTE.ink,
      background: '#FFFFFF',
      quietZoneMm: 2,
      errorCorrectionLevel: 'M',
    } satisfies Extract<DesignElement, { type: 'qr' }>);
  }

  return { design: doc, composed };
}

/** One-line WhatsApp/status text with a link — the most-used share channel. */
export function whatsappInviteText(result: InvitationDesignResult, url?: string): string {
  const lines = [result.composed.headline, '', result.composed.plainText.split('\n').filter(Boolean).slice(0, 6).join('\n')];
  if (url) lines.push('', `संपूर्ण पत्रिका व नकाशा: ${url}`);
  return lines.join('\n');
}

/** Human-readable label for the panchang block printed on the card. */
export function panchangBlockLabel(lines: string[]): string {
  if (!lines.length) return '';
  return ['पंचांग', ...lines.map((line) => `• ${line}`)].join('\n');
}

export { toDevanagariDigits };
