import { useState } from 'react';
import { Button, Dialog } from '@arun-dev/ui';

const footer = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-xs)',
  marginBlockStart: 'var(--space-lg)',
};
const logStyle = {
  margin: 0,
  minBlockSize: '7.5rem',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

export default function DialogEvents() {
  const [log, setLog] = useState<string[]>([]);
  const add = (line: string) => setLog((lines) => [...lines.slice(-5), line]);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-xs)', justifyItems: 'start' }}>
      <Dialog.Root onOpenChange={(open) => add(`onOpenChange(${open})`)}>
        <Dialog.Trigger render={<Button />}>Open, then close it any way</Dialog.Trigger>
        {/* Native events on the Popup: yours run first, and they say how it closed. */}
        <Dialog.Popup onCancel={() => add('onCancel — Esc')} onClose={() => add('onClose')}>
          <Dialog.Title>Close me</Dialog.Title>
          <p style={{ margin: 0 }}>Press Esc, click the backdrop, or use a button.</p>
          <div style={footer}>
            <form method="dialog">
              <Button type="submit">Form submit</Button>
            </form>
            <Dialog.Close render={<Button variant="primary" />}>Close</Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Root>
      <pre style={logStyle} aria-live="polite">
        {log.length ? log.join('\n') : 'Events appear here.'}
      </pre>
      <Button onClick={() => setLog([])}>Clear log</Button>
    </div>
  );
}
