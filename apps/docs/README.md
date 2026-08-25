# @arun-dev/docs

The documentation site for `arun-design-system` — [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build), with React islands for live examples.
Private; never published.

```bash
pnpm --filter @arun-dev/docs dev       # http://localhost:4321
pnpm --filter @arun-dev/docs build
pnpm --filter @arun-dev/docs typecheck # astro check
```

It consumes `@arun-dev/tokens` and `@arun-dev/ui` through `workspace:*`, so it always reflects
the local packages rather than what is on npm.

## Examples have one source

Each example is a real file in `src/examples/`. `<Example name="button-variants">` renders the
component live and shows that same file's text via `?raw` — there is no second copy to drift.

```mdx
import Example from '@/components/Example.astro';
import ButtonVariants from '@/examples/button-variants';

<Example name="button-variants">
  <ButtonVariants client:load />
</Example>
```

The `client:load` sits at the call site rather than inside `Example` because Astro can only
hydrate a statically-traceable import — a component resolved from a glob cannot be hydrated.

## Playgrounds

`<Playground>` renders a component against interactive controls and prints the JSX a consumer
would write for the current values. Bindings live in `src/components/playgrounds.tsx`, one per
component, so each MDX page needs a single import.

## Prop tables

`src/data/props.ts` holds the reference shown by `<PropTable>`. It is hand-authored on purpose:
every component's public type is `XOwnProps & Omit<HTMLAttributes, …>`, so a generated table
would mostly restate the DOM attribute surface. Only design-system props are listed per
component; the shared ones (`className`, `render`, `ref`, `…rest`) are described once in
`COMMON`.

## Theme and brand

Starlight sets `data-theme="dark" | "light"` on `<html>` — the same hook `@arun-dev/tokens`
uses — so its theme toggle drives the token layer with no glue code.

The brand selector beside it swaps the token layer. `sky`, `forest` and `plum` are generated
from a single seed colour by `createBrand()` on `predev`/`prebuild` into a gitignored
`src/generated/`. The default brand loads as a normal stylesheet; alternates are injected as a
`<style>` element that wins on source order.
