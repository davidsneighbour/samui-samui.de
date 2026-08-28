# Quality gates

Npm quality-gate scripts follow the DNB naming model so command names describe
what kind of confidence they provide.

`check` is the top-level non-mutating umbrella command. It runs formatting
checks, static analysis, strict validation, and behaviour tests:

```bash
npm run check
```

The current `check` sequence is:

1. `format:check` -- Biome verifies canonical formatting without writing files.
2. `lint` -- Biome, markdownlint, and the German umlaut entity check inspect
   style, conventions, and likely mistakes.
3. `validate` -- strict project contracts. Today this delegates to
   `validate:content`, which runs `astro check`.
4. `test` -- Vitest verifies behavioural correctness.

Use `lint` for static analysis and prose/code conventions, not for exact
contracts. Use `validate` for strict contracts, schemas, required metadata,
types, and content collection conformance. Use `test` for behavioural
correctness. Use `audit` for security, dependency, workflow, performance,
accessibility, or other risk inspection if those checks are added later.

Mutating commands must be named explicitly. `format` writes canonical formatting,
`lint:*:fix` applies safe lint fixes, and `*:write` or `*:update` commands may
write generated output, dependency updates, caches, or policy files. Do not hide
mutating commands under `check`, `lint`, `validate`, `test`, or `audit`.

`lint:spell` remains intentionally separate from `check` because the inherited
content archive produces a large number of known spelling hits that are not part
of the routine quality gate.

`lint:links` is also intentionally separate from `check` during the archive
refactor. It runs Lychee against `src/content` only, can be narrowed with
`npm run lint:links -- src/content/path`, and is wired into lint-staged for
staged content Markdown/MDX files so touched posts do not add new broken links.

`lint:umlauts` checks Markdown, MDX, and Astro content for the narrow German
umlaut entity set. `lint:umlauts:fix` applies the same replacements and is wired
into lint-staged before markdownlint or Biome write to the same staged files.
See [German umlaut normalisation](content/german-umlaut-normalisation.md) for
the replacement set, output format, and configuration notes.
