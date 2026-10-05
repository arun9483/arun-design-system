# @arun-dev/tokens

## 0.34.0

### Minor Changes

- 2cd59bb: Add `Calendar`, `RangeCalendar`, `DatePicker` and `DateRangePicker`. Dates are ISO strings in the user's local time: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with `withTime`; a value with `Z` or an offset is converted to local time. The field is a native `<input type="date">` or `datetime-local`, so typing, the phone's picker, the form and react-hook-form's `register()` work, and a calendar in a popover picks for it. A range has two inputs and a range calendar picked in two presses; `maxDays` limits its length in days, both ends counted, in the calendar and through the end input's `max`. `min`, `max` and `isDateUnavailable` limit both the inputs and the calendar. The calendar follows the APG grid keyboard and the locale's names and first day of the week. Headless subpaths `@arun-dev/headless/calendar` and `@arun-dev/headless/date-picker`. `@arun-dev/ui` requires `@arun-dev/headless` 4.23.0 or later. Tokens: `--calendar-*`, `--date-picker-*`.

## 0.33.0

### Minor Changes

- 9d415c4: Add `TreeView`: a hierarchy moved through with the arrow keys, by the WAI-ARIA tree pattern. `TreeView.Root` is a `<ul role="tree">` holding the selection (`value`, `multiple`) and the open Items (`expanded`); `TreeView.Item` is an `<li role="treeitem">` with a `label`, and nested Items make it a parent, rendered only while it is open. One Tab stop; ↓ ↑ move, → ← open, close and move between levels (swapped right to left), Home, End, `*` and typeahead. Enter, Space or a click selects; with `multiple`, Shift with an arrow and Ctrl/⌘+A too. `@arun-dev/ui` requires `@arun-dev/headless` 4.22.0 or later. Tokens: `--tree-view-*`, and `--color-text-primary` on `--color-bg-accent` joins the contrast requirements every brand meets.

  `ToggleGroup` no longer reports a changed `defaultValue` on every re-render when it has none.

## 0.32.0

### Minor Changes

- 6ba6a84: Add `Stepper`: the steps of a multi-step flow and which one you're on. `Stepper.Root` is an `<ol role="list">` (`orientation`: horizontal or vertical; `labels` for translation) and `Stepper.Item` an `<li>` with a `status` — `complete`, `current` (`aria-current="step"`) or `upcoming`. The number or tick is drawn and hidden; a complete step adds a hidden "(completed)". The current step is the consumer's state, as for Pagination. Tokens: `--stepper-*`.

## 0.31.0

### Minor Changes

- c4a46bc: Add `HoverCard`: a preview of where a link goes, shown on hover or keyboard focus. `HoverCard.Trigger` is an `<a>`; `HoverCard.Popup` is a `popover="manual"` anchored to it (`side`, `align`), opened with the trigger as its invoker so Tab moves into the card. A pointer opens it after `delay` (600ms) and it closes `closeDelay` (300ms) after leaving both the link and the card; keyboard focus opens it at once, focus leaving both or Esc closes it. Touch never opens it, so its content must never be essential. `@arun-dev/ui` requires `@arun-dev/headless` 4.21.0 or later. Tokens: `--hover-card-*`.

## 0.30.0

### Minor Changes

- f3a6fbc: Brand colours now meet WCAG contrast in light and dark mode, for the default brand and for any seed.
  - **Dark mode:** `--color-text-on-accent` is `--color-neutral-950` instead of white. The accent is light in dark mode (`brand-300`), and white on it measured 1.99:1 in the default brand, failing on every primary Button, the current page in Pagination, and a checked Checkbox's tick and Radio's dot. It is now 10.12:1.
  - **Light mode:** `--color-status-info` is `brand-600` instead of `brand-500`. The info Badge's text on `brand-50` measured 3.99:1; it is now 5.62:1.
  - **Seeded brands:** `createBrand({ seed })` fits the generated palette to `CONTRAST_REQUIREMENTS`, the new exported list of every token pairing the components draw. A shade that falls short moves lighter or darker, keeping its hue, so a bright seed such as yellow (`brand-700` at 2.12:1 before) is readable too. A palette passed in is used as given. `contrastRatio` is exported to check one.

