# German orthography and grammar

This document records how the German content archive is checked for spelling, house orthography, and grammar. It also records what was decided and why. Update it whenever a rule, dictionary, or tool in this pipeline changes.

The design follows a layered approach: a dictionary decides what is *allowed*, explicit house rules decide what is *preferred*, and a grammar engine checks sentences without owning spelling policy. No single tool does all three well.

| Layer | Tool | Command | Owns |
| --- | --- | --- | --- |
| Spelling | CSpell with `@cspell/dict-de-de` | `npm run lint:spell` | Unknown words and typos |
| House orthography | Vale with the `SamuiDE` style | `npm run lint:orthography` | Preferred variants, reformed ß/ss, broken characters |
| Grammar | LanguageTool (local server) | `npm run lint:grammar` | Agreement, commas, case, repeated words, typography |

## When the checks run

* **Pre-commit (staged content):** every staged `src/content/**/*.md` file goes through all three layers. Content that is edited or added must pass at once: when a post is touched, its existing findings are fixed in the same commit. `src/scripts/lint-content-language.ts` runs CSpell, Vale, and the grammar check one after the other and fails at the end, so all findings in a post show in one run (lint-staged would otherwise stop the other tasks after the first failure). The grammar check starts LanguageTool in Docker when it is not running, which adds about 10 seconds to the first commit; the container then keeps running until `npm run languagetool:stop`.
* **`npm run check:full`:** runs `check` and every archive-wide check (`lint:spell`, `lint:orthography`, `lint:grammar`, `lint:german-dates`, `lint:links`). It does not stop at a failure and prints a summary, so the archive baseline can be fixed step by step. A full run takes about seven minutes, mostly for the link check.
* **`npm run check` and pre-push:** not included, because the untriaged archive baseline would block every push. See [Quality gates](../quality-gates.md).

MDX content is not part of the pre-commit language check (Vale does not lint MDX here; see below).

## House orthography policy

The archive uses **reformed ß/ss spelling** together with **traditional spellings of Greek and Latin loanwords**. The policy is derived from the archive itself, not from a historical standard. Counts are word matches in content prose (frontmatter, code, URLs, and image names excluded), measured on 2026-10-08:

| Modern form | Count | Traditional form | Count | House form |
| --- | ---: | --- | ---: | --- |
| dass | 1,965 | daß | 2 | dass |
| muss | 426 | muß | 0 | muss |
| Foto | 9 | Photo | 53 | Photo |
| Fotos | 18 | Photos | 69 | Photos |
| Grafik(en) | 0 | Graphik(en) | 6 | Graphik |
| Potenzial | 0 | Potential | 3 | Potential |
| selbstständig | 0 | selbständig | 5 | selbständig |
| Fantasie | 1 | Phantasie | 2 | Phantasie |
| Delfin* | 0 | Delphin* | 4 | Delphin |
| Telefon | 25 | Telephon | 4 | not enforced (strict profile only) |
| platzieren | 1 | plazieren | 0 | not enforced (strict profile only) |

The pre-reform `de-DE-1901` standard was therefore **not** adopted as the acceptance baseline: it would reject `dass` and `muss` thousands of times, which contradicts how the archive is written. "Traditional" on this site means the loanword spellings above, which the current Duden still permits as variants.

To change the policy, edit the Vale rules described below, update the table above, and update the regression tests in `src/test/german-orthography.test.ts`.

## Spelling layer

`npm run lint:spell` runs CSpell over `src/**/*.{md,mdx}`. The configuration is split:

* The root `cspell` block in `package.json` (generated from `src/packages/linting/cspell.jsonc`) imports the English and German configurations and sets `language: en,de`. Before this was set, the German import overrode the language to `de` and no `de` dictionary was installed, so neither English nor German words were recognised (207,602 findings).
* `src/config/cspell/cspell.de.jsonc` imports `@cspell/dict-de-de` (licence LGPL-3.0) and defines two local word lists and three ignore patterns.

