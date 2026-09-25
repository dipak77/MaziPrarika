import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const allowPaths = ['/', '/e/', '/vendors', '/panchang'];
  const disallowPaths = ['/vendor/', '/admin', '/studio/', '/api/'];
  return {
    rules: [
      {
        userAgent: 'WhatsApp',
        allow: allowPaths,
        disallow: disallowPaths,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: allowPaths,
        disallow: disallowPaths,
      },
      {
        userAgent: 'Twitterbot',
        allow: allowPaths,
        disallow: disallowPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: allowPaths,
        disallow: disallowPaths,
      },
      {
        userAgent: '*',
        allow: ['/', '/create', '/vendors', '/events', '/panchang', '/e/'],
        disallow: disallowPaths,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
