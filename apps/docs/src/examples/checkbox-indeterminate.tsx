import { useState } from 'react';
import { Checkbox } from '@arun-dev/ui';

const SCOPES = ['Read', 'Write', 'Delete'] as const;

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

/**
 * The case indeterminate exists for: a parent standing in for a set of children, where
 * "some" is a real answer and neither checked nor unchecked can say it.
 */
export default function CheckboxIndeterminate() {
  const [granted, setGranted] = useState<string[]>(['Read']);

  // Derived, never stored — the parent has no state of its own to fall out of sync.
  const parent =
    granted.length === SCOPES.length ? true : granted.length === 0 ? false : 'indeterminate';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xs)' }}>
      <label htmlFor="all-scopes" style={row}>
        <Checkbox.Root
          id="all-scopes"
          checked={parent}
          // Mixed resolves to checked on click, so this grants the rest rather than
          // clearing what is already granted.
          onCheckedChange={(next) => setGranted(next === true ? [...SCOPES] : [])}
        >
          <Checkbox.Indicator />
        </Checkbox.Root>
        All permissions
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2xs)',
          paddingInlineStart: 'var(--space-md)',
        }}
      >
        {SCOPES.map((scope) => (
          <label key={scope} htmlFor={`scope-${scope}`} style={row}>
            <Checkbox.Root
              id={`scope-${scope}`}
              checked={granted.includes(scope)}
              onCheckedChange={(next) =>
                setGranted((current) =>
                  next === true ? [...current, scope] : current.filter((s) => s !== scope),
                )
              }
            >
              <Checkbox.Indicator />
            </Checkbox.Root>
            {scope}
          </label>
        ))}
      </div>
    </div>
  );
}
