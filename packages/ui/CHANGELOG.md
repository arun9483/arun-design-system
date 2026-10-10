# @arun-dev/ui

## 5.12.0

### Minor Changes

- 863d81d: Add RangeSlider: a range from–to picked along one track, such as a price filter or a salary band. It is two native `<input type="range">`s, `RangeSlider.StartInput` and `RangeSlider.EndInput`, stacked under `RangeSlider.Root`, so each thumb's keys, steps, slider semantics and form value are the browser's. The Root keeps the start at or below the end, fills the stretch between them, puts the thumb that can still move on top when they meet, and moves the nearer thumb to a press on the track. Each input submits under its own `name`, and `form.reset()` returns the range to where it started. ui draws the track, fill and thumbs (`@arun-dev/ui/css/range-slider`), with `--range-slider-*` tokens.
  
  ui now needs `@arun-dev/headless` 4.28.0 or later.

### Patch Changes

- Updated dependencies [863d81d]
  - @arun-dev/tokens@0.39.0

## 5.11.1

### Patch Changes

- 2097027: Require `@arun-dev/headless` 4.27.0 or later: Button's `pending` comes from it, and an older headless ignores it, so a pending Button would not be disabled.

## 5.11.0

### Minor Changes

- 5950241: Button: `pending` and two danger variants. `pending` marks a button busy with the action it started, a save, say. It is disabled natively while it lasts, so neither a second press nor Enter in a field can submit again, and it carries `data-pending`. ui shows a Spinner over the label, which keeps its place so the button does not change width. `variant="danger"` (filled) and `variant="danger-ghost"` (outlined) are for deleting, drawn from the error status colours through new `--btn-danger-*` tokens.
  
  ui now needs `@arun-dev/headless` 4.27.0 or later.

### Patch Changes

- Updated dependencies [5950241]
  - @arun-dev/tokens@0.38.0

## 5.10.0

### Minor Changes

- ff6d9fe: Add Menubar: a bar of menus — File, Edit, View — by the WAI-ARIA menubar pattern. `Menubar.Root` is `role="menubar"` and one Tab stop: ← and → move along it, Home and End to its ends, and typing moves to a Trigger by its text. ↓, Enter and Space open a menu, → and ← move between open menus, and while one is open the pointer opens another by reaching its Trigger. `orientation="vertical"` runs it top to bottom with its menus to the side, and `focusableWhenDisabled` keeps disabled Triggers reachable. Inside, `Menubar.Menu`, `Menubar.Trigger` and `Menubar.Popup` hold a menu, and the items, groups and submenus are Menu's, under the bar's name. Menu itself is unchanged. ui styles the bar and its Triggers (`@arun-dev/ui/css/menubar`), with `--menubar-*` tokens.
  
  ui now needs `@arun-dev/headless` 4.26.0 or later.

### Patch Changes

- Updated dependencies [ff6d9fe]
  - @arun-dev/tokens@0.37.0

## 5.9.0

### Minor Changes

- 8542527: Built with tsdown instead of tsup, which is no longer maintained. The published files keep their names (`.js` / `.cjs`, `.d.ts` / `.d.cts`) and every entry point exports the same names as before; only shared chunk file names change.

  Headless follows React Compiler's rules: values latched at mount are read from state, not refs, and refs are no longer written during render.

  Chip and Card: `children` is optional, for a `render` element that brings its own content — `<Chip render={<a href="/tags/react">React</a>} />` — so the link's text sits inside the link, where accessibility linting sees it.

  Fix: a toast whose `timeout` changed while it was showing started the new timeout already short by the time the old one had run. It now starts in full.

  ESLint config: supports ESLint 10 (eslint-plugin-react and eslint-plugin-jsx-a11y run through `@eslint/compat` until they support it), and `reactConfig` now includes eslint-plugin-react-hooks 7's React Compiler rules (`refs`, `immutability`, `globals`, `purity` and the rest), which can report new errors. It also uses eslint-plugin-react's `jsx-runtime` preset, allows `role="list"` on `<ul>` and `<ol>`, and treats @arun-dev/ui's form controls (`Checkbox.Root`, `RadioGroup.Item`, `Switch.Root`, `Input` and the rest) as controls a wrapping `<label>` names.

### Patch Changes

- Updated dependencies [8542527]
  - @arun-dev/tokens@0.36.1

## 5.8.0

### Minor Changes

