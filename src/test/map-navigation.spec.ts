import { expect, test } from '@playwright/test';

// Leaving a page with an interactive map unmounts the React island. The map
// cleanup (`map.remove()`) already removes every control, so a control's own
// cleanup must not remove it a second time. See issue #1870.
test('leaving the contact map page does not log a map cleanup error', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/kontakt/');
  // The map island hydrates with client:visible, so scroll it into view.
  await page
    .locator('astro-island[component-url*="ContactMap"]')
    .scrollIntoViewIfNeeded();
  await expect(page.locator('.maplibregl-ctrl-zoom-in')).toBeAttached({
    timeout: 15_000,
  });

  // Client-side navigation (view transition) swaps the page and unmounts the
  // map island, as in the original report.
  await page.getByRole('link', { exact: true, name: 'Suche' }).first().click();
  await expect(page).toHaveURL(/\/suche\/$/);
  await page.waitForTimeout(500);

  expect(errors.filter((message) => /reading 'off'/.test(message))).toEqual([]);
});
