---
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `Stepper`: the steps of a multi-step flow and which one you're on. `Stepper.Root` is an `<ol role="list">` (`orientation`: horizontal or vertical; `labels` for translation) and `Stepper.Item` an `<li>` with a `status` — `complete`, `current` (`aria-current="step"`) or `upcoming`. The number or tick is drawn and hidden; a complete step adds a hidden "(completed)". The current step is the consumer's state, as for Pagination. Tokens: `--stepper-*`.
