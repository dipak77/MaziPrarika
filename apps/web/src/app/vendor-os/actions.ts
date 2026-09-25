'use server';

import { revalidatePath } from 'next/cache';
import { getStore } from '@/lib/store';
import { vendorDeskId } from '@/lib/vendor-desk';

export async function respondLeadAction(leadId: string) {
  const store = getStore();
  const vendorId = await vendorDeskId();
  const lead = store.marketplace.leadById(leadId);
  if (!lead) return;
  if (lead.vendorId !== vendorId) return;
  if (lead.status === 'won' || lead.status === 'lost' || lead.status === 'expired') return;
  const at = new Date().toISOString();
  store.transaction(() => {
    store.marketplace.updateLead(leadId, {
      status: lead.status === 'new' || lead.status === 'viewed' ? 'responded' : lead.status,
      respondedAt: lead.respondedAt ?? at,
    });
    store.audit.record({
      actor: vendorId,
      action: 'lead.responded',
      entity: 'lead',
      entityId: leadId,
      after: { from: lead.status },
      at,
    });
  });
  revalidatePath('/vendor-os');
  revalidatePath('/vendor');
}

export async function declineLeadAction(leadId: string) {
  const store = getStore();
  const vendorId = await vendorDeskId();
  const lead = store.marketplace.leadById(leadId);
  if (!lead) return;
  if (lead.vendorId !== vendorId) return;
  if (lead.status === 'won' || lead.status === 'lost' || lead.status === 'expired') return;
  const at = new Date().toISOString();
  store.transaction(() => {
    store.marketplace.updateLead(leadId, { status: 'lost' });
    store.audit.record({
      actor: vendorId,
      action: 'lead.declined',
      entity: 'lead',
      entityId: leadId,
      after: { from: lead.status },
      at,
    });
  });
  revalidatePath('/vendor-os');
  revalidatePath('/vendor');
}
