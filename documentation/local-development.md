# Local development

`npm run dev` starts the Astro dev server and the local documentation server.
The Astro side uses the Vite watcher for file changes.

The repository-level `scratch/` directory is ignored by Vite's watcher. It is
reserved for temporary notes, working files, and agent material, so edits there
must not trigger browser reloads or dev-server rebuild work.
