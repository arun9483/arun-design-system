import config from '@arun-dev/config/eslint';

export default [
  ...config,
  { ignores: ['dist/**', '.astro/**', 'src/generated/**', '**/*.astro'] },
  {
    // Build-time files run in Node. Patterns are depth-independent: lint-staged
    // invokes eslint from the repo root, turbo from this package.
    files: ['**/scripts/**/*.mjs', '**/astro.config.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
];
