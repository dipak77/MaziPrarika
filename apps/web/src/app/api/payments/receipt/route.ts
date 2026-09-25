import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const designId = new URL(request.url).searchParams.get('designId') ?? '';
  const store = getStore();
  const design = designId ? store.designs.byId(designId) : undefined;
  if (!design) {
    return NextResponse.json({ ok: false, error: 'पत्रिका सापडली नाही' }, { status: 404 });
  }
  const orders = design.eventId ? store.designs.printOrders({ eventId: design.eventId }) : [];
  const order = orders.find((candidate) => candidate.designId === design.id);
  if (!order) return NextResponse.json({ ok: true, order: null, payment: null });
  const bookingId = `bk_${order.id}`;
  const payments = store.bookings.byId(bookingId) ? store.bookings.payments(bookingId) : [];
  const payment = payments.find((candidate) => candidate.status === 'captured') ?? payments[0];
  return NextResponse.json({
    ok: true,
    order: { id: order.id, totalPaise: order.totalPaise, status: order.status, createdAt: order.createdAt },
    payment: payment
      ? { status: payment.status, amountPaise: payment.amountPaise, provider: payment.provider }
      : null,
  });
}
