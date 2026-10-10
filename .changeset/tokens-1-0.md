---
'@arun-dev/tokens': major
---

1.0.0: the token names are stable. Nothing is renamed or removed in this release. From here, every token name is public API across all tiers — primitives, semantic tokens, `BrandSemanticContract` and the component tokens — so a rename, a removal, a new `BrandSemanticContract` entry or a change to `createBrand()`'s output for the same input is a major release; a new token is a minor; a value tuned within its intent is a patch. The README's new "Versioning" section has the full table.

Also new: the arun brand, published as `@arun-dev/tokens/brands/arun` — `createBrand(ARUN_BRAND)` byte for byte, with `ARUN_BRAND` (`{ name: 'arun', seed: '#7c3aed' }`) exported from `@arun-dev/tokens/createBrand`. Import it in place of `brands/default` and an app looks like every other app on the arun brand, with no generation step of its own.
