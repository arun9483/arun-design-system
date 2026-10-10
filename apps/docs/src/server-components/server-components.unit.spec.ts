import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

/**
 * Contract: the packages import in a React Server Component (decision 32). Each entry is loaded
 * on React's server build, where createContext and the hooks do not exist, with every
 * "use client" module standing as a client boundary, as a Server Components bundler treats it.
 * A module that touched client-only React while loading would fail here, as it fails a Next.js
 * build.
 */
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const register = join(here, 'register.mjs');

function exportsOf(pkg: string): string[] {
  // The packages do not export their package.json; the workspace links them here.
  const manifest = JSON.parse(
    readFileSync(join(here, '../../node_modules', pkg, 'package.json'), 'utf8'),
  ) as { exports: Record<string, unknown> };
  return Object.keys(manifest.exports)
    .filter((key) => !key.endsWith('.css') && !key.startsWith('./css') && key !== './package.json')
    .map((key) => (key === '.' ? pkg : `${pkg}/${key.slice(2)}`));
}

function importOnServer(specifier: string) {
  // Import, then read every member of every namespace, as `<Dialog.Root>` does in a server
  // component: a namespace must be a server object whose members are the client references.
  const code = `
    const entry = await import(${JSON.stringify(specifier)});
    for (const value of Object.values(entry)) {
      if (value && typeof value === 'object') for (const key of Object.keys(value)) void value[key];
    }
  `;
  return spawnSync(
    process.execPath,
    ['--conditions=react-server', '--import', register, '--input-type=module', '-e', code],
    { cwd: here, encoding: 'utf8' },
  );
}

describe('server components', () => {
  it.each(['@arun-dev/ui', ...exportsOf('@arun-dev/headless')])(
    '%s imports in a server component, namespaces included',
    (specifier) => {
      const result = importOnServer(specifier);
      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
    },
  );

  it('marks the modules that use client-only React as client modules', () => {
    const dialogRoot = readFileSync(
      join(here, '../../node_modules/@arun-dev/headless/dist/dialog/DialogRoot.js'),
      'utf8',
    );
    expect(dialogRoot).toMatch(/^\s*(['"])use client\1/);
  });

  it('keeps useRender importable from server code, for Card and the other server components', () => {
    const root = readFileSync(require.resolve('@arun-dev/headless'), 'utf8');
    expect(root).not.toMatch(/^\s*(['"])use client\1/);
  });
});
