import fs from 'node:fs';
import path from 'node:path';
import { globSync } from 'glob';
import { parse } from 'yaml';
import { getPostDateParts } from './dates.ts';
import { isCompleteRelic } from './relic.ts';

export function getRelicPaths(root = process.cwd()): Set<string> {
  const paths = new Set(['/archiv/relikte/', '/digitale-archaeologie/']);
  const base = path.join(root, 'src/content/posts');
  for (const file of globSync('**/index.md', { cwd: base })) {
    const source = fs.readFileSync(path.join(base, file), 'utf8');
    const data = parse(/^---\n([\s\S]*?)\n---/.exec(source)?.[1] ?? '') as {
      relic?: { status?: string; extent?: string };
      date: string;
      url?: string;
      slug?: string;
    };
    if (!isCompleteRelic(data?.relic)) continue;
    const { year, monthPadded } = getPostDateParts(new Date(data.date));
    const url =
      data.url?.trim() ||
      `/${year}/${monthPadded}/${data.slug ?? file.split('/').at(-2)}/`;
    paths.add(url.endsWith('/') ? url : `${url}/`);
  }
  return paths;
}
