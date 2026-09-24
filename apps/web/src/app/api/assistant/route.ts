import { NextResponse } from 'next/server';
import { z } from 'zod';

import { askAssistant, ensureDemoUser } from '@/lib/assistant';
import { getStore } from '@/lib/store';

/**
 * POST /api/assistant — the AI setup endpoint.
 *
 * The model only *proposes*; the deterministic engines decide. Mutating tools
 * require `confirm: true` from the client, so a chat message can never quietly
 * create bookings or place print orders.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  message: z.string().min(2).max(1200),
  confirm: z.boolean().optional(),
  eventSlug: z.string().max(80).optional(),
});

// A simple per-instance rate limit: the assistant is the most expensive route.
const hits = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 30;
const WINDOW_MS = 60_000;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(request: Request) {
  const key = request.headers.get('x-forwarded-for') ?? 'local';
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: 'खूप विनंत्या झाल्या — एका मिनिटाने पुन्हा प्रयत्न करा.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'अवैध विनंती.' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'मजकूर आवश्यक आहे (२–१२०० अक्षरे).' }, { status: 400 });
  }

  try {
    ensureDemoUser();
    const turn = await askAssistant({
      message: parsed.data.message,
      confirmMutations: parsed.data.confirm ?? false,
      ...(parsed.data.eventSlug ? { eventSlug: parsed.data.eventSlug } : {}),
    });

    const store = getStore();
    const eventSlug = turn.report.createdEvent?.slug;
    const event = eventSlug ? store.events.bySlug(eventSlug) : undefined;

    return NextResponse.json({
      answer: turn.answer,
      summary: turn.plan.summary,
      clarifications: turn.plan.clarifications,
      plan: turn.plan.calls.map((call) => ({
        tool: call.tool,
        rationale: call.rationale,
        requiresConfirmation: call.requiresConfirmation,
        args: call.args,
      })),
      results: turn.report.results.map((result) => ({
        tool: result.tool,
        ok: result.ok,
        error: result.error,
        requiresConfirmation: result.requiresConfirmation,
      })),
      pendingConfirmation: turn.report.pendingConfirmation,
      vendors: turn.report.vendors.slice(0, 6),
      muhurats: turn.report.muhurats.slice(0, 5).map((m) => ({
        date: m.date, weekday: m.weekday, score: m.score, band: m.band,
      })),
      budget: turn.report.budget ?? [],
      event: event ? { slug: event.slug, title: event.title, id: event.id } : null,
      provider: { id: turn.provider.provider, model: turn.provider.model, fallback: turn.provider.fallback, latencyMs: turn.provider.latencyMs },
      guardrail: { allowed: turn.guardrail.allowed, category: turn.guardrail.category },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'सहाय्यक अनुपलब्ध आहे.' },
      { status: 500 },
    );
  }
}
