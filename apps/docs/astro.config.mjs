import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { rehypeBaseUrl } from './plugins/rehype-base-url.mjs';
import { rehypeFocusableTables } from './plugins/rehype-focusable-tables.mjs';

export default defineConfig({
  site: 'https://arun9483.github.io',
  base: process.env.DOCS_BASE ?? '/',
  // Links written by hand in content are not base-aware on their own. The MDX
  // integration extends this markdown config, so one plugin covers .md and .mdx alike.
  // Tables get a Tab stop: Starlight makes each one a scroll box, which the keyboard must reach.
  markdown: {
    processor: unified({
      rehypePlugins: [
        [rehypeBaseUrl, { base: process.env.DOCS_BASE ?? '/' }],
        rehypeFocusableTables,
      ],
    }),
  },
  integrations: [
    starlight({
      title: 'arun-design-system',
      description:
        'Three independent packages — pure-CSS design tokens with white-label brand generation, unstyled React behaviour primitives, and a brand-agnostic component library built on both.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/arun9483/arun-design-system' },
      ],
      // Starlight sets data-theme="dark"|"light" on <html> — the same attribute the
      // generated brand's variants key off, so its theme toggle needs no glue code.
      customCss: ['./src/styles/docs.css'],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Theming and brands', slug: 'getting-started/theming' },
          ],
        },
        {
          label: 'Headless',
          items: [
            { label: 'Overview', slug: 'headless' },
            { label: 'The render engine', slug: 'headless/engine' },
            { label: 'Prop merging', slug: 'headless/merging' },
            { label: 'State', slug: 'headless/state' },
            { label: 'Components', slug: 'headless/components' },
          ],
        },
        {
          label: 'Components',
          // Every page in the folder, alphabetical by file name, so a new component lands in
          // order without an edit here.
          items: [{ autogenerate: { directory: 'components' } }],
        },
        {
          label: 'Guides',
          items: [
            { label: 'The render prop', slug: 'guides/render-prop' },
            { label: 'Design tokens', slug: 'guides/tokens' },
            { label: 'Lists', slug: 'guides/lists' },
            { label: 'Visually hidden', slug: 'guides/visually-hidden' },
            { label: 'react-hook-form', slug: 'guides/react-hook-form' },
            { label: 'Gallery', slug: 'guides/gallery' },
          ],
        },
      ],
    }),
    react(),
  ],
});
