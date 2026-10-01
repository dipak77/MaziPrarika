import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Mazi Patrika — Next.js configuration.
 *
 * Performance posture (from the product charter):
 *   • public marketing/event pages are statically rendered where possible;
 *   • the studio and vendor OS are dynamic and streamed;
 *   • fonts are self-hosted, so no third-party connection on the critical path;
 *   • security headers are set here, not left to the platform default.
 */
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  /**
   * Dev and production builds write to **different** directories.
   *
   * `next build` wipes and rewrites `.next`, so running it while `next dev` is up
   * leaves the dev server requiring chunks that no longer exist — every route then
   * answers 500 until the server is restarted. Splitting the directories makes
   * "build, then keep developing" safe, which is exactly what happens in a demo.
   */
  distDir: process.env.NEXT_DIST_DIR ?? (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next'),
  experimental: {
    optimizePackageImports: ['lucide-react', '@mazi/marathi', '@mazi/commerce', '@mazi/panchang', '@mazi/renderer'],
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2_592_000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config) => {
    // Our shared packages use NodeNext-style `./module.js` specifiers while the
    // sources on disk are TypeScript. Teach the bundler the alias so the same
    // source tree feeds the app, the tests and the CLI without a build step.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/e/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' }],
      },
      {
        source: '/api/og/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400' }],
      },
      {
        // Self-hosted Devanagari fonts never change under a given filename.
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // App icons and the manifest: cheap to revalidate, expensive to re-download
        // on every visit from a phone on a metered connection.
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }],
      },
      {
        // The offline shell must never be stale for longer than a deploy.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default config;
