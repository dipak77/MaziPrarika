import { trustBadges } from '@mazi/commerce';
import type { Vendor } from '@mazi/store';

/**
 * Trust signals are derived from evidence (verified identity/GST, completed
 * bookings, real reviews, calendar freshness) — never from a paid tier.
 */
export function TrustBadgeRow({
  vendor,
  responseMinutes,
  className = '',
  now = new Date(),
}: {
  vendor: Vendor;
  responseMinutes?: number;
  className?: string;
  now?: Date;
}) {
  const freshDays = vendor.calendarFreshAt
    ? Math.max(0, Math.round((now.getTime() - new Date(vendor.calendarFreshAt).getTime()) / 86_400_000))
    : 30;

  const { badges } = trustBadges({
    bookingsCompleted: vendor.bookingsCompleted,
    responseRate: responseMinutes && responseMinutes <= 60 ? 0.94 : responseMinutes && responseMinutes <= 120 ? 0.86 : 0.6,
    verifiedReviews: vendor.reviewCount,
    averageRating: vendor.rating,
    calendarFreshnessDays: freshDays,
    identityVerified: vendor.identityVerified,
    gstVerified: vendor.gstVerified,
    disputeCount: vendor.disputeCount,
  });

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="विश्वास-चिन्हे">
      {badges.map((badge) => (
        <li
          key={badge.code}
          className="rounded-full border border-paithani/30 bg-paithani/8 px-2.5 py-1 font-ui text-[0.7rem] font-medium text-paithani"
        >
          {badge.label}
        </li>
      ))}
      {responseMinutes ? (
        <li className="rounded-full border border-gold/40 bg-ivory px-2.5 py-1 font-ui text-[0.7rem] font-medium text-charcoal-soft">
          ⏱ सरासरी प्रतिसाद {responseMinutes} मिनिटे
        </li>
      ) : null}
    </ul>
  );
}
