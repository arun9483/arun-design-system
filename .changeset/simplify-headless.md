---
'@arun-dev/headless': major
'@arun-dev/ui': major
---

Lean on the platform instead of synthesising it.

`Button` renders a `<button>` or, with the new `href` prop, a real `<a>`; a disabled `href`
renders a `<button disabled>`, since a link that navigates nowhere is not a link.
`Switch.Root` is always a native `<button>` and reports a `render` that produces anything
else rather than compensating for it.

Removes `nativeButton`, `getStateAttributes`, `booleanAttribute`, `disabledAttribute`,
`StateAttributeMapping` and `useRender`'s `state`/`stateAttributes` params. Props types now
extend React's own element props, so `id`, `aria-*` and handlers are typed rather than
accepted blindly. `@arun-dev/ui`'s Button loses its own `href` handling, which moved down.

Every `data-*` attribute name is unchanged.
