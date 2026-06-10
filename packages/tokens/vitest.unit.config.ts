import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    environment: 'node',
    globals: true,
    include: ['src/**/*.unit.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/*.unit.spec.ts'],
    },
  },
});
