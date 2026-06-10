# arun-design-system

A standalone, publishable design system monorepo. Pure-CSS design tokens with white-label brand
generation, and a brand-agnostic React component library built on top of them.

## Packages

| Package                               | Description                                                                                             | Published  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------- |
| [`@arun-dev/tokens`](packages/tokens) | Design tokens — pure CSS primitives, brand palettes, semantic layers, and the `createBrand()` generator | ✅         |
| [`@arun-dev/ui`](packages/ui)         | React components (`Button`, `Card`, `Chip`, `Badge`) styled entirely via semantic tokens                | ✅         |
| [`@arun-dev/config`](packages/config) | Internal ESLint and TypeScript base configs                                                             | ❌ private |

## Quick start (consumers)

```bash
npm install @arun-dev/tokens @arun-dev/ui
```

```ts
// Load tokens (primitives + default brand), then component styles
import '@arun-dev/tokens/base';
import '@arun-dev/ui/components.css';

import { Button, Card, Chip, Badge } from '@arun-dev/ui';
```

To ship a custom brand, generate the CSS with `createBrand()`:

```ts
import { createBrand } from '@arun-dev/tokens/createBrand';

const css = createBrand({ name: 'acme', seed: '#0ea5e9' });
```

See each package README for full usage.

## Development

Requirements: Node >= 24, pnpm >= 10.32.1.

```bash
pnpm install
pnpm build        # turbo run build (tsup)
pnpm typecheck
pnpm lint
pnpm test:unit
```

## Releasing

Versioning and publishing are automated with [Changesets](https://github.com/changesets/changesets):

1. Add a changeset with your PR: `pnpm changeset`
2. On merge to `main`, the release workflow opens/updates a **Version Packages** PR
3. Merging that PR publishes to npm (requires the `NPM_TOKEN` repository secret)

See [CONTRIBUTING.md](CONTRIBUTING.md) for design-system rules and workflow details.
