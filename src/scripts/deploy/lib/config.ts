// Shared configuration for the DreamHost + Cloudflare deployment scripts.
// See documentation/hosting/deployment.md#secrets-and-configuration.
//
// Values come from the environment. A local, git-ignored `.env` in the
// project root is loaded first (CI sets real environment variables instead).
// Nothing machine-specific or secret is committed.
import fs from 'node:fs';
import path from 'node:path';

export const PROJECT_ROOT = path.resolve(import.meta.dirname, '../../../..');
export const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
export const DEFAULT_SITE_URL = 'https://samui-samui.de';
export const ZONE_NAME = 'samui-samui.de';

let envLoaded = false;

export function loadEnv(): void {
  if (envLoaded) {
    return;
  }
  envLoaded = true;
  const envFile = path.join(PROJECT_ROOT, '.env');
  if (fs.existsSync(envFile)) {
    // Never overrides variables that are already set (CI, shell exports).
    process.loadEnvFile(envFile);
  }
}

export function env(name: string): string | undefined {
  loadEnv();
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function requireEnv(name: string, hint: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`${name} is not set. ${hint}`);
  }
  return value;
}

export function siteUrl(): string {
  return (env('SITE_URL') ?? DEFAULT_SITE_URL).replace(/\/+$/, '');
}

// --- DreamHost --------------------------------------------------------------

export type DeployStrategy = 'atomic' | 'direct';

export interface DreamhostConfig {
  /** `user@host`, or an SSH config alias when DREAMHOST_USER is unset. */
  sshTarget: string;
  /** Web directory configured in the DreamHost panel, e.g. /home/u/site/public. */
  docroot: string;
  /** Sibling directory holding the atomic releases. */
  releasesDir: string;
  keepReleases: number;
  strategy: DeployStrategy;
  /** Optional ssh_config file (`ssh -F`), e.g. written by CI. */
  sshConfigFile?: string;
}

const HOST_PATTERN = /^[A-Za-z0-9][A-Za-z0-9.-]*$/;
const USER_PATTERN = /^[a-z_][a-z0-9_-]*$/;
// Deliberately narrow: no spaces, quotes, globbing, or shell metacharacters,
// so the value can be used in remote shell commands without escaping games.
const SAFE_PATH_PATTERN = /^\/[A-Za-z0-9._/-]+$/;

/**
 * Validates the remote document root before anything with `--delete` or
 * `rm -rf` touches the server. Rejects empty, relative, shallow, or unusual
 * paths so a typo can never point a deletion at the home directory or
 * another site.
 */
export function validateDocroot(docroot: string, user?: string): string {
  const reasons: string[] = [];
  if (!SAFE_PATH_PATTERN.test(docroot)) {
    reasons.push('must be an absolute path of [A-Za-z0-9._/-] only');
  }
  if (docroot.endsWith('/')) {
    reasons.push('must not end with "/"');
  }
  const segments = docroot.split('/').filter(Boolean);
  if (segments.some((segment) => segment === '..' || segment === '.')) {
    reasons.push('must not contain "." or ".." segments');
  }
  if (docroot.includes('//')) {
    reasons.push('must not contain "//"');
  }
  if (segments[0] !== 'home' || segments.length < 4) {
    reasons.push(
      'must look like /home/<user>/<site>/<web-dir> (at least four levels deep)',
    );
  }
  if (user && segments[1] !== user) {
    reasons.push(`must be inside /home/${user}/`);
  }
  if (reasons.length > 0) {
    throw new Error(
      `Refusing DREAMHOST_PATH "${docroot}": ${reasons.join('; ')}.`,
    );
  }
  return docroot;
}

export function dreamhostConfig(): DreamhostConfig {
  const host = requireEnv(
    'DREAMHOST_HOST',
    'Set it to the DreamHost server name or an SSH config alias.',
  );
  if (!HOST_PATTERN.test(host)) {
    throw new Error(`Refusing DREAMHOST_HOST "${host}".`);
  }
  const user = env('DREAMHOST_USER');
  if (user && !USER_PATTERN.test(user)) {
    throw new Error(`Refusing DREAMHOST_USER "${user}".`);
  }
  const docroot = validateDocroot(
    requireEnv(
      'DREAMHOST_PATH',
      'Set it to the web directory, e.g. /home/<user>/samui-samui.de/public.',
    ),
    user,
  );
  const strategy = (env('DREAMHOST_DEPLOY_STRATEGY') ?? 'atomic') as string;
  if (strategy !== 'atomic' && strategy !== 'direct') {
    throw new Error(
      `DREAMHOST_DEPLOY_STRATEGY must be "atomic" or "direct", not "${strategy}".`,
    );
  }
  const keepReleases = Number(env('DREAMHOST_KEEP_RELEASES') ?? 5);
  if (!Number.isInteger(keepReleases) || keepReleases < 2) {
    throw new Error('DREAMHOST_KEEP_RELEASES must be an integer >= 2.');
  }
  const sshConfigFile = env('DREAMHOST_SSH_CONFIG');
  if (sshConfigFile && !SAFE_PATH_PATTERN.test(sshConfigFile)) {
    throw new Error(`Refusing DREAMHOST_SSH_CONFIG "${sshConfigFile}".`);
  }
  return {
    docroot,
    keepReleases,
    ...(sshConfigFile ? { sshConfigFile } : {}),
    releasesDir: path.posix.join(path.posix.dirname(docroot), 'releases'),
    sshTarget: user ? `${user}@${host}` : host,
    strategy,
  };
}

// --- Cloudflare --------------------------------------------------------------

export interface CloudflareConfig {
  apiToken: string;
  zoneId?: string;
}

export function cloudflareConfig(): CloudflareConfig {
  const zoneId = env('CLOUDFLARE_ZONE_ID');
  return {
    apiToken: requireEnv(
      'CLOUDFLARE_API_TOKEN',
      'Create a scoped token (documentation/hosting/deployment.md#cloudflare-api-token).',
    ),
    ...(zoneId ? { zoneId } : {}),
  };
}
