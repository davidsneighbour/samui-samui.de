# Local development

`npm run dev` starts the Astro dev server and the local documentation server.
The Astro side uses the Vite watcher for file changes.

Use the Node.js version pinned in `.nvmrc`. The generated `package.json`
`engines.node` field mirrors the same runtime requirement, and runtime changes
belong in the package fragments under `src/packages/` before regenerating the
root manifest.

The repository-level `scratch/` directory is ignored by Vite's watcher. It is
reserved for temporary notes, working files, and agent material, so edits there
must not trigger browser reloads or dev-server rebuild work.
