# Architecture decisions

Recorded decisions for `arun-design-system`. Each entry states the decision, the reasoning, and what
it rules out.

---

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

The two arrows are the only couplings, and both are **name contracts** rather than
imports:

| Seam                | Contract                 | Enforced by                             |
| ------------------- | ------------------------ | --------------------------------------- |
| tokens → ui         | custom property names    | `token-contract.unit.spec.ts`           |
| headless → ui's CSS | `data-*` attribute names | `state-attribute-contract.unit.spec.ts` |

`@arun-dev/ui` never imports from `@arun-dev/tokens` in JS or CSS — it references custom properties
by name and relies on the consumer having loaded a token layer. It _does_ import from
`@arun-dev/headless` in JS (a peer dependency), but its **CSS** knows headless only through
attribute names. Both packages stand alone: `@arun-dev/tokens` needs no React, and
`@arun-dev/headless` needs no stylesheet.

**Rules out:** a JS theme object, CSS-in-JS, or any runtime style generation. Also rules out
`@arun-dev/headless` depending on `@arun-dev/ui` in any direction, including in its prose.

---

## 2. Tokens are a four-tier chain

| Tier          | Example                                        | Brand-specific? |
| ------------- | ---------------------------------------------- | --------------- |
| primitives    | `--space-sm: 0.75rem`, `--radius-full: 9999px` | no              |
| brand palette | `--color-brand-700: #4338ca`                   | yes             |
| semantic      | `--color-text-accent: var(--color-brand-700)`  | yes             |
| component     | `--chip-bg: var(--color-bg-surface)`           | no (maps only)  |

Component CSS reads the **component** tier where one exists, and the **semantic** tier otherwise.
It must never read the palette tier directly.

This gives two override granularities:

```css
--color-text-accent: #7c3aed; /* moves every accent surface in the system */
--chip-bg: #f4f4f5; /* moves only chips */
```

---

## 3. Brand and theme live on `:root`

One brand per document. Brand and theme tokens are declared on `:root` / `<html>`, never scoped to
a subtree.

**Why:** custom properties inherit through the DOM tree, and React portals move nodes out of it. A
popup portaled into `<body>` would not inherit tokens scoped to a wrapper element. Declaring at
`:root` means portaled content inherits correctly with no extra machinery.

**Rules out:** two brands rendered on the same page. If that is ever required it needs an explicit
brand context and a portal container prop — deliberately not built.

**Theme states** — all three supported, handled entirely in `semantic.css`:

| Mode   | Selector                              |
| ------ | ------------------------------------- |
| system | `@media (prefers-color-scheme: dark)` |
| dark   | `:root[data-theme="dark"]`            |
| light  | `:root[data-theme="light"]`           |

Because the attribute sits on `<html>`, portaled content follows the theme for free.

---

## 4. `@arun-dev/ui` owns every token it reads

The library must not depend on custom properties that only a consumer defines. An undeclared
dependency of that kind fails silently: the `var()` resolves as invalid, a fallback quietly takes
over, and nothing warns.

Enforced by a CSS contract test that diffs every `var(--...)` used by `@arun-dev/ui` against every
property defined by `@arun-dev/tokens`. The diff must be empty.

**Consequence:** domain vocabulary belongs to the consuming app, not the design system. The library
ships generic tones (`success`, `warning`, `error`, `info`); an app maps its own vocabulary onto
them at the call site, where TypeScript can check it.

---

## 5. Composition via `render`, not element unions

Components accept a `render` prop to change the rendered element:

```tsx
<Chip render={<li />}>React</Chip>
```

**Rules out:** closed `as?: 'span' | 'button'` unions. They cannot express every element a consumer
needs, and when they fall short the consumer abandons the component and writes the class names by
hand — which is what happened before this decision.

All components also spread unrecognised props onto the rendered element, so `id`, `aria-*`,
`data-*` and event handlers pass through.

---

## 6. Props types follow ownership

A package exports the props types it **defines**, and never re-exports one it merely borrows.

| Component                                                        | Props type defined in | Exported from `ui`? |
| ---------------------------------------------------------------- | --------------------- | ------------------- |
| `Button`, `Card`, `Chip`, `Badge`, `Input`, `Textarea`, `Select` | `@arun-dev/ui`        | yes                 |
| `Switch.Root`, `Switch.Thumb`                                    | `@arun-dev/headless`  | no                  |

Prop _value_ types are exported the same way — `BadgeTone`, `ButtonVariant`, `ChipVariant` — since
a consumer must be able to construct those values and map their own vocabulary onto them, per
decision 4.

For `Switch`, consumers derive the type instead:

```tsx
function MySwitch(props: ComponentProps<typeof Switch.Root>) { … }
```

**Why not re-export the headless types:** an exported alias records where a type comes from
_today_. `@arun-dev/ui`'s Switch is currently a pure pass-through, but it is allowed to stop being
one. The moment it adds a prop of its own, a re-exported `SwitchRootProps` is wrong — and wrong
silently, because it still compiles and merely under-reports. `ComponentProps<typeof X>` is a
reference to the component rather than a snapshot of its type's origin, so it stays correct
through that change. Re-exporting would also give one type two import paths and two version
timelines.

That risk does not exist for types `@arun-dev/ui` defines itself: they cannot fall out of step with
components in the same package, so they are exported by name.

**Rules out:** `export type { SwitchRootProps } from '@arun-dev/headless/switch'` in `ui`. If
`@arun-dev/ui`'s Switch ever needs props of its own, it defines its own type — and at that point
owns it, and exports it.