- bec758d: Calendars can say what each day is. `getDayInfo(date)` returns `tags` (any number: holiday, festival, birthday, booked, weekend or your own), a `description` added to the day's spoken name, and `details` for a details card. Each day lists its tags in `data-tags` and shows one mark for its tag highest in `tagPriority` (`data-mark`); `tagStyles` sets each tag's colour and shape (dot, ring, star, diamond, bar, strike, none). The details card opens on a resting mouse, on keyboard focus or on a tap, and Esc hides it. `onVisibleRangeChange` reports the days shown so their information can be fetched, and `loading` marks the grid busy. All optional, on Calendar, RangeCalendar, DatePicker and DateRangePicker. Headless adds `Calendar.DayDetails` and `dayProps`. Tokens: `--calendar-tag-*`, `--calendar-details-*`, and status error, warning and success on the page join the contrast requirements.

  Fix: a DateRangePicker with `maxHours` or `maxDays` could exceed its limit when the start moved after the end was set. Moving the start, typed or in the popup, now pulls an end past the limit back to it.

### Patch Changes

- Updated dependencies [bec758d]
  - @arun-dev/tokens@0.36.0

## 5.7.0

### Minor Changes

- c96d928: DatePicker and DateRangePicker with `withTime` now set the time in the popup too: a native time field — "Time", or "Start time" and "End time" — under the calendar, and a Done button. A pick leaves the popup open so the time can follow; without `withTime` it still closes. A time chosen before any date is used by the first pick. Headless adds `DatePicker.TimeInput`, `StartTimeInput`, `EndTimeInput` and `Close`, and the `time`, `startTime` and `endTime` labels; ui adds `doneLabel`.

  Calendars can jump to a month and year, for dates far away such as a date of birth: `captionLayout="dropdown"` on Calendar, RangeCalendar, DatePicker and DateRangePicker shows native month and year selects. The years run from `min`'s to `max`'s, or 100 years back to 10 ahead. Headless adds `Calendar.MonthSelect` and `Calendar.YearSelect`, and the `month` and `year` labels. Tokens: `--calendar-select-*`.

  DateRangePicker takes `maxHours` with `withTime`: the most hours from start to end, such as a 40-hour booking. The calendar disables the days out of reach, a picked end past the cap is pulled back to it, and the end input's `max` stops a typed one.

### Patch Changes

- Updated dependencies [c96d928]
  - @arun-dev/tokens@0.35.0

## 5.6.0

### Minor Changes

- 2cd59bb: Add `Calendar`, `RangeCalendar`, `DatePicker` and `DateRangePicker`. Dates are ISO strings in the user's local time: `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with `withTime`; a value with `Z` or an offset is converted to local time. The field is a native `<input type="date">` or `datetime-local`, so typing, the phone's picker, the form and react-hook-form's `register()` work, and a calendar in a popover picks for it. A range has two inputs and a range calendar picked in two presses; `maxDays` limits its length in days, both ends counted, in the calendar and through the end input's `max`. `min`, `max` and `isDateUnavailable` limit both the inputs and the calendar. The calendar follows the APG grid keyboard and the locale's names and first day of the week. Headless subpaths `@arun-dev/headless/calendar` and `@arun-dev/headless/date-picker`. `@arun-dev/ui` requires `@arun-dev/headless` 4.23.0 or later. Tokens: `--calendar-*`, `--date-picker-*`.

### Patch Changes

- Updated dependencies [2cd59bb]
  - @arun-dev/tokens@0.34.0

## 5.5.0

### Minor Changes

- 9d415c4: Add `TreeView`: a hierarchy moved through with the arrow keys, by the WAI-ARIA tree pattern. `TreeView.Root` is a `<ul role="tree">` holding the selection (`value`, `multiple`) and the open Items (`expanded`); `TreeView.Item` is an `<li role="treeitem">` with a `label`, and nested Items make it a parent, rendered only while it is open. One Tab stop; ↓ ↑ move, → ← open, close and move between levels (swapped right to left), Home, End, `*` and typeahead. Enter, Space or a click selects; with `multiple`, Shift with an arrow and Ctrl/⌘+A too. `@arun-dev/ui` requires `@arun-dev/headless` 4.22.0 or later. Tokens: `--tree-view-*`, and `--color-text-primary` on `--color-bg-accent` joins the contrast requirements every brand meets.

  `ToggleGroup` no longer reports a changed `defaultValue` on every re-render when it has none.

### Patch Changes

- Updated dependencies [9d415c4]
  - @arun-dev/tokens@0.33.0

