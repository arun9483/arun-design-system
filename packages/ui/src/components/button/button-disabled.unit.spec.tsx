import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button disabled', () => {
  it('uses the native attribute on a plain button', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick} data-testid="b">
        x
      </Button>,
    );
    const el = screen.getByTestId('b');
    expect(el.tagName).toBe('BUTTON');
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('data-disabled');
    fireEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('treats a render-supplied <button> as native', () => {
    render(
      <Button render={<button />} disabled data-testid="b">
        x
      </Button>,
    );
    expect(screen.getByTestId('b')).toBeDisabled();
  });
});