## 0.29.0

### Minor Changes

- 7c00f14: Add `Drawer`: a modal panel that slides in from an edge and closes with a swipe. It is a Dialog at an edge — `Drawer.Root`, `Trigger`, `Title` and `Close` are Dialog's parts, and `Drawer.Popup` is Dialog's popup with a `side` (`bottom` by default, `top`, `left`, `right`, emitted as `data-side`) and swipe to close. A swipe past a quarter of the drawer's size, or a fast flick, requests a close through `onOpenChange`; scrolling content inside scrolls first. While dragged, the element has `data-swiping` and `--drawer-swipe`. `@arun-dev/ui` requires `@arun-dev/headless` 4.20.0 or later. Tokens: `--drawer-*`.

## 0.28.0

### Minor Changes

- 284c4f2: Add `Heading`, `Paragraph` and `Text`. `Heading` renders `<h1>`–`<h6>` from `level`, with `size` setting the look apart from the rank. `Paragraph` is a `<p>` capped at a readable line length. `Text` is a `<span>` with `size`, `color` and `weight`. New types: `HeadingLevel`, `TextSize`, `TextColor` and `TextWeight`, plus the `font-weight-normal` utility. Tokens: `--heading-font-family`, `--heading-font-weight`, `--heading-letter-spacing`, `--heading-color` and `--paragraph-max-inline-size`.

## 0.27.0

### Minor Changes

- ca6667b: Add `Stack` and `Grid`. `Stack` lays children in one line, down or across, with a `gap` from the spacing scale, plus `align`, `justify` and `wrap`. `Grid` lays them in equal columns: a fixed `columns` count, or as many as fit at `minItemSize` (at most `columns`), responsive with no breakpoints. The new `Space` type names the gap steps. Tokens: `--grid-columns`, `--grid-min-item-size` and `--grid-gap`.

## 0.26.0

### Minor Changes

- 372b387: Add `OtpInput`: one box per character of a one-time code, over a single native input, so SMS autofill, paste and the numeric keypad work. `length` sets the number of boxes and `validationType` the allowed characters. ui's peer range moves to `@arun-dev/headless >=4.18.0`.

## 0.25.0

### Minor Changes

- 33f8268: Add typeahead, checkbox and radio items, and groups to `Menu` (decision 18). Headless: typing moves focus to the next item whose text starts with what was typed (`textValue` overrides the text in `children`), and new parts `CheckboxItem`, `RadioGroup`, `RadioItem`, `ItemIndicator`, `Group` and `GroupLabel`. ui: styled versions with a checkmark indicator, and `--menu-indicator-*` and `--menu-group-label-*` tokens. ui now needs `@arun-dev/headless` 4.15.0 or later.

## 0.24.0

### Minor Changes

- fedba9d: Add `Toggle`, `ToggleGroup`, `Toolbar` and `Avatar` (decision 17). Headless: `@arun-dev/headless/toggle`, `/toggle-group`, `/toolbar` and `/avatar` — a pressed button, a group with one Tab stop and the arrow keys, a toolbar that a ToggleGroup joins, and an image shown only once loaded. ui: styled versions and `--toggle-*`, `--toolbar-*` and `--avatar-*` tokens. ui now needs `@arun-dev/headless` 4.14.0 or later.

## 0.23.0

### Minor Changes

- c852364: Add `Breadcrumb`, `Pagination` (with `paginationRange()`), `Table` and `Kbd`, with their tokens — decision 17. Each is native markup with styling.

## 0.22.0

### Minor Changes

- 3fde054: Add `Toast` (decision 16). Headless (`@arun-dev/headless/toast`): `Provider`, `useToastManager()` (`add`, `update`, `close`), `Viewport` (a polite live region kept open in the top layer), `Root`, `Title`, `Description`, `Action`, `Close`; timers pause on hover, focus and a hidden page, and Esc closes. ui: a styled Viewport that renders toasts itself, styled parts, and `--toast-*` tokens. ui now needs `@arun-dev/headless` 4.13.0 or later.

