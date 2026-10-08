import { useState } from 'react';
import { Menubar } from '@arun-dev/ui';

export default function MenubarSubmenus() {
  const [last, setLast] = useState('nothing yet');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-sm)', justifyItems: 'start' }}>
      <Menubar.Root aria-label="Document">
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item onClick={() => setLast('New')}>New</Menubar.Item>
            <Menubar.SubmenuRoot>
              <Menubar.SubmenuTrigger>Share</Menubar.SubmenuTrigger>
              <Menubar.Popup>
                <Menubar.Item onClick={() => setLast('Email')}>Email</Menubar.Item>
                <Menubar.Item onClick={() => setLast('Copy link')}>Copy link</Menubar.Item>
                <Menubar.SubmenuRoot>
                  <Menubar.SubmenuTrigger>Export as</Menubar.SubmenuTrigger>
                  <Menubar.Popup>
                    <Menubar.Item onClick={() => setLast('PDF')}>PDF</Menubar.Item>
                    <Menubar.Item onClick={() => setLast('PNG')}>PNG</Menubar.Item>
                  </Menubar.Popup>
                </Menubar.SubmenuRoot>
              </Menubar.Popup>
            </Menubar.SubmenuRoot>
            <Menubar.Item onClick={() => setLast('Print')}>Print</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item onClick={() => setLast('Undo')}>Undo</Menubar.Item>
            <Menubar.SubmenuRoot>
              <Menubar.SubmenuTrigger>Find</Menubar.SubmenuTrigger>
              <Menubar.Popup>
                <Menubar.Item onClick={() => setLast('Find…')}>Find…</Menubar.Item>
                <Menubar.Item onClick={() => setLast('Replace…')}>Replace…</Menubar.Item>
              </Menubar.Popup>
            </Menubar.SubmenuRoot>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>
      <span>Chose: {last}</span>
    </div>
  );
}
