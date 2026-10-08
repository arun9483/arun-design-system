# @arun-dev/eslint-config

## 0.2.0

### Minor Changes

- 8542527: Built with tsdown instead of tsup, which is no longer maintained. The published files keep their names (`.js` / `.cjs`, `.d.ts` / `.d.cts`) and every entry point exports the same names as before; only shared chunk file names change.

  Headless follows React Compiler's rules: values latched at mount are read from state, not refs, and refs are no longer written during render.

  Chip and Card: `children` is optional, for a `render` element that brings its own content — `<Chip render={<a href="/tags/react">React</a>} />` — so the link's text sits inside the link, where accessibility linting sees it.

  Fix: a toast whose `timeout` changed while it was showing started the new timeout already short by the time the old one had run. It now starts in full.

  ESLint config: supports ESLint 10 (eslint-plugin-react and eslint-plugin-jsx-a11y run through `@eslint/compat` until they support it), and `reactConfig` now includes eslint-plugin-react-hooks 7's React Compiler rules (`refs`, `immutability`, `globals`, `purity` and the rest), which can report new errors. It also uses eslint-plugin-react's `jsx-runtime` preset, allows `role="list"` on `<ul>` and `<ol>`, and treats @arun-dev/ui's form controls (`Checkbox.Root`, `RadioGroup.Item`, `Switch.Root`, `Input` and the rest) as controls a wrapping `<label>` names.

## 0.1.1

### Patch Changes

- ba17991: Ignore tsup's temporary `*.bundled_*.mjs` config files. A lint running alongside a build could list
  one and then fail with ENOENT when tsup deleted it.

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
