import { cp } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: ['react', 'react-dom'],
  async onSuccess() {
    // CSS is not imported by the TS source, so tsup never sees it — ship it alongside the JS.
    await cp('src/css', 'dist/css', { recursive: true });
  },
});
