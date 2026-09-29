import { useState } from 'react';
import { Button, Popover } from '@arun-dev/ui';

const logStyle = {
  margin: 0,
  minBlockSize: '7.5rem',
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
};

export default function PopoverEvents() {
  const [log, setLog] = useState<string[]>([]);
  const add = (line: string) => setLog((lines) => [...lines.slice(-5), line]);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-xs)', justifyItems: 'start' }}>
      <Popover.Root onOpenChange={(open) => add(`onOpenChange(${open})`)}>
        <Popover.Trigger render={<Button />}>Open, then close it any way</Popover.Trigger>
        {/* Native events on the Popup: yours run first, on every open and close. */}
        <Popover.Popup
          aria-label="Events"
          onBeforeToggle={(event) => add(`onBeforeToggle → ${event.newState}`)}
          onToggle={(event) => add(`onToggle → ${event.newState}`)}
        >
          <p style={{ margin: 0 }}>Press Esc, click outside, or use the button.</p>
          <Popover.Close render={<Button />}>Close</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <pre style={logStyle} aria-live="polite">
        {log.length ? log.join('\n') : 'Events appear here.'}
      </pre>
      <Button onClick={() => setLog([])}>Clear log</Button>
    </div>
  );
}
