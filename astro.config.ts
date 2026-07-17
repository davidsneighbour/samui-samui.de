import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import mkcert from 'vite-plugin-mkcert';
import redirects from './src/data/redirects.json';
import pagefind from './src/scripts/integrations/pagefind.ts';

// `astro dev` only -- `server: { host: true }` (below) makes the dev server
// reachable from other devices on the LAN by IP, and `http://192.168.x.x` is
// not a secure context the way `http://localhost` is, so PWA/service-worker
// testing from a phone needs real HTTPS. `astro build`/`astro preview` are
// unaffected: they're plain `vite`/`vite preview` commands, not `dev`.
const isDevServer = process.argv.includes('dev');

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
    layout: 'constrained',
    objectFit: 'cover',
    objectPosition: 'center',
    responsiveStyles: true,
  },

  integrations: [
    mdx(),
    sitemap({
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
  output: 'static',
  prefetch: { defaultStrategy: 'viewport', prefetchAll: true },
  redirects: redirects,
  server: { host: true },
  site: 'https://samui-samui.de',

  vite: {
    plugins: [tailwindcss(), isDevServer && mkcert()],
  },
});
