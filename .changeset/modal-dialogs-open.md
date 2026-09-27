---
'@arun-dev/headless': minor
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Add Dialog, a modal dialog built on the native `<dialog>` and `showModal()`.

`@arun-dev/headless/dialog` exports `Dialog.Root`, `Trigger`, `Popup`, `Title` and `Close`. The
platform supplies the top layer, backdrop, inert page, focus trap and focus return; the component
owns `open` / `defaultOpen` / `onOpenChange`, and turns every close — `Dialog.Close`, Esc, a
backdrop click, `<form method="dialog">` — into a request a controlled parent can refuse.
`closeOnBackdropClick={false}` makes the backdrop inert. `Title` names the dialog through
`aria-labelledby`, and `Trigger` carries `aria-haspopup`, `aria-expanded` and `aria-controls`.

`@arun-dev/ui` styles the popup and title, locks page scroll while a modal is open, and animates
opening and closing with `@starting-style`. `Trigger` and `Close` pass through unstyled; render a
`Button` to style them. `@arun-dev/ui` now requires `@arun-dev/headless` >= 4.3.0, the first
version with the dialog entry point. `@arun-dev/tokens` adds the `--dialog-*` component tokens.
