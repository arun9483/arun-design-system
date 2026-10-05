---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `TreeView`: a hierarchy moved through with the arrow keys, by the WAI-ARIA tree pattern. `TreeView.Root` is a `<ul role="tree">` holding the selection (`value`, `multiple`) and the open Items (`expanded`); `TreeView.Item` is an `<li role="treeitem">` with a `label`, and nested Items make it a parent, rendered only while it is open. One Tab stop; ↓ ↑ move, → ← open, close and move between levels (swapped right to left), Home, End, `*` and typeahead. Enter, Space or a click selects; with `multiple`, Shift with an arrow and Ctrl/⌘+A too. `@arun-dev/ui` requires `@arun-dev/headless` 4.22.0 or later. Tokens: `--tree-view-*`, and `--color-text-primary` on `--color-bg-accent` joins the contrast requirements every brand meets.

`ToggleGroup` no longer reports a changed `defaultValue` on every re-render when it has none.
