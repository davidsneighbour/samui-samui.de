import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import redirects from './src/data/redirects.json';
import pagefind from './src/scripts/integrations/pagefind.ts';

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
  ],
  output: 'static',
  prefetch: { defaultStrategy: 'viewport', prefetchAll: true },
  redirects: redirects,
  server: { host: true },
  site: 'https://samui-samui.de',

  vite: {
    plugins: [tailwindcss()],
  },
});
