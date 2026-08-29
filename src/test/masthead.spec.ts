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

function readMastheadMetrics(node: SVGElement | HTMLElement): MastheadMetrics {
  const element = node as HTMLElement;
  const words = Array.from(
    element.querySelectorAll<HTMLElement>('.masthead__word'),
  );
  const questionWord = words[0];
  const answerWord = words[1];

  if (questionWord === undefined || answerWord === undefined) {
    throw new Error('Expected the masthead title to contain two word spans.');
  }

  const wordRects = words.map((word) => {
    const range = document.createRange();
    range.selectNodeContents(word);
    return range.getBoundingClientRect();
  });
  const uniqueLineTops = new Set(wordRects.map((rect) => Math.round(rect.top)));

  return {
    answerFontSize: Number.parseFloat(getComputedStyle(answerWord).fontSize),
    backgroundImage: getComputedStyle(element).backgroundImage,
    documentWidth: document.documentElement.scrollWidth,
    lineCount: uniqueLineTops.size,
    nameHeight: element.getBoundingClientRect().height,
    nameWidth: element.getBoundingClientRect().width,
    questionFontSize: Number.parseFloat(
      getComputedStyle(questionWord).fontSize,
    ),
    viewportWidth: window.innerWidth,
    wordRects: wordRects.map((rect) => ({
      left: rect.left,
      right: rect.right,
      width: rect.width,
    })),
  };
}

for (const width of twoLineWidths) {
  test(`masthead title uses two clean lines at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 420, width });
    await page.goto('/tests/masthead-frame');
    await page.evaluate(() => document.fonts.ready);

    const metrics: MastheadMetrics = await page
      .locator('.masthead__name')
      .evaluate(readMastheadMetrics);

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
      .evaluate(readMastheadMetrics);

    expect(metrics.backgroundImage).toContain('header-201906.jpg');
    expect(metrics.lineCount).toBe(1);
    expect(metrics.documentWidth).toBeLessThanOrEqual(
      metrics.viewportWidth + 1,
    );
    expect(metrics.nameHeight).toBeLessThan(160);
    expect(metrics.questionFontSize).toBe(metrics.answerFontSize);
  });
}
