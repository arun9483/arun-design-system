// A Node module hook that stands in for a React Server Components bundler: a module that starts
// with "use client" is a client boundary, so it is not run on the server. It becomes a reference
// that can be passed and rendered but not executed, as Next.js makes it. Everything else runs, on
// React's server build, where createContext and the hooks do not exist. As in a bundler, importing
// one of those is not an error by itself, it is `undefined`; calling it while loading is.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DIRECTIVE = /^\s*(['"])use client\1/;

// What a module may import from 'react', whether or not the server build has it.
const REACT_EXPORTS = [
  'Children',
  'Component',
  'Fragment',
  'Profiler',
  'PureComponent',
  'StrictMode',
  'Suspense',
  'cache',
  'cloneElement',
  'createContext',
  'createElement',
  'createRef',
  'forwardRef',
  'isValidElement',
  'lazy',
  'memo',
  'startTransition',
  'use',
  'useActionState',
  'useCallback',
  'useContext',
  'useDebugValue',
  'useDeferredValue',
  'useEffect',
  'useId',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useOptimistic',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
  'version',
];
const REACT_SHIM = 'server-react:';

// 'react' from a module becomes the shim, which then imports the real 'react' from where that
// module would have, carried in the shim's URL.
export async function resolve(specifier, context, nextResolve) {
  if (specifier !== 'react') return nextResolve(specifier, context);
  if (context.parentURL?.startsWith(REACT_SHIM)) {
    const from = decodeURIComponent(context.parentURL.slice(REACT_SHIM.length));
    return nextResolve(specifier, { ...context, parentURL: from });
  }
  return { url: REACT_SHIM + encodeURIComponent(context.parentURL ?? ''), shortCircuit: true };
}

export async function load(url, context, nextLoad) {
  if (url.startsWith(REACT_SHIM)) {
    const source = [
      "import * as React from 'react';",
      'export default React;',
      ...REACT_EXPORTS.map((name) => `export const ${name} = React.${name};`),
    ].join('\n');
    return { format: 'module', source, shortCircuit: true };
  }
  if (url.startsWith('file:') && /\.m?js$/.test(url)) {
    const source = await readFile(fileURLToPath(url), 'utf8');
    if (DIRECTIVE.test(source)) {
      const names = [...source.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((match) =>
        match[1]
          .split(',')
          .map((part) =>
            part
              .trim()
              .split(/\s+as\s+/)
              .pop(),
          )
          .filter(Boolean),
      );
      // As React's client reference: it can be passed and rendered, not read into. Reading a
      // property of it on the server — `Dialog.Root` on a namespace from a client module — throws.
      const reference = [
        'const reference = new Proxy(function ClientReference() {}, {',
        "  get(_, key) { if (typeof key === 'symbol' || key === '$$typeof' || key === 'then') return undefined;",
        "    throw new Error('Cannot access .' + String(key) + ' of a client module on the server'); },",
        '});',
      ].join('\n');
      const exports = names.map((name) =>
        name === 'default' ? 'export default reference;' : `export const ${name} = reference;`,
      );
      return { format: 'module', source: [reference, ...exports].join('\n'), shortCircuit: true };
    }
  }
  return nextLoad(url, context);
}
