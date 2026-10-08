import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // mermaid parses against a DOM.
    environment: 'jsdom',
    include: ['src/**/*.unit.spec.ts'],
  },
});
