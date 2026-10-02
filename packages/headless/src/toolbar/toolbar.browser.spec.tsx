import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { Toolbar } from './index';
import { Toggle } from '../toggle';
import { ToggleGroup } from '../toggle-group';
import { Avatar } from '../avatar';

/** Runs in Chromium: real focus, keys and image loading. */

const focused = () => document.activeElement;
const button = (name: string) => screen.getByRole('button', { name });

describe('Toggle (browser)', () => {
  it('is a button with aria-pressed, toggled by a press', async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);
    expect(button('Bold')).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button('Bold'));
    expect(button('Bold')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Bold')).toHaveAttribute('data-pressed');
    expect(onPressedChange).toHaveBeenCalledWith(true);
    await userEvent.keyboard('{Enter}');
    expect(button('Bold')).toHaveAttribute('aria-pressed', 'false');
  });

  it('follows a controlled pressed', async () => {
    function Controlled() {
      const [pressed, setPressed] = useState(true);
      return (
        <Toggle pressed={pressed} onPressedChange={setPressed}>
          Mute
        </Toggle>
      );
    }
    render(<Controlled />);
    expect(button('Mute')).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(button('Mute'));
    expect(button('Mute')).toHaveAttribute('aria-pressed', 'false');
  });
});

function Alignment(props: { multiple?: boolean; defaultValue?: string[] }) {
  return (
    <>
      <button type="button">Before</button>
      <ToggleGroup aria-label="Alignment" {...props}>
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="justify" disabled>
          Justify
        </Toggle>
        <Toggle value="right">Right</Toggle>
      </ToggleGroup>
      <button type="button">After</button>
    </>
  );
}

describe('ToggleGroup (browser)', () => {
  it('is one Tab stop, the pressed Toggle, with arrow keys between, skipping disabled', async () => {
    render(<Alignment defaultValue={['center']} />);
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument();
    button('Before').focus();
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe(button('Center'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(button('Right'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(button('Left'));
    await userEvent.keyboard('{End}');
    expect(focused()).toBe(button('Right'));
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe(button('After'));
    // Back in: the Tab stop stayed where focus left it.
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(focused()).toBe(button('Right'));
  });

  it('presses one at a time, and releases the pressed one', async () => {
    render(<Alignment defaultValue={['left']} />);
    await userEvent.click(button('Right'));
    expect(button('Right')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Left')).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button('Right'));
    expect(button('Right')).toHaveAttribute('aria-pressed', 'false');
  });

  it('presses several with multiple', async () => {
    render(<Alignment multiple />);
    await userEvent.click(button('Left'));
    await userEvent.click(button('Right'));
    expect(button('Left')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Right')).toHaveAttribute('aria-pressed', 'true');
  });
});

function Editor() {
  return (
    <>
      <button type="button">Before</button>
      <Toolbar.Root aria-label="Formatting">
        <ToggleGroup aria-label="Style" multiple>
          <Toggle value="bold">Bold</Toggle>
          <Toggle value="italic">Italic</Toggle>
        </ToggleGroup>
        <Toolbar.Separator data-testid="separator" />
        <Toolbar.Button>Undo</Toolbar.Button>
        <Toolbar.Button disabled>Redo</Toolbar.Button>
        <Toolbar.Input aria-label="Font size" defaultValue="12" />
        <Toolbar.Link href="#help">Help</Toolbar.Link>
      </Toolbar.Root>
      <button type="button">After</button>
    </>
  );
}

describe('Toolbar (browser)', () => {
  it('is one Tab stop, with the arrow keys across every item, a ToggleGroup included', async () => {
    render(<Editor />);
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    button('Before').focus();
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe(button('Bold'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(button('Italic'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(button('Undo'));
    // Redo is disabled: skipped.
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(screen.getByRole('textbox', { name: 'Font size' }));
    await userEvent.keyboard('{Tab}');
    expect(focused()).toBe(button('After'));
  });

  it("lets a field's caret use Left and Right until it reaches an end", async () => {
    render(<Editor />);
    const field = screen.getByRole('textbox', { name: 'Font size' }) as HTMLInputElement;
    field.focus();
    field.setSelectionRange(1, 1);
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(field);
    expect(field.selectionStart).toBe(0);
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(button('Undo'));
    field.focus();
    field.setSelectionRange(2, 2);
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(screen.getByRole('link', { name: 'Help' }));
  });

  it('draws an upright separator in a horizontal toolbar', () => {
    render(<Editor />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });
});

const pixel =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Avatar (browser)', () => {
  it('shows the image once it loads, and the fallback until then', async () => {
    render(
      <Avatar.Root data-testid="avatar">
        <Avatar.Image src={pixel} alt="Ada Lovelace" />
        <Avatar.Fallback>AL</Avatar.Fallback>
      </Avatar.Root>,
    );
    await vi.waitFor(() =>
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument(),
    );
    expect(screen.queryByText('AL')).toBeNull();
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-image-status', 'loaded');
  });

  it('keeps the fallback, and never a broken image, when the image fails', async () => {
    render(
      <Avatar.Root data-testid="avatar">
        <Avatar.Image src="data:image/png;base64,broken" alt="Grace Hopper" />
        <Avatar.Fallback>GH</Avatar.Fallback>
      </Avatar.Root>,
    );
    await vi.waitFor(() =>
      expect(screen.getByTestId('avatar')).toHaveAttribute('data-image-status', 'error'),
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('GH')).toBeInTheDocument();
  });

  it('waits `delay` before showing the fallback', async () => {
    render(
      <Avatar.Root>
        <Avatar.Fallback delay={150}>AT</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.queryByText('AT')).toBeNull();
    await vi.waitFor(() => expect(screen.getByText('AT')).toBeInTheDocument());
  });
});
