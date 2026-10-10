# Contributing

## Design System Rules (STRICT)

1. **No hardcoded values in CSS** — every size, color, spacing must use `var(--token-name)`. Only
   exception: `0` and `@media` breakpoint queries.
2. **No inline styles in `.tsx`** — all visual styling in the component's own `.css` file, in its
   cascade layer. Only exception: data-driven CSS custom properties passed via
   `style={{ '--var': value }}`.
3. **Components are brand-agnostic** — never reference a specific brand file inside `packages/ui/`.
   Only use semantic tokens.
4. **Token layer order:** raw primitives → palette (brand colors) → semantic (intent-named) →
   component. Never skip layers.
5. **Dark mode** must be covered in every brand file via `@media (prefers-color-scheme: dark)` +
   `[data-theme='dark']` attribute.
6. **`BrandSemanticContract`** is the consumer contract — any custom brand CSS must define all
   variables in that type.

### Keeping `semantic.css` and `createBrand()` in sync

`packages/tokens/src/brands/default/semantic.css` is hand-written (it carries AAA-contrast-audited
values) and `createBrand()` generates equivalent output for custom brands. The unit test in
`packages/tokens/src/createBrand.unit.spec.ts` asserts that `createBrand()`'s output matches
`semantic.css` for every `BrandSemanticContract` variable. If you change one side, change the other
— the test will fail otherwise.

## Workflow

1. Branch from `main`
2. Make your change; keep all dependency versions **exact-pinned** (no `^` or `~` —
   `pnpm-workspace.yaml` has `saveExact: true`)
3. Add tests for any logic change (`*.unit.spec.ts(x)`, co-located, Vitest), and a
   `*.browser.spec.tsx` for behaviour jsdom cannot run — real focus, keys, the top layer
4. Add a changeset: `pnpm changeset` (pick the affected packages and a semver bump; `@arun-dev/config`
   is private and never gets one)
5. Open a PR — CI runs build, typecheck, lint and unit tests, the browser tests in Chromium,
   Firefox and WebKit, and the security scans
6. After merge, the Changesets bot maintains a **Version Packages** PR; merging it publishes to npm

## Git hooks

Husky runs locally:

- **pre-commit** — lint-staged (ESLint + Prettier on staged files), and a gitleaks scan of the
  staged changes when gitleaks is installed
- **commit-msg** — commitlint ([Conventional Commits](https://www.conventionalcommits.org))
- **pre-push** — lint, typecheck, full test suite
