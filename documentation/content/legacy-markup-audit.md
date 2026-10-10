# Legacy markup audit

Verified on 10 October 2026 against all 2,083 Markdown and MDX files under `src/content/`, the current rendering pipeline, and the local production output. The unsupported-markup findings in this inventory have been resolved or moved to a focused follow-up. Cleanup is tracked in [the remaining-markup issue](https://github.com/davidsneighbour/samui-samui.de/issues/1804). Ordinary external links and all Markdown image destinations were not tested for link rot. SoundCloud privacy and its future media-component integration remain tracked in [the SoundCloud review issue](https://github.com/davidsneighbour/samui-samui.de/issues/1805).

File links open the source at the recorded line in VS Code. Line numbers describe the audit snapshot and can shift as you edit the articles.

## Supported components

The content audit also found supported `<dnb-map>`, `<dnb-notice>`, `<dnb-person>`, `<dnb-youtube>`, and the imported MDX `<SamuiLifeBar>` component. Their transforms or component registrations exist. They are excluded from the broken-legacy inventory. Ordinary links, tables, emphasis, Thai spans, and working local images are also excluded.
