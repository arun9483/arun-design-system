---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
---

Add submenus to `Menu` (decision 19). Headless: `Menu.SubmenuRoot` and `Menu.SubmenuTrigger`, with the submenu's own `Menu.Popup` opening beside the trigger. → and ← move between levels, Esc closes one level at a time, activating an item closes every level, and the pointer opens a submenu on rest and keeps it open while crossing toward it. ui: a styled SubmenuTrigger with a chevron. ui now needs `@arun-dev/headless` 4.16.0 or later.
