# Commerce: pricing, commission, ledger, bookings

All of the money arithmetic lives in `packages/commerce/src/index.ts`. Nothing in the app is allowed to invent a total: a quote, a booking, a print order and a seeded demo row all go through the same functions. That is the single most important commercial property of this codebase — a marketplace whose numbers can differ between screens cannot be audited, financed or trusted.

## 1. The pricing waterfall

`priceQuote(quote)` returns a `PriceBreakdown`:

```
subtotal      = Σ (quantity × unitPricePaise)                 [optional items excluded]
discount      = min(discountPaise, subtotal)
taxable       = subtotal − discount
GST           = round(taxable × 18%)
customerTotal = taxable + GST                                  ← what the family pays
commission    = round(taxable × categoryRate)                   ← platform revenue
platformFee   = round(taxable × 0%)
gatewayFee    = round(customerTotal × 2.36%)                    ← Razorpay-like: 2% + GST on the fee
gatewayFeeGst = round(gatewayFee × 18%)
vendorPayout  = taxable − commission − platformFee              ← what the vendor receives
contribution  = commission + platformFee − gatewayFee − gatewayFeeGst
```

Worked example — the quote the E2E test sends (₹1,45,000 + 6 × ₹9,500 − ₹4,000 discount, lighting at 8%):

| Line | Amount |
| --- | --- |
| Subtotal | ₹2,02,000 |
| Discount | ₹4,000 |
| Taxable | ₹1,98,000 |
| GST @ 18 % | ₹35,640 |
| **Customer pays** | **₹2,33,640** |
| Commission @ 8 % | ₹15,840 |
| Gateway fee + GST @ 2.36 % / 18 % | ₹5,515 |
| Vendor payout | ₹1,82,160 |
| Advance collected (20 % of total) | ₹46,728 |

`npm run test:e2e` asserts each of those numbers against the database, using the live rate table rather than a copied literal.

## 2. Commission rates (published, not assumed)

The plan called for 8–10 % Growth / 3–5 % Pro tiers; the shipped table is a per-category rate that reflects how much work the platform does in each category, and it is **the truth the product uses**:

| Rate | Categories |
| --- | --- |
| **15 %** | printer, invitation, gifting |
| **12 %** | photographer, videographer, makeup, mehendi, cake, florist |
| **10 %** | decorator, caterer, dj, sound, transport, bhangra, anchor, choreographer, other |
| **8 %** | venue, tent, lighting, security |
| **5 %** | priest, accommodation, planner |

Rates are a single exported record (`COMMISSION_RATES`), so a Growth→Pro negotiation is a data change with a test, not a code hunt. The vendor desk **shows the vendor their own rate and the arithmetic** (`छायाचित्रण १२%`), because a commission that appears only on the invoice is a commission that gets disputed.

## 3. The ledger is ours; the gateway is only evidence

The plan's rule: *a gateway is never the source of truth.* Implemented as a double-entry ledger with signed amounts (debit positive, credit negative), so **every balanced posting sums to exactly zero — per booking and platform-wide**.

Chart of accounts: `CUSTOMER_RECEIVABLE`, `PLATFORM_CASH`, `GATEWAY_FEES`, `GST_PAYABLE`, `VENDOR_PAYABLE`, `PLATFORM_REVENUE`, `REFUND_PAYABLE`, `DISPUTE_RESERVE`.

A confirmed booking posts six lines:

| Account | Amount | Memo |
| --- | --- | --- |
| `PLATFORM_CASH` | +customerTotal | ग्राहकाकडून पेमेंट |
| `GATEWAY_FEES` | +gatewayFee + gatewayGst | गेटवे शुल्क + GST |
| `PLATFORM_CASH` | −(gatewayFee + gatewayGst) | गेटवे शुल्क वजा |
| `VENDOR_PAYABLE` | −vendorPayout | विक्रेत्याची देय रक्कम |
| `GST_PAYABLE` | −GST | GST देय |
| `PLATFORM_REVENUE` | −commission | कमिशन उत्पन्न |

Settlement then closes the vendor liability (`VENDOR_PAYABLE → PLATFORM_CASH`) when money actually leaves the bank, with the UTR recorded on the settlement row.

