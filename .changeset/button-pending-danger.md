---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Button: `pending` and two danger variants. `pending` marks a button busy with the action it started, a save, say. It is disabled natively while it lasts, so neither a second press nor Enter in a field can submit again, and it carries `data-pending`. ui shows a Spinner over the label, which keeps its place so the button does not change width. `variant="danger"` (filled) and `variant="danger-ghost"` (outlined) are for deleting, drawn from the error status colours through new `--btn-danger-*` tokens.

ui now needs `@arun-dev/headless` 4.27.0 or later.
