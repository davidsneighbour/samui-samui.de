import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  type DocumentationPage,
  listDocumentationPages,
  renderDocumentationPage,
  resolveDocumentationFile,
} from '../scripts/documentation-server';

const tempRoots: string[] = [];

function makeDocumentationRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'samui-docs-'));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, 'content'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'index.md'),
    '# Documentation index\n\n[Taxonomies](content/taxonomies.md)\n',
  );
  fs.writeFileSync(
    path.join(root, 'content', 'taxonomies.md'),
    '# Content taxonomies\n\nTaxonomy notes.\n',
  );
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    fs.rmSync(root, { force: true, recursive: true });
  }
});

describe('documentation server helpers', () => {
  it('resolves root, markdown, and extensionless routes inside documentation', async () => {
    const root = makeDocumentationRoot();

    await expect(resolveDocumentationFile(root, '/')).resolves.toBe(
      path.join(root, 'index.md'),
    );
    await expect(
      resolveDocumentationFile(root, '/content/taxonomies.md'),
    ).resolves.toBe(path.join(root, 'content', 'taxonomies.md'));
    await expect(
      resolveDocumentationFile(root, '/content/taxonomies'),
    ).resolves.toBe(path.join(root, 'content', 'taxonomies.md'));
  });

  it('refuses traversal outside the documentation root', async () => {
    const root = makeDocumentationRoot();

    await expect(
      resolveDocumentationFile(root, '/../package.json'),
    ).resolves.toBeUndefined();
  });

  it('lists pages with route paths and markdown titles', async () => {
    const root = makeDocumentationRoot();

    await expect(listDocumentationPages(root)).resolves.toEqual([
      {
        filePath: path.join(root, 'content', 'taxonomies.md'),
        routePath: '/content/taxonomies.md',
        title: 'Content taxonomies',
      },
      {
        filePath: path.join(root, 'index.md'),
        routePath: '/',
        title: 'Documentation index',
      },
    ]);
  });

  it('renders markdown into a local HTML shell with navigation', () => {
    const page: DocumentationPage = {
      filePath: '/tmp/docs/index.md',
      routePath: '/',
      title: 'Documentation index',
    };

    const html = renderDocumentationPage(
      '# Documentation index\n\n- item\n',
      page,
      [page],
    );

    expect(html).toContain(
      '<title>Documentation index | Documentation</title>',
    );
    expect(html).toContain('<h1>Documentation index</h1>');
    expect(html).toContain(
      '<a href="/" aria-current="page">Documentation index</a>',
    );
    expect(html).toContain('<li>item</li>');
  });
});
