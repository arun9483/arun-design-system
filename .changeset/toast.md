---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add `Toast` (decision 16). Headless (`@arun-dev/headless/toast`): `Provider`, `useToastManager()` (`add`, `update`, `close`), `Viewport` (a polite live region kept open in the top layer), `Root`, `Title`, `Description`, `Action`, `Close`; timers pause on hover, focus and a hidden page, and Esc closes. ui: a styled Viewport that renders toasts itself, styled parts, and `--toast-*` tokens. ui now needs `@arun-dev/headless` 4.13.0 or later.
