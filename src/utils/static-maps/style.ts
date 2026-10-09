// The cartographic contract is documented in DESIGN.md. No article overrides.
export const staticMapStyle = {
  coastline: '#6b6250',
  coastlineWidth: 1,
  halo: '#f1ecd8',
  labelGap: 16,
  labelSize: 20,
  land: '#f1ecd8',
  latinFont: 'public/assets/webfonts/400/regular/panton-regular-webfont.ttf',
  marker: '#b8402f',
  markerRadius: 6,
  route: '#b8402f',
  routeWidth: 3,
  text: '#2b2929',
  thaiFont:
    'node_modules/@fontsource-variable/anuphan/files/anuphan-thai-wght-normal.woff2',
  version: 1,
  water: '#e5dfc7',
} as const;
