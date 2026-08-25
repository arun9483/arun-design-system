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
        'Pure-CSS design tokens with white-label brand generation, and a brand-agnostic React component library built on top of them.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/arun9483/arun-design-system' },
      ],
      // Starlight sets data-theme="dark"|"light" on <html> — the same attribute
      // @arun-dev/tokens keys off, so its theme toggle drives the token layer directly.
      customCss: ['./src/styles/docs.css'],
      components: {
        // Brand switcher sits beside Starlight's own theme select.
        ThemeSelect: './src/components/ThemeAndBrand.astro',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Theming and brands', slug: 'getting-started/theming' },
          ],
        },
        {
          label: 'Components',
          items: [
            { label: 'Button', slug: 'components/button' },
            { label: 'Card', slug: 'components/card' },
            { label: 'Chip', slug: 'components/chip' },
            { label: 'Badge', slug: 'components/badge' },
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
