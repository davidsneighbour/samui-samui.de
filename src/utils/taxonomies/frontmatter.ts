import fs from 'node:fs';
import { parseDocument } from 'yaml';

/**
 * Extracts the raw YAML frontmatter block (without the `---` fences) from a
 * Markdown source string, or `undefined` when the file has none.
 */
export function readFrontmatter(source: string): string | undefined {
  return /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
}

/**
 * Reads and parses a Markdown file's YAML frontmatter directly from disk,
 * without going through `astro:content` -- used by code that runs outside
 * Astro's content-collection pipeline (build-time validation scripts,
 * remark/rehype plugins loaded by `astro.config.ts` before collections
 * exist). Returns `{}` for a file with no frontmatter block.
 */
export function readYamlFrontmatter(file: string): Record<string, unknown> {
  const source = fs.readFileSync(file, 'utf8');
  const frontmatter = readFrontmatter(source);
  if (!frontmatter) return {};
  return (parseDocument(frontmatter).toJS() ?? {}) as Record<string, unknown>;
}
