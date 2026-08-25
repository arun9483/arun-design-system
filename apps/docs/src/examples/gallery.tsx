import { Badge, Button, Card, Chip } from '@arun-dev/ui';

const pad = { padding: 'var(--space-sm)', borderRadius: 'var(--radius-lg)' } as const;
const row = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-sm)',
  alignItems: 'center',
} as const;

/** Every component and variant on one surface — a smoke test for the token layer. */
export default function Gallery() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={row}>
        <Button>Ghost</Button>
        <Button variant="primary">Primary</Button>
        <Button disabled>Disabled</Button>
        <Button href="#gallery">Anchor</Button>
      </div>

      <div style={row}>
        <Card style={pad}>Default card</Card>
        <Card lift style={pad}>
          Lift on hover
        </Card>
      </div>

      <div style={row}>
        <Chip>default</Chip>
        <Chip variant="accent">accent</Chip>
        <Chip render={<button type="button" />}>button</Chip>
        <Chip render={<a href="#gallery" />}>link</Chip>
      </div>

      <ul style={{ ...row, listStyle: 'none', padding: 0, margin: 0 }}>
        <Chip render={<li />}>li</Chip>
        <Chip render={<li />} variant="accent">
          inside a real ul
        </Chip>
      </ul>

      <div style={row}>
        <Badge>neutral</Badge>
        <Badge tone="success">success</Badge>
        <Badge tone="warning">warning</Badge>
        <Badge tone="error">error</Badge>
        <Badge tone="info">info</Badge>
      </div>

      <div style={row}>
        {[
          '--color-bg-surface',
          '--color-bg-accent',
          '--color-text-accent',
          '--color-border-accent',
          '--color-status-success',
          '--color-status-warning',
          '--color-status-error',
          '--color-status-info',
        ].map((token) => (
          <span
            key={token}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span
              style={{
                inlineSize: '0.85rem',
                blockSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-default)',
                background: `var(${token})`,
              }}
            />
            <code className="text-size-xs">{token}</code>
          </span>
        ))}
      </div>
    </div>
  );
}
