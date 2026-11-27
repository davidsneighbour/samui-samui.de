# Digital relics

Digital relics preserve posts whose essential content or context has been lost. Old age, low relevance, or one broken link alone does not establish this status. Published URLs, original publication dates, source text, and media identifiers remain unchanged. Fu Noi is the first reviewed partial relic.

## Editorial states

`relic` is an optional strict discriminated union, separate from `publisher`, `relevance`, and anniversary curation. Absence means **unreviewed**, not an editorial decision. Unreviewed posts behave as regular posts publicly.

```yaml
relic:
  status: not-relic
  reviewed: 2026-11-27
```

```yaml
relic:
  status: relic
  extent: partial
  reviewed: 2026-11-27
  reason: missing-media
  note: Das ursprünglich eingebundene Video ist nicht mehr verfügbar.
```

`extent` accepts `partial` (some content survives and retains value) or `complete` (the essential content is lost), only on `status: relic`. Omitted extent retains the complete-relic behaviour for compatibility. Use an explicit extent for new reviews.

Both states require a valid calendar review date (`YYYY-MM-DD`). Both allow an optional non-empty `note`. Only `relic` accepts and requires `reason`:

| Reason | Meaning |
| --- | --- |
| `missing-media` | Essential video, audio, or image is missing. |
| `missing-source` | An essential external source has disappeared. |
| `lost-content` | Content was lost through migration or technical failure. |
| `obsolete-context` | The original context cannot be reconstructed. |
| `other` | Another editorial reason; explain it in the note. |

Restoration sets `status: not-relic` with a new review date. Do not remove the block, as that would discard the distinction between reviewed and unreviewed.

## Public presentation

`RelicNotice.astro` contains the German explanation and review date; `RelicIndicator.astro` contains the compact German label and the Lucide `mound-shovel` icon. They use existing muted-panel design tokens. The notice sits below the surviving article body and media and is ignored by Pagefind. Notes are escaped as text.

Relics remain at their original URLs and in chronological and topic/entity archives, with a visible label. `/archiv/relikte/` lists all relics. `/digitale-archaeologie/` is a normal, initially empty MDX page reserved for the future explanation.

Complete relics (including legacy entries without extent) are excluded from the homepage, homepage pagination, related recommendations, previous/next promotion links, RSS, and the sitemap. They receive `noindex,follow`. The relic collection and empty explanation page also receive `noindex` and are excluded from the sitemap. These signals request exclusion from external search engines; they do not prevent direct access or guarantee when a crawler will remove an old result.

Every indexed page carries a derived Pagefind filter: `relic:false` for regular posts and partial relics, and `relic:true` for complete relics. The filter means exclusion from default search, not editorial classification. The separate `relic` metadata remains a boolean for result labels. All three search surfaces (header, archive, and dedicated search page) default to the regular and partial values. Selecting "Auch vollständige digitale Relikte durchsuchen" removes this restriction while preserving other filters. The header places this checkbox in a native "Optionen" disclosure beside the field, so it does not enlarge the navigation row. The checkbox remains selected while that interface remains open; a fresh interface starts unchecked. Both partial and complete relic results display the shared relic indicator.

Only videos confirmed unavailable in the local media history are suppressed on classified relics. Source identifiers remain in the Markdown. Surviving media remains available, and inconclusive checks do not hide players. Cached thumbnails are retained.

## Publisher commands

Use the existing publisher command. Listing never modifies posts:

```bash
npm run publisher -- relic list --status=unreviewed
npm run publisher -- relic list --status=not-relic
npm run publisher -- relic list --status=relic
npm run publisher -- relic list --status=candidate
npm run publisher -- relic list --status=restoration-candidate
```

Review and restoration require one exact post folder and an explicit review date. Obtain editorial approval before changing an existing post's classification. Start with `--dry-run` to review the exact result:

```bash
npm run publisher -- relic review --path=2005/example --status=relic --reviewed=2026-11-27 --reason=missing-media --extent=complete --note="Das Video fehlt." --dry-run
npm run publisher -- relic review --path=2005/example --status=not-relic --reviewed=2026-11-27 --dry-run
npm run publisher -- relic restore --path=2005/example --reviewed=2026-11-27 --dry-run
```

Remove `--dry-run` only when the editorial decision is approved. Review writes preserve the YAML document and original body. There is no bulk classification or deletion command.

## Media history and weekly review

