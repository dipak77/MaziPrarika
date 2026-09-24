import type { MetadataRoute } from 'next';

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
    const events = store.events.list({ limit: 100 }).filter((e) => e.isPublic);
    const eventRoutes = events.slice(0, 50).map((e) => ({
      url: `${base}/e/${e.slug}`,
      lastModified: new Date(e.updatedAt ?? now),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
    const vendors = store.vendors.search({ limit: 50 });
    const vendorRoutes = vendors.slice(0, 50).map((v) => ({
      url: `${base}/vendors/${v.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
    return [...staticRoutes, ...eventRoutes, ...vendorRoutes];
  } catch {
    return staticRoutes;
  }
}
