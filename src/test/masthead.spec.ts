import { expect, test } from '@playwright/test';

const widths = [320, 375, 390, 430, 575, 576, 768, 992, 1024, 1200, 1400, 1920];

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

for (const width of widths) {
  test(`masthead title always uses two clean lines at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 500, width });
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
    expect(metrics.questionFontSize).toBeLessThan(metrics.answerFontSize);
    expect(metrics.answerFontSize).toBeLessThanOrEqual(200);
    expect(
      Math.abs(metrics.wordRects[0].left - metrics.wordRects[1].left),
    ).toBeLessThanOrEqual(1);
    for (const wordRect of metrics.wordRects) {
      expect(wordRect.left).toBeGreaterThanOrEqual(0);
      expect(wordRect.right).toBeLessThanOrEqual(metrics.viewportWidth + 1);
      expect(wordRect.width).toBeLessThanOrEqual(metrics.nameWidth + 1);
      expect(wordRect.width).toBeGreaterThan(metrics.nameWidth * 0.72);
    }
  });
}
