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

  it('synthesises the disabled state on an href button, and drops the target', () => {
    const onClick = vi.fn();
    render(
      <Button href="/x" disabled onClick={onClick} data-testid="b">
        x
      </Button>,
    );
    const el = screen.getByTestId('b');
    expect(el.tagName).toBe('A');
    expect(el).not.toHaveAttribute('href');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(el).toHaveAttribute('data-disabled');
    expect(el).toHaveAttribute('tabindex', '-1');
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

  it('leaves an enabled button alone', () => {
    const onClick = vi.fn();
    render(
      <Button href="/x" onClick={onClick} data-testid="b">
        x
      </Button>,
    );
    const el = screen.getByTestId('b');
    expect(el).toHaveAttribute('href', '/x');
    expect(el).not.toHaveAttribute('data-disabled');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Button disabled with a render element', () => {
  it('retracts an href written on the render element', () => {
    const onClick = vi.fn();
    // The anchor's content is Button's children, merged onto it by useRender — not
    // something the linter can see from the element literal.
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    const anchor = <a href="/y" onClick={onClick} />;

    render(
      <Button render={anchor} disabled data-testid="b">
        x
      </Button>,
    );
    const el = screen.getByTestId('b');
    expect(el).not.toHaveAttribute('href');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });
});
