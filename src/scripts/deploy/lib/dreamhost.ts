// Uploads dist/ to DreamHost over SSH with rsync.
//
// Default strategy "atomic" (documentation/hosting/deployment.md#atomic-releases):
//
//   /home/<user>/samui-samui.de/
//     releases/20261009T083000Z-1a2b3c4/   <- one complete copy per deploy
//     releases/20261010T101500Z-5d6e7f8/
//     public -> releases/20261010T101500Z-5d6e7f8   (web directory = symlink)
//
// Each release is uploaded next to the live one with `--link-dest`, so
// unchanged files are hard links (no transfer, no extra disk space) and only
// changed files travel. The live site switches with one rename(2) of the
// `public` symlink: visitors never see HTML that references assets which are
// not uploaded yet, and rollback is another symlink switch.
//
// Strategy "direct" rsyncs into the web directory itself. It is the fallback
// if DreamHost ever refuses a symlinked web directory.
import path from 'node:path';
import type { DreamhostConfig } from './config.ts';
import { run } from './process.ts';
import type { ChangeSet } from './purge-plan.ts';

const RELEASE_PATTERN = /^\d{8}T\d{6}Z(-[0-9a-f]{7,40})?(-dirty)?(-adopted)?$/;
const BASE_SSH_OPTIONS = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=20'];

function sshOptions(config: DreamhostConfig): string[] {
  return [
    ...(config.sshConfigFile ? ['-F', config.sshConfigFile] : []),
    ...BASE_SSH_OPTIONS,
  ];
}

export function isReleaseName(name: string): boolean {
  return RELEASE_PATTERN.test(name);
}

/** Upload time encoded in a release name (UTC), or null for unexpected names. */
export function releaseDate(name: string): Date | null {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/.exec(name);
  if (!match || !isReleaseName(name)) {
    return null;
  }
  const [, year, month, day, hour, minute, second] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
}

/** Git commit encoded in a release name ("0000000" for an adopted web directory). */
export function releaseCommit(name: string): string | null {
  return /^\d{8}T\d{6}Z-([0-9a-f]{7,40})/.exec(name)?.[1] ?? null;
}

export function releaseName(
  date: Date,
  gitSha: string,
  dirty: boolean,
): string {
  const stamp = date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  return `${stamp}-${gitSha}${dirty ? '-dirty' : ''}`;
}

async function ssh(
  config: DreamhostConfig,
  script: string,
  allowFailure = false,
): Promise<string> {
  const result = await run(
    'ssh',
    [...sshOptions(config), config.sshTarget, `set -eu\n${script}`],
    { allowFailure, capture: true },
  );
  return result.stdout;
}

export interface RemoteState {
  /** Release the web directory currently points to, if any. */
  current: string | null;
  docroot: 'symlink' | 'directory' | 'missing' | 'other';
  releases: string[];
}

export async function remoteState(
  config: DreamhostConfig,
): Promise<RemoteState> {
  const output = await ssh(
    config,
    `D='${config.docroot}'; R='${config.releasesDir}'
command -v rsync >/dev/null || { echo "rsync=missing"; exit 0; }
if [ -L "$D" ]; then echo "docroot=symlink"; echo "target=$(readlink "$D")"
elif [ -d "$D" ]; then echo "docroot=directory"
elif [ -e "$D" ]; then echo "docroot=other"
else echo "docroot=missing"; fi
if [ -d "$R" ]; then for r in "$R"/*/; do [ -d "$r" ] && echo "release=$(basename "$r")"; done; fi
true`,
  );

  if (output.includes('rsync=missing')) {
    throw new Error(`rsync is not installed on ${config.sshTarget}.`);
  }

  const lines = output.split('\n');
  const value = (key: string) =>
    lines.find((line) => line.startsWith(`${key}=`))?.slice(key.length + 1);
  const releases = lines
    .filter((line) => line.startsWith('release='))
    .map((line) => line.slice('release='.length))
    .filter(isReleaseName)
    .sort();
  const target = value('target');
  const current = target ? path.posix.basename(target) : null;

  return {
    current: current && isReleaseName(current) ? current : null,
    docroot: (value('docroot') ?? 'other') as RemoteState['docroot'],
    releases,
  };
}

