import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import { describe, expect, it } from 'vitest';

// Once any page carries `data-pagefind-body`, Pagefind indexes only pages
// that carry it. Two pages used it in 2026 and the whole archive dropped out
// of the search (page_count: 2). Site chrome is excluded with
// `data-pagefind-ignore` in the shared layout instead.
describe('Pagefind indexing scope', () => {
  it('no source file sets data-pagefind-body', () => {
    const offenders = globSync('src/**/*.{astro,md,mdx,ts,tsx}', {
      ignore: ['src/test/**'],
    }).filter((file) =>
      readFileSync(file, 'utf8').includes('data-pagefind-body'),
    );
    expect(offenders).toEqual([]);
  });
});
