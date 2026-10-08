import { reactConfig, ignores } from '@arun-dev/config/eslint';

export default [
  ignores,
  // The examples are React components readers copy, so they get the same rules as ui.
  ...reactConfig,
  { ignores: ['dist/**', '.astro/**', 'src/generated/**', '**/*.astro'] },
  {
    // Code blocks are focusable so a keyboard can scroll a long line into view.
    rules: { 'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: ['pre'] }] },
  },
  {
    // Build-time files run in Node. Patterns are depth-independent: lint-staged
    // invokes eslint from the repo root, turbo from this package.
    files: ['**/scripts/**/*.mjs', '**/astro.config.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
];
