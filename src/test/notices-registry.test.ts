import path from 'node:path';
import {
  clearNoticeRegistryCache,
  getNoticeSlugs,
  loadNoticeRegistry,
} from '@utils/notices/registry';
import { beforeEach, describe, expect, it } from 'vitest';

const fixturesDir = path.join(process.cwd(), 'src/test/fixtures/notices');

beforeEach(() => {
  clearNoticeRegistryCache();
});

describe('loadNoticeRegistry', () => {
  it('loads and validates a well-formed registry file', () => {
    const registry = loadNoticeRegistry(path.join(fixturesDir, 'valid.yaml'));
    expect(Object.keys(registry).sort()).toEqual([
      'beispiel-hinweis',
      'beispiel-korrektur',
    ]);
    expect(registry['beispiel-hinweis']).toMatchObject({
      icon: 'info',
      title: 'Beispiel',
      variant: 'note',
    });
    expect(registry['beispiel-korrektur']?.dismissible).toBe(true);
  });

  it('resolves a valid slug from the real project registry', () => {
    const registry = loadNoticeRegistry();
    expect(registry['flickr-nicht-mehr-verwendet']).toBeDefined();
    expect(registry['flickr-nicht-mehr-verwendet']?.icon).toBe('camera-off');
  });

  it('exposes sorted slugs for the real project registry', () => {
    const slugs = getNoticeSlugs();
    expect(slugs).toContain('flickr-nicht-mehr-verwendet');
    expect(slugs).toEqual([...slugs].sort());
  });

  it('throws an actionable error for a missing required field', () => {
    expect(() =>
      loadNoticeRegistry(path.join(fixturesDir, 'invalid-schema.yaml')),
    ).toThrow(/description/i);
  });

  it('throws an actionable error for duplicate registry keys', () => {
    expect(() =>
      loadNoticeRegistry(path.join(fixturesDir, 'duplicate-slug.yaml')),
    ).toThrow(/unique/i);
  });

  it('throws an actionable error for an unsupported Lucide icon name', () => {
    expect(() =>
      loadNoticeRegistry(path.join(fixturesDir, 'invalid-icon.yaml')),
    ).toThrow(/unbekanntes-symbol.*unsupported lucide icon/is);
  });

  it('throws for a registry file that does not exist', () => {
    expect(() =>
      loadNoticeRegistry(path.join(fixturesDir, 'does-not-exist.yaml')),
    ).toThrow(/not found/i);
  });
});
