import { designFromTemplate, getTemplatePreset, TEMPLATE_PRESETS, type DesignDocument } from '@mazi/design-schema';
import { composeInvitation, getEventType, type InvitationInput, type InvitationTone } from '@mazi/marathi';
import { renderSvg } from '@mazi/renderer';
import { buildInvitationFromTemplate } from '@mazi/renderer';

import { getStore } from '@/lib/store';
import { locationFor, panchangFor } from '@/lib/panchang';

/**
 * Create Studio — the design engine behind the invitation editor.
 *
 * The editor never mutates pixels. It edits a *document* (canonical Design JSON
 * v3); the SVG you see and the PDF the printer receives are both rendered from
 * that same document on the server. That is what makes WYSIWYP true rather than
 * aspirational.
 */

export interface StudioScheme {
  id: string;
  label: string;
  palette: Record<string, string>;
  style?: DesignDocument['theme']['style'];
}

/** Palettes derived from Maharashtrian material culture, not a generic colour wheel. */
export const STUDIO_SCHEMES: StudioScheme[] = [
  { id: 'paithani', label: 'पैठणी', palette: { primary: '#6B1D2A', accent: '#C6A15B', surface: '#FBF7F0', text: '#221C1A' }, style: 'paithani' },
  { id: 'haldi', label: 'हळद', palette: { primary: '#B96A0B', accent: '#E8B33C', surface: '#FFF6E0', text: '#40352A' }, style: 'modern' },
  { id: 'chandan', label: 'चंदन', palette: { primary: '#7A4A22', accent: '#D8A24A', surface: '#FCF4E7', text: '#332B29' }, style: 'traditional' },
  { id: 'kumkum', label: 'कुंकू', palette: { primary: '#A81E3C', accent: '#E3B04B', surface: '#FFF6F4', text: '#38242A' }, style: 'royal' },
  { id: 'warli', label: 'वारली', palette: { primary: '#221C1A', accent: '#B4462B', surface: '#F6EFE3', text: '#221C1A' }, style: 'warli' },
  { id: 'ratri', label: 'रात्री', palette: { primary: '#1B1B2F', accent: '#E0B75B', surface: '#101024', text: '#F4EAD8' }, style: 'modern' },
  { id: 'mor', label: 'मोर', palette: { primary: '#12403A', accent: '#C9A227', surface: '#F3F8F5', text: '#1B2C29' }, style: 'royal' },
  { id: 'rajwada', label: 'राजवाडा', palette: { primary: '#5A2A82', accent: '#D9B44A', surface: '#F9F5FF', text: '#2B2136' }, style: 'royal' },
];

export function schemeById(id: string): StudioScheme {
  return STUDIO_SCHEMES.find((scheme) => scheme.id === id) ?? STUDIO_SCHEMES[0]!;
}

export interface BuildDesignInput {
  slug: string;
  templateId?: string;
  schemeId?: string;
  name?: string;
  includeEnglish?: boolean;
  includePanchang?: boolean;
  includeQr?: boolean;
  note?: string;
  tone?: InvitationTone;
}

const PANCHANG_PAKSHA = { शुक्ल: 0, कृष्ण: 1 } as const;

/**
 * Build the design document for an event from live data:
 * the composed Marathi text, the real panchang of the chosen city/date, and the
 * public digital-page URL encoded into the QR.
 */
