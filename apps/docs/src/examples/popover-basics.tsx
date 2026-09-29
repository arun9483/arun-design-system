import { useState } from 'react';
import { Button, Checkbox, Popover } from '@arun-dev/ui';

const list = { display: 'grid', gap: 'var(--space-2xs)', margin: 0, padding: 0 };
const footer = { display: 'flex', justifyContent: 'flex-end', marginBlockStart: 'var(--space-sm)' };

export default function PopoverBasics() {
  const [archived, setArchived] = useState(false);

  return (
    <Popover.Root>
      {/* Trigger and Close are plain buttons: render a Button to style them. */}
      <Popover.Trigger render={<Button />}>Filters</Popover.Trigger>
      <Popover.Popup aria-label="Filters" align="start">
        <div style={list}>
          <div style={{ display: 'flex', gap: 'var(--space-2xs)', alignItems: 'center' }}>
            <Checkbox.Root
              id="popover-archived"
              checked={archived}
              onCheckedChange={(c) => setArchived(c === true)}
            >
              <Checkbox.Indicator />
            </Checkbox.Root>
            <label htmlFor="popover-archived">Show archived</label>
          </div>
        </div>
        <div style={footer}>
          <Popover.Close render={<Button variant="primary" />}>Done</Popover.Close>
        </div>
      </Popover.Popup>
    </Popover.Root>
  );
}
