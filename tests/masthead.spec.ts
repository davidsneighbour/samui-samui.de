import { expect, test } from '@playwright/test';

const twoLineWidths = [320, 375, 390, 430, 575];
const singleLineWidths = [576, 768, 1024, 1200];

type MastheadMetrics = {
  backgroundImage: string;
  documentWidth: number;
  lineCount: number;
  nameHeight: number;
  nameWidth: number;
  viewportWidth: number;
  wordWidths: number[];
};

for (const width of twoLineWidths) {
  test(`masthead title uses two clean lines at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 420, width });
    await page.goto('/tests/masthead-frame');
    await page.evaluate(() => document.fonts.ready);

    const metrics: MastheadMetrics = await page
      .locator('.masthead__name')
      .evaluate((node) => {
        const element = node as HTMLElement;
        const wordRects = Array.from(
          element.querySelectorAll<HTMLElement>('.masthead__word'),
        ).map((word) => word.getBoundingClientRect());
        const uniqueLineTops = new Set(
          wordRects.map((rect) => Math.round(rect.top)),
        );

        return {
          backgroundImage: getComputedStyle(element).backgroundImage,
          documentWidth: document.documentElement.scrollWidth,
          lineCount: uniqueLineTops.size,
          nameHeight: element.getBoundingClientRect().height,
          nameWidth: element.getBoundingClientRect().width,
          viewportWidth: window.innerWidth,
          wordWidths: wordRects.map((rect) => rect.width),
        };
      });

    expect(metrics.backgroundImage).toContain('header-201906.jpg');
    expect(metrics.lineCount).toBe(2);
    expect(metrics.documentWidth).toBeLessThanOrEqual(
      metrics.viewportWidth + 1,
    );
    expect(metrics.nameHeight).toBeLessThan(260);
    for (const wordWidth of metrics.wordWidths) {
      expect(wordWidth).toBeLessThanOrEqual(metrics.nameWidth + 1);
      expect(wordWidth).toBeGreaterThan(metrics.nameWidth * 0.72);
    }
  });
}

for (const width of singleLineWidths) {
  test(`masthead title stays on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ height: 420, width });
    await page.goto('/tests/masthead-frame');
    await page.evaluate(() => document.fonts.ready);

    const metrics: MastheadMetrics = await page
      .locator('.masthead__name')
      .evaluate((node) => {
        const element = node as HTMLElement;
        const wordRects = Array.from(
          element.querySelectorAll<HTMLElement>('.masthead__word'),
        ).map((word) => word.getBoundingClientRect());
        const uniqueLineTops = new Set(
          wordRects.map((rect) => Math.round(rect.top)),
        );

        return {
          backgroundImage: getComputedStyle(element).backgroundImage,
          documentWidth: document.documentElement.scrollWidth,
          lineCount: uniqueLineTops.size,
          nameHeight: element.getBoundingClientRect().height,
          nameWidth: element.getBoundingClientRect().width,
          viewportWidth: window.innerWidth,
          wordWidths: wordRects.map((rect) => rect.width),
        };
      });

    expect(metrics.backgroundImage).toContain('header-201906.jpg');
    expect(metrics.lineCount).toBe(1);
    expect(metrics.documentWidth).toBeLessThanOrEqual(
      metrics.viewportWidth + 1,
    );
    expect(metrics.nameHeight).toBeLessThan(160);
  });
}