## 5.4.0

### Minor Changes

- 6ba6a84: Add `Stepper`: the steps of a multi-step flow and which one you're on. `Stepper.Root` is an `<ol role="list">` (`orientation`: horizontal or vertical; `labels` for translation) and `Stepper.Item` an `<li>` with a `status` — `complete`, `current` (`aria-current="step"`) or `upcoming`. The number or tick is drawn and hidden; a complete step adds a hidden "(completed)". The current step is the consumer's state, as for Pagination. Tokens: `--stepper-*`.

### Patch Changes

- Updated dependencies [6ba6a84]
  - @arun-dev/tokens@0.32.0

## 5.3.0

### Minor Changes

- c4a46bc: Add `HoverCard`: a preview of where a link goes, shown on hover or keyboard focus. `HoverCard.Trigger` is an `<a>`; `HoverCard.Popup` is a `popover="manual"` anchored to it (`side`, `align`), opened with the trigger as its invoker so Tab moves into the card. A pointer opens it after `delay` (600ms) and it closes `closeDelay` (300ms) after leaving both the link and the card; keyboard focus opens it at once, focus leaving both or Esc closes it. Touch never opens it, so its content must never be essential. `@arun-dev/ui` requires `@arun-dev/headless` 4.21.0 or later. Tokens: `--hover-card-*`.

### Patch Changes

- Updated dependencies [c4a46bc]
  - @arun-dev/tokens@0.31.0

## 5.2.0

### Minor Changes

- 0ee267f: Visually hidden text: `.sr-only` moves from the `reset` layer to `utilities`, the last layer, so it wins over a component's own position or size on the same element, and clips with `clip-path: inset(50%)` instead of the deprecated `clip`. New `.sr-only-focusable` hides an element until it, or something inside it, has focus — for skip links.

## 5.1.1

### Patch Changes

- Updated dependencies [f3a6fbc]
  - @arun-dev/tokens@0.30.0

## 5.1.0

### Minor Changes

- 7c00f14: Add `Drawer`: a modal panel that slides in from an edge and closes with a swipe. It is a Dialog at an edge — `Drawer.Root`, `Trigger`, `Title` and `Close` are Dialog's parts, and `Drawer.Popup` is Dialog's popup with a `side` (`bottom` by default, `top`, `left`, `right`, emitted as `data-side`) and swipe to close. A swipe past a quarter of the drawer's size, or a fast flick, requests a close through `onOpenChange`; scrolling content inside scrolls first. While dragged, the element has `data-swiping` and `--drawer-swipe`. `@arun-dev/ui` requires `@arun-dev/headless` 4.20.0 or later. Tokens: `--drawer-*`.

### Patch Changes

- Updated dependencies [7c00f14]
  - @arun-dev/tokens@0.29.0

## 5.0.0

### Major Changes

- 2ec60e1: The reset keeps list markers. A `<ul>` or `<ol>` now shows its bullets or numbers, with `padding-inline-start: var(--space-lg)`, because in running text they're part of the content. Before, the reset removed them from every list.

  **Migrating:** a list used for layout — a nav, a row of cards or tags — opts out with `role="list"`:

  ```html
  <ul role="list">
    …
  </ul>
  ```

  `role="list"` also keeps the list announced as a list by VoiceOver in Safari, which can drop the semantics of a list styled with `list-style: none`. `Stack` and `Grid` rendered as a list remove the markers themselves, as `Breadcrumb` and `Pagination` already did.

## 4.27.0

### Minor Changes

- 284c4f2: Add `Heading`, `Paragraph` and `Text`. `Heading` renders `<h1>`–`<h6>` from `level`, with `size` setting the look apart from the rank. `Paragraph` is a `<p>` capped at a readable line length. `Text` is a `<span>` with `size`, `color` and `weight`. New types: `HeadingLevel`, `TextSize`, `TextColor` and `TextWeight`, plus the `font-weight-normal` utility. Tokens: `--heading-font-family`, `--heading-font-weight`, `--heading-letter-spacing`, `--heading-color` and `--paragraph-max-inline-size`.

### Patch Changes

- Updated dependencies [284c4f2]
  - @arun-dev/tokens@0.28.0

## 4.26.0

### Minor Changes

