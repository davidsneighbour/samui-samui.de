# Content-rework state format

## `state.json`

Generated aggregate snapshot.

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-20T00:00:00.000Z",
  "seoRuleset": "2026-07-20",
  "source": {
    "postsGlob": "src/content/posts/**/index.md",
    "tagsGlob": "src/content/tags/**/_index.md",
    "reviewHistory": "ai/reports/contentrework/posts.jsonl"
  },
  "totals": {
    "posts": 0,
    "reviewed": 0,
    "changed": 0,
    "blocked": 0,
    "unreviewed": 0
  },
  "markers": {
    "description": 0,
    "summary": 0,
    "cover": 0,
    "tags": 0,
    "seo": 0,
    "covermigration": 0,
    "flickr": 0
  },
  "otherPublisherKeys": {},
  "frontmatter": {
    "topLevelFlickr": 0,
    "legacyImages": {
      "auto": 0,
      "always": 0,
      "never": 0,
      "unspecified": 0
    },
    "coverTypes": {
      "image": 0,
      "youtube": 0,
      "vimeo": 0,
      "unknown": 0,
      "missing": 0
    }
  },
  "flickrBackup": {
    "pending": 0,
    "postsWithFlickrReferences": 0,
    "uniquePhotoIds": 0,
    "matched": 0,
    "blocked": 0,
    "copied": 0
  },
  "queues": {},
  "currentBatch": null
}
```

## `posts.jsonl`

Append-only history. One JSON object per review event.

```json
{
  "eventId": "uuid",
  "path": "src/content/posts/2005/02/example/index.md",
  "reviewedAt": "2026-07-20T00:00:00.000Z",
  "reviewer": "assistant-or-human",
  "mode": "audit|fix",
  "ruleset": "2026-07-20",
  "queue": "marker:flickr oldest-first",
  "result": "passed|changed|blocked|deferred",
  "markersBefore": {},
  "markersAfter": {},
  "changedFields": [],
  "changedFiles": [],
  "decisions": [],
  "unresolved": [],
  "flickrBackup": {
    "photoIds": [],
    "matchedOriginals": [],
    "copiedFiles": [],
    "manualCandidates": []
  },
  "report": "ai/reports/contentrework/reports/post-id.md",
  "batchId": null
}
```

Never rewrite earlier events to hide changed decisions. Correct them with a
later event.

## Batch file

```json
{
  "id": "2026-07-20-a",
  "openedAt": "2026-07-20T00:00:00.000Z",
  "closedAt": null,
  "status": "open",
  "commitSubject": "content(refactor): content rework",
  "posts": [],
  "changedFiles": [],
  "summary": []
}
```

## Tag registry

```json
{
  "schemaVersion": 1,
  "generatedAt": "",
  "source": {
    "postsGlob": "src/content/posts/**/index.md",
    "tagsGlob": "src/content/tags/**/_index.md"
  },
  "totals": {
    "tags": 0,
    "collectionTags": 0,
    "usedTags": 0
  },
  "tags": [
    {
      "canonical": "Koh Samui",
      "slug": "koh-samui",
      "aliases": [],
      "scope": "",
      "count": 0,
      "firstUsed": "",
      "lastUsed": "",
      "status": "active",
      "replacement": null
    }
  ]
}
```
