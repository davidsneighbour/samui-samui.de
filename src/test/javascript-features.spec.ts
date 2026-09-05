import { expect, test } from '@playwright/test';

test('theme toggle keeps working and resyncs after client-side navigation', async ({
  page,
}) => {
  await page.goto('/');

  const toggle = page.getByRole('button', {
    name: 'Helles Farbschema aktivieren',
  });
  await expect(toggle).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Dunkles Farbschema aktivieren' }),
  ).toBeVisible();

  await page.getByRole('link', { name: /Kontakt/ }).click();
  await expect(page).toHaveURL(/\/kontakt\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  const swappedToggle = page.getByRole('button', {
    name: 'Dunkles Farbschema aktivieren',
  });
  await expect(swappedToggle).toBeVisible();

  await swappedToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(
    page.getByRole('button', { name: 'Helles Farbschema aktivieren' }),
  ).toBeVisible();
});

test('dismissible banner and sound toggle still bind after navigation', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('link', { name: /Kontakt/ }).click();
  await expect(page).toHaveURL(/\/kontakt\/$/);

  await page.getByRole('button', { name: 'Hinweis schließen' }).click();
  await expect(page.locator('#construction-banner')).toHaveClass(
    /construction-banner--closed/,
  );
  await expect(
    page.evaluate(() => localStorage.getItem('construction-banner-dismissed')),
  ).resolves.toBe('1');

  const soundToggle = page.locator('[data-sound-toggle]');
  await expect(soundToggle).toHaveAccessibleName('Klangeffekte deaktivieren');
  await expect(soundToggle).toHaveAttribute('data-sound', 'on');
  await soundToggle.click();
  await expect(soundToggle).toHaveAttribute('data-sound', 'off');
  await expect(soundToggle).toHaveAccessibleName('Klangeffekte aktivieren');
  await expect(
    page.evaluate(() => localStorage.getItem('samui-sound')),
  ).resolves.toBe('off');
});

test('search query runs after client-side navigation', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    history.pushState({}, '', '/suche/?q=Samui');
    document.dispatchEvent(new Event('astro:page-load'));
  });

  await page.goto('/suche/?q=Samui');
  await expect(
    page.locator('pagefind-input[instance="search-page"]'),
  ).toBeVisible();
  await expect(
    page.locator('pagefind-results[instance="search-page"]'),
  ).toBeVisible();
});
