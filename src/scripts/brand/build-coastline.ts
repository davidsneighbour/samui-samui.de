/** Rebuild the Koh Samui geographic master from the committed OSM API snapshot. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Coordinate = readonly [number, number];
interface Way {
  id: string;
  version: string;
  timestamp: string;
  nodes: string[];
}
const directory = 'src/assets/geography/koh-samui';
const sourceDirectory = join(directory, 'source');
const nodes = new Map<string, Coordinate>();
const ways: Way[] = [];
const sources: { file: string; url: string; sha256: string }[] = [];
function attribute(text: string, name: string): string {
  const value = new RegExp(`\\b${name}="([^"]+)"`).exec(text)?.[1];
  if (!value) throw new Error(`Missing OSM attribute: ${name}`);
  return value;
}
for (const file of readdirSync(sourceDirectory)
  .filter((file) => /^way-\d+\.osm$/.test(file))
  .sort()) {
  const bytes = readFileSync(join(sourceDirectory, file));
  const xml = bytes.toString('utf8');
  // Only the numeric geometry and metadata of the documented OSM XML format are read.
  for (const match of xml.matchAll(/<node\b([^>]+)>/g)) {
    const attributes = match[1];
    if (!attributes) throw new Error('Missing node attributes.');
    const id = attribute(attributes, 'id');
    const coordinate: Coordinate = [
      Number(attribute(attributes, 'lon')),
      Number(attribute(attributes, 'lat')),
    ];
    if (
      !coordinate.every(Number.isFinite) ||
      coordinate[0] < 99.88 ||
      coordinate[0] > 100.12 ||
      coordinate[1] < 9.35 ||
      coordinate[1] > 9.65
    )
      throw new Error(`Invalid or unexpected coordinate: ${id}`);
    const previous = nodes.get(id);
    if (
      previous &&
      previous.some((value, index) => value !== coordinate[index])
    )
      throw new Error(`Snapshot coordinate conflict: ${id}`);
    nodes.set(id, coordinate);
  }
  const match = /<way\b([^>]+)>([\s\S]*?)<\/way>/.exec(xml);
  if (
    !match?.[1] ||
    !match[2] ||
    !/<tag k="natural" v="coastline"\s*\/>/.test(match[2])
  )
    throw new Error(`Not a coastline way: ${file}`);
  const id = attribute(match[1], 'id');
  if (file !== `way-${id}.osm`) throw new Error(`Mismatched way: ${file}`);
  ways.push({
    id,
    nodes: [...match[2].matchAll(/<nd ref="(\d+)"\s*\/>/g)].map((node) =>
      attribute(node[0], 'ref'),
    ),
    timestamp: attribute(match[1], 'timestamp'),
    version: attribute(match[1], 'version'),
  });
  sources.push({
    file: `source/${file}`,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    url: `https://api.openstreetmap.org/api/0.6/way/${id}/full`,
  });
}
const firstWay = ways.find((way) => way.id === '476906866');
if (!firstWay) throw new Error('Missing seed coastline way.');
const ringIds = [...firstWay.nodes];
const remaining = ways.filter((way) => way !== firstWay);
while (ringIds.at(-1) !== ringIds[0]) {
  const candidates = remaining.filter((way) => way.nodes[0] === ringIds.at(-1));
  const next = candidates[0];
  if (candidates.length !== 1 || !next)
    throw new Error('Coastline must have one connected continuation.');
  ringIds.push(...next.nodes.slice(1));
  remaining.splice(remaining.indexOf(next), 1);
}
if (remaining.length || ringIds.length < 4)
  throw new Error('Snapshot must contain exactly one closed coastline ring.');
const coordinates = ringIds.map((id) => {
  const coordinate = nodes.get(id);
  if (!coordinate) throw new Error(`Missing coastline node: ${id}`);
  return coordinate;
});
const attribution = '© OpenStreetMap contributors';
const licence = 'https://opendatacommons.org/licenses/odbl/1-0/';
const copyright = 'https://www.openstreetmap.org/copyright';
writeFileSync(
  join(directory, 'coastline.geojson'),
  `${JSON.stringify({ geometry: { coordinates: [coordinates], type: 'Polygon' }, properties: { attribution, licence, name: 'Koh Samui coastline', source: copyright }, type: 'Feature' }, null, 2)}\n`,
);
// Local equirectangular projection, standard parallel 9.5°N; north is up.
const cosine = Math.cos((9.5 * Math.PI) / 180);
const projected = coordinates
  .slice(0, -1)
  .map(
    ([longitude, latitude]): Coordinate => [
      (longitude - 100) * cosine,
      9.5 - latitude,
    ],
  );
const xs = projected.map(([x]) => x);
const ys = projected.map(([, y]) => y);
const minimumX = Math.min(...xs);
const maximumX = Math.max(...xs);
const minimumY = Math.min(...ys);
const maximumY = Math.max(...ys);
const scale = Math.min(
  374 / (maximumX - minimumX),
  392 / (maximumY - minimumY),
);
const path =
  projected
    .map(
      ([x, y], index) =>
        `${index ? 'L' : 'M'} ${((x - (minimumX + maximumX) / 2) * scale + 206).toFixed(4)} ${((y - (minimumY + maximumY) / 2) * scale + 215).toFixed(4)}`,
    )
    .join(' ') + ' Z';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 413 431"><title>Koh Samui coastline</title><metadata>${attribution}; ${copyright}; ODbL 1.0; source snapshot retrieved 2026-10-08; local equirectangular projection, standard parallel 9.5 degrees north.</metadata><path d="${path}" fill="#000000"/></svg>\n`;
writeFileSync(join(directory, 'coastline.svg'), svg);
writeFileSync('src/assets/koh-samui-outline-main.svg', svg);
writeFileSync(
  join(directory, 'provenance.json'),
  `${JSON.stringify({ attribution, coordinateOrder: 'longitude, latitude', copyright, licence, projection: { canvas: [413, 431], centralMeridian: 100, centre: [206, 215], maximumBounds: [19, 19, 393, 411], name: 'local equirectangular', northUp: true, rounding: '4 decimal SVG units; GeoJSON retains source coordinates', standardParallel: 9.5, uniformScale: scale }, retrieved: '2026-10-08', seedWay: firstWay.id, sources, vertices: coordinates.length - 1, ways: ways.map(({ id, version, timestamp }) => ({ id, timestamp, version })) }, null, 2)}\n`,
);
console.log(
  `Rebuilt Koh Samui coastline: ${ways.length} ways, ${coordinates.length - 1} vertices.`,
);

// Keep generated SVG and JSON canonical under the repository's formatter.
execFileSync(
  process.execPath,
  [
    'node_modules/@biomejs/biome/bin/biome',
    'check',
    '--write',
    join(directory, 'coastline.svg'),
    join(directory, 'provenance.json'),
    'src/assets/koh-samui-outline-main.svg',
  ],
  { stdio: 'inherit' },
);
