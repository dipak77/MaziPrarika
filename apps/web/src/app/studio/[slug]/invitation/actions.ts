'use server';

import { revalidatePath } from 'next/cache';

import { TEMPLATE_PRESETS } from '@mazi/design-schema';
import { composeInvitation } from '@mazi/marathi';
import { renderSvg } from '@mazi/renderer';

import { getStore } from '@/lib/store';

import { designForEvent, printQuote } from './studio';

/**
 * Server actions for the invitation studio. Everything that writes goes through
 * here, validates its input, and records an audit entry — the pure design and
 * pricing engines live in `./studio`.
 */

/** Persist a build as a new design version (append-only history). */
export async function saveDesignAction(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) throw new Error('कार्यक्रम सापडला नाही');

  const templateId = String(formData.get('templateId') ?? TEMPLATE_PRESETS[0]!.id);
  const schemeId = String(formData.get('schemeId') ?? 'paithani');
  const { design, composed } = designForEvent({
    slug,
    templateId,
    schemeId,
    includeEnglish: formData.get('includeEnglish') === 'on',
    includePanchang: formData.get('includePanchang') === 'on',
    includeQr: formData.get('includeQr') === 'on',
    ...(String(formData.get('note') ?? '').trim() ? { note: String(formData.get('note')).trim().slice(0, 200) } : {}),
  });

  const previewSvg = renderSvg(design, { print: false });
  const owner = event.ownerUserId;
  const existing = store.designs.list({ eventId: event.id, limit: 20 }).find((d) => d.id === design.id);

  if (existing) {
    store.designs.save(design.id, design, {
      previewSvg,
      scheme: schemeId,
      name: design.name,
      note: `पुन्हा तयार — ${templateId}`,
    });
  } else {
    store.designs.create({
      id: design.id,
      eventId: event.id,
      ownerUserId: owner,
      name: design.name,
      templateId,
      preset: design.preset,
      scheme: schemeId,
      doc: design,
      previewSvg,
      status: 'draft',
    });
  }

  store.audit.record({
    actor: owner,
    action: existing ? 'design.versioned' : 'design.created',
    entity: 'design',
    entityId: design.id,
    after: { templateId, schemeId, quality: composed.quality.score },
  });

  revalidatePath(`/studio/${slug}/invitation`);
  revalidatePath(`/studio/${slug}`);
}

/** Advance the design through review → approved → printing. */
export async function setDesignStatusAction(formData: FormData): Promise<void> {
  const store = getStore();
  const slug = String(formData.get('slug') ?? '');
  const designId = String(formData.get('designId') ?? '');
  const status = String(formData.get('status') ?? '') as 'draft' | 'review' | 'approved' | 'printing' | 'archived';
  const design = store.designs.byId(designId);
  if (!design) throw new Error('पत्रिका सापडली नाही');

  store.designs.save(design.id, design.doc, { status, name: design.name });
  store.audit.record({
    actor: design.ownerUserId,
    action: 'design.status',
    entity: 'design',
    entityId: designId,
    before: { status: design.status },
    after: { status },
  });
  revalidatePath(`/studio/${slug}/invitation`);
  revalidatePath(`/studio/${slug}`);
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

/** Place the print order: design → proof → printer, with a ledger-safe order row. */
export async function placePrintOrderAction(formData: FormData): Promise<void> {
  const store = getStore();
  const slug = String(formData.get('slug') ?? '');
  const designId = String(formData.get('designId') ?? '');
  const event = store.events.bySlug(slug);
  const design = store.designs.byId(designId);
  if (!event || !design) throw new Error('ऑर्डरसाठी माहिती अपूर्ण आहे');

  const quantity = Number(formData.get('quantity') ?? 100) || 100;
  const paper = String(formData.get('paper') ?? 'matte-300gsm');
  const finishing = formData.getAll('finishing').map((value) => String(value));
  const express = formData.get('express') === 'on';
  const quote = printQuote({ designId, quantity, paper, finishing, express });

  const printer = store.vendors.search({ category: 'printer', limit: 1 })[0];
  const order = store.designs.createPrintOrder({
    id: `prt_${Math.random().toString(36).slice(2, 9)}`,
    eventId: event.id,
    designId: design.id,
    ...(printer ? { vendorId: printer.id } : {}),
    quantity: quote.quantity,
    paper,
    finishing,
    express,
    status: 'placed',
    unitPricePaise: quote.unitPricePaise,
    shippingPaise: quote.shippingPaise + quote.expressPaise,
    totalPaise: quote.totalPaise,
    proofUrl: `/api/designs/${design.id}/print?proof=1`,
  });

  // Same document, next stage — the printer never receives a stale artwork.
  store.designs.save(design.id, design.doc, { status: 'printing', name: design.name });

  store.audit.record({
    actor: design.ownerUserId,
    action: 'print.order_placed',
    entity: 'print_order',
    entityId: order.id,
    after: {
      designId: design.id, quantity: quote.quantity, paper, finishing,
      totalPaise: quote.totalPaise, commissionPaise: quote.commissionPaise,
    },
  });

  revalidatePath(`/studio/${slug}/invitation`);
  revalidatePath(`/studio/${slug}`);
}

/** A ready-to-share Marathi text for WhatsApp — the channel that actually works. */
export async function whatsappTextAction(slug: string): Promise<string> {
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) return '';
  const composed = composeInvitation({
    eventType: event.eventType,
    hosts: event.hostNames.map((name) => ({ name })),
    date: event.eventDate ?? new Date().toISOString().slice(0, 10),
    venue: { name: event.venueName ?? event.city, city: event.city },
    websiteUrl: `/e/${event.slug}`,
    showBranding: true,
  });
  return composed.whatsappText;
}
