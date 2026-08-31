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

So the _prop_ is not what belongs in `@arun-dev/headless`; the "make a non-button
element behave as disabled" logic is. It ships as `useButton`, a hook rather than a
component, because Button's value in `@arun-dev/ui` is its variants and its `href`
convenience — neither is behaviour. A `Button.Root` in headless would have inverted
that, leaving the interesting half in the wrapper.

**Rules out:** a pass-through wrapper for every headless component. When a component is
mostly styling with a little behaviour, the behaviour is extracted as a primitive and
the component stays in `@arun-dev/ui`. Switch went the other way — nearly all of it is
behaviour — and earns its 7-line wrapper.

**Consequence:** `useButton` returns consumer props _sanitised_ rather than merged over,
and `retractActivationProps` exists for `render` elements, because neither case can be
expressed through `mergeProps` today. See decision 8.

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

### Handlers run right to left, and the consumer can stop the component's

Plain values merge left to right — later objects win, so a consumer's props override a
component's. **Event handlers run the other way**: the last object's handler first, the
first object's last. A component passes its own props first and the consumer's last, so
the consumer's handler runs first and can stop the component's:

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

**Consequence for disabled controls.** A component cannot use the chain to suppress a
consumer's handler on an inert element. It removes the handler instead, before merging,
which is what `useButton` does — deterministic, rather than depending on a runtime
convention the consumer could ignore.

### Retraction: still not possible

`href: undefined` remains a no-op through `mergeProps`. Components that must remove a
prop do it before merging — `useButton` returns consumer props sanitised, and
`retractActivationProps` rewrites a `render` element with `cloneElement`, which _can_
overwrite with `undefined`.

**Deferred:** a sentinel value meaning "delete this key" in `useRender`. It would fold
both helpers into the engine, at the cost of a new concept every component author has
to know. Revisit if a third component needs to retract a prop.

---

## 9. Only export what a consumer building their own component needs

Every exported name is a compatibility promise, and the surface grows by accident. A
primitive is public only if someone building their own component against
`@arun-dev/headless` needs it. Anything this library uses to implement itself stays out.

| Public (root entry)                                                | Not public                            |
| ------------------------------------------------------------------ | ------------------------------------- |
| `useRender`, `mergeProps`, `useControlled`                         | `useButton`, `retractActivationProps` |
| `getStateAttributes`, `booleanAttribute`, `disabledAttribute`      |                                       |
| `ComponentEvent`, `UnknownProps`, and each component's props types |                                       |

`useButton` is the worked example. It is 100 lines of element-kind edge cases that will
keep growing — composite widgets will need a `focusableWhenDisabled` parameter, and the
disabled-focus half may eventually split out the way Base UI's has. None of that should
be a breaking change, and it is not, as long as only this library calls it.

**The `unstable` subpath.** `@arun-dev/ui` is a separate package, so it cannot reach into
`@arun-dev/headless`'s internals the way a single-package library would. Those primitives
are therefore published at `@arun-dev/headless/unstable`, which carries no stability
guarantee and is documented as such. The alternative — exporting them from the root —
would freeze them by accident the first time somebody imported one.

**Rules out:** exporting a primitive "because it might be useful". It becomes useful the
day someone asks for it, and adding an export later is not a breaking change; removing
one is.

---

## 10. Deferred, with reasons

Shipped since this list was written:

| Was deferred                     | Landed in                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `@arun-dev/headless` package     | `0.1.0` — the render engine and state plumbing                                   |
| `data-*` state attributes        | `0.2.0`, with Switch — the first component with state                            |
| `useRender` moved out of `ui`    | `0.1.0` — now `@arun-dev/headless` `core/`, exported                             |
| Shared `data-disabled` spelling  | `disabledAttribute` in `core/stateAttributes.ts`, used by Switch and `useButton` |
| `mergeProps` handler suppression | a handler preventing the default stops the chain — decision 8                    |

Still deferred:

| Deferred                                | Revisit when                                             |
| --------------------------------------- | -------------------------------------------------------- |
| Runtime layout vars + `--hl-*` prefix   | the first anchored/positioned component (Popover)        |
| Vitest browser mode                     | focus trapping or scroll locking needs testing           |
| Positioning engine, Floating UI         | Popover; the engine is a port so it can be swapped later |
| Prop retraction sentinel in `useRender` | a third component needs to remove a consumer's prop      |

Popover triggers the first three at once, so its decisions belong here before its code exists.
