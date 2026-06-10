import { baseConfig, ignores } from './packages/config/eslint.config.mjs';

export default [
  ignores,
  {
    ignores: ['.turbo/**'],
  },
  ...baseConfig,
];
