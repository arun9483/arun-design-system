---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
---

Toast position: `Toast.Viewport` takes a `position` — `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` or `bottom-right`, the default — for every toast, and `add({ position })` sends one toast elsewhere, in a stack of its own inside the same toast area. Toasts at the top slide down as they arrive. Headless keeps the new `position` option for the ui's rendering; ui exports the `ToastPosition` type.

Card: only a `lift` card reacts to the pointer now, rising 2px with a deeper shadow. A default card no longer deepens its shadow on hover, so a card that isn't clickable no longer looks clickable.
