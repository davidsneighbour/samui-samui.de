/** Assemble the nine original brandkit panels without resizing the source files. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const destination = 'src/assets/brand/samui/presentation';
const names = [
  '01-logo',
  '02-logo-system',
  '03-website',
  '04-tagline',
  '05-palette',
  '06-typography',
  '07-postcard',
  '08-image-direction',
  '09-icons-and-navigation',
];
const panels = names.map((name) => {
  const bytes = readFileSync(join(destination, 'panels', `${name}.png`));
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`Expected a PNG panel: ${name}`);
  }
  return {
    bytes,
    height: bytes.readUInt32BE(20),
    name,
    width: bytes.readUInt32BE(16),
  };
});
// Use the smallest native panel dimensions so the board never enlarges artwork.
const panelWidth = Math.min(...panels.map((panel) => panel.width));
const panelHeight = Math.min(...panels.map((panel) => panel.height));
const design = readFileSync('DESIGN.md', 'utf8');
const background = /^ {2}background: "(#[\da-f]{6})"$/m.exec(design)?.[1];
const gutter = Number(
  /^spacing:\n[\s\S]*?^ {2}lg: (\d+)px$/m.exec(design)?.[1],
);
if (!background || !gutter) throw new Error('Missing DESIGN.md board tokens.');
const width = panelWidth * 3 + gutter * 4;
const height = panelHeight * 3 + gutter * 4;
const images = panels.map((panel, index) => {
  const x = gutter + (index % 3) * (panelWidth + gutter);
  const y = gutter + Math.floor(index / 3) * (panelHeight + gutter);
  return `<image id="${panel.name}" x="${x}" y="${y}" width="${panelWidth}" height="${panelHeight}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${panel.bytes.toString('base64')}"/>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>Samui? Samui! — brandkit</title><desc>Nine independently generated full-size presentation panels. Embedded raster artwork; panel layout is editable. Production logo masters remain in the svg folder.</desc><rect width="${width}" height="${height}" fill="${background}"/>${images.join('')}</svg>\n`;
const svgPath = join(destination, 'brandkit-overview.svg');
writeFileSync(svgPath, svg);
execFileSync('rsvg-convert', [
  svgPath,
  '-o',
  join(destination, 'brandkit-overview.png'),
]);
console.log(`Saved self-contained SVG and ${width} × ${height} PNG board.`);
for (const panel of panels) {
  console.log(`${panel.name}: ${panel.width} × ${panel.height}`);
}
