---
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Select, a native dropdown in a styled box.

`Select` renders `<div class="select">` around a real `<select>`, with a chevron drawn by the box so
it matches across browsers. `className` goes on the box; every other prop, `children` (your
`<option>`s and `<optgroup>`s), `ref` and `render` included, goes on the `<select>`, so labels,
`aria-*` and react-hook-form's `register()` work as for Input.

There is no headless half, per decision 7: the picker, typeahead, `required` and form submission
are the platform's. A selected `value=""` option reads as a muted placeholder, and `multiple` or
`size` turn it into a list box without the chevron. It does not filter; search is a separate
combobox, planned after Popover. `@arun-dev/tokens` adds the `--select-*` component tokens.
