import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Toolbar } from './index';
import { Toggle } from '../toggle';
import { ToggleGroup } from '../toggle-group';
import { Avatar } from '../avatar';

// Behaviour — pressing, the arrow keys, image loading — is @arun-dev/headless's, tested in a
// browser. These check what ui adds: the classes.
describe('Toggle, ToggleGroup, Toolbar, Avatar (ui)', () => {
  it('styles a toolbar and everything in it', () => {
    render(
      <Toolbar.Root aria-label="Formatting">
        <ToggleGroup aria-label="Style">
          <Toggle value="bold">Bold</Toggle>
        </ToggleGroup>
        <Toolbar.Separator />
        <Toolbar.Button>Undo</Toolbar.Button>
        <Toolbar.Input aria-label="Size" />
        <Toolbar.Link href="#help">Help</Toolbar.Link>
      </Toolbar.Root>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass('toolbar');
    expect(screen.getByRole('group', { name: 'Style' })).toHaveClass('toggle-group');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveClass('toggle');
    expect(screen.getByRole('separator')).toHaveClass('toolbar-separator');
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveClass('toolbar-button');
    expect(screen.getByRole('textbox', { name: 'Size' })).toHaveClass('toolbar-input');
    expect(screen.getByRole('link', { name: 'Help' })).toHaveClass('toolbar-link');
  });

  it('styles an avatar and its fallback', () => {
    render(
      <Avatar.Root data-testid="avatar">
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('avatar');
    expect(screen.getByText('AL')).toHaveClass('avatar-fallback');
  });
});
