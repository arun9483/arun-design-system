import { useState } from 'react';
import { Button, Menu } from '@arun-dev/ui';

export default function MenuSubmenus() {
  const [last, setLast] = useState('nothing yet');

  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
      <Menu.Root>
        <Menu.Trigger render={<Button />}>File</Menu.Trigger>
        <Menu.Popup>
          <Menu.Item onClick={() => setLast('New')}>New</Menu.Item>
          <Menu.Item onClick={() => setLast('Open')}>Open</Menu.Item>
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
            <Menu.Popup>
              <Menu.Item onClick={() => setLast('Email')}>Email</Menu.Item>
              <Menu.Item onClick={() => setLast('Copy link')}>Copy link</Menu.Item>
              <Menu.SubmenuRoot>
                <Menu.SubmenuTrigger>Export as</Menu.SubmenuTrigger>
                <Menu.Popup>
                  <Menu.Item onClick={() => setLast('PDF')}>PDF</Menu.Item>
                  <Menu.Item onClick={() => setLast('PNG')}>PNG</Menu.Item>
                </Menu.Popup>
              </Menu.SubmenuRoot>
            </Menu.Popup>
          </Menu.SubmenuRoot>
          <Menu.Item onClick={() => setLast('Print')}>Print</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
      <span>Chose: {last}</span>
    </div>
  );
}
