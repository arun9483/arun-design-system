# @arun-dev/tokens

## 0.5.0

### Minor Changes

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

## 0.3.0

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

## 0.1.0

### Minor Changes

- ab6f9d3: Initial release — design system extracted from arun-dev-platform into a standalone publishable
  monorepo. `@arun-dev/tokens` ships CSS primitives, the default brand, and a compiled
  `createBrand()` generator (ESM + CJS + types). `@arun-dev/ui` ships compiled `Button`, `Card`,
  `Chip`, and `Badge` components with their stylesheets. Semantic token drift between
  `semantic.css` and `createBrand()` is reconciled (AAA-audited values win) and guarded by unit
  tests.
