import {
  DEFAULT_CONFIG,
  findOccurrences,
  formatOccurrence,
  normalizeContent,
} from '@scripts/normalize-german-characters';
import { describe, expect, it } from 'vitest';

describe('normalize-german-characters', () => {
  it('reports named and numeric umlaut entities with file, line, and code context', () => {
    const occurrences = findOccurrences(
      'src/content/post.md',
      ['Ein &uuml;bler Test.', 'Noch ein &#196;rgernis.'].join('\n'),
      DEFAULT_CONFIG.replacements,
    );

    expect(occurrences).toEqual([
      {
        column: 5,
        context: 'Ein &uuml;bler Test.',
        file: 'src/content/post.md',
        line: 1,
        match: '&uuml;',
        replacement: 'ü',
      },
      {
        column: 10,
        context: 'Noch ein &#196;rgernis.',
        file: 'src/content/post.md',
        line: 2,
        match: '&#196;',
        replacement: 'Ä',
      },
    ]);
    expect(formatOccurrence(occurrences[0]!)).toBe(
      'src/content/post.md:1:5  &uuml; -> ü  |  Ein &uuml;bler Test.',
    );
  });

  it('writes only the supported German umlaut replacements', () => {
    expect(
      normalizeContent(
        'Schon &Auml;rger mit &ouml;den &uuml;bungen, &#223;, und &amp;.',
        DEFAULT_CONFIG.replacements,
      ),
    ).toBe('Schon Ärger mit öden übungen, ß, und &amp;.');
  });

  it('passes check mode after write mode normalises the content', () => {
    const normalised = normalizeContent(
      'Ein &Uuml;berblick.',
      DEFAULT_CONFIG.replacements,
    );

    expect(
      findOccurrences(
        'src/content/post.md',
        normalised,
        DEFAULT_CONFIG.replacements,
      ),
    ).toEqual([]);
  });
});
