# SEO Growth — Mazi Patrika

> Crawler + unfurl + programmatic SEO operating manual. Marathi-first, WhatsApp-first.

## 1. Goal

- Every public invitation (`/e/:slug`) unfurls in < 1s on WhatsApp, Facebook, X.
- `/vendors`, `/panchang` and city×category slices are indexed with rich results.
- No private surface (`/vendor/*`, `/admin`, `/studio/*`, `/api/*`) is ever indexed.

## 2. robots.ts — bot allow-list

`apps/web/src/app/robots.ts` emits explicit rules:

| Bot UA | Allow | Disallow |
|---|---|---|
| `WhatsApp` (covers `WhatsApp/2.x`) | `/`, `/e/`, `/vendors`, `/panchang` | `/vendor/`, `/admin`, `/studio/`, `/api/` |
| `facebookexternalhit` | same | same |
| `Twitterbot` | same | same |
| `Googlebot` | same | same |
| `*` | `/`, `/create`, `/vendors`, `/events`, `/panchang`, `/e/` | same |

Sitemap is advertised as `{APP_URL}/sitemap.xml`.

Why explicit per-bot rules: some WAFs and Next middleware treat `*` as lowest priority. Explicit UA blocks guarantee unfurl crawlers are never challenged.

## 3. sitemap.ts — caps + programmatic slices

`apps/web/src/app/sitemap.ts` (`dynamic = 'force-dynamic'`):

- Static: `/`, `/create`, `/vendors`, `/events`, `/panchang`, `/vendor`, `/offline` (`daily`, priority 1.0 / 0.7).
- Events: `store.events.list({ limit: 200 })` filtered `isPublic`, capped at 200 (`weekly`, 0.6).
- Vendors: `store.vendors.search({ limit: 200 })`, capped at 200 (`weekly`, 0.5).
- City×category: `CITY_OPTIONS` (12 Maharashtra cities from `MAHARASHTRA_CITIES`) × top 8 `VENDOR_CATEGORIES` → `/vendors?city={city}&category={category}` (`weekly`, 0.5). ~96 URLs.
- `try/catch` fallback returns `staticRoutes` alone so a store failure never 500s `/sitemap.xml`.

Top categories seeded: `venue`, `photographer`, `videographer`, `decorator`, `caterer`, `printer`, `makeup`, `mehendi`. Extend by slicing `VENDOR_CATEGORIES` differently.

## 4. next.config.ts — cache headers for unfurls

Headers only (no blocking rules, no `X-Robots-Tag: noindex`):

```ts
{ source: '/e/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' }] }
{ source: '/api/og/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400' }] }
```

- `/e/*` is edge-cacheable for a day; browsers revalidate hourly.
- `/api/og/*` (OG images) is immutable-ish for a day; WhatsApp/FB fetch the image twice (crawler + client), so `s-maxage` saves origin hits.
- Never add `Disallow`, basic-auth, or bot-challenge middleware on these two prefixes.

## 5. JSON-LD

### 5.1 `vendors/[id]` — LocalBusiness

Inline `<script type="application/ld+json">`:

- `@type: LocalBusiness`, `name`, `description` (Marathi `about` preserved verbatim).
- `address`: `PostalAddress` with `addressLocality` (city), `postalCode`, `addressCountry: IN`.
- `geo`: `GeoCoordinates` from `vendor.latitude/longitude` (seeded from real city coords).
- `telephone`: emitted when the vendor record carries `phone`; key is always referenced in code.
- `priceRange`: `₹{startingPrice}+` in `en-IN` grouping.
- `aggregateRating`: `ratingValue` + `reviewCount`.
- `url`: `/vendors/{id}`.

`e/[slug]` Event schema is owned by the parallel unit — do not duplicate here.

### 5.2 `panchang` — FAQPage

`FAQPage` with 4 Marathi Q&A (muhurat + printing):

1. मुहूर्त म्हणजे काय आणि तो कसा ठरवला जातो?
2. माझ्या शहरासाठी मुहूर्त वेगळा का दिसतो? (२० मिनिट सूर्योदय फरक)
3. पत्रिका छपाईसाठी किती दिवस आधी ऑर्डर द्यावी? (२०० प्रत, ७२ तास प्रूफ, गोल्ड फॉइल)
4. शुभ गुण नसलेल्या दिवशी कार्यक्रम करता येतो का? (अनुकूलता ≠ आदेश; कुटुंब + गुरुजी)

### 5.3 `layout.tsx` — Organization + WebSite

Site-wide `@graph`:

- `Organization`: `माझी पत्रिका` / `Mazi Patrika`, `url`, `logo: /icons/icon-512.png`.
- `WebSite`: `inLanguage: mr-IN`, `potentialAction: SearchAction` targeting `/vendors?city={city}`.

## 6. Cloudflare WAF bypass-recipe (bot UAs)

WhatsApp/FB/X fetches fail with 403 when Bot Fight Mode / Bot Management / WAF Managed Rules challenge crawlers. Apply in this order:

