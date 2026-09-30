import { useState } from 'react';
import { Button, Menu } from '@arun-dev/ui';

export default function MenuBasics() {
  const [last, setLast] = useState('nothing yet');

  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
      <Menu.Root>
        {/* Trigger is a plain button: render a Button to style it. */}
        <Menu.Trigger render={<Button />}>Actions</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={() => setLast('Edit')}>Edit</Menu.Item>
          <Menu.Item onClick={() => setLast('Duplicate')}>Duplicate</Menu.Item>
          <Menu.Item disabled>Archive</Menu.Item>
          <Menu.Item onClick={() => setLast('Delete')}>Delete</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <span>Chose: {last}</span>
    </div>
  );
}