## 0.21.0

### Minor Changes

- 9cce84f: Add `Accordion` (native `<details>`/`<summary>`, `exclusive` through `name`), `Alert` (five tones, no live role by default), `Spinner` (an indeterminate `<progress>` drawn as a ring) and `Skeleton` (an `aria-hidden` placeholder), with their tokens — decision 16.

## 0.20.0

### Minor Changes

- e62069f: Add the form basics (decision 15). Headless: `Field` (`@arun-dev/headless/field`) ties a label, a description and an error to one control. ui: `Field`, `Link`, `Separator`, `Progress`, `Meter` and `Slider`, each a native element with styling, and new tokens for each. ui now needs `@arun-dev/headless` 4.12.0 or later.

## 0.19.0

### Minor Changes

- 4561d81: Combobox: add `Separator`, a visual line between items or groups, as an `<hr>` in a `<select>`. `onInputValueChange` now reports the input following a new single `value` — set by the parent, or swapped in `onValueChange` — with the new reason `'value-change'`. Clear hides while the Root is `disabled`.

## 0.18.0

### Minor Changes

- 29e95e4: Combobox: add `Group` and `GroupLabel`, as `<optgroup>`. Pass groups (objects with an `items` array) as `items`; the filter runs inside each group and leaves out a group with no match. A disabled Group disables its items. New `--combobox-group-*` tokens.

## 0.17.0

### Minor Changes

- d6ea03b: Add the styled Combobox to `@arun-dev/ui`, its tokens, and two headless parts it needs.

  `@arun-dev/ui` exports `Combobox.Root`, `Input`, `Popup`, `List`, `Item`, `Empty` and `Status`.
  `Combobox.Input` is the whole field drawn as one box: with `multiple`, a `Chip` with a remove button
  per selected item, then the text, a Clear button while something is selected, and a chevron. The
  list is as wide as the field; the selected item shows a check. Labels for Clear, the chevron and
  each chip's remove button are props. Styles are in `@arun-dev/ui/css/combobox`.

  `@arun-dev/tokens` adds `--combobox-*` tokens for the field, chips, list and items.

  `@arun-dev/headless/combobox` adds `Combobox.InputGroup`, a box around the input that becomes the
  popup's anchor, and `Combobox.Value`, which renders the selection through a function.

## 0.16.0

### Minor Changes

- cd0b248: Add Menu, following the WAI-ARIA menu button pattern, and `focusableWhenDisabled` on Tabs.

  `@arun-dev/headless/menu` exports `Menu.Root`, `Trigger`, `Popup` and `Item`. The popup is a native
  `popover="auto"` with `role="menu"`, anchored like Popover and labelled by the Trigger. A click,
  Enter, Space or Down opens it at the first item and Up at the last; Up and Down move between items,
  wrapping, with Home and End; Tab closes it. Items are native `<button role="menuitem">`s, and
  activating one closes the menu unless its `onClick` calls `event.preventComponentHandler()`.
  Disabled items are skipped unless `Menu.Root` sets `focusableWhenDisabled`, which keeps them
  focusable as `aria-disabled` and blocks their activation.

  `Tabs.Root` takes the same `focusableWhenDisabled`, with `activationMode="manual"` only; under
  `"automatic"` it has no effect.

  `@arun-dev/ui` styles the popup and items. `@arun-dev/ui` now requires `@arun-dev/headless` >=
  4.7.0. `@arun-dev/tokens` adds the `--menu-*` component tokens.

## 0.15.0

### Minor Changes

- b6222e6: Add Tabs, following the WAI-ARIA tabs pattern.

  `@arun-dev/headless/tabs` exports `Tabs.Root`, `List`, `Tab` and `Panel`. Tabs are native
  `<button role="tab">`s, each paired with a `role="tabpanel"` by a shared `value`, with the ids
  that wire them generated. The list is a single Tab stop (roving tabindex): arrows move along
  `orientation`, wrapping, with Home and End, skipping disabled tabs and swapping Left and Right in
  right-to-left layouts. `activationMode` is `automatic` (focus selects) or `manual` (Enter, Space
  or a click). Root owns `value` / `defaultValue` / `onValueChange`; panels stay mounted and are
  `hidden` while unselected.

  `@arun-dev/ui` styles every part, with an indicator on the selected tab for both orientations.
  `@arun-dev/ui` now requires `@arun-dev/headless` >= 4.6.0. `@arun-dev/tokens` adds the `--tabs-*`
  component tokens.

