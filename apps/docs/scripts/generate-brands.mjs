import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrand } from '@arun-dev/tokens/createBrand';

/**
 * Generates the alternate brands the docs switch between.
 *
 * createBrand() emits root-scoped rules, which is what a consumer wants — one brand
 * per document. The docs need several at once, so each is rescoped under
 * [data-brand="name"] and all are shipped in one stylesheet. Switching is then a
 * single attribute on <html>, which an inline script can set before first paint;
 * injecting the CSS from JavaScript instead caused a visible flash of the default
 * brand on every navigation.
 *
 * Specificity works out: a scoped `:root[data-brand='x']` (0,2,0) beats the default
 * brand's bare `:root` (0,1,0), and the theme variants gain a class-level component
 * each, so they stay ahead of their unscoped counterparts too.
 */
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'generated');

const brands = [
  { name: 'sky', seed: '#0284c7' },
  { name: 'forest', seed: '#059669' },
  { name: 'plum', seed: '#9333ea' },
];

/** Rewrites createBrand()'s root-level selectors so they apply only under [data-brand]. */
function scopeToBrand(css, name) {
  const scope = `:root[data-brand='${name}']`;

  return css
    .replace(/^:root:not\(\[data-theme='light'\]\) \{/gm, `${scope}:not([data-theme='light']) {`)
    .replace(
      /^(\s+):root:not\(\[data-theme='light'\]\) \{/gm,
      `$1${scope}:not([data-theme='light']) {`,
    )
    .replace(/^:root \{/gm, `${scope} {`)
    .replace(/^\[data-theme='(dark|light)'\] \{/gm, `${scope}[data-theme='$1'] {`);
}

await mkdir(OUT, { recursive: true });

const stylesheet = brands
  .map(
    ({ name, seed }) =>
      `/* ${name} — generated from seed ${seed} */\n${scopeToBrand(createBrand({ name, seed }), name)}`,
  )
  .join('\n');

/**
 * If createBrand() ever emits a selector shape scopeToBrand does not recognise, the
 * rule would land unscoped and leak into every brand — including the default. That
 * fails quietly at runtime, so fail loudly here instead.
 */
const unscoped = stylesheet
  .split('\n')
  .filter((line) => /^(:root|\[data-theme)[^{]*\{/.test(line) && !line.includes('[data-brand='));

if (unscoped.length > 0) {
  throw new Error(
    `generate-brands: ${unscoped.length} selector(s) were not scoped to a brand and would ` +
      `apply globally:\n  ${unscoped.join('\n  ')}`,
  );
}

await writeFile(join(OUT, 'brands.css'), stylesheet, 'utf8');

process.stdout.write(
  `generated ${brands.length} brands from a seed colour: ${brands.map((b) => b.name).join(', ')}\n`,
);
