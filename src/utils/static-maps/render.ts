import { realpath } from 'node:fs/promises';
import path from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';
import type { MapDataset } from './data.ts';
import type { Coordinates, StaticMap } from './schema.ts';
import { staticMapStyle as style } from './style.ts';

const mercator = (latitude: number) =>
  Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360));
export const escapeMarkup = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "'": '&apos;',
        '"': '&quot;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
      })[character] ?? character,
  );

export async function renderStaticMap(
  map: StaticMap,
  data: MapDataset,
  root: string,
): Promise<Buffer> {
  const { topLeft, bottomRight } = map.bounds;
  if (
    Math.abs(topLeft.latitude) > 85.051128 ||
    Math.abs(bottomRight.latitude) > 85.051128
  )
    throw new Error(
      'Web Mercator rendering requires latitude within ±85.051128 degrees.',
    );
  if (
    topLeft.latitude > data.bounds.topLeft.latitude ||
    topLeft.longitude < data.bounds.topLeft.longitude ||
    bottomRight.latitude < data.bounds.bottomRight.latitude ||
    bottomRight.longitude > data.bounds.bottomRight.longitude
  )
    throw new Error(
      'Map bounds exceed the local dataset. Update the regional extract explicitly.',
    );
  const { width, height } = map.size;
  const west = (topLeft.longitude * Math.PI) / 180;
  const north = mercator(topLeft.latitude);
  const east = (bottomRight.longitude * Math.PI) / 180;
  const south = mercator(bottomRight.latitude);
  // Preserve geography and the declared frame: centre it with parchment margins when aspect ratios differ.
  const scale = Math.min(width / (east - west), height / (north - south));
  const offsetX = (width - (east - west) * scale) / 2;
  const offsetY = (height - (north - south) * scale) / 2;
  const project = ({ latitude, longitude }: Coordinates): [number, number] => [
    offsetX + ((longitude * Math.PI) / 180 - west) * scale,
    offsetY + (north - mercator(latitude)) * scale,
  ];
  const xy = (point: Coordinates) =>
    project(point)
      .map((value) => value.toFixed(3))
      .join(',');
  const land = data.features
    .map((feature) => {
      const d = feature.geometry.coordinates
        .map(
          (ring) =>
            `M${ring.map(([longitude, latitude]) => xy({ latitude, longitude })).join('L')}Z`,
        )
        .join('');
      return `<path d="${d}" fill="${style.land}" stroke="${style.coastline}" stroke-width="${style.coastlineWidth}" fill-rule="evenodd"/>`;
    })
    .join('');
  const points = new Map(map.points.map((point) => [point.id, point]));
  const routes = map.routes
    .map(
      (route) =>
        `<polyline points="${route.points.map((id) => xy(points.get(id)!.coordinates)).join(' ')}" fill="none" stroke="${style.route}" stroke-width="${style.routeWidth}"/>`,
    )
    .join('');
  const markers = map.points
    .filter((point) => point.marker?.type !== 'route-anchor')
    .map((point) => {
      const [x, y] = project(point.coordinates);
      return `<circle cx="${x}" cy="${y}" r="${style.markerRadius}" fill="${style.marker}" stroke="${style.halo}" stroke-width="2"/>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${style.land}"/><rect x="${offsetX}" y="${offsetY}" width="${(east - west) * scale}" height="${(north - south) * scale}" fill="${style.water}"/><defs><clipPath id="frame"><rect x="${offsetX}" y="${offsetY}" width="${(east - west) * scale}" height="${(north - south) * scale}"/></clipPath></defs><g clip-path="url(#frame)">${land}${routes}${markers}</g></svg>`;
  const labels: OverlayOptions[] = [];
  for (const point of map.points) {
    if (point.label === false) continue;
    const label = point.label ?? point.title;
    const thai = /[\u0e00-\u0e7f]/u.test(label);
    const { data: text, info } = await sharp({
      text: {
        dpi: 72,
        font: `${thai ? 'Anuphan' : 'Panton'} ${style.labelSize}`,
        fontfile: await realpath(
          path.join(root, thai ? style.thaiFont : style.latinFont),
        ),
        rgba: true,
        text: `<span foreground="${style.text}">${escapeMarkup(label)}</span>`,
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });
    if (info.width + 16 > width || info.height + 16 > height)
      throw new Error(`Label is too large for the map: ${point.id}`);
    const [x, y] = project(point.coordinates);
    const left = Math.round(
      Math.max(8, Math.min(width - info.width - 8, x + style.labelGap)),
    );
    const top = Math.round(
      Math.max(8, Math.min(height - info.height - 8, y - info.height / 2)),
    );
    const background = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${info.width + 8}" height="${info.height + 8}"><rect width="100%" height="100%" rx="4" fill="${style.halo}"/></svg>`,
    );
    labels.push(
      { input: background, left: left - 4, top: top - 4 },
      { input: text, left, top },
    );
  }
  return sharp(Buffer.from(svg))
    .composite(labels)
    .webp({ lossless: true })
    .toBuffer();
}
