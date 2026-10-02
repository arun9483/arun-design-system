import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast, useToastManager } from './index';
import type { ToastManager } from '@arun-dev/headless/toast';

let manager: ToastManager;
function Capture() {
  manager = useToastManager();
  return null;
}

// Behaviour — timers, pausing, the top layer — is @arun-dev/headless's, tested in a browser.
// These check what ui adds: the default rendering and its classes.
describe('Toast (ui)', () => {
  it('renders each toast itself: title, description, action and a close button', () => {
    const undo = vi.fn();
    render(
      <Toast.Provider timeout={0}>
        <Capture />
        <Toast.Viewport closeLabel="Close" />
      </Toast.Provider>,
    );
    act(() => {
      manager.add({
        title: 'Archived',
        description: '3 conversations.',
        type: 'success',
        action: { label: 'Undo', onClick: undo },
      });
    });
    const title = screen.getByText('Archived');
    expect(title).toHaveClass('toast-title');
    const toast = title.parentElement as HTMLElement;
    expect(toast).toHaveClass('toast');
    expect(toast).toHaveAttribute('data-type', 'success');
    expect(toast.parentElement).toHaveClass('toast-viewport');
    expect(screen.getByText('3 conversations.')).toHaveClass('toast-description');
    screen.getByRole('button', { name: 'Undo', hidden: true }).click();
    expect(undo).toHaveBeenCalled();
    act(() => screen.getByRole('button', { name: 'Close', hidden: true }).click());
    expect(screen.queryByText('Archived')).toBeNull();
  });
});
