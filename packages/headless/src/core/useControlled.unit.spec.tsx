import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useControlled } from './useControlled';

function Toggle({
  checked,
  defaultChecked,
  onCheckedChange,
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (next: boolean) => void;
}) {
  const [value, setValue] = useControlled({
    controlled: checked,
    default: defaultChecked ?? false,
    name: 'Toggle',
    state: 'checked',
  });
  return (
    <button
      type="button"
      onClick={() => {
        setValue(!value);
        onCheckedChange?.(!value);
      }}
    >
      {String(value)}
    </button>
  );
}

/** A parent that owns the value — what controlled use actually looks like. */
function ControlledParent({ initial = false }: { initial?: boolean }) {
  const [checked, setChecked] = useState(initial);
  return (
    <>
      <Toggle checked={checked} onCheckedChange={setChecked} />
      <span data-testid="parent-state">{String(checked)}</span>
    </>
  );
}

describe('useControlled', () => {
  it('manages its own value when uncontrolled', () => {
    render(<Toggle defaultChecked />);
    expect(screen.getByRole('button')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('false');
  });

  it('ignores its own setter when controlled — the parent owns the value', () => {
    render(<Toggle checked={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('true');
  });

  it('follows the controlled prop when it changes', () => {
    const { rerender } = render(<Toggle checked={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('false');
    rerender(<Toggle checked={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('true');
  });

  it('notifies onCheckedChange in both modes, even though controlled state is not written', () => {
    const onCheckedChange = vi.fn();

    const { unmount } = render(<Toggle checked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('button'));
    // controlled: value unchanged, but the parent was still told what was requested
    expect(screen.getByRole('button')).toHaveTextContent('false');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    unmount();

    onCheckedChange.mockClear();
    render(<Toggle defaultChecked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('button'));
    // uncontrolled: value changed and the parent was told all the same
    expect(screen.getByRole('button')).toHaveTextContent('true');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('updates only when the parent feeds the new value back through `checked`', () => {
    render(<ControlledParent />);
    expect(screen.getByRole('button')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('parent-state')).toHaveTextContent('true');
    expect(screen.getByRole('button')).toHaveTextContent('true');

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('parent-state')).toHaveTextContent('false');
    expect(screen.getByRole('button')).toHaveTextContent('false');
  });

  it('stays put when the parent refuses the change', () => {
    // parent hears onCheckedChange but never updates `checked` — the toggle must not move
    const onCheckedChange = vi.fn();
    render(<Toggle checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('false');
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
    expect(onCheckedChange).toHaveBeenNthCalledWith(2, true);
  });

  it('warns rather than silently switching mode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Toggle checked={true} />);
    rerender(<Toggle />);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('cannot switch between controlled and uncontrolled'),
    );
    error.mockRestore();
  });

  it('warns when the default changes after mount, since it is only read once', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Toggle defaultChecked={false} />);
    rerender(<Toggle defaultChecked={true} />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('cannot change the default'));
    error.mockRestore();
  });
});
