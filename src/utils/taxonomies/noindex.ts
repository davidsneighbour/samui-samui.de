import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { parseDocument } from 'yaml';
import { taxonomyEntryId } from './ids.ts';

const taxonomyCollections = ['leute', 'orte', 'ereignisse', 'themen'] as const;

function frontmatter(source: string): string | undefined {
  return /^---\n([\s\S]*?)\n---/.exec(source)?.[1];
}

export function getNoindexTaxonomyPaths(root = process.cwd()): Set<string> {
  const paths = new Set<string>();

  for (const collection of taxonomyCollections) {
    const base = path.join(root, 'src/content', collection);
    if (!fs.existsSync(base)) continue;

    for (const file of globSync('**/_index.md', { cwd: base })) {
      const source = fs.readFileSync(path.join(base, file), 'utf8');
      const data = parseDocument(frontmatter(source) ?? '').toJS() as {
        noindex?: boolean;
        slug?: string;
      } | null;
      if (data?.noindex !== true) continue;

      const id = taxonomyEntryId(file);
      const slug = collection === 'themen' ? (data.slug ?? id) : id;
      paths.add(`/${collection}/${slug}/`);
    }
  }

  return paths;
}
