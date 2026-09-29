---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Tabs, following the WAI-ARIA tabs pattern.

`@arun-dev/headless/tabs` exports `Tabs.Root`, `List`, `Tab` and `Panel`. Tabs are native
`<button role="tab">`s, each paired with a `role="tabpanel"` by a shared `value`, with the ids
that wire them generated. The list is a single Tab stop (roving tabindex): arrows move along
`orientation`, wrapping, with Home and End, skipping disabled tabs and swapping Left and Right in
right-to-left layouts. `activationMode` is `automatic` (focus selects) or `manual` (Enter, Space
or a click). Root owns `value` / `defaultValue` / `onValueChange`; panels stay mounted and are
`hidden` while unselected.

`@arun-dev/ui` styles every part, with an indicator on the selected tab for both orientations.
`@arun-dev/ui` now requires `@arun-dev/headless` >= 4.6.0. `@arun-dev/tokens` adds the `--tabs-*`
component tokens.
