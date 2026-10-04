---
'@arun-dev/headless': patch
---

Checkbox, Switch, RadioGroup and OtpInput: a native `form.reset()` is settled after the page re-renders, against the value then on screen. react-hook-form's `reset()` calls `form.reset()` after setting its own values, and the controls used to report the reset again through the handler of the render before — a checkbox group sharing one array wrote its old array back, and a radio group re-checked the old radio.
