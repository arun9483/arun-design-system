import { Card } from '@arun-dev/ui';

const box = { padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' };

export default function CardBasics() {
  return (
    <>
      <Card style={box}>
        <p className="font-weight-semibold">Default</p>
        <p className="text-size-sm text-color-secondary">
          Stays still under the pointer: it isn&apos;t clickable.
        </p>
      </Card>

      {/* A card that opens something: hover it to see it rise. */}
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Card's children */}
      <Card lift render={<a href="#card" />} style={box}>
        <p className="font-weight-semibold">lift — hover me</p>
        <p className="text-size-sm text-color-secondary">
          Rises with a deeper shadow, so it reads as clickable.
        </p>
      </Card>

      {/* `as` changes the element, not the look: this one is a labelled landmark. */}
      <Card as="nav" aria-label="Example navigation" style={box}>
        <p className="font-weight-semibold">as=&quot;nav&quot;</p>
        <p className="text-size-sm text-color-secondary">
          Looks like Default. It is a &lt;nav&gt; landmark, which screen readers list.
        </p>
      </Card>
    </>
  );
}
