---
'@arun-dev/headless': minor
'@arun-dev/ui': minor
---

OtpInput: Delete and Backspace empty a box in place instead of shifting the digits after it left, so typing fills the same box. An emptied box is a space in the value (`"123 56"`), which the input's `pattern` rejects; check completeness with a pattern such as `/^\d{6}$/`. Backspace on an empty box empties the one before, and deletion also works on phone keyboards that send no Backspace key. A pasted fragment now fills boxes from the caret on, and focus lands on the first empty box. New `onComplete(code)` fires after any change that leaves every box filled, so verifying needs no completeness check of your own.
