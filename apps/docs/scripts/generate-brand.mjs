import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrand } from '@arun-dev/tokens/createBrand';

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
 */
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'generated');

const BRAND = { name: 'arun-docs', seed: '#7c3aed' };

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'brand.css'), createBrand(BRAND), 'utf8');

process.stdout.write(`generated the "${BRAND.name}" brand from seed ${BRAND.seed}\n`);
