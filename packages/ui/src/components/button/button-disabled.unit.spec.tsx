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

  it('renders a disabled link as a disabled button', () => {
    const onClick = vi.fn();
    render(
      <Button href="/x" disabled onClick={onClick} data-testid="b">
        x
      </Button>,
    );
    const el = screen.getByTestId('b');
    // A disabled link navigates nowhere, so it stops being a link and the platform
    // handles the rest.
    expect(el.tagName).toBe('BUTTON');
    expect(el).toBeDisabled();
    expect(el).not.toHaveAttribute('href');
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

  it('leaves an enabled button alone', () => {
    const onClick = vi.fn();
    render(
      <Button href="/x" onClick={onClick} data-testid="b">
        x
      </Button>,
    );
    const el = screen.getByTestId('b');
    expect(el.tagName).toBe('A');
    expect(el).toHaveAttribute('href', '/x');
    expect(el).not.toHaveAttribute('data-disabled');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Button disabled with a render element', () => {
  it('reports an href it cannot take away', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    const anchor = <a href="/y" />;

    render(
      <Button render={anchor} disabled data-testid="b">
        x
      </Button>,
    );
    expect(error).toHaveBeenCalledWith(expect.stringContaining('cannot remove the `href`'));
    error.mockRestore();
  });
});

describe('Button href with a render element', () => {
  it('puts the href on the rendered element', () => {
    render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/anchor-is-valid
      <Button href="/x" render={<a />} data-testid="b">
        x
      </Button>,
    );
    expect(screen.getByTestId('b')).toHaveAttribute('href', '/x');
  });
});
