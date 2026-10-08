/**
 * ESLint 10 lints each file with the eslint.config.mjs nearest to it, so one command covers
 * every workspace with its own rules. `--no-warn-ignored`: a staged file a config ignores
 * (generated output, say) is skipped quietly.
 *
 * Prettier finds .prettierrc and .prettierignore from the repo root on its own.
 */
export default {
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,md,mdx,css,yaml,yml}': 'prettier --write',
};
