import { postingForPayment, priceQuote, type PriceBreakdown, type Quote } from '@mazi/commerce';
import type { Booking, Store } from '@mazi/store';

import { printBreakdown } from './gateway';

export interface WebhookPaymentEvent {
  provider: string;
  bookingId: string;
  outcome: 'captured' | 'failed';
  amountPaise: number;
  providerRef: string;
  idempotencyKey: string;
  raw: unknown;
}

export interface WebhookResult {
  outcome: 'captured' | 'failed' | 'replayed';
  paymentId: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null;
  return value as Record<string, unknown>;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function paise(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
}

export function normalizeWebhookEvent(body: unknown): WebhookPaymentEvent | null {
  const root = asRecord(body);
  if (!root) return null;
  const directId = text(root.bookingId);
  const directType = text(root.type);
  if (directId && directType && ['captured', 'failed', 'payment.captured', 'payment.failed'].includes(directType)) {
    const outcome = directType === 'failed' || directType === 'payment.failed' ? 'failed' : 'captured';
    const ref = text(root.providerRef) ?? text(root.paymentId) ?? `sim_${directId}`;
    return {
      provider: text(root.provider) ?? 'simulated',
      bookingId: directId,
      outcome,
      amountPaise: paise(root.amountPaise),
      providerRef: ref,
      idempotencyKey: text(root.idempotencyKey) ?? (outcome === 'captured' ? `${directId}:pay:advance` : `${directId}:pay:failed:${ref}`),
      raw: body,
    };
  }
  const event = text(root.event);
  if (!event) return null;
  const payload = asRecord(root.payload);
  if (!payload) return null;
  const paymentEntity = asRecord(asRecord(payload.payment)?.entity);
  const orderEntity = asRecord(asRecord(payload.order)?.entity);
  const notes = asRecord(paymentEntity?.notes) ?? asRecord(orderEntity?.notes);
  const bookingId =
    text(orderEntity?.receipt) ?? text(notes?.booking_id) ?? text(notes?.bookingId) ?? directId;
  const providerRef = text(paymentEntity?.id) ?? text(orderEntity?.id);
  if (!bookingId || !providerRef) return null;
  if (event === 'payment.captured' || event === 'order.paid') {
    return {
      provider: 'razorpay',
      bookingId,
      outcome: 'captured',
      amountPaise: paise(paymentEntity?.amount ?? orderEntity?.amount_paid ?? orderEntity?.amount),
      providerRef,
      idempotencyKey: `${bookingId}:pay:advance`,
      raw: body,
    };
  }
  if (event === 'payment.failed') {
    return {
      provider: 'razorpay',
      bookingId,
      outcome: 'failed',
      amountPaise: paise(paymentEntity?.amount),
      providerRef,
      idempotencyKey: `${bookingId}:pay:failed:${providerRef}`,
      raw: body,
    };
  }
  return null;
}

function breakdownForBooking(store: Store, booking: Booking): PriceBreakdown | null {
  const quote = booking.quoteId ? store.marketplace.quoteById(booking.quoteId) : undefined;
  const lead = booking.leadId ? store.marketplace.leadById(booking.leadId) : undefined;
  if (quote && lead) {
    return priceQuote({
      id: quote.id,
      vendorId: quote.vendorId,
      ...(quote.eventId ? { eventId: quote.eventId } : {}),
      category: lead.category as Quote['category'],
      items: quote.items,
      discountPaise: quote.discountPaise,
      validTill: quote.validTill,
      status: 'accepted',
    });
  }
  if (booking.id.startsWith('bk_prt_') && booking.eventId) {
    const orderId = booking.id.slice(3);
    const order = store.designs
      .printOrders({ eventId: booking.eventId })
      .find((candidate) => candidate.id === orderId);
    if (order) {
      const subtotal = order.unitPricePaise * order.quantity;
      const taxable = subtotal + order.shippingPaise;
      return printBreakdown({
        subtotalPaise: subtotal,
        shippingPaise: order.shippingPaise,
        expressPaise: 0,
        gstPaise: order.totalPaise - taxable,
        totalPaise: order.totalPaise,
        commissionPaise: booking.commissionPaise,
      });
    }
  }
  return null;
}

export function handleWebhookPayment(store: Store, event: WebhookPaymentEvent): WebhookResult {
  return store.transaction(() => {
    const booking = store.bookings.byId(event.bookingId);
    if (!booking) throw new Error(`बुकिंग सापडली नाही: ${event.bookingId}`);
    if (event.outcome === 'failed') {
      const failed = store.bookings.recordPayment({
        bookingId: event.bookingId,
        kind: 'advance',
        provider: event.provider,
        providerRef: event.providerRef,
        amountPaise: event.amountPaise,
        status: 'failed',
        idempotencyKey: event.idempotencyKey,
        raw: event.raw,
      });
      if (!failed.duplicate) {
        store.audit.record({
          actor: 'system',
          action: 'payment.failed',
          entity: 'payment',
          entityId: failed.id,
          after: {
            bookingId: event.bookingId,
            amountPaise: event.amountPaise,
            provider: event.provider,
            providerRef: event.providerRef,
          },
        });
      }
      return { outcome: failed.duplicate ? 'replayed' : 'failed', paymentId: failed.id };
    }
    const captured = store.bookings.recordPayment({
      bookingId: event.bookingId,
      kind: 'advance',
      provider: event.provider,
      providerRef: event.providerRef,
      amountPaise: event.amountPaise,
      status: 'captured',
      idempotencyKey: event.idempotencyKey,
      raw: event.raw,
    });
    if (captured.duplicate) return { outcome: 'replayed', paymentId: captured.id };
    const breakdown = breakdownForBooking(store, booking);
    if (breakdown) {
      const at = new Date().toISOString();
      store.bookings.appendLedger(
        postingForPayment({ orderId: event.bookingId, breakdown, at }).entries.map((entry) => ({
          id: entry.id,
          bookingId: event.bookingId,
          account: entry.account,
          amountPaise: entry.amountPaise,
          memo: entry.memo,
          idempotencyKey: entry.idempotencyKey,
          createdAt: entry.at,
        })),
      );
    }
    if (booking.state === 'PAYMENT_PENDING') {
      store.bookings.updateState(event.bookingId, { state: 'BOOKING_CONFIRMED', actor: 'system' });
    }
    store.audit.record({
      actor: 'system',
      action: 'payment.captured',
      entity: 'payment',
      entityId: captured.id,
      after: {
        bookingId: event.bookingId,
        amountPaise: event.amountPaise,
        kind: 'advance',
        provider: event.provider,
      },
    });
    return { outcome: 'captured', paymentId: captured.id };
  });
}
