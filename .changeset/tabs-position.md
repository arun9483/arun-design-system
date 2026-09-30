---
'@arun-dev/ui': minor
---

Add `position` to `Tabs.Root`: `start` (default) or `end`, which puts the list below the panels
(horizontal) or after them (vertical). It is logical, so it swaps sides in a right-to-left layout.

A horizontal list now scrolls sideways when its tabs outgrow the row, and a vertical list stacks
above or below the panels when the `Tabs.Root` is narrower than 30rem. The list stays first in the
DOM, and a vertical list stays vertical for assistive technology.
