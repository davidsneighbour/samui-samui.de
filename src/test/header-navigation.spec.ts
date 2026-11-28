import { expect, test } from '@playwright/test';

for (const width of [375, 1200]) {
  test(`navigation sticks independently and releases at the footer at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 720, width });
    await page.goto('/');
    const navigation = page.locator('[data-header-navigation]');
    const initial = await navigation.boundingBox();
    if (!initial) throw new Error('Expected the navigation bar.');
    await page.evaluate(
      (y) => scrollTo(0, y),
      initial.y + initial.height + 300,
    );
    await expect
      .poll(async () => (await navigation.boundingBox())?.y)
      .toBeCloseTo(0, 1);
    await expect
      .poll(async () => (await page.locator('.masthead').boundingBox())?.y ?? 0)
      .toBeLessThan(-initial.height);
    await expect(navigation).not.toHaveAttribute('data-footer-visible');
    expect(
      await navigation.evaluate(
        (node) => getComputedStyle(node).backgroundColor,
      ),
    ).not.toBe('rgba(0, 0, 0, 0)');
    expect(
      await navigation.evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        return (
          document
            .elementFromPoint(bounds.width / 2, bounds.bottom - 2)
            ?.closest('[data-header-navigation]') === node
        );
      }),
    ).toBe(true);

    const inset = await page
      .locator('html')
      .evaluate((node) => parseFloat(getComputedStyle(node).scrollPaddingTop));
    expect(inset).toBeCloseTo(initial.height, 1);
    // An actual content anchor must land below the sticky bar.
    const target = page.locator('main article').nth(1);
    await target.evaluate((node) => node.scrollIntoView({ block: 'start' }));
    await expect
      .poll(async () => (await target.boundingBox())?.y ?? 0)
      .toBeGreaterThanOrEqual(initial.height - 1);

    await page
      .locator('body > footer')
      .evaluate((node) => node.scrollIntoView({ block: 'end' }));
    await expect(navigation).toHaveAttribute('data-footer-visible');
    await expect
      .poll(async () =>
        navigation.evaluate((node) => getComputedStyle(node).position),
      )
      .toBe('relative');
    await expect
      .poll(async () => (await navigation.boundingBox())?.y ?? 0)
      .toBeLessThan(-initial.height);
    await expect
      .poll(async () =>
        page
          .locator('html')
          .evaluate((node) =>
            parseFloat(getComputedStyle(node).scrollPaddingTop),
          ),
      )
      .toBe(0);

    await page.evaluate(
      (y) => scrollTo(0, y),
      initial.y + initial.height + 300,
    );
    await expect(navigation).not.toHaveAttribute('data-footer-visible');
    await expect
      .poll(async () => (await navigation.boundingBox())?.y)
      .toBeCloseTo(0, 1);
  });
}

test('focused navigation stays visible at the footer and releases when focus leaves', async ({
  page,
}) => {
  await page.goto('/');
  const navigation = page.locator('[data-header-navigation]');
  const link = navigation.getByRole('link', { name: 'Startseite' });
  await link.focus();
  await page
    .locator('body > footer')
    .evaluate((node) => node.scrollIntoView({ block: 'end' }));
  await expect(navigation).toHaveAttribute('data-footer-visible');
  await expect(link).toBeFocused();
  await expect
    .poll(async () =>
      navigation.evaluate((node) => getComputedStyle(node).position),
    )
    .toBe('sticky');
  await expect
    .poll(async () => (await navigation.boundingBox())?.y)
    .toBeCloseTo(0, 1);
  await page.locator('body > footer a').first().focus();
  await expect
    .poll(async () =>
      navigation.evaluate((node) => getComputedStyle(node).position),
    )
    .toBe('relative');
});

test('navigation observers and measured height rebind after an Astro page swap', async ({
  page,
}) => {
  await page.goto('/archiv/');
  await page.evaluate(() =>
    Reflect.set(window, '__stickyNavigationTest', 'survives'),
  );
  await page
    .locator('[data-header-navigation]')
    .getByRole('link', { exact: true, name: 'Kontakt' })
    .click();
  await expect(page).toHaveURL(/\/kontakt\/$/);
  // A full reload would lose this marker; the test exercises ClientRouter.
  expect(
    await page.evaluate(() => Reflect.get(window, '__stickyNavigationTest')),
  ).toBe('survives');
  const navigation = page.locator('[data-header-navigation]');
  const bounds = await navigation.boundingBox();
  if (!bounds) throw new Error('Expected swapped navigation.');
  await page.evaluate((y) => scrollTo(0, y), bounds.y + bounds.height + 100);
  await expect
    .poll(async () => (await navigation.boundingBox())?.y)
    .toBeCloseTo(0, 1);
  await page
    .locator('body > footer')
    .evaluate((node) => node.scrollIntoView({ block: 'end' }));
  await expect(navigation).toHaveAttribute('data-footer-visible');
  await expect
    .poll(async () =>
      navigation.evaluate((node) => getComputedStyle(node).position),
    )
    .toBe('relative');
});

test('short pages release immediately and resizing updates anchor clearance', async ({
  page,
}) => {
  await page.setViewportSize({ height: 1600, width: 1200 });
  await page.goto('/404/');
  const navigation = page.locator('[data-header-navigation]');
  await expect(navigation).toHaveAttribute('data-footer-visible');
  await expect
    .poll(async () =>
      navigation.evaluate((node) => getComputedStyle(node).position),
    )
    .toBe('relative');
  await expect
    .poll(async () =>
      page
        .locator('html')
        .evaluate((node) =>
          parseFloat(getComputedStyle(node).scrollPaddingTop),
        ),
    )
    .toBe(0);

  await page.setViewportSize({ height: 720, width: 1200 });
  await page.goto('/');
  const desktop = await navigation.boundingBox();
  if (!desktop) throw new Error('Expected desktop navigation.');
  await page.setViewportSize({ height: 720, width: 375 });
  await expect
    .poll(async () => (await navigation.boundingBox())?.height ?? 0)
    .toBeLessThan(desktop.height);
  await expect
    .poll(async () => {
      const height = (await navigation.boundingBox())?.height ?? 0;
      const inset = await page
        .locator('html')
        .evaluate((node) =>
          parseFloat(getComputedStyle(node).scrollPaddingTop),
        );
      return Math.abs(inset - height);
    })
    .toBeLessThan(1);
});

// Phones get the compact bar, which hides the moving underline.
for (const width of [1200]) {
  test(`hover indicator follows links and returns home at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 720, width });
    await page.goto('/');
    const nav = page.locator('[data-header-navigation]');
    const indicator = nav.locator('[data-navigation-indicator]');
    const home = nav.getByRole('link', { name: 'Startseite' });
    for (const name of ['Archiv', 'Über Patrick', 'Kontakt', 'Startseite']) {
      const link = nav.getByRole('link', { exact: true, name });
      await link.hover();
      await expect
        .poll(async () => {
          const line = await indicator.boundingBox();
          const target = await link.boundingBox();
          if (!line || !target) return 100;
          return (
            Math.abs(line.x - target.x) +
            Math.abs(line.width - target.width) +
            Math.abs(line.y - (target.y + target.height - 4))
          );
        })
        .toBeLessThan(1);
      await expect
        .poll(() =>
          link
            .locator('svg')
            .evaluate((node) => getComputedStyle(node).transform),
        )
        .toBe('matrix(1.15, 0, 0, 1.15, 0, 0)');
      await expect(home).toHaveAttribute('aria-current', 'page');
    }
    await page.mouse.move(0, 0);
    await expect
      .poll(async () => {
        const line = await indicator.boundingBox();
        const target = await home.boundingBox();
        return line && target
          ? Math.abs(line.x - target.x) +
              Math.abs(line.y - (target.y + target.height - 2))
          : 100;
      })
      .toBeLessThan(1);
    const archive = nav.getByRole('link', { exact: true, name: 'Archiv' });
    await archive.focus();
    await expect
      .poll(() =>
        indicator.evaluate((node) => getComputedStyle(node).transitionDuration),
      )
      .toBe('0s');
    await archive.click();
    await expect(page).toHaveURL(/\/archiv\/$/);
    await page.mouse.move(0, 0);
    await expect(nav.locator('[data-navigation-links]')).toHaveAttribute(
      'data-indicator-ready',
    );
    await expect(
      nav.getByRole('link', { exact: true, name: 'Archiv' }),
    ).toHaveAttribute('aria-current', 'page');
  });
}

