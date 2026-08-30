# Component structure

`src/components/` is grouped by topic. New components must live inside one of these folders rather than at the component root:

* `content/` for post, taxonomy, editorial, date, person, and embed rendering.
* `features/` for user-facing feature surfaces such as analytics, comments, contact, search, timeline, and weather.
* `layout/` for shared page shell pieces such as the document head, header, footer, and navigation.
* `ui/` for small design-system primitives that can be reused by content, features, and layouts.

Feature-specific support files should stay with their feature. For example, the life-timeline controller, camera, and marker components live with `LifeTimelineMap.tsx` in `src/components/features/life-timeline/`.