---

## 7. Behaviour originates in `@arun-dev/headless`

The test is not "does it have a state-like prop" but **does it require JavaScript?**

| Originates in `@arun-dev/headless`                   | Originates in `@arun-dev/ui`   |
| ---------------------------------------------------- | ------------------------------ |
| state that changes over time                         | class names and tokens         |
| keyboard handling beyond the platform's              | element choice and convenience |
| focus management                                     | variants                       |
| ARIA that has to be computed                         |                                |
| making a non-native element behave like a native one |                                |

**Worked example — `disabled` on Button.** A native `<button disabled>` needs no
JavaScript: the platform removes it from the tab order, suppresses activation and
exposes `:disabled`. An `<a href>` gets none of that, and a `disabled` attribute on it
is inert — the link stays focusable, still fires handlers and still navigates.

The first answer was to synthesise the missing half: `useButton` gave any element a
`tabIndex`, `Enter`/`Space` handlers, a `role`, and — when disabled — stripped the
consumer's activation handlers and retracted the `href`. It reached 172 lines, needed a
`nativeButton` escape hatch because a `render` component cannot be inspected, and needed
`retractActivationProps` because a `render` element's own props outrank everything.

**That was the wrong layer to solve it at.** The second answer is to choose an element
that already behaves. It went through `<button>` or `<a href>` chosen by an `href` prop;
the final form is simpler still — `Button` always renders a `<button>`, which is natively
focusable and activatable, so there is nothing left to synthesise. Navigation is not a
button's job: a link is a separate `Link` component. `useButton`, `nativeButton`,
`retractActivationProps` and `href` are all gone.

`Switch.Root` is the same decision: its default is a native `<button>`. A `render`
producing anything else is neither reported nor compensated for — it is the consumer's
choice (decision 10). Radix makes the same element choice — its Switch is a
`<button role="switch">` and `asChild` is for wrappers that forward to one.

**Rules out:** behaviour in `@arun-dev/ui`; also synthesising platform behaviour for an
element that was never going to be right. If a component needs the platform's focus and
keyboard handling, it renders an element that has them.

### Native first

A component uses the native element unless that element fails one of three tests:

| Test          | Fails when                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| **Content**   | it cannot hold what the design needs — `<input>` is void, `<option>` is text |
| **Styling**   | it cannot be styled to the design in every supported browser                 |
| **Behaviour** | its built-in behaviour differs from the pattern — a multi-thumb slider, say  |

Passing all three means native: `Button` is a `<button>`, a link is an `<a href>`, a
dialog is a `<dialog>` opened with `showModal()`. Failing one means a custom element that
still leans on native pieces where it can — `Switch.Root` fails the content test (a thumb
cannot go inside an `<input>`), so it is a `<button>` carrying a hidden
`<input type="checkbox">` for the form. `Checkbox.Root` fails it the same way, for the
same reason: an indicator cannot go inside an `<input>` either.

**The seam that pattern opens.** The platform resets the hidden input on `form.reset()`
but knows nothing of the React state behind `aria-checked` and the `data-*` attributes,
so a reset form would show one value and submit another. `core/useFormReset` closes it
for both components — it restores the state the component mounted with, through the same
setter a click goes through, once the `reset` event has finished dispatching and no
listener has cancelled it. It is internal: shared between components, not exported.

Checkbox is what shows the cost of _not_ having that. Native `indeterminate` is a DOM
property with no attribute behind it, so React cannot set it declaratively, the first
click clears it behind React's back, and `form.reset()` leaves it untouched — three
imperative fixes that a native `<input>` would have demanded anyway. Choosing the element
that already behaves only pays off when the element actually behaves.

Every native element used is focus, keyboard, form or dismissal code that is neither
written nor tested here. Browser support for the newer candidates — customisable
`<select>`, CSS anchor positioning, `popover="hint"` — moves fast, so each is checked when
its component is designed rather than decided in advance.

### Weighing the loss when a test fails

The three tests say _whether_ the native element fits. They do not say what leaving it
costs, and the cost is easy to underestimate, because a native element is not a bundle of
features — it is a **protocol**. Everything that speaks it works for free: the browser,
form libraries, autofill, `:checked`, the constraint-validation API, testing tools. Leave
the protocol and you keep only the parts you re-implement by hand.

The hidden input is exactly such a partial re-implementation, and it covers one direction:

| Half of the protocol | What it means                                    | Restored by the hidden input                      |
| -------------------- | ------------------------------------------------ | ------------------------------------------------- |
| **Read**             | something asks the form what the value is        | yes — `FormData`, `form.elements`, `form.reset()` |
| **Write**            | something sets the value and expects to be heard | no                                                |

react-hook-form's `register()` needs the write half, so it cannot work here: it hands back
a `ref` for a native input and an `onChange` for a `change` event, and a `<button>` has
neither. Supporting it would mean reading state back out of the DOM, which decision 10
rule 1 rules out for every component at once. `Controller` is the answer, and it is
react-hook-form's own API for this case. `react-hook-form-contract.unit.spec.tsx` in
`@arun-dev/ui` pins both halves — what works, and that `register()` does not.

**The rule.** Leave the native element only when what you gain is impossible on the
platform _and_ what you lose can be rebuilt in userland.

