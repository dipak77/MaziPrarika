import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = 'apps/web/out';

async function exportStatic() {
  console.log(`Starting static export to ${OUT_DIR}...`);

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

  // Find the production CSS filename
  let cssFile = '';
  const cssDir = 'apps/web/.next/static/css';
  if (existsSync(cssDir)) {
    const files = readdirSync(cssDir).filter((f) => f.endsWith('.css'));
    if (files[0]) cssFile = files[0];
  }
  console.log(`Production CSS file: ${cssFile}`);

  // 3. Static pre-rendered pages from next build
  const staticMap = [
    { src: 'apps/web/.next/server/app/index.html', dst: 'apps/web/out/index.html' },
    { src: 'apps/web/.next/server/app/dashboard.html', dst: 'apps/web/out/dashboard/index.html' },
    { src: 'apps/web/.next/server/app/studio.html', dst: 'apps/web/out/studio/index.html' },
    { src: 'apps/web/.next/server/app/studio/editor.html', dst: 'apps/web/out/studio/editor/index.html' },
    { src: 'apps/web/.next/server/app/biodata.html', dst: 'apps/web/out/biodata/index.html' },
    { src: 'apps/web/.next/server/app/biodata/editor.html', dst: 'apps/web/out/biodata/editor/index.html' },
    { src: 'apps/web/.next/server/app/create.html', dst: 'apps/web/out/create/index.html' },
    { src: 'apps/web/.next/server/app/offline.html', dst: 'apps/web/out/offline/index.html' },
    { src: 'apps/web/.next/server/app/_not-found.html', dst: 'apps/web/out/404.html' },
  ];

  for (const { src, dst } of staticMap) {
    if (existsSync(src)) {
      mkdirSync(dirname(dst), { recursive: true });
      cpSync(src, dst);
      console.log(`✓ Copied pre-rendered ${src} -> ${dst}`);
    }
  }

  // 4. Fetch dynamic pages from local server and ensure production CSS is attached
  const dynamicRoutes = [
    '/vendor-os',
    '/console',
    '/events',
    '/vendors',
    '/panchang',
    '/vendor',
    '/admin',
    // Public digital event invitations (QR landing pages)
    '/e/patil-patil-vivah-2027',
    '/e/deshmukh-gruhapravesh',
    '/e/advait-vadhdivas',
    '/e/joshi-namkaran',
    '/e/kale-satyanarayan-puja',
    // Key verified vendor profiles
    '/vendors/vnd_pune_kulkarni_studio',
    '/vendors/vnd_chinchwad_mangal',
    '/vendors/vnd_pune_annapurna_caterers',
    '/vendors/vnd_pune_shubhmangal_printers',
    '/vendors/vnd_kolhapur_patil_decors',
    '/vendors/vnd_mumbai_shree_dhol',
    '/vendors/vnd_pune_shubh_purohit',
    '/vendors/vnd_pune_mehendi_art',
    '/vendors/vnd_pune_swar_dj',
    '/vendors/vnd_pune_aaiji_cakes',
    '/vendors/vnd_nashik_sai_makeup',
    '/vendors/vnd_satara_gauri_lighting',
  ];

  for (const route of dynamicRoutes) {
    try {
      const url = `${BASE_URL}${route}`;
      const res = await fetch(url);
      let html = await res.text();

      // Ensure production stylesheet is linked
      if (cssFile && !html.includes(cssFile)) {
        const linkTag = `<link rel="stylesheet" href="/_next/static/css/${cssFile}" />`;
        html = html.replace('</head>', `${linkTag}</head>`);
      }

      // Remove dev scripts that fail on static host
      html = html.replace(/<script[^>]*src="\/_next\/static\/development\/[^>]*><\/script>/g, '');

      const targetFile = join(OUT_DIR, route.slice(1), 'index.html');
      mkdirSync(dirname(targetFile), { recursive: true });
      writeFileSync(targetFile, html, 'utf8');
      console.log(`✓ Generated ${route} -> ${targetFile}`);
    } catch (err) {
      console.error(`✗ Error generating ${route}:`, err.message);
    }
  }

  console.log('🎉 Static export complete with full production styles!');
}

exportStatic().catch(console.error);
