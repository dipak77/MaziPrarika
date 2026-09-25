import type { MetadataRoute } from 'next';

import { VENDOR_CATEGORIES } from '@mazi/commerce';

import { CITY_OPTIONS } from '@/lib/panchang';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();
  const staticRoutes = ['', '/create', '/vendors', '/events', '/panchang', '/vendor', '/offline'].map(
    (path) => ({
      url: `${base}${path || '/'}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1 : 0.7,
    }),
  );

  try {
    const store = getStore();
    const events = store.events.list({ limit: 200 }).filter((e) => e.isPublic);
    const eventRoutes = events.slice(0, 200).map((e) => ({
      url: `${base}/e/${e.slug}`,
      lastModified: new Date(e.updatedAt ?? now),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    const vendors = store.vendors.search({ limit: 200 });
    const vendorRoutes = vendors.slice(0, 200).map((v) => ({
      url: `${base}/vendors/${v.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
    const topCategories = [...VENDOR_CATEGORIES].slice(0, 8);
    const cityCategoryRoutes = CITY_OPTIONS.flatMap((city) =>
      topCategories.map((category) => ({
        url: `${base}/vendors?city=${encodeURIComponent(city)}&category=${category}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
    );
    return [...staticRoutes, ...eventRoutes, ...vendorRoutes, ...cityCategoryRoutes];
  } catch {
    return staticRoutes;
  }
}
