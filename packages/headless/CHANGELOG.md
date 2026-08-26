# @arun-dev/headless

## 0.1.0

### Minor Changes

- 36b92d9: **New package: `@arun-dev/headless`** — unstyled React behaviour primitives. Ships no CSS, no
  class names and no colour.

  It starts as the render engine `@arun-dev/ui` was already built on, moved out of that package's
  `src/internal/` where it was deliberately kept unexported for exactly this move, plus the two
  pieces the first behavioural component needs.
  - **`useRender`** — resolves what a part renders: its default element, an element supplied through
    `render`, and the props, `className`, handlers and refs merged onto it.
  - **`mergeProps`** — combines props rather than replacing them: handlers chain, `className`
    concatenates, `style` shallow-merges, refs merge, and `undefined` never clobbers a set value.
  - **`useControlled`** — controlled and uncontrolled in one component, with the mode fixed at mount
    so a parent that briefly passes `undefined` cannot flip it and lose state.
  - **`getStateAttributes` / `booleanAttribute`** — project a component's state onto the DOM as
    `data-*`, which is how CSS reacts to state in a library that owns no class names. Emitting
    mutually exclusive attributes keeps a third state addressable: with only `data-checked`,
    `:not([data-checked])` would match unchecked _and_ indeterminate.

  Deliberately **not** included: a store, and a transition/exit-animation lifecycle. Neither has a
  component that needs it yet — the store earns its place at `Select` and `Menu`, the lifecycle at
  `Collapsible` and `Dialog`. Building them now would be guessing at their shape.

  **Breaking for `@arun-dev/ui`.** It now declares `@arun-dev/headless` as a peer dependency, so
  consumers must install it alongside:

  ```bash
  npm install @arun-dev/headless
  ```

  A peer rather than a regular dependency because the two packages will share React context — a
  `Field.Root` from one copy would not be seen by a control from another, the same class of failure
  as two Reacts in one tree. Establishing that now avoids a second breaking change later.

  `Button`, `Card`, `Chip` and `Badge` are otherwise unchanged: same props, same rendered markup,
  same class names.
