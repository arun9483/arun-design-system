---
'@arun-dev/headless': major
'@arun-dev/ui': major
---

`Button` no longer takes `href` and always renders a `<button>`; links will get a separate `Link` component. `Button` and `Switch.Root` no longer log development warnings about what is passed through `render`. `Switch.Root` now ignores clicks while `disabled` even if a `render` element overrides the attribute.
