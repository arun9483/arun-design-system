---
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Textarea, a native multi-line text field.

`Textarea` renders a single `<textarea>`: no box and no slots, so every prop, `className`, `ref`
and `render` included, lands on it, and react-hook-form's `register()` works as-is. `autoResize`
lets it grow with its content between `--textarea-min-height` and `--textarea-max-height` using
CSS `field-sizing: content`, with no JavaScript; browsers without it keep the `rows` height.

There is no headless half, per decision 7. Focus, `aria-invalid` and `disabled` are styled from
the native control. `@arun-dev/tokens` adds the `--textarea-*` component tokens, which match
Input's by default but map from the semantic tier independently.
