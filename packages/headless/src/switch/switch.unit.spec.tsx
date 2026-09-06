import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from './index';

/** Renders the anatomy a consumer would write, with an accessible name. */
function Fixture(props: Record<string, unknown> = {}) {
  return (
    // `htmlFor` is not redundant with the wrapping: Switch.Root renders a <button>,
    // which a <label> would name implicitly, but jsx-a11y/label-has-associated-control
    // only accepts input/meter/output/progress/select/textarea as a nested control.
    // The explicit association satisfies the rule, so no call site needs a disable.
    <label htmlFor="notifications">
      <Switch.Root id="notifications" {...props}>
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
  const input = (container: HTMLElement) =>
    container.querySelector<HTMLInputElement>('input[type="checkbox"]');

  it('submits nothing when unchecked, like a native checkbox', () => {
    const { container } = render(<Fixture name="notifications" />);
    expect(input(container)?.checked).toBe(false);
  });

  it('submits its value when checked', () => {
    const { container } = render(<Fixture name="notifications" defaultChecked />);
    expect(input(container)).toHaveAttribute('name', 'notifications');
    expect(input(container)).toHaveAttribute('value', 'on');
    expect(input(container)?.checked).toBe(true);
  });

  it('accepts a custom submitted value', () => {
    const { container } = render(<Fixture name="plan" value="pro" defaultChecked />);
    expect(input(container)).toHaveAttribute('value', 'pro');
  });

  it('renders no form control without a name', () => {
    const { container } = render(<Fixture defaultChecked />);
    expect(input(container)).toBeNull();
  });

  it('keeps the form control out of the accessibility tree and the tab order', () => {
    const { container } = render(<Fixture name="notifications" />);
    // `hidden` does both, and leaves the input a real form control that form.reset()
    // and form.elements still see.
    expect(input(container)).toHaveAttribute('hidden');
  });
});

describe('Switch — composition', () => {
  it('renders the component given to `render`, merging its props onto it', () => {
    function Wrapped(props: Record<string, unknown>) {
      return <button {...props} />;
    }
    render(
      <Switch.Root render={<Wrapped />} className="switch" data-testid="root">
        <Switch.Thumb />
      </Switch.Root>,
    );
    const el = screen.getByTestId('root');
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('role', 'switch');
    expect(el).toHaveClass('switch');
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
  it('relies on the platform, because the element is always a button', () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch.Root disabled onCheckedChange={onCheckedChange} aria-label="s" data-testid="s" />,
    );
    const el = screen.getByTestId('s');

    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('data-disabled');
    fireEvent.click(el);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('still toggles, and still calls the consumer, when enabled', () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Switch.Root
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

describe('render must produce a button', () => {
  it('accepts a component that forwards its props to one', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Wrapped(props: Record<string, unknown>) {
      return <button {...props} />;
    }
    render(<Switch.Root render={<Wrapped />} aria-label="s" data-testid="s" />);

    expect(screen.getByTestId('s')).toHaveAttribute('type', 'button');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('reports anything else, rather than synthesising button behaviour for it', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Switch.Root render={<div />} aria-label="s" data-testid="s" />);

    expect(error).toHaveBeenCalledWith(expect.stringContaining('instead of <button>'));
    error.mockRestore();
  });
});
