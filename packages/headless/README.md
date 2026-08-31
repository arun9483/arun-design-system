# @arun-dev/headless

Unstyled React behaviour primitives. Components bring their behaviour, keyboard handling and
accessibility, and nothing else — no CSS, no class names, no colour. The styling is entirely
yours.

Every part takes a `render` prop, spreads unrecognised props onto the element it renders, and
projects its state as `data-*` attributes, so any styling approach works: plain CSS, CSS modules,
utility classes, or a component library of your own.

## Installation

```bash
npm install @arun-dev/headless
```

Peer dependencies: `react >= 19`, `react-dom >= 19`.

## Components

```tsx
import { Switch } from '@arun-dev/headless/switch';

<Switch.Root defaultChecked onCheckedChange={save} aria-label="Notifications">
  <Switch.Thumb />
</Switch.Root>;
```

| Component | Parts                   | Props                                                                       |
| --------- | ----------------------- | --------------------------------------------------------------------------- |
| `Button`  | —                       | `disabled`, `nativeButton`                                                  |
| `Switch`  | `Switch.Root`, `.Thumb` | `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `name`, `value` |

`Button` exists for the moment `render` points at something that is not a `<button>`. It then
supplies what the platform stops giving you — focus, `Enter` and `Space` activation, and a
`disabled` state that actually disables. It takes no `href`: a control that navigates should be an
anchor, so pass one in and keep middle-click, cmd-click and "link" in assistive technology.

```tsx
import { Button } from '@arun-dev/headless/button';

<Button render={<a href="/docs" target="_blank" rel="noreferrer" />}>Docs</Button>;
```

`Switch.Root` renders a native `<button>`, so focus, `Space`, `Enter` and disabled semantics come
from the platform. It carries `role="switch"` and `aria-checked`, but **no accessible name** —
wrap it in a `<label>` or pass `aria-label`. A headless component should not guess at your copy.

## State reaches CSS through `data-*`

A headless component owns no class names, so state is projected onto the DOM instead. That
attribute name is the entire contract between behaviour and styling:

```css
.my-switch[data-checked] {
  background: rebeccapurple;
}
```

Both parts of `Switch` emit `data-checked` / `data-unchecked` / `data-disabled`. The negative form
is emitted deliberately: `:not([data-checked])` would also match any third state added later, so
matching the state you mean keeps future states additive.

## Controlled and uncontrolled

Pass `checked` with `onCheckedChange` and the parent owns the value — the switch will not move on
its own. Pass `defaultChecked` and the component owns it. `onCheckedChange` fires in both modes.

The mode is decided **once, at mount**, and never re-evaluated. A `checked` of `undefined` on the
first render therefore makes the component uncontrolled for the rest of its life, and every value
passed afterwards is ignored. When the value arrives asynchronously, coalesce at the call site:

```tsx
<Switch.Root checked={enabled ?? false} onCheckedChange={setEnabled} />
```

Mixing the modes, or changing the default after mount, logs a development-only warning.

## Composition

Every part takes a `render` prop to change the element, and spreads unrecognised props onto it:

```tsx
<Switch.Root render={<Tooltip.Trigger />} />
```

`className` is concatenated, `style` is merged, and refs are merged — so a `ref` on the `render`
element and a `ref` on the component both receive the node.

Event handlers are chained rather than replaced, and **your handler runs before the component's**,
so you can stop it:

```tsx
<Switch.Root onClick={(event) => event.preventComponentHandler()} />
```

`preventDefault()` is left alone — it still means only "cancel the browser's default action".

## Engine

The primitives the components are built from are exported from the root, for building your own:

```ts
import {
  useRender,
  useControlled,
  mergeProps,
  getStateAttributes,
  booleanAttribute,
} from '@arun-dev/headless';
```

| Export               | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `useRender`          | Resolves what a part renders — merges props, projects state, applies `render` |
| `useControlled`      | One value, controlled or uncontrolled, decided at mount                       |
| `mergeProps`         | Merges prop objects: handlers chain, `className` concatenates, refs merge     |
| `getStateAttributes` | Projects a state object onto `data-*` attributes via a declared mapping       |
| `booleanAttribute`   | The common mapping — one attribute when true, another when false              |
| `disabledAttribute`  | The shared spelling of `data-disabled`, so every component agrees on it       |
| `ComponentEvent`     | Type for a handler that can call `preventComponentHandler()`                  |

Everything this library uses to implement its own components stays private, so it can
change without breaking anyone. The public surface is the table above plus the
components themselves.
