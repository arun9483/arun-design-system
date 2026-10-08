import { Chip } from '@arun-dev/ui';
import { docsUrl } from '@/lib/url';

export default function ChipElements() {
  return (
    <>
      {/* A chip in a list must still be an <li>. */}
      <ul style={{ display: 'flex', gap: 'var(--space-2xs)', listStyle: 'none', padding: 0 }}>
        <Chip render={<li />}>React</Chip>
        <Chip render={<li />}>TypeScript</Chip>
      </ul>

      {/* A clickable chip must be a real button — focusable, keyboard-operable. */}
      <Chip render={<button type="button" />} onClick={() => alert('clicked')}>
        button
      </Chip>

      {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Chip's children */}
      <Chip render={<a href={docsUrl('/components/link/')} />} variant="accent">
        link
      </Chip>
    </>
  );
}
