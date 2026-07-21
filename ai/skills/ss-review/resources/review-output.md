# Single-post review output contract

Return this structure.

## Post

* Path:
* Title:
* Date:
* Review mode:
* SEO ruleset:
* Primary topic:
* Likely search intent:

## Decision summary

| Area | Result | Action |
| --- | --- | --- |
| Source/frontmatter | pass/fail/decision | concise action |
| Title | pass/fail/decision | concise action |
| Description | pass/fail/decision | concise action |
| Summary | pass/fail/decision | concise action |
| Language/body | pass/fail/decision | concise action |
| Links | pass/fail/decision | concise action |
| Taxonomien | pass/fail/decision | concise action |
| Cover | pass/fail/decision | concise action |
| Cover migration | pass/fail/decision | concise action |
| Flickr | pass/fail/decision | concise action |
| SEO | pass/fail/decision | concise action |
| Editorial note | pass/fail/decision | concise action |

## Proposed or applied changes

List exact field and content changes. Include character counts for `description` and `summary`.

## Taxonomy decision

* Existing canonical topics retained:
* Topics removed:
* Canonical topics added:
* New topic proposals:
* Registry changes required:

## Image decision

* Cover:
* Body images:
* Best-source/provenance concerns:
* Manual work:

## Publisher markers

```yaml
add:
  marker: reason
keep:
  marker: reason
remove:
  marker: acceptance criteria satisfied
```

Omit empty groups.

## Unresolved decisions

List only items needing user judgement or external/manual recovery.

## State record

Provide the compact data needed by `ss-refactor`:

```json
{
  "path": "",
  "reviewedAt": "",
  "ruleset": "2026-07-20",
  "result": "passed|changed|blocked",
  "markersAdded": [],
  "markersKept": [],
  "markersRemoved": [],
  "changedFields": [],
  "unresolved": []
}
```
