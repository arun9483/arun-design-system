import { useState } from 'react';
import { Button, Drawer, Field, Stack, Textarea } from '@arun-dev/ui';

export default function DrawerUnsaved() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  return (
    <Drawer.Root
      open={open}
      // Every close — a swipe, Esc, the backdrop — arrives here. With a note half-written,
      // it is refused, and the drawer slides back.
      onOpenChange={(next) => {
        if (!next && note.trim() !== '') return;
        setOpen(next);
      }}
    >
      <Drawer.Trigger render={<Button />}>Add a note…</Drawer.Trigger>
      <Drawer.Popup side="right">
        <Drawer.Title>New note</Drawer.Title>
        <Stack gap="md">
          <Field.Root>
            <Field.Label>Note</Field.Label>
            <Field.Control
              render={<Textarea rows={4} />}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Field.Description>While it has text, swiping or Esc won’t close.</Field.Description>
          </Field.Root>
          <Stack direction="row" gap="2xs" justify="end">
            <Button
              onClick={() => {
                setNote('');
                setOpen(false);
              }}
            >
              Discard
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setNote('');
                setOpen(false);
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
