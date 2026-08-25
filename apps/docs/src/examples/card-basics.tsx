import { Card } from '@arun-dev/ui';

export default function CardBasics() {
  return (
    <>
      <Card style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' }}>
        <p className="font-weight-semibold">Default</p>
        <p className="text-size-sm text-color-secondary">Renders a div.</p>
      </Card>

      <Card lift style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' }}>
        <p className="font-weight-semibold">lift</p>
        <p className="text-size-sm text-color-secondary">Raises on hover.</p>
      </Card>

      {/* Unrecognised props reach the DOM, so this is a labelled landmark. */}
      <Card
        as="nav"
        aria-label="Example navigation"
        style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' }}
      >
        <p className="font-weight-semibold">as=&quot;nav&quot;</p>
        <p className="text-size-sm text-color-secondary">Keeps its aria-label.</p>
      </Card>
    </>
  );
}