/** Moves an existing plain web directory into releases/ once, then symlinks it. */
export async function adoptDocroot(
  config: DreamhostConfig,
  name: string,
): Promise<void> {
  await ssh(
    config,
    `mkdir -p '${config.releasesDir}'
mv '${config.docroot}' '${config.releasesDir}/${name}'
cd '${path.posix.dirname(config.docroot)}'
ln -s '${path.posix.relative(path.posix.dirname(config.docroot), `${config.releasesDir}/${name}`)}' '${path.posix.basename(config.docroot)}'`,
  );
}

async function listRemoteFiles(
  config: DreamhostConfig,
  dir: string,
): Promise<string[]> {
  const output = await ssh(
    config,
    `cd '${dir}' && find . -type f -printf '%P\\n'`,
  );
  return output.split('\n').filter(Boolean);
}

function parseItemized(line: string): { kind: string; file: string } | null {
  // --out-format='%i %n': e.g. "<f.st...... 2026/10/foo/index.html" (a file
  // sent to the server; ">f" when receiving),
  // "*deleting   old/file.html", "cd+++++++++ some/dir/".
  const match = /^(\S+)\s+(.+)$/.exec(line.trim());
  if (!match) {
    return null;
  }
  return { file: match[2] as string, kind: match[1] as string };
}

function isTransferredFile(kind: string): boolean {
  return kind.startsWith('<f') || kind.startsWith('>f');
}

export interface UploadResult {
  changes: ChangeSet;
  transferred: number;
}

// Entries DreamHost places in the web directory itself. `.dh-diag` is a
// root-owned symlink to DreamHost's PHP diagnostics (/dh/web/diag), used by
// their panel and support. It is not part of dist/, so deploys must keep it
// instead of deleting it (direct) or leaving it behind (atomic).
export const PRESERVED_HOST_ENTRIES = ['.dh-diag'];

function rsyncArgs(config: DreamhostConfig, dryRun: boolean): string[] {
  return [
    ...PRESERVED_HOST_ENTRIES.map((entry) => `--filter=P /${entry}`),
    '--archive',
    // Do not keep build mtimes. Astro gives every file a new mtime on each
    // build, and --link-dest only hard-links files whose preserved
    // attributes (including mtime) match, so keeping times made every
    // release a full 600 MB copy. Unchanged files now keep the previous
    // release's mtime (stable Last-Modified/ETag); changed files get the
    // upload time.
    '--no-times',
    '--omit-dir-times',
    '--compress',
    // Astro rewrites every file's mtime on each build; compare content, not
    // timestamps, so unchanged files are recognised (and hard-linked).
    '--checksum',
    '--delete',
    // DreamHost (suEXEC) refuses group/world-writable files and directories.
    '--chmod=D755,F644',
    '--itemize-changes',
    '--out-format=%i %n',
    '-e',
    `ssh ${sshOptions(config).join(' ')}`,
    ...(dryRun ? ['--dry-run'] : []),
  ];
}

export async function uploadRelease(
  config: DreamhostConfig,
  distDir: string,
  localFiles: string[],
  release: string,
  previous: string | null,
  dryRun: boolean,
): Promise<UploadResult> {
  const destination = `${config.releasesDir}/${release}`;
  const changed: string[] = [];

  await run(
    'rsync',
    [
      ...rsyncArgs(config, dryRun),
      ...(previous ? [`--link-dest=${config.releasesDir}/${previous}`] : []),
      // rsync creates only the last path component; make sure releases/ exists.
      '--rsync-path',
      `mkdir -p '${config.releasesDir}' && rsync`,
      `${distDir}/`,
      `${config.sshTarget}:${destination}/`,
    ],
    {
      capture: true,
      onLine: (line) => {
        const item = parseItemized(line);
        if (item && isTransferredFile(item.kind)) {
          changed.push(item.file);
        }
      },
    },
  );

  if (!dryRun && previous) {
    await carryOverHostEntries(config, previous, release);
  }

  const previousFiles = previous
    ? await listRemoteFiles(config, `${config.releasesDir}/${previous}`)
    : [];
  const previousSet = new Set(previousFiles);
  const localSet = new Set(localFiles);

  return {
    changes: {
      added: changed.filter((file) => !previousSet.has(file)),
      changed,
      deleted: previousFiles.filter((file) => !localSet.has(file)),
    },
    transferred: changed.length,
  };
}