test('reduced motion removes navigation scaling, lift, and travel animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const nav = page.locator('[data-header-navigation]');
  const archive = nav.getByRole('link', { exact: true, name: 'Archiv' });
  await archive.hover();
  expect(
    await archive
      .locator('svg')
      .evaluate((node) => getComputedStyle(node).transform),
  ).toBe('none');
  const indicator = nav.locator('[data-navigation-indicator]');
  expect(
    await indicator.evaluate((node) =>
      parseFloat(getComputedStyle(node).transitionDuration),
    ),
  ).toBeLessThanOrEqual(0.00001);
  const line = await indicator.boundingBox();
  const target = await archive.boundingBox();
  expect(line?.y).toBeCloseTo((target?.y ?? 0) + (target?.height ?? 0) - 2, 0);
});

test('phone bar folds links and search behind toggles', async ({ page }) => {
  await page.setViewportSize({ height: 720, width: 375 });
  await page.goto('/archiv/');
  const nav = page.locator('[data-header-navigation]');
  const menu = nav.locator('[data-menu-toggle]');
  const search = nav.locator('[data-search-toggle]');
  const links = nav.locator('#header-links');
  const searchRow = nav.locator('#header-search-row');
  await expect(links).toBeHidden();
  await expect(searchRow).toBeHidden();
  const closed = await nav.boundingBox();
  expect(closed?.height ?? 100).toBeLessThan(60);

  await page.evaluate(() => scrollTo(0, 900));
  const scrolled = await page.evaluate(() => scrollY);
  // A direct click: Playwright's click scrolls the target into view first.
  await menu.evaluate((node: HTMLElement) => node.click());
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(links).toBeVisible();
  await expect(
    links.getByRole('link', { exact: true, name: 'Archiv' }),
  ).toHaveAttribute('aria-current', 'page');
  // The panel overlays content, so the bar keeps its height and the page stays put.
  expect((await nav.boundingBox())?.height).toBeCloseTo(closed?.height ?? 0, 0);
  expect(await page.evaluate(() => scrollY)).toBe(scrolled);

  await search.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(links).toBeHidden();
  await expect(searchRow).toBeVisible();
  await expect(searchRow.locator('input').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(searchRow).toBeHidden();
  await expect(search).toBeFocused();
  await expect(search).toHaveAttribute('aria-label', 'Suche öffnen');
});

test('phone bar keeps the full navigation without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { height: 720, width: 375 },
  });
  const page = await context.newPage();
  await page.goto('/archiv/');
  const nav = page.locator('[data-header-navigation]');
  await expect(nav.locator('#header-links')).toBeVisible();
  await expect(nav.locator('[data-menu-toggle]')).toBeHidden();
  await expect(nav.locator('[data-search-toggle]')).toBeHidden();
  await context.close();
});
