import { useState } from 'react';
import { Switch } from '@arun-dev/ui';

export default function SwitchControlled() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' }}>
        <Switch.Root checked={enabled} onCheckedChange={setEnabled}>
          <Switch.Thumb />
        </Switch.Root>
        Dark mode
      </label>

      {/* The parent owns the value, so the switch only moves when state changes. */}
      <span className="text-size-sm text-color-secondary">{enabled ? 'on' : 'off'}</span>
    </div>
  );
}
