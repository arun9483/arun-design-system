---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Tooltip, a short label shown beside an element on hover or keyboard focus.

`@arun-dev/headless/tooltip` exports `Tooltip.Root`, `Trigger` and `Popup`. The popup is a native
`popover="manual"` with `role="tooltip"`, anchored by CSS like Popover, and the Trigger's
`aria-describedby` points at it at all times. A mouse or pen opens it after `delay` (600ms) and
leaving closes it after `closeDelay` (100ms), unless the pointer moves onto it; keyboard focus
opens it at once; blur, a press and Esc close it; touch never opens it. Esc closes only the
tooltip, not a Dialog or Popover underneath, and moving from one tooltip to the next skips the
delay.

Popover's anchoring now comes from a shared internal module; its API is unchanged.

`@arun-dev/ui` styles the popup in inverse colours and fades it. `@arun-dev/ui` now requires
`@arun-dev/headless` >= 4.5.0. `@arun-dev/tokens` adds the `--tooltip-*` component tokens.
