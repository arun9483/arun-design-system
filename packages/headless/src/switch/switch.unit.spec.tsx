import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from './index';

/** Renders the anatomy a consumer would write, with an accessible name. */
function Fixture(props: Record<string, unknown> = {}) {
  return (
    // Switch.Root renders a <button>, which IS a labelable element — the rule just
    // cannot see through the component. The name assertion below proves it resolves.
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label>
      <Switch.Root {...props}>
        <Switch.Thumb />
      </Switch.Root>
      Notifications
    </label>
  );
}

describe('Switch — ARIA switch pattern', () => {
  it('exposes role=switch with aria-checked reflecting state', () => {
    render(<Fixture />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'true');
  });

  it('renders a native button, so it is focusable and keyboard-operable', () => {
    render(<Fixture />);
    const el = screen.getByRole('switch');
    expect(el.tagName).toBe('BUTTON');
    // type=button so it never submits an enclosing form by accident.
    expect(el).toHaveAttribute('type', 'button');
    el.focus();
    expect(el).toHaveFocus();
  });

  it('takes its accessible name from the wrapping label', () => {
    render(<Fixture />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('does not activate when disabled', () => {
    const onCheckedChange = vi.fn();
    render(<Fixture disabled onCheckedChange={onCheckedChange} />);
    const el = screen.getByRole('switch');
    expect(el).toBeDisabled();
    fireEvent.click(el);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Switch — state attributes', () => {
  it('emits mutually exclusive checked attributes on both parts', () => {
    render(
      <Switch.Root data-testid="root">
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>,
    );
    for (const id of ['root', 'thumb']) {
      expect(screen.getByTestId(id)).toHaveAttribute('data-unchecked');
      expect(screen.getByTestId(id)).not.toHaveAttribute('data-checked');
    }

    fireEvent.click(screen.getByTestId('root'));

    for (const id of ['root', 'thumb']) {
      expect(screen.getByTestId(id)).toHaveAttribute('data-checked');
      expect(screen.getByTestId(id)).not.toHaveAttribute('data-unchecked');
    }
  });

  it('emits data-disabled only when disabled', () => {
    const { rerender } = render(
      <Switch.Root data-testid="root">
        <Switch.Thumb />
      </Switch.Root>,
    );
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-disabled');
    rerender(
      <Switch.Root data-testid="root" disabled>
        <Switch.Thumb />
      </Switch.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-disabled');
  });
});

describe('Switch — controlled and uncontrolled', () => {
  it('manages its own state when uncontrolled', () => {
    render(<Fixture defaultChecked />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('defers to the parent when controlled, but still reports the intent', () => {
    const onCheckedChange = vi.fn();
    render(<Fixture checked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    // The parent did not update `checked`, so the switch must not move on its own.
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('reports the value it is moving to, in both modes', () => {
    const onCheckedChange = vi.fn();
    render(<Fixture defaultChecked onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });
});

describe('Switch — forms', () => {
  it('submits nothing when unchecked, like a native checkbox', () => {
    const { container } = render(<Fixture name="notifications" />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('submits its value when checked', () => {
    const { container } = render(<Fixture name="notifications" defaultChecked />);
    const input = container.querySelector('input[type="hidden"]');
    expect(input).toHaveAttribute('name', 'notifications');
    expect(input).toHaveAttribute('value', 'on');
  });

  it('accepts a custom submitted value', () => {
    const { container } = render(<Fixture name="plan" value="pro" defaultChecked />);
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute('value', 'pro');
  });

  it('renders no hidden input without a name', () => {
    const { container } = render(<Fixture defaultChecked />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe('Switch — composition', () => {
  it('renders the element given to `render`', () => {
    render(
      <Switch.Root render={<div />} data-testid="root">
        <Switch.Thumb />
      </Switch.Root>,
    );
    const el = screen.getByTestId('root');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('role', 'switch');
  });

  it('spreads unrecognised props and merges className', () => {
    render(
      <Switch.Root className="switch" id="notify" aria-describedby="hint">
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>,
    );
    const el = screen.getByRole('switch');
    expect(el).toHaveClass('switch');
    expect(el).toHaveAttribute('id', 'notify');
    expect(el).toHaveAttribute('aria-describedby', 'hint');
  });

  it('hides the thumb from assistive technology', () => {
    render(
      <Switch.Root>
        <Switch.Thumb data-testid="thumb" />
      </Switch.Root>,
    );
    expect(screen.getByTestId('thumb')).toHaveAttribute('aria-hidden', 'true');
  });

  it('tells you when Thumb is used outside Root', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Switch.Thumb />)).toThrow(/must be rendered inside <Switch.Root>/);
    error.mockRestore();
  });
});

describe('disabled', () => {
  it('relies on the platform when rendered as a button', () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch.Root disabled onCheckedChange={onCheckedChange} aria-label="s" data-testid="s" />,
    );
    const el = screen.getByTestId('s');

    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('data-disabled');
    fireEvent.click(el);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('synthesises the state when rendered as something the platform will not disable', () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Switch.Root
        render={<div />}
        disabled
        onCheckedChange={onCheckedChange}
        onClick={onClick}
        aria-label="s"
        data-testid="s"
      />,
    );
    const el = screen.getByTestId('s');

    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(el).toHaveAttribute('tabindex', '-1');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('still toggles, and still calls the consumer, when enabled', () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Switch.Root
        render={<div />}
        onCheckedChange={onCheckedChange}
        onClick={onClick}
        aria-label="s"
        data-testid="s"
      />,
    );
    fireEvent.click(screen.getByTestId('s'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
