// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import redirects from './src/data/redirects.json';
import icon from 'astro-icon';
import pagefind from './src/scripts/integrations/pagefind.ts';

// https://astro.build/config
export default defineConfig({
  // @ts-expect-error - env variable typing not recognized
  compressHTML: import.meta.env.PROD,
  redirects: redirects,
  output: 'static',
  prefetch: { defaultStrategy: 'viewport', prefetchAll: true },
  server: { host: true },
  build: {
    format: 'directory',
    assets: 'assets',
    // @see https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets
    inlineStylesheets: `auto`,
    // assetsPrefix: 'https://cdn.example.com'
  },
  site: 'https://samui-samui.de',

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
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  experimental: {
    chromeDevtoolsWorkspace: true,
    clientPrerender: true,
    contentIntellisense: true,
    preserveScriptOrder: true,
  },

  image: {
    breakpoints: [640, 750, 828, 1080, 1280],
    layout: 'constrained',
    objectFit: 'cover',
    objectPosition: 'center',
    responsiveStyles: true,
  },

});
