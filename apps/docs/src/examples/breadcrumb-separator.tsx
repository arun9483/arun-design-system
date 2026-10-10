import type { CSSProperties } from 'react';
import { Breadcrumb, Stack } from '@arun-dev/ui';
import { docsUrl } from '@/lib/url';
// Your own .svg file: `?url` gives its address, as your bundler serves it — a small one inlined as a
// data: URL, which is why the url() below is quoted.
import arrowUrl from './assets/breadcrumb-arrow.svg?url';

/**
 * The separator is CSS, the `::before` of every step but the first, so your own is a rule on a
 * class you give the Root. Keep the `/ ''` alternative text: the separator stays unread.
 *
 * A character goes straight into `content`. An icon goes in as a mask, painted with
 * `currentColor`, so it keeps `--breadcrumb-separator-color` and follows light and dark — inline
 * in the CSS, or from an .svg file, whose address the third trail passes in as a custom property.
 */
const SEPARATOR_CSS = `
  .trail-chevron .breadcrumb-item + .breadcrumb-item::before {
    content: '›' / '';
  }

  .trail-icon .breadcrumb-item + .breadcrumb-item::before {
    content: '' / '';
    inline-size: 1em;
    block-size: 1em;
    background-color: currentColor;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }

  .trail-file .breadcrumb-item + .breadcrumb-item::before {
    content: '' / '';
    inline-size: 1em;
    block-size: 1em;
    background-color: currentColor;
    mask: var(--trail-separator) center / contain no-repeat;
  }
`;

function Trail({
  className,
  label,
  style,
}: {
  className: string;
  label: string;
  style?: CSSProperties;
}) {
  return (
    <Breadcrumb.Root className={className} aria-label={label} style={style}>
      <Breadcrumb.Item>
        <Breadcrumb.Link href={docsUrl('/')}>Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href={docsUrl('/components/button/')}>Components</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Current>Breadcrumb</Breadcrumb.Current>
      </Breadcrumb.Item>
    </Breadcrumb.Root>
  );
}

export default function BreadcrumbSeparator() {
  return (
    <Stack gap="sm">
      <style>{SEPARATOR_CSS}</style>
      {/* Two trails on one page, so each has its own name. */}
      <Trail className="trail-chevron" label="Breadcrumb, chevron" />
      <Trail className="trail-icon" label="Breadcrumb, icon" />
      <Trail
        className="trail-file"
        label="Breadcrumb, icon file"
        style={{ '--trail-separator': `url("${arrowUrl}")` } as CSSProperties}
      />
    </Stack>
  );
}
