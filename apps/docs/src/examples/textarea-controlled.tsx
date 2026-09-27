import { useState } from 'react';
import { Button, Textarea } from '@arun-dev/ui';

// A definite column, so the textarea's width cap resolves: an auto track would grow with
// whatever width the user drags to.
const field = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: 'var(--space-3xs)',
  maxInlineSize: '24rem',
};

const LIMIT = 140;

export default function TextareaControlled() {
  const [status, setStatus] = useState('Shipping the Textarea docs');
  const over = status.length > LIMIT;

  return (
    <div style={field}>
      <label htmlFor="textarea-status">Status</label>
      {/* React state owns the value: every keystroke goes through onChange and back. */}
      <Textarea
        id="textarea-status"
        autoResize
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-invalid={over || undefined}
        aria-describedby="textarea-status-count"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small
          id="textarea-status-count"
          aria-live="polite"
          style={{ color: over ? 'var(--color-status-error)' : 'var(--color-text-muted)' }}
        >
          {status.length} / {LIMIT}
        </small>
        <Button onClick={() => setStatus('')}>Clear</Button>
      </div>
    </div>
  );
}
