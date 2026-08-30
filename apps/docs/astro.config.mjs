import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arun9483.github.io',
  base: process.env.DOCS_BASE ?? '/',
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
        { label: 'Headless', slug: 'headless' },
        {
          label: 'Components',
          items: [
            { label: 'Button', slug: 'components/button' },
            { label: 'Card', slug: 'components/card' },
            { label: 'Chip', slug: 'components/chip' },
            { label: 'Badge', slug: 'components/badge' },
            { label: 'Switch', slug: 'components/switch' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'The render prop', slug: 'guides/render-prop' },
            { label: 'Design tokens', slug: 'guides/tokens' },
            { label: 'Gallery', slug: 'guides/gallery' },
          ],
        },
      ],
    }),
    react(),
  ],
});
