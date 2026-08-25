import config from '@arun-dev/config/eslint';

export default [
  ...config,
  {
    // Build-time files run in Node, not the browser.
    // Patterns are depth-independent: lint-staged invokes eslint from the repo root
    // with -c, so `files` resolves against that cwd rather than this file's directory.
    files: ['**/scripts/**/*.mjs', '**/vite.config.ts'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
];
