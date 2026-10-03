import { useState } from 'react';
import { Button, Select, Toast, useToastManager, type ToastPosition } from '@arun-dev/ui';

const positions: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

// The Viewport's `position` is the default for every toast; one toast can still choose its own.
export default function ToastPositionExample() {
  const [position, setPosition] = useState<ToastPosition>('top-center');
  return (
    <Toast.Provider>
      <div style={{ display: 'flex', gap: 'var(--space-2xs)', flexWrap: 'wrap' }}>
        <Select
          aria-label="Default position"
          value={position}
          onChange={(event) => setPosition(event.target.value as ToastPosition)}
        >
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Buttons />
      </div>
      <Toast.Viewport position={position} />
    </Toast.Provider>
  );
}

function Buttons() {
  const toast = useToastManager();
  return (
    <>
      <Button onClick={() => toast.add({ title: 'Saved', type: 'success' })}>
        Toast at the default
      </Button>
      <Button
        onClick={() => toast.add({ title: 'Link copied', type: 'info', position: 'bottom-left' })}
      >
        Toast at bottom-left
      </Button>
    </>
  );
}
