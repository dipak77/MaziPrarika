import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';
const OUT_DIR = 'apps/web/out';

async function exportStatic() {
  console.log(`Starting static export from ${BASE_URL} to ${OUT_DIR}...`);

  mkdirSync(OUT_DIR, { recursive: true });

  // 1. Copy public assets
  if (existsSync('apps/web/public')) {
    cpSync('apps/web/public', OUT_DIR, { recursive: true });
    console.log('✓ Copied apps/web/public');
  }

  // 2. Copy compiled static chunks and css
  const nextStatic = 'apps/web/.next/static';
  if (existsSync(nextStatic)) {
    mkdirSync(join(OUT_DIR, '_next', 'static'), { recursive: true });
    cpSync(nextStatic, join(OUT_DIR, '_next', 'static'), { recursive: true });
    console.log('✓ Copied .next/static to _next/static');
  }

  // 3. Fetch each route from the running local server
  const routes = [
    '/',
    '/studio',
    '/vendor-os',
    '/console',
    '/events',
    '/vendors',
    '/panchang',
    '/create',
    '/offline',
    '/_not-found',
  ];

  for (const route of routes) {
    try {
      const url = `${BASE_URL}${route}`;
      const res = await fetch(url);
      if (!res.ok && route !== '/_not-found') {
        console.warn(`⚠ ${route} returned status ${res.status}`);
      }
      const html = await res.text();

      let targetFile;
      if (route === '/') {
        targetFile = join(OUT_DIR, 'index.html');
      } else if (route === '/_not-found') {
        targetFile = join(OUT_DIR, '404.html');
      } else {
        targetFile = join(OUT_DIR, route.slice(1), 'index.html');
      }

      mkdirSync(dirname(targetFile), { recursive: true });
      writeFileSync(targetFile, html, 'utf8');
      console.log(`✓ Exported ${route} -> ${targetFile} (${html.length} bytes)`);
    } catch (err) {
      console.error(`✗ Error exporting ${route}:`, err.message);
    }
  }

  console.log('🎉 Static export complete!');
}

exportStatic().catch(console.error);
