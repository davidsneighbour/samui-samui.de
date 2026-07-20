import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { isValidLucideIconName, listLucideIconNames } from './icons';
import { type NoticeRegistry, noticeRegistrySchema } from './schema';

export const DEFAULT_REGISTRY_PATH = path.join(
  process.cwd(),
  'src/data/notices.yaml',
);

let cachedRegistry: NoticeRegistry | undefined;
let cachedRegistryPath: string | undefined;

function formatZodIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

/**
 * Loads, parses, and validates the notice registry YAML file. Invalid
 * shapes, duplicate slugs, or unsupported Lucide icon names all throw a
 * single actionable `Error` that fails the Astro dev/build process rather
 * than silently producing a partial registry.
 */
export function loadNoticeRegistry(
  registryPath = DEFAULT_REGISTRY_PATH,
): NoticeRegistry {
  if (cachedRegistry && cachedRegistryPath === registryPath)
    return cachedRegistry;

  let raw: string;
  try {
    raw = readFileSync(registryPath, 'utf8');
  } catch (cause) {
    throw new Error(`Notice registry not found at ${registryPath}.`, { cause });
  }

  let parsed: unknown;
  try {
    // `uniqueKeys` is the yaml package's default, kept explicit here since
    // duplicate slugs must be a hard build error (see task spec).
    parsed = parseYaml(raw, { uniqueKeys: true });
  } catch (cause) {
    throw new Error(
      `Failed to parse notice registry at ${registryPath}: ${(cause as Error).message}`,
      { cause },
    );
  }

  const result = noticeRegistrySchema.safeParse(parsed ?? {});
  if (!result.success) {
    throw new Error(
      `Invalid notice registry at ${registryPath}:\n${formatZodIssues(result.error.issues)}`,
    );
  }

  const iconErrors: string[] = [];
  for (const [slug, notice] of Object.entries(result.data)) {
    if (!isValidLucideIconName(notice.icon)) {
      iconErrors.push(
        `  - "${slug}": unsupported Lucide icon "${notice.icon}"`,
      );
    }
  }
  if (iconErrors.length > 0) {
    throw new Error(
      `Invalid notice registry at ${registryPath} -- unsupported Lucide icon name(s):\n${iconErrors.join('\n')}\n` +
        `See https://lucide.dev/icons for valid names (kebab-case), e.g. ${listLucideIconNames().slice(0, 5).join(', ')}, ...`,
    );
  }

  cachedRegistry = result.data;
  cachedRegistryPath = registryPath;
  return result.data;
}

export function getNoticeSlugs(registryPath = DEFAULT_REGISTRY_PATH): string[] {
  return Object.keys(loadNoticeRegistry(registryPath)).sort();
}

// Test-only escape hatch: production code never needs to reload the
// registry mid-process, but tests exercise multiple fixture files.
export function clearNoticeRegistryCache(): void {
  cachedRegistry = undefined;
  cachedRegistryPath = undefined;
}
