---
'@arun-dev/headless': patch
---

Document the package on its own terms: add a README, and rewrite the npm description so it no
longer defines the package by the styling layer built on it. Expand the `checked` JSDoc to warn
that the controlled/uncontrolled mode is latched at mount, so an `undefined` first render makes
the component uncontrolled for good.
