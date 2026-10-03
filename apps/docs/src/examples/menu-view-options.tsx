import { useState } from 'react';
import { Button, Menu } from '@arun-dev/ui';

export default function MenuViewOptions() {
  const [grid, setGrid] = useState(true);
  const [rulers, setRulers] = useState(false);
  const [sort, setSort] = useState<string | null>('name');

  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
      <Menu.Root>
        <Menu.Trigger render={<Button />}>View</Menu.Trigger>
        <Menu.Popup>
          <Menu.Group>
            <Menu.GroupLabel>Show</Menu.GroupLabel>
            <Menu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
              <Menu.ItemIndicator />
              Grid
            </Menu.CheckboxItem>
            <Menu.CheckboxItem checked={rulers} onCheckedChange={setRulers}>
              <Menu.ItemIndicator />
              Rulers
            </Menu.CheckboxItem>
          </Menu.Group>
          <Menu.RadioGroup value={sort} onValueChange={setSort}>
            <Menu.GroupLabel>Sort by</Menu.GroupLabel>
            <Menu.RadioItem value="name">
              <Menu.ItemIndicator />
              Name
            </Menu.RadioItem>
            <Menu.RadioItem value="date">
              <Menu.ItemIndicator />
              Date modified
            </Menu.RadioItem>
            <Menu.RadioItem value="size">
              <Menu.ItemIndicator />
              Size
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>
      <span>
        Grid {grid ? 'on' : 'off'}, rulers {rulers ? 'on' : 'off'}, sorted by {sort}
      </span>
    </div>
  );
}
