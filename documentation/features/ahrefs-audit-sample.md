# Ahrefs audit sample

The Ahrefs audit sampler creates a bounded, rotating URL sample from the built XML sitemap. It is for Ahrefs Site Audit projects where a full crawl would use too many crawl credits.

The production build runs the sampler after Astro finishes:

```bash
npm run build
```

The generated file is written to:

```text
dist/ahrefs-audit-sample.txt
```

After deployment, use the production URL list at:

```text
https://samui-samui.de/ahrefs-audit-sample.txt
```

The file contains one URL per line and can be used as an Ahrefs custom URL list.

## Commands

Generate the sample from an existing `dist/sitemap-index.xml`:

```bash
npm run audit:ahrefs
```

Preview the sample without writing the output file or updating rotation history:

```bash
npm run audit:ahrefs:dry
```

## Configuration

The configuration lives in:

```text
src/scripts/audit/ahrefs-audit-sample.config.json
```

The sampler supports:

* `sitemaps`: local sitemap files or remote sitemap URLs.
* `outputFile`: generated URL-list path, relative to the project root.
* `historyFile`: rotation-state path, relative to the project root.
* `localSitemapDirectory`: optional build-output directory used to resolve same-origin sitemap links without a network request.
* `randomSeed`: fixed seed for reproducible test output, or `null` to use the current date.
* `maxUrls`: hard upper bound for the generated list.
* `permanentUrls`: URLs that appear in every sample.
* `siteUrl`: public site origin used when mapping same-origin sitemap index children to local files.
* `groups`: ordered sampling groups with `name`, `count`, `include`, and `exclude` regular expressions.

Groups are evaluated in order. Once one group selects a URL, later groups do not select it again. The history file makes unseen URLs preferred before older URLs are reused.

## Ahrefs settings

Use the generated list with these Ahrefs Site Audit settings:

```text
URL sources
    Website                 disabled
    Auto-detected sitemaps  disabled
    Specific sitemaps       disabled
    Custom URL list         enabled

Crawl
    Max depth from seed     0
    Max internal pages      slightly above sampler maxUrls
```

With the default `maxUrls` value of `350`, set Ahrefs' maximum internal pages to approximately `350` or `375`.
