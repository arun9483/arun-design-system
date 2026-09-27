import { useState } from 'react';
import { Button, Dialog, Input, Textarea } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)' };
const footer = { display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-xs)' };

export default function DialogForm() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <>
      {/* Controlled, and the backdrop is inert: a stray click must not lose the draft. */}
      <Dialog.Root open={open} onOpenChange={setOpen} closeOnBackdropClick={false}>
        <Dialog.Trigger render={<Button variant="primary" />}>New issue</Dialog.Trigger>
        <Dialog.Popup>
          <Dialog.Title>New issue</Dialog.Title>
          <form
            style={{ display: 'grid', gap: 'var(--space-md)' }}
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(String(new FormData(event.currentTarget).get('title')));
              setOpen(false);
            }}
          >
            <div style={field}>
              <label htmlFor="dialog-issue-title">Title</label>
              <Input id="dialog-issue-title" name="title" required />
            </div>
            <div style={field}>
              <label htmlFor="dialog-issue-body">Description</label>
              <Textarea id="dialog-issue-body" name="body" autoResize />
            </div>
            <div style={footer}>
              <Dialog.Close render={<Button />}>Cancel</Dialog.Close>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
      {saved && <p style={{ margin: 0 }}>Created “{saved}”.</p>}
    </>
  );
}