- ca6667b: Add `Stack` and `Grid`. `Stack` lays children in one line, down or across, with a `gap` from the spacing scale, plus `align`, `justify` and `wrap`. `Grid` lays them in equal columns: a fixed `columns` count, or as many as fit at `minItemSize` (at most `columns`), responsive with no breakpoints. The new `Space` type names the gap steps. Tokens: `--grid-columns`, `--grid-min-item-size` and `--grid-gap`.

### Patch Changes

- Updated dependencies [ca6667b]
  - @arun-dev/tokens@0.27.0

## 4.25.0

### Minor Changes

- a4b71d9: OtpInput: Delete and Backspace empty a box in place instead of shifting the digits after it left, so typing fills the same box. An emptied box is a space in the value (`"123 56"`), which the input's `pattern` rejects; check completeness with a pattern such as `/^\d{6}$/`. Backspace on an empty box empties the one before, and deletion also works on phone keyboards that send no Backspace key. A pasted fragment now fills boxes from the caret on, and focus lands on the first empty box. New `onComplete(code)` fires after any change that leaves every box filled, so verifying needs no completeness check of your own.

## 4.24.0

### Minor Changes

- 372b387: Add `OtpInput`: one box per character of a one-time code, over a single native input, so SMS autofill, paste and the numeric keypad work. `length` sets the number of boxes and `validationType` the allowed characters. ui's peer range moves to `@arun-dev/headless >=4.18.0`.

### Patch Changes

- Updated dependencies [372b387]
  - @arun-dev/tokens@0.26.0

## 4.23.0

### Minor Changes

- 2943e33: Toast position: `Toast.Viewport` takes a `position` — `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` or `bottom-right`, the default — for every toast, and `add({ position })` sends one toast elsewhere, in a stack of its own inside the same toast area. Toasts at the top slide down as they arrive. Headless keeps the new `position` option for the ui's rendering; ui exports the `ToastPosition` type.

  Card: only a `lift` card reacts to the pointer now, rising 2px with a deeper shadow. A default card no longer deepens its shadow on hover, so a card that isn't clickable no longer looks clickable.

### Patch Changes

- 2943e33: Fix two flickers. Menu and Combobox popups no longer drop their items into a row while fading out on close. Skeleton's shine now starts and ends fully off the bar, so each loop no longer jumps back into view.

## 4.22.0

### Minor Changes

- 1340625: Add submenus to `Menu` (decision 19). Headless: `Menu.SubmenuRoot` and `Menu.SubmenuTrigger`, with the submenu's own `Menu.Popup` opening beside the trigger. → and ← move between levels, Esc closes one level at a time, activating an item closes every level, and the pointer opens a submenu on rest and keeps it open while crossing toward it. ui: a styled SubmenuTrigger with a chevron. ui now needs `@arun-dev/headless` 4.16.0 or later.

## 4.21.0

### Minor Changes

- 33f8268: Add typeahead, checkbox and radio items, and groups to `Menu` (decision 18). Headless: typing moves focus to the next item whose text starts with what was typed (`textValue` overrides the text in `children`), and new parts `CheckboxItem`, `RadioGroup`, `RadioItem`, `ItemIndicator`, `Group` and `GroupLabel`. ui: styled versions with a checkmark indicator, and `--menu-indicator-*` and `--menu-group-label-*` tokens. ui now needs `@arun-dev/headless` 4.15.0 or later.

### Patch Changes

- Updated dependencies [33f8268]
  - @arun-dev/tokens@0.25.0

## 4.20.0

### Minor Changes

- fedba9d: The reset no longer removes link underlines. In running text the underline is what tells a link apart from the words around it; without it, links differed by colour alone, which fails WCAG 1.4.1 in every app loading the reset. Links in other shapes — Chip, Card, Menu items, Breadcrumb, Pagination, Button — still have none. A link styled your own way that should not be underlined needs `text-decoration: none`.
- fedba9d: Add `Toggle`, `ToggleGroup`, `Toolbar` and `Avatar` (decision 17). Headless: `@arun-dev/headless/toggle`, `/toggle-group`, `/toolbar` and `/avatar` — a pressed button, a group with one Tab stop and the arrow keys, a toolbar that a ToggleGroup joins, and an image shown only once loaded. ui: styled versions and `--toggle-*`, `--toolbar-*` and `--avatar-*` tokens. ui now needs `@arun-dev/headless` 4.14.0 or later.

### Patch Changes

- Updated dependencies [fedba9d]
  - @arun-dev/tokens@0.24.0

## 4.19.0

### Minor Changes

- c852364: Add `Breadcrumb`, `Pagination` (with `paginationRange()`), `Table` and `Kbd`, with their tokens — decision 17. Each is native markup with styling.

