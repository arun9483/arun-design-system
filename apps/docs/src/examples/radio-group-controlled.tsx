import { useState } from 'react';
import { RadioGroup } from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

export default function RadioGroupControlled() {
  // `null` is "nothing selected" — the state a native group starts in.
  const [size, setSize] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-lg)' }}>
      <RadioGroup.Root
        aria-label="Size"
        value={size}
        onValueChange={setSize}
        // Laid out in a row by overriding the default column.
        style={{ flexDirection: 'row', gap: 'var(--space-sm)' }}
      >
        {['S', 'M', 'L'].map((option) => (
          <label key={option} style={row}>
            <RadioGroup.Item value={option} />
            {option}
          </label>
        ))}
      </RadioGroup.Root>

      {/* The parent owns the value, so the group only moves when state changes. */}
      <span className="text-size-sm text-color-secondary">{size ?? 'none'}</span>
    </div>
  );
}
