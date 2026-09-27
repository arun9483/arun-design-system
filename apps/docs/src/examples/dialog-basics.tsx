import { useState } from 'react';
import { Button, Dialog } from '@arun-dev/ui';

const footer = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 'var(--space-xs)',
  marginBlockStart: 'var(--space-lg)',
};

export default function DialogBasics() {
  const [deleted, setDeleted] = useState(false);

  return (
    <>
      <Dialog.Root>
        {/* Trigger and Close are plain buttons: render a Button to style them. */}
        <Dialog.Trigger render={<Button />}>Delete file…</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>Delete report.pdf?</Dialog.Title>
          <p style={{ margin: 0 }}>It will be moved to the bin for 30 days.</p>
          <div style={footer}>
            <Dialog.Close render={<Button />}>Cancel</Dialog.Close>
            <Dialog.Close render={<Button variant="primary" />} onClick={() => setDeleted(true)}>
              Delete
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Root>
      {deleted && <p style={{ margin: 0 }}>Deleted.</p>}
    </>
  );
}
