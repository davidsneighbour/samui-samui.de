import { expect, test } from '@playwright/test';

const twoLineWidths = [320, 375, 390, 430, 575];
const singleLineWidths = [576, 768, 1024, 1200];

type MastheadMetrics = {
  answerFontSize: number;
  backgroundImage: string;
  documentWidth: number;
  lineCount: number;
  nameHeight: number;
  nameWidth: number;
  questionFontSize: number;
  viewportWidth: number;
  wordRects: Array<{
    left: number;
    right: number;
    width: number;
  }>;
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
        const words = Array.from(
          element.querySelectorAll<HTMLElement>('.masthead__word'),
        );
        const wordRects = words.map((word) => {
          const range = document.createRange();
          range.selectNodeContents(word);
          const rect = range.getBoundingClientRect();
          range.detach();
          return rect;
        });
        const uniqueLineTops = new Set(
          wordRects.map((rect) => Math.round(rect.top)),
        );

        return {
          answerFontSize: Number.parseFloat(
            getComputedStyle(words[1]).fontSize,
          ),
          backgroundImage: getComputedStyle(element).backgroundImage,
          documentWidth: document.documentElement.scrollWidth,
          lineCount: uniqueLineTops.size,
          nameHeight: element.getBoundingClientRect().height,
          nameWidth: element.getBoundingClientRect().width,
          questionFontSize: Number.parseFloat(
            getComputedStyle(words[0]).fontSize,
          ),
          viewportWidth: window.innerWidth,
          wordRects: wordRects.map((rect) => ({
            left: rect.left,
            right: rect.right,
            width: rect.width,
          })),
        };
      });

    expect(metrics.backgroundImage).toContain('header-201906.jpg');
    expect(metrics.lineCount).toBe(2);
    expect(metrics.documentWidth).toBeLessThanOrEqual(
      metrics.viewportWidth + 1,
    );
    expect(metrics.nameHeight).toBeLessThan(260);
    expect(metrics.questionFontSize).toBeLessThan(metrics.answerFontSize);
    for (const wordRect of metrics.wordRects) {
      expect(wordRect.left).toBeGreaterThanOrEqual(0);
      expect(wordRect.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
      expect(wordRect.width).toBeLessThanOrEqual(metrics.nameWidth + 1);
      expect(wordRect.width).toBeGreaterThan(metrics.nameWidth * 0.72);
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
        const words = Array.from(
          element.querySelectorAll<HTMLElement>('.masthead__word'),
        );
        const wordRects = words.map((word) => {
          const range = document.createRange();
          range.selectNodeContents(word);
          const rect = range.getBoundingClientRect();
          range.detach();
          return rect;
        });
        const uniqueLineTops = new Set(
          wordRects.map((rect) => Math.round(rect.top)),
        );

        return {
          answerFontSize: Number.parseFloat(
            getComputedStyle(words[1]).fontSize,
          ),
          backgroundImage: getComputedStyle(element).backgroundImage,
          documentWidth: document.documentElement.scrollWidth,
          lineCount: uniqueLineTops.size,
          nameHeight: element.getBoundingClientRect().height,
          nameWidth: element.getBoundingClientRect().width,
          questionFontSize: Number.parseFloat(
            getComputedStyle(words[0]).fontSize,
          ),
          viewportWidth: window.innerWidth,
          wordRects: wordRects.map((rect) => ({
            left: rect.left,
            right: rect.right,
            width: rect.width,
          })),
        };
      });

    expect(metrics.backgroundImage).toContain('header-201906.jpg');
    expect(metrics.lineCount).toBe(1);
    expect(metrics.documentWidth).toBeLessThanOrEqual(
      metrics.viewportWidth + 1,
    );
    expect(metrics.nameHeight).toBeLessThan(160);
    expect(metrics.questionFontSize).toBe(metrics.answerFontSize);
  });
}
