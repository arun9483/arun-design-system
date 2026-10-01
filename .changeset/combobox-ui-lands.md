---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add the styled Combobox to `@arun-dev/ui`, its tokens, and two headless parts it needs.

`@arun-dev/ui` exports `Combobox.Root`, `Input`, `Popup`, `List`, `Item`, `Empty` and `Status`.
`Combobox.Input` is the whole field drawn as one box: with `multiple`, a `Chip` with a remove button
per selected item, then the text, a Clear button while something is selected, and a chevron. The
list is as wide as the field; the selected item shows a check. Labels for Clear, the chevron and
each chip's remove button are props. Styles are in `@arun-dev/ui/css/combobox`.

`@arun-dev/tokens` adds `--combobox-*` tokens for the field, chips, list and items.

`@arun-dev/headless/combobox` adds `Combobox.InputGroup`, a box around the input that becomes the
popup's anchor, and `Combobox.Value`, which renders the selection through a function.
