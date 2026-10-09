// Checks that dist/ is a complete Astro build before it is uploaded with
// `--delete`. A half-written or wrong directory must never replace the live
// site.
import fs from 'node:fs';
import path from 'node:path';

// Files every production build of this site contains. If one is missing,
// the build failed or dist/ is something else.
const REQUIRED_FILES = [
  'index.html',
  '404.html',
  '.htaccess',
  'rss.xml',
  'sitemap-index.xml',
  'pagefind/pagefind-entry.json',
];

// A full build has ~2,800 HTML pages. Far fewer means a partial build (for
// example an aborted `astro build` that still left some output behind).
const MINIMUM_HTML_FILES = 1000;

export interface DistStats {
  files: string[];
  htmlFiles: number;
  totalBytes: number;
}

export function listFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        files.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  };
  walk(root);
  return files.sort();
}

export function validateDist(distDir: string): DistStats {
  if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
    throw new Error(
      `Build directory ${distDir} does not exist. Run the build first.`,
    );
  }

  const missing = REQUIRED_FILES.filter(
    (file) => !fs.existsSync(path.join(distDir, file)),
  );
  if (missing.length > 0) {
    throw new Error(
      `${distDir} does not look like a complete Astro build; missing: ${missing.join(', ')}.`,
    );
  }

  const files = listFiles(distDir);
  const htmlFiles = files.filter((file) => file.endsWith('.html')).length;
  if (htmlFiles < MINIMUM_HTML_FILES) {
    throw new Error(
      `${distDir} contains only ${htmlFiles} HTML files (expected at least ${MINIMUM_HTML_FILES}); refusing to deploy a partial build.`,
    );
  }

  const index = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  if (!index.includes('<link rel="canonical" href="https://samui-samui.de/"')) {
    throw new Error(
      'dist/index.html has no canonical link to https://samui-samui.de/ -- was it built with the production site URL?',
    );
  }

  const totalBytes = files.reduce(
    (sum, file) => sum + fs.statSync(path.join(distDir, file)).size,
    0,
  );

  return { files, htmlFiles, totalBytes };
}
