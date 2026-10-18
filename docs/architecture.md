# Architecture decisions

Recorded decisions for `arun-design-system`: what is built, why, and what it rules out. Decisions 1–6
are the rules every component follows; 7–16 apply them to groups of components. Code comments cite
these numbers.

| #   | Decision                                                    | In short                                                                                                               |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | [Layering](#decision-1)                                     | `tokens` (CSS), `headless` (behaviour) and `ui` (styling), coupled only by CSS variable and `data-*` names.            |
| 2   | [Tokens](#decision-2)                                       | Four tiers, brand and theme on `:root`, and every variable `ui` reads is defined in `tokens`.                          |
| 3   | [Behaviour in headless, native elements first](#decision-3) | What needs JavaScript is headless. A native element is left only when the gain is impossible and the loss recoverable. |
| 4   | [`render`, merging and state](#decision-4)                  | `render` changes the element; the consumer's props win and their handler runs first; state comes only from props.      |
| 5   | [Public API](#decision-5)                                   | Export only what a consumer building their own component needs; props types from the package that defines them.        |
| 6   | [Parts are earned](#decision-6)                             | A part is its own element, needs the Root, and is placed by the consumer. Fewest parts first.                          |
| 7   | [Anchored popups](#decision-7)                              | Native `popover`, positioned by CSS anchor positioning. Covers Popover, Tooltip and HoverCard.                         |
| 8   | [Disabled items in roving groups](#decision-8)              | Arrow keys skip disabled items; `focusableWhenDisabled` opts in to keeping them.                                       |
| 9   | [Menu and Menubar](#decision-9)                             | Menu items, typeahead from props, checkable items, nested submenus, and a Menubar over Menu's internals.               |
| 10  | [Combobox](#decision-10)                                    | `items` as data, `value` holds items, Base UI's behaviour; virtualization is the consumer's.                           |
| 11  | [Form controls](#decision-11)                               | Field, OtpInput, RangeSlider and Button's `pending` and `danger`.                                                      |
| 12  | [Calendar and DatePicker](#decision-12)                     | The native date input is the field; a calendar, ranges, limits, time and day information sit beside it.                |
| 13  | [Dialog, Drawer and Toast](#decision-13)                    | Top-layer surfaces: `showModal()`, a swipe-to-close Dialog, and a toast queue in a `manual` popover.                   |
| 14  | [Toggles, Toolbar, Avatar and TreeView](#decision-14)       | Small stateful components, and an APG tree with two parts.                                                             |
| 15  | [Styled native components](#decision-15)                    | Components with no headless half: a native element and classes, with the few choices each made.                        |
| 16  | [Server Components](#decision-16)                           | `'use client'` per module; namespace objects are built in server modules.                                              |

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

The two arrows are the only couplings, and both are **name contracts**, not imports:

| Seam                | Contract                 | Enforced by                             |
| ------------------- | ------------------------ | --------------------------------------- |
| tokens → ui         | custom property names    | `token-contract.unit.spec.ts`           |
| headless → ui's CSS | `data-*` attribute names | `state-attribute-contract.unit.spec.ts` |

`ui` never imports `tokens` in JS or CSS; it reads custom properties by name and relies on the
consumer loading a token layer. It imports `headless` in JS (a peer dependency), but its CSS knows
headless only through attribute names, so `data-*` is reserved for what headless emits. `tokens`
needs no React, and `headless` needs no stylesheet.

**Rules out:** a JS theme object, CSS-in-JS, runtime style generation, and `headless` depending on
`ui` in any direction, its prose included.

---

<a id="decision-2"></a>

## 2. Tokens

**Four tiers.**

| Tier          | Example                                        | Brand-specific? |
| ------------- | ---------------------------------------------- | --------------- |
| primitives    | `--space-sm: 0.75rem`, `--radius-full: 9999px` | no              |
| brand palette | `--color-brand-700: #4338ca`                   | yes             |
| semantic      | `--color-text-accent: var(--color-brand-700)`  | yes             |
| component     | `--chip-bg: var(--color-bg-surface)`           | no (maps only)  |

Component CSS reads the component tier where one exists, the semantic tier otherwise, and never the
palette. So `--color-text-accent` moves every accent surface, and `--chip-bg` moves only chips.

`@arun-dev/tokens/base` holds the primitives and the component tier, and no brand. The consumer adds
one brand: `default`, `arun`, or one made with `createBrand()` against `BrandSemanticContract`.

**Every name is public, so names are versioned.** From `tokens` 1.0.0, renaming or removing a token,
or adding a `BrandSemanticContract` entry, is a major release; a new token is a minor.

**Brand and theme live on `:root`.** Custom properties inherit through the DOM, and portaled or
top-layer content sits outside any wrapper, so brand tokens are declared on `<html>`, never a subtree.
Each brand stylesheet carries three theme modes:

| Mode   | Selector                                                                |
| ------ | ----------------------------------------------------------------------- |
| system | `@media (prefers-color-scheme: dark) { :root:not([data-theme=light]) }` |
| dark   | `[data-theme="dark"]` on `<html>`                                       |
| light  | `[data-theme="light"]` on `<html>`                                      |

**`ui` reads only what `tokens` defines.** A `var()` naming a property only the consumer defines
resolves as invalid, a fallback quietly takes over, and nothing warns. `token-contract.unit.spec.ts`
fails on any name `ui` reads that `tokens` does not define. A variable `ui` sets itself — per variant,
or inline from headless such as `--drawer-swipe` — is still defined in `tokens`, with its default. The
test's escape hatch, `var(--x, fallback)` for a consumer-supplied property, must stay unused.

Domain vocabulary therefore belongs to the app: `ui` ships generic tones (`success`, `warning`,
`error`, `info`), and an app maps its own words onto them at the call site, where TypeScript checks it.

**Rules out:** component CSS reading the palette; two brands on one page (that would need a brand
context and a portal container prop); consumer-supplied custom properties.

---

<a id="decision-3"></a>

## 3. Behaviour in headless, native elements first

**The test is: does it require JavaScript?**

| Originates in `@arun-dev/headless`                   | Originates in `@arun-dev/ui`   |
| ---------------------------------------------------- | ------------------------------ |
| state that changes over time                         | class names and tokens         |
| keyboard handling beyond the platform's              | element choice and convenience |
| focus management                                     | variants                       |
| ARIA that has to be computed                         |                                |
| making a non-native element behave like a native one |                                |

**Native first.** A component uses the native element unless it fails one of three tests:

| Test          | Fails when                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| **Content**   | it cannot hold what the design needs — `<input>` is void, `<option>` is text |
| **Styling**   | it cannot be styled to the design in every supported browser                 |
| **Behaviour** | its built-in behaviour differs from the pattern — two thumbs on one slider   |

Every native element used is focus, keyboard, form or dismissal code neither written nor tested here.
Support for newer features — anchor positioning, `popover="hint"` — is checked per component.

**Weighing the loss.** A native element is a **protocol**: the browser, form libraries, autofill,
`:checked`, constraint validation and testing tools all speak it. Leave it only when what you gain is
impossible natively _and_ what you lose can be rebuilt.

Left the native element — an indicator or a thumb cannot go inside an `<input>`, so each is a
`<button>` with a hidden `<input type="checkbox">` for the form:

| Component  | Gained                                                   | Lost         | Rebuilt by       |
| ---------- | -------------------------------------------------------- | ------------ | ---------------- |
| `Checkbox` | an indicator holding JSX; three states as one typed prop | `register()` | one `Controller` |
| `Switch`   | a thumb holding an icon or a spinner                     | `register()` | one `Controller` |

Stayed native — leaving would gain little and lose what cannot be rebuilt:

| Component    | Leaving would gain                             | Leaving would lose                                                                   |
| ------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Button`     | nothing — a `<button>` holds any content       | focus, Enter/Space activation, `disabled`                                            |
| `RadioGroup` | an indicator — but a dot needs only `::before` | arrow-key selection, one Tab stop, `required`, the form protocol                     |
| a text field | nothing                                        | autofill, IME, spellcheck, mobile keyboards, password managers — **not recoverable** |

**Binding to react-hook-form.** `register()` needs to write a native input and hear its `change`
event. Wherever the value lives in React state, a write to the DOM goes unheard, and reading state
back from the DOM is ruled out ([decision 4](#decision-4)); those controls bind with `Controller`,
react-hook-form's own API for this case. `react-hook-form-contract.unit.spec.tsx` pins both.

| Binds with `register()`                                            | Binds with `Controller`                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `Input`, `Textarea`, `Select`, `Slider`, uncontrolled `DatePicker` | `Checkbox`, `Switch`, `RadioGroup`, `OtpInput`, `RangeSlider`, `Combobox` |

**The reset seam.** For a value held in React, `form.reset()` resets the DOM but not React, so the
form would show one value and submit another. `core/useFormReset` (internal) closes it: after the
`reset` event finishes uncancelled and the page re-renders, it restores the mount-time value through
the component's one setter. Comparing after that render means a library's own `reset()` is not
reported twice. RadioGroup runs it once at the group, since per-radio resets would race. OtpInput and
RangeSlider keep the input's default equal to their value, which gets the same result.

**How the core controls apply it.** `Button` always renders a `<button>`; navigation is `Link`.
`Switch.Root` and `Checkbox.Root` are `<button>`s; a `render` producing anything else is the
consumer's choice ([decision 4](#decision-4)). `RadioGroup.Item` is a real `<input type="radio">`
and `RadioGroup.Root` owns the value.

**Rules out:** behaviour in `ui`; synthesising focus, activation or `disabled` for an element that
lacks them; one input per box where a text field is involved.

---

<a id="decision-4"></a>

## 4. `render`, merging and state

**`render` changes the element.** Every component takes `render`, and spreads unrecognised props
(`id`, `aria-*`, `data-*`, handlers) onto the element:

```tsx
<Chip render={<li />}>React</Chip>
```

**Merging.** `useRender` takes the component's props and the consumer's as separate named arguments,
then merges `render`'s own props on top, so no component can reorder the three tiers:

```ts
mergeProps(props, consumerProps); // then mergeProps(merged, render.props)
```

| Merged as                     | Rule                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| plain values (and `children`) | left to right — the later object wins; `undefined` is skipped            |
| event handlers                | chained, right to left — the consumer's runs first, the component's last |

- `undefined` is skipped so an absent prop never clobbers a present one. Nothing can retract a prop,
  and nothing needs to: a component that must not carry one does not add it.
- `children` is a plain value: `<Chip render={<li />}>React</Chip>` keeps the component's children,
  `<Chip render={<li>Vue</li>} />` keeps its own.
- The consumer can stop the component's handler with `event.preventComponentHandler()`, as Radix
  (`composeEventHandlers`) and Base UI (`preventBaseUIHandler()`) allow. A dedicated method, because
  `preventDefault()` already means "cancel the browser's default". It is attached only to real events
  (`'nativeEvent' in event`); `onCheckedChange(boolean)` always runs every handler.

**State is owned by the component.**

| Layer                                                | Set by                          | Can `render` change it?   |
| ---------------------------------------------------- | ------------------------------- | ------------------------- |
| **State** — `checked`, `disabled`, `indeterminate`…  | the component's own props       | no                        |
| **Element attributes** — ARIA, `data-*`, `disabled`… | derived from state, then merged | yes — `render.props` wins |

1. State comes only from the component's props, through `useControlled` — never from `render` or the
   DOM.
2. Attributes, ARIA, `data-*`, the hidden form input and what parts read from context all derive from
   that state.
3. `render` is unrestricted: no warnings, no protected keys, no tag enforcement.
4. Behaviour reads state, never the element — handlers guard on the component's own `disabled`.
5. Every change — click, keyboard, `form.reset()` — goes through one setter, which calls `on…Change`.

```tsx
<Checkbox.Root disabled render={<MyCheckbox disabled={false} />} />
```

The element renders enabled, because `render` wins; the checkbox is still disabled — clicks are
ignored and the form input stays disabled. The library cannot inspect a `render` component, so it
does not police one; the worst an override can do is desync markup the consumer chose to override.

**Rules out:** closed `as?: 'span' | 'button'` unions, which cannot name every element and push
consumers to copy class names; a "delete this key" sentinel; overloading `preventDefault()`; dev
warnings about `render`; a protected merge tier for state; reading state back from the element.

---

<a id="decision-5"></a>

## 5. Public API

**Export only what a consumer building their own component needs.** Every export is a compatibility
promise; adding one later is not breaking, removing one is.

| Public in `@arun-dev/headless`                                                                        | Internal                                                                                                             |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| root: `useRender`, `mergeProps`, `useControlled`, `ComponentEvent`, `UnknownProps`, `UseRenderParams` | `core/useFormReset`, `rovingFocus`, `typeahead`, `anchoring`, `pointerIntent`, `selectedDataAttributes` and the like |
| each component's subpath, with its props types                                                        |                                                                                                                      |

`ui` is published separately, so anything it imports from headless must be exported. When `ui` needs
behaviour, the behaviour moves into headless, as Button's did.

**Props types follow ownership.** A package exports the props types it defines and never re-exports
one it borrows.

| Component                                                                      | Props type defined in | Exported from `ui`? |
| ------------------------------------------------------------------------------ | --------------------- | ------------------- |
| `Button`, `Chip`, `Input`, `Select`, `Link`, `Stack`, `Heading`, `Calendar`, … | `@arun-dev/ui`        | yes                 |
| `Switch`, `Checkbox`, `RadioGroup`, `Dialog`, `Menu`, `Popover`, `Tabs`, …     | `@arun-dev/headless`  | no                  |

Value types `ui` defines are exported too — `ButtonVariant`, `BadgeTone`, `Space`, `StepperStatus` —
so an app can map its vocabulary onto them. A headless-backed component's type is derived:

```tsx
function MySwitch(props: ComponentProps<typeof Switch.Root>) { … }
```

`ui`'s `Switch.Root` passes headless's props through today, but may add its own; a re-exported
`SwitchRootProps` would then under-report silently, and one type would have two import paths.

**Rules out:** exporting a primitive "because it might be useful"; re-exporting headless props types
from `ui`.

---

<a id="decision-6"></a>

## 6. Parts are earned

An element becomes a part only when it passes all three:

1. **It is a separate DOM element** the consumer styles, places or replaces.
2. **It needs something from the Root** — state, ids for ARIA wiring, or behaviour.
3. **The consumer decides where it goes.** If the component can place it, it is internal.

One element is one component: `Button`, `Link`, `Input` and `Textarea` have no parts, and a `<label>`
is the consumer's element linked by `id`. `Switch` has `Root` and `Thumb` because the thumb reads
`checked` from context. Parts are independent of native-first: a native `<dialog>` still has
`Trigger`, `Title` (which supplies the `aria-labelledby` id) and `Close`.

Start with the fewest parts: adding one later is not breaking; removing or merging one is.

**Rules out:** parts for symmetry with other components; exposing an element the component can place.

---

<a id="decision-7"></a>

## 7. Anchored popups

Every popup opened next to its trigger — Popover, Tooltip, HoverCard, Menu, Combobox, DatePicker and
Calendar's day details — is a native `popover`, positioned by CSS.

**`showPopover({ source })`.** `source` makes the trigger the invoker: Tab moves from it into the
popup, and focus returns on close.

**Placement is CSS anchor positioning.** Headless sets `anchor-name` and `position-anchor` inline
(`core/anchoring`) and turns `side` and `align` into `position-area`, with `position-try-fallbacks`
flipping it when there is no room. `side` is physical. The trigger's width is `anchor-size(width)`;
available height is `max-block-size: 100%`. Anchor names are `--hl-anchor-<id>`, so they cannot
collide with a consumer's.

Support, from MDN's compatibility data (September 2026):

| Feature                                                  | Chrome | Firefox | Safari |
| -------------------------------------------------------- | ------ | ------- | ------ |
| `popover` attribute — Baseline since January 2025        | 114    | 125     | 17     |
| `showPopover({ source })`                                | 137    | 144     | 26     |
| `anchor-name`, `position-area`, `position-try-fallbacks` | 125    | 147     | 26     |
| `position-anchor` with an explicit name                  | 125    | 147     | 26     |
| `popover="hint"`                                         | 151    | 153     | no     |

`position-anchor` is always set explicitly, since its initial value differed between engines until
Chrome 151, Firefox 151 and Safari 27. Without anchor positioning a popup shows centred, still in the
top layer, dismissable and reachable by Tab.

**Closing is the platform's, reported through one setter.** Light dismiss and Esc close the element
before anyone is asked, so the popup reports `onOpenChange(false)` and reopens if a controlled parent
keeps it open.

**The mode follows what dismissal should do.** `manual` does not close an open `auto` popover and
behaves the same everywhere; `hint` would be the platform's tooltip mode, but Safari lacks it.

| Popup                   | Mode     | Why                                                   |
| ----------------------- | -------- | ----------------------------------------------------- |
| Popover, Menu, submenus | `auto`   | light dismiss, Esc and closing siblings are wanted    |
| Tooltip, HoverCard      | `manual` | must not close an open Popover; they own their timing |
| Combobox                | `manual` | [decision 10](#decision-10)                           |
| Calendar day details    | `manual` | [decision 12](#decision-12)                           |
| Toast viewport          | `manual` | [decision 13](#decision-13)                           |

**Popover** — `Root`, `Trigger`, `Popup`, `Close`.

**Tooltip** — `Root`, `Trigger`, `Popup`; `role="tooltip"`, no `source`, since it is never focused. It
owns its hover delay, the grace period to reach it, focus, blur and Esc.

**HoverCard** — `Root`, `Trigger`, `Popup`. A link's preview that may hold links and buttons, so it
takes `source` and the keyboard reaches it.

- The Trigger is an `<a>` that works without the card; a router's link comes through `render`.
- A mouse or pen opens it after `delay` (600 ms) and closes it `closeDelay` (300 ms) after leaving
  both Trigger and card. `:focus-visible` opens it at once; focus leaving both closes it; Esc closes
  it and returns focus. Pressing the Trigger closes it.
- **Touch never opens it:** there is no hover to end it, and a tap is for the link. So its content is
  supplementary, never the only path to anything.
- No role, and no ARIA on the Trigger: `aria-describedby` would read the whole card as the link's
  description.

**Testing.** Browser specs in Chromium, Firefox and WebKit assert the wiring — anchor names,
`position-area`, open and close. Pixel positions are checked per engine before release.

**Rules out:** Floating UI or any measuring engine; Portal and Arrow parts; a Popover `Title` part
until needed; `popover="hint"`; opening a HoverCard on touch; a pointer-intent triangle for HoverCard,
since nothing lies between it and its Trigger. A JS engine may be added behind the same `side` /
`align` props if older browsers ever need anchoring.

---

<a id="decision-8"></a>

## 8. Disabled items in roving groups

**Arrow keys skip disabled items by default, in every component** — React Aria's and MUI's default,
and Radix's with no opt-in (checked September 2026). APG allows them to stay focusable but does not
require it.

`focusableWhenDisabled` on Tabs', Menu's and Menubar's Roots opts in: a disabled item stays in the
arrow-key sequence, is marked `aria-disabled` (native `disabled` would remove it from focus), and its
activation — the consumer's `onClick` included — is blocked. On Tabs it needs
`activationMode="manual"`: with `"automatic"` focusing a tab selects it, and a disabled tab is never
selected.

The one exception is the calendar grid ([decision 12](#decision-12)).

**Rules out:** a different default per widget.

---

<a id="decision-9"></a>

## 9. Menu and Menubar

Measured against APG's menu and menubar patterns, Radix and Base UI (October 2026).

**Menu** is a Popover's popup ([decision 7](#decision-7)) with `role="menu"`. Opening focuses the first
item (the last, from Up on the Trigger); Up and Down move through items (`core/rovingFocus`); Tab
closes it. Items are `<button role="menuitem">`s, so Enter, Space and a click activate them natively,
and activating one closes every level. A separator is the consumer's `role="separator"` element.

**Typeahead from props.** Typing moves focus to the next item whose text starts with the typed string,
ignoring case and accents (`core/fold`). Keys within 500 ms build one search; a single character
cycles; a longer search may stay put, so "de" keeps "Delete" over "Deploy". Disabled items are
skipped. An item's text is `textValue`, or else the strings in its `children` — reading `textContent`
would read the DOM ([decision 4](#decision-4)). Once a search has started, Space continues it.

**Parts:**

| Part             | Element                            | Holds                                               |
| ---------------- | ---------------------------------- | --------------------------------------------------- |
| `Root`           | none                               | open state                                          |
| `Trigger`        | `<button>`                         | —                                                   |
| `Popup`          | `popover="auto"`, `role="menu"`    | —                                                   |
| `Item`           | `<button role="menuitem">`         | —                                                   |
| `CheckboxItem`   | `<button role="menuitemcheckbox">` | its own `checked`, through `useControlled`          |
| `RadioGroup`     | `<div role="group">`               | one `value`; `disabled` disables every item         |
| `RadioItem`      | `<button role="menuitemradio">`    | nothing: checked while the group's value is its own |
| `ItemIndicator`  | `<span aria-hidden>`               | nothing: reads `checked` from either kind           |
| `Group`          | `<div role="group">`               | nothing: named by its `GroupLabel`                  |
| `GroupLabel`     | `<div>`                            | the id the group's `aria-labelledby` points at      |
| `SubmenuRoot`    | none                               | a submenu's open state                              |
| `SubmenuTrigger` | `<button role="menuitem">`         | —                                                   |

- **Checkable items stay open when activated**, as APG and Base UI allow; `closeOnClick` closes. The
  consumer's `onClick` runs first and `preventComponentHandler()` stops the change. One
  `ItemIndicator` serves both kinds and is always rendered, so labels line up.
- **Groups** are walked as one list by the arrow keys and typeahead.

**Submenus.** A submenu is a `Popup` that knows it is one from context, `popover="auto"` with its
trigger as `source`. The trigger sits inside the parent popover, so the platform nests them: the
parent stays open, Esc closes one level, a click elsewhere in the parent closes only the submenu.
Because the platform returns focus only when the outermost popover closes, a submenu closing with
focus inside moves focus to its trigger in `beforetoggle`. The trigger is the parent's `menuitem` with
`aria-haspopup="menu"`, `aria-expanded` and `aria-controls`.

- Keyboard: Enter, Space and → open at the first item; ← closes; both swap in right-to-left. `side`
  stays physical, defaulting to `'right'`, so an RTL menu passes `side="left"`.
- Pointer: resting 100 ms on a trigger opens its submenu without moving focus. On leaving the
  trigger, the triangle from the exit point to the submenu's near edge is recorded, and for 300 ms
  movement inside it closes nothing (`core/pointerIntent`, Radix's approach). Touch and pen tap.

**Menubar** has its own namespace, Radix's shape: `Root` (`role="menubar"`), `Menu` (one menu's state,
no element), `Trigger`, `Popup`. `Menubar.Menu` provides Menu's root context through
`useMenuRootValue`, so `Menubar.Item`, `CheckboxItem`, `RadioGroup`, `RadioItem`, `ItemIndicator`,
`Group`, `GroupLabel`, `SubmenuRoot` and `SubmenuTrigger` are Menu's parts under the bar's name.
`Menubar.Popup` is Menu's Popup with the bar's key handler in front of its own, as a consumer's is.
Menu's files do not know a bar exists.

- Keyboard: one Tab stop; ← → along the bar (↑ ↓ when `orientation="vertical"`), wrapping, swapped in
  RTL; Home, End, typeahead over the Triggers. ↓, Enter and Space open a menu at its first item, ↑ at
  its last. Inside an open menu, → and ← move to the next or previous menu, after a submenu's own use
  of them.
- Pointer: a click toggles a menu; while one is open, moving onto another Trigger opens it and moves
  focus there. It listens to `pointermove`, since `pointerenter` also fires under a still pointer when
  the bar is laid out.

**Rules out:** reading item text from the DOM; a typeahead that activates; a form-submitting menu; a
submenu content part; logical `side` values; opening on hover with a focus move; delay-only intent;
Base UI's Menubar shape, where Menu's parts change behaviour inside a bar; plain buttons in a bar
(a Toolbar's); a modal bar.

---

<a id="decision-10"></a>

## 10. Combobox

A text input that filters a list, single or multiple. Behaviour follows Base UI's Combobox (October
2026); structure follows this library's decisions.

**Items are data.** The Root takes `items: T[]` and `List` takes a function rendering one item, since
the filter runs over items a lazy or virtualized list never mounts. `itemToString` gives the label,
`itemToKey` the identity. **`value` holds items** — `T | null`, or `T[]` with `multiple` — so selected
state, the input's label and the hidden form inputs never depend on `items`, and a selection survives
a search that no longer returns it.

**Search.** `filter` omitted: the exported default, case- and accent-insensitive "contains"
(`core/fold`). A function: the consumer's, given the whole list so it can rank. `null`: none, for
server search. Filtering is memoised and reads the query through `useDeferredValue`.

| Interaction              | Single                                        | Multiple                           |
| ------------------------ | --------------------------------------------- | ---------------------------------- |
| Pick an item             | input shows its label; popup closes           | added; query cleared; popup closes |
| Pick the selected item   | stays selected                                | removed                            |
| Empty the input          | value becomes `null`                          | value unchanged                    |
| Esc, or press outside    | closes; input goes back to the selected label | closes; query cleared              |
| `Clear`                  | query and value cleared                       | query cleared; value becomes `[]`  |
| Backspace on empty input | —                                             | removes the last item              |

**Keyboard.** Focus stays in the input; the highlight is `aria-activedescendant`. Up and Down move it,
Home and End jump, Enter picks, Alt+Down opens. With `multiple`, Left at the input's start moves into
the chips, Left and Right move between them, Backspace or Delete removes one. Focus leaving closes it.

**`required` is on the visible input** while nothing is selected, since hidden inputs are barred from
constraint validation; typed text that picked nothing gets `valueMissing`'s message via
`setCustomValidity`.

**Callbacks report a reason** — `onValueChange`, `onInputValueChange` and `onOpenChange` take
`{ reason }`: `'input'`, `'input-press'`, `'trigger-press'`, `'item-press'`, `'keyboard'`, `'clear'`,
`'chip-remove'`, `'escape'`, `'outside-press'`, `'blur'`, `'form-reset'` or `'value-change'`.

**Lists.** `onLoadMore` fires when a sentinel at the end scrolls into view; `loading` sets `aria-busy`
on it. `Status` is the live region; `Empty` shows when nothing matches and nothing is loading.
Virtualization is the consumer's: `List`'s function lets a virtualizer decide what mounts, and
`onItemHighlighted(item, { index, reason })` says which row to scroll to.

**The popup is `manual`.** In Chromium, `auto`'s light dismiss closes the list on a press of the
input, Trigger or Clear, and focus never enters the list. The component closes on a `pointerdown`
outside its elements and handles Esc on the input.

**Parts:** `Root`, `Input`, `InputGroup`, `Trigger`, `Clear`, `Popup`, `List`, `Item`, `Group`,
`GroupLabel`, `Separator`, `Empty`, `Status`, `Chip`, `ChipRemove`, `Value`.

- `InputGroup` is the box around input, chips and buttons, and anchors the popup to the whole field.
- `Value` renders the selection through a function with no element, so `ui` draws chips without
  copying the value. `Chip` and `ChipRemove` need the Root's setter and focus handling.
- `Clear` carries `data-visible` only while there is a selection and the Root is enabled.
- The selected check is `data-selected` on `Item`.

**Groups, as `<optgroup>`.** A group is any object with an `items` array. The filter runs inside each
group and drops emptied ones; keyboard and `Empty` see one flat list. `Group` is `role="group"` named
by `GroupLabel`, and its `disabled` disables its Items. `Separator` is `aria-hidden` with no role, as
`role="separator"` inside a listbox fails axe's `aria-required-children`.

**Patterns, not APIs**, both covered by browser tests: _creating an item_ — while the text matches no
item, the consumer adds one labelled with the text and swaps it for the real item in `onValueChange`;
_groups in a virtualized list_ — the consumer filters with `filter={null}`, flattens groups into rows,
and wraps visible rows in their `Group`.

**Rules out:** items as children; selection read from `items` or the DOM; a cancellable change event;
a locked selection (an app restores the item in `onValueChange`); `onCreate`; free-text values; nested
groups; the input inside the popup; action rows; an always-visible list (`<select size>`'s job); grid
navigation; a built-in virtualizer; `<input list>` with `<datalist>`, whose popup cannot be styled.

---

<a id="decision-11"></a>

## 11. Form controls

**Field** ties a label, a description and an error to one control. Ids and an `aria-describedby` that
changes with what is shown are computed ARIA, so it has a headless half. Parts:

- `Root` generates the ids and holds `invalid`, `disabled` and `required`.
- `Label` is a `<label htmlFor>` the control.
- `Control` renders its `render` — `<Input />`, `<Select />`, `<Checkbox.Root />`,
  `<Combobox.Input />` — and merges `id`, `aria-describedby`, `aria-invalid`, `disabled` and
  `required` onto it.
- `Description` and `Error` register when rendered, so `aria-describedby` names exactly what is
  shown; `Error` renders only while `invalid`.

Validity is the consumer's (react-hook-form's `fieldState`, or the browser). A group of controls is a
native `<fieldset>` and `<legend>`, styled by `.fieldset` classes on the same `--field-*` tokens.

**OtpInput** is a **single native `<input>`**, drawn transparent over the boxes, so SMS autofill
(`autocomplete="one-time-code"`), paste and password managers fill it.

| Part    | Element   | Does                                                                                |
| ------- | --------- | ----------------------------------------------------------------------------------- |
| `Root`  | `<div>`   | holds `value`, `length`, `validationType` and `disabled`; `data-complete` when full |
| `Input` | `<input>` | typing, paste, autofill, the form and every native prop                             |
| `Slot`  | `<div>`   | draws character `index`; `data-active`, `data-filled`, `data-disabled`; aria-hidden |

- The caret is read from the input's events and kept over one character, so typing replaces the
  active box; a press maps to the box under the pointer.
- Delete or Backspace before the end leaves a gap — a space in the value, `"123 56"` — which `pattern`
  rejects by itself; a gap at the end is dropped. Deletion is read from `beforeinput`, since phone
  keyboards often send no Backspace key. `onComplete` fires when every slot is filled.
- `maxLength` and a `pattern` of exactly `length` characters keep native validation on. Paste is
  handled by the component, since `maxLength` would truncate before spaces are dropped.
- In `ui` it is one component, `<OtpInput length={6} />`: `className` on the row, the rest on the
  `<input>`.

**RangeSlider** is two `<input type="range">`s stacked on one track: keys, `step`, the slider role and
submission are native. Parts `Root`, `StartInput`, `EndInput`; each input has its own `name`
(`priceMin=200&priceMax=800`). The Root adds:

- **Order** — a thumb stops at the other; the controlled inputs are put back if the platform moved one
  past. `onValueChange` reports the range.
- **The fill** — `--range-slider-start` and `--range-slider-end` as track fractions, since
  `accent-color` cannot fill between two thumbs; `ui` draws track, fill and thumbs.
- **The thumb on top** — `data-raised` on the input that should take a press where thumbs overlap.
- **A press on the track** — inputs take presses only on their thumbs, so the Root moves and focuses
  the nearer thumb.

**Button: `pending` and `danger`.** `pending` sets native `disabled` and emits `data-pending`: a
disabled `<button>` refuses a second press, and the platform will not submit through a disabled default
button. The trade, chosen deliberately: focus leaves the button while pending, and the outcome — a
Toast or the error — is what gets announced. In `ui` the label stays in its grid cell at `opacity: 0`
under an `aria-hidden` Spinner, so the button keeps its width and name. `danger` and `danger-ghost`
reuse the error status pair (`--color-status-error` on `--color-status-error-bg`, and the reverse),
already a required 4.5:1 pairing, so both pass in every theme and brand.

**Rules out:** validation inside Field (Base UI's `validate`); a `Fieldset` part; one input per OTP
box; a hidden input beside the OTP boxes; validating the code itself; `role="slider"` thumbs in script;
more than two thumbs, a minimum distance or dragging the fill; a focusable pending Button with
`aria-disabled`, which would mean withholding the consumer's handlers; a `loading` prop swapping the
label; a `--color-text-on-error` token.

---

<a id="decision-12"></a>

## 12. Calendar and DatePicker

Measured against APG's date picker, React Aria, MUI X, react-day-picker and the native inputs (October
2026).

**The field is the platform's.** A text field cannot be rebuilt ([decision 3](#decision-3)), and
`<input type="date">` / `datetime-local` already is a segmented field: locale typing, the phone's
picker, `min`, `max`, `required` and the form, with an ISO value in every locale. A range and a
styleable calendar are added beside it. Chrome's own picker is hidden by CSS.

**Uncontrolled, the input holds the value**, so `register()` binds it. The Root copies it from the
input's events and re-reads the input when the picker opens and after `form.reset()` — the input is
the state. A calendar pick writes through the value setter and an `input` event, so form libraries
hear it as typing.

**Dates are ISO strings in no time zone.** A value with `Z` or an offset is converted to local time on
the way in; seconds are dropped. Arithmetic uses a `Date` at UTC midnight, so daylight saving moves
nothing. No date library: `Intl.DateTimeFormat` names months and weekdays, `Intl.Locale#getWeekInfo`
(with a region table fallback) gives the first weekday. Gregorian only.

**Separate components for a range:** DatePicker / DateRangePicker and Calendar / RangeCalendar; a
range is always `{ start, end }`.

| Headless part                                            | Element                                      |
| -------------------------------------------------------- | -------------------------------------------- |
| `Calendar.Root`, `RangeRoot`                             | `<div>`: selection, month shown, focused day |
| `Calendar.Heading`                                       | the month, a polite live region              |
| `Calendar.PrevButton`, `NextButton`                      | `<button>`, disabled at `min` and `max`      |
| `Calendar.Grid`                                          | one month, `<table role="grid">`, `offset`   |
| `Calendar.MonthSelect`, `YearSelect`                     | native `<select>`s                           |
| `Calendar.DayDetails`                                    | the details card, below                      |
| `DatePicker.Root`, `RangeRoot`                           | none: value, open state, constraints         |
| `DatePicker.Input`, `StartInput`, `EndInput`             | the native date inputs                       |
| `DatePicker.TimeInput`, `StartTimeInput`, `EndTimeInput` | native `<input type="time">`                 |
| `DatePicker.Trigger`, `Popup`, `Close`                   | a Popover's trigger, popup and close         |

A Calendar inside a picker's Popup takes the picker's value and constraints from context; its own props
win. `ui` composes each into one component.

**The grid, by APG.** One Tab stop; arrows by day and week, Home/End to the week's ends, Page Up/Down
by month (Shift: year). **Disabled days stay focusable** — the exception to
[decision 8](#decision-8), since skipping one would make ↓ land somewhere other than a week later —
`aria-disabled` and unpickable; focus is clamped to `min` and `max`. The popup is a non-modal Popover;
it takes focus on open and returns it to the Trigger on a pick or Esc.

**Ranges** are picked in two presses, either order, previewing in between. `maxDays` counts days with
both ends included; after the first press, days out of reach are disabled, and a range never crosses
an unavailable day. The end input's `max` follows the start. With `withTime`, new ends get 00:00 and
23:59, and `maxHours` caps elapsed time (40 hours from 14:00 ends at 06:00 on the third day): the
calendar gets the spanned days as `maxDays`, a pick past the cap is pulled back, and a start moved past
either limit pulls the end back.

**Time** is set in the Popup with the native time input, written through the date input; a pick then
leaves the Popup open, and `Close` is Done. **Far-off months** are `MonthSelect` and `YearSelect`,
spanning `min`–`max` or 100 years back and 10 ahead; in `ui`, `captionLayout="dropdown"` puts them in
place of the Heading, which stays as an off-screen live region.

**Day information** is optional. `getDayInfo(date)` returns `tags`, a `description` and `details`; it
runs for every day shown, during render, so it is a lookup, never a fetch. `onVisibleRangeChange`
reports the days shown, for the consumer to fetch, and `loading` marks the grids `aria-busy`.

- Tags are one attribute, `data-tags="weekend holiday"`, matched with `~=`. A day draws one mark, for
  its tag highest in `tagPriority` (default booked, holiday, festival, birthday), named in
  `data-mark`. Priority is a prop because CSS cannot reorder a cascade at runtime.
- `ui` gives built-in tags a token colour and a shape (dot, star, diamond, strike), so no mark relies
  on colour alone. `tagStyles` overrides per tag through the Root's `dayProps(date, info)`.
- `DayDetails` is one `popover="manual"`, `role="tooltip"`, anchored to its day and set as that day's
  `aria-describedby`. A resting mouse opens it after 400 ms; focus — key, click or tap — at once; Esc
  hides it without closing a DatePicker's popup. It holds no links or buttons, since the grid owns the
  arrow keys and Tab.

**Rules out:** a hand-built segmented field; a date library; time zones in values; a `mode` prop on one
component; ranges across unavailable days; a modal popup; hand-built hour and minute columns; a year
grid; an async `getDayInfo`; a mark per tag; a popup per day; interactive content in the card;
HoverCard for day details, which never opens on touch.

---

<a id="decision-13"></a>

## 13. Dialog, Drawer and Toast

**Dialog** leans on `showModal()` for the top layer, backdrop, inert page, focus trap and focus return;
headless holds only `open` and its setter. State drives the element, and the platform's own closes —
Esc, a backdrop click, `<form method="dialog">` — become requests a controlled parent can refuse. No
portal; the scroll lock is CSS (`:root:has(.dialog:modal)`). Parts: `Root`, `Trigger`, `Popup`,
`Title`, `Close`.

**Drawer** is a Dialog sliding in from an edge: `headless/drawer` re-exports Dialog's `Root`,
`Trigger`, `Title` and `Close`, and its `Popup` is Dialog's with props merged on, so a fix to Dialog is
a fix to Drawer.

- `side` is physical — `bottom` (default), `top`, `left`, `right` — emitted as `data-side`, because
  the swipe is physical too.
- **Swipe to close** reads pointer events, so finger, pen and mouse work. Past a small slop, a press
  moving toward closing becomes a swipe; the distance is written imperatively as `--drawer-swipe` with
  `data-swiping`. On release, a quarter of the drawer's size or a flick faster than 0.5 px/ms requests a
  close through the one setter, so a controlled parent can refuse. The click ending a swipe is
  swallowed.
- **Content scrolls first:** a press becomes a swipe only when no content between it and the drawer
  can scroll the other way; then a non-passive `touchmove` listener cancels page scroll. Presses in
  text fields are never swipes.
- `ui` slides it with `@starting-style` and discrete `display`/`overlay` transitions, off while
  `[data-swiping]`. The grab bar is a `::before`, and `--drawer-viewport-gap` of backdrop stays visible.

**Toast** holds a queue and timers. Parts: `Provider` (`limit`, default `timeout`), `useToastManager()`
(`add`, `update`, `close`, and the toasts), `Viewport`, `Root`, `Title`, `Description`, `Action`,
`Close`.

- `Viewport` is a `<section aria-label="Notifications">` with `popover="manual"`, so it sits above a
  modal Dialog with no portal. It stays shown while empty, so the live region exists before the first
  toast, and is re-shown as each arrives. Over a modal Dialog it is visible but inert, so a toast that
  may appear then should keep a `timeout`.
- `aria-live="polite"`; `priority: 'high'` makes a toast `role="alert"`.
- Timers pause on hover, on focus inside and while the page is hidden. Esc on a focused toast closes
  it.

**Rules out:** a Portal part; snap points, a non-modal or in-flow drawer, a Handle part, and swiping as
the only way to close; swipe-to-dismiss and a global F6 shortcut on Toast; toasts anchored to an
element.

---

<a id="decision-14"></a>

## 14. Toggles, Toolbar, Avatar and TreeView

| Component     | Element                 | Holds                                                                                                         |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `Toggle`      | `<button aria-pressed>` | pressed, through `useControlled`                                                                              |
| `ToggleGroup` | `role="group"`          | a `value` array — one entry, or any number with `multiple`; one Tab stop                                      |
| `Toolbar`     | `role="toolbar"`        | one Tab stop and arrow keys (`core/rovingFocus`) across `Button`, `Link`, `Input`, `Group`, `Separator` parts |
| `Avatar`      | `<span>`, `<img>`       | whether the image loaded: `Image` shows once loaded, `Fallback` until then (`delay` avoids a flash)           |

**TreeView.** No native element passes: nested `<details>` gives a Tab stop per `<summary>`, no tree
semantics and no selection. So it is headless, by APG: `role="tree"`, one Tab stop.

- **Two parts, `Root` and `Item`, the label as a prop.** An Item is an `<li role="treeitem">` holding a
  row (`<div>` with the `label`) and, while open, its children in a `<ul role="group">`. The Item
  places both, so they are not parts. It is focused; `ui` draws focus and selection on the row, so they
  do not surround the subtree. It is named by `aria-labelledby` to the row.
- **A parent is any Item with children**, known on first render, the server's included.
- **Children render only while open**, so a tree costs what is shown, and the registered Items are
  exactly the visible ones. Expansion is the Root's `expanded` list, so a closed branch keeps its
  descendants' state. Lazy children are set from `onExpandedChange`.
- **Selection is `value: string[]`**, with `multiple` for more than one, and does not follow focus:
  Enter, Space or a click selects. With `multiple`: Space toggles, Shift+arrow moves and toggles,
  Ctrl/⌘+A selects every shown Item. No cascade.
- **Keyboard:** ↓ ↑ without wrapping; → opens, then moves to the first child; ← closes, else moves to
  the parent; swapped in RTL. Home, End, `*` opens sibling parents, typeahead as Menu's
  ([decision 9](#decision-9)). Enter also toggles a parent; disabled Items are not focusable.

**Rules out:** a checkbox styled as a toggle, which says "checked", not "pressed"; a tree for site
navigation (nested lists of links are that); content or label parts; selection following focus;
cascading or indeterminate selection; `selectionMode="none"` until needed.

---

<a id="decision-15"></a>

## 15. Styled native components

These need no JavaScript, so they are `@arun-dev/ui` alone: a native element, a class per variant
(never `data-*`, which is headless's — [decision 1](#decision-1)), and `render` where a more precise
element helps.

| Component                      | Element                              | The choice                                                                                                                 |
| ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `Card`, `Chip`, `Badge`, `Kbd` | `<div>`, `<span>`, `<kbd>`           | styling only                                                                                                               |
| `Input`                        | `<input>` in a `<div>` box           | `startSlot` / `endSlot` in the box; `className` on the box, every other prop on the `<input>`; states styled with `:has()` |
| `Textarea`                     | `<textarea>`                         | one element; `autoResize` is `field-sizing: content`                                                                       |
| `Select`                       | `<select>` in a box                  | the box draws the chevron; no filtering — that is [Combobox](#decision-10)                                                 |
| `Link`                         | `<a href>`                           | no `disabled` (inert on `<a>`); visited colour `--link-color-visited`; no automatic `target`                               |
| `Separator`                    | `<hr>`                               | `orientation="vertical"`; draws no margin — spacing is the layout's `gap`                                                  |
| `Progress`, `Meter`            | `<progress>`, `<meter>`              | engine pseudo-elements; Meter's regions map to success, warning and error                                                  |
| `Slider`                       | `<input type="range">`               | `accent-color` draws the fill; two thumbs are [RangeSlider](#decision-11)                                                  |
| `Spinner`                      | `<progress>` without a value         | native `role="progressbar"`, `aria-label` "Loading"; slows under reduced motion                                            |
| `Skeleton`                     | `<div aria-hidden>`                  | the region it stands in for carries `aria-busy`, set by the consumer                                                       |
| `Alert`                        | `<div>`                              | no live role by default; `tone`, `icon`, `Title`, `Description`                                                            |
| `Accordion`                    | `<details>`, `<summary>`             | native toggle, keyboard and find-in-page; `Root`'s `exclusive` gives Items one `name`                                      |
| `Breadcrumb`                   | `<nav>`, `<ol>`, `<a>`               | `Current` is `aria-current="page"`; separators are CSS `content: "/" / ""`                                                 |
| `Pagination`                   | `<nav>`, `<ul>`, `<a>` or `<button>` | holds no page; links with `getHref`, buttons otherwise; exported `paginationRange()`                                       |
| `Table`                        | `<table>` and its sections           | `Head` is `<th scope="col">`; sorting is the consumer's button and `aria-sort`                                             |
| `Stepper`                      | `<ol role="list">`, `<li>`           | `status` per Item; `current` sets `aria-current="step"`; status reaches CSS as a class                                     |
| `Stack`, `Grid`                | `<div>`                              | `gap` is a step on the spacing scale, as a class (`layout-stack-gap-md`)                                                   |
| `Heading`, `Paragraph`, `Text` | `<h1>`–`<h6>`, `<p>`, `<span>`       | Heading's `level` and `size` are separate; props map onto the utility classes                                              |

The choices that need a reason:

- **Input, Textarea and Select keep their value on the element**, so `register()` binds them
  ([decision 3](#decision-3)).
- **Slider's fill** from a custom property would need script on every input — behaviour, for a visual.
- **Accordion** loses one thing, accepted: a heading inside `<summary>` is not reached by heading
  navigation. Opening animates where `::details-content` and `interpolate-size` exist.
- **Alert** present from the start is content; `role="alert"` would read it at load. The consumer adds
  `role="alert"` or `role="status"` when it appears in response to something.
- **Pagination**: the page is the URL's, so `page` and `count` are required. `paginationRange()` keeps
  the same number of slots (`2 × siblings + 5`) as the page moves, so the row keeps its width.
- **Stepper** status is per Item, so steps can complete out of order. Its number is a CSS counter in an
  `aria-hidden` span; a visually hidden "(completed)" says it in words, via the Root's `labels`.
- **Layout**: a gap cannot be collapsed by a reset, and gap classes keep `var(--space-*)` in CSS, where
  the token contract checks it. Grid sets `--grid-columns` and `--grid-min-item-size` inline;
  `minItemSize` uses `repeat(auto-fill, minmax(min(100%, size), 1fr))`, responsive without breakpoints.
  The `stack` and `grid` layers come right after `reset`, so a component's own styles win.
- **Typography**: tying a heading's look to its level would push authors to skip levels. Paragraph and
  Text without `size` or `color` inherit; a Heading always sets a size.

**Rules out:** `disabled` on Link; a scripted Slider fill; scripted Accordion triggers; a live role on
every Alert; an uncontrolled Pagination; a data grid; a Stepper that holds the step or has an error
status; responsive layout props, arbitrary gap lengths and a `Box` primitive; an element chosen from a
variant (`<Text variant="h2">`); text colours beyond the `--color-text-*` roles.

---

<a id="decision-16"></a>

## 16. Server Components

In the Next.js App Router a module is a Server Component unless marked. On the server React has no
`createContext` or state hooks, so a module calling one while it loads fails the build.

**`'use client'` on every module that needs the client** — one that creates a context, calls a hook,
or wraps a headless component that does. Every other module stays on the server and sends no
JavaScript: `useRender`, `mergeProps` and headless `Button`; in `ui`, `Alert`, `Badge`, `Breadcrumb`,
`Button`, `Card`, `Chip`, `Grid`, `Heading`, `Input`, `Kbd`, `Link`, `Meter`, `Pagination`,
`Paragraph`, `Progress`, `Select`, `Separator`, `Skeleton`, `Slider`, `Spinner`, `Stack`, `Table`,
`Text` and `Textarea`.

**Built per module** with `unbundle`, so a server module never shares a file with a client one; the
build restores the directive where a bundler might drop it.

**Namespaces stay on the server.** Reading a property of a client module's export on the server
throws, so namespace objects are built in server modules (`index.parts`) whose members are client
modules; `<Dialog.Root>` in a server component is then a client reference.

**Proved in CI.** The docs app's `server-components` spec imports every entry of both packages on
React's server build, treating each `'use client'` module as a boundary that throws if read into, and
pins which `ui` components are server components, so moving one to the client is deliberate.

**Rules out:** one `'use client'` over all of `ui`; a separate server entry point.
