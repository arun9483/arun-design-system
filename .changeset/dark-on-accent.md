---
'@arun-dev/tokens': minor
---

Brand colours now meet WCAG contrast in light and dark mode, for the default brand and for any seed.

- **Dark mode:** `--color-text-on-accent` is `--color-neutral-950` instead of white. The accent is light in dark mode (`brand-300`), and white on it measured 1.99:1 in the default brand, failing on every primary Button, the current page in Pagination, and a checked Checkbox's tick and Radio's dot. It is now 10.12:1.
- **Light mode:** `--color-status-info` is `brand-600` instead of `brand-500`. The info Badge's text on `brand-50` measured 3.99:1; it is now 5.62:1.
- **Seeded brands:** `createBrand({ seed })` fits the generated palette to `CONTRAST_REQUIREMENTS`, the new exported list of every token pairing the components draw. A shade that falls short moves lighter or darker, keeping its hue, so a bright seed such as yellow (`brand-700` at 2.12:1 before) is readable too. A palette passed in is used as given. `contrastRatio` is exported to check one.
