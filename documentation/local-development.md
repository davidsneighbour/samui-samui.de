# Local development

`npm run dev` starts the Astro dev server and the local documentation server. The Astro side uses the Vite watcher for file changes. It uses Astro's normal logging level by default; run `npm run dev:verbose` when the site server needs Astro's verbose output and frontmatter debugging.

Use the Node.js version pinned in `.nvmrc`. The generated `package.json` `engines.node` field mirrors the same runtime requirement, and runtime changes belong in the package fragments under `src/packages/` before regenerating the root manifest.

The repository-level `scratch/` directory is ignored by Vite's watcher. It is reserved for temporary notes, working files, and agent material, so edits there must not trigger browser reloads or dev-server rebuild work.

Use `npm run dev:site` when only the Astro site server is needed, and `npm run dev:site:verbose` for the same server with Astro's verbose output.
