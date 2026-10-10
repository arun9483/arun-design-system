---
'@arun-dev/headless': patch
---

Fix OtpInput and Combobox in Safari. OtpInput keeps the caret on the slot a press or Tab put it on, where WebKit moved it again a moment later, so the next key went to the wrong slot; and Delete on an empty slot no longer empties the one before it, which WebKit reported as a backward deletion. Combobox reports the input text once, as `'value-change'`, when `onValueChange` swaps the picked item, where WebKit also reported it as `'outside-press'`.
