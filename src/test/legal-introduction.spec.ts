import { expect, test } from '@playwright/test';

const storageKey = 'samui-legal-introduction-dismissed';
const paths = [
  '/kleingedrucktes/',
  '/kleingedrucktes/impressum/',
  '/kleingedrucktes/datenschutzerklaerung/',
  '/kleingedrucktes/kommentarrichtlinien/',
];

for (const path of paths) {
  test(`introduction is readable on ${path}`, async ({ page }) => {
    await page.goto(path);
    const panel = page.locator('[data-legal-introduction]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.dnb-notice__description p')).toHaveCount(10);
    await expect(panel.locator('.dnb-notice__description')).toHaveCSS(
      'font-size',
      '16px',
    );
    await expect(
      panel.getByRole('link', { name: 'Kontaktdaten' }),
    ).toHaveAttribute('href', '/kontakt/');
    await expect(
      panel.getByRole('button', { name: 'Einleitung schließen' }),
    ).toBeVisible();
  });
}

test('keyboard dismissal persists throughout the section and after reload', async ({
  page,
}) => {
  await page.goto(paths[0]!);
  const panel = page.locator('[data-legal-introduction]');
  await panel.getByRole('button', { name: 'Einleitung schließen' }).focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeHidden();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), storageKey),
  ).toBe('1');
  await page.evaluate(() => Reflect.set(window, 'legalNavigationMarker', true));
  await page.locator('article a[href="/kleingedrucktes/impressum/"]').click();
  await expect(page).toHaveURL(/\/kleingedrucktes\/impressum\/$/);
  expect(
    await page.evaluate(() => Reflect.get(window, 'legalNavigationMarker')),
  ).toBe(true);
  await expect(page.locator('[data-legal-introduction]')).toBeHidden();
  await expect(
    page.getByRole('heading', { exact: true, name: 'Anbieter' }),
  ).toBeVisible();
  for (const path of paths.slice(1)) {
    await page.goto(path);
    await expect(page.locator('[data-legal-introduction]')).toBeHidden();
    await page.reload();
    await expect(page.locator('[data-legal-introduction]')).toBeHidden();
  }
});

test('dismissal works after an Astro navigation', async ({ page }) => {
  await page.goto(paths[0]!);
  await page.locator('article a[href="/kleingedrucktes/impressum/"]').click();
  await expect(page).toHaveURL(/\/kleingedrucktes\/impressum\/$/);
  const panel = page.locator('[data-legal-introduction]');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Einleitung schließen' }).click();
  await expect(panel).toBeHidden();
  await page.reload();
  await expect(page.locator('[data-legal-introduction]')).toBeHidden();
});

test('blocked storage still permits closing the current introduction', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    });
  });
  await page.goto(paths[0]!);
  const panel = page.locator('[data-legal-introduction]');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Einleitung schließen' }).click();
  await expect(panel).toBeHidden();
  await page.reload();
  await expect(page.locator('[data-legal-introduction]')).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('the full introduction and contact link remain available', async ({
    page,
  }) => {
    await page.goto(paths[0]!);
    const panel = page.locator('[data-legal-introduction]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('.dnb-notice__description p')).toHaveCount(10);
    await panel.getByRole('link', { name: 'Kontaktdaten' }).click();
    await expect(page).toHaveURL(/\/kontakt\/$/);
  });
});
