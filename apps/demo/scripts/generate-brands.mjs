/**
 * Generates the alternate brand stylesheets the demo switches between.
 *
 * This is exactly how a consumer ships a custom brand: call createBrand() at build
 * time, write the CSS, import it. Output is gitignored — regenerate, never edit.
 */
/* eslint-disable security/detect-non-literal-fs-filename --
   Paths derive from import.meta.url and a literal brand list; nothing comes from
   user input, so the path-traversal heuristic this rule implements does not apply. */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrand } from '@arun-dev/tokens/createBrand';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'generated');

const brands = [
  { name: 'sky', seed: '#0284c7' },
  { name: 'forest', seed: '#059669' },
  { name: 'plum', seed: '#9333ea' },
];

await mkdir(OUT, { recursive: true });

for (const brand of brands) {
  await writeFile(join(OUT, `${brand.name}.css`), createBrand(brand), 'utf8');
}

process.stdout.write(
  `generated ${brands.length} brands from a seed colour: ${brands.map((b) => b.name).join(', ')}\n`,
);
