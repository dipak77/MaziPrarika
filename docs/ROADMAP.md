# Roadmap

Ordered by what unblocks revenue, not by what is fun. Every item names the trigger that promotes it, so "later" stays honest instead of becoming "never".

## Shipped (this repository)

- Design JSON v3 → deterministic SVG → print HTML / social export, with 12 presets × 8 schemes and print maths in millimetres.
- Panchang engine: tithi, nakshatra, yoga, karana, choghadiya, rahu kaal, abhijit, per city, with muhurat suitability scoring and published methodology.
- Event workspace: readiness, budget ledger, guests with Marathi relation honourifics, tasks, RSVP, wish wall, `.ics`.
- Marketplace: discovery with trust evidence and labelled sponsored placement, vendor profiles, enquiry → reply → quote.
- Vendor OS: SLA-first inbox, quote builder on the live commission waterfall, calendar, earnings split, ad ROAS, disputes.
- Money: own double-entry ledger, idempotent payments on a derived booking id, settlements, refund policy, `reconcileLedger`.
- Admin console: GMV, take rate, conversion funnel, ledger integrity, SLA breaches, ad performance, dispute queue.
- PWA: installable, offline shell, immutable asset caching, generated app icons.
- Verification: 205 unit tests + a 40-check end-to-end test that drives real HTTP and reads the database.

## Next (0–1 quarter)

| Item | Trigger | Notes |
| --- | --- | --- |
| **OTP sign-in + sessions** | first real pilot family | replaces the demo identity resolver; phone + signed cookie, no passwords |
| **CI pipeline** (`.github/workflows/ci.yml`) | first second contributor | the four commands in `docs/DEPLOYMENT.md` are the whole pipeline |
| **AI assistant wired to a provider** | assistant usage > 50 conversations/week | parsing and cost ceiling already exist; the provider is a key |
| **Postgres cutover** | GMV > ₹5 L/month or a second app instance | DDL and RLS are written; the migration is data movement |
| **Async print PDFs on a queue** | > 20 print orders/day | `renderPrintHtml` is pure, so this is a worker, not a rewrite |
| **Vendor onboarding flow** | first vendor outside the seed | GST/Udyam upload → `vendors.evidence` → trust badge, no scraping |

## Then (1–2 quarters)

| Item | Why it matters |
| --- | --- |
| **Payments (Razorpay/PhonePe) live** | the ledger, idempotency keys and settlement rows are already shaped for it |
| **WhatsApp share + RSVP** | where Marathi families actually coordinate; the invite text generator already exists |
| **Print partner network** | print is the highest-commission category (15 %) and the strongest retention loop |
| **Guest-side app experience** | RSVP reminders, directions, photo wall — all on the existing public page |
| **Analytics for vendors** | what to charge next season, based on the quotes they actually win |

## Deliberately never

Matrimony / spouse discovery; a thousand-template library; a Canva clone; native apps; K8s/Kafka/20 microservices; vendor scraping; instant booking; "शुभ/अशुभ दिवस" labels; 100 % margin assumptions.

## Open questions we are tracking (not hiding)

1. **Commission by category vs by plan.** The plan proposed 8–10 % Growth / 3–5 % Pro; the table ships at 3–15 % by category because print and invitations carry real cost. A vendor-facing "Growth vs Pro" view is a pricing experiment, and the code makes it a data change.
2. **How far to take the AI assistant.** The deterministic parser works with no key and no spend. The ceiling exists (`ASSISTANT_MONTHLY_USD_CAP`); the question is whether Marathi intent parsing should stay deterministic for trust.
3. **Sponsored placement limits.** Today: an organic floor plus a «प्रायोजित» label. The next question is a hard cap per result page, and it should be decided with vendor input, not unilaterally.
4. **Kundali/guna-milan.** Kept private-only. Whether families want it at all is a research question, not an engineering one.
