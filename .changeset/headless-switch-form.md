---
'@arun-dev/headless': patch
---

`Switch.Root` now behaves like a native checkbox in a form. A disabled switch submits nothing, and
`form.reset()` returns it to the state it mounted with, reported through `onCheckedChange`.
Previously a reset left it showing one value while submitting another.

Docs: a wrapping `<label>` does name the switch, and Button's `disabled` now states that a `render`
component receives `aria-disabled` rather than `disabled`.
