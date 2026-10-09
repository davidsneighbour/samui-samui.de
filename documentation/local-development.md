# Local development

`npm run dev` starts the Astro dev server and the local documentation server. The Astro side uses the Vite watcher for file changes. It uses Astro's normal logging level by default; run `npm run dev:verbose` when the site server needs Astro's verbose output and frontmatter debugging.

Node.js 26 is the required runtime major for this repository. This is an explicit project requirement, not a temporary exception to a rolling LTS policy. A move to another Node major requires a separate compatibility review and an explicit decision. The decision is tracked in [#1741](https://github.com/davidsneighbour/samui-samui.de/issues/1741).

Use the Node.js version pinned in `.nvmrc` (`v26.10.0`). The generated `package.json` `engines.node` field uses `^26.0.0`, accepting compatible Node 26 releases while excluding Node 27. Runtime requirements belong in `src/packages/build/package.jsonc`; regenerate the root manifest after changing that fragment and keep the root lockfile metadata and `.nvmrc` aligned. Use the npm version bundled with the selected Node release. Do not infer a separate npm version pin from the local installation.

The repository-level `scratch/` directory is ignored by Vite's watcher. It is reserved for temporary notes, working files, and agent material, so edits there must not trigger browser reloads or dev-server rebuild work.

Use `npm run dev:site` when only the Astro site server is needed, and `npm run dev:site:verbose` for the same server with Astro's verbose output.