Word lists in `src/config/cspell/`:

| File | Purpose |
| --- | --- |
| `samuisamui-de.dict.txt` | Project vocabulary: people, places, Thai terms, product names, and spelling variants the Duden accepts (for example `kucken`, `gibts`). |
| `samuisamui-de-traditional.dict.txt` | Traditional house forms that `@cspell/dict-de-de` does not know (`Photoapparat`, `Stengel`). Most traditional variants are already in the upstream dictionary, so they are not repeated here. |
| `samuisamui-en.dict.txt` | English project vocabulary. |

Ignore patterns in `cspell.de.jsonc`:

* `frontmatter-key`: lowercase YAML keys such as `lastmod:` or `covermigration:`.
* `frontmatter-slug`: lowercase list items such as taxonomy IDs (`- thaksin-shinawatra`).
* `html-tag`: inline HTML tags and their attributes, including legacy `<txp:…>` tags.

### Triage rule for unknown words

Do not add every flagged word to a word list. Classify it first:

1. Valid German that the dictionary does not know, or a traditional house form → `samuisamui-de-traditional.dict.txt` (house forms) or `samuisamui-de.dict.txt` (other valid words).
2. A name, place, Thai term, or product → `samuisamui-de.dict.txt`.
3. A deliberate one-off spelling, for example in a quotation → a local `<!-- cspell:ignore word -->` comment in the post.
4. An actual error → leave it flagged and fix the post.

Words that stay flagged on purpose include pre-reform or non-standard forms such as `abend` (in "heute abend"), `zuviel`, `immernoch`, `Terasse`, `Hundebabies`, and `Elephanten`.

## House orthography layer

`npm run lint:orthography` runs Vale (pinned through the `@vvago/vale` npm package, which downloads the matching official binary with a checksum on install) over `src/content`. The configuration is `.vale.ini`; rules live in `.vale/styles/SamuiDE/`:

| Rule | Level | What it reports |
| --- | --- | --- |
| `HouseSpelling.yml` | error | Modern loanword variants: `Foto*` → `Photo*`, `Fotograf*` → `Photograph*`, `Grafik*` → `Graphik*`, `-grafie` → `-graphie`, `Delfin*`, `Fantasie`, `Potenzial`, `-enziell` → `-entiell`, `selbstständig`, `Stängel`, `Megafon`, `Saxofon`, `Xylofon`. |
| `HouseSpellingStrict.yml` | suggestion | Optional strict profile: `Telefon` → `Telephon`, `Mikrofon` → `Mikrophon`, `platzieren` → `plazieren`. Hidden by default. |
| `ReformedEszett.yml` | error | A curated list of pre-reform ß forms: `daß`, `muß`, `wußte`, `läßt`, `Fluß`, `Schluß`, `Schloß`, `miß-`, and others. |
| `BrokenEszett.yml` | error | `?` between letters (`Stra?e`, `gro?e`). Earlier archive imports replaced `ß` with `?`. |

Show the strict profile:

```bash
npm run lint:orthography -- --minAlertLevel=suggestion
```

Check one post or folder:

```bash
npx vale src/content/posts/2026
```

Rule-writing notes:

* Substitution keys are regular expressions. Keep the first letter's case in the key (`Foto` and `foto` are separate keys), or capture it (`([Ss])elbstständig`), so the suggestion keeps the right case.
* When keys overlap, Vale prefers the longer match. `Fotografieren` therefore becomes `Photographieren`, not `Photografieren`. A regression test covers this.
* Never add generic character rules such as `ss → ß` or `f → ph`. Both directions depend on the word, so each entry must be lexical.
* Vale does not match inside longer compounds (`Müllfoto` is not reported). Add a compound explicitly if it matters.
* Proper names that contain a modern spelling go into `TokenIgnores` in `.vale.ini` (for example `Fantastischen Vier`). For a one-off exception, wrap the passage in `<!-- vale off -->` and `<!-- vale on -->`.
* MDX is not linted, because Vale needs the external `mdx2vast` parser for it and the archive has only one MDX file.

