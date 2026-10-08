import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // The contract specs read stylesheets as text (`?raw`); without this Vitest empties them.
    css: true,
    include: ['src/**/*.unit.spec.ts', 'src/**/*.unit.spec.tsx'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/*.unit.spec.ts', '**/*.unit.spec.tsx', '**/index.ts'],
    },
  },
});
