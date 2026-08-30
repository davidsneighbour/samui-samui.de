# German umlaut normalisation

The German umlaut normaliser keeps the content archive in UTF-8 text instead of HTML entity workarounds. It is intentionally narrow: it only replaces German umlaut entities and `ß`, not arbitrary HTML entities.

## Commands

Use the check command to find entity forms without changing files:

```bash
npm run lint:umlauts
```

Use the fix command to replace the supported entities:

```bash
npm run lint:umlauts:fix
```

Both commands call `src/scripts/normalize-german-characters.ts`. Without path arguments, the script checks `src/content`. Pass one or more paths to narrow the scope:

```bash
node src/scripts/normalize-german-characters.ts --check src/content/posts/2026
node src/scripts/normalize-german-characters.ts --write src/content/posts/2026/post/index.md
```

## Replacement set

The default replacement set covers named entities:

| Entity | Replacement |
| ------------- | ----------- |
| `&amp;auml;` | `ä` |
| `&amp;ouml;` | `ö` |
| `&amp;uuml;` | `ü` |
| `&amp;szlig;` | `ß` |
| `&amp;Auml;` | `Ä` |
| `&amp;Ouml;` | `Ö` |
| `&amp;Uuml;` | `Ü` |

It also covers the matching decimal numeric entities:

| Entity | Replacement |
| ------------ | ----------- |
| `&amp;#228;` | `ä` |
| `&amp;#246;` | `ö` |
| `&amp;#252;` | `ü` |
| `&amp;#223;` | `ß` |
| `&amp;#196;` | `Ä` |
| `&amp;#214;` | `Ö` |
| `&amp;#220;` | `Ü` |

The script deliberately leaves other entities, such as `&amp;amp;`, unchanged.

## Pre-commit behaviour

The normaliser is wired into `lint-staged` through `src/packages/linting/dnbhq.jsonc`, and is generated into `package.json`. It runs before markdownlint or Biome write to staged Markdown, MDX, Astro, and TypeScript files. This order avoids two tools writing the same file at the same time.

Do not hand-edit `package.json` to change this workflow. Edit the package fragment, then regenerate the root manifest with:

```bash
node src/packages/generate-package.ts
```

## Output

Check mode reports each finding as:

```text
path/from/repo/root.md:line:column  entity -> replacement  |  source line
```

This format is intended to be clickable in terminals such as the VS Code integrated terminal.

## Configuration

The script accepts an optional JSON configuration with `--config`. A custom configuration can add extensions or replacements, but it is merged with the default German umlaut set.

Use a custom configuration only for a focused migration. Routine project checks should use the default replacement set so legitimate non-German HTML entities do not get decoded by accident.

## Tests

Focused coverage lives in `src/test/normalize-german-characters.test.ts`. The tests verify the narrow replacement set, numeric entities, line and column reporting, and the code-line extract used in check output.
