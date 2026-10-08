import { useState } from 'react';
import { Menubar } from '@arun-dev/ui';

export default function MenubarBasics() {
  const [last, setLast] = useState('nothing yet');
  const [wrap, setWrap] = useState(true);
  const [zoom, setZoom] = useState('100%');

  return (
    <div style={{ display: 'grid', gap: 'var(--space-sm)', justifyItems: 'start' }}>
      <Menubar.Root aria-label="Editor">
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item onClick={() => setLast('New')}>New</Menubar.Item>
            <Menubar.Item onClick={() => setLast('Open')}>Open</Menubar.Item>
            <Menubar.SubmenuRoot>
              <Menubar.SubmenuTrigger>Export as</Menubar.SubmenuTrigger>
              <Menubar.Popup>
                <Menubar.Item onClick={() => setLast('PDF')}>PDF</Menubar.Item>
                <Menubar.Item onClick={() => setLast('Markdown')}>Markdown</Menubar.Item>
              </Menubar.Popup>
            </Menubar.SubmenuRoot>
            <Menubar.Item onClick={() => setLast('Print')}>Print</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item onClick={() => setLast('Undo')}>Undo</Menubar.Item>
            <Menubar.Item onClick={() => setLast('Redo')}>Redo</Menubar.Item>
            <Menubar.Item disabled>Paste</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger>View</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.CheckboxItem checked={wrap} onCheckedChange={setWrap}>
              <Menubar.ItemIndicator />
              Word wrap
            </Menubar.CheckboxItem>
            <Menubar.RadioGroup value={zoom} onValueChange={setZoom}>
              <Menubar.GroupLabel>Zoom</Menubar.GroupLabel>
              {['75%', '100%', '150%'].map((level) => (
                <Menubar.RadioItem key={level} value={level}>
                  <Menubar.ItemIndicator />
                  {level}
                </Menubar.RadioItem>
              ))}
            </Menubar.RadioGroup>
          </Menubar.Popup>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Trigger disabled>Help</Menubar.Trigger>
          <Menubar.Popup>
            <Menubar.Item>About</Menubar.Item>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>
      <span>
        Chose: {last} · Word wrap {wrap ? 'on' : 'off'} · Zoom {zoom}
      </span>
    </div>
  );
}
