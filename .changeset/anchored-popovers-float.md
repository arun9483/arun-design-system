---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Popover, a non-modal popup anchored to its trigger.

`@arun-dev/headless/popover` exports `Popover.Root`, `Trigger`, `Popup` and `Close`. The popup is a
native `popover="auto"` shown with `showPopover({ source })`, so the top layer, Esc, light dismiss,
Tab order from the trigger and focus return are the platform's. Placement is CSS anchor
positioning with no positioning script: the trigger carries a generated `anchor-name`, and the
popup's `side` and `align` props become `position-area`, flipping when there is no room. The
component owns `open` / `defaultOpen` / `onOpenChange`, and reports every close — including light
dismiss and Esc — through it.

`@arun-dev/ui` styles the popup, spaces it from the trigger by `--popover-offset`, and fades it in
and out. `Trigger` and `Close` pass through unstyled. `@arun-dev/ui` now requires
`@arun-dev/headless` >= 4.4.0, the first version with the popover entry point. `@arun-dev/tokens`
adds the `--popover-*` component tokens.
