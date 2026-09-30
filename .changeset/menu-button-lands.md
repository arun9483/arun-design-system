---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Menu, following the WAI-ARIA menu button pattern, and `focusableWhenDisabled` on Tabs.

`@arun-dev/headless/menu` exports `Menu.Root`, `Trigger`, `Popup` and `Item`. The popup is a native
`popover="auto"` with `role="menu"`, anchored like Popover and labelled by the Trigger. A click,
Enter, Space or Down opens it at the first item and Up at the last; Up and Down move between items,
wrapping, with Home and End; Tab closes it. Items are native `<button role="menuitem">`s, and
activating one closes the menu unless its `onClick` calls `event.preventComponentHandler()`.
Disabled items are skipped unless `Menu.Root` sets `focusableWhenDisabled`, which keeps them
focusable as `aria-disabled` and blocks their activation.

`Tabs.Root` takes the same `focusableWhenDisabled`, with `activationMode="manual"` only; under
`"automatic"` it has no effect.

`@arun-dev/ui` styles the popup and items. `@arun-dev/ui` now requires `@arun-dev/headless` >=
4.7.0. `@arun-dev/tokens` adds the `--menu-*` component tokens.
