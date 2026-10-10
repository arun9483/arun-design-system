import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

/**
 * Behaviour jsdom does not implement — `<dialog>` and `showModal()`, the top layer, real
 * focus movement and key handling — runs here, in Chromium, Firefox and WebKit. Unit specs stay
 * in jsdom (`vitest.unit.config.ts`); only `*.browser.spec.tsx` files come here.
 *
 * WebKit runs on Linux only, as in CI. On macOS it follows the platform's focus rules: a press
 * or Tab does not focus a button, so every focus assertion would fail there.
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
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        ...(process.platform === 'linux' ? [{ browser: 'webkit' as const }] : []),
      ],
    },
  },
});
