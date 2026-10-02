---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Combobox: add `Group` and `GroupLabel`, as `<optgroup>`. Pass groups (objects with an `items` array) as `items`; the filter runs inside each group and leaves out a group with no match. A disabled Group disables its items. New `--combobox-group-*` tokens.
