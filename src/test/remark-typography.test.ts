import { remarkDnbTypography } from '@scripts/remark/typography';
import type { Root } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

async function runMarkdown(source: string): Promise<Root> {
  const processor = unified().use(remarkParse).use(remarkDnbTypography);
  return (await processor.run(processor.parse(source))) as Root;
}

function collectValues(tree: Root, type: string): string[] {
  const values: string[] = [];

  function visitNode(node: Root | Root['children'][number]) {
    if (node.type === type && 'value' in node) {
      values.push(String(node.value));
    }

    if ('children' in node) {
      for (const child of node.children) {
        visitNode(child);
      }
    }
  }

  visitNode(tree);
  return values;
}

describe('remarkDnbTypography', () => {
  it('restores Hugo-style dash replacements in prose text', async () => {
    const tree = await runMarkdown('eins --- zwei -- drei - vier');
    const values = collectValues(tree, 'text');

    expect(values).toEqual(['eins \u2014 zwei \u2013 drei - vier']);
  });

  it('leaves code and raw HTML tags/attributes unchanged', async () => {
    const tree = await runMarkdown(
      [
        'Prose --- transformed, `code --- untouched`.',
        '',
        '```txt',
        'fenced --- untouched',
        '```',
        '',
        '<span title="raw --- untouched">raw --- transformed</span>',
        '',
        '<div title="block --- untouched">',
        'block --- untouched',
        '</div>',
      ].join('\n'),
    );

    expect(collectValues(tree, 'text')).toEqual([
      'Prose \u2014 transformed, ',
      '.',
      'raw \u2014 transformed',
    ]);
    expect(collectValues(tree, 'inlineCode')).toEqual(['code --- untouched']);
    expect(collectValues(tree, 'code')).toEqual(['fenced --- untouched']);
    expect(collectValues(tree, 'html')).toEqual([
      '<span title="raw --- untouched">',
      '</span>',
      '<div title="block --- untouched">\nblock --- untouched\n</div>',
    ]);
  });

  it('can be extended with additional ordered replacements', async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkDnbTypography, [{ from: '...', to: '\u2026' }]);
    const tree = (await processor.run(
      processor.parse('Weitere Regeln...'),
    )) as Root;

    expect(collectValues(tree, 'text')).toEqual(['Weitere Regeln\u2026']);
  });
});
