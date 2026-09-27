---
'@arun-dev/eslint-config': patch
---

Ignore tsup's temporary `*.bundled_*.mjs` config files. A lint running alongside a build could list
one and then fail with ENOENT when tsup deleted it.
