---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add RangeSlider: a range from–to picked along one track, such as a price filter or a salary band. It is two native `<input type="range">`s, `RangeSlider.StartInput` and `RangeSlider.EndInput`, stacked under `RangeSlider.Root`, so each thumb's keys, steps, slider semantics and form value are the browser's. The Root keeps the start at or below the end, fills the stretch between them, puts the thumb that can still move on top when they meet, and moves the nearer thumb to a press on the track. Each input submits under its own `name`, and `form.reset()` returns the range to where it started. ui draws the track, fill and thumbs (`@arun-dev/ui/css/range-slider`), with `--range-slider-*` tokens.

ui now needs `@arun-dev/headless` 4.28.0 or later.