/** Recreates DreamHost's own symlinks (PRESERVED_HOST_ENTRIES) in a new release. */
async function carryOverHostEntries(
  config: DreamhostConfig,
  previous: string,
  release: string,
): Promise<void> {
  const from = `${config.releasesDir}/${previous}`;
  const to = `${config.releasesDir}/${release}`;
  await ssh(
    config,
    PRESERVED_HOST_ENTRIES.map(
      (entry) =>
        `if [ -L '${from}/${entry}' ] && [ ! -e '${to}/${entry}' ]; then ln -s "$(readlink '${from}/${entry}')" '${to}/${entry}'; fi`,
    ).join('\n'),
  );
}

export async function verifyRelease(
  config: DreamhostConfig,
  release: string,
  expectedFiles: number,
): Promise<void> {
  const output = await ssh(
    config,
    `cd '${config.releasesDir}/${release}'
for f in index.html 404.html .htaccess; do [ -f "$f" ] || { echo "missing=$f"; }; done
echo "count=$(find . -type f | wc -l)"`,
  );
  const missing = output.match(/^missing=.+$/gm);
  if (missing) {
    throw new Error(`Uploaded release is incomplete: ${missing.join(', ')}`);
  }
  const count = Number(/^count=(\d+)$/m.exec(output)?.[1]);
  if (count !== expectedFiles) {
    throw new Error(
      `Uploaded release has ${count} files, expected ${expectedFiles}.`,
    );
  }
}

/** Atomically points the web directory at a release (rename of a symlink). */
export async function activateRelease(
  config: DreamhostConfig,
  release: string,
): Promise<void> {
  if (!isReleaseName(release)) {
    throw new Error(
      `Refusing to activate unexpected release name "${release}".`,
    );
  }
  const parent = path.posix.dirname(config.docroot);
  const link = path.posix.basename(config.docroot);
  const target = path.posix.relative(
    parent,
    `${config.releasesDir}/${release}`,
  );
  await ssh(
    config,
    `cd '${parent}'
[ -d '${target}' ] || { echo "release ${release} not found" >&2; exit 1; }
[ -L '${link}' ] || [ ! -e '${link}' ] || { echo "${link} is not a symlink" >&2; exit 1; }
ln -sfn '${target}' '.${link}.next'
mv -T '.${link}.next' '${link}'`,
  );
}

export async function removeRelease(
  config: DreamhostConfig,
  release: string,
): Promise<void> {
  if (!isReleaseName(release)) {
    throw new Error(`Refusing to remove unexpected release name "${release}".`);
  }
  await ssh(config, `rm -rf -- '${config.releasesDir}/${release}'`);
}

/** Disk use of the whole releases directory (hard links counted once). */
export async function releasesDiskUsage(
  config: DreamhostConfig,
): Promise<string> {
  const output = await ssh(
    config,
    `du -sh '${config.releasesDir}' 2>/dev/null | cut -f1`,
    true,
  );
  return output.trim() || 'unknown';
}

/** Keeps the newest `keepReleases` releases plus the live one. */
export async function pruneReleases(
  config: DreamhostConfig,
  releases: string[],
  current: string,
): Promise<string[]> {
  const sorted = [...releases].filter(isReleaseName).sort();
  const keep = new Set([...sorted.slice(-config.keepReleases), current]);
  const remove = sorted.filter((release) => !keep.has(release));
  for (const release of remove) {
    await removeRelease(config, release);
  }
  return remove;
}

/** Fallback strategy: rsync straight into the web directory. */
export async function uploadDirect(
  config: DreamhostConfig,
  distDir: string,
  dryRun: boolean,
): Promise<UploadResult> {
  const changed: string[] = [];
  const deleted: string[] = [];
  await run(
    'rsync',
    [
      ...rsyncArgs(config, dryRun),
      `${distDir}/`,
      `${config.sshTarget}:${config.docroot}/`,
    ],
    {
      capture: true,
      onLine: (line) => {
        const item = parseItemized(line);
        if (!item) {
          return;
        }
        if (item.kind === '*deleting' && !item.file.endsWith('/')) {
          deleted.push(item.file);
        } else if (isTransferredFile(item.kind)) {
          changed.push(item.file);
        }
      },
    },
  );
  return {
    // Direct mode cannot tell new files from changed ones cheaply; treating
    // all as changed only means a few extra (harmless) URL purges.
    changes: { added: [], changed, deleted },
    transferred: changed.length,
  };
}
