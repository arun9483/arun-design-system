---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
'@arun-dev/tokens': minor
---

Add Menubar: a bar of menus — File, Edit, View — by the WAI-ARIA menubar pattern. `Menubar.Root` is `role="menubar"` and one Tab stop: ← and → move along it, Home and End to its ends, and typing moves to a Trigger by its text. ↓, Enter and Space open a menu, → and ← move between open menus, and while one is open the pointer opens another by reaching its Trigger. `orientation="vertical"` runs it top to bottom with its menus to the side, and `focusableWhenDisabled` keeps disabled Triggers reachable. Inside, `Menubar.Menu`, `Menubar.Trigger` and `Menubar.Popup` hold a menu, and the items, groups and submenus are Menu's, under the bar's name. Menu itself is unchanged. ui styles the bar and its Triggers (`@arun-dev/ui/css/menubar`), with `--menubar-*` tokens.

ui now needs `@arun-dev/headless` 4.26.0 or later.
