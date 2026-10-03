import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import { focusablePre } from './plugins/ec-focusable-pre.mjs';

// Expressive Code options live here rather than in astro.config.mjs: a plugin is a function,
// which the `<Code>` component (used by Example.astro) can only load from this file.
export default defineEcConfig({
  // Code blocks scroll sideways on long lines; this gives each a Tab stop so the keyboard can
  // scroll it too.
  plugins: [focusablePre()],
});
