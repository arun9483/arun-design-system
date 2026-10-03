---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add typeahead, checkbox and radio items, and groups to `Menu` (decision 18). Headless: typing moves focus to the next item whose text starts with what was typed (`textValue` overrides the text in `children`), and new parts `CheckboxItem`, `RadioGroup`, `RadioItem`, `ItemIndicator`, `Group` and `GroupLabel`. ui: styled versions with a checkmark indicator, and `--menu-indicator-*` and `--menu-group-label-*` tokens. ui now needs `@arun-dev/headless` 4.15.0 or later.