### Patch Changes

- Updated dependencies [c852364]
  - @arun-dev/tokens@0.23.0

## 4.18.0

### Minor Changes

- 3fde054: Add `Toast` (decision 16). Headless (`@arun-dev/headless/toast`): `Provider`, `useToastManager()` (`add`, `update`, `close`), `Viewport` (a polite live region kept open in the top layer), `Root`, `Title`, `Description`, `Action`, `Close`; timers pause on hover, focus and a hidden page, and Esc closes. ui: a styled Viewport that renders toasts itself, styled parts, and `--toast-*` tokens. ui now needs `@arun-dev/headless` 4.13.0 or later.

### Patch Changes

- Updated dependencies [3fde054]
  - @arun-dev/tokens@0.22.0

## 4.17.0

### Minor Changes

- 9cce84f: Add `Accordion` (native `<details>`/`<summary>`, `exclusive` through `name`), `Alert` (five tones, no live role by default), `Spinner` (an indeterminate `<progress>` drawn as a ring) and `Skeleton` (an `aria-hidden` placeholder), with their tokens — decision 16.

### Patch Changes

- Updated dependencies [9cce84f]
  - @arun-dev/tokens@0.21.0

## 4.16.0

### Minor Changes

- e62069f: Add the form basics (decision 15). Headless: `Field` (`@arun-dev/headless/field`) ties a label, a description and an error to one control. ui: `Field`, `Link`, `Separator`, `Progress`, `Meter` and `Slider`, each a native element with styling, and new tokens for each. ui now needs `@arun-dev/headless` 4.12.0 or later.

### Patch Changes

- Updated dependencies [e62069f]
  - @arun-dev/tokens@0.20.0

## 4.15.0

### Minor Changes

- 4561d81: Combobox: add `Separator`, a visual line between items or groups, as an `<hr>` in a `<select>`. `onInputValueChange` now reports the input following a new single `value` — set by the parent, or swapped in `onValueChange` — with the new reason `'value-change'`. Clear hides while the Root is `disabled`.

### Patch Changes

- Updated dependencies [4561d81]
  - @arun-dev/tokens@0.19.0

## 4.14.0

### Minor Changes

- 29e95e4: Combobox: add `Group` and `GroupLabel`, as `<optgroup>`. Pass groups (objects with an `items` array) as `items`; the filter runs inside each group and leaves out a group with no match. A disabled Group disables its items. New `--combobox-group-*` tokens.

### Patch Changes

- Updated dependencies [29e95e4]
  - @arun-dev/tokens@0.18.0

## 4.13.0

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

### Patch Changes

- Updated dependencies [d6ea03b]
  - @arun-dev/tokens@0.17.0

## 4.12.0

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

### Patch Changes

- Updated dependencies [cd0b248]
  - @arun-dev/tokens@0.16.0

## 4.11.0

### Minor Changes

- 1316601: Add `position` to `Tabs.Root`: `start` (default) or `end`, which puts the list below the panels
  (horizontal) or after them (vertical). It is logical, so it swaps sides in a right-to-left layout.

  A horizontal list now scrolls sideways when its tabs outgrow the row, and a vertical list stacks
  above or below the panels when the `Tabs.Root` is narrower than 30rem. The list stays first in the
  DOM, and a vertical list stays vertical for assistive technology.

## 4.10.0

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

### Patch Changes

- Updated dependencies [b6222e6]
  - @arun-dev/tokens@0.15.0

## 4.9.0

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

### Patch Changes

- Updated dependencies [95f9276]
  - @arun-dev/tokens@0.14.0

## 4.8.0

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

### Patch Changes

- Updated dependencies [849cdd3]
  - @arun-dev/tokens@0.13.0

## 4.7.0

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

### Patch Changes

- Updated dependencies [ba17991]
  - @arun-dev/tokens@0.12.0

## 4.6.0

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

### Patch Changes

- Updated dependencies [3dbfc91]
  - @arun-dev/tokens@0.11.0

## 4.5.0

### Minor Changes

- 4b62ece: Let users resize a Textarea's width as well as its height.

  `Textarea` still fills its container by default, but now uses `resize: both`: the user can drag it
  narrower, down to the new `--textarea-min-width` token, and wider, up to the container and never
  past it. With `autoResize`, height follows the content and the handle resizes width only.

### Patch Changes

- Updated dependencies [4b62ece]
  - @arun-dev/tokens@0.10.0

