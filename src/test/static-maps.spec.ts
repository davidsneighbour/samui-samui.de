import { expect, test } from '@playwright/test';

for (const route of [
  '/2012/07/samui-penang-via-flugzeug-wieder/',
  '/2009/08/umzug/',
]) {
  test(`static map uses a decoded local image without map-provider requests: ${route}`, async ({
    page,
    baseURL,
  }) => {
    const forbidden: string[] = [];
    page.on('request', (request) => {
      const host = new URL(request.url()).hostname;
      if (
        /(^|\.)(google\.[a-z.]+|googleapis\.[a-z.]+|gstatic\.[a-z.]+|openstreetmap\.[a-z.]+|openfreemap\.[a-z.]+|mapbox\.[a-z.]+|maptiler\.[a-z.]+|protomaps\.[a-z.]+)$/.test(
          host,
        )
      )
        forbidden.push(request.url());
    });
    await page.goto(route);
    const figure = page.locator('figure.static-map');
    await expect(figure).toBeVisible();
    const image = figure.locator('img');
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(
      figure.getByRole('link', { name: 'OpenStreetMap-Mitwirkende' }),
    ).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate(
        (element) => (element as HTMLImageElement).naturalWidth,
      ),
    ).toBeGreaterThan(0);
    const src = await image.getAttribute('src');
    expect(new URL(src!, baseURL).origin).toBe(new URL(baseURL!).origin);
    expect(src).not.toContain('/src/content/');
    await page.setViewportSize({ height: 800, width: 375 });
    expect(
      await image.evaluate((element) => element.getBoundingClientRect().width),
    ).toBeLessThanOrEqual(375);
    expect(
      await page
        .locator('article')
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    expect(forbidden).toEqual([]);
  });
}
