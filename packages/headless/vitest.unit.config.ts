import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.unit.spec.ts', 'src/**/*.unit.spec.tsx'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/*.unit.spec.ts', '**/*.unit.spec.tsx', '**/index.ts'],
    },
  },
});
