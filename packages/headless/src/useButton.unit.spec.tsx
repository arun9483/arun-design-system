import { createElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useButton, retractActivationProps } from './useButton';

function Probe({
  native,
  disabled,
  tag = native ? 'button' : 'div',
  extra = {},
}: {
  native: boolean;
  disabled?: boolean;
  tag?: string;
  extra?: Record<string, unknown>;
}) {
  const { props, ref } = useButton({ native, disabled, props: extra });
  return createElement(tag, { ...props, ref, 'data-testid': 'el' }, 'x');
}

const el = () => screen.getByTestId('el');
const silenceErrors = () => vi.spyOn(console, 'error').mockImplementation(() => undefined);

describe('useButton — enabled', () => {
  it('gives a native button an explicit type so it does not submit', () => {
    render(<Probe native />);
    expect(el()).toHaveAttribute('type', 'button');
  });

  it("lets a consumer's type win", () => {
    render(<Probe native extra={{ type: 'submit' }} />);
    expect(el()).toHaveAttribute('type', 'submit');
  });

  it('does not put type on a non-button element', () => {
    const error = silenceErrors();
    render(<Probe native={false} />);
    expect(el()).not.toHaveAttribute('type');
    error.mockRestore();
  });

  it('makes a non-button element focusable', () => {
    render(<Probe native={false} />);
    expect(el()).toHaveAttribute('tabindex', '0');
  });

  it('activates a non-button element with Enter, like a native button', () => {
    const onClick = vi.fn();
    render(<Probe native={false} extra={{ onClick }} />);
    fireEvent.keyDown(el(), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('activates on Space keyup, not keydown, so the page does not scroll', () => {
    const onClick = vi.fn();
    render(<Probe native={false} extra={{ onClick }} />);

    fireEvent.keyDown(el(), { key: ' ' });
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.keyUp(el(), { key: ' ' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("chains a consumer's onKeyDown rather than losing keyboard activation to it", () => {
    const onKeyDown = vi.fn();
    const onClick = vi.fn();
    render(<Probe native={false} extra={{ onKeyDown, onClick }} />);

    fireEvent.keyDown(el(), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('adds nothing to a native button beyond type', () => {
    render(<Probe native />);
    expect(el()).not.toHaveAttribute('tabindex');
    expect(el()).not.toHaveAttribute('aria-disabled');
  });
});

describe('useButton — disabled', () => {
  it('leans on the platform for a native button', () => {
    const onClick = vi.fn();
    render(<Probe native disabled extra={{ onClick }} />);

    expect(el()).toBeDisabled();
    expect(el()).toHaveAttribute('data-disabled');
    fireEvent.click(el());
    expect(onClick).not.toHaveBeenCalled();
  });

  it('synthesises the state for anything else, and drops what would still activate', () => {
    const error = silenceErrors();
    const onClick = vi.fn();
    const onFocus = vi.fn();
    render(
      <Probe native={false} disabled tag="a" extra={{ href: '/x', onClick, onFocus, id: 'a' }} />,
    );

    expect(el()).not.toHaveAttribute('href');
    expect(el()).toHaveAttribute('aria-disabled', 'true');
    expect(el()).toHaveAttribute('tabindex', '-1');
    expect(el()).toHaveAttribute('data-disabled');
    expect(el()).toHaveAttribute('id', 'a');
    fireEvent.click(el());
    expect(onClick).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('does not respond to the keyboard', () => {
    const error = silenceErrors();
    const onClick = vi.fn();
    render(<Probe native={false} disabled extra={{ onClick }} />);

    fireEvent.keyDown(el(), { key: 'Enter' });
    fireEvent.keyUp(el(), { key: ' ' });
    expect(onClick).not.toHaveBeenCalled();
    error.mockRestore();
  });
});

describe('useButton — development check', () => {
  it('warns when a native button was expected but something else rendered', () => {
    const error = silenceErrors();
    render(<Probe native tag="div" />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('expected a native <button>'));
    error.mockRestore();
  });

  it('warns when a native button rendered but was treated as non-native', () => {
    const error = silenceErrors();
    render(<Probe native={false} tag="button" />);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('rendered a native <button>'));
    error.mockRestore();
  });

  it('stays quiet when they agree', () => {
    const error = silenceErrors();
    render(<Probe native />);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});

describe('retractActivationProps', () => {
  it('marks href and activation handlers for removal, leaving the rest', () => {
    const onFocus = vi.fn();
    const overrides = retractActivationProps({ href: '/x', onClick: vi.fn(), onFocus, id: 'a' });

    expect(overrides).toHaveProperty('href', undefined);
    expect(overrides).toHaveProperty('onClick', undefined);
    expect(overrides).not.toHaveProperty('onFocus');
    expect(overrides).not.toHaveProperty('id');
  });
});
