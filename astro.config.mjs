// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';

import netlify from '@astrojs/netlify';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), alpinejs()],
  adapter: netlify(),

  vite: {
    plugins: [tailwindcss()],
  },
});