| Component    | Gained                                                   | Lost                                                                       | Recoverable?                                                      |
| ------------ | -------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Checkbox`   | an indicator holding JSX; three states as one typed prop | `register()`                                                               | yes — one `Controller`                                            |
| `Switch`     | a thumb holding an icon or a spinner                     | `register()`                                                               | yes — one `Controller`                                            |
| `Button`     | —                                                        | focus, `Space`/`Enter`, `disabled`                                         | in principle; `useButton` reached 172 lines before being deleted  |
| `Radio`      | an indicator holding JSX — a dot needs only `::before`   | arrow-key selection, roving Tab stop, `required`, the form protocol        | only by building roving tabindex, shipped with Tabs (decision 13) |
| a text field | —                                                        | autofill, IME composition, spellcheck, mobile keyboards, password managers | **no, at any price**                                              |

That asymmetry is what makes Checkbox and Switch defensible rather than merely convenient:
an `<input>` is void, so an indicator that holds children is unobtainable natively, while
the interop given up costs one wrapper. Invert the columns and the answer inverts with
them — which is why `Button` stayed native, and why a text field must be a real `<input>`
whatever else it needs.

**Radio stayed native.** It passes all three tests. The gain column is close to empty,
since a dot is a pseudo-element and not an element, and the loss column holds the one
behaviour this library has deliberately not built yet. `RadioGroup.Item` is a real
`<input type="radio">`, and `RadioGroup.Root` owns the value. Two things follow from that:

- **The reset seam reappears, at the group.** The platform resets the real inputs, and
  React's value does not follow. It is closed the way `useFormReset` closes it, but in the
  group, because one reset spans several inputs. Per-radio resets would race each other.
- **Being native does not restore `register()`'s write half.** The value lives in React
  (decision 10), so `setValue` writing `.checked` on the DOM is exactly as unheard as it
  is on a `<button>`. `register()` reads a radio group correctly and cannot drive it.
  `Controller` remains the answer, and the contract spec pins both halves. The write half
  is lost to React state, not to the element, so no element choice gets it back.

**Input keeps no state at all, so it gets `register()` back.** A text field must be a real
`<input>`, per the table. `Input` also leaves the value on that element and keeps none in
React, so both halves of the protocol are intact and `register()` is the binding. With
nothing that needs JavaScript, it has no headless half either: it is a styling wrapper in
`@arun-dev/ui`, like `Chip`. The icons and units it holds go in a `<div>` box around the
`<input>`, through `startSlot` / `endSlot` props rather than parts (decision 11). They need
nothing from the input, and the box places them. `className` goes on the box, and every other
prop goes on the `<input>`, so `ref`, `id` and `aria-*` land on the control whether or not
there are slots. Focus, `aria-invalid` and `disabled` are styled with `:has()` on the native
control, so no `data-*` attribute stands in for platform state.

**Textarea follows Input, minus the box.** It is a real `<textarea>` with no React state, so
it too has no headless half and `register()` binds it. It has no slots — a multi-line field has
no natural place for an icon or unit — so it is one element, and per decision 11 one element
is one component: `className` and every other prop land on the `<textarea>`. Growing with its
content is `field-sizing: content` behind an `autoResize` class, not a measuring script, so a
browser without it keeps the `rows` height, which is the platform default anyway.

**Dialog leans on `showModal()` for everything but state.** The top layer, backdrop, inert
page, focus trap and focus return are all the platform's, so `@arun-dev/headless` holds only
`open` and the setter every close goes through. State drives the element — `showModal()` or
`close()` after each render — and the platform's own closes (Esc's `cancel`, a backdrop click,
`<form method="dialog">`) become requests, so a controlled parent can refuse any of them. It
needs no portal, since the top layer is not a DOM position, and its scroll lock is CSS in
`@arun-dev/ui` (`:root:has(.dialog:modal)`), not a script.

**Select is Input's shape around a `<select>`, and does not search.** A native `<select>` keeps
its value on the element, so it is a styling wrapper with `register()` as the binding. It
brings the system picker on phones, typeahead, `required` and the form protocol, none of which
is rebuilt. The box draws the chevron, since `appearance: none` removes the platform's, and
`className` goes on the box as for Input. Filtering is deliberately out: a `<select>` cannot
hold a text field, and adding one means a custom listbox that gives all of the above up. Type
to filter is a **combobox** — an `<input role="combobox">` driving a popup listbox — with its
own headless half. `<input list>` with `<datalist>` was weighed and rejected: its popup cannot
be styled, it differs by browser, and it accepts free text rather than one of the options.

---

## 8. `mergeProps` cannot retract or replace

Two properties of `mergeProps` are load-bearing for ordinary composition and get in the
way of "switch this element off":

| Behaviour                                  | Why it exists                                       | What it costs                                                 |
| ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------- |
| `undefined` values are skipped             | an absent prop must not clobber a present one       | nothing can **retract** a prop — `href: undefined` is a no-op |
| event handlers are chained, never replaced | a consumer's `onClick` runs alongside internal ones | a handler could not be **suppressed** — resolved below        |

Measured, not assumed: a prototype returning `href: undefined` and an `onClick` calling
`preventDefault()` produced an anchor that still carried `href` and still ran the
consumer's handler.

**`children` is deliberately not a third case.** It merges as a plain value, so the last
object to declare it wins — which makes both idioms fall out of one rule rather than a
special case: `<Button render={<span />}>Docs</Button>` inherits the
component's children because the element declares none and the key is skipped, and
`<Button render={<span>Read the docs</span>}>` keeps its own because a declared
value wins. Special-casing it either way would break one of the two.

### Handlers run right to left, and the consumer can stop the component's

Plain values merge left to right — later objects win, so a consumer's props override a
component's. **Event handlers run the other way**: the last object's handler first, the
first object's last. The consumer's props are merged last, so their handler runs first
and can stop the component's:

```tsx
<Switch.Root onClick={(event) => event.preventComponentHandler()} />
```

**Why this direction.** The escape hatch belongs to the consumer. A component already
decides which props reach the element and can simply decline to attach a handler — it
never needs the chain to suppress anything. The consumer has no other lever, and without
this cannot adapt a component's behaviour without forking it.

This is the convention in both comparable libraries. Radix's `composeEventHandlers` calls
the consumer's handler first and skips its own if the default was prevented. Base UI's
`mergeProps` documents handlers as running "right-to-left (rightmost handler executes
first)", cancellable by `preventBaseUIHandler()`.

**Why a dedicated signal rather than `preventDefault()`.** `preventDefault()` already
means "cancel the browser's default action", which is a different statement — a link
inside a component may want one without the other. Radix overloads it; Base UI
introduced a separate method, and that is the better call. Ours is
`event.preventComponentHandler()`.

The signal is only attached to real events, detected by `'nativeEvent' in event`. An
`on*` prop called with something else — `onCheckedChange(boolean)` — always runs every
handler, since there is nothing to attach it to.

**The order is structural, not a convention.** `useRender` takes the component's props
and the consumer's in _separate named arguments_ and merges them itself:

```ts
mergeProps(props, consumerProps); // then mergeProps(merged, render.props)
```

An earlier design passed one array and left the arrangement to each component. That made
the whole guarantee depend on every author writing the array in the right order, with
nothing to catch an inversion — `preventComponentHandler()` would have silently stopped
working for that component while every test still passed. There is now no position for a
component to place a consumer's props in, so the three tiers cannot be reordered.

### Retraction: still not possible, and no longer needed

`href: undefined` remains a no-op through `mergeProps`. Nothing depends on it any more:
a component that must not carry a prop does not put it there in the first place.
`Button` no longer renders links at all, so there is no URL to take back.

A prop written directly on a `render` element outranks the component and no layer can
retract it. That is the consumer's choice and is not reported (decision 10).

**Rules out:** a sentinel value meaning "delete this key" in `useRender`. It was
deferred here waiting for a third component to need it; instead the two that needed it
stopped needing it.

---

## 9. Only export what a consumer building their own component needs

Every exported name is a compatibility promise, and the surface grows by accident. A
primitive is public only if someone building their own component against
`@arun-dev/headless` needs it. Anything this library uses to implement itself stays out.

| Public (root entry)                                                | Not public                          |
| ------------------------------------------------------------------ | ----------------------------------- |
| `useRender`, `mergeProps`, `useControlled`                         | `switchDataAttributes` and the like |
| `ComponentEvent`, `UnknownProps`, and each component's props types |                                     |

`useButton` was the worked example, and it ended differently than expected: rather than
growing into a stable private API, it was deleted. Keeping it private is what made that
possible — 172 lines could be removed in one commit without a single consumer noticing,
because nobody could import it.

**A separate package cannot reach into internals.** `@arun-dev/ui` is published
independently, so anything it imports has to be exported. The answer is not to publish
the primitive with a disclaimer — it is to put the behaviour where it belongs. `Button`
moved into `@arun-dev/headless` for exactly this reason, which is also what decision 7
required all along; `@arun-dev/ui`'s Button is now a styling wrapper.

**Rules out:** exporting a primitive "because it might be useful". It becomes useful the
day someone asks for it, and adding an export later is not a breaking change; removing
one is.

---

## 10. State is owned by the component; `render` only shapes the element

Ground rules for every stateful component from Checkbox on — form controls first.

There are two layers, and `render` reaches only the second:

| Layer                                                | Set by                          | Can `render` change it?   |
| ---------------------------------------------------- | ------------------------------- | ------------------------- |
| **State** — `checked`, `disabled`, `indeterminate`…  | the component's own props       | no                        |
| **Element attributes** — ARIA, `data-*`, `disabled`… | derived from state, then merged | yes — `render.props` wins |

1. **The component is the only source of state.** It comes from the component's props,
   through `useControlled`. Nothing is read back from `render` or the DOM.
2. **Everything is derived from that one state object** — attributes, ARIA, `data-*`,
   the hidden form input and the context sub-parts read.
3. **`render` is unrestricted.** Merge precedence is unchanged (decision 8): the
   component proposes attributes, and `render.props` has the final say on the element.
   No warnings, no protected keys, no tag enforcement.
4. **Behaviour reads state, never the element.** Handlers guard on the component's own
   `disabled` / `readOnly` rather than relying on the native attribute; the hidden input
   and sub-part context use the same state.
5. **Every change goes through one setter** — click, keyboard and `form.reset()` alike —
   which then calls `onChange`-style callbacks.

```tsx
<Checkbox.Root disabled render={<MyCheckbox disabled={false} />} />
```

The element renders enabled, because `render` wins. The checkbox is still disabled:
clicks are ignored, the form input stays disabled and `Checkbox.Indicator` reads
`disabled: true`. An override on `render` changes what the element shows, never what the
component knows or does. Set state on the component, not on the `render` element.

**Why.** What a consumer writes in `render` is theirs; the library cannot inspect a
`render` component, so it does not police one. Keeping behaviour on the component's own
state is what makes that safe — the worst a `render` override can do is desync the markup
it chose to override.

**Rules out:** dev warnings or errors about `render` content, a protected final merge
tier for state keys, and reading state back from the rendered element.

---

## 11. Parts are earned, case by case

A component is split into parts only when an element passes all three:

1. **It is a separate DOM element** the consumer styles, places or replaces.
2. **It needs something from the root** — state, ids for ARIA wiring, or behaviour.
3. **The consumer decides where it goes.** If the component can place it unaided, it is
   internal rather than a part.

One element means one component: `Button`, `Link` and text inputs have no parts, and a
`<label>` is the consumer's own element linked by `id`. `Switch` has `Root` + `Thumb`
because the thumb is a separate element that reads `checked` from context.

Parts are independent of decision 7's native-first rule. A native `<dialog>` still needs
`Trigger`, `Title` and `Close` parts — they are separate elements the consumer places, and
`Title` supplies the id for `aria-labelledby` — while a custom-built single element would
still be one component.

**Start with the fewest parts.** Adding one later is not a breaking change; removing or
merging one is. Same reasoning as decision 9.

**Rules out:** splitting a component into parts for symmetry with other components, or
exposing an element the component can place itself.

---

## 12. Anchored popups: native `popover`, positioned by CSS

Decided before Popover's code exists, as the deferred list asked. It covers every popup that
opens next to the element that opened it — Popover first, then Tooltip, Menu and Combobox.

**The element is a native `popover`, shown with `showPopover({ source })`.** `popover="auto"`
supplies the top layer, light dismiss, Esc, and closing sibling popups when another opens. The
`source` option makes the trigger the popup's invoker, so Tab moves from the trigger into the
popup and focus returns to it on close. None of that is written here.

**Placement is CSS anchor positioning, with no JavaScript engine.** Headless links the two
elements with inline styles — `anchor-name` on the trigger, `position-anchor` on the popup —
and turns `side` and `align` props into `position-area`, with `position-try-fallbacks` flipping
it when there is no room. The browser keeps it attached through scroll, resize and layout
changes. There is no measuring, no `autoUpdate`, and no dependency.

Support checked against MDN's compatibility data (8.1.3, September 2026):

| Feature                                                  | Chrome | Firefox | Safari |
| -------------------------------------------------------- | ------ | ------- | ------ |
| `popover` attribute — Baseline since January 2025        | 114    | 125     | 17     |
| `showPopover({ source })`                                | 137    | 144     | 26     |
| `anchor-name`, `position-area`, `position-try-fallbacks` | 125    | 147     | 26     |
| `position-anchor` with an explicit name                  | 125    | 147     | 26     |
| `popover="hint"` — Tooltip's concern, not Popover's      | 151    | 153     | no     |

Every current engine has what Popover needs. Anchor positioning as a whole is not yet
Baseline: engines still differ on details this design does not touch. `position-anchor`'s
initial value changed until Chrome 151, Firefox 151 and Safari 27, which is why it is always
set explicitly rather than left to default.

**Below that support, the popup degrades rather than breaks.** A browser without anchor
positioning ignores those properties and shows the popover where the UA stylesheet puts it —
centred in the viewport — still in the top layer, still dismissable, still reachable by Tab.
Unanchored, but usable. A browser without the `source` option opens it without the invoker
link, so focus does not return by itself.

**Closing is the platform's, reported through one setter.** Light dismiss and Esc close the
element before anyone is asked — only opening is cancellable in `beforetoggle` — so the popup
reports the close through `onOpenChange(false)`, and reopens if a controlled parent keeps it
open. This is Dialog's `<form method="dialog">` path, not a new mechanism.

**No runtime layout variables.** The deferred `--hl-*` layout vars were for a JavaScript
engine to publish measurements to CSS. Anchor positioning makes them unnecessary: the trigger's
width is `anchor-size(width)`, and inside a `position-area` the available height is
`max-block-size: 100%`. The `--hl-` prefix survives for one thing: generated anchor names are
`--hl-anchor-<id>`, so they cannot collide with a consumer's own.

**Parts, fewest first (decision 11):** `Root`, `Trigger`, `Popup`, `Close`. No Portal, since
the top layer needs none; no Arrow yet, since which side a fallback flipped to is not
observable from script; no Title until a consumer needs the popup named by its heading —
`aria-label` or `aria-labelledby` do that meanwhile.

**Rules out:** Floating UI or any measuring engine as a dependency; a Portal part; runtime
layout variables; and `popover="manual"` as the default, which would mean rebuilding light
dismiss. If a consumer needs anchoring in browsers without anchor positioning, a JavaScript
engine can be added behind the same `side` / `align` props — the props describe intent, not
the mechanism — but not before someone needs it.

**Tooltip uses `popover="manual"`, not `hint`.** `hint` is the platform's tooltip mode — it
does not close an open `auto` popover, and brings Esc and light dismiss — but Safari does not
ship it (Chrome 151, Firefox 153). `manual` shares the property that matters most, not
disturbing an open Popover, and behaves the same in every engine. What it leaves out is the
tooltip's timing — hover delay, a grace period so the pointer can reach it, focus, blur, Esc —
which is small, and is the component's to own anyway: `hint` has no delay either. Anchoring is
the same inline CSS as Popover's, from one internal module.

**Menu is Popover's popup with `role="menu"`.** Same `popover="auto"`, same `source`, same
anchoring; what it adds is focus. Opening moves focus to the first item (the last, from Up on
the Trigger), items move with Up and Down through `core/rovingFocus`, and Tab closes the menu.
Items are native `<button role="menuitem">`s, so Enter, Space and a click activate them with no
key handling, and activating one closes the menu through the Root's setter. Parts, fewest
first: `Root`, `Trigger`, `Popup`, `Item`. A separator is the consumer's own
`role="separator"` element, since it needs nothing from the Root (decision 11).

**Testing.** Browser tests run in Chromium only. Placement differs by engine in detail, so
Popover's specs assert the wiring — the anchor names, `position-area`, open and close — and
leave pixel positions to a check in each engine before release.

---

## 13. Deferred, with reasons

Shipped since this list was written:

| Was deferred                          | Landed in                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `@arun-dev/headless` package          | `0.1.0` — the render engine and state plumbing                            |
| `data-*` state attributes             | `0.2.0`, with Switch — the first component with state                     |
| `useRender` moved out of `ui`         | `0.1.0` — now `@arun-dev/headless` `core/`, exported                      |
| Shared `data-disabled` spelling       | emitted directly by each component; React drops the `undefined` case      |
| `mergeProps` handler order            | consumer first, cancellable with `preventComponentHandler()` — decision 8 |
| Button's non-native behaviour         | removed — `Button` always renders a native `<button>` — decision 7        |
| Vitest browser mode                   | with Dialog: `*.browser.spec.tsx` in Chromium, for what jsdom lacks       |
| Positioning engine, Floating UI       | decided: CSS anchor positioning, no JavaScript engine — decision 12       |
| Runtime layout vars + `--hl-*` prefix | not needed; `--hl-` kept for generated anchor names — decision 12         |
| Roving tabindex                       | with Tabs: internal `core/rovingFocus`, for Menu and Toolbar to reuse     |
| `focusableWhenDisabled`               | with Menu: an opt-in on Menu and Tabs, skipping by default — below        |
| Combobox                              | decided: driven by data, Base UI's behaviour — decision 14                |

Still deferred:

| Deferred                                 | Revisit when                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Memoisation inside `useRender`           | profiling shows the per-render merge costs something                    |
| `Link` — navigation, split out of Button | a consumer needs a styled link                                          |
| Customizable select (`base-select`)      | it ships in every engine; it swaps the system picker for an in-page one |
| Menu typeahead                           | a menu long enough to need it; items would need a `textValue` prop      |
| Submenus                                 | a consumer needs nesting; it needs pointer intent and a second anchor   |
| Checkbox and radio menu items, groups    | a consumer needs a menu that holds state rather than runs actions       |

Popover, Tooltip and Menu shipped on decision 12; Combobox follows it — decision 14.

**Disabled items in a roving group are skipped by default, in every component.** APG allows
disabled tabs, menu items, options and tree items to stay focusable — so a screen reader can
announce an action that exists but is unavailable — but frames it as "can be helpful", not a
requirement. No established library splits the answer by widget; each picks one rule for Tabs
and Menu alike (checked in source, September 2026):

| Library    | Tabs           | Menu      | Opt-in                                    |
| ---------- | -------------- | --------- | ----------------------------------------- |
| Radix      | skips          | skips     | none — `focusable={!disabled}` on both    |
| React Aria | skips          | skips     | `disabledBehavior: 'selection'` on lists  |
| MUI        | skips (native) | skips     | `disabledItemsFocusable` on `MenuList`    |
| Base UI    | focusable      | focusable | always on — `focusableWhenDisabled: true` |

This library follows React Aria and MUI: Tabs keeps skipping, as it does today, and Menu skips
too. `focusableWhenDisabled` landed with Menu as an opt-in on both Roots. When set, a disabled item
stays in the arrow-key sequence, is marked `aria-disabled` rather than `disabled` — which
would take it out of focus — and the component blocks its activation, including the
consumer's `onClick`, which a native `disabled` would have blocked too.

**On Tabs, `focusableWhenDisabled` works only with `activationMode="manual"`.** With
`"automatic"`, moving focus to a tab also selects it, and a disabled tab must never be
selected. So the arrow keys always skip disabled tabs, and `focusableWhenDisabled` has no
effect.

---

## 14. Combobox: driven by data, Base UI's behaviour

Decided before Combobox's code exists, as the deferred list asked. A text input that filters a
list of options, with single or multiple selection. Behaviour follows Base UI's Combobox;
structure follows this library's decisions.

**Items are data, not children.** The Root takes `items: T[]`, and `Combobox.List` takes a
function that renders one item. Menu's items register themselves as JSX children; that cannot
work here, because the filter runs over data the list has not rendered, and a lazily loaded or
virtualized list never mounts most of it. `itemToString` gives an item's label and `itemToKey`
its identity.

**`value` holds items, not keys.** `value` is `T | null`, or `T[]` with `multiple`, through
`useControlled`. Selected state, the input's label and the hidden form inputs all come from
`value` and `itemToKey` — never from `items` (decision 10). So a selection survives a search
that no longer returns it: pick books, search for pens, and the books stay selected, labelled
and submitted.

**Search.** `filter?: (items, query, itemToString) => T[]`, or `null`.

| `filter`   | Filtering                                                               |
| ---------- | ----------------------------------------------------------------------- |
| omitted    | the default: case- and accent-insensitive "contains"                    |
| a function | the consumer's — it takes the whole list, so a fuzzy search can rank it |
| `null`     | none: `items` are shown as given — server search fills them per query   |

It takes the whole list rather than one item at a time, as Base UI's `filter` does, because
ranking needs every candidate at once. The default is exported, so a consumer's filter can wrap
it (decision 9). The default folds case and accents (`normalize('NFD')`, marks dropped) rather
than comparing with `Intl.Collator`, which cannot test containment without a comparison per
substring. Filtering is memoised on `items` and the query, and the query is read through
`useDeferredValue`, so typing stays responsive over a long list.

**Behaviour, from Base UI** (checked in its source, October 2026):

| Interaction              | Single                                        | Multiple                           |
| ------------------------ | --------------------------------------------- | ---------------------------------- |
| Pick an item             | input shows its label; popup closes           | added; query cleared; popup closes |
| Pick the selected item   | stays selected                                | removed                            |
| Empty the input          | value becomes `null`                          | value unchanged                    |
| Esc, or press outside    | closes; input goes back to the selected label | closes; query cleared              |
| `Clear`                  | query and value cleared                       | query cleared; value becomes `[]`  |
| Backspace on empty input | —                                             | removes the last item              |

`Clear` is present only while there is something to clear — a selection — and marks it with
`data-visible`; the styled component hides it otherwise.

**There is no locked selection: every selected item can be removed.** `disabled` on an `Item`
stops a pick only, in either mode, as `disabled` on a native `<option>` does — in Chromium a
plain click in a `<select multiple>` deselects a selected disabled option. An `isLocked` on
`Item` was built and dropped: native `<select>` has no such state, none of Base UI, MUI or
Ark/Zag locks a selection itself (October 2026), and knowing a lock before a server search
returns the item meant List rendering every selected Item, hidden, outside the listbox. An app
that needs a fixed item controls `value` and puts it back in `onValueChange`; a single
selection is fixed with `disabled` on the Root. Revisit with a real case, and a Root-level
`isItemLocked(item)` then, which needs no hidden render.

**`required` is the platform's, on the input.** The hidden inputs cannot carry it — a hidden
input is barred from constraint validation — so the visible input is `required` while the
selection is empty: the browser's message, `:invalid` and `checkValidity()` all come with it.
With chips it would fail on an empty text, hence "while the selection is empty", with
`aria-required` kept throughout. Typed text that picked nothing would pass `required`, so the
input then sets `valueMissing`'s own message through `setCustomValidity`, and clears only a
message it set. Focus stays in the input throughout:
the highlighted option is `aria-activedescendant`, not focused, so `core/rovingFocus` does not
apply to the list. Up and Down move the highlight, Home and End jump, Enter picks, Alt+Down
opens. With `multiple`, Left Arrow at the start of the input moves into the chips; Left and
Right move between them, and Backspace or Delete on a chip removes it. Tab, or any other move
of focus out of the input, closes the list as a press outside does.

**Callbacks report a reason.** `onValueChange`, `onInputValueChange` and `onOpenChange` take a
second argument, `{ reason }`: `'input'`, `'input-press'`, `'trigger-press'`, `'item-press'`,
`'keyboard'`, `'clear'`, `'chip-remove'`, `'escape'`, `'outside-press'`, `'blur'`,
`'form-reset'` or `'value-change'`. The last is the input following a new single `value` — set
by the parent, or swapped in `onValueChange` for the item just picked. It was silent at first
("no one typed"), which broke the promise of a call on every change of the text: a consumer
tracking the query through `onInputValueChange` went stale. A server search tells typing from a clear; a consumer who wants
to keep the query after a pick controls `inputValue` and ignores `'item-press'`. There is no
`cancel()` as in Base UI: the controlled props already give that control, and a cancellable
event is a convention for every component, not one — decided when a consumer needs it. The
argument is new to this library and is additive; other components gain it when they need it.

**Lazy loading.** `onLoadMore` fires when a sentinel at the end of the list scrolls into view
(`IntersectionObserver`), and `loading` sets `aria-busy` on it. Base UI has
neither. `Status` is the live region for "Searching…" or a result count; `Empty` shows when
the filtered list is empty and nothing is `loading`.

**Virtualization is the consumer's.** `List`'s render function lets a virtualizer such as
TanStack Virtual decide which items mount. `onItemHighlighted(item, { index, reason })`, as in
Base UI, tells it which row to scroll to, since the highlighted option has to be rendered for
`aria-activedescendant` to point at it. No virtualizer ships here.

**The popup is decision 12's, but `popover="manual"`.** Anchored to the input with CSS anchor
positioning through `core/anchoring`, sized with `anchor-size(width)`, in the top layer. Base
UI's `Portal`, `Positioner`, `Backdrop` and `Arrow` have no counterpart.

`auto` was the plan, and failed in Chromium: its light dismiss closes the list on a press of the
input itself, though the input is the popup's `source`, and on the Trigger and Clear beside it.
Focus never enters the list, so `auto`'s Esc and focus return bring nothing either. So the
popup is `manual`, as Tooltip's is, and the component does the rest: a `pointerdown` outside
the input, popup, Trigger, Clear and chips closes it as `'outside-press'`, and Esc is handled
on the input. A press inside an open Popover's Combobox still does not light-dismiss the
Popover, since the list is that Popover's descendant in the DOM.

**Parts, fewest first (decision 11):** `Root`, `Input`, `Trigger`, `Clear`, `Popup`, `List`,
`Item`, `Empty`, `Status`, `Chip`, `ChipRemove` — and `Group` and `GroupLabel`, below. `Chip` and `ChipRemove` are parts because
removing an item needs the Root's setter and chip navigation needs the Root's focus handling.
Two more landed with `@arun-dev/ui`'s Combobox, which earned them: `InputGroup`, the box around
the input, chips and buttons, which takes over as the popup's anchor so the list lines up with
the whole field; and `Value`, which renders the selection through a function and no element of
its own, so a separate package can draw chips without keeping a copy of the value (decision 9).
Base UI has both. The selected check is `data-selected` on `Item` and CSS, so there is no
`ItemIndicator` yet;
nor `Label`, since a `<label>` is the consumer's element linked by `id`. `@arun-dev/ui`'s
Combobox renders the chips itself, styled as `Chip`.

**Groups, as `<optgroup>`.** Items stay data (decision 10's "from props, never the DOM"
holds), so a group is data too: `items` is either items or groups, where a group is any object
with an `items` array — its label, id or anything else is the consumer's. The filter runs inside
each group and a group it empties is left out; `List`'s function is then called once per group
left, with the group narrowed to its matches, and renders a `Group` holding a `GroupLabel` and
an `Item` per item. The arrow keys, the highlight index, `onItemHighlighted` and `Empty` see one
flat list in group order, so keyboard handling does not change.

Two parts are earned (decision 11). `Group` is `role="group"`, named by its label through
`aria-labelledby` — the listbox → group → option structure APG allows. Its `disabled` disables
every `Item` inside, as `<optgroup disabled>` does; an Item reads it from context, like its own
prop, so the arrow keys skip them. `GroupLabel` is `<optgroup>`'s `label`: shown, never an
option, never reached by the arrow keys.

Measured against the platform and Base UI (October 2026): `<optgroup>` has `label` and
`disabled` and does not nest — this matches all three. Base UI also has `Group`, `GroupLabel`,
plus a `Collection` that renders a group's items from context and a `Separator`. `Collection`
is not needed here: the consumer maps the group's already-filtered `items` directly. A group is
recognised by its shape, as in Base UI, so an item type that itself has an `items` array cannot
be listed ungrouped; none has asked for it.

**Creating an item is a pattern, not an API.** A "Create "x"" row, as GitHub's label picker
shows when nothing matches, is an item like any other: while the text matches no item exactly
(case- and accent-insensitive), the consumer adds one to `items` — labelled with the text itself,
drawn as "Create" by its `Item` — and in `onValueChange` swaps it for the real item it makes.
Everything else is already there: the filter keeps it (its label is the text), the arrow keys and
Enter reach it, with `multiple` the query clears, and without it the input shows the new label.
The browser tests drive this pattern in both modes, with no change to the library.

Measured against the platform and others (October 2026): `<select>` cannot create; `<input
list>` accepts free text, which is why it was rejected above. Base UI has no API either — its
"creatable" demo is this same pattern, confirming in a Dialog. React Aria
(`allowsCustomValue`) and Ark (`allowCustomValue`) accept free text as the value instead, which
`value` holding items rules out here. An `onCreate(text)` on the Root was weighed and declined
for now: the pattern needs no new API, keeps creation (async, a Dialog for colour and
description, a server-assigned id) wholly the consumer's, and adds nothing to every combobox that
never creates. Revisit if the pattern proves error-prone in real screens.

**`Separator` is visual only.** A line between items or groups, as an `<hr>` in a `<select>`,
which Chromium exposes as a separator inside the listbox. Measured with axe (October 2026): a
`role="separator"` inside `role="listbox"` fails `aria-required-children` — a listbox may own
only options and groups — and Base UI's Separator has that role. So ours is `aria-hidden` with
no role: it passes, and Groups, named by their labels, already tell a screen reader where one
set ends. The arrow keys pass it, as they pass a GroupLabel.

**Groups in a virtualized list are a pattern.** Virtualization is the consumer's (above), and
groups add nothing the library must do: the consumer filters the groups, passes them with
`filter={null}`, flattens them into rows — labels and items — for the virtualizer, and wraps the
rows in view in their `Group`. A group whose label has scrolled out keeps a `hidden` GroupLabel,
so it stays named. `onItemHighlighted` reports the index among items, which the consumer maps to
its row. The browser tests drive this with a window of rows. The limit is virtualization's, not
grouping's: a disabled item, or a disabled Group's items, are skipped by the arrow keys only once
rendered (decision 10 — from props).

**Clear hides while the Root is `disabled`.** It can clear nothing then, so `data-visible` is
absent though there is a selection, as a disabled `<select>` offers no reset.

**Rules out:** items registered as children; selection read from `items` or the DOM; a
JavaScript positioning engine or a Portal (decision 12); `cancel()` on change events; and six
features weighed in October 2026 and judged not needed:

- **Nested groups** — `<optgroup>` cannot nest.
- **The input inside the popup** — a button opening a panel that holds the search, GitHub's
  label picker. The field is always the visible input.
- **Action rows** that are not options, such as GitHub's "Edit labels" — a listbox holds only
  options and groups. An action belongs beside the Combobox, in a Menu or a link.
- **An inline list**, always shown rather than in a popup — the Combobox is built on the popup's
  open and close; an always-visible list is `<select size>`'s job.
- **Grid navigation**, two-dimensional arrow keys over `grid` cells — an emoji or swatch picker
  is a different widget, with no native counterpart.
- **A built-in virtualizer** — virtualization stays the consumer's, as above; below about a
  thousand items rendering everything is fast enough, and a virtualizer in every combobox costs
  the many to serve the few.

Nothing about Combobox is deferred.