## Grammar layer

`npm run lint:grammar` runs `src/scripts/lint-grammar.ts` against a local LanguageTool HTTP server. Start and stop the server with Docker:

```bash
npm run languagetool:start   # erikvl87/languagetool:6.8 on 127.0.0.1:8010
npm run lint:grammar -- src/content/posts/2026
npm run languagetool:stop
```

`npm run lint:grammar` also starts the default server by itself when it is not reachable. Set `LANGUAGETOOL_URL` to use another server; a custom URL is never started automatically. Without arguments the script checks all Markdown in `src/content`, which takes about one minute for the whole archive. It prints `file:line:column  RULE_ID  text -> suggestion  (message)` and exits with code 1 when there are findings, or with code 2 when the server cannot be reached or started (for example when Docker is not available).

How the script works:

* It parses each post with remark and sends LanguageTool [annotated text](https://languagetool.org/http-api/): prose is `text`, everything else is `markup`. LanguageTool then reports offsets in the original file, so no offset mapping is needed.
* Frontmatter, code blocks, HTML, block quotes (quoted text by other authors), footnote definitions (source citations), images, and link targets are markup. Inline code is passed as its literal value, and `--`/`---` as the dashes that `src/scripts/remark/typography.ts` renders.
* Legacy Textpattern tags such as `<txp:gho_permalink>` are not valid CommonMark HTML, so remark keeps them in text. The script treats them as markup.

LanguageTool is the grammar layer only. Rules that conflict with the other layers are removed:

| Rule or category | Handling | Reason |
| --- | --- | --- |
| `GERMAN_SPELLER_RULE` | disabled | CSpell owns spelling. |
| Category `EMPFOHLENE_RECHTSCHREIBUNG` (for example `F_ANSTATT_PH`, `Z_ANSTATT_T`) | disabled | Recommends `Grafik`, `Potenzial`, and `Fantasie`, which contradicts the house spelling. |
| `OLD_SPELLING_RULE` | kept only when the match contains `ß` | Its ß/ss findings (`daß` → `dass`) agree with the house policy. Its loanword findings (`Photo` → `Foto`) do not. |
| `IGNORED_TEXTS` (for example `Kung Fu` in the film title "Kung Fu Hustle") | match dropped when its exact text is listed | Proper names keep their official spelling. This is the grammar-layer equivalent of `TokenIgnores` in `.vale.ini`. |
| Per-post `grammar-ignore` comment | match dropped when its rule ID and exact text are listed in the same post | Intentional informal style in one post. See below. |

### Per-post exceptions for informal style

Some rules flag the blog's informal voice rather than errors, for example `ERSTE_PERSON_SIN_OHNE_E` (`bastel` → `bastele`), `RAN_RUM_RAUF_REIN_RAUS_RUNTER_NEU` (`rumgespielt` → `herumgespielt`), `DE_REPEATEDWORDS_NUN`, `GERMAN_WORD_REPEAT_BEGINNING_RULE`, `DOPPELTES_AUSRUFEZEICHEN` (`!!`), and `AUF_ARBEIT`. These rules stay active, so new text is still checked. When a flagged passage is intentional, keep it and add an exception to the post, one comment per passage, on its own line at the end of the post (like `cspell:ignore`):

```markdown
<!-- grammar-ignore ERSTE_PERSON_SIN_OHNE_E bastel -->
<!-- grammar-ignore RAN_RUM_RAUF_REIN_RAUS_RUNTER_NEU rumgespielt -->
```

The comment takes the rule ID and the exact text that LanguageTool reports, without leading or trailing spaces. It drops only matches with that rule ID and that text in that post. Use it only for intentional style. Fix real errors (commas, agreement, case, separated verb prefixes) instead.

These rule IDs were found by running LanguageTool 6.8 on sample sentences in the house style, not guessed. To disable another rule after reviewing its findings across the archive, add its ID to `DISABLED_RULES` in `src/scripts/lint-grammar.ts` and record the reason in the table above. Typography rules (`AUSLASSUNGSPUNKTE_LEERZEICHEN`, `EINHEIT_LEERZEICHEN`) are currently kept, because they give valid German typography advice.

When fixing `AUSLASSUNGSPUNKTE_LEERZEICHEN`, use LanguageTool's own suggestion: a no-break space (U+00A0) followed by the ellipsis character (`…`, U+2026), for example `und und und …`. The no-break space keeps the ellipsis on the same line as the word before it. Typography shortcuts such as `---` are expanded at build time, but `...` is not, so the ellipsis is written as the real character.

LanguageTool also has limits. For example, it did not report the agreement error in "Der Mann gehen nach Hause". A clean result does not prove that a text is grammatical.

## Regression tests

`npm run test` covers both custom layers:

* `src/test/german-orthography.test.ts` runs the pinned Vale binary on sample text. It checks accepted house forms, forbidden modern variants, pre-reform ß forms, broken characters, compound handling, `TokenIgnores`, the hidden strict profile, and code and link exclusions.
* `src/test/german-grammar.test.ts` checks that the annotation covers every source character, that only prose reaches LanguageTool, and that match filtering and line/column mapping are correct. It does not need a running server.

## Baseline

Measured on 2026-10-08 across `src/content`:

| Check | Findings |
| --- | ---: |
| `lint:spell` | 8,451 in 1,568 files (207,602 before the German dictionary and ignore patterns) |
| `lint:orthography` | 923 errors (870 broken ß, 47 house spelling, 6 pre-reform ß) |
| `lint:grammar` | 5,738 in 2,073 files |

The most frequent grammar rules are `AUSLASSUNGSPUNKTE_LEERZEICHEN`, `UPPERCASE_SENTENCE_START`, `DOPPELTES_AUSRUFEZEICHEN`, `DE_CASE`, and comma rules.

## Research items not adopted

The pipeline is based on a research comparison of German proofreading tools. These parts were not implemented:

* **Hunspell or Aspell `de-DE-1901`**: the archive uses reformed ß/ss spelling, so a 1901 dictionary would reject correct text. CSpell with the modern dictionary already accepts the traditional loanword variants.
* **Modernised shadow copy for LanguageTool**: needed only when the house style is fully pre-reform. Disabling the conflicting rules gives the same result without offset mapping.
* **Typos**: Vale already covers the finite list of variant substitutions.
* **nlprule, SoMaJo, HanTa, DEMorphy, spaCy, Stanza**: lemma-aware rules are not necessary while the Vale word lists stay small.
* **AI adjudication or a fine-tuned ByT5/mT5 model**: not deterministic enough for a quality gate. Consider these only for ambiguous findings, and never let them rewrite protected house forms.

## Next steps

Tracked in [#1774](https://github.com/davidsneighbour/samui-samui.de/issues/1774):

* Fix the remaining broken `ß` characters. On 2026-10-08, 261 posts were repaired and committed (`BrokenEszett` went from 870 to 365 findings in 179 posts). The repair method: each `?` was restored from intact spellings of the same word elsewhere in the archive, checked against the German dictionary, and reviewed in context; word-final cases (`wei?`, `gro?`) were reviewed by hand, because they mix with real question marks. The remaining posts have their repair saved in a local stash and are blocked by dead links, see [#1780](https://github.com/davidsneighbour/samui-samui.de/issues/1780).
* Repair the other characters the same import broke (quotes, dashes, apostrophes, transliterated names, Textpattern baht tags), see [#1781](https://github.com/davidsneighbour/samui-samui.de/issues/1781). Broken Thai script is tracked in [#1706](https://github.com/davidsneighbour/samui-samui.de/issues/1706).
* Work through the remaining `npm run check:full` failures, then decide which checks can join `npm run check`.
