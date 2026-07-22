// pagefind integration for Astro
// based on https://github.com/shishkin/astro-pagefind
// see https://github.com/shishkin/astro-pagefind/blob/main/LICENSE

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { close, createIndex, type PagefindServiceConfig } from 'pagefind';
import sirv from 'sirv';

const cacheVersion = 1;
const defaultCacheDirectory = path.join('node_modules', '.astro', 'pagefind');
const defaultContentDirectory = 'src/content';
const forceRebuildEnvironmentVariable = 'PAGEFIND_FORCE_REBUILD';

export interface PagefindOptions {
  /**
   * `PagefindServiceConfig` passed to pagefind's `createIndex`
   */
  indexConfig?: PagefindServiceConfig;
  /**
   * Project-relative content directory used to decide whether the index cache
   * is still valid.
   */
  contentDirectory?: string;
  /**
   * Project-relative cache directory for the generated Pagefind bundle.
   */
  cacheDirectory?: string;
}

export default function pagefind({
  indexConfig,
  contentDirectory = defaultContentDirectory,
  cacheDirectory = defaultCacheDirectory,
}: PagefindOptions = {}): AstroIntegration {
  let clientDir: string | undefined;
  let rootDir = process.cwd();

  return {
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const pagefindOutputDirectory = path.join(outDir, 'pagefind');
        const pagefindCacheDirectory = path.resolve(rootDir, cacheDirectory);
        const cachedBundleDirectory = path.join(
          pagefindCacheDirectory,
          'bundle',
        );
        const manifestPath = path.join(pagefindCacheDirectory, 'manifest.json');
        const packageVersion = await readPagefindPackageVersion(rootDir);
        const fingerprint = await createCacheFingerprint({
          contentDirectory,
          indexConfig,
          packageVersion,
          rootDir,
        });
        const manifest = await readManifest(manifestPath);
        const forceRebuild = isTruthy(
          process.env[forceRebuildEnvironmentVariable],
        );

        if (
          !forceRebuild &&
          manifest?.fingerprint === fingerprint &&
          (await exists(cachedBundleDirectory))
        ) {
          await fs.rm(pagefindOutputDirectory, {
            force: true,
            recursive: true,
          });
          await fs.cp(cachedBundleDirectory, pagefindOutputDirectory, {
            recursive: true,
          });
          logger.info(
            `Pagefind reused cached index for unchanged ${contentDirectory} (${fingerprint.slice(0, 12)})`,
          );
          return;
        }

        if (forceRebuild) {
          logger.info(
            `Pagefind cache bypassed by ${forceRebuildEnvironmentVariable}`,
          );
        } else if (!manifest) {
          logger.info('Pagefind cache missing; rebuilding index');
        } else if (manifest.fingerprint !== fingerprint) {
          logger.info(
            `Pagefind content fingerprint changed (${fingerprint.slice(0, 12)}); rebuilding index`,
          );
        } else {
          logger.info('Pagefind cached bundle missing; rebuilding index');
        }

        const { index, errors: createErrors } = await createIndex(indexConfig);
        if (!index) {
          logger.error('Pagefind failed to create index');
          createErrors.forEach((e) => logger.error(e));
          return;
        }
        try {
          const { page_count, errors: addErrors } = await index.addDirectory({
            path: outDir,
          });
          if (addErrors.length) {
            logger.error('Pagefind failed to index files');
            addErrors.forEach((e) => logger.error(e));
            return;
          } else {
            logger.info(`Pagefind indexed ${page_count} pages`);
          }
          const { outputPath, errors: writeErrors } = await index.writeFiles({
            outputPath: pagefindOutputDirectory,
          });
          if (writeErrors.length) {
            logger.error('Pagefind failed to write index');
            writeErrors.forEach((e) => logger.error(e));
            return;
          } else {
            logger.info(`Pagefind wrote index to ${outputPath}`);
          }
          await fs.rm(cachedBundleDirectory, { force: true, recursive: true });
          await fs.mkdir(pagefindCacheDirectory, { recursive: true });
          await fs.cp(pagefindOutputDirectory, cachedBundleDirectory, {
            recursive: true,
          });
          await fs.writeFile(
            manifestPath,
            `${JSON.stringify(
              {
                cacheVersion,
                contentDirectory,
                createdAt: new Date().toISOString(),
                fingerprint,
                packageVersion,
              },
              null,
              2,
            )}\n`,
          );
          logger.info(
            `Pagefind cache refreshed for ${contentDirectory} (${fingerprint.slice(0, 12)})`,
          );
        } finally {
          await index.deleteIndex();
          await close();
        }
      },
      'astro:config:setup': ({ config, logger }) => {
        rootDir = fileURLToPath(config.root);
        if (config.output === 'server') {
          logger.warn(
            'Output type `server` does not produce static *.html pages in its output and thus will not work with astro-pagefind integration.',
          );
        }
        if (config.adapter) {
          clientDir = fileURLToPath(config.build.client);
        }
      },
      'astro:server:setup': ({ server, logger }) => {
        const outDir =
          clientDir ??
          path.join(server.config.root, server.config.build.outDir);
        logger.debug(`Serving pagefind from ${outDir}`);
        const serve = sirv(outDir, {
          dev: true,
          etag: true,
        });
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/pagefind/')) {
            serve(req, res, next);
          } else {
            next();
          }
        });
      },
    },
    name: 'pagefind',
  };
}

interface CacheFingerprintOptions {
  contentDirectory: string;
  indexConfig: PagefindServiceConfig | undefined;
  packageVersion: string;
  rootDir: string;
}

interface PagefindCacheManifest {
  cacheVersion: number;
  fingerprint: string;
}

async function createCacheFingerprint({
  contentDirectory,
  indexConfig,
  packageVersion,
  rootDir,
}: CacheFingerprintOptions): Promise<string> {
  const hash = createHash('sha256');
  hash.update(`pagefind-cache-v${cacheVersion}\0`);
  hash.update(`pagefind:${packageVersion}\0`);
  hash.update(`${stableStringify(indexConfig ?? {})}\0`);
  await hashDirectory(
    path.join(rootDir, contentDirectory),
    contentDirectory,
    hash,
  );
  return hash.digest('hex');
}

async function hashDirectory(
  absoluteDirectory: string,
  relativeDirectory: string,
  hash: ReturnType<typeof createHash>,
): Promise<void> {
  const directoryEntries = await fs.readdir(absoluteDirectory, {
    withFileTypes: true,
  });
  directoryEntries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of directoryEntries) {
    const absolutePath = path.join(absoluteDirectory, entry.name);
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      hash.update(`dir:${relativePath}\0`);
      await hashDirectory(absolutePath, relativePath, hash);
    } else if (entry.isFile()) {
      hash.update(`file:${relativePath}\0`);
      hash.update(await fs.readFile(absolutePath));
      hash.update('\0');
    }
  }
}

async function readManifest(
  manifestPath: string,
): Promise<PagefindCacheManifest | undefined> {
  try {
    const manifest = JSON.parse(
      await fs.readFile(manifestPath, 'utf8'),
    ) as PagefindCacheManifest;
    if (manifest.cacheVersion !== cacheVersion || !manifest.fingerprint) {
      return undefined;
    }
    return manifest;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function readPagefindPackageVersion(rootDir: string): Promise<string> {
  try {
    const packageJson = JSON.parse(
      await fs.readFile(
        path.join(rootDir, 'node_modules', 'pagefind', 'package.json'),
        'utf8',
      ),
    ) as { version?: string };
    return packageJson.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === 'ENOENT') return false;
    throw error;
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function isTruthy(value: string | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes';
}

function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
