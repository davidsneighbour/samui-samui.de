import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import sharp from 'sharp';
import { parse } from 'yaml';
import { z } from 'zod';
import { datasetSchema } from '../../utils/static-maps/data.ts';
import { renderStaticMap } from '../../utils/static-maps/render.ts';
import { staticMapsSchema } from '../../utils/static-maps/schema.ts';
import { staticMapStyle } from '../../utils/static-maps/style.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const manifestSchema = z.object({
  assets: z.record(
    z.string(),
    z.object({
      configSha256: z.string(),
      datasetSha256: z.string(),
      encoder: z.string(),
      fingerprint: z.string(),
      height: z.number(),
      rendererHash: z.string(),
      sha256: z.string(),
      styleVersion: z.number(),
      width: z.number(),
    }),
  ),
  version: z.literal(1),
});
type Manifest = z.infer<typeof manifestSchema>;
const hash = (input: string | Buffer) =>
  createHash('sha256').update(input).digest('hex');

export async function bundleOutput(
  directory: string,
  filename: string,
): Promise<string> {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.webp$/.test(filename))
    throw new Error('Map output must be a bundle-local WebP filename.');
  const output = path.join(directory, filename);
  try {
    const stat = await fs.lstat(output);
    if (!stat.isFile() || stat.isSymbolicLink())
      throw new Error(`Refusing non-regular output: ${output}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  return output;
}

async function readManifest(directory: string): Promise<Manifest> {
  try {
    return manifestSchema.parse(
      JSON.parse(
        await fs.readFile(path.join(directory, '.static-maps.json'), 'utf8'),
      ),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      return { assets: {}, version: 1 };
    throw error;
  }
}

export async function main(args: string[], projectRoot = root) {
  const root = projectRoot;
  const posts = path.join(root, 'src/content/posts');
  const dataFile = path.join(
    root,
    'src/data/static-maps/southern-thailand-malaysia.json',
  );
  const allowed = args.every(
    (arg) =>
      ['--all', '--changed', '--verify'].includes(arg) ||
      arg.startsWith('--post='),
  );
  const postArg = args.find((arg) => arg.startsWith('--post='));
  const verify = args.includes('--verify');
  const changed = args.includes('--changed');
  if (
    !allowed ||
    args.filter(
      (arg) =>
        arg === '--all' || arg === '--changed' || arg.startsWith('--post='),
    ).length > 1 ||
    (!verify && !postArg && !args.includes('--all') && !changed)
  )
    throw new Error(
      'Usage: npm run maps -- --post=YYYY/MM/slug | --all | --changed | --verify',
    );
  const files = await glob('**/index.md', { absolute: true, cwd: posts });
  const requested = postArg?.slice('--post='.length);
  if (
    requested !== undefined &&
    (!/^\d{4}\/\d{2}\/[a-z0-9-]+$/.test(requested) ||
      !files.includes(path.join(posts, requested, 'index.md')))
  )
    throw new Error('Unknown or unsafe post path.');
  let dataText: string | undefined;
  if (!verify) {
    try {
      dataText = await fs.readFile(dataFile, 'utf8');
    } catch {
      throw new Error(
        'Local map data is unavailable. Restore src/data/static-maps/southern-thailand-malaysia.json or run maps:data:update explicitly.',
      );
    }
  }
  const dataset = dataText
    ? datasetSchema.parse(JSON.parse(dataText))
    : undefined;
  // Include fonts, renderer source, and encoder version in regeneration fingerprints.
  const rendererFiles = [
    'src/utils/static-maps/render.ts',
    staticMapStyle.latinFont,
    staticMapStyle.thaiFont,
  ];
  const rendererHash = !verify
    ? hash(
        Buffer.concat(
          await Promise.all(
            rendererFiles.map((file) => fs.readFile(path.join(root, file))),
          ),
        ),
      )
    : '';
  let total = 0;
  for (const file of files.sort()) {
    if (requested && file !== path.join(posts, requested, 'index.md')) continue;
    const directory = path.dirname(file);
    const relative = path.relative(posts, directory).replaceAll('\\', '/');
    if (
      !(await fs.realpath(directory)).startsWith(
        `${await fs.realpath(posts)}${path.sep}`,
      )
    )
      throw new Error(`Post directory escapes content root: ${relative}`);
    const text = await fs.readFile(file, 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
    if (!match) throw new Error(`Missing frontmatter: ${relative}`);
    const frontmatter = parse(match[1]!) as Record<string, unknown>;
    const maps = staticMapsSchema.parse(frontmatter['maps'] ?? []);
    const previous = await readManifest(directory);
    const declared = new Set(maps.map((map) => map.image));
    for (const image of Object.keys(previous.assets))
      if (!declared.has(image))
        throw new Error(
          `Orphaned generated map: ${relative}/${image}. Remove it and its manifest entry explicitly.`,
        );
    if (verify) {
      // Reserved map*.webp names also catch abandoned assets without a manifest.
      for (const image of await fs.readdir(directory))
        if (/^map(?:-[\w-]+)?\.webp$/.test(image) && !declared.has(image))
          throw new Error(`Undeclared map image: ${relative}/${image}`);
    }
    const next: Manifest = { assets: {}, version: 1 };
    for (const map of maps) {
      const output = await bundleOutput(directory, map.image);
      if (verify) {
        const bytes = await fs.readFile(output);
        const metadata = await sharp(bytes).metadata();
        if (
          metadata.format !== 'webp' ||
          metadata.width !== map.size.width ||
          metadata.height !== map.size.height
        )
          throw new Error(
            `Wrong map format or dimensions: ${relative}/${map.image}`,
          );
        const saved = previous.assets[map.image];
        if (
          !saved ||
          hash(bytes) !== saved.sha256 ||
          saved.configSha256 !== hash(JSON.stringify(map))
        )
          throw new Error(
            `Missing provenance or modified map image: ${relative}/${map.image}`,
          );
        total++;
        continue;
      }
      const fingerprint = hash(
        JSON.stringify({
          dataset: hash(dataText!),
          map,
          rendererHash,
          sharp: sharp.versions,
          style: staticMapStyle,
        }),
      );
      const saved = previous.assets[map.image];
      let intact = false;
      try {
        intact = saved?.sha256 === hash(await fs.readFile(output));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
      if (changed && saved?.fingerprint === fingerprint && intact) {
        next.assets[map.image] = saved;
        continue;
      }
      // Never silently replace an unrelated editorial image.
      if (!saved) {
        try {
          await fs.access(output);
          throw new Error(
            `Existing image is not owned by the map generator: ${output}`,
          );
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
      }
      const bytes = await renderStaticMap(map, dataset!, root);
      await fs.writeFile(output, bytes);
      next.assets[map.image] = {
        configSha256: hash(JSON.stringify(map)),
        datasetSha256: hash(dataText!),
        encoder: `sharp ${sharp.versions.sharp}, vips ${sharp.versions.vips}, webp ${sharp.versions.webp}`,
        fingerprint,
        rendererHash,
        sha256: hash(bytes),
        styleVersion: staticMapStyle.version,
        ...map.size,
      };
      console.log(`✓ ${relative}: ${map.id} → ${map.image}`);
      total++;
    }
    if (!verify && maps.length) {
      const manifestPath = path.join(directory, '.static-maps.json');
      try {
        if ((await fs.lstat(manifestPath)).isSymbolicLink())
          throw new Error('Refusing symlink manifest.');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
      const serialised = `${JSON.stringify(next, null, 2)}\n`;
      if (serialised !== `${JSON.stringify(previous, null, 2)}\n`)
        await fs.writeFile(manifestPath, serialised);
    }
  }
  console.log(`${verify ? 'Verified' : 'Generated'} ${total} map(s).`);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
