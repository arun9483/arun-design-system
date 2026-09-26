---
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Input, a native single-line text field in a styled box.

`Input` renders `<div class="input">` around a real `<input>`, with optional `startSlot` and
`endSlot` for icons, units, keyboard hints or buttons. `className` goes on the box; every other
prop, including `ref` and `render`, goes on the `<input>`, so labels, `aria-*` and
react-hook-form's `register()` work the same with or without slots.

There is no headless half. Typing, validation and form participation are the platform's, per
decision 7. Focus, `aria-invalid` and `disabled` are styled from the native control with `:has()`.
`@arun-dev/tokens` adds the `--input-*` component tokens.
