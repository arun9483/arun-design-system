---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `Drawer`: a modal panel that slides in from an edge and closes with a swipe. It is a Dialog at an edge — `Drawer.Root`, `Trigger`, `Title` and `Close` are Dialog's parts, and `Drawer.Popup` is Dialog's popup with a `side` (`bottom` by default, `top`, `left`, `right`, emitted as `data-side`) and swipe to close. A swipe past a quarter of the drawer's size, or a fast flick, requests a close through `onOpenChange`; scrolling content inside scrolls first. While dragged, the element has `data-swiping` and `--drawer-swipe`. `@arun-dev/ui` requires `@arun-dev/headless` 4.20.0 or later. Tokens: `--drawer-*`.
