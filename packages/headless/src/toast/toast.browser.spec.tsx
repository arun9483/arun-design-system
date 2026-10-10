import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Toast, useToastManager } from './index';
import type { ToastManager, ToastProviderProps } from './index';
import { Dialog } from '../dialog';

/** Runs in a real browser: the popover top layer, real focus and real timers. */

let manager: ToastManager;
function Capture() {
  const value = useToastManager();
  useEffect(() => {
    manager = value;
  });
  return null;
}

function Toaster(props: ToastProviderProps) {
  return (
    <Toast.Provider {...props}>
      <Capture />
      <button type="button">Elsewhere</button>
      <Toast.Viewport data-testid="viewport">
        {(toasts) =>
          toasts.map((toast) => (
            <Toast.Root key={toast.id} toast={toast} data-testid={`toast-${toast.id}`}>
              <Toast.Title />
              <Toast.Description />
              <Toast.Close aria-label="Dismiss" />
            </Toast.Root>
          ))
        }
      </Toast.Viewport>
    </Toast.Provider>
  );
}

const viewport = () => screen.getByTestId('viewport');
const add = (options: Parameters<ToastManager['add']>[0]) => {
  let id = '';
  act(() => {
    id = manager.add(options);
  });
  return id;
};
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Toast (browser)', () => {
  it('shows in a polite, labelled region kept open in the top layer', () => {
    render(<Toaster />);
    expect(viewport().matches(':popover-open')).toBe(true);
    expect(viewport()).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('region', { name: 'Notifications' })).toBe(viewport());
    add({ title: 'Saved', description: 'Your changes are live.', type: 'success' });
    const toast = screen.getByText('Saved').parentElement as HTMLElement;
    expect(toast).toHaveAttribute('data-type', 'success');
    expect(toast).not.toHaveAttribute('role');
    expect(screen.getByText('Your changes are live.')).toBeInTheDocument();
  });

  it('closes after its timeout, and calls onClose once', async () => {
    const onClose = vi.fn();
    render(<Toaster />);
    add({ title: 'Brief', timeout: 100, onClose });
    expect(screen.getByText('Brief')).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.queryByText('Brief')).toBeNull());
    await wait(20);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps a timeout of 0 until closed', async () => {
    render(<Toaster />);
    add({ title: 'Sticky', timeout: 0 });
    await wait(150);
    expect(screen.getByText('Sticky')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Sticky')).toBeNull();
  });

  it('pauses while the pointer is over it, and resumes with the time left', async () => {
    render(<Toaster />);
    add({ title: 'Hover me', timeout: 300 });
    await userEvent.hover(screen.getByText('Hover me'));
    await wait(450);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    await userEvent.hover(screen.getByRole('button', { name: 'Elsewhere' }));
    await vi.waitFor(() => expect(screen.queryByText('Hover me')).toBeNull());
  });

  it('closes on Esc with focus inside, and hands focus to the Viewport', async () => {
    render(<Toaster />);
    add({ title: 'Undo?', timeout: 0 });
    screen.getByRole('button', { name: 'Dismiss' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Undo?')).toBeNull();
    expect(document.activeElement).toBe(viewport());
  });

  it('is role="alert" with priority \'high\'', () => {
    render(<Toaster />);
    add({ title: 'Connection lost', priority: 'high' });
    expect(screen.getByRole('alert')).toHaveTextContent('Connection lost');
  });

  it('shows the newest `limit`; the rest wait their turn', async () => {
    render(<Toaster limit={2} timeout={0} />);
    const first = add({ title: 'One' });
    add({ title: 'Two' });
    add({ title: 'Three' });
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.getByText('Two')).toBeInTheDocument();
    act(() => manager.close(manager.toasts.at(-1)?.id ?? ''));
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(first).toBeTruthy();
  });

  it('updates a shown toast, and a new timeout restarts it', async () => {
    render(<Toaster />);
    const id = add({ title: 'Saving…', timeout: 0 });
    act(() => manager.update(id, { title: 'Saved', timeout: 100 }));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.queryByText('Saved')).toBeNull());
  });

  it('starts a changed timeout in full, not less the time the old one ran', async () => {
    render(<Toaster />);
    const id = add({ title: 'Uploading', timeout: 400 });
    await wait(300);
    act(() => manager.update(id, { timeout: 450 }));
    // Short by the 300ms already run, it would close about 150ms after the update.
    await wait(250);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.queryByText('Uploading')).toBeNull());
  });

  it('shows over a modal Dialog, inert like the rest of the page until it closes', async () => {
    render(
      <>
        <Toaster timeout={0} />
        <Dialog.Root defaultOpen>
          <Dialog.Popup aria-label="Settings" data-testid="dialog">
            <p>Settings</p>
          </Dialog.Popup>
        </Dialog.Root>
      </>,
    );
    await vi.waitFor(() =>
      expect((screen.getByTestId('dialog') as HTMLDialogElement).open).toBe(true),
    );
    add({ title: 'Over the dialog' });
    const toast = screen.getByText('Over the dialog');
    expect(toast.checkVisibility()).toBe(true);
    // A modal <dialog> makes everything outside it inert, a later top-layer popover included:
    // it draws above, but the pointer cannot reach it.
    const box = toast.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + 2, box.top + 2);
    expect(toast.contains(hit)).toBe(false);
  });
});
