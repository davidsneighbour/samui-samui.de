import { describe, expect, it } from 'vitest';
import { findGermanDateIssues } from '../scripts/lint-german-dates';

const citation = (text: string) =>
  `Claim.[^src-test]\n\n[^src-test]: Publisher: ${text}`;

describe('German citation dates', () => {
  it.each([
    ['Sep 23, 2026', '23. September 2026'],
    ['23 Sep 2026', '23. September 2026'],
    ['September 26, 2022', '26. September 2022'],
    ['23. Sept. 2026', '23. September 2026'],
    ['17 August 2026', '17. August 2026'],
    ['6. oktober 2026', '6. Oktober 2026'],
    ['March 3rd, 2026', '3. März 2026'],
  ])('reports %s with a German suggestion', (text, suggestion) => {
    expect(findGermanDateIssues(citation(text))).toEqual([
      { column: 25, line: 3, suggestion, text },
    ]);
  });

  it('accepts full German dates, including dates without a year', () => {
    expect(
      findGermanDateIssues(
        citation('23. September 2026, 3. März, und 6. Oktober.'),
      ),
    ).toEqual([]);
  });

  it('reports continuation lines at their original source position', () => {
    const source =
      '---\ndate: 2026-10-06T15:21:54+07:00\n---\n\nClaim.[^src-test]\n\n[^src-test]: Source.\n    Published Sep 23, 2026.';
    expect(findGermanDateIssues(source)).toEqual([
      {
        column: 15,
        line: 8,
        suggestion: '23. September 2026',
        text: 'Sep 23, 2026',
      },
    ]);
  });

  it('ignores frontmatter, prose outside footnotes, code, linked titles, and URLs', () => {
    const source =
      '---\ntitle: "Sep 23, 2026"\n---\n\nSep 23, 2026.[^src-test]\n\n[^src-test]: [September 26, 2022](https://example.com/September-26-2022), `Sep 23, 2026`.\n\n    ```text\n    Sep 23, 2026\n    ```';
    expect(findGermanDateIssues(source)).toEqual([]);
  });
});
