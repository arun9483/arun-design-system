import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import securityPlugin from 'eslint-plugin-security';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.strict,
  securityPlugin.configs.recommended,
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Flags every computed property access; unusable noise in typed codebases.
      // The remaining security/* rules stay on as the deterministic SAST floor.
      'security/detect-object-injection': 'off',
    },
  },
];

export const reactConfig = [
  ...baseConfig,
  reactPlugin.configs.flat.recommended,
  reactHooksPlugin.configs['recommended-latest'],
  jsxA11yPlugin.flatConfigs.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

export const ignores = {
  ignores: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'coverage/**',
    // tsup bundles its config to a temporary `tsup.config.bundled_<id>.mjs` beside it and
    // deletes it after. A lint running alongside a build can list the file and then fail
    // to open it (ENOENT), so it is never linted.
    '**/*.bundled_*.{mjs,cjs}',
  ],
};

export default [ignores, ...baseConfig];
