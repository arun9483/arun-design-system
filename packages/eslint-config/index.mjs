import js from '@eslint/js';
import { fixupConfigRules } from '@eslint/compat';
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
  // eslint-plugin-react and eslint-plugin-jsx-a11y stop at ESLint 9: react calls context
  // methods ESLint 10 removed. fixupConfigRules puts them back; drop it once both support 10.
  ...fixupConfigRules(reactPlugin.configs.flat.recommended),
  reactHooksPlugin.configs.flat['recommended-latest'],
  ...fixupConfigRules(jsxA11yPlugin.flatConfigs.recommended),
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
  ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'coverage/**'],
};

export default [ignores, ...baseConfig];
