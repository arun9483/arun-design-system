import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig } from 'tsdown';

/**
 * React Server Components (decision 32): a module that starts with 'use client' is a client
 * boundary. The bundler drops the directive, so put it back on the built file of every source
 * module that has it. Output is per module (`unbundle`), so a server module — useRender, Card —
 * never shares a file with a client one.
 */
async function restoreUseClient() {
  const sources = await readdir('src', { recursive: true });
  await Promise.all(
    sources
      .filter((file) => /\.tsx?$/.test(file) && !file.includes('.spec.'))
      .map(async (file) => {
        if (!/^\s*(['"])use client\1/.test(await readFile(join('src', file), 'utf8'))) return;
        await Promise.all(
          ['.js', '.cjs'].map(async (extension) => {
            const built = join('dist', file.replace(/\.tsx?$/, extension));
            const code = await readFile(built, 'utf8');
            if (!/^\s*(['"])use client\1/.test(code))
              await writeFile(built, `'use client';\n${code}`);
          }),
        );
      }),
  );
}

export default defineConfig({
  // One entry per public subpath. Components are exported individually so a
  // consumer importing only Switch does not pay for the rest.
  entry: [
    'src/index.ts',
    'src/button/index.ts',
    'src/calendar/index.ts',
    'src/checkbox/index.ts',
    'src/combobox/index.ts',
    'src/date-picker/index.ts',
    'src/dialog/index.ts',
    'src/drawer/index.ts',
    'src/hover-card/index.ts',
    'src/menu/index.ts',
    'src/menubar/index.ts',
    'src/otp-input/index.ts',
    'src/popover/index.ts',
    'src/radio-group/index.ts',
    'src/field/index.ts',
    'src/toast/index.ts',
    'src/avatar/index.ts',
    'src/toggle/index.ts',
    'src/toggle-group/index.ts',
    'src/toolbar/index.ts',
    'src/range-slider/index.ts',
    'src/switch/index.ts',
    'src/tabs/index.ts',
    'src/tooltip/index.ts',
    'src/tree-view/index.ts',
  ],
  format: ['esm', 'cjs'],
  // tsdown follows the tsconfig's sourceMap / declarationMap; tsup did not. The maps would
  // point at src/, which isn't published, so they stay off.
  sourcemap: false,
  dts: { sourcemap: false },
  clean: true,
  // Keep tsup's names (.js / .cjs, .d.ts / .d.cts) so the exports maps don't change.
  fixedExtension: false,
  outDir: 'dist',
  deps: { neverBundle: ['react', 'react-dom'] },
  unbundle: true,
  onSuccess: restoreUseClient,
});
