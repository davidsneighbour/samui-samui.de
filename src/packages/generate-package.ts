import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { parse } from 'jsonc-parser';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '../..');

/**
 * keys to preserve from the original package.json
 * can be overridden with `--keys` parameter
 * e.g. --keys name,description,version
 */
let keysToPreserve: string[] = [
  'name',
  'description',
  'version',
  'author',
  'bugs',
  'engines',
  'homepage',
  'license',
  'private',
  'repository',
  'publishConfig',
  'type',
];

/**
 * @returns {Options}
 */
type Options = {
  pkgPath: string;
  verbose: boolean;
  dryRun: boolean;
  check: boolean;
};

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const opts = {
    check: false,
    dryRun: false,
    pkgPath: path.resolve(projectRoot, 'package.json'),
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    switch (a) {
      case '--package':
        if (typeof args[i + 1] !== 'string') {
          console.error('✖ Missing value for --package');
          process.exit(1);
        }
        // args[i + 1] is guaranteed to be a string here
        opts.pkgPath = path.resolve(projectRoot, args[++i] as string);
        break;
      case '--verbose':
        opts.verbose = true;
        break;
      case '--check':
        opts.check = true;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--keys': {
        if (!args[i + 1]) {
          console.error('✖ Missing value for --keys');
          process.exit(1);
        }
        // Ensure the next argument exists before splitting
        const keysArg = args[++i];
        if (typeof keysArg === 'string') {
          keysToPreserve = keysArg.split(',').map((key) => key.trim());
        } else {
          console.error('✖ Missing value for --keys');
          process.exit(1);
        }
        break;
      }
      default:
        // lint-staged appends the staged file names; --check reads every
        // fragment anyway, so those paths are ignored.
        if (opts.check && a !== undefined && !a.startsWith('--')) break;
        console.error(`✖ Unknown argument: ${a}`);
        process.exit(1);
    }
  }
  return opts;
}

/**
 * List the dotted paths where two JSON values differ. Object key order is
 * ignored, because fixpack sorts package.json after generation.
 */
function diffPaths(a: unknown, b: unknown, prefix = ''): string[] {
  const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);
  if (isObj(a) && isObj(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((k) =>
      diffPaths(a[k], b[k], prefix ? `${prefix}.${k}` : k),
    );
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [prefix || '(root)'];
}

/**
 * deep-merge source into target. Objects merge recursively;
 * arrays and primitives are overwritten.
 * @template T
 * @param {T} target
 * @param {Partial<T>} source
 * @returns {T}
 */
function mergeDeep<T>(target: T, source: Partial<T>): T {
  for (const key of Object.keys(source)) {
    // Prevent prototype pollution by skipping dangerous keys
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    // Use type assertion to allow string indexing on Partial<T> and T
    // biome-ignore lint/suspicious/noExplicitAny: dynamic JSON merge, shape is not known statically
    const sv = (source as Record<string, any>)[key];
    // biome-ignore lint/suspicious/noExplicitAny: dynamic JSON merge, shape is not known statically
    const tv = (target as Record<string, any>)[key];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      mergeDeep(tv, sv);
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: dynamic JSON merge, shape is not known statically
      (target as Record<string, any>)[key] = sv;
    }
  }
  return target;
}

/**
 * filters package.json to include only specified keys
 * @param {Record<string, any>} pkg
 * @param {string[]} keys
 * @returns {Record<string, any>}
 */
function filterPackageJson(
  // biome-ignore lint/suspicious/noExplicitAny: dynamic JSON merge, shape is not known statically
  pkg: Record<string, any>,
  keys: string[],
  // biome-ignore lint/suspicious/noExplicitAny: dynamic JSON merge, shape is not known statically
): Record<string, any> {
  // Explicitly type filtered as Record<string, any> to allow string indexing
  // biome-ignore lint/suspicious/noExplicitAny: dynamic JSON merge, shape is not known statically
  const filtered: Record<string, any> = {};
  for (const key of keys) {
    if (pkg[key]) {
      filtered[key] = pkg[key];
    }
  }
  return filtered;
}

async function main() {
  const { pkgPath, verbose, dryRun, check } = parseArgs();

  // discover all JSON files
  const configPaths = glob.sync('src/packages/**/*.jsonc', {
    absolute: true,
    cwd: projectRoot,
  });

  if (verbose) {
    console.error(`> Using keys: ${keysToPreserve.join(', ')}`);
    console.error(`> Reading package.json from ${pkgPath}`);
  }

  // load package.json
  let pkg;
  try {
    pkg = parse(fs.readFileSync(pkgPath, 'utf8'));
    if (verbose) {
      console.error(`> Project Name: ${pkg.name}`);
      console.error(`> Description: ${pkg.description}`);
      console.error(`> Version: ${pkg.version}`);
    }
  } catch (err) {
    // Type guard for error object to safely access message property
    if (err && typeof err === 'object' && 'message' in err) {
      console.error(
        `✖ Failed to read/parse ${pkgPath}: ${(err as { message: string }).message}`,
      );
    } else {
      console.error(`✖ Failed to read/parse ${pkgPath}: ${String(err)}`);
    }
    process.exit(1);
  }

  // filter the original package.json
  const filteredPkg = filterPackageJson(pkg, keysToPreserve);

  // merge each JSON config file into the new object
  for (const cfgPath of configPaths) {
    if (verbose) console.error(`> Merging values from ${cfgPath}`);
    let cfg;
    try {
      cfg = parse(fs.readFileSync(cfgPath, 'utf8'));
      mergeDeep(filteredPkg, cfg);
    } catch (err) {
      // Type guard for error object to safely access message property
      if (err && typeof err === 'object' && 'message' in err) {
        console.error(
          `✖ Failed to parse ${cfgPath}: ${(err as { message: string }).message}`,
        );
      } else {
        console.error(`✖ Failed to parse ${cfgPath}: ${String(err)}`);
      }
      process.exit(1);
    }
  }

  // remove the "notes" key if it exists
  if (filteredPkg['notes']) {
    delete filteredPkg['notes'];
    if (verbose)
      console.error('> Removed "notes" from package.json structure.');
  }

  if (check) {
    const drift = diffPaths(filteredPkg, pkg);
    if (drift.length > 0) {
      console.error(
        '✖ package.json does not match src/packages/**/*.jsonc. Differing keys:',
      );
      for (const key of drift) console.error(`  - ${key}`);
      console.error(
        'Edit the fragments and run `npm run compile:package`, or run `npm run compile:package:update` to copy versions from package.json into the fragments.',
      );
      process.exit(1);
    }
    if (verbose) console.error('✔ package.json matches the fragments.');
    return;
  }

  // write back (or dry-run)
  const outputPath = path.resolve(projectRoot, 'package.json');
  if (dryRun) {
    console.log('✔ Dry run complete, no file written.');
    console.log(JSON.stringify(filteredPkg, null, 2));
    return;
  }

  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(filteredPkg, null, 2) + '\n',
      'utf8',
    );
    console.log(`✔ Merged values written to ${outputPath}`);
  } catch (err) {
    // Type guard for error object to safely access message property
    if (err && typeof err === 'object' && 'message' in err) {
      console.error(
        `✖ Failed to write ${outputPath}: ${(err as { message: string }).message}`,
      );
    } else {
      console.error(`✖ Failed to write ${outputPath}: ${String(err)}`);
    }
    process.exit(1);
  }
}

main();
