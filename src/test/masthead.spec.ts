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
    const homeLink = page.locator('.masthead__link');
    await expect(homeLink).toHaveText('Samui? Samui!');
    await expect(homeLink.locator('span.sr-only')).toHaveText('Samui? Samui!');
    expect(await homeLink.getAttribute('aria-label')).toBeNull();
    const artwork = page.locator('.masthead__artwork');
    await expect(artwork).toHaveAttribute('aria-hidden', 'true');
    await expect(artwork.locator('image')).toHaveCount(1);
    await expect(artwork.locator('clipPath > .masthead__word')).toHaveCount(2);
    await expect(artwork.locator('image')).toHaveAttribute(
      'href',
      '/assets/header/header-201906.jpg',
    );
    await expect(artwork.locator('g:has(> image)')).toHaveAttribute(
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
      ].filter(
        (path) =>
          getComputedStyle(path).display !== 'none' &&
          !path.classList.contains('masthead__exclamation'),
      );
      const boxes = paths.map((path) => {
        const box = path.getBBox();
        if (path.classList.contains('masthead__word--answer')) {
          const punctuation = node
            .querySelector<SVGPathElement>('.masthead__exclamation')!
            .getBBox();
          box.width =
            Math.max(box.x + box.width, punctuation.x + punctuation.width) -
            box.x;
          box.height =
            Math.max(box.y + box.height, punctuation.y + punctuation.height) -
            box.y;
        }
        const screenMatrix = path.getScreenCTM();
        const rootMatrix = (node as SVGSVGElement).getScreenCTM();
        const matrix =
          screenMatrix && rootMatrix
            ? rootMatrix.inverse().multiply(screenMatrix)
            : null;
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
      const dots = paths.slice(1).map((path) => {
        const contours = (
          path.classList.contains('masthead__word--answer')
            ? (node
                .querySelector('.masthead__exclamation')!
                .getAttribute('d') ?? '')
            : (path.getAttribute('d') ?? '')
        )
          .split(/(?=M)/)
          .slice(-2);
        const probe = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        );
        probe.style.visibility = 'hidden';
        node.append(probe);
        const candidates = contours.map((d) => {
          probe.setAttribute('d', d);
          return probe.getBBox();
        });
        probe.remove();
        const dot = candidates.sort((a, b) => a.height - b.height)[0];
        const screenMatrix = path.getScreenCTM();
        const rootMatrix = (node as SVGSVGElement).getScreenCTM();
        if (!dot || !screenMatrix || !rootMatrix)
          throw new Error('Expected punctuation dot bounds.');
        return new DOMPoint(
          dot.x + dot.width / 2,
          dot.y + dot.height / 2,
        ).matrixTransform(rootMatrix.inverse().multiply(screenMatrix)).x;
      });
      const canvas = (node as SVGSVGElement).viewBox.baseVal;
      const divider = document
        .querySelector('.masthead__divider')
        ?.getBoundingClientRect();
      const rootMatrix = (node as SVGSVGElement).getScreenCTM();
      if (!divider || !rootMatrix)
        throw new Error('Expected divider and artwork.');
      const blockCentre =
        (Math.min(...boxes.map((box) => box.left)) +
          Math.max(...boxes.map((box) => box.right))) /
        2;
      return {
        artworkWidth: node.getBoundingClientRect().width,
        boxes,
        canvasCentre: canvas.x + canvas.width / 2,
        dividerCentre: divider.left + divider.width / 2,
        documentWidth: document.documentElement.scrollWidth,
        dots,
        viewport: innerWidth,
        visibleCentre: new DOMPoint(blockCentre, 0).matrixTransform(rootMatrix)
          .x,
      };
    });
    const [island, question, answer] = metrics.boxes;
    if (!island || !question || !answer)
      throw new Error('Expected three clipping shapes.');
    expect(island.right).toBeLessThan(question.left);
    expect(question.left - island.right).toBeCloseTo(25.98, 2);
    expect(question.bottom).toBeLessThan(answer.top);
    expect(metrics.dots[0]).toBeCloseTo(metrics.dots[1] ?? 0, 2);
    expect((question.top + answer.bottom) / 2).toBeCloseTo(
      (island.top + island.bottom) / 2,
      2,
    );
    expect(Math.abs(question.left - answer.left)).toBeLessThanOrEqual(1);
    for (const box of metrics.boxes) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(900);
      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(300);
    }
    expect(
      (Math.min(...metrics.boxes.map((box) => box.left)) +
        Math.max(...metrics.boxes.map((box) => box.right))) /
        2,
    ).toBeCloseTo(metrics.canvasCentre, 2);
    expect(metrics.visibleCentre).toBeCloseTo(metrics.dividerCentre, 2);
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewport + 1);
    expect(metrics.artworkWidth).toBeCloseTo(Math.min(width - 32, 1200), 0);
  });
}

