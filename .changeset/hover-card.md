---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `HoverCard`: a preview of where a link goes, shown on hover or keyboard focus. `HoverCard.Trigger` is an `<a>`; `HoverCard.Popup` is a `popover="manual"` anchored to it (`side`, `align`), opened with the trigger as its invoker so Tab moves into the card. A pointer opens it after `delay` (600ms) and it closes `closeDelay` (300ms) after leaving both the link and the card; keyboard focus opens it at once, focus leaving both or Esc closes it. Touch never opens it, so its content must never be essential. `@arun-dev/ui` requires `@arun-dev/headless` 4.21.0 or later. Tokens: `--hover-card-*`.