## 0.14.0

### Minor Changes

- 95f9276: Add Tooltip, a short label shown beside an element on hover or keyboard focus.

  `@arun-dev/headless/tooltip` exports `Tooltip.Root`, `Trigger` and `Popup`. The popup is a native
  `popover="manual"` with `role="tooltip"`, anchored by CSS like Popover, and the Trigger's
  `aria-describedby` points at it at all times. A mouse or pen opens it after `delay` (600ms) and
  leaving closes it after `closeDelay` (100ms), unless the pointer moves onto it; keyboard focus
  opens it at once; blur, a press and Esc close it; touch never opens it. Esc closes only the
  tooltip, not a Dialog or Popover underneath, and moving from one tooltip to the next skips the
  delay.

  Popover's anchoring now comes from a shared internal module; its API is unchanged.

  `@arun-dev/ui` styles the popup in inverse colours and fades it. `@arun-dev/ui` now requires
  `@arun-dev/headless` >= 4.5.0. `@arun-dev/tokens` adds the `--tooltip-*` component tokens.

## 0.13.0

### Minor Changes

- 849cdd3: Add Popover, a non-modal popup anchored to its trigger.

  `@arun-dev/headless/popover` exports `Popover.Root`, `Trigger`, `Popup` and `Close`. The popup is a
  native `popover="auto"` shown with `showPopover({ source })`, so the top layer, Esc, light dismiss,
  Tab order from the trigger and focus return are the platform's. Placement is CSS anchor
  positioning with no positioning script: the trigger carries a generated `anchor-name`, and the
  popup's `side` and `align` props become `position-area`, flipping when there is no room. The
  component owns `open` / `defaultOpen` / `onOpenChange`, and reports every close — including light
  dismiss and Esc — through it.

  `@arun-dev/ui` styles the popup, spaces it from the trigger by `--popover-offset`, and fades it in
  and out. `Trigger` and `Close` pass through unstyled. `@arun-dev/ui` now requires
  `@arun-dev/headless` >= 4.4.0, the first version with the popover entry point. `@arun-dev/tokens`
  adds the `--popover-*` component tokens.

## 0.12.0

### Minor Changes

- ba17991: Add Dialog, a modal dialog built on the native `<dialog>` and `showModal()`.

  `@arun-dev/headless/dialog` exports `Dialog.Root`, `Trigger`, `Popup`, `Title` and `Close`. The
  platform supplies the top layer, backdrop, inert page, focus trap and focus return; the component
  owns `open` / `defaultOpen` / `onOpenChange`, and turns every close — `Dialog.Close`, Esc, a
  backdrop click, `<form method="dialog">` — into a request a controlled parent can refuse.
  `closeOnBackdropClick={false}` makes the backdrop inert. `Title` names the dialog through
  `aria-labelledby`, and `Trigger` carries `aria-haspopup`, `aria-expanded` and `aria-controls`.

  `@arun-dev/ui` styles the popup and title, locks page scroll while a modal is open, and animates
  opening and closing with `@starting-style`. `Trigger` and `Close` pass through unstyled; render a
  `Button` to style them. `@arun-dev/ui` now requires `@arun-dev/headless` >= 4.3.0, the first
  version with the dialog entry point. `@arun-dev/tokens` adds the `--dialog-*` component tokens.

## 0.11.0

### Minor Changes

- 3dbfc91: Add Select, a native dropdown in a styled box.

  `Select` renders `<div class="select">` around a real `<select>`, with a chevron drawn by the box so
  it matches across browsers. `className` goes on the box; every other prop, `children` (your
  `<option>`s and `<optgroup>`s), `ref` and `render` included, goes on the `<select>`, so labels,
  `aria-*` and react-hook-form's `register()` work as for Input.

  There is no headless half, per decision 7: the picker, typeahead, `required` and form submission
  are the platform's. A selected `value=""` option reads as a muted placeholder, and `multiple` or
  `size` turn it into a list box without the chevron. It does not filter; search is a separate
  combobox, planned after Popover. `@arun-dev/tokens` adds the `--select-*` component tokens.

