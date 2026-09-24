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
  let store;
  try {
    store = getStore();
  } catch {
    return NextResponse.json({ status: 'degraded', checks: { database: false, ledgerBalanced: false, aiBudget: true }, latencyMs: Date.now() - started, checkedAt: new Date().toISOString() }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
  const integrity = store.db.prepare('SELECT COUNT(*) AS vendors FROM vendors').get() as { vendors?: number } | undefined;
  const unbalanced = store.db
    .prepare('SELECT COUNT(*) AS c FROM (SELECT booking_id, SUM(amount_paise) AS total FROM ledger_entries GROUP BY booking_id HAVING total <> 0)')
    .get() as { c?: number } | undefined;

  const usdCapRaw = process.env.ASSISTANT_MONTHLY_USD_CAP;
  const inrBudgetRaw = process.env.AI_MONTHLY_BUDGET_INR;
  const monthlyBudgetUsd =
    usdCapRaw !== undefined && usdCapRaw !== '' && Number.isFinite(Number(usdCapRaw)) ? Number(usdCapRaw) : undefined;
  const budgetInr =
    inrBudgetRaw !== undefined && inrBudgetRaw !== '' && Number.isFinite(Number(inrBudgetRaw)) ? Number(inrBudgetRaw) : 25000;
  const capUsd = monthlyBudgetUsd ?? budgetInr / 88;
  const spendUsd = assistantLedger().totalUsd();

  const checks = {
    database: Number(integrity?.vendors ?? 0) >= 0,
    ledgerBalanced: Number(unbalanced?.c ?? 0) === 0,
    aiBudget: spendUsd <= capUsd,
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
      ai: {
        spendUsd: Number(spendUsd.toFixed(4)),
        ...(monthlyBudgetUsd !== undefined ? { monthlyBudgetUsd } : {}),
        monthlyBudgetInr: budgetInr,
        provider: process.env.AI_PROVIDER ?? 'deterministic',
      },
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    },
    { status: Object.values(checks).every(Boolean) ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  );
}
