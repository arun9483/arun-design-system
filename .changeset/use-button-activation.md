---
'@arun-dev/headless': major
'@arun-dev/tokens': minor
'@arun-dev/ui': major
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
- A `Button` rendered as a `<div>` or `<span>` now carries `role="button"`. It was focusable and
  keyboard-operable but announced as nothing. An anchor keeps its own role, which suits navigation
  better.
- `@arun-dev/ui`'s `Button` warns when `href` and `render` are both given: `render` wins, so the
  `href` was silently dropped and the link went nowhere.

**New: `@arun-dev/headless/button`.** A headless `Button` — behaviour only, no styling. It exists
for the moment `render` points at something that is not a `<button>`, and takes `nativeButton` for
the case `render` cannot be inspected. It has no `href`: a control that navigates should be an
anchor, so pass one in and keep middle-click, cmd-click and "link" in assistive technology.

`useButton` and `retractActivationProps` are now **private** to the package. They implement these
components rather than serving people building their own, and they will keep changing — composite
widgets will need a `focusableWhenDisabled` parameter. The supported surface is `useRender`,
`mergeProps`, `useControlled`, the state-attribute helpers, and the components themselves.

`@arun-dev/ui`'s `Button` is now a styling wrapper over the headless one, keeping `variant` and
the `href` convenience. It requires `@arun-dev/headless >= 1.0.0`, which is where
`@arun-dev/headless/button` first appears. Tightening a peer range is breaking for anyone on an older
headless, hence the major.

`@arun-dev/tokens` adds the missing `./components/switch` export subpath; `chip`, `badge` and
`button` were already exported.
