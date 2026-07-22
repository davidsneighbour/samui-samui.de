# Suche

Die Website nutzt [Pagefind](https://pagefind.app/) fuer die statische Suche.
Die UI laeuft ueber die Pagefind Component UI:

* `src/components/Header.astro` rendert die kompakte
  `<pagefind-searchbox>`-Variante als eigenes Masthead-Control rechts neben der
  Textlink-Navigation und vor dem Theme-Schalter. Das Feld nutzt `Finden` als
  Placeholder, die Lucide-Fernglasform als Suchicon und eine helle
  `accent`-Flaeche aus DESIGN.md.
* `src/pages/suche.mdx` bleibt die eigene Suchseite und rendert ueber
  `src/components/PagefindSearchPage.astro` ein zusammengesetztes Interface aus
  Input, Jahr-/Thema-Filtern, Zusammenfassung und Ergebnisliste.
* `src/pages/archiv/index.astro` nutzt ebenfalls eine kompakte
  `<pagefind-searchbox>` fuer die Archivseite.
* `src/styles/theme.css` setzt die Pagefind-Variablen `--pf-*` auf die
  bestehenden DESIGN.md-Farb-, Schrift-, Radius- und Fokuswerte. Neue Farben
  fuer Pagefind duerfen dort nicht frei erfunden werden.

## Index-Cache

Der Astro-Pagefind-Hook in `src/scripts/integrations/pagefind.ts` baut den
Index nicht mehr bei jedem Build neu. Er berechnet stattdessen einen Hash ueber
`src/content/**`, die Pagefind-Version und die Pagefind-Indexkonfiguration.

Wenn der Hash zum lokalen Manifest unter
`node_modules/.astro/pagefind/manifest.json` passt und dort ein Bundle liegt,
wird dieses Bundle nach `dist/pagefind/` kopiert. Wenn das Manifest fehlt, das
Bundle fehlt, die Pagefind-Version wechselt, die Indexkonfiguration wechselt
oder sich `src/content/**` aendert, wird Pagefind neu ausgefuehrt und der Cache
anschliessend aktualisiert.

Manuelle Steuerung:

```bash
npm run build          # normaler Build, nutzt den Pagefind-Cache wenn moeglich
npm run build:nocache  # erzwingt einen neuen Pagefind-Index
npm run clean:pagefind # entfernt Cache und aktuelles dist/pagefind-Bundle
```

Bei Aenderungen an Layouts, Metadaten-Markup, Pagefind-Filterattributen oder
anderen nicht-contentseitigen Suchsignalen sollte `npm run build:nocache`
verwendet werden, weil der automatische Cache-Schluessel bewusst auf
`src/content/**` als primaeren Aenderungsindikator begrenzt ist.
