import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createIndex } from 'pagefind';

let bundle: string;
test.beforeAll(async () => {
  bundle = fs.mkdtempSync(path.join(os.tmpdir(), 'samui-relic-search-'));
  const { index } = await createIndex();
  if (!index) throw new Error('Pagefind failed to create test index');
  for (const relic of ['false', 'partial', 'true']) {
    const title =
      relic === 'false'
        ? 'Regular fixture'
        : relic === 'partial'
          ? 'Partial fixture'
          : 'Relic fixture';
    const result = await index.addHTMLFile({
      content: `<html lang="de"><head><title>${title}</title><meta data-pagefind-filter="relic:${relic === 'true'}" data-pagefind-meta="relic:${relic !== 'false'}" content="${relic}"></head><body><h1>${title}</h1><p>Samui content</p><aside data-pagefind-ignore>Generic notice</aside></body></html>`,
      url: `/${relic}/`,
    });
    expect(result.errors).toEqual([]);
  }
  const written = await index.writeFiles({ outputPath: bundle });
  expect(written.errors).toEqual([]);
  await index.deleteIndex();
});
test.afterAll(() => fs.rmSync(bundle, { force: true, recursive: true }));
test.beforeEach(async ({ page }) => {
  await page.route('**/pagefind/**', (route) => {
    const file = path.join(
      bundle,
      new URL(route.request().url()).pathname.split('/pagefind/')[1] ?? '',
    );
    if (!fs.existsSync(file) || !fs.statSync(file).isFile())
      return route.abort();
    const contentType = file.endsWith('.js')
      ? 'application/javascript'
      : file.endsWith('.wasm')
        ? 'application/wasm'
        : 'application/octet-stream';
    return route.fulfill({ body: fs.readFileSync(file), contentType });
  });
});

test('search defaults to regular results, opts in, labels relics, and resets after navigation', async ({
  page,
}) => {
  await page.goto('/suche/?q=Samui');
  const results = page.locator('pagefind-results[instance="search-page"]');
  const filter = page.locator(
    'relic-search-filter[data-instance="search-page"] input',
  );
  await expect(filter).not.toBeChecked();
  await expect(
    results.getByRole('link', { name: 'Regular fixture' }),
  ).toBeVisible();
  await expect(
    results.getByRole('link', { name: 'Relic fixture' }),
  ).toHaveCount(0);
  await expect(
    results.getByRole('link', { name: 'Partial fixture' }),
  ).toBeVisible();
  await filter.check();
  await expect(
    results.getByRole('link', { name: 'Relic fixture' }),
  ).toBeVisible();
  await expect(results.getByText('Digitales Relikt')).toHaveCount(2);
  await filter.uncheck();
  await expect(
    results.getByRole('link', { name: 'Relic fixture' }),
  ).toHaveCount(0);
  await page
    .getByRole('link', { exact: true, name: 'Kontakt' })
    .first()
    .click();
  await page.getByRole('link', { exact: true, name: 'Suche' }).first().click();
  await expect(
    page.locator('relic-search-filter[data-instance="search-page"] input'),
  ).not.toBeChecked();
});

for (const [url, instance] of [
  ['/suche/', 'default'],
  ['/archiv/', 'archive'],
] as const) {
  test(`${instance} dropdown applies the same opt-in filter`, async ({
    page,
  }) => {
    await page.goto(url);
    const surface = page.locator(
      instance === 'default'
        ? 'pagefind-searchbox:not([instance])'
        : `pagefind-searchbox[instance="${instance}"]`,
    );
    await surface.locator('input').fill('Samui');
    await expect(
      surface.getByRole('option', { name: /Regular fixture/ }),
    ).toBeVisible();
    await expect(
      surface.getByRole('option', { name: /Relic fixture/ }),
    ).toHaveCount(0);
    await expect(
      surface.getByRole('option', { name: /Partial fixture/ }),
    ).toBeVisible();
    if (instance === 'default')
      await page.locator('.header-search summary').click();
    await page
      .locator(`relic-search-filter[data-instance="${instance}"] input`)
      .check();
    await surface.locator('input').focus();
    await expect(
      surface.getByRole('option', { name: /Relic fixture/ }),
    ).toBeVisible();
    await surface.locator('input').press('ArrowDown');
    await expect(surface.locator('[aria-selected="true"]')).toHaveCount(1);
  });
}

test('header options stay collapsed and the field stays in one row after navigation', async ({
  page,
}) => {
  await page.goto('/suche/');
  await page
    .getByRole('link', { exact: true, name: 'Kontakt' })
    .first()
    .click();
  await page.getByRole('link', { exact: true, name: 'Suche' }).first().click();
  await page.goto('/2006/11/fu-noi/');
  await page
    .getByRole('link', { exact: true, name: 'Kontakt' })
    .first()
    .click();
  await expect(page).toHaveURL(/\/kontakt\/$/);
  await page.goBack();
  await expect(page.locator('.lost-content')).toBeVisible();
  await expect(page.locator('meta[name="relic"]')).toHaveAttribute(
    'data-pagefind-filter',
    'relic:false',
  );
  await expect(page.locator('meta[name="relic"]')).toHaveAttribute(
    'data-pagefind-meta',
    'relic:true',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ height: 800, width });
    const header = page.locator('.header-search');
    await expect(header.locator('input[type="checkbox"]')).toBeHidden();
    const field = await header.locator('pagefind-searchbox').boundingBox();
    const bounds = await header.boundingBox();
    expect(field).not.toBeNull();
    expect(bounds!.height).toBeLessThanOrEqual(field!.height + 2);
    await header.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(header.locator('input[type="checkbox"]')).toBeVisible();
    await page.keyboard.press('Enter');
  }
});
