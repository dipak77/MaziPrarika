import { createHmac, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

import { gatewayFeeBreakdown, type PriceBreakdown } from '@mazi/commerce';

export type PaymentAdapter = 'simulated' | 'razorpay';

export function paymentAdapter(): PaymentAdapter {
  return process.env.PAYMENT_ADAPTER === 'razorpay' ? 'razorpay' : 'simulated';
}

export interface GatewayOrderInput {
  bookingId: string;
  amountPaise: number;
}

export interface GatewayOrder {
  orderId: string;
  amount: number;
}

interface RazorpayClient {
  orders: {
    create: (args: Record<string, unknown>) => Promise<{ id: unknown; amount: unknown }>;
  };
}

export async function createOrder(input: GatewayOrderInput): Promise<GatewayOrder> {
  const amount = Number.isFinite(input.amountPaise) ? Math.max(0, Math.round(input.amountPaise)) : 0;
  if (paymentAdapter() === 'simulated') {
    return { orderId: `sim_${input.bookingId}`, amount };
  }
  const keyId = process.env.RAZORPAY_KEY_ID ?? '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
  if (!keyId || !keySecret) {
    throw new Error('Razorpay की नाहीत — PAYMENT_ADAPTER=simulated वापरा');
  }
  let client: RazorpayClient;
  try {
    const loaded = (await import(/* webpackIgnore: true */ 'razorpay')) as {
      default: new (opts: { key_id: string; key_secret: string }) => RazorpayClient;
    };
    client = new loaded.default({ key_id: keyId, key_secret: keySecret });
  } catch {
    throw new Error('razorpay पॅकेज स्थापित नाही — npm i razorpay चालवा');
  }
  const order = await client.orders.create({
    amount,
    currency: 'INR',
    receipt: input.bookingId.slice(0, 40),
    notes: { booking_id: input.bookingId },
  });
  return { orderId: String(order.id), amount: Number(order.amount) };
}

export function verifyWebhookSignature(raw: string | Buffer, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac('sha256', secret).update(raw).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature.trim(), 'hex');
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export interface PrintBreakdownInput {
  subtotalPaise: number;
  shippingPaise: number;
  expressPaise: number;
  gstPaise: number;
  totalPaise: number;
  commissionPaise: number;
}

export function printBreakdown(input: PrintBreakdownInput): PriceBreakdown {
  const taxable = input.subtotalPaise + input.shippingPaise + input.expressPaise;
  const fee = gatewayFeeBreakdown(taxable);
  const commission = Math.max(0, Math.round(input.commissionPaise));
  return {
    subtotalPaise: input.subtotalPaise,
    discountPaise: 0,
    taxablePaise: taxable,
    gstPaise: input.gstPaise,
    customerTotalPaise: input.totalPaise,
    platformFeePaise: 0,
    gatewayFeePaise: fee.gatewayFeePaise,
    gatewayFeeGstPaise: fee.gatewayFeeGstPaise,
    commissionPaise: commission,
    vendorPayoutPaise: taxable - commission,
    contributionPaise: commission - fee.totalPaise,
    takeRate: taxable > 0 ? Number((commission / taxable).toFixed(4)) : 0,
  };
}
