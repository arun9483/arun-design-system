---
'@arun-dev/headless': patch
---

Report an open cancelled in `onBeforeToggle` as a close.

`Dialog.Popup`, `Popover.Popup` and `Tooltip.Popup` accept `onBeforeToggle`, and calling
`event.preventDefault()` there when opening stops the element from opening. The component had
already reported `onOpenChange(true)` and kept its state open, so the Trigger showed
`aria-expanded="true"` over a closed popup. Each now checks the element after showing it, and
reports a cancelled open through `onOpenChange(false)`. A controlled parent is told once and the
open is not retried.
