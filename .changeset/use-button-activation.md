---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

**Controls rendered as something other than a `<button>` are now operable.** `useButton` only
handled the disabled case, so `<Button render={<span/>}>` and `<Switch.Root render={<div/>}>`
produced mouse-only controls: not focusable, no `Enter` or `Space`. They now get `tabIndex`, and
`Enter` on keydown and `Space` on keyup dispatch a click, matching a native button.

**Fixes**

- `Switch` no longer puts `type="button"` on elements that are not buttons — `<div type="button">`
  was invalid HTML on every non-button `render`.
- A disabled `Switch` rendered as an anchor no longer keeps its `href`, so it is no longer
  navigable. `Button` already did this.
- `useButton` warns in development when the element actually rendered disagrees with what the
  component expected, which is what let the two bugs above go unnoticed.

**`useButton` and `retractActivationProps` have moved off the root entry point** to
`@arun-dev/headless/unstable`, which carries no stability guarantee. They implement this
library's own components rather than serving people building their own, and they will keep
changing — composite widgets will need a `focusableWhenDisabled` parameter. The supported surface
is unchanged: `useRender`, `mergeProps`, `useControlled`, and the state-attribute helpers.

`@arun-dev/tokens` adds the missing `./components/switch` export subpath; `chip`, `badge` and
`button` were already exported.
