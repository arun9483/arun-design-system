---
'@arun-dev/headless': minor
---

**`stopImmediatePropagation()` now stops the component's own handler too.**

A consumer's handler and the component's are folded into one listener by `mergeProps`, so
the standard call — "no further listeners on this element" — was quietly doing nothing to
the rest of the chain. It now runs the native behaviour _and_ prevents every handler the
chain has not reached yet, alongside the existing `preventComponentHandler()` escape hatch.

Also in this release:

- `SwitchRootProps` declares `id`. It always reached the DOM through the prop spread, but the
  type did not admit it, so the documented way to name a switch — `<label htmlFor>` paired by
  `id` — did not typecheck through `@arun-dev/ui`, whose wrapper uses the closed props type.
- `packages/headless/tsconfig.json` includes `tests` and no longer excludes the spec files,
  so the test suites are typechecked with the source rather than skipped.
