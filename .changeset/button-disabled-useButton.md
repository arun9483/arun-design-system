---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': patch
---

**Fix: a disabled `Button` with `href` was still a working link.** `disabled` was spread
straight onto the rendered element, and the attribute is inert on an `<a>` — the link stayed
focusable, still fired `onClick`, and still navigated. It also had no disabled styling at all.

`@arun-dev/headless` gains `useButton`, which synthesises the disabled state for any element the
platform will not do it for: `aria-disabled`, removal from the tab order, the navigation target
dropped, and activation handlers suppressed. Hover and focus handlers are kept, so a tooltip
explaining why a control is disabled still works. `retractActivationProps` covers the same ground
for a consumer-supplied `render` element. Both emit `data-disabled`, so one selector styles every
disabled control regardless of the element underneath.

Also adds `disabledAttribute` — the shared spelling of `data-disabled`, now used by both Switch and
`useButton` so a typo cannot split the CSS contract.

`@arun-dev/tokens` adds `--btn-disabled-opacity`, and `@arun-dev/ui` styles `.btn[data-disabled]`.
