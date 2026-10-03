import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Menu } from './index';
import { Button } from '../button';

// Behaviour and placement are @arun-dev/headless's and are tested there, in a real
// browser. These check only what ui adds: the class names, and a pass-through Trigger.
describe('Menu (ui)', () => {
  it('styles the popup and its items, keeping their props', () => {
    render(
      <Menu.Root>
        <Menu.Popup data-testid="menu" className="wide" side="top">
          <Menu.Item className="danger" disabled>
            Delete
          </Menu.Item>
        </Menu.Popup>
      </Menu.Root>,
    );
    const menu = screen.getByTestId('menu');
    expect(menu).toHaveClass('menu', 'wide');
    expect(menu).toHaveAttribute('role', 'menu');
    expect(menu).toHaveAttribute('data-side', 'top');

    const item = screen.getByText('Delete');
    expect(item).toHaveClass('menu-item', 'danger');
    expect(item).toHaveAttribute('data-disabled');
  });

  it('leaves the Trigger unstyled, and styled through a rendered Button', () => {
    render(
      <Menu.Root>
        <Menu.Trigger render={<Button />}>Actions</Menu.Trigger>
      </Menu.Root>,
    );
    expect(screen.getByText('Actions')).toHaveClass('btn');
    expect(screen.getByText('Actions')).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('styles checkable items, groups and labels, with a checkmark that keeps its space', () => {
    render(
      <Menu.Root>
        <Menu.Popup>
          <Menu.Group data-testid="group">
            <Menu.GroupLabel>View</Menu.GroupLabel>
            <Menu.CheckboxItem>
              <Menu.ItemIndicator data-testid="indicator" />
              Show grid
            </Menu.CheckboxItem>
          </Menu.Group>
          <Menu.RadioGroup data-testid="radios" defaultValue="name">
            <Menu.RadioItem value="name">
              <Menu.ItemIndicator>•</Menu.ItemIndicator>
              Name
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Root>,
    );
    expect(screen.getByTestId('group')).toHaveClass('menu-group');
    expect(screen.getByTestId('radios')).toHaveClass('menu-group');
    expect(screen.getByText('View')).toHaveClass('menu-group-label');

    const box = screen.getByRole('menuitemcheckbox', { hidden: true });
    expect(box).toHaveClass('menu-item');
    const indicator = screen.getByTestId('indicator');
    expect(indicator).toHaveClass('menu-item-indicator');
    expect(indicator).toHaveAttribute('data-unchecked');
    expect(indicator.querySelector('.menu-item-mark')).toBeInTheDocument();

    const radio = screen.getByRole('menuitemradio', { hidden: true });
    expect(radio).toHaveClass('menu-item');
    expect(radio).toHaveAttribute('aria-checked', 'true');
    // Children replace the default mark.
    expect(radio.querySelector('.menu-item-mark')).toBeNull();
  });
});
