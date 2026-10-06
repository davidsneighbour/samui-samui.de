import { expect, test } from '@playwright/test';

const widths = [
  320, 375, 390, 430, 575, 576, 768, 992, 1024, 1200, 1400, 1920, 2560, 3840,
];

for (const width of widths) {
  test(`masthead clips one photo through the island and two words at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 500, width });
    await page.goto('/tests/masthead-frame');
    const artwork = page.locator('.masthead__artwork');
    await expect(artwork.locator('image')).toHaveCount(1);
    await expect(artwork.locator('image')).toHaveAttribute(
      'href',
      '/assets/header/header-201906.jpg',
    );
    await expect(artwork.locator('image')).toHaveAttribute(
      'clip-path',
      'url(#masthead-photo-cutout)',
    );
    await expect(
      artwork.locator(
        width >= 768
          ? '.masthead__island--detail'
          : '.masthead__island--simple',
      ),
    ).toHaveAttribute('clip-rule', 'evenodd');
    await expect(page.locator('.masthead__link')).toHaveAccessibleName(
      'Samui? Samui!',
    );
    const metrics = await artwork.evaluate((node) => {
      const paths = [
        ...node.querySelectorAll<SVGPathElement>('clipPath path'),
      ].filter((path) => getComputedStyle(path).display !== 'none');
      const boxes = paths.map((path) => {
        const box = path.getBBox();
        const matrix = path.transform.baseVal.consolidate()?.matrix;
        if (!matrix) throw new Error('Expected a transformed artwork path.');
        const topLeft = new DOMPoint(box.x, box.y).matrixTransform(matrix);
        const bottomRight = new DOMPoint(
          box.x + box.width,
          box.y + box.height,
        ).matrixTransform(matrix);
        return {
          bottom: bottomRight.y,
          left: topLeft.x,
          right: bottomRight.x,
          top: topLeft.y,
        };
      });
      return {
        artworkWidth: node.getBoundingClientRect().width,
        boxes,
        documentWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
      };
    });
    const [island, question, answer] = metrics.boxes;
    if (!island || !question || !answer)
      throw new Error('Expected three clipping shapes.');
    expect(island.right).toBeLessThan(question.left);
    expect(question.left - island.right).toBeCloseTo(25.76, 2);
    expect(question.bottom).toBeLessThan(answer.top);
    expect(Math.abs(question.left - answer.left)).toBeLessThanOrEqual(1);
    for (const box of metrics.boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(900);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(300);
    }
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.artworkWidth).toBeCloseTo(Math.min(width - 32, 1600), 0);
  });
}
