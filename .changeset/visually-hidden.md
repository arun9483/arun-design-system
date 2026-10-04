---
'@arun-dev/ui': minor
---

Visually hidden text: `.sr-only` moves from the `reset` layer to `utilities`, the last layer, so it wins over a component's own position or size on the same element, and clips with `clip-path: inset(50%)` instead of the deprecated `clip`. New `.sr-only-focusable` hides an element until it, or something inside it, has focus — for skip links.
