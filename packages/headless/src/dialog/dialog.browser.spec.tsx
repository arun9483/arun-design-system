import { useState } from 'react';
import { render, screen, act } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Dialog } from './index';
import type { DialogRootProps } from './DialogRoot';

/**
 * Runs in Chromium: jsdom has no showModal(), top layer, focus trap or Esc handling, and
 * those are exactly what Dialog leans on the platform for.
 */

function Basic(props: DialogRootProps & { withTitle?: boolean }) {
  const { withTitle = true, ...root } = props;
  return (
    <Dialog.Root {...root}>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Popup data-testid="popup">
        {withTitle && <Dialog.Title>Delete file</Dialog.Title>}
        <input aria-label="Reason" />
        <Dialog.Close>Cancel</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

const popup = () => screen.getByTestId('popup') as HTMLDialogElement;

/** A press and click on the backdrop: the dialog is the target, outside its own box. */
function clickBackdrop(dialog: HTMLElement, from: HTMLElement = dialog) {
  const at = { bubbles: true, clientX: 2, clientY: 2 };
  from.dispatchEvent(new PointerEvent('pointerdown', at));
  dialog.dispatchEvent(new MouseEvent('click', at));
}

describe('Dialog', () => {
  it('opens modally from the Trigger and moves focus inside', async () => {
    render(<Basic />);
    expect(popup().open).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(popup().open).toBe(true);
    expect(popup().matches(':modal')).toBe(true);
    expect(popup()).toHaveAttribute('data-open');
    expect(popup().contains(document.activeElement)).toBe(true);
  });

  it('wires the Trigger to the popup', async () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', popup().id);
    expect(trigger).toHaveAttribute('data-closed');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-open');
  });

  it('is named by its Title', async () => {
    render(<Basic defaultOpen />);
    const title = screen.getByRole('heading', { name: 'Delete file' });
    expect(popup()).toHaveAttribute('aria-labelledby', title.id);
    expect(screen.getByRole('dialog', { name: 'Delete file' })).toBe(popup());
  });

  it('follows a Title id of your own, and drops aria-labelledby without a Title', () => {
    const { unmount } = render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup data-testid="popup">
          <Dialog.Title id="mine">Mine</Dialog.Title>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    expect(popup()).toHaveAttribute('aria-labelledby', 'mine');
    unmount();

    render(<Basic defaultOpen withTitle={false} />);
    expect(popup()).not.toHaveAttribute('aria-labelledby');
  });

  it('closes on Esc, reports it, and returns focus to the Trigger', async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'Open' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(popup().open).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes from Dialog.Close', async () => {
    render(<Basic defaultOpen />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(popup().open).toBe(false);
    expect(popup()).toHaveAttribute('data-closed');
  });

  it('closes on a backdrop click, but not on a click inside', async () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultOpen onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole('textbox'));
    expect(popup().open).toBe(true);

    act(() => clickBackdrop(popup()));
    expect(popup().open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when a press inside is released on the backdrop', () => {
    render(<Basic defaultOpen />);
    // A text selection dragged out of the dialog: the click lands on the <dialog>.
    act(() => clickBackdrop(popup(), screen.getByRole('textbox')));
    expect(popup().open).toBe(true);
  });

  it('keeps the backdrop inert with closeOnBackdropClick={false}, but Esc still closes', async () => {
    render(<Basic defaultOpen closeOnBackdropClick={false} />);
    act(() => clickBackdrop(popup()));
    expect(popup().open).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(popup().open).toBe(false);
  });

  it('lets a controlled parent refuse to close', async () => {
    const onOpenChange = vi.fn();
    render(<Basic open onOpenChange={onOpenChange} />);
    expect(popup().open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    act(() => clickBackdrop(popup()));

    expect(onOpenChange.mock.calls).toEqual([[false], [false], [false]]);
    expect(popup().open).toBe(true);
  });

  it('opens and closes as a controlled parent says', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open from outside
          </button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Popup data-testid="popup" aria-label="Controlled">
              <button type="button" onClick={() => setOpen(false)}>
                Done
              </button>
            </Dialog.Popup>
          </Dialog.Root>
        </>
      );
    }
    render(<Controlled />);

    await userEvent.click(screen.getByRole('button', { name: 'Open from outside' }));
    expect(popup().open).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(popup().open).toBe(false);
  });

  function FormDialog(root: DialogRootProps) {
    return (
      <Dialog.Root {...root}>
        <Dialog.Popup data-testid="popup" aria-label="Form">
          <form method="dialog">
            <button type="submit">Submit</button>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
    );
  }

  it('reports a <form method="dialog"> submit', async () => {
    const onOpenChange = vi.fn();
    render(<FormDialog defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(popup().open).toBe(false);
  });

  it('reopens after a <form method="dialog"> submit the parent refuses', async () => {
    const onOpenChange = vi.fn();
    render(<FormDialog open onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    await vi.waitFor(() => expect(popup().open).toBe(true));
  });

  it('stays open when a consumer onCancel prevents the default', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Popup data-testid="popup" aria-label="Guarded" onCancel={(e) => e.preventDefault()}>
          <button type="button">Inside</button>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await userEvent.keyboard('{Escape}');
    expect(popup().open).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('leaves Esc to the platform when a consumer skips the component handler', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Popup
          data-testid="popup"
          aria-label="Native"
          onCancel={(event) =>
            (event as typeof event & { preventComponentHandler(): void }).preventComponentHandler()
          }
        >
          <button type="button">Inside</button>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await userEvent.keyboard('{Escape}');
    // The platform closes it; the close event still reports through the Root.
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(popup().open).toBe(false);
  });

  it('closes only the top dialog of a nested pair on Esc', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup data-testid="outer" aria-label="Outer">
          <Dialog.Root>
            <Dialog.Trigger>Open inner</Dialog.Trigger>
            <Dialog.Popup data-testid="inner" aria-label="Inner">
              <button type="button">Inner button</button>
            </Dialog.Popup>
          </Dialog.Root>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    const outer = screen.getByTestId('outer') as HTMLDialogElement;
    const inner = screen.getByTestId('inner') as HTMLDialogElement;

    await userEvent.click(screen.getByRole('button', { name: 'Open inner' }));
    expect(inner.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(inner.open).toBe(false);
    expect(outer.open).toBe(true);
  });

  it('drives a <dialog> supplied through render', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup aria-label="Rendered" render={<dialog data-testid="popup" data-custom="" />}>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(popup().open).toBe(true);
    expect(popup()).toHaveAttribute('data-custom');
    await userEvent.keyboard('{Escape}');
    expect(popup().open).toBe(false);
  });

  it('reports an open cancelled in onBeforeToggle as a close, and stays in step', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog.Root onOpenChange={onOpenChange}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Popup
          data-testid="popup"
          aria-label="Blocked"
          onBeforeToggle={(event) => {
            if (event.newState === 'open') event.preventDefault();
          }}
        >
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);

    expect(popup().open).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup()).toHaveAttribute('data-closed');
  });

  it('tells a controlled parent once when an open is cancelled, without looping', async () => {
    const onOpenChange = vi.fn();
    const onBeforeToggle = vi.fn((event: { newState: string; preventDefault(): void }) => {
      if (event.newState === 'open') event.preventDefault();
    });
    render(
      <Dialog.Root open onOpenChange={onOpenChange}>
        <Dialog.Popup data-testid="popup" aria-label="Blocked" onBeforeToggle={onBeforeToggle}>
          Content
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    // The parent keeps open={true}: it was told once, and nothing retried the open.
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(onBeforeToggle).toHaveBeenCalledOnce();
    expect(popup().open).toBe(false);
  });
});