The existing thumbnail ingestion and verification script maintains `src/data/video-media.json`, keyed by `provider:id`. The shared reference parser retains unlisted Vimeo URL hashes. The cache stores provider, identifier, original URL, last known title, description, author, publication date (where the provider supplies it), local thumbnail path, first successful check, last check, last availability, availability state, consecutive failures, and referencing source files. Empty or absent provider fields never replace useful historical values. Thumbnails are never deleted on failure.

New thumbnail ingestion also retrieves oEmbed metadata. `npm run thumbnails:verify` checks all referenced media with a timeout and records observations without editing posts. Successful responses mean available; HTTP 404/410 means unavailable; 401/403 means restricted. Rate limits, other API errors, invalid responses, and network errors mean unknown. Unknown or restricted observations break the consecutive-failure sequence.

Two consecutive confirmed unavailable observations produce a review candidate. Candidate reports use the post's current media references; references retained only in historical metadata cannot create a new candidate. A reviewed `not-relic` post can become a candidate again. A relic whose referenced videos are all available becomes a restoration candidate. Neither report establishes editorial status or proves the entire article has lost or recovered its value. Non-video losses still require manual review.

The existing Monday workflow runs at 06:00 UTC (13:00 Thailand time). It retains the metadata in repository history, publishes the report and metadata as an artefact, and reports persistent failures through the existing issue workflow. It never changes post frontmatter or deletes sources. A workflow run on another branch cannot publish observations to the default branch. Concurrent metadata changes cause a conflict instead of silently overwriting new history. A repository with restricted workflow write permissions must grant the workflow its declared `contents: write` permission for history persistence.

Before local editorial review, obtain the latest retained metadata from the repository or workflow artefact. Do not run repeated checks solely to manufacture a failure threshold. Review the actual sources, surviving text, and historical metadata before deciding.

## Recovery and deletion

Attempt recovery using the last known title, author, media identifier, original URL, preserved thumbnail, repository history (`git log --follow -- <file>`), and archived copies of external pages. Record what can and cannot be recovered. Preserve attribution, avoid inventing missing facts, and confirm reuse rights before importing external copies.

Permanent deletion is governed by [Content preservation](content-preservation.md). Relic classification is reversible and never authorises deletion.

## Partial loss and anniversary curation

Partial relics retain external indexing, sitemap inclusion, and default internal search visibility. Both extents remain in chronological, taxonomy, and relic archives and show a relic notice below the post content, after surviving images and other media. The notice uses a thin border in the existing coral `primary` colour at 60% opacity to distinguish it from the article without giving it a warning treatment. Homepage, RSS, related-post, and previous/next promotion exclusions remain unchanged for both extents. Surviving covers remain visible on partial relics.

Anniversary eligibility remains a separate manual decision: only `curation.anniversary.status: include` permits selection, and complete relics remain ineligible even with an include. The shared `isAnniversaryEligible` utility implements this rule for future anniversary surfaces. Classification and publisher commands do not write or clear curation. Fu Noi has no automatic anniversary approval.

Use [Lost content](../components/lost-content.md) to mark individual missing passages. Preserve corrupted originals in a non-rendered source comment or another durable source record. Do not invent missing words or claim a cause of corruption without evidence. Fu Noi retains its original damaged block in a source comment, its photograph, title, publication date, and permalink.

## Requesting a review

The existing `ss-review` skill handles relic assessment as part of a single-post review. Its [suspected relic guidance](../../.agents/skills/ss-review/SKILL.md#suspected-digital-relics) distinguishes investigation from an approved classification. No separate relic skill is required.

For investigation, say: "Review [URL] as a possible digital relic. Check what survives and whether missing material can be recovered. Recommend partial, complete, or not a relic, with evidence. Review only; do not change the post." A tentative statement such as "this might be a relic" also requests assessment, not a classification change. A general request to rework a post does not itself approve relic classification.

For an editorial decision already made, say: "Mark [URL] as a partial digital relic. Preserve the surviving photograph and damaged source, mark the missing text with LostContent, and add the review metadata and German explanation. Keep the title, publication date, permalink, and anniversary curation unchanged." This explicitly authorises that classification and the requested changes, without another confirmation for the same decision. A materially different classification still needs an editorial decision.

The reviewer reports the recovery checks, confirmed losses, surviving value, uncertainty, proposed reason and extent, and exact changes. If recovery remains uncertain, the existing review state stays unchanged. Neither phrasing authorises permanent deletion, publication, or deployment.
