# @arun-dev/ui

## 0.2.0

### Minor Changes

- c6905ca: Foundations for Chip and Badge: component tokens, `render` composition, generic tones.

  **`@arun-dev/tokens`**
  - New **component token tier** — the mapping layer between semantic tokens and component CSS.
    Overriding `--chip-accent-bg` now moves only accent chips, while `--color-text-accent` still moves
    every accent surface. Ships with `@arun-dev/tokens/base`, so consumers need no extra import; also
    exported standalone as `@arun-dev/tokens/components`, `/components/chip` and `/components/badge`.
  - Chip's previously hardcoded `padding-inline: 0.625rem` is now `--chip-padding-inline`.

  **`@arun-dev/ui`**
  - **`render` prop on `Chip` and `Badge`.** Renders any element or component, merging props,
    `className`, event handlers and refs onto it:

    ```tsx
    <Chip render={<li />}>React</Chip>
    <Chip render={<a href="/tags/react" />}>React</Chip>
    ```

    `Chip`'s `as` prop still works and is **deprecated** — its `'span' | 'button'` union could not
    express every element a consumer needs.

  - **Both components now spread unrecognised props**, so `id`, `aria-*`, `data-*` and event handlers
    reach the DOM. Neither did before.
  - **Both components accept a `ref`**, merged with any ref on the `render` element.
  - **`Badge` gains generic tones** — `neutral` (default), `success`, `warning`, `error`, `info` —
    backed by the existing `--color-status-*` semantic tokens, each with its own component token
    (`--badge-success-bg` and friends).

    The `difficulty-*` variants are **deprecated** and will be removed in the next minor. They put
    article vocabulary into a brand-agnostic library and required the consuming app to define six
    `--color-difficulty-*` tokens that this package does not ship; a consumer who did not define them
    got a badge that silently rendered as plain. Map domain vocabulary onto a tone at the call site
    instead, where TypeScript can check it:

    ```tsx
    const TONE = { beginner: 'success', intermediate: 'warning', advanced: 'error' } as const;

    <Badge tone={TONE[article.difficulty]}>{LABEL[article.difficulty]}</Badge>;
    ```

  - **New `capitalize` utility class**, alongside the existing `uppercase`.

  **Fixes**
  - The README's quick start omitted `@arun-dev/tokens/brands/default` while claiming to load
    "primitives + default brand". Following it left 18 colour tokens undefined and components rendered
    with transparent backgrounds. All three imports are now documented as required.
  - The utility and CSS-only classes (`stack`, `truncate`, `sr-only`, `text-size-*`, `metric`, …) had
    real consumers but no documentation. They are now a documented public API.

### Patch Changes

- Updated dependencies [c6905ca]
  - @arun-dev/tokens@0.2.0

## 0.1.0

### Minor Changes

- ab6f9d3: Initial release — design system extracted from arun-dev-platform into a standalone publishable
  monorepo. `@arun-dev/tokens` ships CSS primitives, the default brand, and a compiled
  `createBrand()` generator (ESM + CJS + types). `@arun-dev/ui` ships compiled `Button`, `Card`,
  `Chip`, and `Badge` components with their stylesheets. Semantic token drift between
  `semantic.css` and `createBrand()` is reconciled (AAA-audited values win) and guarded by unit
  tests.

### Patch Changes

- Updated dependencies [ab6f9d3]
  - @arun-dev/tokens@0.1.0
