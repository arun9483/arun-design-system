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

## Usage

### Everything at once (primitives + default brand)

```css
@import '@arun-dev/tokens/base';
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

## `BrandSemanticContract`

The TypeScript type `BrandSemanticContract` (exported from `./createBrand`) lists every semantic
CSS variable that `@arun-dev/ui` components require. Consumers may skip `createBrand()` entirely
and hand-write a brand stylesheet — the only requirement is that all contract variables are
defined before components render.

```ts
import type { BrandSemanticContract } from '@arun-dev/tokens/createBrand';
```

## Exports

| Specifier                                  | Content                                             |
| ------------------------------------------ | --------------------------------------------------- |
| `@arun-dev/tokens/base`                    | All primitives + default brand                      |
| `@arun-dev/tokens/brands/default`          | Default brand (palette+semantic)                    |
| `@arun-dev/tokens/brands/default/palette`  | Default palette only                                |
| `@arun-dev/tokens/brands/default/semantic` | Default semantic layer only                         |
| `@arun-dev/tokens/primitives/*`            | Individual primitive scales                         |
| `@arun-dev/tokens/primitives/fonts`        | Inter variable font (`@font-face`)                  |
| `@arun-dev/tokens/createBrand`             | `createBrand()`, `generatePaletteFromSeed()`, types |
