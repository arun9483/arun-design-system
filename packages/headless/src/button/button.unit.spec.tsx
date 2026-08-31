import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './index';

const el = () => screen.getByTestId('b');
const silence = () => vi.spyOn(console, 'error').mockImplementation(() => undefined);

describe('Button', () => {
  it('renders a native button with an explicit type', () => {
    render(<Button data-testid="b">go</Button>);
    expect(el().tagName).toBe('BUTTON');
    expect(el()).toHaveAttribute('type', 'button');
  });

  it('infers a non-native element from render, and makes it operable', () => {
    const onClick = vi.fn();
    render(
      <Button render={<div />} onClick={onClick} data-testid="b">
        go
      </Button>,
    );
    expect(el()).toHaveAttribute('tabindex', '0');
    expect(el()).not.toHaveAttribute('type');

    fireEvent.keyDown(el(), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('takes an anchor for navigation, leaving it a real link', () => {
    render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <Button render={<a href="/docs" target="_blank" rel="noreferrer" />} data-testid="b">
        Docs
      </Button>,
    );
    expect(el().tagName).toBe('A');
    expect(el()).toHaveAttribute('href', '/docs');
    expect(el()).toHaveAttribute('target', '_blank');
  });

  it('leans on the platform when disabled and native', () => {
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

  it('synthesises the disabled state on an anchor, and drops the target', () => {
    const error = silence();
    const onClick = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <Button render={<a href="/docs" />} disabled onClick={onClick} data-testid="b">
        Docs
      </Button>,
    );
    expect(el()).not.toHaveAttribute('href');
    expect(el()).toHaveAttribute('aria-disabled', 'true');
    expect(el()).toHaveAttribute('tabindex', '-1');
    fireEvent.click(el());
    expect(onClick).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('accepts nativeButton for a component render cannot inspect', () => {
    const error = silence();
    function Wrapped(props: Record<string, unknown>) {
      return <button {...props} />;
    }
    render(
      <Button render={<Wrapped />} nativeButton data-testid="b">
        go
      </Button>,
    );
    // Treated as native despite render being a component, so no synthesised attributes.
    expect(el()).not.toHaveAttribute('tabindex');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
