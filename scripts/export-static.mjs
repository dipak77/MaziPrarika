import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';

const OUT_DIR = 'apps/web/out';

async function ensureServer() {
  if (process.env.BASE_URL) {
    return { url: process.env.BASE_URL, cleanup: () => {} };
  }

  // 1. Check if production server on port 3005 is already running
  try {
    const res = await fetch('http://127.0.0.1:3005/studio');
    if (res.ok) {
      console.log('✓ Found running production server at http://127.0.0.1:3005');
      return { url: 'http://127.0.0.1:3005', cleanup: () => {} };
    }
  } catch {}

  // 2. Otherwise, spawn production Next.js server (next start) on port 3005
  console.log('Starting production Next.js server on port 3005 for static export...');
  const isWin = process.platform === 'win32';
  const child = spawn(
    isWin ? 'cmd.exe' : 'npx',
    isWin ? ['/c', 'npx', 'next', 'start', '-p', '3005'] : ['next', 'start', '-p', '3005'],
    {
      cwd: 'apps/web',
      stdio: 'ignore',
    }
  );

  const cleanup = () => {
    try {
      if (isWin) {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        child.kill('SIGTERM');
      }
    } catch {}
  };

  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch('http://127.0.0.1:3005/studio');
      if (res.ok) {
        console.log('✓ Production server ready at http://127.0.0.1:3005');
        return { url: 'http://127.0.0.1:3005', cleanup };
      }
    } catch {}
  }

  cleanup();
  throw new Error('Could not connect to or start Next.js server on port 3005 for export.');
}

async function exportStatic() {
  console.log(`Starting clean static export to ${OUT_DIR}...`);

  // Clean stale out directory completely
  if (existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true });
    console.log('✓ Cleaned stale out directory');
  }
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
    { src: 'apps/web/.next/server/app/biodata.html', dst: 'apps/web/out/biodata/index.html' },
    { src: 'apps/web/.next/server/app/biodata/editor.html', dst: 'apps/web/out/biodata/editor/index.html' },
    { src: 'apps/web/.next/server/app/create.html', dst: 'apps/web/out/create/index.html' },
    { src: 'apps/web/.next/server/app/offline.html', dst: 'apps/web/out/offline/index.html' },
    { src: 'apps/web/.next/server/app/_not-found.html', dst: 'apps/web/out/404.html' },
    { src: 'apps/web/.next/server/app/robots.txt.body', dst: 'apps/web/out/robots.txt' },
    { src: 'apps/web/.next/server/app/manifest.webmanifest.body', dst: 'apps/web/out/manifest.webmanifest' },
    { src: 'apps/web/.next/server/app/icon.svg.body', dst: 'apps/web/out/icon.svg' },
  ];

  for (const { src, dst } of staticMap) {
    if (existsSync(src)) {
      mkdirSync(dirname(dst), { recursive: true });
      cpSync(src, dst);
      console.log(`✓ Copied pre-rendered ${src} -> ${dst}`);
    } else {
      console.log(`ℹ Notice: static file not found: ${src}`);
    }
  }

  // 4. Connect to or spawn server for dynamic routes
  const { url: serverUrl, cleanup } = await ensureServer();

  // 5. Fetch dynamic pages from server and ensure production CSS is attached
  const dynamicRoutes = [
    // Core dynamic Studio pages
    '/studio',
    '/studio/editor',
    '/studio/patil-patil-vivah-2027',
    '/studio/patil-patil-vivah-2027/invitation',
    // Dynamic ecosystem pages
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
    // Dynamic XML feeds
    { route: '/sitemap.xml', file: 'sitemap.xml' },
  ];

  const failedRoutes = [];

  try {
    for (const item of dynamicRoutes) {
      const isCustomFile = typeof item === 'object';
      const route = isCustomFile ? item.route : item;
      const targetFile = isCustomFile ? join(OUT_DIR, item.file) : join(OUT_DIR, route.slice(1), 'index.html');

      try {
        const url = `${serverUrl}${route}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        let html = await res.text();

        // Ensure production stylesheet is linked if it's an HTML page
        if (!isCustomFile && cssFile && !html.includes(cssFile)) {
          const linkTag = `<link rel="stylesheet" href="/_next/static/css/${cssFile}" />`;
          html = html.replace('</head>', `${linkTag}</head>`);
        }

        // Remove dev scripts that fail on static host
        if (!isCustomFile) {
          html = html.replace(/<script[^>]*src="\/_next\/static\/development\/[^>]*><\/script>/g, '');
        }

        mkdirSync(dirname(targetFile), { recursive: true });
        writeFileSync(targetFile, html, 'utf8');
        console.log(`✓ Generated ${route} -> ${targetFile} (${html.length} bytes)`);
      } catch (err) {
        console.error(`✗ Error generating ${route}:`, err.message);
        failedRoutes.push(route);
      }
    }
  } finally {
    cleanup();
  }

  if (failedRoutes.length > 0) {
    throw new Error(`Static export failed for ${failedRoutes.length} route(s): ${failedRoutes.join(', ')}`);
  }

  console.log('🎉 Static export complete with full production styles and latest Studio pages!');
}

exportStatic().catch((err) => {
  console.error(err);
  process.exit(1);
});
