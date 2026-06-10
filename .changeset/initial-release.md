---
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Initial release — design system extracted from arun-dev-platform into a standalone publishable
monorepo. `@arun-dev/tokens` ships CSS primitives, the default brand, and a compiled
`createBrand()` generator (ESM + CJS + types). `@arun-dev/ui` ships compiled `Button`, `Card`,
`Chip`, and `Badge` components with their stylesheets. Semantic token drift between
`semantic.css` and `createBrand()` is reconciled (AAA-audited values win) and guarded by unit
tests.
