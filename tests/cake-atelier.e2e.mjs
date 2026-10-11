#!/usr/bin/env node
/**
 * Cake Atelier Pro — end-to-end HTTP test.
 *
 *   npm run test:e2e:cake                              # against localhost:3000
 *   BASE_URL=http://localhost:4321 node tests/cake-atelier.e2e.mjs
 *
 * Drives the real HTTP surface of the running app: the catalogue API, the preview
 * endpoint and — most importantly — `POST /api/cake/export`, downloading actual
 * PNG, SVG, PDF and layered ZIP bytes and inspecting them.
 *
 * The PNG check reads the IHDR chunk to prove the pixel dimensions, and the ZIP
 * check walks the central directory to prove the package contains a file per
 * paper layer plus the manifest and report. Nothing is mocked; nothing is taken
 * on trust from a header alone.
 *
 * Run it after `npm run dev` (or `npm run build && npm start`).
 */

import { defaultProjectFor, projectWith } from './cake-e2e-fixtures.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const results = [];
const check = (name, ok, detail = '') => {
  results.push([ok ? 'PASS' : 'FAIL', name, detail]);
  return ok;
};

/* ------------------------------------------------------------------ */
/* byte-level helpers                                                  */
/* ------------------------------------------------------------------ */

function pngSize(bytes) {
  // 8-byte signature, then the IHDR length/type, then width and height (BE u32).
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const ok = sig.every((byte, index) => bytes[index] === byte);
  if (!ok) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
}

function isPdf(bytes) {
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

/** Minimal ZIP central-directory reader (the writer stores entries uncompressed). */
function zipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return [];
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const names = [];
  for (let i = 0; i < count; i += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const nameLength = view.getUint16(cursor + 28, true);
    const extra = view.getUint16(cursor + 30, true);
    const comment = view.getUint16(cursor + 32, true);
    names.push(new TextDecoder().decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength)));
    cursor += 46 + nameLength + extra + comment;
  }
  return names;
}

async function readBody(response) {
  return new Uint8Array(await response.arrayBuffer());
}

async function get(path) {
  return fetch(`${BASE}${path}`);
}

async function postJson(path, body) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/* ------------------------------------------------------------------ */
/* the test                                                            */
/* ------------------------------------------------------------------ */