## 4.4.0

### Minor Changes

- b9e7c63: Add Textarea, a native multi-line text field.

  `Textarea` renders a single `<textarea>`: no box and no slots, so every prop, `className`, `ref`
  and `render` included, lands on it, and react-hook-form's `register()` works as-is. `autoResize`
  lets it grow with its content between `--textarea-min-height` and `--textarea-max-height` using
  CSS `field-sizing: content`, with no JavaScript; browsers without it keep the `rows` height.

  There is no headless half, per decision 7. Focus, `aria-invalid` and `disabled` are styled from
  the native control. `@arun-dev/tokens` adds the `--textarea-*` component tokens, which match
  Input's by default but map from the semantic tier independently.

### Patch Changes

- Updated dependencies [b9e7c63]
  - @arun-dev/tokens@0.9.0

## 4.3.0

### Minor Changes

- 69dfc57: Add Input, a native single-line text field in a styled box.

  `Input` renders `<div class="input">` around a real `<input>`, with optional `startSlot` and
  `endSlot` for icons, units, keyboard hints or buttons. `className` goes on the box; every other
  prop, including `ref` and `render`, goes on the `<input>`, so labels, `aria-*` and
  react-hook-form's `register()` work the same with or without slots.

  There is no headless half. Typing, validation and form participation are the platform's, per
  decision 7. Focus, `aria-invalid` and `disabled` are styled from the native control with `:has()`.
  `@arun-dev/tokens` adds the `--input-*` component tokens.

### Patch Changes

- Updated dependencies [69dfc57]
  - @arun-dev/tokens@0.8.0

## 4.2.0

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

### Patch Changes

- Updated dependencies [2b92101]
  - @arun-dev/tokens@0.7.0

## 4.1.0

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

### Patch Changes

- Updated dependencies [8fa7073]
  - @arun-dev/tokens@0.6.0

## 4.0.0

### Major Changes

- 91ef609: `Button` no longer takes `href` and always renders a `<button>`; links will get a separate `Link` component. `Button` and `Switch.Root` no longer log development warnings about what is passed through `render`. `Switch.Root` now ignores clicks while `disabled` even if a `render` element overrides the attribute.

## 3.0.1

### Patch Changes

- 5976a98: Require `@arun-dev/headless` >= 3.0.0. The previous `>=1.0.0` range let a consumer satisfy the peer
  with a headless version that predates the render engine `@arun-dev/ui` 3.x is built on.

## 3.0.0

### Major Changes

- 17eb9eb: Lean on the platform instead of synthesising it.

  `Button` renders a `<button>` or, with the new `href` prop, a real `<a>`; a disabled `href`
  renders a `<button disabled>`, since a link that navigates nowhere is not a link.
  `Switch.Root` is always a native `<button>` and reports a `render` that produces anything
  else rather than compensating for it.

  Removes `nativeButton`, `getStateAttributes`, `booleanAttribute`, `disabledAttribute`,
  `StateAttributeMapping` and `useRender`'s `state`/`stateAttributes` params. Props types now
  extend React's own element props, so `id`, `aria-*` and handlers are typed rather than
  accepted blindly. `@arun-dev/ui`'s Button loses its own `href` handling, which moved down.

  Every `data-*` attribute name is unchanged.

## 2.0.1

### Patch Changes

- 0cc8b44: **`useRender` now takes the component's props and the consumer's as separate arguments.**

  ```diff
    useRender({
      render,
      defaultTagName: 'section',
  -   props: [{ className, children }, rest],
  +   props: { className, children },
  +   consumerProps: rest,
    });
  ```

  Precedence — state attributes, then the component's props, then yours, then the `render` element's
  — was previously a convention: `props` was an array and each component author had to arrange it
  correctly. Nothing caught an inversion, and inverting it would have silently broken
  `preventComponentHandler()` for that component while every test still passed. `useRender` now
  merges the tiers itself, so there is no arrangement left to get wrong.

  Also in this release:
  - `Switch.Root` accepts `nativeButton`, matching `Button`. Its dev warning about a `render` that
    is a component rather than an element previously named a fix that did not exist on it.
  - The handler-chaining closure in `mergeProps` is extracted as a named `chainHandlers` function.
    No behaviour change; it was hard to read inline, and the nesting it builds is worth a docstring.

## 2.0.0

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

### Patch Changes

- Updated dependencies [06ab355]
  - @arun-dev/tokens@0.5.0

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
