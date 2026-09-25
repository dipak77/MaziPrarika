import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getStore } from '@/lib/store';
import { verifyWebhookSignature } from '@/lib/payments/gateway';
import { handleWebhookPayment, normalizeWebhookEvent } from '@/lib/payments/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  const signature =
    request.headers.get('x-razorpay-signature') ?? request.headers.get('x-payment-signature') ?? '';
  if (!verifyWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ ok: false, error: 'अवैध स्वाक्षरी' }, { status: 400 });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'अवैध विनंती' }, { status: 400 });
  }
  const event = normalizeWebhookEvent(body);
  if (!event) return NextResponse.json({ ok: true, ignored: true });
  try {
    const result = handleWebhookPayment(getStore(), event);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message.includes('सापडली नाही')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }
    throw error;
  }
}
