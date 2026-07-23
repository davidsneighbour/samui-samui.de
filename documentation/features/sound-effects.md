# Sound effects

The site uses [Cuelume](https://github.com/davidsneighbour/cuelume) for optional
browser-side interaction sounds. The dependency points at the vendored local
package in `vendor/cuelume`, built from the reviewed
`davidsneighbour/cuelume` fork commit `ce81ececf18b4ee6cd195404546dfbab31b279fe`.
It is not installed from the npm registry package, because the upstream project
should not be treated as a stable external commitment yet.

Cuelume synthesizes sounds through the Web Audio API and does not require
checked-in audio files. The global setup lives in `src/components/BaseHead.astro`:
it imports `bind`, `play`, and `setEnabled`, calls `bind()` once on load, and
exposes `window.SamuiSound` for components that need imperative playback.

Playback defaults to enabled and persists the footer toggle preference in
`localStorage` under `samui-sound`. If storage, browser activation, or Web Audio
is unavailable, playback falls back to silence. Components should call
`window.SamuiSound?.play(name)` and let Cuelume no-op rather than catching sound
errors locally.

Current sounds:

* The footer renders a Lucide `volume-2` / `volume-x` icon button that toggles
  all future sounds.
* The theme toggle uses `data-cuelume-toggle="bloom"`.
* The contact form plays `loading` when submission starts, then `success` or
  `error` when the visible status message is shown.

The [Cuelume demo](https://cuelume-site.pages.dev/) is the reference for
previewing available sounds.
