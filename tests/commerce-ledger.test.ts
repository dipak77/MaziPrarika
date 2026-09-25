import { describe, it, expect } from 'vitest';
import {
  priceQuote,
  postingForPayment,
  postingForSettlement,
  postingForRefund,
  reconcileLedger,
  transitionBooking,
  type Quote,
  type LedgerEntry,
} from '@mazi/commerce';

describe('Financial Ledger & State Machine Module (Phase 2)', () => {
  const sampleQuote: Quote = {
    id: 'qt_test_101',
    vendorId: 'vnd_pune_kulkarni_studio',
    eventId: 'evt_patil_vivah',
    category: 'photographer',
    items: [
      { label: 'पारंपरिक लग्न फोटोग्राफी व व्हिडिओ', quantity: 1, unit: 'दिवस', unitPricePaise: 40_000_00 },
      { label: 'प्री-वेडिंग टीझर व ड्रोन शूट', quantity: 1, unit: 'सत्र', unitPricePaise: 15_000_00 },
    ],
    discountPaise: 5_000_00,
    validTill: '2026-12-31',
    status: 'accepted',
  };

  const breakdown = priceQuote(sampleQuote);

  it('calculates mathematically sound quote breakdown with GST and platform commission', () => {
    expect(breakdown.subtotalPaise).toBe(55_000_00);
    expect(breakdown.discountPaise).toBe(5_000_00);
    expect(breakdown.taxablePaise).toBe(50_000_00);
    // 18% GST on 50,000 = 9,000
    expect(breakdown.gstPaise).toBe(9_000_00);
    expect(breakdown.customerTotalPaise).toBe(59_000_00);
    // Photographer commission is 12% of taxable = 6,000
    expect(breakdown.commissionPaise).toBe(6_000_00);
  });

  it('creates zero-sum balanced journal for initial booking payment', () => {
    const paymentPosting = postingForPayment({
      orderId: 'bk_test_101',
      breakdown,
      at: '2026-10-01T10:00:00.000Z',
    });

    expect(paymentPosting.balanced).toBe(true);
    const sum = paymentPosting.entries.reduce((acc, e) => acc + e.amountPaise, 0);
    expect(sum).toBe(0);

    const accounts = paymentPosting.entries.map((e) => e.account);
    expect(accounts).toContain('PLATFORM_CASH');
    expect(accounts).toContain('VENDOR_PAYABLE');
    expect(accounts).toContain('GST_PAYABLE');
    expect(accounts).toContain('PLATFORM_REVENUE');
    expect(accounts).toContain('GATEWAY_FEES');
  });

  it('creates zero-sum balanced journal for vendor payout settlement', () => {
    const settlementPosting = postingForSettlement({
      orderId: 'bk_test_101',
      breakdown,
      at: '2026-11-25T18:00:00.000Z',
    });

    expect(settlementPosting.balanced).toBe(true);
    const sum = settlementPosting.entries.reduce((acc, e) => acc + e.amountPaise, 0);
    expect(sum).toBe(0);

    // Vendor payable debited, platform cash credited (disbursed)
    const payable = settlementPosting.entries.find((e) => e.account === 'VENDOR_PAYABLE');
    const cash = settlementPosting.entries.find((e) => e.account === 'PLATFORM_CASH');
    expect(payable?.amountPaise).toBe(breakdown.vendorPayoutPaise);
    expect(cash?.amountPaise).toBe(-breakdown.vendorPayoutPaise);
  });

  it('creates zero-sum balanced contra-entries for full and partial refunds', () => {
    // 50% partial refund
    const refundAmount = Math.round(breakdown.customerTotalPaise / 2);
    const refundPosting = postingForRefund({
      orderId: 'bk_test_101',
      breakdown,
      refundPaise: refundAmount,
      at: '2026-10-05T12:00:00.000Z',
    });

    expect(refundPosting.balanced).toBe(true);
    const sum = refundPosting.entries.reduce((acc, e) => acc + e.amountPaise, 0);
    expect(sum).toBe(0);

    // Platform cash debited (outflow), GST payable credited (reversed), Vendor payable reversed
    const cash = refundPosting.entries.find((e) => e.account === 'PLATFORM_CASH');
    expect(cash?.amountPaise).toBe(-refundAmount);
  });

  it('reconciles entire ledger lifecycle without discrepancy or duplicate keys', () => {
    const payment = postingForPayment({ orderId: 'bk_test_101', breakdown });
    const refund = postingForRefund({
      orderId: 'bk_test_101',
      breakdown,
      refundPaise: 10_000_00,
      refundId: 'ref_1',
    });

    const allEntries: LedgerEntry[] = [
      ...payment.entries.map((e, i) => ({ ...e, id: `led_pay_${i}` })),
      ...refund.entries.map((e, i) => ({ ...e, id: `led_ref_${i}` })),
    ];

    const result = reconcileLedger(allEntries);
    expect(result.balanced).toBe(true);
    expect(result.duplicateKeys).toHaveLength(0);
  });

  describe('Booking State Machine Transitions', () => {
    it('allows valid progressive lifecycle transitions by authorized actors', () => {
      // 1. QUOTE_ACCEPTED -> PAYMENT_PENDING
      const step1 = transitionBooking({
        from: 'QUOTE_ACCEPTED',
        to: 'PAYMENT_PENDING',
        actor: 'customer',
      });
      expect(step1.ok).toBe(true);

      // 2. PAYMENT_PENDING -> BOOKING_CONFIRMED
      const step2 = transitionBooking({
        from: 'PAYMENT_PENDING',
        to: 'BOOKING_CONFIRMED',
        actor: 'system',
      });
      expect(step2.ok).toBe(true);

      // 3. BOOKING_CONFIRMED -> SERVICE_SCHEDULED
      const step3a = transitionBooking({
        from: 'BOOKING_CONFIRMED',
        to: 'SERVICE_SCHEDULED',
        actor: 'system',
      });
      expect(step3a.ok).toBe(true);

      // 4. SERVICE_SCHEDULED -> SERVICE_COMPLETED
      const step3b = transitionBooking({
        from: 'SERVICE_SCHEDULED',
        to: 'SERVICE_COMPLETED',
        actor: 'vendor',
      });
      expect(step3b.ok).toBe(true);

      // 5. SERVICE_COMPLETED -> SETTLEMENT
      const step4 = transitionBooking({
        from: 'SERVICE_COMPLETED',
        to: 'SETTLEMENT',
        actor: 'admin',
      });
      expect(step4.ok).toBe(true);
    });

    it('blocks illegal state jumps (e.g. ENQUIRY directly to SERVICE_COMPLETED)', () => {
      const illegalJump = transitionBooking({
        from: 'ENQUIRY',
        to: 'SERVICE_COMPLETED',
        actor: 'vendor',
      });
      expect(illegalJump.ok).toBe(false);
      expect(illegalJump.error).toContain('संक्रमण शक्य नाही');
    });

    it('blocks unauthorized actors from triggering protected transitions', () => {
      // A customer cannot mark settlement completed
      const unauthorized = transitionBooking({
        from: 'SERVICE_COMPLETED',
        to: 'SETTLEMENT',
        actor: 'customer',
      });
      expect(unauthorized.ok).toBe(false);
      expect(unauthorized.error).toContain('संक्रमण');
    });
  });
});
