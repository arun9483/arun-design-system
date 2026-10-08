import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/createBrand.ts'],
  format: ['esm', 'cjs'],
  // tsdown follows the tsconfig's sourceMap / declarationMap; tsup did not. The maps would
  // point at src/, which isn't published, so they stay off.
  sourcemap: false,
  dts: { sourcemap: false },
  clean: true,
  // Keep tsup's names (.js / .cjs, .d.ts / .d.cts) so the exports maps don't change.
  fixedExtension: false,
  outDir: 'dist',
});
