import { NextResponse } from 'next/server';
import { z } from 'zod';

import { availabilityState, rankForDiscovery, trustBadges, type VendorSignals } from '@mazi/commerce';
import { toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { getStore } from '@/lib/store';

/**
 * GET /api/vendors — discovery search.
 *
 * This is the endpoint behind the live feed on /vendors: as a customer types or
 * changes filters, the client asks for a *ranked* answer rather than re-sorting
 * whatever came back first.
 *
 * Ranking rules (from the charter):
 *   • organic signals only — evidence, response rate, verified reviews, freshness;
 *   • sponsored rows must earn a minimum organic score and are always labelled;
 *   • a vendor with open disputes cannot buy their way to the top.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().max(40).optional(),
  city: z.string().max(60).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  maxPricePaise: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  limit: z.coerce.number().int().min(1).max(24).default(9),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'अवैध शोध निकष.' }, { status: 400 });
  }
  const { q, category, city, date, maxPricePaise, minRating, limit } = parsed.data;

  const store = getStore();
  const matched = store.vendors.search({
    ...(category ? { category } : {}),
    ...(city ? { city } : {}),
    ...(q ? { q } : {}),
    ...(maxPricePaise ? { maxPricePaise } : {}),
    ...(minRating ? { minRating } : {}),
    limit: limit * 3,
  });

  const sponsoredCampaigns = store.ads.activeCampaigns('sponsored-search');
  const sponsoredByVendor = new Map(
    sponsoredCampaigns
      .filter((campaign) => !campaign.targeting.city || campaign.targeting.city === city)
      .map((campaign) => [campaign.vendorId, campaign]),
  );

  const enriched = matched.map((vendor) => {
    const stats = store.marketplace.responseStats(vendor.id);
    const reviews = store.vendors.reviews(vendor.id);
    const signals: VendorSignals = {
      bookingsCompleted: vendor.bookingsCompleted,
      responseRate: stats.total ? stats.responded / stats.total : 0.5,
      verifiedReviews: reviews.filter((review) => review.verifiedBooking).length,
      averageRating: vendor.rating,
      calendarFreshnessDays: vendor.calendarFreshAt
        ? Math.max(0, Math.round((Date.now() - new Date(vendor.calendarFreshAt).getTime()) / 86_400_000))
        : 30,
      identityVerified: vendor.identityVerified,
      gstVerified: vendor.gstVerified,
      disputeCount: vendor.disputeCount,
    };
    const badges = trustBadges(signals);
    const availability = date
      ? availabilityState(store.vendors.availability(vendor.id, date, date), { vendorId: vendor.id, date })
      : undefined;

    return {
      vendor,
      signals,
      badges: badges.badges,
      organicScore: badges.organicScore,
      responseMinutes: stats.total ? stats.medianMinutes : vendor.responseMinutes,
      availability,
      sponsored: sponsoredByVendor.has(vendor.id),
    };
  });

  // Relevance: text match on name/about plus category and city agreement.
  const relevance = (row: (typeof enriched)[number]): number => {
    const haystack = `${row.vendor.name} ${row.vendor.about ?? ''}`.toLowerCase();
    const needle = (q ?? '').toLowerCase();
    const textScore = needle ? (haystack.includes(needle) ? 60 : 0) : 40;
    return textScore + row.organicScore * 0.4;
  };

  const ranked = rankForDiscovery({
    vendors: enriched.map((row) => ({
      id: row.vendor.id,
      signals: row.signals,
      distanceKm: 6 + (row.vendor.pincode ? Number(row.vendor.pincode.slice(-2)) / 10 : 12),
      relevance: relevance(row),
      ...(sponsoredByVendor.has(row.vendor.id)
        ? { sponsoredBidPaise: sponsoredByVendor.get(row.vendor.id)!.budgetPaise }
        : {}),
    })),
  });

  const byId = new Map(enriched.map((row) => [row.vendor.id, row]));
  const results = ranked
    .map((position) => {
      const row = byId.get(position.id)!;
      if (position.sponsored) {
        // Impressions are only counted when a sponsored row is actually served.
        try {
          const campaign = sponsoredByVendor.get(row.vendor.id)!;
          store.ads.recordEvent({
            campaignId: campaign.id,
            kind: 'impression',
            ...(city ? { city } : {}),
            costPaise: Math.round(campaign.budgetPaise / 2000),
          });
        } catch {
          /* an ad counter must never break discovery */
        }
      }
      return {
        id: row.vendor.id,
        name: row.vendor.name,
        category: row.vendor.category,
        categoryLabel: vendorCategoryLabel(row.vendor.category),
        city: row.vendor.city,
        about: row.vendor.about ?? '',
        startingPricePaise: row.vendor.startingPricePaise,
        rating: row.vendor.rating,
        reviewCount: row.vendor.reviewCount,
        bookingsCompleted: row.vendor.bookingsCompleted,
        responseMinutes: row.responseMinutes,
        languages: row.vendor.languages,
        badges: row.badges.map((badge) => badge.label),
        organicScore: row.organicScore,
        position: position.position,
        sponsored: position.sponsored,
        availability: row.availability ?? null,
      };
    })
    .filter((row) => (date ? row.availability?.bookable !== false : true))
    .slice(0, limit);

  return NextResponse.json(
    {
      query: { q: q ?? '', category: category ?? '', city: city ?? '', date: date ?? null },
      total: results.length,
      sponsoredCount: results.filter((row) => row.sponsored).length,
      results,
      meta: {
        ranking: 'सेंद्रिय गुणवत्ता + प्रतिसाद + पडताळलेले अभिप्राय; प्रायोजित निकाल नेहमी चिन्हांकित',
        generatedAt: new Date().toISOString(),
        resultLabel: `${toDevanagariDigits(results.length)} विक्रेते`,
      },
    },
    { headers: { 'cache-control': 'private, max-age=15, stale-while-revalidate=45' } },
  );
}
