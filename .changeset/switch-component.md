---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

**`Switch`** — the first component with real behaviour, and the one that makes
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
