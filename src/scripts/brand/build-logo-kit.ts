/** Build the selected Panton identity kit. Run from the repository root with Node 26. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const destination = 'src/assets/brand/samui';
const colour = {
  coral: '#ec7263',
  cream: '#f5f1e6',
  ink: '#2b2929',
  lightCoral: '#b8402f',
  plum: '#290e1c',
};
type Point = readonly [number, number];
const source = readFileSync('src/assets/koh-samui-outline-main.svg', 'utf8');
const sourcePath = /<path\s+d="([^"]+)"/.exec(source)?.[1];
if (!sourcePath)
  throw new Error('The supplied island SVG must contain a path.');
const pairs = [...sourcePath.matchAll(/(?:M|L)\s*([\d.]+)\s+([\d.]+)/g)];
const points: Point[] = pairs.map((pair) => [Number(pair[1]), Number(pair[2])]);
if (points.length < 3)
  throw new Error('The island requires at least three points.');

function distance(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const factor = Math.max(
    0,
    Math.min(
      1,
      ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
        (dx * dx + dy * dy || 1),
    ),
  );
  return Math.hypot(
    point[0] - start[0] - factor * dx,
    point[1] - start[1] - factor * dy,
  );
}
function simplify(input: readonly Point[], tolerance: number): Point[] {
  const start = input[0];
  const end = input.at(-1);
  if (!start || !end) throw new Error('Empty coastline.');
  let furthest = 0;
  let index = 0;
  for (let i = 1; i < input.length - 1; i++) {
    const point = input[i];
    if (!point) continue;
    const current = distance(point, start, end);
    if (current > furthest) {
      furthest = current;
      index = i;
    }
  }
  if (furthest <= tolerance) return [start, end];
  return [
    ...simplify(input.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(input.slice(index), tolerance),
  ];
}
function island(tolerance: number): string {
  const first = points[0];
  if (!first) throw new Error('Empty coastline.');
  const contour = simplify([...points, first], tolerance).slice(0, -1);
  return (
    contour
      .map(
        ([x, y], index) =>
          `${index ? 'L' : 'M'}${(x * 0.52 + 20.88).toFixed(2)} ${(y * 0.52 + 16.2).toFixed(2)}`,
      )
      .join(' ') + 'Z'
  );
}
const fontPaths: Record<string, string> = JSON.parse(
  readFileSync(join(destination, 'panton-wordmark.json'), 'utf8'),
);
function word(text: string): string {
  const path = fontPaths[text];
  if (!path) throw new Error(`Missing Panton outline: ${text}`);
  return `<path d="${path}"/>`;
}
function punctuation(): string {
  const source = readFileSync(
    join(destination, 'selected/symbol-reversed.svg'),
    'utf8',
  );
  const path = / d="([^"]+)"/.exec(source)?.[1];
  const holes = path?.split('Z ').slice(1).join('Z ');
  if (!holes) throw new Error('Missing selected Panton punctuation.');
  return holes;
}
const words = word('samui? samui!');
const shape = island(7);
const faviconShape = island(16);
function symbol(fill: string, reversed = false): string {
  const file = reversed ? 'symbol-reversed.svg' : 'symbol-normal.svg';
  const source = readFileSync(join(destination, 'selected', file), 'utf8');
  const path = / d="([^"]+)"/.exec(source)?.[1];
  if (!path) throw new Error(`Missing selected symbol path: ${file}`);
  return `<path fill="${fill}" fill-rule="evenodd" d="${path}"/>`;
}
function svg(body: string, width = 256, height = 256): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img"><title>Samui? Samui! — island voice</title>${body}</svg>\n`;
}
function save(file: string, content: string): void {
  const path = join(destination, file);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}
const variants: Record<string, string> = {
  black: '#000000',
  coral: colour.coral,
  'light-coral': colour.lightCoral,
  plum: colour.plum,
  white: '#ffffff',
};
for (const [name, fill] of Object.entries(variants)) {
  const reversed = name === 'white' || name === 'coral';
  const art = symbol(fill, reversed);
  save(`svg/symbol-${name}.svg`, svg(art));
  save(
    `svg/horizontal-${name}.svg`,
    svg(
      `${art}<g transform="translate(272 100) scale(1.1)" fill="${fill}">${words}</g>`,
      940,
    ),
  );
  save(
    `svg/stacked-${name}.svg`,
    svg(
      `<g transform="translate(0 -6)">${art}</g><g transform="translate(43 252) scale(.64)" fill="${fill}">${word('samui?')}</g><g transform="translate(43 300) scale(.64)" fill="${fill}">${word('samui!')}</g>`,
      256,
      352,
    ),
  );
  save(
    `svg/wordmark-${name}.svg`,
    svg(`<g transform="translate(12 18)" fill="${fill}">${words}</g>`, 592, 88),
  );
}
// The large masthead retains the supplied coastline detail and selected holes.
const selectedReversed = readFileSync(
  join(destination, 'selected/symbol-reversed.svg'),
  'utf8',
);
const selectedPath = / d="([^"]+)"/.exec(selectedReversed)?.[1];
const selectedHoles = selectedPath?.split('Z ').slice(1).join('Z ');
if (!selectedHoles) throw new Error('Missing selected punctuation holes.');
save(
  'svg/symbol-detail-white.svg',
  svg(
    `<path fill="#ffffff" fill-rule="evenodd" d="${island(0)} ${selectedHoles}"/>`,
  ),
);
save('svg/symbol-colour.svg', svg(symbol(colour.coral, true)));
save(
  'svg/horizontal-colour.svg',
  svg(
    `${symbol(colour.coral, true)}<g transform="translate(272 100) scale(1.1)" fill="${colour.cream}">${words}</g>`,
    940,
  ),
);
save(
  'svg/stacked-colour.svg',
  svg(
    `<g transform="translate(0 -6)">${symbol(colour.coral, true)}</g><g transform="translate(43 252) scale(.64)" fill="${colour.cream}">${word('samui?')}</g><g transform="translate(43 300) scale(.64)" fill="${colour.cream}">${word('samui!')}</g>`,
    256,
    352,
  ),
);
const iconArtwork = (fill: string): string =>
  `<path fill="${fill}" d="${faviconShape}"/>`;
const punctuationIcon = (fill: string): string =>
  `<g transform="translate(-152 -161) scale(2.25)" fill="${fill}"><path d="${punctuation()}"/></g>`;
// Light coral contrasts with pale backgrounds; dark coral contrasts with plum.
const adaptive = (art: (fill: string) => string): string =>
  svg(
    `<style>.mark{fill:${colour.lightCoral}}@media(prefers-color-scheme:dark){.mark{fill:${colour.coral}}}</style>${art(colour.lightCoral).replace(/fill="[^"]+"/g, 'class="mark"')}`,
  );
save('svg/island-small.svg', svg(iconArtwork(colour.lightCoral)));
save('svg/punctuation-small.svg', svg(punctuationIcon(colour.lightCoral)));
save('web/favicon.svg', adaptive(iconArtwork));
save('web/punctuation/favicon.svg', adaptive(punctuationIcon));
const tile = (art: (fill: string) => string, maskable = false): string =>
  svg(
    `<rect width="256" height="256" rx="${maskable ? 0 : 12}" fill="${colour.plum}"/><g transform="translate(${maskable ? 64 : 32} ${maskable ? 64 : 32}) scale(${maskable ? 0.5 : 0.75})">${art(colour.coral)}</g>`,
  );
save(
  'svg/app-icon.svg',
  tile((fill) => symbol(fill, true)),
);
save('svg/app-icon-punctuation.svg', tile(punctuationIcon));
save(
  'svg/maskable.svg',
  tile((fill) => symbol(fill, true), true),
);

function render(
  input: string,
  output: string,
  width: number,
  height = width,
): void {
  mkdirSync(join(destination, output, '..'), { recursive: true });
  execFileSync('rsvg-convert', [
    '-w',
    String(width),
    '-h',
    String(height),
    '-o',
    join(destination, output),
    join(destination, input),
  ]);
}
for (const name of [...Object.keys(variants), 'colour']) {
  render(`svg/symbol-${name}.svg`, `png/symbol-${name}-512.png`, 512);
  render(
    `svg/horizontal-${name}.svg`,
    `png/horizontal-${name}-1880.png`,
    1880,
    512,
  );
  render(`svg/stacked-${name}.svg`, `png/stacked-${name}-768.png`, 768, 1056);
  if (name !== 'colour')
    render(
      `svg/wordmark-${name}.svg`,
      `png/wordmark-${name}-1184.png`,
      1184,
      176,
    );
}
function ico(prefix: string): void {
  const sizes = [16, 32, 48];
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  const images = sizes.map((size, index) => {
    const png = readFileSync(join(destination, prefix, `favicon-${size}.png`));
    const row = 6 + index * 16;
    header[row] = size;
    header[row + 1] = size;
    header.writeUInt16LE(1, row + 4);
    header.writeUInt16LE(32, row + 6);
    header.writeUInt32LE(png.length, row + 8);
    header.writeUInt32LE(offset, row + 12);
    offset += png.length;
    return png;
  });
  writeFileSync(
    join(destination, prefix, 'favicon.ico'),
    Buffer.concat([header, ...images]),
  );
}
for (const alternative of [false, true]) {
  const prefix = alternative ? 'web/punctuation' : 'web';
  const sourceFile = alternative
    ? 'svg/punctuation-small.svg'
    : 'svg/island-small.svg';
  const tileFile = alternative
    ? 'svg/app-icon-punctuation.svg'
    : 'svg/app-icon.svg';
  for (const size of [16, 32, 48])
    render(sourceFile, `${prefix}/favicon-${size}.png`, size);
  ico(prefix);
  render(tileFile, `${prefix}/apple-touch-icon.png`, 180);
  render(tileFile, `${prefix}/icon-192.png`, 192);
  render(tileFile, `${prefix}/icon-512.png`, 512);
}
render('svg/maskable.svg', 'web/maskable-512.png', 512);
save(
  'web/site.webmanifest',
  `${JSON.stringify(
    {
      icons: [
        { sizes: '192x192', src: 'icon-192.png', type: 'image/png' },
        { sizes: '512x512', src: 'icon-512.png', type: 'image/png' },
        {
          purpose: 'maskable',
          sizes: '512x512',
          src: 'maskable-512.png',
          type: 'image/png',
        },
      ],
      name: 'Samui? Samui!',
      short_name: 'Samui',
    },
    null,
    2,
  )}\n`,
);
save(
  'web/head-snippet.html',
  '<!-- Copy web files into public/assets/brand/samui/ before using this snippet. -->\n<link rel="icon" type="image/svg+xml" href="/assets/brand/samui/favicon.svg">\n<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/samui/favicon-32.png">\n<link rel="icon" type="image/x-icon" href="/assets/brand/samui/favicon.ico">\n<link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/samui/apple-touch-icon.png">\n<link rel="manifest" href="/assets/brand/samui/site.webmanifest">\n',
);
// Portable SVG presentation: real artwork in relevant editorial contexts.
function label(
  x: number,
  y: number,
  text: string,
  size = 20,
  fill = colour.plum,
): string {
  return `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" fill="${fill}">${text}</text>`;
}
function placed(
  x: number,
  y: number,
  size: number,
  fill: string,
  simple = false,
): string {
  return `<g transform="translate(${x} ${y}) scale(${size / 256})">${simple ? iconArtwork(fill) : symbol(fill, fill === colour.coral || fill === '#ffffff')}</g>`;
}
let board = `<rect width="1600" height="1450" fill="${colour.cream}"/>${label(64, 70, 'Samui? Samui! — island voice', 38)}${label(64, 108, 'Selected direction A · Panton 900 · 6 October 2026', 18)}`;
board += `<rect x="64" y="145" width="1472" height="360" fill="${colour.plum}"/>${placed(108, 178, 290, colour.coral)}<g transform="translate(460 288) scale(1.75)" fill="${colour.cream}">${words}</g>`;
board +=
  label(64, 550, 'Light background', 20) + placed(64, 573, 160, colour.plum);
board +=
  `<rect x="280" y="572" width="190" height="190" fill="${colour.plum}"/>${placed(296, 588, 160, '#ffffff')}` +
  label(280, 550, 'Reversed', 20);
board +=
  label(524, 550, 'Island favicon', 20) +
  placed(524, 584, 64, colour.lightCoral, true) +
  placed(610, 608, 32, colour.lightCoral, true) +
  placed(672, 624, 16, colour.lightCoral, true);
board += label(524, 720, '32 px and below: island only', 18);
board += label(840, 550, 'Established palette', 20);
for (const [index, [name, fill]] of Object.entries(colour).entries()) {
  const x = 840 + index * 140;
  board += `<rect x="${x}" y="575" width="116" height="80" fill="${fill}"/>${label(x, 685, name, 16)}${label(x, 711, fill, 16)}`;
}
const contexts = [
  'Website masthead',
  'Article signature',
  'Social avatar',
  'Newsletter',
  'Browser tab',
  'Sticker',
];
for (const [index, name] of contexts.entries()) {
  const x = 64 + (index % 3) * 500;
  const y = 875 + Math.floor(index / 3) * 265;
  board += label(x, y - 20, name, 20);
  board += `<rect x="${x}" y="${y}" width="472" height="210" fill="${index === 2 || index === 5 ? colour.plum : colour.cream}"/>`;
  if (index === 0 || index === 3) {
    board += `<rect x="${x}" y="${y}" width="472" height="86" fill="${colour.plum}"/>${placed(x + 16, y + 8, 68, colour.coral)}<g transform="translate(${x + 100} ${y + 30}) scale(.55)" fill="${colour.cream}">${words}</g>`;
    board +=
      label(
        x + 20,
        y + 121,
        index === 0 ? 'Geschichten von Koh Samui' : 'Neues aus Samui',
        22,
      ) + label(x + 20, y + 155, 'Alltag und Inselgeschichten.', 15);
  } else if (index === 1) {
    board +=
      label(x + 20, y + 45, 'Ein neuer Tag auf der Insel', 24) +
      label(x + 20, y + 80, 'Ein Beitrag auf Samui? Samui!', 16) +
      placed(x + 22, y + 105, 80, colour.plum);
  } else if (index === 4) {
    board += `<rect x="${x}" y="${y}" width="472" height="48" fill="${colour.cream}"/>${placed(x + 16, y + 14, 20, colour.lightCoral, true)}${label(x + 48, y + 30, 'Samui? Samui!', 16)}${label(x + 20, y + 96, 'samui-samui.de', 23)}`;
  } else board += placed(x + 148, y + 12, 180, colour.coral);
}
save('presentation/overview.svg', svg(board, 1600, 1450));
render('presentation/overview.svg', 'presentation/overview.png', 1600, 1450);
save(
  'presentation/index.html',
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Samui? Samui! logo kit</title><style>body{margin:0;background:#290e1c}img{display:block;width:100%;max-width:1600px;margin:auto}</style><img src="overview.svg" alt="Samui island logo kit: colour, reversed, favicon comparisons, and six editorial mockups."></html>\n',
);
// Vector PDF masters for print workflows; colours remain RGB pending a print proof.
for (const name of ['symbol-plum', 'horizontal-plum', 'stacked-plum']) {
  mkdirSync(join(destination, 'pdf'), { recursive: true });
  execFileSync('rsvg-convert', [
    '-f',
    'pdf',
    '-o',
    join(destination, `pdf/${name}.pdf`),
    join(destination, `svg/${name}.svg`),
  ]);
}
console.log(
  `Built logo kit in ${destination}; main coastline: ${shape.split('L').length} vertices; favicon: ${faviconShape.split('L').length} vertices.`,
);
