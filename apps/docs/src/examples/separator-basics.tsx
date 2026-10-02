import { Separator } from '@arun-dev/ui';

// The Separator draws the line; the gap around it is the layout's.
export default function SeparatorBasics() {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-md)', inlineSize: '24rem' }}>
      <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
        <p style={{ margin: 0 }}>Account</p>
        <Separator />
        <p style={{ margin: 0 }}>Billing</p>
      </div>
      {/* Upright, between inline items: it takes the row's height. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Blog</span>
        <Separator orientation="vertical" />
        <span>Changelog</span>
      </div>
    </div>
  );
}
