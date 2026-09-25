---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add RadioGroup — one choice from a set, in both packages.

`RadioGroup.Item` is a native `<input type="radio">`, unlike Checkbox and Switch. It passes all
three of decision 7's tests, because a radio's dot is a `::before` and needs no indicator element.
Arrow-key selection, the single Tab stop at the checked radio, `required` validation and form
submission all come from the platform.

`RadioGroup.Root` renders `<div role="radiogroup">` and owns the value: `value` / `defaultValue` /
`onValueChange`, with `null` for nothing selected. It also passes `name` (generated when omitted,
so the radios still group), `disabled`, `required` and `form` down to every radio.
`form.reset()` returns the group to the value it mounted with, and the screen, the `data-*`
attributes and the submitted value stay in agreement even when a controlled parent declines.

Radios emit `data-checked` / `data-unchecked` / `data-disabled`, and the group emits
`data-disabled`. `@arun-dev/ui` draws the dot in CSS, and `@arun-dev/tokens` adds the `--radio-*`
component tokens.