export function designForEvent(input: BuildDesignInput, origin = 'https://mazipatrika.in') {
  const store = getStore();
  const event = store.events.bySlug(input.slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');

  const templateId = input.templateId ?? TEMPLATE_PRESETS[0]!.id;
  const preset = getTemplatePreset(templateId);
  if (!preset) throw new Error('अज्ञात टेम्पलेट');

  const scheme = schemeById(input.schemeId ?? 'paithani');
  const spec = getEventType(event.eventType);
  const dateIso = event.eventDate ?? new Date().toISOString().slice(0, 10);
  const panchang = panchangFor(event.city, new Date(`${dateIso}T00:00:00Z`));
  const rsvpPhone = store.users.byId(event.ownerUserId)?.phone;

  const invitation: InvitationInput = {
    eventType: event.eventType,
    hosts: event.hostNames.map((name) => ({ name })),
    date: dateIso,
    venue: {
      name: event.venueName ?? event.city,
      ...(event.venueAddress ? { address: event.venueAddress } : {}),
      city: event.city,
    },
    panchang: {
      // The Marathi name tables are per-paksha (0–14): pass the tithi *within*
      // the paksha, not the absolute 0–29 index, or the name comes out empty.
      tithi: panchang.tithi.index % 15,
      paksha: PANCHANG_PAKSHA[panchang.tithi.paksha],
      nakshatra: panchang.nakshatra.index,
      ...(panchang.sunrise ? { sunrise: panchang.sunrise } : {}),
      ...(panchang.sunset ? { sunset: panchang.sunset } : {}),
      rahuKaal: { start: panchang.rahuKaal.start, end: panchang.rahuKaal.end },
      method: panchang.method.ephemeris,
    },
    schedule: [],
    ...(rsvpPhone ? { rsvp: { phone: rsvpPhone, url: `${origin}/e/${event.slug}` } } : { rsvp: { url: `${origin}/e/${event.slug}` } }),
    websiteUrl: `${origin}/e/${event.slug}`,
    tone: input.tone ?? 'traditional',
    register: 'formal',
    note: input.note ?? spec.invitation.subheadline,
  };

  const { design, composed } = buildInvitationFromTemplate({
    id: `dsg_${event.slug}_${templateId}_${scheme.id}`,
    name: input.name ?? `${spec.label} — ${scheme.label}`,
    templateId,
    invitation,
    includeEnglish: input.includeEnglish ?? false,
    includePanchang: input.includePanchang ?? true,
    ...(input.includeQr === false ? {} : { qrPayload: `${origin}/e/${event.slug}` }),
    ...(input.note ? { note: input.note } : {}),
  });

  // The palette in the document wins over the template default, so the preview
  // and the print proof can never disagree.
  design.page.background = scheme.palette.surface ?? design.page.background;
  design.theme.palette = { ...design.theme.palette, ...scheme.palette };
  if (scheme.style && scheme.style !== design.theme.style) design.theme.style = scheme.style;
  for (const element of design.elements) {
    if (element.type === 'text') {
      element.typography.color = scheme.palette.text ?? element.typography.color;
    }
    if (element.type === 'shape' && (element.role === 'decoration')) {
      element.stroke = scheme.palette.accent ?? element.stroke;
    }
  }

  return { design, composed, event, preset, scheme };
}

export interface PrintQuote {
  quantity: number;
  paper: string;
  finishing: string[];
  express: boolean;
  unitPricePaise: number;
  subtotalPaise: number;
  shippingPaise: number;
  expressPaise: number;
  gstPaise: number;
  totalPaise: number;
  commissionPaise: number;
  gatewayPaise: number;
  vendorPayoutPaise: number;
  contributionPaise: number;
}

/**
 * Print pricing.
 *
 * The per-card rate comes from the printer's *real* catalogue (seeded packages),
 * not from a hard-coded table, so a marketplace printer can change prices
 * without a deployment. Express, shipping, GST and our commission are modelled
 * explicitly — the contribution figure is what the business actually keeps.
 */
export function printQuote(args: {
  designId: string;
  quantity: number;
  paper: string;
  finishing: string[];
  express: boolean;
  vendorId?: string;
}): PrintQuote {
  const store = getStore();
  const quantity = Math.max(25, Math.min(5000, Math.round(args.quantity)));
  const printers = store.vendors.search({ category: 'printer', limit: 10 });
  const printer = (args.vendorId ? store.vendors.byId(args.vendorId) : undefined) ?? printers[0];

  const packages = printer ? store.vendors.packages(printer.id) : [];
  const matching = packages.find((pkg) => pkg.title.includes(args.paper)) ?? packages[0];
  const basePerCard = matching ? Math.round(matching.pricePaise / Math.max(25, matching.capacity ?? 100)) : 6_500;

  const tierFactor = quantity >= 1000 ? 0.72 : quantity >= 500 ? 0.82 : quantity >= 250 ? 0.92 : 1;
  const finishingCost: Record<string, number> = {
    'gold-foil': 900, 'silver-foil': 850, emboss: 700, deboss: 600, 'spot-uv': 650,
    'die-cut': 1100, 'laser-cut': 1600, 'round-corner': 200, ribbon: 350, 'insert-card': 700,
    envelope: 800, waxseal: 450,
  };
  const finishingPerCard = args.finishing.reduce((sum, code) => sum + (finishingCost[code] ?? 0), 0);

  const unitPricePaise = Math.round(basePerCard * tierFactor) + finishingPerCard;
  const subtotalPaise = unitPricePaise * quantity;
  const shippingPaise = subtotalPaise > 5_000_00 ? 0 : 9_900;
  const expressPaise = args.express ? Math.round(subtotalPaise * 0.18) : 0;
  const taxable = subtotalPaise + shippingPaise + expressPaise;
  const gstPaise = Math.round(taxable * 0.18);
  const totalPaise = taxable + gstPaise;

  const commissionPaise = Math.round(subtotalPaise * 0.15); // invitation/print take rate
  const gatewayPaise = Math.max(100, Math.round(totalPaise * 0.0236));
  const vendorPayoutPaise = totalPaise - commissionPaise - Math.round(gatewayPaise * 1.18);

  return {
    quantity,
    paper: args.paper,
    finishing: args.finishing,
    express: args.express,
    unitPricePaise,
    subtotalPaise,
    shippingPaise,
    expressPaise,
    gstPaise,
    totalPaise,
    commissionPaise,
    gatewayPaise,
    vendorPayoutPaise,
    contributionPaise: commissionPaise - gatewayPaise,
  };
}

