# @arun-dev/ui

## 1.1.0

### Minor Changes

- 1231632: Export the props types for the components this package defines — `ButtonProps`, `CardProps`,
  `ChipProps`, `BadgeProps` — along with the `ButtonVariant` and `ChipVariant` value unions that
  already had an exported counterpart in `BadgeTone`. Naming a wrapper's props no longer needs
  `ComponentProps<typeof Button>`.

  `Switch` is unchanged: its props types are defined by `@arun-dev/headless`, and re-exporting them
  would freeze a relationship that is allowed to change. Derive them with
  `ComponentProps<typeof Switch.Root>`. See `docs/architecture.md` decision 6.

### Patch Changes

- 1231632: **Fix: a disabled `Button` with `href` was still a working link.** `disabled` was spread
  straight onto the rendered element, and the attribute is inert on an `<a>` — the link stayed
  focusable, still fired `onClick`, and still navigated. It also had no disabled styling at all.

  `@arun-dev/headless` gains `useButton`, which synthesises the disabled state for any element the
  platform will not do it for: `aria-disabled`, removal from the tab order, the navigation target
  dropped, and activation handlers suppressed. Hover and focus handlers are kept, so a tooltip
  explaining why a control is disabled still works. `retractActivationProps` covers the same ground
  for a consumer-supplied `render` element. Both emit `data-disabled`, so one selector styles every
  disabled control regardless of the element underneath.

  Also adds `disabledAttribute` — the shared spelling of `data-disabled`, now used by both Switch and
  `useButton` so a typo cannot split the CSS contract.

  `@arun-dev/tokens` adds `--btn-disabled-opacity`, and `@arun-dev/ui` styles `.btn[data-disabled]`.

- Updated dependencies [1231632]
  - @arun-dev/tokens@0.4.0

## 1.0.0

### Minor Changes

- 4e9ecd4: **`Switch`** — the first component with real behaviour, and the one that makes
  `@arun-dev/headless` more than a render engine.

  ```tsx
  import { Switch } from '@arun-dev/ui';

  <label>
    <Switch.Root defaultChecked onCheckedChange={setEnabled}>
      <Switch.Thumb />
    </Switch.Root>
    Notifications
  </label>;
  ```

  **`@arun-dev/headless/switch`** — `Switch.Root` and `Switch.Thumb`, unstyled.
  - Renders a native `<button>`, so focus, `Space`, `Enter` and disabled semantics come from the
    platform rather than from JavaScript. Carries `role="switch"` and `aria-checked` per the
    WAI-ARIA switch pattern, and `type="button"` so it never submits a form by accident.
  - Controlled or uncontrolled. `onCheckedChange` reports the value being moved to in both modes,
    so the same handler works either way.
  - `name` submits with the enclosing form when checked; an unchecked switch contributes nothing,
    mirroring a native checkbox.
  - Both parts emit `data-checked` / `data-unchecked` / `data-disabled`, so styling reacts to state
    without knowing how the component decides it.
  - `Switch.Thumb` reads state from `Switch.Root` through context, so the two cannot get out of
    step, and is `aria-hidden` since the Root already announces the state.

  It has **no accessible name of its own** — wrap it in a `<label>` or pass `aria-label`. A headless
  component should not guess at your copy.

  **`@arun-dev/ui`** adds the styling: `--switch-*` component tokens, a track and thumb driven
  entirely by the `data-*` attributes, and a thumb transition that is disabled under
  `prefers-reduced-motion`. New stylesheet export `@arun-dev/ui/css/switch`.

  **`@arun-dev/tokens`** gains the `--switch-*` component tokens.

### Patch Changes

- Updated dependencies [4e9ecd4]
  - @arun-dev/headless@0.2.0
  - @arun-dev/tokens@0.3.0

## 0.4.0

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

### Patch Changes

- Updated dependencies [36b92d9]
  - @arun-dev/headless@0.1.0

## 0.3.0

### Minor Changes

- 34d1b41: **Breaking.** Removes the APIs deprecated in 0.2.0, and gives `Button` and `Card` the same
  composition surface `Chip` and `Badge` already had.

  ## Removed
  - **`Chip`'s `as` prop.** Use `render` instead — it accepts any element, not just `span`/`button`.

    ```diff
    - <Chip as="button" onClick={…}>Tag</Chip>
    + <Chip render={<button type="button" />} onClick={…}>Tag</Chip>
    ```

    Note `as="button"` supplied `type="button"` implicitly; with `render` it belongs on the element,
    or the button defaults to `type="submit"` and can submit an enclosing form.

  - **`Badge`'s `variant` prop and the `difficulty-*` variants**, along with their CSS. They put
    article vocabulary into a brand-agnostic library and required consumers to define six
    `--color-difficulty-*` tokens this package never shipped — a consumer who did not got a badge
    that silently rendered as plain. Use `tone` and map your own vocabulary at the call site.

    ```diff
    - <Badge variant="difficulty-beginner">Beginner</Badge>
    + <Badge tone="success">Beginner</Badge>
    ```

  ## Added
  - **`render`, prop spreading and `ref` on `Button` and `Card`**, matching `Chip` and `Badge`.

    `Card` previously destructured only `{ as, lift, className, children }` and spread nothing, so
    `aria-label` on a `<Card as="nav">` was silently dropped — an accessibility bug, not just a
    missing convenience.

    `Button`'s `ButtonAsLink | ButtonAsButton` union is gone. It could not express a router link, and
    its `never`-typed members forced unsound `as` casts internally. `href` still renders an `<a>`;
    anything else goes through `render`.

    ```tsx
    <Button render={<NextLink href="/docs" />}>Docs</Button>
    <Card render={<article />} lift>…</Card>
    ```

  - `Button`, `Card`, `Chip` and `Badge` are now all built on one internal render engine, so prop
    merging, `className` concatenation, handler chaining and ref merging behave identically across
    the set.

  ## Internal

  `Button` and `Card` move to co-located folders, completing the layout `Chip` and `Badge` adopted in
  0.2.0. Published subpath exports are unchanged — `@arun-dev/ui/css/btn` and `…/css/card` resolve
  exactly as before.

  The token contract test's list of consumer-supplied properties is now empty: this package defines
  every custom property it reads.

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
