# ToDo's

This file is the scratchpad inbox for rough, unclear, or intentionally unprocessed
notes. GitHub Issues are the source of truth for actionable work; see `ROADMAP.md`
for the generated issue index.

## Add notes to assistant intructions

* Analytics is done in the Footer component, because we want it to be loaded last. We accept lost "tracks" if the user leaves the page before the script is loaded. This is a tradeoff for performance and privacy and tracking on this site is merely for technical reasons.

## Add matomo documentation

* Add links to matomo documentation for the tracking code and explaining the tracking code and how to use it. This is important for developers who want to understand how the tracking works and how to implement it correctly.
* [https://developer.matomo.org/guides/tracking-javascript-guide](https://developer.matomo.org/guides/tracking-javascript-guide)
* [https://developer.matomo.org/api-reference/tracking-javascript](https://developer.matomo.org/api-reference/tracking-javascript)
* [http://developer.matomo.org/api-reference/tracking-api](http://developer.matomo.org/api-reference/tracking-api)

## Add search tracking

via matomo: [https://developer.matomo.org/guides/tracking-javascript-guide#internal-search-tracking](https://developer.matomo.org/guides/tracking-javascript-guide#internal-search-tracking)

## Year view in archive overview

Currently:

```plaintext
YYYY        N Beitraege     DOTLIST..
Monate anzeigen             Dropdown
```

Better

```plaintext
YYYY    N Beitraege  DOTLIST..  Dropdown
```

The space each year takes over is too much in my opinion. I would do it in 1 line like above, add a calendar icon to the dropdown on the right. Make the dots slightly larger and add a hover effect to them that shows the MONTH in an overlay (like JFMAMJJASOND).

Remove the lines between the years.

Make it more like a grid than a collection of sections like it is currently.

The colors of the months is currently based on the max numbers of the full archive (21 years) but I would prefer having them based on their own year. So the month with the most posts in a year is the darkest and the month with the least posts is the lightest. This way you can see at a glance which months were more active in a given year. Any other way would mark the recent years too grayed out.
