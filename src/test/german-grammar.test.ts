import { describe, expect, it } from 'vitest';
import {
  type AnnotationPart,
  isRelevantMatch,
  type LanguageToolMatch,
  toAnnotation,
  toFindings,
} from '../scripts/lint-grammar';

const source = (parts: AnnotationPart[]) =>
  parts.map((part) => ('text' in part ? part.text : part.markup)).join('');

const prose = (parts: AnnotationPart[]) =>
  parts
    .map((part) => ('text' in part ? part.text : (part.interpretAs ?? '')))
    .join('');

const match = (
  offset: number,
  length: number,
  id: string,
  category = 'GRAMMAR',
): LanguageToolMatch => ({
  length,
  message: 'message',
  offset,
  replacements: [{ value: 'fix' }],
  rule: { category: { id: category }, id },
});

describe('German grammar annotation', () => {
  const markdown = [
    '---',
    'title: Ein Titel',
    '---',
    '',
    '## Überschrift',
    '',
    'Das ist **fett** mit `Code` und [Link](https://example.com) --- gut.',
    '',
    '> Ein Zitat bleibt außen vor.',
    '',
    '```js',
    'const x = 1;',
    '```',
    '',
    'Siehe <txp:gho_permalink id="1">hier</txp:gho_permalink>.[^src-a]',
    '',
    '[^src-a]: Eine Quelle.',
    '',
  ].join('\n');
  const parts = toAnnotation(markdown);

  it('covers every source character so offsets stay exact', () => {
    expect(source(parts)).toBe(markdown);
  });

  it('sends only prose, with rendered dashes and inline code', () => {
    expect(prose(parts)).toBe(
      'Überschrift\n\nDas ist fett mit Code und Link — gut.\n\nSiehe hier.',
    );
  });
});

describe('German grammar match filtering', () => {
  const text = 'Ich weiß, daß das Photo gut ist.';

  it('drops spelling and modern-variant recommendations', () => {
    expect(isRelevantMatch(match(0, 3, 'GERMAN_SPELLER_RULE'), text)).toBe(
      false,
    );
    expect(
      isRelevantMatch(
        match(18, 5, 'F_ANSTATT_PH', 'EMPFOHLENE_RECHTSCHREIBUNG'),
        text,
      ),
    ).toBe(false);
  });

  it('drops matches on ignored proper names', () => {
    expect(
      isRelevantMatch(match(1, 7, 'DE_COMPOUNDS'), '"Kung Fu Hustle"'),
    ).toBe(false);
    expect(isRelevantMatch(match(0, 12, 'DE_COMPOUNDS'), 'Original Ton')).toBe(
      true,
    );
  });

  it('drops matches listed as a per-post exception', () => {
    const post =
      'Ich bastel was.\n\n<!-- grammar-ignore ERSTE_PERSON_SIN_OHNE_E bastel -->\n';
    expect(isRelevantMatch(match(4, 6, 'ERSTE_PERSON_SIN_OHNE_E'), post)).toBe(
      false,
    );
    // The same text under another rule, or without the comment, stays.
    expect(isRelevantMatch(match(4, 6, 'DE_CASE'), post)).toBe(true);
    expect(
      isRelevantMatch(
        match(4, 6, 'ERSTE_PERSON_SIN_OHNE_E'),
        'Ich bastel was.',
      ),
    ).toBe(true);
    // Some rule IDs contain a hyphen.
    expect(
      isRelevantMatch(
        match(9, 15, 'KLEINE_-CHEN'),
        'Ein paar kleine Lämpchen.\n<!-- grammar-ignore KLEINE_-CHEN kleine Lämpchen -->',
      ),
    ).toBe(false);
  });

  it('keeps old-spelling matches only for pre-reform ß', () => {
    expect(isRelevantMatch(match(10, 3, 'OLD_SPELLING_RULE'), text)).toBe(true);
    expect(isRelevantMatch(match(18, 5, 'OLD_SPELLING_RULE'), text)).toBe(
      false,
    );
  });

  it('maps offsets to 1-based lines and columns', () => {
    expect(
      toFindings([match(14, 3, 'DE_AGREEMENT')], 'Erste Zeile.\nDer Mann.'),
    ).toEqual([
      {
        column: 2,
        line: 2,
        message: 'message',
        ruleId: 'DE_AGREEMENT',
        suggestion: 'fix',
        text: 'er ',
      },
    ]);
  });
});
