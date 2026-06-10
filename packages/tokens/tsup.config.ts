import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/createBrand.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
});