`reconcileLedger(entries)` returns `{ balanced, byAccount, duplicateKeys }`, and the admin console renders it as a health check rather than a report:

> ✓ लेजर शून्य-योग — 46 नोंदी, सर्व बुकिंग शून्यावर
> ✓ दुहेरी आयडेंपोटन्सी की — पेमेंट पुन्हा नोंदवले जात नाही
> ✓ प्रलंबित सेटलमेंट — 2 विक्रेत्यांची रक्कम प्रलंबित
> ✓ तक्रारी — 1 चालू तक्रार

## 4. Idempotency, the hard way

Three independent layers, because "the customer tapped accept twice on a slow phone" is the normal case, not the edge case:

1. **Derived ids** — the booking is `bk_<quoteId>`. The identifier itself is the guard.
2. **Unique keys in the database** — `payments.idempotency_key` and `ledger_entries.idempotency_key` are unique; a replayed webhook is `INSERT OR IGNORE`d, and `recordPayment()` returns `{duplicate: true}` instead of double-charging.
3. **One transaction** — booking, ledger, payment, state change, calendar hold, quote/lead update and both audit rows commit together or not at all.

The E2E test performs the double tap on purpose and asserts one booking, one payment and zero duplicated ledger keys.

## 5. Booking state machine

```
ENQUIRY → QUOTE_SENT → QUOTE_ACCEPTED → PAYMENT_PENDING → BOOKING_CONFIRMED
        → SERVICE_SCHEDULED → SERVICE_COMPLETED → SETTLEMENT → REVIEWED
                ↘ CANCELLED (from any pre-service state)   ↘ DISPUTED → resolved
```

- Transitions are recorded in `bookings.history` with actor, timestamp and (where relevant) a reason; the admin console, the vendor desk and the customer surface read the same history.
- The vendor desk's "customer accepted" demo button walks `QUOTE_ACCEPTED → PAYMENT_PENDING → BOOKING_CONFIRMED` in one transaction and refuses to run twice.
- A booking holds the vendor's calendar day only when `availabilityState()` says the slot is bookable, so a vendor with `teamCapacity: 2` can take a second booking on the same date, and one with `teamCapacity: 1` cannot.

## 6. Cancellation and refunds

`DEFAULT_CANCELLATION_POLICY` encodes tiered refunds (30+ days: full refund minus gateway fees; nearer the event: progressively less; a non-refundable advance share) and refunds the platform fee when the vendor is at fault. `postingForRefund()` produces the matching ledger posting (`REFUND_PAYABLE`, `PLATFORM_REVENUE`, `GATEWAY_FEES` adjusted), so a refund is an accounting event, not a deleted row.

## 7. Discovery ranking, trust and ads

`rankForDiscovery()` composes organic quality and, where relevant, sponsored placement — with two non-negotiable rules:

1. **Sponsored results must clear the organic floor.** A paying vendor cannot buy their way past a badly-reviewed competitor into a family's shortlist; the API drops sponsored rows that do not clear it.
2. **Sponsored results are labelled** («प्रायोजित»), and the API reports `sponsoredCount` so the surface can be audited.

Trust badges (`trustBadges(vendor)`) are derived from the `evidence` JSON on the vendor row — verified GST/Udyam, portfolio depth, completed events, response rate — so a badge is a statement with a paper trail behind it.

`adPerformance(campaign)` returns spend, impressions, profile views, leads, quotes, bookings, ROAS and cost-per-lead. The admin console and the vendor desk show the same numbers, including the uncomfortable ones (a campaign with 19 leads and 2 bookings shows ROAS — not a highlight reel).

## 8. Print economics

Print orders use the same primitives (subtotal → discount → GST → total) with print-specific modifiers computed in the studio engine: tier pricing by quantity (₹ ×0.72 at 1000+, ×0.82 at 500+, ×0.92 at 250+), finishing options (₹200–1,600 per card), express surcharge (+18 %), free shipping above ₹5,000, and a **15 % print commission** — the highest rate in the table, because invitations are where the platform does the most work (design, proof, press liaison, delivery).
