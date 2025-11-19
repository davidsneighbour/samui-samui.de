[![Netlify](https://img.shields.io/netlify/49963b4d-bb9f-411f-a9b8-521a5e3a2b42?color=%2300AD9F&logo=netlify&style=for-the-badge)](https://app.netlify.com/sites/samui-samui-de/deploys)

# samui-samui.de

Astro + Tailwind starter powering the next version of samui-samui.de and built for deployment on Netlify's SSR platform.

## Getting started

1. Install dependencies: `npm install`
2. Start the local dev server: `npx astro dev` (or `npm run dev`)

## Available scripts

- `npm run dev` – start the Astro dev server with hot reload
- `npm run build` – generate the production build for Netlify
- `npm run preview` – preview the production build locally
- `npm run deploy` – deploy the current build to Netlify using the CLI

## Deployment

Netlify builds run `npm run build` and publish from `dist`. Server rendering is handled by the Netlify adapter configured in `astro.config.mjs`.
