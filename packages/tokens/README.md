# @arun-dev/tokens

Pure-CSS design tokens with white-label brand generation. Zero runtime dependencies — CSS ships
as-is, plus a small build-time `createBrand()` utility for generating custom brand stylesheets.

## Installation

```bash
npm install @arun-dev/tokens
```

## Token layers

Tokens are layered — never skip a layer:

1. **Primitives** — raw scales with no color: typography, spacing, radius, shadow, motion,
   elevation, breakpoints
2. **Palette** — brand colors (`--color-brand-50…950`) and neutrals (`--color-neutral-0…950`)
3. **Semantic** — intent-named tokens consumed by components (`--color-bg-primary`,
   `--color-text-accent`, `--color-border-default`, …)
4. **Component** — one set per `@arun-dev/ui` component, mapping semantic tokens onto its
   surfaces (`--btn-danger-bg`, `--slider-accent-color`, …). Override one to restyle that
   component alone

## Usage

### Everything at once

`base` is the primitives and the component tokens; it holds no brand, so add one after it. Without
a brand every `--color-*` token is undefined.

```css
@import '@arun-dev/tokens/base';
@import '@arun-dev/tokens/brands/default'; /* or brands/arun, or your own from createBrand() */
```

### À la carte

```css
@import '@arun-dev/tokens/primitives/typography';
@import '@arun-dev/tokens/primitives/spacing';
@import '@arun-dev/tokens/primitives/radius';
@import '@arun-dev/tokens/primitives/shadow';
@import '@arun-dev/tokens/primitives/motion';
@import '@arun-dev/tokens/primitives/elevation';
@import '@arun-dev/tokens/primitives/breakpoints';
@import '@arun-dev/tokens/components'; /* component tokens, which @arun-dev/ui reads */
@import '@arun-dev/tokens/brands/default'; /* palette + semantic */
```

### Fonts (opt-in)

`base` deliberately does not load fonts. To use the bundled Inter variable font:

```css
@import '@arun-dev/tokens/primitives/fonts';
```

### Theming

Semantic tokens cover light and dark out of the box: system preference via
`@media (prefers-color-scheme: dark)`, with explicit overrides via `data-theme="dark"` /
`data-theme="light"` on the root element.

## Custom brands with `createBrand()`

`createBrand()` is a pure, build-time function that returns a complete brand CSS string (palette +
neutrals + semantic light/dark tokens). Write its output to a file and load it instead of the
default brand.

```ts
import { writeFileSync } from 'node:fs';
import { createBrand } from '@arun-dev/tokens/createBrand';

// From a single seed color (generates an 11-step palette)
writeFileSync('styles/acme.css', createBrand({ name: 'acme', seed: '#0ea5e9' }));

// Or from an explicit 11-step palette (50–950)
writeFileSync(
  'styles/acme.css',
  createBrand({ name: 'acme', palette: { 50: '#f0f9ff' /* … */, 950: '#082f49' } }),
);
```

### Output stability

`createBrand()` is pure and deterministic: the same `seed` (or the same `palette`) always
produces byte-identical CSS. It uses no randomness, no clock and nothing from the environment,
and `name` affects only a comment in the output.

That is a contract, not an implementation detail. Brand generation is normally a one-time
step whose result is committed, so **a change to the palette algorithm restyles every consumer
the moment they upgrade** — even though nothing in their code changed. Treat such a change as
breaking regardless of what the version number would otherwise suggest, and say so in the
changeset.

## The arun brand

A brand published ready to use, so several apps share one look without each generating it:

```css
@import '@arun-dev/tokens/base';
@import '@arun-dev/tokens/brands/arun';
```

It is `createBrand(ARUN_BRAND)` — `{ name: 'arun', seed: '#7c3aed' }`, exported from
`@arun-dev/tokens/createBrand` — byte for byte, and a unit test fails while the two differ. After a
change to `createBrand()` or to `ARUN_BRAND`, regenerate it with
`pnpm --filter @arun-dev/tokens generate:brands`. A change to its output is a major release, as for
any `createBrand()` output (Versioning, below).

## Versioning

From 1.0.0, every token name is public API, and the version says what a release does to it:

| Change                                                                       | Release |
| ---------------------------------------------------------------------------- | ------- |
| A new token, a new component token set, a new export subpath                 | minor   |
| A token's value tuned within its intent — a spacing step, a contrast fix     | patch   |
| A token renamed or removed; a `BrandSemanticContract` entry added or removed | major   |
| A change to `createBrand()`'s output for the same input (see above)          | major   |

That covers every tier: primitives (`--space-*`, `--text-*`), the semantic layer
(`--color-text-accent`), and the component tokens (`--btn-danger-bg`, `--slider-accent-color`),
since consumers override those to restyle one component. A new entry in `BrandSemanticContract`
is major because a hand-written brand that satisfied the old contract would no longer.

## `BrandSemanticContract`

The TypeScript type `BrandSemanticContract` (exported from `./createBrand`) lists every semantic
CSS variable that `@arun-dev/ui` components require. Consumers may skip `createBrand()` entirely
and hand-write a brand stylesheet — the only requirement is that all contract variables are
defined before components render.

```ts
import type { BrandSemanticContract } from '@arun-dev/tokens/createBrand';
```

## Exports

| Specifier                                  | Content                                                                                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `@arun-dev/tokens/base`                    | All primitives and the component tokens — no brand: add one                                     |
| `@arun-dev/tokens/brands/default`          | Default brand (palette+semantic)                                                                |
| `@arun-dev/tokens/brands/arun`             | The arun brand, generated by `createBrand(ARUN_BRAND)`                                          |
| `@arun-dev/tokens/brands/default/palette`  | Default palette only                                                                            |
| `@arun-dev/tokens/brands/default/semantic` | Default semantic layer only                                                                     |
| `@arun-dev/tokens/primitives/*`            | Individual primitive scales                                                                     |
| `@arun-dev/tokens/primitives/fonts`        | Inter variable font (`@font-face`)                                                              |
| `@arun-dev/tokens/components`              | Every component token set                                                                       |
| `@arun-dev/tokens/components/*`            | `chip`, `badge`, `button` and `switch` on their own                                             |
| `@arun-dev/tokens/createBrand`             | `createBrand()`, `generatePaletteFromSeed()`, `contrastRatio()`, `CONTRAST_REQUIREMENTS`, types |
