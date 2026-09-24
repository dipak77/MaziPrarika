import { NextResponse } from 'next/server';

import { EPHEMERIS_VERSION } from '@mazi/panchang';
import { DESIGN_SCHEMA_VERSION } from '@mazi/design-schema';
import { RENDERER_VERSION } from '@mazi/renderer';
import { COMMERCE_VERSION } from '@mazi/commerce';
import { AI_GATEWAY_VERSION } from '@mazi/ai-gateway';
import { LATEST_SCHEMA_VERSION } from '@mazi/store';

import { getStore } from '@/lib/store';
import { assistantLedger } from '@/lib/assistant';

/** GET /api/health — the probe used by the uptime monitor and the admin page. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  const store = getStore();
  const integrity = store.db.prepare('SELECT COUNT(*) AS vendors FROM vendors').get();
  const unbalanced = store.db
    .prepare('SELECT COUNT(*) AS c FROM (SELECT booking_id, SUM(amount_paise) AS total FROM ledger_entries GROUP BY booking_id HAVING total <> 0)')
    .get();

  const budgetInr = Number(process.env.AI_MONTHLY_BUDGET_INR ?? 25000);
  const spendUsd = assistantLedger().totalUsd();

  const checks = {
    database: Number(integrity?.vendors ?? 0) >= 0,
    ledgerBalanced: Number(unbalanced?.c ?? 0) === 0,
    aiBudget: spendUsd * 88 <= budgetInr,
  };

  return NextResponse.json(
    {
      status: Object.values(checks).every(Boolean) ? 'ok' : 'degraded',
      checks,
      versions: {
        store: LATEST_SCHEMA_VERSION,
        designSchema: DESIGN_SCHEMA_VERSION,
        renderer: RENDERER_VERSION,
        panchang: EPHEMERIS_VERSION,
        commerce: COMMERCE_VERSION,
        aiGateway: AI_GATEWAY_VERSION,
      },
      ai: { spendUsd: Number(spendUsd.toFixed(4)), monthlyBudgetInr: budgetInr, provider: process.env.AI_PROVIDER ?? 'deterministic' },
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
