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

| Component                         | Props type defined in | Exported from `ui`? |
| --------------------------------- | --------------------- | ------------------- |
| `Button`, `Card`, `Chip`, `Badge` | `@arun-dev/ui`        | yes                 |
| `Switch.Root`, `Switch.Thumb`     | `@arun-dev/headless`  | no                  |

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

| Component    | Gained                                                   | Lost                                                                       | Recoverable?                                                     |
| ------------ | -------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `Checkbox`   | an indicator holding JSX; three states as one typed prop | `register()`                                                               | yes — one `Controller`                                           |
| `Switch`     | a thumb holding an icon or a spinner                     | `register()`                                                               | yes — one `Controller`                                           |
| `Button`     | —                                                        | focus, `Space`/`Enter`, `disabled`                                         | in principle; `useButton` reached 172 lines before being deleted |
| a text field | —                                                        | autofill, IME composition, spellcheck, mobile keyboards, password managers | **no, at any price**                                             |

That asymmetry is what makes Checkbox and Switch defensible rather than merely convenient:
an `<input>` is void, so an indicator that holds children is unobtainable natively, while
the interop given up costs one wrapper. Invert the columns and the answer inverts with
them — which is why `Button` stayed native, and why a text field must be a real `<input>`
whatever else it needs. Radio is the next one to weigh: a native `<input type="radio">`
brings roving focus and group semantics for free, and a radio's indicator has far less
reason to hold JSX than a checkbox's.

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

## 12. Deferred, with reasons

Shipped since this list was written:

| Was deferred                    | Landed in                                                                 |
| ------------------------------- | ------------------------------------------------------------------------- |
| `@arun-dev/headless` package    | `0.1.0` — the render engine and state plumbing                            |
| `data-*` state attributes       | `0.2.0`, with Switch — the first component with state                     |
| `useRender` moved out of `ui`   | `0.1.0` — now `@arun-dev/headless` `core/`, exported                      |
| Shared `data-disabled` spelling | emitted directly by each component; React drops the `undefined` case      |
| `mergeProps` handler order      | consumer first, cancellable with `preventComponentHandler()` — decision 8 |
| Button's non-native behaviour   | removed — `Button` always renders a native `<button>` — decision 7        |

Still deferred:

| Deferred                                 | Revisit when                                             |
| ---------------------------------------- | -------------------------------------------------------- |
| Runtime layout vars + `--hl-*` prefix    | the first anchored/positioned component (Popover)        |
| Vitest browser mode                      | focus trapping or scroll locking needs testing           |
| Positioning engine, Floating UI          | Popover; the engine is a port so it can be swapped later |
| Memoisation inside `useRender`           | profiling shows the per-render merge costs something     |
| `focusableWhenDisabled`, roving tabindex | the first composite widget — Toolbar, Menu, Tabs         |
| `Link` — navigation, split out of Button | a consumer needs a styled link                           |

Popover triggers the first three at once, so its decisions belong here before its code exists.
