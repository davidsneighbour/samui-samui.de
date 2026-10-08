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
    .toBeGreaterThan(desktop.height);
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
