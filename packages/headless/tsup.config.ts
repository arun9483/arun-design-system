import { defineConfig } from 'tsup';

export default defineConfig({
  // One entry per public subpath. Components are exported individually so a
  // consumer importing only Switch does not pay for the rest.
  entry: [
    'src/index.ts',
    'src/button/index.ts',
    'src/checkbox/index.ts',
    'src/combobox/index.ts',
    'src/dialog/index.ts',
    'src/drawer/index.ts',
    'src/menu/index.ts',
    'src/otp-input/index.ts',
    'src/popover/index.ts',
    'src/radio-group/index.ts',
    'src/field/index.ts',
    'src/toast/index.ts',
    'src/avatar/index.ts',
    'src/toggle/index.ts',
    'src/toggle-group/index.ts',
    'src/toolbar/index.ts',
    'src/switch/index.ts',
    'src/tabs/index.ts',
    'src/tooltip/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: ['react', 'react-dom'],
});
