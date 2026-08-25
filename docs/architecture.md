# Architecture decisions

Recorded decisions for `arun-design-system`. Each entry states the decision, the reasoning, and what
it rules out.

---

## 1. Layering

```
@arun-dev/tokens    CSS custom properties only. Zero runtime JS.
        |             primitives -> brand palette -> semantic -> component
        v
@arun-dev/ui        Class names + component CSS + React components.
```

`@arun-dev/ui` never imports from `@arun-dev/tokens` in JS or CSS. It references custom properties
by name and relies on the consumer having loaded a token layer. The token names are the contract
between the two packages.

**Rules out:** a JS theme object, CSS-in-JS, or any runtime style generation.

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

## 6. Deferred, with reasons

| Deferred                              | Revisit when                                             |
| ------------------------------------- | -------------------------------------------------------- |
| `@arun-dev/headless` package          | the first component with real behaviour (Switch) lands   |
| `data-*` state attributes             | same — static components have no state to project        |
| Runtime layout vars + `--hl-*` prefix | the first anchored/positioned component (Popover)        |
| Vitest browser mode                   | focus trapping or scroll locking needs testing           |
| Positioning engine, Floating UI       | Popover; the engine is a port so it can be swapped later |

`useRender` currently lives in `@arun-dev/ui/src/internal/` and is **not exported publicly**, so it
can move into `@arun-dev/headless` later without affecting consumers.
