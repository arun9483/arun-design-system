---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Checkbox — a three-state form control, in both packages.

`Checkbox.Root` is a `<button role="checkbox">` with a hidden native input for the form, for the
same reason `Switch.Root` is: an `<input type="checkbox">` is void, so it cannot hold an
indicator. `Checkbox.Indicator` is the second part, reading state from the Root through context.

The third state is one prop, not two: `checked` is `boolean | 'indeterminate'`, so
`checked && indeterminate` cannot be written and everything else derives from one value. A click
resolves a mixed checkbox to checked, as a native one does, and `form.reset()` restores the state
it mounted with — indeterminate included, which a native checkbox does not manage.

Both parts emit `data-checked` / `data-unchecked` / `data-indeterminate` / `data-disabled`.
`@arun-dev/ui` ships a default check and dash and picks between them in CSS; passing children
replaces both. `@arun-dev/tokens` adds the `--checkbox-*` component tokens.
