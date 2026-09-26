import { useState } from 'react';
import { Input } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

/** A slot's button is the consumer's own element — styled, labelled and focused by them. */
const slotButton = {
  display: 'inline-flex',
  padding: 'var(--space-3xs)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

export default function InputSlots() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div style={field}>
        <label htmlFor="input-search">Search</label>
        <Input
          id="input-search"
          type="search"
          placeholder="Components…"
          startSlot={<SearchIcon />}
          endSlot={<kbd>⌘K</kbd>}
        />
      </div>

      <div style={field}>
        <label htmlFor="input-weight">Weight</label>
        <Input id="input-weight" type="number" inputMode="decimal" endSlot="kg" />
      </div>

      <div style={field}>
        <label htmlFor="input-password">Password</label>
        <Input
          id="input-password"
          type={visible ? 'text' : 'password'}
          defaultValue="correct horse"
          endSlot={
            <button
              type="button"
              style={slotButton}
              aria-pressed={visible}
              aria-controls="input-password"
              onClick={() => setVisible((v) => !v)}
            >
              {visible ? 'Hide' : 'Show'}
            </button>
          }
        />
      </div>
    </>
  );
}

/** Decorative: the label already says "Search", so the icon is hidden from assistive tech. */
function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
