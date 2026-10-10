import { expect, test } from '@playwright/test';
import { formatConversion } from '../utils/currency/conversion';
import { formatDate } from '../utils/dates';

const paths = [
  ['/2005/01/in-the-laundry-ii/', '160 THB', '≈ 4,00\u00a0€'],
  [
    '/2005/01/wie-man-kaputte-motorraeder-zurueck-gibt/',
    '500 THB',
    '≈ 12,50\u00a0€',
  ],
  ['/2005/06/helmpflicht/', '600 THB', '≈ 15,00\u00a0€'],
  ['/2006/12/ausgeraucht/', '2000 THB', '≈ 50,00\u00a0€'],
] as const;
test.use({ hasTouch: true });

const key = 'samui-samui:currency:eur-thb:v1';

for (const [path, original, converted] of paths) {
  test(`currency migration ${path}`, async ({ page }) => {
    let requests = 0;
    await page.route('https://api.frankfurter.dev/**', (route) => {
      requests++;
      return route.fulfill({
        json: { base: 'EUR', date: '2026-10-09', quote: 'THB', rate: 40 },
      });
    });
    await page.goto(path);
    const amount = page.locator('dnb-currency');
    await expect(amount.locator('[data-tooltip-trigger]')).toHaveText(original);
    const trigger = amount.locator('[data-tooltip-trigger]');
    await expect(trigger).toHaveCSS('text-decoration-style', 'dotted');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await expect(amount).toHaveAttribute('data-tooltip-state', 'open');
    await expect(
      amount.locator('[data-currency-current-conversion]'),
    ).toHaveText(converted);
    await expect(
      amount.locator('[data-currency-current-rate-date]'),
    ).toHaveText('9. Oktober 2026');
    const history = JSON.parse(
      await amount.evaluate(
        (node) =>
          node
            .closest('[data-currency-history]')
            ?.getAttribute('data-currency-history') ?? '{}',
      ),
    );
    await expect(amount.locator('[data-currency-conversion]')).toHaveText(
      formatConversion(
        Number(await amount.getAttribute('amount')),
        'THB',
        history.rate,
      ),
    );
    await expect(amount.locator('[data-currency-rate-date]')).toHaveText(
      formatDate(new Date(history.rateDate)),
    );
    await expect(amount.locator('[data-currency-source]')).toHaveText(
      'EZB-Referenzkurs',
    );
    await expect(
      amount.locator('[data-currency-conversion]').locator('..'),
    ).toHaveText(/^Damals ≈ /);
    await expect(
      amount.locator('[data-currency-current-conversion]').locator('..'),
    ).toHaveText(/^Heute ≈ /);
    const overflow = await amount
      .locator('[role=tooltip]')
      .evaluate((node) => ({
        height: node.scrollHeight - node.clientHeight,
        overflow: getComputedStyle(node).overflow,
        width: node.scrollWidth - node.clientWidth,
      }));
    expect(overflow.overflow).toBe('visible');
    expect(overflow.width).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await expect(amount).not.toHaveAttribute('data-tooltip-state', 'open');
    await trigger.hover();
    await expect(amount).toHaveAttribute('data-tooltip-state', 'open');
    expect(requests).toBe(1);
    await page.reload();
    await expect(page.locator('dnb-currency')).toHaveAttribute(
      'data-currency-ready',
      '',
    );
    expect(requests).toBe(1);
    await page.setViewportSize({ height: 812, width: 375 });
    await trigger.tap();
    await expect(amount).toHaveAttribute('data-tooltip-state', 'open');
    const bounds = await amount.locator('[role=tooltip]').boundingBox();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(375);
  });
  test(`original price without JavaScript ${path}`, async ({
    browser,
  }, testInfo) => {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto(`${testInfo.project.use.baseURL}${path}`);
    await expect(page.locator('dnb-currency')).toHaveText(original);
    await expect(page.locator('dnb-currency [tabindex]')).toHaveCount(0);
    await context.close();
  });
}

test('deduplicates many amounts, converts EUR, and survives client navigation', async ({
  page,
}) => {
  let requests = 0;
  await page.route('https://api.frankfurter.dev/**', (route) => {
    requests++;
    return route.fulfill({
      json: { base: 'EUR', date: '2026-10-09', quote: 'THB', rate: 40 },
    });
  });
  await page.goto(paths[0][0]);
  await expect(page.locator('dnb-currency')).toHaveAttribute(
    'data-currency-ready',
    '',
  );
  await page.evaluate(() => {
    for (let i = 0; i < 20; i++) {
      const node = document.createElement('dnb-currency');
      node.setAttribute('amount', '25');
      node.setAttribute('currency', 'EUR');
      node.textContent = '25 €';
      document.querySelector('main')?.append(node);
    }
    document.dispatchEvent(new Event('astro:page-load'));
    const link = document.createElement('a');
    link.href = '/2005/06/helmpflicht/';
    link.textContent = 'Currency navigation test';
    document.querySelector('main')?.append(link);
    (
      window as unknown as { currencyNavigationMarker: boolean }
    ).currencyNavigationMarker = true;
  });
  await expect(
    page.locator('dnb-currency [data-currency-conversion]').last(),
  ).toHaveText('≈ 1.000\u00a0฿');
  await page.getByRole('link', { name: 'Currency navigation test' }).click();
  await expect(page).toHaveURL(/helmpflicht/);
  await expect(page.locator('dnb-currency')).toHaveAttribute(
    'data-currency-ready',
    '',
  );
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { currencyNavigationMarker: boolean })
          .currencyNavigationMarker,
    ),
  ).toBe(true);
  expect(requests).toBe(1);
});

