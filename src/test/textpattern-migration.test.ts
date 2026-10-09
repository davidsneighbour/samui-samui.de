import fs from 'node:fs/promises';
import { glob } from 'glob';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

describe('Textpattern archive migration', () => {
  it('keeps opening, closing, escaped, and malformed tags out of content', async () => {
    const files = await glob('src/content/**/*.{md,mdx}');
    const remaining: string[] = [];
    for (const file of files) {
      const source = await fs.readFile(file, 'utf8');
      if (/<\/?txp:/i.test(source)) remaining.push(file);
    }
    expect(remaining).toEqual([]);
  });

  it('preserves the long dialogue inside one multi-paragraph footnote', async () => {
    const source = await fs.readFile(
      'src/content/posts/2007/01/sex-oder-auch-nicht/index.md',
      'utf8',
    );
    const tree = unified().use(remarkParse).use(remarkGfm).parse(source);
    const notes = tree.children.filter(
      (node) => node.type === 'footnoteDefinition',
    );
    expect(notes).toHaveLength(1);
    expect(notes[0]?.children).toHaveLength(12);
    expect(JSON.stringify(notes[0])).toContain('Kamera zoomt ins Schwarze.');
    expect(JSON.stringify(notes[0])).toContain('Waschmaschine');
  });

  it('restores only existing local images with useful alternative text', async () => {
    const files = await glob('src/content/posts/**/index.md');
    let images = 0;
    for (const file of files) {
      const source = await fs.readFile(file, 'utf8');
      for (const match of source.matchAll(
        /<img src="(\/wp-content\/old-images\/[^\"]+)" alt="([^\"]+)" loading="lazy" \/>/g,
      )) {
        await expect(fs.access(`public${match[1]}`)).resolves.toBeUndefined();
        expect(match[2]).not.toBe('Historisches Beitragsbild');
        images++;
      }
    }
    expect(images).toBeGreaterThanOrEqual(9);
  });
});
