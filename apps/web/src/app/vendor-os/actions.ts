'use server';

import { revalidatePath } from 'next/cache';
import { getStore } from '@/lib/store';

const NEXT_STATUS: Record<string, 'new' | 'quoted' | 'won' | 'lost'> = {
  new: 'quoted',
  contacted: 'quoted',
  quoted: 'won',
};

export async function advanceLeadAction(leadId: string) {
  const store = getStore();
  const lead = store.marketplace.leadById(leadId);
  if (!lead) return;

  const target = NEXT_STATUS[lead.status];
  if (target) {
    store.marketplace.updateLead(leadId, { status: target });
    revalidatePath('/vendor-os');
    revalidatePath('/vendor');
  }
}

export async function declineLeadAction(leadId: string) {
  const store = getStore();
  store.marketplace.updateLead(leadId, { status: 'lost' });
  revalidatePath('/vendor-os');
  revalidatePath('/vendor');
}
