import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useControlled } from './useControlled';

function Toggle({ checked, defaultChecked }: { checked?: boolean; defaultChecked?: boolean }) {
  const [value, setValue] = useControlled({
    controlled: checked,
    default: defaultChecked ?? false,
    name: 'Toggle',
    state: 'checked',
  });
  return (
    <button type="button" onClick={() => setValue(!value)}>
      {String(value)}
    </button>
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

  it('warns rather than silently switching mode', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Toggle checked={true} />);
    rerender(<Toggle />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('controlled and uncontrolled'));
    error.mockRestore();
  });

  it('warns when the default changes after mount, since it is only read once', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<Toggle defaultChecked={false} />);
    rerender(<Toggle defaultChecked={true} />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('default'));
    error.mockRestore();
  });
});
