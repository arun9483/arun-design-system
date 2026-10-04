---
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `Stack` and `Grid`. `Stack` lays children in one line, down or across, with a `gap` from the spacing scale, plus `align`, `justify` and `wrap`. `Grid` lays them in equal columns: a fixed `columns` count, or as many as fit at `minItemSize` (at most `columns`), responsive with no breakpoints. The new `Space` type names the gap steps. Tokens: `--grid-columns`, `--grid-min-item-size` and `--grid-gap`.