## 0.10.0

### Minor Changes

- 4b62ece: Let users resize a Textarea's width as well as its height.

  `Textarea` still fills its container by default, but now uses `resize: both`: the user can drag it
  narrower, down to the new `--textarea-min-width` token, and wider, up to the container and never
  past it. With `autoResize`, height follows the content and the handle resizes width only.

## 0.9.0

### Minor Changes

- b9e7c63: Add Textarea, a native multi-line text field.

  `Textarea` renders a single `<textarea>`: no box and no slots, so every prop, `className`, `ref`
  and `render` included, lands on it, and react-hook-form's `register()` works as-is. `autoResize`
  lets it grow with its content between `--textarea-min-height` and `--textarea-max-height` using
  CSS `field-sizing: content`, with no JavaScript; browsers without it keep the `rows` height.

  There is no headless half, per decision 7. Focus, `aria-invalid` and `disabled` are styled from
  the native control. `@arun-dev/tokens` adds the `--textarea-*` component tokens, which match
  Input's by default but map from the semantic tier independently.

## 0.8.0

### Minor Changes

- 69dfc57: Add Input, a native single-line text field in a styled box.

  `Input` renders `<div class="input">` around a real `<input>`, with optional `startSlot` and
  `endSlot` for icons, units, keyboard hints or buttons. `className` goes on the box; every other
  prop, including `ref` and `render`, goes on the `<input>`, so labels, `aria-*` and
  react-hook-form's `register()` work the same with or without slots.

  There is no headless half. Typing, validation and form participation are the platform's, per
  decision 7. Focus, `aria-invalid` and `disabled` are styled from the native control with `:has()`.
  `@arun-dev/tokens` adds the `--input-*` component tokens.

## 0.7.0

### Minor Changes

- 2b92101: Add RadioGroup — one choice from a set, in both packages.

  `RadioGroup.Item` is a native `<input type="radio">`, unlike Checkbox and Switch. It passes all
  three of decision 7's tests, because a radio's dot is a `::before` and needs no indicator element.
  Arrow-key selection, the single Tab stop at the checked radio, `required` validation and form
  submission all come from the platform.

  `RadioGroup.Root` renders `<div role="radiogroup">` and owns the value: `value` / `defaultValue` /
  `onValueChange`, with `null` for nothing selected. It also passes `name` (generated when omitted,
  so the radios still group), `disabled`, `required` and `form` down to every radio.
  `form.reset()` returns the group to the value it mounted with, and the screen, the `data-*`
  attributes and the submitted value stay in agreement even when a controlled parent declines.

  Radios emit `data-checked` / `data-unchecked` / `data-disabled`, and the group emits
  `data-disabled`. `@arun-dev/ui` draws the dot in CSS, and `@arun-dev/tokens` adds the `--radio-*`
  component tokens.

## 0.6.0

### Minor Changes

- 8fa7073: Add Checkbox — a three-state form control, in both packages.

  `Checkbox.Root` is a `<button role="checkbox">` with a hidden native input for the form, for the
  same reason `Switch.Root` is: an `<input type="checkbox">` is void, so it cannot hold an
  indicator. `Checkbox.Indicator` is the second part, reading state from the Root through context.

  The third state is one prop, not two: `checked` is `boolean | 'indeterminate'`, so
  `checked && indeterminate` cannot be written and everything else derives from one value. A click
  resolves a mixed checkbox to checked, as a native one does, and `form.reset()` restores the state
  it mounted with — indeterminate included, which a native checkbox does not manage.

  Both parts emit `data-checked` / `data-unchecked` / `data-indeterminate` / `data-disabled`.
  `@arun-dev/ui` ships a default check and dash and picks between them in CSS; passing children
  replaces both. `@arun-dev/tokens` adds the `--checkbox-*` component tokens.

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