1. **Cloudflare → Security → Bots**: turn OFF "Bot Fight Mode". If on Enterprise Bot Management, add Allow for verified bots.
2. **WAF → Custom rules** (highest priority, `Allow`, log off):
   - `(http.user_agent contains "WhatsApp" and http.request.uri.path starts with "/e/")` → Allow, skip: all remaining custom rules, rate limiting, managed rules.
   - `(http.user_agent contains "facebookexternalhit" or http.user_agent contains "Facebot")` → Allow + skip.
   - `(http.user_agent contains "Twitterbot")` → Allow + skip.
   - `(http.user_agent contains "Googlebot" or http.user_agent contains "Google-InspectionTool")` → Allow + skip (never challenge Google; verify via reverse DNS if paranoid).
   - `(http.request.uri.path starts with "/api/og/")` → Allow + Cache Everything (Edge TTL 1 day) regardless of UA.
3. **Caching → Cache Rules**: `URI Path starts with /api/og/` → Eligible for cache, Edge TTL 86400, Browser TTL 86400. `URI Path starts with /e/` → Eligible, Edge TTL 86400, Browser TTL 3600.
4. **Security → Settings**: ensure "Browser Integrity Check" does not apply to `/e/*`, `/api/og/*` (create Configuration Rule → skip BIC + Security Level Essentially Off for those paths + above UAs).
5. **Rate limiting**: exclude the four UAs + `/api/og/*` from all rate-limit rules.
6. **TLS**: keep HSTS from `next.config.ts`; do not enable "Authenticated Origin Pulls" without allowlisting crawlers (they hit edge, not origin — safe).

Test from origin first, then edge:

```bash
curl -A "WhatsApp/2.24.0" -I https://mazipatrika.in/e/<slug>
curl -A "facebookexternalhit/1.1" -I https://mazipatrika.in/e/<slug>
curl -A "Twitterbot/1.0" -I https://mazipatrika.in/e/<slug>
curl -A "Googlebot/2.1" -I https://mazipatrika.in/sitemap.xml
```

Expect `200`, `content-type: text/html`, `cache-control: public, ... s-maxage=...`, no `cf-mitigated: challenge`, no `403`.

## 7. Programmatic SEO plan — URL map

| Cluster | URL pattern | Source | Count (launch) |
|---|---|---|---|
| Panchang city | `/panchang?city={city}` | `MAHARASHTRA_CITIES` (12) | 12 |
| Panchang city+date | `/panchang?city={city}&date={YYYY-MM-DD}` | 12 cities × rolling 60-day muhurat window | index top 8/week per city |
| Panchang city+event | `/panchang?city={city}&event={wedding,gruhapravesh,...}` | `EVENT_TYPES` muhurat-sensitive (8) × 12 cities | 96 |
| Vendor city×category | `/vendors?city={city}&category={cat}` | 12 × top 8 (in sitemap) | 96 in sitemap, full 12×25 = 300 linkable |
| Vendor profile | `/vendors/{id}` | store (cap 200 in sitemap) | ≤ 200 |
| Invitation | `/e/{slug}` | public events only (cap 200) | ≤ 200 |
| Templates (future) | `/templates/{style}` | design catalog | roadmap |

Internal linking:

- `/panchang` aside → top 3 `venue` vendors in that city + CTA `/create`.
- `/vendors` city pills → `/vendors?city=X`; category cards → `/vendors?city=X&category=Y`.
- Vendor profile → packages + reviews (fresh UGC for crawl frequency).

Marathi slugs stay Marathi; query keys stay ASCII (`city`, `category`, `date`, `event`) so Cloudflare cache keys are stable. City values are URL-encoded Marathi (`encodeURIComponent`).

## 8. Verification

### 8.1 Unfurl (do after every deploy)

1. WhatsApp: send `/e/<slug>` to yourself; expect title + description + OG image in < 2s. If grey box: check `curl -A WhatsApp` from §6.
2. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/ → paste URL → Scrape Again → no 403, image ≥ 1200×630 (`/og.png` fallback + `/api/og/*` per-event).
3. X Card Validator: https://cards-dev.twitter.com/validator → `summary_large_image` renders.
4. Inspect: `og:title`, `og:description` (Marathi intact), `og:image`, `og:locale: mr_IN`, `twitter:card`.

### 8.2 Search Console + rich results

1. Search Console → Sitemaps → submit `/sitemap.xml` → verify 200s + counts (static + events + vendors + city×category).
2. Pages → check `/vendors?city=*`, `/panchang` are Indexed; `/vendor/*`, `/admin`, `/studio/*`, `/api/*` are Excluded by robots (expected).
3. Rich Results Test: https://search.google.com/test/rich-results → `/vendors/{id}` shows LocalBusiness (geo, priceRange, aggregateRating); `/panchang` shows FAQPage; `/` shows Organization + WebSite.
4. Schema validator: https://validator.schema.org/ → zero syntax errors on the three JSON-LD blocks.

### 8.3 Regression guard

```cmd
cmd /c npx tsc --noEmit -p apps\web
```

Must pass with no errors. App code keeps zero comments and Marathi strings verbatim.
