# German citation dates

Dates in German post citations use a day followed by a full German month name: `23. September 2026`. The day has a full stop, the month starts with a capital letter, and the year is optional when the context makes it clear. Keep machine-readable frontmatter timestamps in their existing Bangkok format.

## Checks

`npm run lint:german-dates -- src/content/posts/2026/example/index.md` checks one post without changing it. With no paths, `npm run lint:german-dates` audits all content Markdown and MDX. Findings include the source file, line, column, original date, and a suggested German spelling. Findings cause a non-zero exit status; corrections remain editorial decisions.

The pre-commit lint-staged content task runs this check on edited Markdown and MDX. The whole-content audit remains separate from `npm run check`, because inherited citations still contain English dates. [The archive follow-up](https://github.com/davidsneighbour/samui-samui.de/issues/1739) records the current findings and the gate's scope.

The detector checks text in Markdown footnote definitions. It recognises English month names, month-first dates such as `Sep 23`, abbreviated months such as `23. Sept.`, missing day punctuation such as `17 August 2026`, and lower-case month names. It leaves linked source titles, link destinations, code, HTML, blockquotes, frontmatter, and prose outside footnotes unchanged. Original foreign-language article titles should remain linked and unchanged.

This is a date-style lint rule, not a grammar checker, a source fact check, or a calendar validator. It does not reject every possible non-German date format. Expanding it to all prose or introducing language-service grammar suggestions requires a separate scope decision, particularly for quotations and the historical archive.
