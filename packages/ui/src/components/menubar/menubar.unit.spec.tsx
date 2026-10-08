import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Menubar } from './index';

// Behaviour — the arrow keys, opening, moving between menus — is @arun-dev/headless's, tested in
// a browser. These check what ui adds: the classes.
describe('Menubar (ui)', () => {
  it('styles the bar, its Triggers, and its menus as Menu does', () => {
    render(
      <Menubar.Root aria-label="Editor">
        <Menubar.Menu>
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Popup data-testid="file">
            <Menubar.Item>New</Menubar.Item>
            <Menubar.CheckboxItem>
              <Menubar.ItemIndicator data-testid="indicator" />
              Autosave
            </Menubar.CheckboxItem>
            <Menubar.SubmenuRoot>
              <Menubar.SubmenuTrigger>Recent</Menubar.SubmenuTrigger>
              <Menubar.Popup />
            </Menubar.SubmenuRoot>
          </Menubar.Popup>
        </Menubar.Menu>
      </Menubar.Root>,
    );
    expect(screen.getByRole('menubar', { name: 'Editor' })).toHaveClass('menubar');
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveClass('menubar-trigger');
    expect(screen.getByTestId('file')).toHaveClass('menu');
    expect(screen.getByRole('menuitem', { name: 'New', hidden: true })).toHaveClass('menu-item');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Autosave', hidden: true })).toHaveClass(
      'menu-item',
    );
    expect(screen.getByTestId('indicator')).toHaveClass('menu-item-indicator');
    expect(screen.getByRole('menuitem', { name: 'Recent', hidden: true })).toHaveClass('menu-item');
  });
});
