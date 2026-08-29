import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import rehypeRaw from 'rehype-raw';
import mkcert from 'vite-plugin-mkcert';
import redirects from './src/data/redirects.json';
import pagefind from './src/scripts/integrations/pagefind.ts';
import { rehypeLegacyImages } from './src/scripts/rehype/legacy-images.ts';
import { rehypeDnbNotice } from './src/scripts/rehype/notices.ts';
import { rehypeDnbPerson } from './src/scripts/rehype/person-link.ts';
import { rehypeSiteAge } from './src/scripts/rehype/site-age.ts';
import { remarkDnbTypography } from './src/scripts/remark/typography.ts';
import { getNoindexTaxonomyPaths } from './src/utils/taxonomies/noindex.ts';

// `astro dev` only -- `server: { host: true }` (below) makes the dev server
// reachable from other devices on the LAN by IP, and `http://192.168.x.x` is
// not a secure context the way `http://localhost` is, so PWA/service-worker
// testing from a phone needs real HTTPS. `astro build`/`astro preview` are
// unaffected: they're plain `vite`/`vite preview` commands, not `dev`.
const isDevServer = process.argv.includes('dev');
const noindexTaxonomyPaths = getNoindexTaxonomyPaths();

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'assets',
    format: 'directory',
    // @see https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets
    inlineStylesheets: `auto`,
    // assetsPrefix: 'https://cdn.example.com'
  },
  // @ts-expect-error - env variable typing not recognized
  compressHTML: import.meta.env.PROD,

  experimental: {
    chromeDevtoolsWorkspace: true,
    clientPrerender: true,
    contentIntellisense: true,
  },

  image: {
    breakpoints: [640, 750, 828, 1080, 1280],
    // Lets `astro:assets` download and cache YouTube/Vimeo cover
    // thumbnails at build time so they're served from `self` instead of
    // fetched client-side from the provider on every page view (#1670).
    domains: ['i.vimeocdn.com', 'i.ytimg.com'],
    layout: 'constrained',
    objectFit: 'cover',
    objectPosition: 'center',
    responsiveStyles: true,
  },

  integrations: [
    mdx(),
    sitemap({
      // `/seite/2/`, `/seite/3/`, ... are thin duplicates of content already
      // indexed via `/archiv/`, `/themen/`, and individual post permalinks --
      // see documentation/archiv.md's indexing strategy. Page 1 (`/`) is
      // unaffected since it isn't under `/seite/`.
      filter: (page) => {
        const pathname = new URL(page).pathname;
        return (
          !pathname.startsWith('/seite/') && !noindexTaxonomyPaths.has(pathname)
        );
      },
      namespaces: { image: false, news: false, video: false, xhtml: false },
      xslURL: '/feeds/sitemap.xsl',
    }),
    icon({
      iconDir: 'src/assets/icons',
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeComments: { preservePatterns: false },
                removeDoctype: true,
              },
            },
          },
        ],
      },
    }),
    pagefind({ indexConfig: { keepIndexUrl: true } }),
    react(),
  ],

  markdown: {
    // `rehypeRaw` must run first: Astro applies its own `rehype-raw` pass
    // *after* user rehype plugins, so without this, raw HTML `<img>` tags in
    // post bodies (the majority of this site's 20-year archive) would still
    // be unparsed `raw` nodes by the time `rehypeLegacyImages` visits the
    // tree -- see src/scripts/rehype/legacy-images.ts's docstring.
    processor: unified({
      rehypePlugins: [
        rehypeRaw,
        rehypeLegacyImages,
        rehypeDnbNotice,
        rehypeDnbPerson,
        rehypeSiteAge,
      ],
      remarkPlugins: [remarkDnbTypography],
    }),
  },

  output: 'static',
  prefetch: { defaultStrategy: 'viewport', prefetchAll: true },
  redirects: redirects,
  server: { host: true },
  site: 'https://samui-samui.de',

  vite: {
    plugins: [tailwindcss(), isDevServer && mkcert()],
    server: {
      watch: {
        ignored: [
          '**/scratch/**',
          // Root-level UPPERCASE tracking/reference markdown files (project
          // notes, docs, agent instructions) aren't site content and never
          // affect rendered output; ignore them so editing them during
          // `npm run dev` doesn't trigger a reload. Mirrors the scratch/
          // ignore above (see #1351, #1648).
          '**/AGENTS.md',
          '**/CHANGELOG.md',
          '**/CLAUDE.md',
          '**/DESIGN.md',
          '**/PROJECT.md',
          '**/README.md',
          '**/RESUME.md',
          '**/SECURITY.md',
          '**/TODO.md',
        ],
      },
    },
  },
});
