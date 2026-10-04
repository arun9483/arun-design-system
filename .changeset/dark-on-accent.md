---
'@arun-dev/tokens': patch
---

Dark mode: `--color-text-on-accent` is now `--color-neutral-950` instead of white, in the default brand and in every brand `createBrand` generates. The accent is light in dark mode (`brand-300`), and white on it measured 1.99:1 in the default brand — failing WCAG on every primary Button, the current page in Pagination, and a checked Checkbox's tick and Radio's dot. Dark text on it is 10.12:1. Light mode is unchanged.
