<!-- markdownlint-disable MD013 -->
# Archive multibyte character repair

The archive import replaced some multibyte characters with question marks. Work is tracked in [#1781](https://github.com/davidsneighbour/samui-samui.de/issues/1781); damaged Thai script is separately tracked in [#1706](https://github.com/davidsneighbour/samui-samui.de/issues/1706). Currency migration is documented in [Currency amounts](../components/currency.md).

## Repair decisions

The 2026-10-10 punctuation batch makes 33 targeted substitutions in 18 posts. These are contextual editorial reconstructions, not verified byte-for-byte recovery of the original typography. Possessives, quotation boundaries, parenthetical dashes, a temperature unit, a time range, and the French title prefix have clear contextual roles. The chat quotation repeats the intact film title and dash in the same post. The accented French prefix is inferred from the title wording and both matching post slugs. No words, dates, link targets, or transliteration spellings are rewritten. The obsolete repeated-question-mark grammar exception in "The morning after" is removed.

The replacement ledger uses `\u201C` and `\u201D` for opening and closing curly double quotes because the documentation linter disallows those literal characters. The post files contain the actual Unicode characters.

| Post bundle | Damaged text | Replacement |
| --- | --- | --- |
| `2005/08/erotische-bilder-machen-blind` | `along ??? erotic` | `along — erotic` |
| `2005/08/erotische-bilder-machen-blind` | `campaigners??? calls` | `campaigners’ calls` |
| `2005/09/tsutaya-reinfall-tesko-reinfall` | `???In good company??? ??? ein Film` | `‘In good company’ — ein Film` |
| `2005/11/thaksin-schweigt` | `???Thank you` | `\u201CThank you` |
| `2005/11/thaksin-schweigt` | `year,??? Thaksin` | `year,\u201D Thaksin` |
| `2005/12/das-wetter-2` | `2-5 ??C` | `2-5 °C` |
| `2006/01/mord-und-totschlag` | `Horton???s` | `Horton’s` |
| `2006/02/a-la-coiffeur-de-canine` | `title: ?? la` | `title: À la` |
| `2006/02/a-la-coiffeur-de-canine-ii` | `title: ?? la` | `title: À la` |
| `2006/04/ruecktritt` | `People??s` | `People’s` |
| `2006/09/the-morning-after` | `) ?? [die Armeeführung` | `) --- [die Armeeführung` |
| `2006/10/im-arsch` | `man??s` | `man’s` |
| `2007/08/thailand-vs-vietnam` | `team??s` | `team’s` |
| `2007/11/neuigkeiten` | `... ?? at least` | `... — at least` |
| `2007/11/neuigkeiten` | `who wins?.` | `who wins\u201D.` |
| `2007/11/friedlicher-verstand` | `??Santa Jitto?,` | `\u201CSanta Jitto\u201D,` |
| `2007/11/friedlicher-verstand` | `??He, whose mind is at peace.?` | `\u201CHe, whose mind is at peace.\u201D` |
| `2008/04/nur-am-rande` | `com??è` | `com’è` |
| `2009/06/lawblogger-vs-thai-atm` | `Abhebungen ?? es` | `Abhebungen – es` |
| `2009/06/lawblogger-vs-thai-atm` | `2009 ?? an` | `2009 – an` |
| `2009/06/lawblogger-vs-thai-atm` | `??Fee?` | `„Fee\u201C` |
| `2010/01/ong-bak-3-2` | `??The legend` | `\u201CThe legend` |
| `2010/01/ong-bak-3-2` | `Garuda??s` | `Garuda’s` |
| `2010/01/ong-bak-3-2` | `??Nathayut??` | `\u201CNathayut\u201D` |
| `2010/01/ong-bak-3-2` | `King??s` | `King’s` |
| `2010/01/ong-bak-3-2` | `??Tok??` | `\u201CTok\u201D` |
| `2010/01/ong-bak-3-2` | `showdown.?` | `showdown.\u201D` |
| `2011/01/die-thais-und-der-aberglaube` | `country??s` | `country’s` |
| `2011/01/die-thais-und-der-aberglaube` | `??There must be a coup.?` | `\u201CThere must be a coup.\u201D` |
| `2011/01/die-thais-und-der-aberglaube` | `??Who is going to do it??` | `\u201CWho is going to do it?\u201D` |
| `2011/01/die-thais-und-der-aberglaube` | `??You.?` | `\u201CYou.\u201D` |
| `2011/01/die-thais-und-der-aberglaube` | `fortune ?? and` | `fortune — and` |
| `2011/03/man-fliegt-wieder` | `08.00 ?? 20.00` | `08.00 – 20.00` |

## Remaining runs reviewed

Repeated question marks are not automatically errors. The following inventory lists every remaining post with a run of two or more question marks after the punctuation batch. Frontmatter is included; maintenance comments are excluded. "Preserve" decisions are contextual inferences about intentional punctuation, not proof of the original bytes. Unresolved entries remain unchanged until an intact source or an explicit editorial replacement is available.

| Post bundle | Decision |
| --- | --- |
| `2005/01/von-einem-der-auszog-das-fliegen-zu-erlernen` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2005/02/ich-habe-gewaehlt` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2005/02/the-shutter` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2005/03/die-porno-huette` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2005/03/wochenende` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2005/08/ach-uebrigens` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2005/08/gedanken-zum-tage` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2005/08/mahidol-adulyadej-songkla-nakarind` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2005/09/chatten-auf-thai` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2005/09/socializing-nach-graumeister-art` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2005/11/infiltration` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2005/11/longkhong-3` | Unresolved transliteration or title; original spelling cannot be established from context. |
| `2005/11/longkhong-haa` | Unresolved transliteration or title; original spelling cannot be established from context. |
| `2005/11/you-romantic-man` | Unresolved transliteration or title; original spelling cannot be established from context. |
| `2005/12/letzte-tage` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2006/01/happynewyear` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2006/03/das-neue` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2006/03/meine-verschwoerungstheorie-des-tages` | Unresolved transliteration or title; original spelling cannot be established from context. |
| `2006/06/oleeeeh-oleh-oleh-oleeeh-endzeit` | Preserve unanswered match-table placeholders; do not invent historical scores. |
| `2006/06/oleeeeh-oleh-oleh-oleeeh-runde-2` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2006/06/was-die-prinzessin-sah` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2006/08/ja-wo-laufen-sie-denn` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2006/08/leonardo` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2006/08/vor-dem-regen-ist-nach-dem-regen` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2006/10/vorbereitung` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2006/11/fu-noi` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2006/12/ausgeraucht` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2007/06/thai-fuer-jedermann-i-dies-und-das` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2007/08/die-werte-nachbarschaft` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2008/03/des-bosses-tochter` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2008/05/zurueck-2` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2008/08/endgame` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2009/01/auf-ein-neues-2` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2009/08/das-ramadan-raetsel` | Preserve rhetorical questions, disbelief, or parenthetical doubt. |
| `2011/02/das-jahr-der-karotte` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |
| `2011/04/songkran-yeah` | Unresolved script (Thai or Chinese); recover the original source. Other rhetorical punctuation in these posts is preserved. |

The Chinese greetings in `2009/01/auf-ein-neues-2` and `2011/02/das-jahr-der-karotte` are included here because the Thai-script issue does not cover Chinese. A familiar greeting or a German gloss does not establish the exact historical wording. Single question marks within damaged Thai text also remain under the Thai-script issue; this run inventory is not a complete script inventory.

## Approved verification exception

For this punctuation batch only, the repository owner explicitly approved running and recording language and link checks while leaving their unrelated archive findings unchanged. This extends neither the earlier deferred-ß exception nor the normal requirements for future content edits. The pre-commit hook may be bypassed for this batch after content validation and the production build pass. No check configuration is changed.

## Verification results

The production build, including `astro check`, passed. The targeted language checks reported 84 CSpell findings and 47 LanguageTool findings; Vale reported zero errors, warnings, or suggestions. The targeted link scan checked 22 unique URLs: eight succeeded, one timed out, and the remaining 13 failed. These unrelated findings remain unchanged under the approved exception. Documentation lint, whitespace validation, and direct checks of built HTML for the temperature unit, French title, film title, and time range passed.

A Wayback availability request for the current `2006/03/meine-verschwoerungstheorie-des-tages/` URL returned no archived snapshot. This does not establish that older URL forms lack snapshots; the damaged transliteration remains unresolved.
