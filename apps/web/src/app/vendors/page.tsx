import Link from 'next/link';

import { VENDOR_CATEGORIES } from '@mazi/commerce';
import { toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';

import { DiscoveryFeed } from '@/components/vendors/discovery-feed';
import { CITY_OPTIONS } from '@/lib/panchang';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'विक्रेते शोधा — पडताळलेले सेवा देणारे',
  description: 'पुणे, मुंबई, नाशिकसह महाराष्ट्रातील पडताळलेले कार्यक्रम-विक्रेते — उपलब्धता, दर आणि प्रतिसाद वेळेसह.',
};

/**
 * Discovery.
 *
 * Two layers on purpose:
 *   • the curated feed (server-rendered) so the page is useful with zero
 *     JavaScript and fully indexable;
 *   • the live feed (client, `/api/vendors`) which re-ranks as the customer
 *     narrows things down — with sponsored rows always labelled.
 */
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const first = (value: string | string[] | undefined): string | undefined =>
    typeof value === 'string' && value.length ? value : undefined;

  const city = first(query.city) ?? 'पुणे';
  const date = first(query.date);
  const store = getStore();

  const categories = [...VENDOR_CATEGORIES];
  const featuredCategories = categories
    .filter((category) => store.vendors.search({ category, city, limit: 1 }).length > 0)
    .slice(0, 6);

  const featured = featuredCategories.map((category) => ({
    category,
    label: vendorCategoryLabel(category),
    vendors: store.vendors.search({ category, city, limit: 1 }),
  }));

  const cityCounts = CITY_OPTIONS.map((option) => ({
    city: option,
    count: store.vendors.search({ city: option, limit: 100 }).length,
  })).filter((entry) => entry.count > 0);

  const sponsoredCampaigns = store.ads.activeCampaigns('sponsored-search');

  return (
    <div className="shell py-10">
      <header className="max-w-3xl">
        <p className="font-ui text-xs uppercase tracking-[0.16em] text-gold">Marketplace</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-maroon">विक्रेते शोधा</h1>
        <p className="mt-3 text-lg text-charcoal-soft">
          {toDevanagariDigits(store.vendors.search({ city, limit: 200 }).length)} विक्रेते {city} आणि परिसरात — प्रत्येक क्रमांक
          पडताळलेल्या पुराव्यावर, आणि प्रायोजित निकाल नेहमी स्पष्टपणे चिन्हांकित.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {cityCounts.map((entry) => (
          <Link
            key={entry.city}
            href={`/vendors?city=${encodeURIComponent(entry.city)}`}
            className={
              entry.city === city
                ? 'rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-ivory'
                : 'rounded-full border border-gold/40 bg-ivory px-3 py-1.5 text-xs text-charcoal-soft hover:border-maroon/60'
            }
          >
            {entry.city} ({toDevanagariDigits(entry.count)})
          </Link>
        ))}
      </div>

      <DiscoveryFeed
        cities={CITY_OPTIONS}
        categories={VENDOR_CATEGORIES.map((category) => ({ key: category, label: vendorCategoryLabel(category) }))}
        initial={{ city, ...(date ? { date } : {}) }}
        sponsoredCount={sponsoredCampaigns.length}
      />

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-charcoal">श्रेणीनुसार शोध</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((entry) => (
            <Link
              key={entry.category}
              href={`/vendors?city=${encodeURIComponent(city)}&category=${entry.category}`}
              className="surface p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <p className="font-display text-lg font-bold text-charcoal">{entry.label}</p>
              <p className="mt-1 text-sm text-charcoal-soft">
                {entry.vendors[0]
                  ? `${entry.vendors[0].name} • ₹${toDevanagariDigits(Math.round(entry.vendors[0].startingPricePaise / 100).toLocaleString('en-IN'))} पासून`
                  : 'लवकरच'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface mt-10 grid gap-6 p-6 lg:grid-cols-3">
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal">क्रमवारी कशी ठरते</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-charcoal-soft">
            <li>• पूर्ण झालेल्या बुकिंगची संख्या (४० पर्यंत गुण)</li>
            <li>• प्रतिसाद दर — SLA २ तास</li>
            <li>• पडताळलेले अभिप्राय (बुकिंगशी जोडलेले)</li>
            <li>• कॅलेंडर किती अद्ययावत आहे</li>
            <li>• वाद/तक्रारींची नोंद (गुण वजा)</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal">प्रायोजित निकाल</h2>
          <p className="mt-2 text-sm text-charcoal-soft">
            प्रायोजित पद मिळवण्यासाठी विक्रेत्याचा स्वतःचा गुण <strong>५५+</strong> असणे बंधनकारक आहे. पैसे देऊन खराब
            विक्रेता वरच्या क्रमांकावर येऊ शकत नाही, आणि प्रत्येक प्रायोजित ओळीवर «प्रायोजित» असे लिहिलेले असते.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal">बुकिंग कशी होते</h2>
          <ol className="mt-2 space-y-1.5 text-sm text-charcoal-soft">
            <li>१. विनंती पाठवा — उपलब्धता व दर विचारा</li>
            <li>२. लेखी कोट — पॅकेज, साहित्य, अटी</li>
            <li>३. तारीख राखीव — तात्पुरता होल्ड २४ तासांचा</li>
            <li>४. आगाऊ रक्कम — बुकिंग निश्चित</li>
            <li>५. सेवेनंतर सेटलमेंट — गेटवे शुल्क वजा, पारदर्शक</li>
          </ol>
        </div>
      </section>

      <p className="mt-6 text-xs text-charcoal-soft">
        विक्रेत्यांना सामील व्हायचे आहे?{' '}
        <Link href="/vendor" className="font-semibold text-maroon">
          विक्रेता डेस्क उघडा →
        </Link>{' '}
        प्लॅटफॉर्म कमिशन श्रेणीनुसार ३–१५% — बुकिंग प्रकार व योजनेनुसार.
      </p>
    </div>
  );
}
