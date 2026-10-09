/** Explicit data import. Never called by build or map generation. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { datasetSchema } from '../../utils/static-maps/data.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const archiveArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith('--archive='));
if (
  !archiveArg ||
  process.argv.slice(2).some((arg) => !arg.startsWith('--archive='))
) {
  throw new Error(
    'Usage: npm run maps:data:update -- --archive=/path/to/simplified-land-polygons-complete-3857.zip',
  );
}
const archive = path.resolve(archiveArg.slice('--archive='.length));
const member =
  'simplified-land-polygons-complete-3857/simplified_land_polygons.shp';
const bytes = execFileSync('unzip', ['-p', archive, member], {
  maxBuffer: 128 * 1024 * 1024,
});
if (
  bytes.readInt32BE(0) !== 9994 ||
  bytes.readInt32LE(28) !== 1000 ||
  bytes.readInt32LE(32) !== 5 ||
  bytes.readInt32BE(24) * 2 !== bytes.length
)
  throw new Error('Expected a complete Polygon shapefile.');
// A regional footprint, not a planet dataset. Adjust deliberately for future articles.
const bounds = {
  bottomRight: { latitude: 4, longitude: 103 },
  topLeft: { latitude: 11, longitude: 97 },
};
type Position = [number, number];
const project = ([x, y]: Position): Position => [
  ((x / 6378137) * 180) / Math.PI,
  ((2 * Math.atan(Math.exp(y / 6378137)) - Math.PI / 2) * 180) / Math.PI,
];
const south = bounds.bottomRight.latitude,
  north = bounds.topLeft.latitude;
const west = bounds.topLeft.longitude,
  east = bounds.bottomRight.longitude;

function clip(ring: Position[]): Position[] {
  let output = ring.slice(0, -1);
  for (const [axis, boundary, direction] of [
    [0, west, 1],
    [0, east, -1],
    [1, south, 1],
    [1, north, -1],
  ] as const) {
    const input = output;
    output = [];
    for (let i = 0; i < input.length; i++) {
      const a = input[i]!,
        b = input[(i + 1) % input.length]!;
      const aInside = (a[axis] - boundary) * direction >= 0;
      const bInside = (b[axis] - boundary) * direction >= 0;
      if (aInside) output.push(a);
      if (aInside !== bInside) {
        const t = (boundary - a[axis]) / (b[axis] - a[axis]);
        output.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    }
  }
  if (output.length < 3) return [];
  output = output.map(([longitude, latitude]) => [
    Number(longitude.toFixed(6)),
    Number(latitude.toFixed(6)),
  ]);
  output.push(output[0]!);
  return output;
}
const features: {
  type: 'Feature';
  properties: { layer: 'land' };
  geometry: { type: 'Polygon'; coordinates: Position[][] };
}[] = [];
for (let offset = 100; offset < bytes.length; ) {
  const length = bytes.readInt32BE(offset + 4) * 2;
  const record = bytes.subarray(offset + 8, offset + 8 + length);
  offset += 8 + length;
  if (record.readInt32LE(0) === 0) continue;
  if (record.readInt32LE(0) !== 5) throw new Error('Unsupported shape type.');
  const partCount = record.readInt32LE(36),
    pointCount = record.readInt32LE(40);
  const coordinatesOffset = 44 + partCount * 4;
  if (
    partCount < 1 ||
    pointCount < 4 ||
    coordinatesOffset + pointCount * 16 > record.length
  )
    throw new Error('Invalid shape record.');
  // ESRI polygon exterior rings are clockwise; holes follow their exterior.
  let polygon: (typeof features)[number] | undefined;
  for (let part = 0; part < partCount; part++) {
    const first = record.readInt32LE(44 + part * 4);
    const end =
      part + 1 < partCount ? record.readInt32LE(48 + part * 4) : pointCount;
    const ring: Position[] = [];
    for (let i = first; i < end; i++)
      ring.push(
        project([
          record.readDoubleLE(coordinatesOffset + i * 16),
          record.readDoubleLE(coordinatesOffset + i * 16 + 8),
        ]),
      );
    const area = ring
      .slice(0, -1)
      .reduce(
        (sum, point, i) =>
          sum + point[0] * ring[i + 1]![1] - ring[i + 1]![0] * point[1],
        0,
      );
    const clipped = clip(ring);
    if (area < 0) {
      polygon = clipped.length
        ? {
            geometry: { coordinates: [clipped], type: 'Polygon' },
            properties: { layer: 'land' },
            type: 'Feature',
          }
        : undefined;
      if (polygon) features.push(polygon);
    } else if (polygon && clipped.length)
      polygon.geometry.coordinates.push(clipped);
  }
}
// Reuse the detailed, already licensed Samui snapshot for the house-scale illustration.
const supplementPath = 'src/assets/geography/koh-samui/coastline.geojson';
const supplementBytes = await fs.readFile(
  path.join(root, supplementPath),
  'utf8',
);
const supplement = JSON.parse(supplementBytes) as {
  geometry: { type: 'Polygon'; coordinates: Position[][] };
};
function contains(ring: Position[], point: Position): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!,
      b = ring[j]!;
    if (
      a[1] > point[1] !== b[1] > point[1] &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
const detailedFeatures = features.filter(
  (feature) => !contains(feature.geometry.coordinates[0]!, [100, 9.5]),
);
detailedFeatures.push({
  geometry: supplement.geometry,
  properties: { layer: 'land' },
  type: 'Feature',
});
const data = datasetSchema.parse({
  bounds,
  features: detailedFeatures,
  licence: 'ODbL-1.0',
  source:
    'https://osmdata.openstreetmap.de/download/simplified-land-polygons-complete-3857.zip',
  sourceSha256: createHash('sha256')
    .update(await fs.readFile(archive))
    .digest('hex'),
  supplement: {
    path: supplementPath,
    sha256: createHash('sha256').update(supplementBytes).digest('hex'),
  },
  type: 'FeatureCollection',
});
const output = path.join(
  root,
  'src/data/static-maps/southern-thailand-malaysia.json',
);
const formatted = execFileSync(
  path.join(root, 'node_modules/.bin/biome'),
  ['format', '--stdin-file-path', output],
  { input: `${JSON.stringify(data)}\n`, maxBuffer: 16 * 1024 * 1024 },
);
await fs.writeFile(output, formatted);
console.log(
  `Imported ${detailedFeatures.length} regional land polygons. Existing article images were not regenerated.`,
);
