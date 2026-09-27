import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

/**
 * Behaviour jsdom does not implement — `<dialog>` and `showModal()`, the top layer, real
 * focus movement and key handling — runs here, in Chromium. Unit specs stay in jsdom
 * (`vitest.unit.config.ts`); only `*.browser.spec.tsx` files come here.
 */
export default defineConfig({
  test: {
    name: 'browser',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.browser.spec.tsx'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
