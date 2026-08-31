# @arun-dev/headless

## 1.0.0

### Major Changes

- 06ab355: **Controls rendered as something other than a `<button>` are now operable.** `useButton` only
  handled the disabled case, so `<Button render={<span/>}>` and `<Switch.Root render={<div/>}>`
  produced mouse-only controls: not focusable, no `Enter` or `Space`. They now get `tabIndex`, and
  `Enter` on keydown and `Space` on keyup dispatch a click, matching a native button.

  **Fixes**
  - `Switch` no longer puts `type="button"` on elements that are not buttons — `<div type="button">`
    was invalid HTML on every non-button `render`.
  - A disabled `Switch` rendered as an anchor no longer keeps its `href`, so it is no longer
    navigable. `Button` already did this.
  - `useButton` warns in development when the element actually rendered disagrees with what the
    component expected, which is what let the two bugs above go unnoticed.
  - A `Button` rendered as a `<div>` or `<span>` now carries `role="button"`. It was focusable and
    keyboard-operable but announced as nothing. An anchor keeps its own role, which suits navigation
    better.
  - `@arun-dev/ui`'s `Button` warns when `href` and `render` are both given: `render` wins, so the
    `href` was silently dropped and the link went nowhere.

  **New: `@arun-dev/headless/button`.** A headless `Button` — behaviour only, no styling. It exists
  for the moment `render` points at something that is not a `<button>`, and takes `nativeButton` for
  the case `render` cannot be inspected. It has no `href`: a control that navigates should be an
  anchor, so pass one in and keep middle-click, cmd-click and "link" in assistive technology.

  `useButton` and `retractActivationProps` are now **private** to the package. They implement these
  components rather than serving people building their own, and they will keep changing — composite
  widgets will need a `focusableWhenDisabled` parameter. The supported surface is `useRender`,
  `mergeProps`, `useControlled`, the state-attribute helpers, and the components themselves.

  `@arun-dev/ui`'s `Button` is now a styling wrapper over the headless one, keeping `variant` and
  the `href` convenience. It requires `@arun-dev/headless >= 1.0.0`, which is where
  `@arun-dev/headless/button` first appears. Tightening a peer range is breaking for anyone on an older
  headless, hence the major.

  `@arun-dev/tokens` adds the missing `./components/switch` export subpath; `chip`, `badge` and
  `button` were already exported.

## 0.4.0

### Minor Changes

- e6ffb7d: **Behaviour change — event handlers now run right to left.** A component passes its own props
  first and the consumer's last, so a consumer's handler now runs _before_ the component's, and can
  stop it:

  ```tsx
  <Switch.Root onClick={(event) => event.preventComponentHandler()} />
  ```

  This matches Radix's `composeEventHandlers` and Base UI's `mergeProps`, both of which run the
  consumer's handler first and let it cancel the library's. The escape hatch belongs to the
  consumer: a component already decides which props reach the element, so it never needs the chain
  to suppress anything.

  `preventDefault()` is deliberately not overloaded — it already means "cancel the browser's default
  action", which is a different statement. The signal is attached only to real events, so `on*`
  props called with something else, such as `onCheckedChange(boolean)`, always run every handler.

  **Fix: a disabled `Switch` rendered as a non-button still toggled.** `<Switch.Root render={<div/>}
disabled>` accepted clicks — the `disabled` attribute is inert on a `div`, so it flipped
  `aria-checked`, called `onCheckedChange`, and ran the consumer's `onClick`. It now synthesises the
  state through `useButton`: `aria-disabled`, removal from the tab order, and no activation.

## 0.3.0

### Minor Changes

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

## 0.2.1

### Patch Changes

- c25b098: Document the package on its own terms: add a README, and rewrite the npm description so it no
  longer defines the package by the styling layer built on it. Expand the `checked` JSDoc to warn
  that the controlled/uncontrolled mode is latched at mount, so an `undefined` first render makes
  the component uncontrolled for good.

## 0.2.0

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
