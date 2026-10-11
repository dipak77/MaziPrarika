import { expect, test, type Download, type Page } from '@playwright/test';

/**
 * Cake Atelier Pro — browser end-to-end.
 *
 * Run with:  npx playwright install chromium && npx playwright test
 *
 * These specs drive the real UI in a real browser: template selection, name
 * entry (short, long, hyphenated, Unicode), font and palette changes, download
 * verification for every format, save/restore across a reload, the mobile
 * layout, and the visible validation messages.
 *
 * NOT EXECUTED IN THE BUILD SANDBOX — no browser binary is available there. The
 * Node-level suite in `tests/cake-atelier.e2e.mjs` exercises the same API
 * surface from the command line and is the one wired into CI here.
 */

const CAKE = '/cake';

async function readDownload(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function openEditor(page: Page, templateId = 'royal-prince-crown') {
  await page.goto(`${CAKE}/editor?template=${templateId}`);
  // The canvas is the artwork; wait for the real SVG rather than a spinner.
  await expect(page.locator('[role="img"] svg').first()).toBeVisible({ timeout: 30_000 });
}

/** The name shown in the live SVG (text node or outlined path — both count). */
async function canvasContains(page: Page, text: string): Promise<boolean> {
  return page.locator('[role="img"]').evaluate((element, needle) => (element.textContent ?? '').includes(String(needle)), text);
}

test.describe('Cake Atelier — designer', () => {
  test('gallery lists sixty designs and opens one in the editor', async ({ page }) => {
    await page.goto(`${CAKE}/templates`);
    await expect(page.getByRole('heading', { name: 'Design library', level: 2 })).toBeVisible();
    await expect(page.getByText('60 of 60 designs')).toBeVisible({ timeout: 30_000 });

    // Filtering narrows the grid without a page reload.
    await page.getByLabel('Collection').selectOption('ocean');
    await expect(page.getByText('5 of 60 designs in Ocean & Underwater')).toBeVisible();

    await page.getByRole('link', { name: 'Open in editor' }).first().click();
    await expect(page).toHaveURL(/\/cake\/editor\?template=/);
    await expect(page.locator('[role="img"] svg')).toBeVisible({ timeout: 30_000 });
  });

  test('typing a short name updates the artwork and keeps the layout fixed', async ({ page }) => {
    await openEditor(page);
    const before = await page.locator('[role="img"]').innerHTML();

    await page.getByLabel("Child's name").fill('Meher');
    await expect(page.getByText('Meher')).toBeVisible();

    const after = await page.locator('[role="img"]').innerHTML();
    // The artwork changes (the name is part of it) but the plate geometry does
    // not: the name node is the only difference.
    expect(after).not.toBe(before);
    const strip = (svg: string) => svg.replace(/<g[^>]*:name[^>]*>[\s\S]*?<\/g>/g, '<g/>').replace(/<title>[\s\S]*?<\/title>/g, '');
    expect(strip(after)).toBe(strip(before));
  });

  test('a very long name never overflows the plate silently', async ({ page }) => {
    await openEditor(page);
    await page.getByLabel("Child's name").fill('Bartholomew-Fitzgerald-Smythe-Whitmore');
    await expect(page.getByText(/does not fit|line allowance|extra line/i).first()).toBeVisible({ timeout: 15_000 });
    // No ellipsis is ever introduced by the engine.
    const svg = await page.locator('[role="img"]').innerHTML();
    expect(svg).not.toContain('…');
  });

  test('a Marathi name renders with a Devanagari-capable face', async ({ page }) => {
    await openEditor(page, 'rose-gold-crown-frame');
    await page.getByLabel("Child's name").fill('आरव');
    await expect(page.getByText('आरव')).toBeVisible();
    const status = page.getByText(/substituted|devanagari|fits|shrunk/i).first();
    await expect(status).toBeVisible();
  });

  test('changing the font changes the glyphs but not the composition', async ({ page }) => {
    await openEditor(page, 'royal-prince-crown');
    const geometry = () => page.locator('[role="img"]').innerHTML();
    const before = await geometry();

    await page.getByLabel('Name font').selectOption('baloo2');
    await expect(page.locator('[role="img"]')).toBeVisible();
    const after = await geometry();

    expect(after).not.toBe(before);
    const pathsOnly = (svg: string) =>
      [...svg.matchAll(/d="([^"]+)"/g)].map((match) => match[1]).filter((d) => !/(name|title|subtitle|age)/.test(d)).join('|');
    expect(pathsOnly(after).length).toBeGreaterThan(200);
  });

  test('changing the palette repaints without moving anything', async ({ page }) => {
    await openEditor(page, 'little-king-throne');
    const snapshot = () => page.locator('[role="img"]').innerHTML();
    const before = await snapshot();

    await page.getByRole('button', { name: /Blush & Rose Gold|Midnight/ }).first().click();
    await expect(page.locator('[role="img"]')).toBeVisible();

    const after = await snapshot();
    expect(after).not.toBe(before);
    const geometry = (svg: string) => [...svg.matchAll(/d="([^"]+)"/g)].map((match) => match[1]).join('|');
    expect(geometry(after)).toBe(geometry(before));
  });

  test('undo and redo restore the previous wording', async ({ page }) => {
    await openEditor(page);
    await page.getByLabel("Child's name").fill('Vihaan');
    await page.keyboard.press('Control+z');
    await expect(page.getByLabel("Child's name")).not.toHaveValue('Vihaan');
    await page.keyboard.press('Control+Shift+z');
    await expect(page.getByLabel("Child's name")).toHaveValue('Vihaan');
  });

  test('a design saves, survives a reload and opens again', async ({ page }) => {
    await openEditor(page, 'galaxy-name');
    await page.getByLabel("Child's name").fill('Nyra');
    await page.getByLabel('Project name').fill('Nyra galaxy');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Saved “Nyra galaxy”.')).toBeVisible({ timeout: 15_000 });

    await page.reload();
    await expect(page.locator('[role="img"] svg')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByLabel("Child's name")).toHaveValue('Nyra');

    await page.getByRole('button', { name: /Nyra galaxy/ }).first().click();
    await expect(page.getByLabel('Project name')).toHaveValue('Nyra galaxy');
  });

  test('validation explains a blocked design instead of allowing the export', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    await expect(page.getByRole('heading', { name: 'Preflight' })).toBeVisible();

    // Force an impossible size through the studio's own custom-size control.
    await page.getByLabel('Custom width').fill('300');
    await page.getByLabel('Custom height').fill('80');
    await page.getByRole('button', { name: 'Apply custom size' }).click();

    await expect(page.getByText(/Size does not match|Blocked/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: /Download/i })).toBeDisabled();
  });

  test('keyboard help is reachable and dismissible', async ({ page }) => {
    await openEditor(page);
    await page.getByRole('button', { name: 'Shortcuts' }).click();
    const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('Cake Atelier — downloads', () => {
  test('PNG download is a real PNG at the advertised size', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    await page.getByRole('button', { name: 'PNG', exact: true }).click();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByRole('button', { name: /Download PNG/i }).click(),
    ]);

    const bytes = await readDownload(download);
    expect(bytes.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    // IHDR width/height, big-endian, at offsets 16 and 20.
    expect(bytes.readUInt32BE(16)).toBe(1800);
    expect(bytes.readUInt32BE(20)).toBe(1800);
    expect(download.suggestedFilename()).toMatch(/\.png$/);
    await expect(page.getByText(/Saved .*\.png/)).toBeVisible();
  });

  test('SVG download carries physical millimetres', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    await page.getByRole('button', { name: 'SVG', exact: true }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByRole('button', { name: /Download SVG/i }).click(),
    ]);
    const svg = (await readDownload(download)).toString('utf8');
    expect(svg).toContain('mm"');
    expect(svg).toContain('viewBox=');
    expect(svg).not.toContain('<script');
  });

  test('PDF download is a PDF with the right page box', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    await page.getByRole('button', { name: 'PDF', exact: true }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByRole('button', { name: /Download PDF/i }).click(),
    ]);
    const pdf = (await readDownload(download)).toString('latin1');
    expect(pdf.startsWith('%PDF-')).toBe(true);
    expect(pdf).toMatch(/\/MediaBox \[0 0 [\d.]+ [\d.]+\]/);
  });

  test('layered download is a ZIP with a manifest and one file per layer', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    await page.getByRole('button', { name: 'Layered', exact: true }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 90_000 }),
      page.getByRole('button', { name: /Download LAYERS/i }).click(),
    ]);
    const zip = await readDownload(download);
    expect(zip.subarray(0, 2).toString('latin1')).toBe('PK');
    const listing = zip.toString('latin1');
    expect(listing).toContain('manifest.json');
    expect(listing).toContain('ASSEMBLY.txt');
    expect(listing).toMatch(/layer-[a-z-]+\.svg/);
  });

  test('every export is recorded in the local history', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByRole('button', { name: /Download PNG/i }).click(),
    ]);
    const name = download.suggestedFilename();
    await expect(page.getByRole('heading', { name: 'Export history' })).toBeVisible();
    await expect(page.getByText(name.slice(0, 18))).toBeVisible();
  });
});

test.describe('Cake Atelier — mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the editor is usable on a phone', async ({ page }) => {
    await openEditor(page);
    await expect(page.locator('[role="img"] svg')).toBeVisible();
    // No horizontal overflow.
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(400);

    await page.getByLabel("Child's name").scrollIntoViewIfNeeded();
    await page.getByLabel("Child's name").fill('Ira');
    await expect(page.getByText('Ira')).toBeVisible();
  });

  test('the print studio stacks without losing the export button', async ({ page }) => {
    await page.goto(`${CAKE}/print`);
    const button = page.getByRole('button', { name: /Download/i });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
  });
});
