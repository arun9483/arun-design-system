import { defineConfig } from 'tsup';

export default defineConfig({
  // One entry per public subpath. Components are exported individually so a
  // consumer importing only Switch does not pay for the rest.
  entry: ['src/index.ts', 'src/unstable.ts', 'src/switch/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: ['react', 'react-dom'],
});
