# @arun-dev/eslint-config

## 0.1.0

### Minor Changes

- a2cec59: Introduce org-wide shared lint and TypeScript policy packages.
  - `@arun-dev/eslint-config`: ESLint flat config (typescript-eslint strict, react,
    react-hooks) now hardened with `eslint-plugin-jsx-a11y` (accessibility floor) and
    `eslint-plugin-security` (SAST floor). Plugins ship as dependencies — consumers
    install one package.
  - `@arun-dev/ts-config`: strict TypeScript `base` and `nextjs` configs.

  Consumed by arun-design-system internally and by arun-dev-platform (replacing its
  workspace-private copy) so every frontend repo inherits one canonical policy.