test('the site name exists as link text in the initial HTML without JavaScript', async ({
  browser,
  baseURL,
}) => {
  if (!baseURL) throw new Error('Expected a configured test server URL.');
  const context = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: true,
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    const response = await page.goto('/tests/masthead-frame');
    expect(await response?.text()).toMatch(
      /<span\b[^>]*class="sr-only"[^>]*>Samui\? Samui!<\/span>/,
    );
    await expect(page.locator('.masthead__link')).toHaveText('Samui? Samui!');
    await expect(page.locator('.masthead__link')).toHaveAccessibleName(
      'Samui? Samui!',
    );
  } finally {
    await context.close();
  }
});

test('the prototype exclamation spans both lines on hover and keyboard focus', async ({
  page,
}) => {
  await page.goto('/tests/masthead-frame');
  const punctuation = page.locator('.masthead__exclamation');
  const dimensions = () =>
    punctuation.evaluate((element) => {
      const path = element as SVGPathElement;
      const box = path.getBBox();
      const matrix = path.getScreenCTM()!;
      const centre = new DOMPoint(
        box.x + box.width / 2,
        box.y + box.height / 2,
      ).matrixTransform(matrix);
      return {
        height: box.height * matrix.d,
        width: box.width * matrix.a,
        x: centre.x,
        y: centre.y,
      };
    });
  const before = await dimensions();
  const wordBounds = await page
    .locator('.masthead__word')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const path = element as SVGPathElement;
        const box = path.getBBox();
        const matrix = path.getScreenCTM()!;
        return {
          bottom: (box.y + box.height) * matrix.d + matrix.f,
          right: (box.x + box.width) * matrix.a + matrix.e,
          top: box.y * matrix.d + matrix.f,
        };
      }),
    );
  const top = Math.min(...wordBounds.map((bounds) => bounds.top));
  const bottom = Math.max(...wordBounds.map((bounds) => bounds.bottom));
  const letters = await page
    .locator('.masthead__word--answer')
    .getAttribute('transform');
  await page.locator('.masthead__link').hover();
  await expect
    .poll(async () => (await dimensions()).height / before.height)
    .toBeCloseTo(4.56773 / 2, 2);
  const after = await dimensions();
  expect(after.y - after.height / 2).toBeCloseTo(top, 1);
  expect(after.y + after.height / 2).toBeCloseTo(bottom, 1);
  expect(after.x - after.width / 2).toBeGreaterThan(
    Math.max(...wordBounds.map((bounds) => bounds.right)),
  );
  expect(after.width / before.width).toBeCloseTo(
    after.height / before.height,
    2,
  );
  await expect(page.locator('.masthead__word--answer')).toHaveAttribute(
    'transform',
    letters!,
  );
  await page.mouse.move(0, 0);
  await page.locator('.masthead__link').focus();
  await expect
    .poll(async () => (await dimensions()).height / before.height)
    .toBeCloseTo(4.56773 / 2, 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(async () => (await dimensions()).height / before.height)
    .toBeCloseTo(1, 2);
});