for (const age of [25, 169]) {
  test(`offline cache aged ${age} hours`, async ({ page }) => {
    await page.addInitScript(
      ({ key, age }) => {
        localStorage.setItem(
          key,
          JSON.stringify({
            fetchedAt: new Date(Date.now() - age * 3600000).toISOString(),
            provider: 'ECB',
            rate: 40,
            rateDate: '2026-10-02',
            source: 'frankfurter',
            version: 1,
          }),
        );
      },
      { age, key },
    );
    await page.route('https://api.frankfurter.dev/**', (route) =>
      route.abort(),
    );
    await page.route('**/2005/01/in-the-laundry-ii/', async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        body: (await response.text()).replace(
          / data-currency-history="[^"]*"/g,
          '',
        ),
        response,
      });
    });
    await page.goto(paths[0][0]);
    if (age < 168) {
      await expect(page.locator('dnb-currency')).toHaveAttribute(
        'data-currency-ready',
        '',
      );
      await expect(page.locator('[data-currency-rate-date]')).toHaveText(
        'EZB-Referenzkurs vom 2. Oktober 2026',
      );
    } else {
      await expect(page.locator('dnb-currency')).toHaveText('160 THB');
      await expect(page.locator('dnb-currency [tabindex]')).toHaveCount(0);
    }
  });
}

test('no amounts means no exchange-rate request', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.frankfurter.dev/**', (route) => {
    requests++;
    return route.abort();
  });
  await page.goto('/2005/11/channel10/');
  await expect(page.locator('dnb-currency')).toHaveCount(0);
  expect(requests).toBe(0);
});

test('content tooltips prefer top and fall back below at the viewport edge', async ({
  page,
}) => {
  await page.route('https://api.frankfurter.dev/**', (route) =>
    route.fulfill({
      json: { base: 'EUR', date: '2026-10-09', quote: 'THB', rate: 40 },
    }),
  );
  await page.goto(paths[0][0]);
  const amount = page.locator('dnb-currency');
  await expect(amount).toHaveAttribute('data-currency-ready', '');
  await amount.evaluate((node) => {
    node.style.position = 'fixed';
    node.style.top = '200px';
    node.style.left = '100px';
  });
  await amount.locator('[data-tooltip-trigger]').focus();
  await expect(amount).toHaveAttribute(
    'data-tooltip-resolved-placement',
    'top',
  );
  await amount.evaluate((node) => {
    node.style.top = '0px';
    window.dispatchEvent(new Event('resize'));
  });
  await expect(amount).toHaveAttribute(
    'data-tooltip-resolved-placement',
    'bottom',
  );
});

test('historical conversion survives failure of the current lookup', async ({
  page,
}) => {
  let requests = 0;
  await page.route('https://api.frankfurter.dev/**', (route) => {
    requests++;
    expect(new URL(route.request().url()).searchParams.has('date')).toBe(false);
    return route.abort();
  });
  await page.goto(paths[0][0]);
  const amount = page.locator('dnb-currency');
  await expect(amount.locator('[data-currency-conversion]')).toHaveText(
    '≈ 3,21\u00a0€',
  );
  await expect(
    amount.locator('[data-currency-current-conversion]'),
  ).toHaveCount(0);
  await amount.locator('[data-tooltip-trigger]').focus();
  await expect(amount.locator('[popover]')).toHaveJSProperty(
    'popover',
    'manual',
  );
  expect(requests).toBe(1);
});

test('historical-only amounts make no visitor rate requests', async ({
  page,
}) => {
  let requests = 0;
  await page.route('https://api.frankfurter.dev/**', (route) => {
    requests++;
    return route.abort();
  });
  await page.route('**/2005/01/in-the-laundry-ii/', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      body: (await response.text()).replace(
        /&quot;compareCurrent&quot;:true/g,
        '&quot;compareCurrent&quot;:false',
      ),
      response,
    });
  });
  await page.goto(paths[0][0]);
  await expect(page.locator('[data-currency-conversion]')).toHaveText(
    'damals ≈ 3,21\u00a0€',
  );
  expect(requests).toBe(0);
});

test('separate article scopes retain their own stored historical rates', async ({
  page,
}) => {
  await page.route('https://api.frankfurter.dev/**', (route) => route.abort());
  await page.goto(paths[0][0]);
  await expect(page.locator('dnb-currency')).toHaveAttribute(
    'data-currency-ready',
    '',
  );
  await page.evaluate(() => {
    const history = JSON.parse(
      document
        .querySelector('[data-currency-history]')
        ?.getAttribute('data-currency-history') ?? '{}',
    );
    for (const rate of [25, 50]) {
      const article = document.createElement('article');
      article.dataset['currencyHistory'] = JSON.stringify({
        ...history,
        compareCurrent: false,
        rate,
      });
      article.dataset['currencyTestScope'] = '';
      const amount = document.createElement('dnb-currency');
      amount.setAttribute('amount', '100');
      amount.setAttribute('currency', 'THB');
      amount.textContent = '100 THB';
      article.append(amount);
      document.querySelector('main')?.append(article);
    }
    document.dispatchEvent(new Event('astro:page-load'));
  });
  await expect(
    page.locator('[data-currency-test-scope] [data-currency-conversion]'),
  ).toHaveText(['damals ≈ 4,00\u00a0€', 'damals ≈ 2,00\u00a0€']);
});
