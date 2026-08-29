#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_TIMEOUT_MS = 30_000;

function printHelp() {
  console.log(
    `
Usage:
  node src/scripts/audit/generate.mjs --config <path> [options]

Options:
  --config <path>      Path to JSON configuration file.
  --dry-run            Print the resulting sample without writing files.
  --help               Show this help.

The generated output contains one URL per line and can be pasted into
Ahrefs Site Audit's Custom URL list.
`.trim(),
  );
}

function parseArgs(argv) {
  const args = {
    config: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help') {
      args.help = true;
      continue;
    }

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--config') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--config requires a file path.');
      }
      args.config = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT' && fallback !== null) {
      return fallback;
    }
    throw new Error(
      `Could not read JSON file "${filePath}": ${error.message}`,
      {
        cause: error,
      },
    );
  }
}

function createRegexList(patterns = []) {
  return patterns.map((pattern) => {
    try {
      return new RegExp(pattern);
    } catch (error) {
      throw new Error(
        `Invalid regular expression "${pattern}": ${error.message}`,
        {
          cause: error,
        },
      );
    }
  });
}

function matchesGroup(url, group) {
  const include = createRegexList(group.include);
  const exclude = createRegexList(group.exclude);

  const included =
    include.length === 0 || include.some((regex) => regex.test(url));
  const excluded = exclude.some((regex) => regex.test(url));

  return included && !excluded;
}

function normaliseUrl(value, baseUrl = undefined) {
  try {
    const url = new URL(value.trim(), baseUrl);
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function extractLocUrls(xml, baseUrl = undefined) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1])
    .map((url) => normaliseUrl(url, baseUrl))
    .filter(Boolean);
}

function isRemoteUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/xml,text/xml,text/plain,*/*',
        'user-agent': 'ahrefs-audit-sampler/0.1',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    throw new Error(`Could not fetch "${url}": ${error.message}`, {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readSitemapText(sitemapUrl, rootDir) {
  if (isRemoteUrl(sitemapUrl)) {
    return {
      baseUrl: sitemapUrl,
      text: await fetchText(sitemapUrl),
    };
  }

  const filePath = path.resolve(rootDir, sitemapUrl);
  return {
    baseUrl: `file://${filePath}`,
    text: await fs.readFile(filePath, 'utf8'),
  };
}

async function resolveSitemapReference(url, config, rootDir) {
  if (isRemoteUrl(url)) {
    if (config.localSitemapDirectory && config.siteUrl) {
      const remoteUrl = new URL(url);
      const siteUrl = new URL(config.siteUrl);

      if (remoteUrl.origin === siteUrl.origin) {
        const localPath = path.resolve(
          rootDir,
          config.localSitemapDirectory,
          remoteUrl.pathname.replace(/^\/+/, ''),
        );

        try {
          await fs.access(localPath);
          return localPath;
        } catch {
          return url;
        }
      }
    }

    return url;
  }

  if (url.startsWith('file://')) {
    return new URL(url).pathname;
  }

  return path.resolve(rootDir, url);
}

async function collectSitemapUrls(sitemapUrls, config, rootDir) {
  const discoveredPages = new Set();
  const visitedSitemaps = new Set();

  async function visit(sitemapUrl) {
    if (visitedSitemaps.has(sitemapUrl)) {
      return;
    }

    visitedSitemaps.add(sitemapUrl);

    const { baseUrl, text: xml } = await readSitemapText(sitemapUrl, rootDir);
    const locs = extractLocUrls(xml, baseUrl);

    const appearsToBeIndex =
      /<sitemapindex[\s>]/i.test(xml) ||
      locs.some((url) =>
        /sitemap.*\.xml(?:\.gz)?$/i.test(new URL(url).pathname),
      );

    if (appearsToBeIndex) {
      for (const child of locs) {
        await visit(await resolveSitemapReference(child, config, rootDir));
      }
      return;
    }

    for (const url of locs) {
      discoveredPages.add(url);
    }
  }

  for (const sitemapUrl of sitemapUrls) {
    await visit(sitemapUrl);
  }

  return [...discoveredPages].sort();
}

function hashString(input) {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seedText) {
  let state = hashString(seedText || `${Date.now()}-${Math.random()}`);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rng) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function chooseRotatingSample(candidates, count, previouslySeen, rng) {
  const unseen = candidates.filter((url) => !previouslySeen.has(url));
  const seen = candidates.filter((url) => previouslySeen.has(url));

  const ordered = [...shuffle(unseen, rng), ...shuffle(seen, rng)];

  return ordered.slice(0, Math.min(count, ordered.length));
}

function validateConfig(config) {
  if (!Array.isArray(config.sitemaps) || config.sitemaps.length === 0) {
    throw new Error('Config requires a non-empty "sitemaps" array.');
  }

  if (!Array.isArray(config.groups) || config.groups.length === 0) {
    throw new Error('Config requires a non-empty "groups" array.');
  }

  if (!Number.isInteger(config.maxUrls) || config.maxUrls < 1) {
    throw new Error('"maxUrls" must be a positive integer.');
  }

  for (const group of config.groups) {
    if (!group.name || !Number.isInteger(group.count) || group.count < 0) {
      throw new Error(
        'Each group requires "name" and a non-negative integer "count".',
      );
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (!args.config) {
    throw new Error('Missing required --config option. Use --help for usage.');
  }

  const rootDir = process.cwd();
  const configPath = path.resolve(rootDir, args.config);
  const config = await readJson(configPath);

  validateConfig(config);

  const outputFile = path.resolve(rootDir, config.outputFile);
  const historyFile = path.resolve(rootDir, config.historyFile);
  const history = await readJson(historyFile, {
    runs: [],
    seenByGroup: {},
    version: 1,
  });

  const pageUrls = await collectSitemapUrls(config.sitemaps, config, rootDir);
  const permanentUrls = [
    ...new Set(
      (config.permanentUrls || [])
        .map((url) => normaliseUrl(url))
        .filter(Boolean),
    ),
  ];

  const seed = config.randomSeed ?? new Date().toISOString().slice(0, 10);

  const rng = createRng(String(seed));
  const selected = new Set(permanentUrls);
  const runGroups = {};

  for (const group of config.groups) {
    const candidates = pageUrls.filter((url) => matchesGroup(url, group));
    const seen = new Set(history.seenByGroup?.[group.name] || []);

    const available = candidates.filter((url) => !selected.has(url));
    const sample = chooseRotatingSample(available, group.count, seen, rng);

    runGroups[group.name] = sample;

    for (const url of sample) {
      selected.add(url);
    }
  }

  const result = [...selected].slice(0, config.maxUrls);

  if (result.length < selected.size) {
    console.warn(
      `Warning: selected ${selected.size} URLs, but maxUrls=${config.maxUrls}; ` +
        `${selected.size - result.length} URLs were dropped.`,
    );
  }

  const output = `${result.join('\n')}\n`;

  console.log(`Discovered URLs: ${pageUrls.length}`);
  console.log(`Permanent URLs: ${permanentUrls.length}`);

  for (const [groupName, urls] of Object.entries(runGroups)) {
    console.log(`${groupName}: ${urls.length}`);
  }

  console.log(`Final sample: ${result.length}`);

  if (args.dryRun) {
    console.log('\n--- sample ---\n');
    process.stdout.write(output);
    return;
  }

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, output, 'utf8');

  const nextSeenByGroup = { ...(history.seenByGroup || {}) };

  for (const [groupName, urls] of Object.entries(runGroups)) {
    nextSeenByGroup[groupName] = [
      ...new Set([...(nextSeenByGroup[groupName] || []), ...urls]),
    ];
  }

  const nextHistory = {
    runs: [
      ...(history.runs || []),
      {
        generatedAt: new Date().toISOString(),
        groups: Object.fromEntries(
          Object.entries(runGroups).map(([name, urls]) => [name, urls.length]),
        ),
        seed: String(seed),
        total: result.length,
      },
    ].slice(-100),
    seenByGroup: nextSeenByGroup,
    version: 1,
  };

  await fs.mkdir(path.dirname(historyFile), { recursive: true });
  await fs.writeFile(
    historyFile,
    `${JSON.stringify(nextHistory, null, 2)}\n`,
    'utf8',
  );

  console.log(`Wrote: ${outputFile}`);
  console.log(`History: ${historyFile}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);

  if (error.cause?.message) {
    console.error(`Cause: ${error.cause.message}`);
  }

  process.exitCode = 1;
});
