# @arun-dev/eslint-config

Shared ESLint flat config for all arun-dev frontend repos. One canonical rule set:
`@eslint/js` recommended, `typescript-eslint` strict, `react` + `react-hooks`,
`jsx-a11y` (accessibility floor), and `security` (SAST floor).

## Usage

```js
// eslint.config.mjs — React/Next.js app
import { reactConfig, ignores } from '@arun-dev/eslint-config';

export default [ignores, ...reactConfig];
```

```js
// eslint.config.mjs — plain TypeScript package
import { baseConfig, ignores } from '@arun-dev/eslint-config';

export default [ignores, ...baseConfig];
```

`eslint >= 9` is a peer dependency; all plugins ship as regular dependencies so
consumers only install this one package.
