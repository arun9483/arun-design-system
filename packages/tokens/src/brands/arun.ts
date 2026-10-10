import type { CreateBrandInput } from '../createBrand';

/**
 * The arun brand: one input, so every app that uses it looks the same. A consumer either imports
 * the published stylesheet, `@arun-dev/tokens/brands/arun`, generated from this, or calls
 * `createBrand(ARUN_BRAND)` itself — the output is identical (README, "The arun brand").
 */
export const ARUN_BRAND = { name: 'arun', seed: '#7c3aed' } as const satisfies CreateBrandInput;
