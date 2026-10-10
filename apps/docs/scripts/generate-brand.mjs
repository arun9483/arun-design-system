import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ARUN_BRAND, createBrand } from '@arun-dev/tokens/createBrand';

/**
 * Generates this site's brand — the documented consumer path, followed exactly.
 *
 * createBrand() returns a complete brand stylesheet (palette, neutrals, and the
 * semantic layer with its light, dark and system variants) from a single seed
 * colour. It is written to a file and imported in place of
 * @arun-dev/tokens/brands/default, which is the whole of the documented procedure.
 *
 * One brand per document, declared at :root — see docs/architecture.md §3. The
 * output is not post-processed or rescoped: what this writes is byte-for-byte what
 * a consumer would ship.
 *
 * The result is committed, not gitignored. That is deliberate: a change to
 * createBrand()'s logic then shows up as a diff in this file, so the generator's
 * effect on a real consumer is visible in the pull request that causes it.
 */
const OUT = join(import.meta.dirname, '..', 'src', 'generated');

// The arun brand, from the same input as the published @arun-dev/tokens/brands/arun, so this
// site and every app importing that stylesheet look the same.
const BRAND = ARUN_BRAND;
const FILE = `brand-${BRAND.name}.css`;

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, FILE), createBrand(BRAND), 'utf8');

process.stdout.write(`generated ${FILE} — the "${BRAND.name}" brand from seed ${BRAND.seed}\n`);
