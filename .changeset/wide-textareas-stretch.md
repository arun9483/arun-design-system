---
'@arun-dev/tokens': minor
'@arun-dev/ui': minor
---

Let users resize a Textarea's width as well as its height.

`Textarea` still fills its container by default, but now uses `resize: both`: the user can drag it
narrower, down to the new `--textarea-min-width` token, and wider, up to the container and never
past it. With `autoResize`, height follows the content and the handle resizes width only.
