# @arun-dev/demo

A single-page gallery of `@arun-dev/ui`, used to eyeball the design system while developing it.
Private — never published.

```bash
pnpm --filter @arun-dev/demo dev      # http://localhost:5173
pnpm --filter @arun-dev/demo build
```

It consumes `@arun-dev/tokens` and `@arun-dev/ui` through `workspace:*`, so it always reflects the
local packages rather than what is on npm.

## Brands

`sky`, `forest` and `plum` are generated from a single seed colour by `createBrand()`, written to
`src/generated/` by `scripts/generate-brands.mjs` on `predev` / `prebuild`. That directory is
gitignored — regenerate it, never edit it. This is exactly how a consumer ships a custom brand.

The `default` brand ships with `@arun-dev/tokens` and is imported as a normal stylesheet. Selecting
an alternate injects its CSS into a `<style>` element, whose `:root` declarations win on source
order; selecting `default` removes it.

## What the page is for

Less a component catalogue than a check on the layering: theme and brand switching move only the
token layer, and no component re-renders differently. If a change breaks that, this page shows it
immediately.
