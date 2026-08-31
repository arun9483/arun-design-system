---
'@arun-dev/headless': minor
---

**Behaviour change — event handlers now run right to left.** A component passes its own props
first and the consumer's last, so a consumer's handler now runs _before_ the component's, and can
stop it:

```tsx
<Switch.Root onClick={(event) => event.preventComponentHandler()} />
```

This matches Radix's `composeEventHandlers` and Base UI's `mergeProps`, both of which run the
consumer's handler first and let it cancel the library's. The escape hatch belongs to the
consumer: a component already decides which props reach the element, so it never needs the chain
to suppress anything.

`preventDefault()` is deliberately not overloaded — it already means "cancel the browser's default
action", which is a different statement. The signal is attached only to real events, so `on*`
props called with something else, such as `onCheckedChange(boolean)`, always run every handler.

**Fix: a disabled `Switch` rendered as a non-button still toggled.** `<Switch.Root render={<div/>}
disabled>` accepted clicks — the `disabled` attribute is inert on a `div`, so it flipped
`aria-checked`, called `onCheckedChange`, and ran the consumer's `onClick`. It now synthesises the
state through `useButton`: `aria-disabled`, removal from the tab order, and no activation.
