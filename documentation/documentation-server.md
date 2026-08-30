# Documentation server

The repository includes a small local documentation server for reading `documentation/**/*.md` as HTML in a browser or in VS Code's Simple Browser.

Run it by itself:

```bash
npm run dev:docs
```

The default URL is:

```text
http://127.0.0.1:4322/
```

`documentation/index.md` is served as the landing page. Other Markdown files are served from their documentation-relative paths, so `documentation/content/taxonomies.md` is available at:

```text
http://127.0.0.1:4322/content/taxonomies.md
```

Extensionless routes also work for convenience:

```text
http://127.0.0.1:4322/content/taxonomies
```

The server renders Markdown with the same core libraries already used by the site tooling: `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, and `hast-util-to-html`. It is intentionally a local reader, not a second website build, so it does not hydrate Astro components or load the public site design system.

The sidebar navigation lists all Markdown documentation pages and groups them by documentation area: Components, Content, Features, and Repository. Files at the documentation root belong to Repository.

`npm run dev` starts both the Astro dev server and the documentation server. Use the split scripts when only one side is needed:

```bash
npm run dev:site
npm run dev:docs
```

Override the documentation server host or port with environment variables:

```bash
DOCS_HOST=127.0.0.1 DOCS_PORT=4332 npm run dev:docs
```

The same values can be passed as flags when running the script directly:

```bash
node src/scripts/documentation-server.ts --host 127.0.0.1 --port 4332
```
