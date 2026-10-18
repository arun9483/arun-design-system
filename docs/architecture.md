# Architecture decisions

The design decisions for `arun-design-system`. Each section says what is built, why, and what is ruled
out. Decisions 1–6 are rules for every component. Decisions 7–16 apply those rules to groups of
components. Code comments refer to these numbers.

| #   | Decision                                                    | Summary                                                                                                |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1   | [Layering](#decision-1)                                     | Three packages: `tokens` (CSS), `headless` (behaviour), `ui` (styling). They share names, not code.    |
| 2   | [Tokens](#decision-2)                                       | Four token tiers. Brand and theme are set on `:root`. `ui` reads only variables that `tokens` defines. |
| 3   | [Behaviour in headless, native elements first](#decision-3) | Code that needs JavaScript goes in `headless`. Use the native element unless it cannot do the job.     |
| 4   | [`render`, merging and state](#decision-4)                  | `render` changes the element. Consumer props win. State comes only from the component's props.         |
| 5   | [Public API](#decision-5)                                   | Export only what a consumer needs. A package exports only the props types it defines.                  |
| 6   | [When a component has parts](#decision-6)                   | Split into parts only when the consumer must place an element that needs the Root.                     |
| 7   | [Anchored popups](#decision-7)                              | Native `popover`, placed with CSS anchor positioning. Covers Popover, Tooltip and HoverCard.           |
| 8   | [Disabled items in roving groups](#decision-8)              | Arrow keys skip disabled items. `focusableWhenDisabled` keeps them focusable.                          |
| 9   | [Menu and Menubar](#decision-9)                             | Menu items, typeahead, checkable items, submenus, and a Menubar built on Menu.                         |
| 10  | [Combobox](#decision-10)                                    | Items are data and `value` holds items. Behaviour follows Base UI.                                     |
| 11  | [Form controls](#decision-11)                               | Field, OtpInput, RangeSlider, and Button's `pending` and `danger`.                                     |
| 12  | [Calendar and DatePicker](#decision-12)                     | The native date input is the field. A calendar, ranges and day information are added next to it.       |
| 13  | [Dialog, Drawer and Toast](#decision-13)                    | Dialog uses `showModal()`. Drawer is a Dialog closed by a swipe. Toast is a queue in a popover.        |
| 14  | [Toggles, Toolbar, Avatar and TreeView](#decision-14)       | Small components with state, and a tree view with two parts.                                           |
| 15  | [Styled native components](#decision-15)                    | Components without a headless part: a native element with classes.                                     |
| 16  | [Server Components](#decision-16)                           | `'use client'` only on modules that need it. Namespace objects stay on the server.                     |

---

<a id="decision-1"></a>

## 1. Layering

```
@arun-dev/tokens        @arun-dev/headless
CSS custom properties   React behaviour, state and a11y
only. Zero runtime JS.  No CSS, no class names.
        |                       |
        |  token names          |  data-* attributes
        +-----------+-----------+
                    v
              @arun-dev/ui
              Class names + component CSS + styled components.
```

The packages connect only through **names**. Two tests check those names:

| Connection          | Shared names              | Checked by                              |
| ------------------- | ------------------------- | --------------------------------------- |
| tokens → ui         | CSS custom property names | `token-contract.unit.spec.ts`           |
| headless → ui's CSS | `data-*` attribute names  | `state-attribute-contract.unit.spec.ts` |

- `ui` does not import `tokens`. It uses CSS variables by name, and the consumer loads the token CSS.
- `ui` imports `headless` in JavaScript (peer dependency). `ui`'s CSS uses only the `data-*`
  attributes that headless sets, so `data-*` is reserved for headless.
- `tokens` works without React. `headless` works without a stylesheet.

**Rules out:** a JavaScript theme object, CSS-in-JS, styles generated at runtime, and any dependency
from `headless` on `ui`, including in its documentation.

---

<a id="decision-2"></a>

## 2. Tokens

**Four tiers:**

| Tier          | Example                                        | Changes per brand? |
| ------------- | ---------------------------------------------- | ------------------ |
| primitives    | `--space-sm: 0.75rem`, `--radius-full: 9999px` | no                 |
| brand palette | `--color-brand-700: #4338ca`                   | yes                |
| semantic      | `--color-text-accent: var(--color-brand-700)`  | yes                |
| component     | `--chip-bg: var(--color-bg-surface)`           | no (only maps)     |

- Component CSS reads the component tier if it exists, otherwise the semantic tier. It never reads
  the palette. Overriding `--color-text-accent` changes every accent; overriding `--chip-bg` changes
  only chips.
- `@arun-dev/tokens/base` contains the primitives and the component tier, but no brand. The consumer
  adds one brand: `default`, `arun`, or one made with `createBrand()` that satisfies
  `BrandSemanticContract`.
- **All token names are public API.** Since `tokens` 1.0.0, renaming or removing a token, or adding a
  `BrandSemanticContract` entry, is a major release. Adding a token is a minor release.

**Brand and theme are set on `:root`.** CSS variables are inherited through the DOM tree. Popups in a
portal or in the top layer are not inside the app's wrapper element, so tokens on a wrapper would not
reach them. Each brand stylesheet has three theme modes:

| Mode   | Selector                                                                |
| ------ | ----------------------------------------------------------------------- |
| system | `@media (prefers-color-scheme: dark) { :root:not([data-theme=light]) }` |
| dark   | `[data-theme="dark"]` on `<html>`                                       |
| light  | `[data-theme="light"]` on `<html>`                                      |

**`ui` reads only variables that `tokens` defines.** If a variable is missing, `var()` is invalid and
the browser silently uses a fallback, with no error. `token-contract.unit.spec.ts` fails when `ui`
reads a name that `tokens` does not define. A variable that `ui` or headless sets at runtime, such as
`--drawer-swipe`, must also be defined in `tokens` with a default value.

Because of this, app-specific words do not belong in `ui`. `ui` has generic tones (`success`,
`warning`, `error`, `info`), and the app maps its own values to them in TypeScript.

**Rules out:** component CSS reading the palette; two brands on one page (this would need a brand
context and a portal container prop); CSS variables that only the consumer defines.

---

<a id="decision-3"></a>

## 3. Behaviour in headless, native elements first

**Rule: if it needs JavaScript, it goes in `@arun-dev/headless`.**

| `@arun-dev/headless`                           | `@arun-dev/ui`      |
| ---------------------------------------------- | ------------------- |
| state that changes over time                   | class names, tokens |
| keyboard handling the browser does not provide | choice of element   |
| focus management                               | variants            |
| ARIA values that must be calculated            |                     |
| making a custom element act like a native one  |                     |

**Use the native element unless it fails one of these tests:**

| Test          | Fails when                                                                |
| ------------- | ------------------------------------------------------------------------- |
| **Content**   | it cannot contain what the design needs (`<input>` has no children)       |
| **Styling**   | it cannot be styled to the design in every supported browser              |
| **Behaviour** | its built-in behaviour is different from the pattern (a two-thumb slider) |

A native element brings focus, keyboard, form and dismiss behaviour that we do not write or test.
Browser support for new features, such as anchor positioning or `popover="hint"`, is checked for each
component.

**Even when a test fails, check what is lost.** Browsers, form libraries, autofill, `:checked`,
constraint validation and testing tools all work with native elements. A custom element keeps only
what we rebuild. So: leave the native element only if the gain is impossible natively **and** the
loss can be rebuilt.

Custom, because an indicator or thumb cannot go inside an `<input>`. Each is a `<button>` with a
hidden `<input type="checkbox">` for the form:

| Component  | Gain                                               | Loss         | Rebuilt with     |
| ---------- | -------------------------------------------------- | ------------ | ---------------- |
| `Checkbox` | indicator with JSX; three states in one typed prop | `register()` | one `Controller` |
| `Switch`   | thumb with an icon or spinner                      | `register()` | one `Controller` |

Native, because a custom element would gain little and lose what cannot be rebuilt:

| Component    | A custom element would gain        | A custom element would lose                                                            |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------------------- |
| `Button`     | nothing; `<button>` holds anything | focus, Enter/Space activation, `disabled`                                              |
| `RadioGroup` | an indicator; `::before` does this | arrow-key selection, one Tab stop, `required`, form behaviour                          |
| text fields  | nothing                            | autofill, IME, spellcheck, mobile keyboards, password managers (**cannot be rebuilt**) |

**react-hook-form binding.** `register()` writes to a native input and listens for its `change`
event. If the value is in React state, writing to the DOM does nothing, and reading state from the
DOM is not allowed ([decision 4](#decision-4)). These components use `Controller` instead.
`react-hook-form-contract.unit.spec.tsx` tests both cases.

| Uses `register()`                                                  | Uses `Controller`                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `Input`, `Textarea`, `Select`, `Slider`, uncontrolled `DatePicker` | `Checkbox`, `Switch`, `RadioGroup`, `OtpInput`, `RangeSlider`, `Combobox` |

**Form reset.** When the value is in React state, `form.reset()` resets the DOM but not React. The form
would then show one value and submit another. The internal `core/useFormReset` fixes this. After the
`reset` event finishes (and was not cancelled) and the page re-renders, it sets the value back to the
mount-time value through the component's setter. It compares after the render, so a form library that
calls `form.reset()` itself does not get a second change event. RadioGroup runs it once for the whole
group, because one reset per radio would conflict. OtpInput and RangeSlider keep the input's default
value equal to their value, which has the same effect.

**Applied:** `Button` always renders a `<button>`; links are `Link`. `Switch.Root` and `Checkbox.Root`
are `<button>`s; if `render` gives a different element, that is the consumer's choice
([decision 4](#decision-4)). `RadioGroup.Item` is a real `<input type="radio">`, and `RadioGroup.Root`
holds the value.

**Rules out:** adding focus, activation or `disabled` in JavaScript to an element that does not have them.

---

<a id="decision-4"></a>

## 4. `render`, merging and state

**`render` changes the element.** Every component accepts `render`. Unknown props (`id`, `aria-*`,
`data-*`, event handlers) are passed to the element.

```tsx
<Chip render={<li />}>React</Chip>
```

**Merging.** `useRender` merges in a fixed order, so no component can change it:

```ts
mergeProps(props, consumerProps); // then mergeProps(merged, render.props)
```

| Prop kind                    | Rule                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| values, including `children` | the last one wins; `undefined` is ignored                             |
| event handlers               | all run; the consumer's handler runs first, the component's runs last |

- `undefined` is ignored, so a missing prop does not remove a set one. As a result, a prop cannot be
  removed by merging. Components avoid this need by not adding props they must not have.
- `children` follows the same rule: `<Chip render={<li />}>React</Chip>` keeps the component's
  children, and `<Chip render={<li>Vue</li>} />` keeps the `render` element's children.
- The consumer can stop the component's handler with `event.preventComponentHandler()`. Radix and
  Base UI use the same order. It is a separate method because `preventDefault()` already means "stop
  the browser's default action". It exists only on real events (`'nativeEvent' in event`); callbacks
  such as `onCheckedChange(boolean)` always run every handler.

**State belongs to the component.**

| Layer                                              | Set by                             | Can `render` change it?  |
| -------------------------------------------------- | ---------------------------------- | ------------------------ |
| **State**: `checked`, `disabled`, `indeterminate`… | the component's own props          | no                       |
| **Attributes**: ARIA, `data-*`, `disabled`…        | calculated from state, then merged | yes, `render.props` wins |

1. State comes only from the component's props, through `useControlled`. It is never read from
   `render` or the DOM.
2. Attributes, ARIA, `data-*`, the hidden form input and the context that parts read are all
   calculated from that state.
3. `render` has no restrictions: no warnings, no protected props, no required tag.
4. Behaviour checks state, not the element. Handlers check the component's own `disabled`.
5. Every change (click, keyboard, `form.reset()`) goes through one setter, which calls `on…Change`.

```tsx
<Checkbox.Root disabled render={<MyCheckbox disabled={false} />} />
```

The element looks enabled because `render` wins. The checkbox is still disabled: clicks are ignored
and the form input stays disabled. The library cannot inspect a `render` component, so it does not try
to control it. The worst result is markup that does not match the state, in markup the consumer chose
to override.

**Rules out:** `as?: 'span' | 'button'` props, which cannot list every element; a special value that removes a prop during merge.

---

<a id="decision-5"></a>

## 5. Public API

**Export only what a consumer needs to build their own component.** Every export must stay compatible.
Adding an export later is not a breaking change; removing one is.

| Public in `@arun-dev/headless`                                                                        | Internal                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| root: `useRender`, `mergeProps`, `useControlled`, `ComponentEvent`, `UnknownProps`, `UseRenderParams` | `core/useFormReset`, `rovingFocus`, `typeahead`, `anchoring`, `pointerIntent`, `selectedDataAttributes`, etc. |
| each component's subpath, with its props types                                                        |                                                                                                               |

`ui` is a separate package, so it can only import what headless exports. When `ui` needs behaviour,
the behaviour moves into headless (as it did for Button) instead of exporting an internal.

**Props types: a package exports only the types it defines.**

| Component                                                                      | Props type defined in | Exported from `ui`? |
| ------------------------------------------------------------------------------ | --------------------- | ------------------- |
| `Button`, `Chip`, `Input`, `Select`, `Link`, `Stack`, `Heading`, `Calendar`, … | `@arun-dev/ui`        | yes                 |
| `Switch`, `Checkbox`, `RadioGroup`, `Dialog`, `Menu`, `Popover`, `Tabs`, …     | `@arun-dev/headless`  | no                  |

`ui` also exports the value types it defines, such as `ButtonVariant`, `BadgeTone`, `Space` and
`StepperStatus`. For a component built on headless, derive the type:

```tsx
function MySwitch(props: ComponentProps<typeof Switch.Root>) { … }
```

Why: `ui`'s `Switch.Root` uses headless's props today, but it may add its own later. A re-exported
`SwitchRootProps` would then be wrong without any error, and the same type would have two import
paths. `ComponentProps<typeof X>` always matches the component.

**Rules out:** exporting something "in case it is useful"; re-exporting headless props types from `ui`.

---

<a id="decision-6"></a>

## 6. When a component has parts

An element becomes a separate part only if all three are true:

1. **It is a separate DOM element** that the consumer styles, places or replaces.
2. **It needs something from the Root**: state, ids for ARIA, or behaviour.
3. **The consumer decides where it goes.** If the component can place it, it stays internal.

- One element means one component: `Button`, `Link`, `Input` and `Textarea` have no parts. A `<label>`
  is the consumer's own element, linked by `id`.
- `Switch` has `Root` and `Thumb`, because the thumb reads `checked` from context.
- This is separate from [decision 3](#decision-3): a native `<dialog>` still needs `Trigger`, `Title` (it provides the
  `aria-labelledby` id) and `Close`.
- Start with as few parts as possible. Adding a part later is not breaking; removing one is.

**Rules out:** parts added only to match other components; parts for elements the component can place
itself.

---

<a id="decision-7"></a>

## 7. Anchored popups

Popover, Tooltip, HoverCard, Menu, Combobox, DatePicker and Calendar's day details all open next to a
trigger. Each one is a native `popover` element, placed with CSS.

**Opening.** `showPopover({ source })` sets the trigger as the popup's invoker. Tab moves from the
trigger into the popup, and focus returns to the trigger when it closes.

**Placement uses CSS anchor positioning, not JavaScript.**

- Headless sets `anchor-name` on the trigger and `position-anchor` on the popup as inline styles
  (`core/anchoring`). Anchor names are `--hl-anchor-<id>`, so they do not clash with the consumer's.
- `side` and `align` become `position-area`. `position-try-fallbacks` flips the popup when there is
  not enough room. `side` is physical (`top`, `right`, `bottom`, `left`).
- The trigger's width is `anchor-size(width)`. The available height is `max-block-size: 100%`.

Browser support (MDN, September 2026):

| Feature                                                  | Chrome | Firefox | Safari |
| -------------------------------------------------------- | ------ | ------- | ------ |
| `popover` attribute (Baseline since January 2025)        | 114    | 125     | 17     |
| `showPopover({ source })`                                | 137    | 144     | 26     |
| `anchor-name`, `position-area`, `position-try-fallbacks` | 125    | 147     | 26     |
| `position-anchor` with an explicit name                  | 125    | 147     | 26     |
| `popover="hint"`                                         | 151    | 153     | no     |

`position-anchor` is always set, because its default value was different between browsers until
Chrome 151, Firefox 151 and Safari 27. In a browser without anchor positioning, the popup appears in
the centre. It still works: top layer, dismiss and Tab all function.

**Closing.** The browser closes the popup on Esc or an outside click before any code can stop it. The
popup then calls `onOpenChange(false)`. If a controlled parent keeps `open` true, it opens again.

**Popover mode.** An `auto` popover closes on an outside click and closes other `auto` popovers. A
`manual` popover does neither, and works the same in every browser. `hint` is the browser's tooltip
mode, but Safari does not support it.

| Popup                   | Mode     | Why                                                    |
| ----------------------- | -------- | ------------------------------------------------------ |
| Popover, Menu, submenus | `auto`   | outside click, Esc and closing other popups are wanted |
| Tooltip, HoverCard      | `manual` | must not close an open Popover; they manage timing     |
| Combobox                | `manual` | see [decision 10](#decision-10)                        |
| Calendar day details    | `manual` | see [decision 12](#decision-12)                        |
| Toast viewport          | `manual` | see [decision 13](#decision-13)                        |

**Popover** parts: `Root`, `Trigger`, `Popup`, `Close`.

**Tooltip** parts: `Root`, `Trigger`, `Popup`. It has `role="tooltip"` and no `source`, because it never
gets focus. It handles its own hover delay, the delay that lets the pointer reach it, focus, blur and Esc.

**HoverCard** parts: `Root`, `Trigger`, `Popup`. It previews a link and can contain links and buttons,
so it uses `source` and keyboard users can Tab into it.

- The Trigger is an `<a>` and works without the card. A router link is passed through `render`.
- Mouse or pen: opens after `delay` (600 ms). Closes `closeDelay` (300 ms) after the pointer leaves both
  the Trigger and the card.
- Keyboard: `:focus-visible` opens it at once. Focus leaving both closes it. Esc closes it and returns
  focus to the Trigger. Pressing the Trigger closes it.
- **Touch never opens it.** There is no hover to close it, and a tap should follow the link. Its content
  must never be the only way to reach something.
- No role and no ARIA on the Trigger: `aria-describedby` would read the whole card as the link's
  description.

**Tests** run in Chromium, Firefox and WebKit. They check anchor names, `position-area`, opening and
closing. Exact pixel positions are checked by hand in each browser before a release.

**Rules out:** Floating UI or any JavaScript positioning; Portal and Arrow parts; a Popover `Title` part (use `aria-label` or `aria-labelledby`). If older browsers ever need anchoring, a JavaScript engine can be added behind the same `side` and `align` props.

---

<a id="decision-8"></a>

## 8. Disabled items in roving groups

**Arrow keys skip disabled items in every component.** React Aria, MUI and Radix do the same. APG
allows disabled items to stay focusable but does not require it.

`focusableWhenDisabled` on the Root of Tabs, Menu and Menubar changes this:

- the disabled item stays in the arrow-key order;
- it gets `aria-disabled`, not `disabled` (native `disabled` removes focus);
- activating it does nothing, and the consumer's `onClick` does not run.

On Tabs, it only works with `activationMode="manual"`. With `"automatic"`, focusing a tab selects it,
and a disabled tab must never be selected.

Calendar days are the only exception ([decision 12](#decision-12)).

**Rules out:** a different default for each component.

---

<a id="decision-9"></a>

## 9. Menu and Menubar

**Menu** is a Popover popup ([decision 7](#decision-7)) with `role="menu"`.

- Opening focuses the first item (the last item when opened with Up). Up and Down move between items
  (`core/rovingFocus`). Tab closes the menu.
- Items are `<button role="menuitem">`, so Enter, Space and click work natively. Activating an item
  closes all menu levels.
- A separator is the consumer's own `role="separator"` element.

**Typeahead.** Typing focuses the next item whose text starts with the typed letters. Case and accents
are ignored (`core/fold`).

- Keys typed within 500 ms form one search. Repeating one letter cycles through matching items. A
  longer search stays on the current item if it matches ("de" stays on "Delete" and does not jump to
  "Deploy").
- Disabled items are skipped. After a search starts, Space adds a space instead of activating.
- An item's text is `textValue`, or the strings in its `children`. `textContent` is not used, because
  that reads the DOM ([decision 4](#decision-4)).

**Parts:**

| Part             | Element                            | Holds                                          |
| ---------------- | ---------------------------------- | ---------------------------------------------- |
| `Root`           | none                               | open state                                     |
| `Trigger`        | `<button>`                         | —                                              |
| `Popup`          | `popover="auto"`, `role="menu"`    | —                                              |
| `Item`           | `<button role="menuitem">`         | —                                              |
| `CheckboxItem`   | `<button role="menuitemcheckbox">` | its own `checked`, through `useControlled`     |
| `RadioGroup`     | `<div role="group">`               | one `value`; `disabled` disables all its items |
| `RadioItem`      | `<button role="menuitemradio">`    | nothing; checked when the group value matches  |
| `ItemIndicator`  | `<span aria-hidden>`               | nothing; reads `checked` from its item         |
| `Group`          | `<div role="group">`               | nothing; named by its `GroupLabel`             |
| `GroupLabel`     | `<div>`                            | the id used by the group's `aria-labelledby`   |
| `SubmenuRoot`    | none                               | the submenu's open state                       |
| `SubmenuTrigger` | `<button role="menuitem">`         | —                                              |

- Checkbox and radio items keep the menu open when activated, so the user can change several options.
  `closeOnClick` closes it. The consumer's `onClick` runs first, and `preventComponentHandler()` stops
  the change.
- One `ItemIndicator` works for both item types. It is always rendered, so labels stay aligned.
- Arrow keys and typeahead treat all groups as one list.

**Submenus.** A submenu is a `Popup` inside a `SubmenuRoot`. It is `popover="auto"` with its trigger as
`source`. Because the trigger is inside the parent popover, the browser nests them:

- the parent stays open; Esc closes one level; a click elsewhere in the parent closes only the submenu;
- the browser returns focus only when the outermost popover closes, so the submenu moves focus back to
  its trigger itself, in `beforetoggle`;
- the trigger has `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.

Keyboard: Enter, Space and → open the submenu at its first item; ← closes it. The arrows swap in
right-to-left layouts. `side` stays physical (default `'right'`), so an RTL menu passes `side="left"`.

Pointer: resting 100 ms on a trigger opens its submenu without moving focus. When the pointer leaves
the trigger, the triangle between the pointer and the submenu is recorded. For 300 ms, moving inside
that triangle does not close the submenu (`core/pointerIntent`, as in Radix). Touch and pen open
submenus with a tap.

**Menubar** has its own namespace: `Root` (`role="menubar"`), `Menu` (state for one menu, no element),
`Trigger`, `Popup`.

- `Menubar.Menu` provides Menu's context through `useMenuRootValue`. `Menubar.Item`, `CheckboxItem`,
  `RadioGroup`, `RadioItem`, `ItemIndicator`, `Group`, `GroupLabel`, `SubmenuRoot` and `SubmenuTrigger`
  are Menu's parts with new names. Menu's code does not know about the bar.
- `Menubar.Popup` is Menu's Popup. The bar's key handler runs before Menu's, like a consumer handler
  ([decision 4](#decision-4)).
- Keyboard: one Tab stop. ← → move along the bar (↑ ↓ with `orientation="vertical"`), with wrapping,
  swapped in RTL. Home, End and typeahead work on the Triggers. ↓, Enter and Space open a menu at its
  first item; ↑ opens it at its last. In an open menu, → and ← move to the next or previous menu,
  unless a submenu uses the key.
- Pointer: a click opens or closes a menu. While a menu is open, moving to another Trigger opens that
  menu and focuses it. The bar listens to `pointermove`, because `pointerenter` also fires when the
  layout changes under a pointer that did not move.

**Rules out:** typeahead that activates an item; menus that submit forms; a separate submenu content part; logical `side` values; submenus that use only a delay; Base UI's Menubar, where Menu's parts change behaviour inside a bar; plain buttons in a bar (use Toolbar); a modal bar.

---

<a id="decision-10"></a>

## 10. Combobox

A text input that filters a list, with single or multiple selection. Behaviour follows Base UI's
Combobox.

**Items are data.** The Root gets `items: T[]`. `List` gets a function that renders one item. The filter
must run on items that are not rendered yet (lazy or virtualized lists), so items cannot be JSX
children. `itemToString` gives an item's label, and `itemToKey` its identity.

**`value` holds items, not keys:** `T | null`, or `T[]` with `multiple`. The selected state, the input
label and the hidden form inputs come from `value`, not from `items`. So a selected item stays selected
when a new search does not return it.

**Filtering:**

| `filter`   | Result                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| not set    | default: "contains", ignoring case and accents (`core/fold`); exported |
| a function | the consumer's filter; it gets the whole list, so it can sort results  |
| `null`     | no filtering; `items` are shown as given (for server search)           |

Filtering is memoized, and the query is read with `useDeferredValue`.

**Behaviour:**

| Action                   | Single                                 | Multiple                           |
| ------------------------ | -------------------------------------- | ---------------------------------- |
| Pick an item             | input shows its label; popup closes    | added; query cleared; popup closes |
| Pick the selected item   | stays selected                         | removed                            |
| Clear the input text     | value becomes `null`                   | value unchanged                    |
| Esc or outside press     | closes; input shows the selected label | closes; query cleared              |
| `Clear` button           | query and value cleared                | query cleared; value becomes `[]`  |
| Backspace on empty input | —                                      | removes the last item              |

**Keyboard.** Focus stays in the input. The highlighted option is set with `aria-activedescendant`.
Up and Down move the highlight, Home and End jump, Enter picks, Alt+Down opens. With `multiple`, Left
at the start of the input moves to the chips; Left and Right move between chips; Backspace or Delete
removes one. Moving focus out of the input closes the list.

**`required`** is set on the visible input while nothing is selected, because hidden inputs are not
validated by the browser. If the user typed text but picked nothing, the input sets the
`valueMissing` message with `setCustomValidity`.

**Callbacks give a reason.** `onValueChange`, `onInputValueChange` and `onOpenChange` receive
`{ reason }`: `'input'`, `'input-press'`, `'trigger-press'`, `'item-press'`, `'keyboard'`, `'clear'`,
`'chip-remove'`, `'escape'`, `'outside-press'`, `'blur'`, `'form-reset'` or `'value-change'`.

**Long lists.** `onLoadMore` fires when an element at the end of the list scrolls into view. `loading`
sets `aria-busy` on it. `Status` is a live region; `Empty` shows when nothing matches and nothing is
loading. Virtualization is the consumer's job: `List`'s function lets a virtualizer choose what to
render, and `onItemHighlighted(item, { index, reason })` tells it which row to scroll to.

**The popup is `manual`.** In Chromium, `auto` closes the list when the user presses the input, the
Trigger or Clear. Focus never moves into the list, so `auto` gives no benefit. The component closes the
list on a `pointerdown` outside its elements, and handles Esc in the input.

**Parts:** `Root`, `Input`, `InputGroup`, `Trigger`, `Clear`, `Popup`, `List`, `Item`, `Group`,
`GroupLabel`, `Separator`, `Empty`, `Status`, `Chip`, `ChipRemove`, `Value`.

- `InputGroup` wraps the input, chips and buttons. The popup is anchored to it, so the list is as wide
  as the whole field.
- `Value` renders the selection through a function and has no element, so `ui` can draw chips without a
  copy of the value.
- `Chip` and `ChipRemove` need the Root's setter and focus handling.
- `Clear` has `data-visible` only when something is selected and the Root is not disabled.
- A selected item has `data-selected`.

**Groups work like `<optgroup>`.** A group is any object with an `items` array. The filter runs inside
each group and removes empty groups. Keyboard and `Empty` treat all groups as one list. `Group` is
`role="group"`, named by `GroupLabel`; `disabled` on a Group disables its items. `Separator` is
`aria-hidden` with no role, because `role="separator"` inside a listbox fails axe.

**Patterns without a new API** (both covered by browser tests):

- **Create an item:** when the text matches no item, the consumer adds an item labelled with the text,
  and replaces it with the real item in `onValueChange`.
- **Groups in a virtualized list:** the consumer filters with `filter={null}`, flattens groups into rows
  and wraps visible rows in their `Group`.

**Rules out:** a cancellable change event; locked items (an app can put an item back in `onValueChange`); `onCreate`; free-text values; nested groups; the input inside the popup; action rows; an always-visible list (use `<select size>`); grid navigation; a built-in virtualizer; `<input list>` with `<datalist>` (cannot be styled).

---

<a id="decision-11"></a>

## 11. Form controls

**Field** connects a label, description and error to one control. The ids and the changing
`aria-describedby` are calculated, so Field is in headless.

- `Root` creates the ids and holds `invalid`, `disabled` and `required`.
- `Label` is a `<label htmlFor>` pointing at the control.
- `Control` renders its `render` element (`<Input />`, `<Select />`, `<Checkbox.Root />`,
  `<Combobox.Input />`) and adds `id`, `aria-describedby`, `aria-invalid`, `disabled` and `required`.
- `Description` and `Error` register when rendered, so `aria-describedby` lists only what is visible.
  `Error` renders only when `invalid` is true.
- Field does not validate. `invalid` comes from the consumer (react-hook-form's `fieldState`, or the
  browser).
- A group of controls is a native `<fieldset>` with `<legend>`, styled with `.fieldset` classes and the
  same `--field-*` tokens.

**OtpInput** is **one native `<input>`**, transparent, on top of the drawn boxes. This keeps SMS
autofill (`autocomplete="one-time-code"`), paste and password managers working.

| Part    | Element   | Does                                                                                |
| ------- | --------- | ----------------------------------------------------------------------------------- |
| `Root`  | `<div>`   | holds `value`, `length`, `validationType`, `disabled`; `data-complete` when full    |
| `Input` | `<input>` | typing, paste, autofill, the form, and all native props                             |
| `Slot`  | `<div>`   | draws character `index`; `data-active`, `data-filled`, `data-disabled`; aria-hidden |

- The caret position is read from input events and kept over one character, so typing replaces the
  active box. A press goes to the box under the pointer.
- Delete or Backspace in the middle leaves a gap (a space: `"123 56"`), and `pattern` rejects it. A gap
  at the end is removed. Deletion is read from `beforeinput`, because phone keyboards often do not send
  a Backspace key event. `onComplete` fires when all boxes are filled.
- `maxLength` and a `pattern` of exactly `length` characters keep native validation. The component
  handles paste itself, because `maxLength` would cut the text before spaces are removed.
- In `ui` it is one component, `<OtpInput length={6} />`: `className` goes on the row, all other props
  on the `<input>`.

**RangeSlider** is two `<input type="range">` elements on one track. Keys, `step`, the slider role and
form submission are native. Parts: `Root`, `StartInput`, `EndInput`. Each input has its own `name`
(`priceMin=200&priceMax=800`). The Root adds:

- **Order:** one thumb cannot pass the other. The inputs are controlled, so React moves a thumb back if
  the browser moved it too far. `onValueChange` gives the whole range.
- **Fill:** `--range-slider-start` and `--range-slider-end` are set as fractions of the track.
  `accent-color` cannot fill between two thumbs, so `ui` draws the track, fill and thumbs.
- **Top thumb:** `data-raised` marks the input that gets the press where the thumbs overlap.
- **Track press:** inputs accept presses only on their thumbs. A press on the track moves and focuses
  the nearest thumb.

**Button: `pending` and `danger`.**

- `pending` sets native `disabled` and `data-pending`. A disabled `<button>` ignores a second press,
  and the browser does not submit a form through a disabled default button. Trade-off: focus leaves the
  button while pending. The result (a Toast or an error) is what users hear.
- In `ui`, the label stays in place with `opacity: 0` and an `aria-hidden` Spinner on top, so the button
  keeps its width and accessible name.
- `danger` and `danger-ghost` use the error colours (`--color-status-error` on
  `--color-status-error-bg`, and the reverse). That pair already must meet 4.5:1 contrast, so both
  variants pass in every theme and brand.

**Rules out:** a `Fieldset` part; a hidden input next to the OTP boxes; checking the OTP code itself; slider thumbs built with `role="slider"`; more than two thumbs, a minimum gap, or dragging the fill; a focusable pending Button with `aria-disabled` (it would have to block the consumer's handlers); a `loading` prop that replaces the label; a `--color-text-on-error` token.

---

<a id="decision-12"></a>

## 12. Calendar and DatePicker

**The input is native.** A text field cannot be rebuilt ([decision 3](#decision-3)), and
`<input type="date">` / `datetime-local` already has segments, locale typing, the phone picker, `min`,
`max`, `required` and form support. Its value is ISO in every locale. A range and a styled calendar are
added next to it. Chrome's own picker is hidden with CSS.

**Uncontrolled, the input holds the value,** so `register()` works. The Root copies the value from input
events. It reads the input again when the picker opens and after `form.reset()`, because the input is
the state. A calendar pick sets the value through the value setter and fires an `input` event, so form
libraries see it like typing.

**Dates are ISO strings without a time zone.** A value with `Z` or an offset is converted to local time.
Seconds are removed. Date maths uses a `Date` at UTC midnight, so daylight saving changes nothing. There
is no date library: `Intl.DateTimeFormat` gives month and weekday names, and `Intl.Locale#getWeekInfo`
(with a fallback table) gives the first day of the week. Only the Gregorian calendar.

**Ranges are separate components:** DatePicker / DateRangePicker and Calendar / RangeCalendar. A range
value is always `{ start, end }`.

| Headless part                                            | Element                                        |
| -------------------------------------------------------- | ---------------------------------------------- |
| `Calendar.Root`, `RangeRoot`                             | `<div>`: selection, visible month, focused day |
| `Calendar.Heading`                                       | the month name, a polite live region           |
| `Calendar.PrevButton`, `NextButton`                      | `<button>`, disabled at `min` and `max`        |
| `Calendar.Grid`                                          | one month, `<table role="grid">`, `offset`     |
| `Calendar.MonthSelect`, `YearSelect`                     | native `<select>`                              |
| `Calendar.DayDetails`                                    | the details card (below)                       |
| `DatePicker.Root`, `RangeRoot`                           | none: value, open state, limits                |
| `DatePicker.Input`, `StartInput`, `EndInput`             | native date inputs                             |
| `DatePicker.TimeInput`, `StartTimeInput`, `EndTimeInput` | native `<input type="time">`                   |
| `DatePicker.Trigger`, `Popup`, `Close`                   | Popover trigger, popup and close               |

A Calendar inside the picker's Popup gets the value and limits from context; its own props win. `ui`
combines the parts into one component.

**The grid follows APG.** One Tab stop. Arrows move by day and week, Home and End go to the week's
ends, Page Up and Page Down move by month (with Shift, by year). **Disabled days stay focusable.** This
is the exception to [decision 8](#decision-8): if ↓ skipped a day, it would not land one week later.
Disabled days have `aria-disabled` and cannot be picked. Focus stays between `min` and `max`. The popup
is a non-modal Popover. It takes focus when it opens and returns focus to the Trigger after a pick or
Esc.

**Ranges.** Two presses, in any order, with a preview between them. `maxDays` counts days including
both ends. After the first press, days out of reach are disabled, and a range cannot cross an
unavailable day. The end input's `max` follows the start. With `withTime`, new ends get 00:00 and
23:59. `maxHours` limits the time between start and end (40 hours from 14:00 ends at 06:00 on the third
day). If the start moves past either limit, the end is moved back.

**Time** is chosen in the Popup with a native time input. After a day is picked, the Popup stays open
for the time, and `Close` is the Done button.

**Distant months:** `MonthSelect` and `YearSelect` cover `min` to `max`, or 100 years back and 10 years
ahead. In `ui`, `captionLayout="dropdown"` shows them instead of the Heading. The Heading stays as a
hidden live region.

**Day information (optional).** `getDayInfo(date)` returns `tags`, a `description` and `details`. It
runs for every visible day during render, so it must be a lookup, not a fetch. `onVisibleRangeChange`
reports the visible days so the consumer can fetch data. `loading` sets `aria-busy` on the grids.

- Tags go in one attribute, `data-tags="weekend holiday"`, matched in CSS with `~=`.
- Each day shows one mark: the tag that is highest in `tagPriority` (default: booked, holiday, festival,
  birthday), set in `data-mark`. It is a prop because CSS cannot change priority at runtime.
- `ui` gives each built-in tag a colour and a shape (dot, star, diamond, strike), so meaning does not
  depend on colour only. `tagStyles` overrides them per tag, through the Root's `dayProps(date, info)`.
- `DayDetails` is one `popover="manual"` with `role="tooltip"`, anchored to the day and linked by that
  day's `aria-describedby`. Mouse rest opens it after 400 ms; focus (key, click or tap) opens it at
  once. Esc closes it without closing the DatePicker. It has no links or buttons, because the grid
  uses the arrow keys and Tab.

**Rules out:** a custom segmented field; a date library; time zones in values; custom hour and minute columns; a year grid; one mark per tag; one popup per day; HoverCard for day details (it never opens on touch).

---

<a id="decision-13"></a>

## 13. Dialog, Drawer and Toast

**Dialog** uses `showModal()`. The browser provides the top layer, backdrop, inert page, focus trap and
focus return. Headless holds only `open` and its setter.

- State controls the element: after each render it calls `showModal()` or `close()`.
- The browser's own close actions (Esc, backdrop click, `<form method="dialog">`) become requests. A
  controlled parent can refuse them.
- No portal is needed. Scroll lock is CSS: `:root:has(.dialog:modal)`.
- Parts: `Root`, `Trigger`, `Popup`, `Title`, `Close`.

**Drawer** is a Dialog that slides in from an edge. `headless/drawer` re-exports Dialog's `Root`,
`Trigger`, `Title` and `Close`. Its `Popup` is Dialog's Popup with extra props, so Dialog fixes also
fix Drawer.

- `side` is physical: `bottom` (default), `top`, `left`, `right`. It is set as `data-side`, because the
  swipe direction is physical too.
- **Swipe to close** uses pointer events, so finger, pen and mouse all work. After a small distance, a
  press that moves toward the edge becomes a swipe. The distance is written to `--drawer-swipe` with
  `data-swiping`, directly on the element (not React state). On release, if the swipe is a quarter of
  the drawer's size, or faster than 0.5 px/ms, the drawer asks to close through its setter. A
  controlled parent can refuse. The click at the end of a swipe is ignored.
- **Scrolling has priority.** A press becomes a swipe only if no content under it can scroll the other
  way. Then a non-passive `touchmove` listener stops the page from scrolling. Presses in text fields
  never become swipes.
- `ui` animates it with `@starting-style` and `display`/`overlay` transitions. Transitions are off
  while `[data-swiping]` is set. The grab bar is a `::before`. Some backdrop (`--drawer-viewport-gap`)
  always stays visible.

**Toast** holds a queue and timers. Parts: `Provider` (`limit`, default `timeout`), `useToastManager()`
(`add`, `update`, `close`, and the list of toasts), `Viewport`, `Root`, `Title`, `Description`,
`Action`, `Close`.

- `Viewport` is a `<section aria-label="Notifications">` with `popover="manual"`, so it shows above a
  modal Dialog without a portal.
- It stays open when empty, so the live region exists before the first toast. It is shown again for
  each new toast, to stay on top.
- Above a modal Dialog it is visible but cannot be clicked, so a toast that may appear then should have
  a `timeout`.
- `aria-live="polite"`. A toast with `priority: 'high'` gets `role="alert"`.
- Timers pause on hover, while focus is inside, and while the page is hidden. Esc closes a focused
  toast.

**Rules out:** a Portal part; snap points; a non-modal or inline drawer; a Handle part; swipe as the only
way to close; swipe to dismiss a toast; a global F6 shortcut; toasts anchored to an element.

---

<a id="decision-14"></a>

## 14. Toggles, Toolbar, Avatar and TreeView

| Component     | Element                 | State and behaviour                                                                                  |
| ------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `Toggle`      | `<button aria-pressed>` | pressed, through `useControlled`                                                                     |
| `ToggleGroup` | `role="group"`          | a `value` array (one item, or many with `multiple`); one Tab stop                                    |
| `Toolbar`     | `role="toolbar"`        | one Tab stop, arrow keys (`core/rovingFocus`); parts `Button`, `Link`, `Input`, `Group`, `Separator` |
| `Avatar`      | `<span>`, `<img>`       | image loaded or not: `Image` shows when loaded, `Fallback` until then (`delay` prevents a flash)     |

**TreeView.** Nested `<details>` gives one Tab stop per `<summary>`, no tree semantics and no selection.
So TreeView is built in headless, following APG: `role="tree"`, one Tab stop.

- **Two parts, `Root` and `Item`; the label is a prop.** An Item is an `<li role="treeitem">` with a
  row (`<div>` with the `label`) and, when open, its children in a `<ul role="group">`. The Item places
  both, so they are not parts.
- The `<li>` gets focus, but `ui` draws focus and selection on the row, so they do not surround the
  children. The `<li>` is named by `aria-labelledby` pointing to the row.
- **An Item with children is a parent.** This is known on the first render, including on the server.
- **Children render only when open.** The tree costs only what is visible, and the registered Items
  are the visible ones. Open branches are stored in the Root's `expanded` list, so a closed branch
  remembers its children's state. Lazy children are added in `onExpandedChange`.
- **Selection is `value: string[]`**, with `multiple` for more than one. It does not follow focus:
  Enter, Space or click selects. With `multiple`: Space toggles, Shift+arrow moves and toggles,
  Ctrl/⌘+A selects all visible Items. Selecting a parent does not select its children.
- **Keyboard:** ↓ ↑ move without wrapping. → opens a parent, then moves to its first child. ← closes a
  parent, or moves to the parent. Both swap in RTL. Home, End, `*` (opens sibling parents), and
  typeahead as in Menu ([decision 9](#decision-9)). Enter also opens or closes a parent. Disabled Items
  cannot get focus.

**Rules out:** a checkbox styled as a toggle (it says "checked", not "pressed"); a tree for site navigation (use nested lists of links); content or label parts; partly-selected parents; `selectionMode="none"` before it is needed.

---

<a id="decision-15"></a>

## 15. Styled native components

These components need no JavaScript, so they exist only in `@arun-dev/ui`. Each is a native element
with classes. Variants are classes, never `data-*` ([decision 1](#decision-1)). Most accept `render`.

| Component                      | Element                              | Notes                                                                                        |
| ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `Card`, `Chip`, `Badge`, `Kbd` | `<div>`, `<span>`, `<kbd>`           | styling only                                                                                 |
| `Input`                        | `<input>` inside a `<div>`           | `startSlot` / `endSlot` in the `<div>`; `className` on the `<div>`, other props on `<input>` |
| `Textarea`                     | `<textarea>`                         | `autoResize` uses `field-sizing: content`                                                    |
| `Select`                       | `<select>` inside a `<div>`          | the `<div>` draws the arrow; no search (use [Combobox](#decision-10))                        |
| `Link`                         | `<a href>`                           | no `disabled`; visited colour `--link-color-visited`; no automatic `target`                  |
| `Separator`                    | `<hr>`                               | `orientation="vertical"`; no margin (spacing comes from the layout's `gap`)                  |
| `Progress`, `Meter`            | `<progress>`, `<meter>`              | styled with browser pseudo-elements; Meter's ranges use success, warning, error              |
| `Slider`                       | `<input type="range">`               | `accent-color` draws the fill; two thumbs: [RangeSlider](#decision-11)                       |
| `Spinner`                      | `<progress>` without `value`         | native `role="progressbar"`; `aria-label` "Loading"; slower with reduced motion              |
| `Skeleton`                     | `<div aria-hidden>`                  | the consumer sets `aria-busy` on the loading region                                          |
| `Alert`                        | `<div>`                              | no live role by default; `tone`, `icon`, `Title`, `Description`                              |
| `Accordion`                    | `<details>`, `<summary>`             | native toggle, keyboard, find-in-page; `Root`'s `exclusive` shares one `name`                |
| `Breadcrumb`                   | `<nav>`, `<ol>`, `<a>`               | `Current` has `aria-current="page"`; separators are CSS `content: "/" / ""`                  |
| `Pagination`                   | `<nav>`, `<ul>`, `<a>` or `<button>` | no page state; links with `getHref`, buttons without; exports `paginationRange()`            |
| `Table`                        | `<table>` and its sections           | `Head` is `<th scope="col">`; sorting is the consumer's button with `aria-sort`              |
| `Stepper`                      | `<ol role="list">`, `<li>`           | `status` on each Item; `current` sets `aria-current="step"`                                  |
| `Stack`, `Grid`                | `<div>`                              | `gap` is a spacing-scale step, applied as a class (`layout-stack-gap-md`)                    |
| `Heading`, `Paragraph`, `Text` | `<h1>`–`<h6>`, `<p>`, `<span>`       | Heading's `level` and `size` are separate; props use the utility classes                     |

Reasons for the less obvious choices:

- **Input, Textarea, Select:** the value stays on the element, so `register()` works
  ([decision 3](#decision-3)). Input's focus, invalid and disabled styles use `:has()` on the native
  control.
- **Slider:** a custom fill would need JavaScript on every input, only for a visual effect.
- **Accordion:** accepted cost: a heading inside `<summary>` is not found by heading navigation. The
  open animation uses `::details-content` and `interpolate-size` where supported.
- **Alert:** an alert that is on the page from the start is content. `role="alert"` would read it on
  page load. The consumer adds `role="alert"` or `role="status"` when it appears after an action.
- **Pagination:** the page usually comes from the URL, so `page` and `count` are required.
  `paginationRange()` always shows the same number of slots (`2 × siblings + 5`), so the row width does
  not change.
- **Stepper:** status is per Item, so steps can complete in any order. The number is a CSS counter in an
  `aria-hidden` span. A visually hidden "(completed)" text, set through the Root's `labels`, gives the
  same information to screen readers.
- **Stack and Grid:** a reset cannot remove a `gap`, and gap classes keep `var(--space-*)` in CSS where
  the token test checks it. Grid sets `--grid-columns` and `--grid-min-item-size` inline. `minItemSize`
  uses `repeat(auto-fill, minmax(min(100%, size), 1fr))`, so it adapts without breakpoints.
- **Typography:** if a heading's size depended on its level, authors would skip levels to get a smaller
  size. Paragraph and Text without `size` or `color` inherit them. A Heading always sets a size.

**Rules out:** scripted Accordion triggers; a data grid; a Stepper that stores the current step or has an error status; responsive layout props; any gap value outside the scale; a `Box` primitive; an element chosen by a variant (`<Text variant="h2">`); text colours other than the `--color-text-*` roles.

---

<a id="decision-16"></a>

## 16. Server Components

In the Next.js App Router, a module is a Server Component unless it says `'use client'`. On the server,
React has no `createContext` and no state hooks, so a module that calls them when it loads breaks the
build.

**`'use client'` only on modules that need it**: modules that create a context, call a hook, or wrap a
headless component that does. All other modules stay on the server and send no JavaScript. Server
modules: `useRender`, `mergeProps` and headless `Button`; in `ui`: `Alert`, `Badge`, `Breadcrumb`,
`Button`, `Card`, `Chip`, `Grid`, `Heading`, `Input`, `Kbd`, `Link`, `Meter`, `Pagination`,
`Paragraph`, `Progress`, `Select`, `Separator`, `Skeleton`, `Slider`, `Spinner`, `Stack`, `Table`,
`Text`, `Textarea`.

**One output file per module.** Both packages build with `unbundle`, so server and client code never
share a file. The build adds the directive back if a bundler removes it.

**Namespace objects are server modules.** On the server, reading a property of a client module's export
throws an error, so `Dialog.Root` would fail. The namespace objects are built in server modules
(`index.parts`), and their members are the client modules. `<Dialog.Root>` in a server component is
then a valid client reference.

**Tested in CI.** The docs app's `server-components` test imports every entry of both packages with
React's server build. Each `'use client'` module acts as a boundary that throws if read. The test also
lists which `ui` components are server components, so moving one to the client must be done on purpose.

**Rules out:** one `'use client'` for all of `ui`; a separate server entry point.
