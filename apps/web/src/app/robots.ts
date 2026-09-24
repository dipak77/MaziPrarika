import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/create', '/vendors', '/events', '/panchang', '/e/'],
        disallow: ['/vendor/', '/admin', '/studio/', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