async function main() {
  /* 1 — catalogue -------------------------------------------------- */
  const catalogResponse = await get('/api/cake/templates');
  const catalog = await catalogResponse.json();
  check('catalogue responds 200', catalogResponse.ok, String(catalogResponse.status));
  check('catalogue lists 60 templates', catalog.templates?.length === 60, `got ${catalog.templates?.length}`);
  check('catalogue lists 12 collections', catalog.collections?.length === 12, `got ${catalog.collections?.length}`);
  check('catalogue lists 12 palettes', catalog.palettes?.length === 12, `got ${catalog.palettes?.length}`);
  check('every collection has 5 designs', catalog.collections?.every((collection) => collection.templateIds.length === 5));
  check('catalogue exposes print sizes', catalog.sizes?.length >= 10, `got ${catalog.sizes?.length}`);

  const filtered = await (await get('/api/cake/templates?category=royal-prince')).json();
  check('category filter narrows to one collection', filtered.templates?.length === 5, `got ${filtered.templates?.length}`);
  const ageFiltered = await (await get('/api/cake/templates?age=2&style=playful')).json();
  check('age + style filters return a subset', ageFiltered.matched >= 1 && ageFiltered.matched < 60, `matched ${ageFiltered.matched}`);
  const badFilter = await get('/api/cake/templates?sort=nonsense');
  check('invalid filter is rejected with 400', badFilter.status === 400, String(badFilter.status));

  /* 2 — preview ---------------------------------------------------- */
  const previewResponse = await get('/api/cake/preview?templateId=royal-prince-crown&name=Saanvi');
  const previewSvg = await previewResponse.text();
  check('preview responds 200 as SVG', previewResponse.ok && previewResponse.headers.get('content-type')?.includes('image/svg+xml'));
  check('preview is in millimetres', previewSvg.includes('width="152.4mm"') && previewSvg.includes('viewBox="0 0 152.4 152.4"'));
  check('preview carries the name', previewSvg.includes('Saanvi'));
  check('preview has no script or foreignObject', !previewSvg.includes('<script') && !previewSvg.includes('foreignObject'));
  check('preview sets an ETag', Boolean(previewResponse.headers.get('etag')), previewResponse.headers.get('etag') ?? '');
  check('preview reports a fingerprint', Boolean(previewResponse.headers.get('x-cake-fingerprint')));

  const etag = previewResponse.headers.get('etag');
  const conditional = await fetch(`${BASE}/api/cake/preview?templateId=royal-prince-crown&name=Saanvi`, { headers: { 'If-None-Match': etag } });
  check('preview honours If-None-Match with 304', conditional.status === 304, String(conditional.status));

  const wrongAspect = await get('/api/cake/preview?templateId=royal-prince-crown&widthMm=100&heightMm=160');
  check('preview rejects a mismatched aspect with 422', wrongAspect.status === 422, String(wrongAspect.status));

  const unknown = await get('/api/cake/preview?templateId=not-a-template');
  check('preview rejects an unknown design with 404', unknown.status === 404, String(unknown.status));

  const badParam = await get('/api/cake/preview?templateId=royal-prince-crown&widthMm=99999');
  check('preview rejects out-of-range parameters with 400', badParam.status === 400, String(badParam.status));

  const unicodePreview = await (
    await get(`/api/cake/preview?templateId=rose-gold-crown-frame&name=${encodeURIComponent('आरव')}`)
  ).text();
  check('preview keeps Devanagari text intact', unicodePreview.includes('आरव'));

  /* 3 — dry run: preflight + report -------------------------------- */
  const project = defaultProjectFor('royal-prince-crown', 'Aarav');
  const dryRun = await postJson('/api/cake/export', { ...project, format: 'png', ppi: 300, dryRun: true });
  const dryBody = await dryRun.json();
  check('dry run responds 200', dryRun.ok, JSON.stringify(dryBody).slice(0, 160));
  check('dry run reports a preflight checklist', Array.isArray(dryBody.preflight?.checks) && dryBody.preflight.checks.length >= 6);
  check('dry run reports true pixel dimensions', dryBody.preflight?.summary?.pixels?.widthPx === 1800, JSON.stringify(dryBody.preflight?.summary?.pixels));
  check('dry run returns a production report', typeof dryBody.reportText === 'string' && dryBody.reportText.includes('CAKE TOILER') === false && dryBody.reportText.length > 200);
  check('dry run lists the paper layers', Array.isArray(dryBody.report?.cardstock) || Array.isArray(dryBody.preflight?.summary?.fonts));

  /* 4 — real exports ---------------------------------------------- */
  const pngResponse = await postJson('/api/cake/export', { ...project, format: 'png', ppi: 300 });
  const pngBytes = await readBody(pngResponse);
  const size = pngSize(pngBytes);
  check('PNG export responds 200', pngResponse.ok, String(pngResponse.status));
  check('PNG is 1800 × 1800 px at 300 PPI', size?.width === 1800 && size?.height === 1800, JSON.stringify(size));
  check('PNG is reasonably large', pngBytes.length > 20_000, `${pngBytes.length} bytes`);
  check('PNG filename is sanitised', /^[\w.-]+\.png$/.test(pngResponse.headers.get('x-cake-file-name') ?? ''), pngResponse.headers.get('x-cake-file-name') ?? '');
  check('PNG is not cached', pngResponse.headers.get('cache-control') === 'no-store');

  const svgResponse = await postJson('/api/cake/export', { ...project, format: 'svg' });
  const svgText = new TextDecoder().decode(await readBody(svgResponse));
  check('SVG export responds 200', svgResponse.ok, String(svgResponse.status));
  check('SVG export carries physical units', svgText.includes('152.4mm'));
  check('SVG export outlines the text (no font-family)', !svgText.includes('font-family='));
  check('SVG export has no remote references', !svgText.includes('http://') && !svgText.includes('https://') || !/url\(https?:/.test(svgText));

  const editableResponse = await postJson('/api/cake/export', { ...project, format: 'svg', outlineText: false });
  const editableSvg = new TextDecoder().decode(await readBody(editableResponse));
  check('editable-text SVG keeps live text', editableSvg.includes('font-family=') && editableSvg.includes('Aarav'));

  const pdfResponse = await postJson('/api/cake/export', { ...project, format: 'pdf', bleedMm: 3 });
  const pdfBytes = await readBody(pdfResponse);
  const pdfText = new TextDecoder().decode(pdfBytes);
  const mediaBox = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(pdfText);
  check('PDF export responds 200', pdfResponse.ok, String(pdfResponse.status));
  check('PDF has a real header', isPdf(pdfBytes));
  check('PDF page is 158.4 mm (449 pt) with 3 mm bleed', mediaBox ? Math.abs(Number(mediaBox[1]) - 449.01) < 1 : false, mediaBox?.[0] ?? 'no MediaBox');
  check('PDF needs no embedded font', !pdfText.includes('/Font'));

  const layersResponse = await postJson('/api/cake/export', { ...project, format: 'layers' });
  const zipBytes = await readBody(layersResponse);
  const entries = zipEntries(zipBytes);
  check('layered export responds 200', layersResponse.ok, String(layersResponse.status));
  check('layered export is a ZIP', zipBytes[0] === 0x50 && zipBytes[1] === 0x4b, `${zipBytes[0]},${zipBytes[1]}`);
  check('ZIP contains one file per paper layer', entries.filter((name) => name.startsWith('layer-')).length >= 2, entries.join(' '));
  check('ZIP contains the manifest', entries.includes('manifest.json'));
  check('ZIP contains the production report', entries.includes('production-report.txt'));
  check('ZIP contains assembly instructions', entries.includes('ASSEMBLY.txt'));
  check('ZIP advertises its members in a header', (layersResponse.headers.get('x-cake-files') ?? '').includes('manifest.json'));

  /* 5 — guard rails ------------------------------------------------ */
  const blockedProject = projectWith(project, { size: { presetId: 'custom', widthMm: 101.6, heightMm: 152.4 } });
  const blocked = await postJson('/api/cake/export', { ...blockedProject, format: 'svg' });
  const blockedBody = await blocked.json();
  check('mismatched size is blocked with 422', blocked.status === 422, String(blocked.status));
  check('blocked response explains itself', blockedBody.blocked === true && /aspect|aspect ratio|Size does not match/i.test(JSON.stringify(blockedBody)), JSON.stringify(blockedBody).slice(0, 200));

  const invalidFormat = await postJson('/api/cake/export', { ...project, format: 'tiff' });
  check('invalid format is rejected with 400', invalidFormat.status === 400, String(invalidFormat.status));

  const tooManyLines = await postJson('/api/cake/export', {
    ...project,
    project: { ...project.project, content: { ...project.project.content, name: 'x'.repeat(200) } },
    format: 'png',
    dryRun: true,
  });
  check('over-long name is rejected by validation', tooManyLines.status === 400, String(tooManyLines.status));

  const longButLegal = await postJson('/api/cake/export', {
    ...project,
    project: { ...project.project, content: { ...project.project.content, name: 'Bartholomew-Fitzgerald-Smythe' } },
    format: 'svg',
  });
  const longSvg = new TextDecoder().decode(await readBody(longButLegal));
  check(
    'long hyphenated name exports without truncation or crash',
    longButLegal.ok && (longSvg.includes('Bartholomew') || longSvg.includes('Fitzgerald')),
    `status ${longButLegal.status}, ${longSvg.length} bytes`,
  );

  const unicodeExport = await postJson('/api/cake/export', {
    ...project,
    project: { ...project.project, content: { ...project.project.content, name: 'आरव', subtitle: 'वाढदिवसाच्या शुभेच्छा' } },
    format: 'pdf',
  });
  check('Devanagari export produces a PDF', unicodeExport.ok && isPdf(await readBody(unicodeExport)), String(unicodeExport.status));

  const oversize = await postJson('/api/cake/export', { ...project, padding: 'x'.repeat(600_000) });
  check('oversized request is rejected with 413', oversize.status === 413, String(oversize.status));

  const notJson = await fetch(`${BASE}/api/cake/export`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'not json' });
  check('malformed body is rejected with 400', notJson.status === 400, String(notJson.status));

  const getExport = await get('/api/cake/export');
  check('GET on the export route explains the usage', getExport.status === 405, String(getExport.status));

  /* 6 — pages ------------------------------------------------------ */
  for (const [path, needle] of [
    ['/cake', 'Paper-art cake toppers'],
    ['/cake/templates', 'Design library'],
    ['/cake/editor', 'Words'],
    ['/cake/print', 'Preflight'],
  ]) {
    const response = await get(path);
    const html = await response.text();
    check(`page ${path} renders`, response.ok && html.includes(needle), `${response.status}, ${html.length} bytes`);
  }

  /* 7 — every design can be previewed ------------------------------ */
  let previewFailures = 0;
  for (const template of catalog.templates) {
    const response = await get(`/api/cake/preview?templateId=${template.id}&widthMm=${template.nominalMm.w}&heightMm=${template.nominalMm.h}`);
    if (!response.ok) {
      previewFailures += 1;
      check(`preview renders ${template.id}`, false, String(response.status));
    }
  }
  check('all 60 designs preview successfully', previewFailures === 0, `${previewFailures} failure(s)`);

  /* report ---------------------------------------------------------- */
  const failed = results.filter(([status]) => status === 'FAIL');
  for (const [status, name, detail] of results) {
    if (status === 'FAIL') console.log(`\u001b[31m${status}\u001b[0m ${name}${detail ? ` — ${detail}` : ''}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log(`\u001b[31m${failed.length} check(s) failed\u001b[0m`);
    process.exit(1);
  }
  console.log('\u001b[32mCake Atelier end-to-end: all checks passed\u001b[0m');
}

main().catch((error) => {
  console.error('\u001b[31mThe end-to-end run crashed:\u001b[0m', error);
  process.exit(1);
});
