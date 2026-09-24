import 'server-only';

import { runAssistant, type AssistantTurn, type ToolContext } from '@mazi/ai-gateway';
import { availabilityState, rupees } from '@mazi/commerce';
import { budgetFromTemplate, getEventType, planFromTemplate } from '@mazi/marathi';
import { CostLedger, ResponseCache } from '@mazi/ai-gateway';

import { getStore } from '@/lib/store';
import { locationFor } from '@/lib/panchang';

/**
 * Wiring the AI gateway to the real platform.
 *
 * Everything the assistant can touch goes through this context — the model never
 * receives database access, and every mutating tool creates an audit entry.
 */

const ledger = new CostLedger();
const cache = new ResponseCache();

export function assistantLedger(): CostLedger {
  return ledger;
}

export function toolContext(): ToolContext {
  const store = getStore();

  return {
    cityToLocation: (city: string) => {
      const location = locationFor(city);
      return {
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        tzOffsetHours: location.tzOffsetHours,
      };
    },

    searchVendors: async (args) => {
      const found = store.vendors.search({
        category: args.category,
        ...(args.city ? { city: args.city } : {}),
        ...(args.maxPricePaise ? { maxPricePaise: args.maxPricePaise } : {}),
        limit: args.limit,
      });
      return found.map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        city: vendor.city,
        startingPricePaise: vendor.startingPricePaise,
        rating: vendor.rating,
        verified: vendor.identityVerified || vendor.gstVerified,
      }));
    },

    getAvailability: async ({ vendorId, date }) => {
      const slots = store.vendors.availability(vendorId, date, date);
      return availabilityState(slots, { vendorId, date });
    },

    getBudget: async ({ eventType, budgetPaise }) => {
      const spec = getEventType(eventType);
      return budgetFromTemplate(spec.key, budgetPaise).map((line) => ({
        category: line.category,
        label: line.label,
        estimatedPaise: line.estimated,
      }));
    },

    createEvent: async (args) => {
      const eventType = getEventType(String(args.eventType ?? 'other'));
      const date = String(args.date ?? new Date().toISOString().slice(0, 10));
      const city = String(args.city ?? 'पुणे');
      const budgetPaise = Number(args.budgetPaise ?? 0);
      const guestCount = Number(args.guestCount ?? eventType.defaultGuestCount);

      const slugBase = `${eventType.key}-${date}-${Math.random().toString(36).slice(2, 6)}`;
      const owner = ensureDemoUser();

      const event = store.transaction(() => {
        const created = store.events.create({
          id: `evt_${Math.random().toString(36).slice(2, 9)}`,
          slug: slugBase,
          ownerUserId: owner.id,
          eventType: eventType.key,
          title: `${eventType.label} — ${city}`,
          hostNames: [owner.name],
          eventDate: date,
          city,
          guestCountExpected: guestCount,
          budgetTargetPaise: budgetPaise,
          status: 'planning',
        });

        // Budget lines and the phase plan come from the cultural taxonomy, so a
        // new event is never an empty shell.
        if (budgetPaise > 0) {
          for (const [index, line] of budgetFromTemplate(eventType.key, budgetPaise).entries()) {
            store.events.upsertBudgetItem({
              id: `${created.id}_bud${index + 1}`,
              eventId: created.id,
              category: line.category,
              label: line.label,
              estimatedPaise: line.estimated,
              committedPaise: 0,
              paidPaise: 0,
              status: 'planned',
            });
          }
        }
        for (const [index, task] of planFromTemplate(eventType.key, `${date}T00:00:00Z`).entries()) {
          store.events.addTask({
            id: `${created.id}_task${index + 1}`,
            eventId: created.id,
            title: task.title,
            category: task.phase,
            dueDate: task.dueDate,
            status: 'open',
            priority: task.critical ? 1 : 2,
            ...(task.owner ? { owner: task.owner } : {}),
          });
        }

        store.audit.record({
          actor: owner.id,
          action: 'event.created',
          entity: 'event',
          entityId: created.id,
          after: { title: created.title, date: created.eventDate, city: created.city, budgetPaise },
        });

        return created;
      });

      return { id: event.id, slug: event.slug };
    },
  };
}

/** The demo runs as a single seeded household; production uses the session. */
export function ensureDemoUser() {
  const store = getStore();
  const existing = store.users.byId('usr_c_ramesh');
  if (existing) return existing;
  return store.users.create({ id: 'usr_c_ramesh', role: 'customer', name: 'श्री. रमेश पाटील', phone: '9822012345', city: 'पुणे' });
}

export interface AssistantRequest {
  message: string;
  confirmMutations?: boolean;
  eventSlug?: string;
}

export async function askAssistant(request: AssistantRequest): Promise<AssistantTurn> {
  const store = getStore();
  const conversationId = `conv_${request.eventSlug ?? 'web'}`;
  const provider = (process.env.AI_PROVIDER ?? 'deterministic') as 'deterministic' | 'groq' | 'anthropic';
  const apiKey = provider === 'groq' ? process.env.GROQ_API_KEY : provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : undefined;

  const turn = await runAssistant({
    message: request.message,
    ctx: toolContext(),
    confirmMutations: request.confirmMutations ?? false,
    generate: {
      config: { provider, ...(apiKey ? { apiKey } : {}) },
      cache,
      ledger,
      userId: 'usr_c_ramesh',
      purpose: 'assistant.setup',
    },
  });

  // Persist the exchange so the conversation survives a reload and the cost
  // ledger stays auditable.
  try {
    const conversations = store.assistant.conversationsForUser('usr_c_ramesh');
    if (!conversations.some((c) => c.id === conversationId)) {
      store.assistant.createConversation({ id: conversationId, userId: 'usr_c_ramesh', title: 'AI सेटअप' });
    }
    store.assistant.addMessage({
      conversationId,
      role: 'user',
      content: request.message,
      toolCalls: [],
    });
    store.assistant.addMessage({
      conversationId,
      role: 'assistant',
      content: turn.answer,
      toolCalls: turn.report.results.map((result) => ({ tool: result.tool, ok: result.ok })),
      provider: turn.provider.provider,
      model: turn.provider.model,
      tokensIn: turn.provider.usage.inputTokens,
      tokensOut: turn.provider.usage.outputTokens,
      latencyMs: turn.provider.latencyMs,
    });
  } catch {
    // Persistence of the transcript must never break the user's request.
  }

  return turn;
}

export { rupees };
