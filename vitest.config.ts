import { getViteConfig } from 'astro/config';

// Reuses astro.config.ts's vite config (path aliases, plugins) so test files
// can import via the same `@utils/*` etc. aliases as the rest of the app.
export default getViteConfig({
  test: {
    include: ['src/test/**/*.test.ts'],
  },
});
