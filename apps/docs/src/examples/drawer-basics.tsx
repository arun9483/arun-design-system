import { useState } from 'react';
import { Button, Drawer, Stack } from '@arun-dev/ui';

const actions = ['Copy link', 'Email', 'Message', 'Download PDF'];

export default function DrawerBasics() {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <Stack gap="xs" align="start">
      <Drawer.Root>
        {/* At the bottom by default: on a phone it is where the thumb is. Swipe it down,
            press Esc or the backdrop to close it. */}
        <Drawer.Trigger render={<Button />}>Share…</Drawer.Trigger>
        <Drawer.Popup>
          <Drawer.Title>Share report.pdf</Drawer.Title>
          <Stack gap="2xs">
            {actions.map((action) => (
              <Drawer.Close key={action} render={<Button />} onClick={() => setPicked(action)}>
                {action}
              </Drawer.Close>
            ))}
          </Stack>
        </Drawer.Popup>
      </Drawer.Root>
      {picked && <span>Picked: {picked}</span>}
    </Stack>
  );
}
