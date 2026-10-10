# Currency amounts

The shared currency enhancement replaces damaged Textpattern Baht fragments tracked in [#1781](https://github.com/davidsneighbour/samui-samui.de/issues/1781). It uses one ECB EUR/THB reference rate from [Frankfurter](https://frankfurter.dev/) for both directions. It provides orientation, with no fees or transaction-rate calculation.

## Authoring

Plain Markdown supports explicit inline markup, with a machine-readable decimal amount and an unchanged visible label:

```html
<dnb-currency amount="1000" currency="THB">฿1.000</dnb-currency>
<dnb-currency amount="25" currency="EUR">25 €</dnb-currency>
```

Astro and MDX can import `src/components/content/currency/Currency.astro` and use `<Currency amount={1000} currency="THB" />`. An optional slot preserves custom display wording. Only finite amounts and THB/EUR are supported. Arbitrary prose is never scanned for amounts. Plain-Markdown authors must supply a complete original label; it remains visible without JavaScript. Invalid runtime attributes remain plain text.

## Behaviour

The shared footer loads the browser module, which detects explicit elements on initial load and after each Astro navigation. Pages without elements make no exchange-rate request. Converted hints use German number formatting, `ca.`, two decimal places for EUR, and whole Baht for THB. The original amount remains primary. A usable rate enables the dotted underline, focusable trigger, and shared tooltip controller, including hover, focus, tap-to-focus, and Escape dismissal. Touch users can dismiss by tapping elsewhere.

`src/utils/currency/conversion.ts` owns pure arithmetic and formatting. `rate.ts` owns response validation, optional Local Storage, expiry, and a shared in-flight request. `client.ts` creates the shared tooltip markup only after a usable conversion exists. No hard-coded fallback rate exists.

The versioned key `samui-samui:currency:eur-thb:v1` stores version, rate, rateDate, fetchedAt, provider, and source. Freshness uses fetchedAt: under 24 hours is fresh; under seven days is usable immediately while one refresh runs. Expired entries are removed on access. Invalid responses never replace valid stale data. Storage failures use memory. A browser document attempts at most one refresh, including failures, across client-side navigation; a reload creates a new service. Requests omit credentials and referrers and time out after ten seconds. Only valid rates can enhance content.

CSP adds only `https://api.frankfurter.dev` to `connect-src` in `public/.htaccess`. The privacy notice documents that direct browser request, technical IP disclosure, storage contents, and retention. No preconnect or speculative fetch is added.

## Migration inventory

The four remaining damaged amounts were inspected individually: laundry (160 THB), motorcycle return (500 THB), helmet fine (600 THB), and smoking fine (2000 THB). Historical context and handwritten Euro comparisons remain in place. The required per-post language checks also corrected a few clear spelling, case, and quotation errors; local exceptions preserve deliberate informal wording and the already tracked damaged Thai quotation. The mandatory link check identified the dead Yahoo source in Helmpflicht; its original URL is retained in a source comment, and a visible source-availability note replaces the broken link.

The other eight locations in the issue's Baht list currently contain no currency amount or widget: Rückenmassage, Station 10, Pokki, Das Neue, Tausend Tage Samui, January wallpaper, Tag 60, and Familienphotos. No amount is inferred for them. The issue's intact-tag example, Phii Pop, currently contains plain `35.000 Baht (rund 800 Euro)` and no widget. Repository discovery found no intact Textpattern Baht tags or legacy currency implementation to remove. The old Yahoo Finance URL in Dies und das is an ordinary source link, not a widget.

The issue stays open for unrelated archive damage. Browser regression checks and unit tests cover the currency feature; production deployment is separate from local verification.
