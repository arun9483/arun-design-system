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
  // The automatic JSX runtime: React need not be in scope.
  ...fixupConfigRules(reactPlugin.configs.flat['jsx-runtime']),
  reactHooksPlugin.configs.flat['recommended-latest'],
  ...fixupConfigRules(jsxA11yPlugin.flatConfigs.recommended),
  {
    rules: {
      // TypeScript checks props.
      'react/prop-types': 'off',
      // `role="list"` is not redundant on a list whose markers are removed: Safari drops the
      // list semantics with `list-style: none` (ui 5.0.0).
      'jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'], ol: ['list'] }],
      // @arun-dev/ui's form controls, which a wrapping <label> names like a native input.
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: [
            'Checkbox.Root',
            'Combobox.Input',
            'DatePicker.Input',
            'Input',
            'OtpInput',
            'RadioGroup.Item',
            'Select',
            'Slider',
            'Switch.Root',
            'Textarea',
          ],
        },
      ],
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
