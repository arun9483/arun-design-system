import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './index';

const el = () => screen.getByTestId('b');

describe('Button', () => {
  it('renders a native button with an explicit type', () => {
    render(<Button data-testid="b">go</Button>);
    expect(el().tagName).toBe('BUTTON');
    expect(el()).toHaveAttribute('type', 'button');
  });

  it('keeps a submit button a submit button', () => {
    render(
      <Button type="submit" data-testid="b">
        go
      </Button>,
    );
    expect(el()).toHaveAttribute('type', 'submit');
  });

  it('renders a real link when given an href', () => {
    render(
      <Button href="/docs" target="_blank" rel="noreferrer" data-testid="b">
        Docs
      </Button>,
    );
    expect(el().tagName).toBe('A');
    expect(el()).toHaveAttribute('href', '/docs');
    expect(el()).toHaveAttribute('target', '_blank');
    // `type` means something else on an anchor, so it is not passed through.
    expect(el()).not.toHaveAttribute('type');
  });

  it('leans on the platform when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick} data-testid="b">
        go
      </Button>,
    );
    expect(el()).toBeDisabled();
    expect(el()).toHaveAttribute('data-disabled');
    fireEvent.click(el());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a disabled link as a disabled button, not a dead anchor', () => {
    const onClick = vi.fn();
    render(
      <Button href="/docs" disabled onClick={onClick} data-testid="b">
        Docs
      </Button>,
    );
    // It navigates nowhere, so it is not a link. The platform then supplies the tab
    // stop removal and the suppressed activation for free.
    expect(el().tagName).toBe('BUTTON');
    expect(el()).toBeDisabled();
    expect(el()).not.toHaveAttribute('href');
    expect(el()).toHaveAttribute('data-disabled');
    expect(screen.queryByRole('link')).toBeNull();
    fireEvent.click(el());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the element given to `render`, merging its own props onto it', () => {
    render(
      <Button render={<span />} className="btn" data-testid="b">
        go
      </Button>,
    );
    expect(el().tagName).toBe('SPAN');
    expect(el()).toHaveClass('btn');
  });

  it('reports an href it cannot take away when disabled', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <Button render={<a href="/docs" />} disabled data-testid="b">
        Docs
      </Button>,
    );
    expect(error).toHaveBeenCalledWith(expect.stringContaining('cannot remove the `href`'));
    error.mockRestore();
  });

  it('spreads unrecognised props onto the element', () => {
    render(
      <Button id="go" aria-describedby="hint" data-testid="b">
        go
      </Button>,
    );
    expect(el()).toHaveAttribute('id', 'go');
    expect(el()).toHaveAttribute('aria-describedby', 'hint');
  });
});
