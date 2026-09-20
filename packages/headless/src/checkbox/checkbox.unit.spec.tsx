import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './index';

/** What the enclosing form would submit, as [name, value] pairs. */
const submitted = (container: HTMLElement) => [
  ...new FormData(container.querySelector('form') ?? undefined).entries(),
];

/** Renders the anatomy a consumer would write, with an accessible name. */
function Fixture(props: Record<string, unknown> = {}) {
  return (
    // `htmlFor` is not redundant with the wrapping: Checkbox.Root renders a <button>,
    // which a <label> would name implicitly, but jsx-a11y/label-has-associated-control
    // only accepts input/meter/output/progress/select/textarea as a nested control.
    // The explicit association satisfies the rule, so no call site needs a disable.
    <label htmlFor="terms">
      <Checkbox.Root id="terms" {...props}>
        <Checkbox.Indicator />
      </Checkbox.Root>
      Accept terms
    </label>
  );
}

describe('Checkbox — ARIA checkbox pattern', () => {
  it('exposes role=checkbox with aria-checked reflecting state', () => {
    render(<Fixture />);
    const el = screen.getByRole('checkbox');
    expect(el).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'true');
  });

  it('spells the third state "mixed", as ARIA does', () => {
    render(<Fixture defaultChecked="indeterminate" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('reads as partially checked to assistive technology', () => {
    render(<Fixture defaultChecked="indeterminate" />);
    // The accessibility-level assertion, rather than the attribute one above: this is
    // what a screen reader announces as "mixed".
    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
  });

  it('renders a native button, so it is focusable and keyboard-operable', () => {
    render(<Fixture />);
    const el = screen.getByRole('checkbox');
    expect(el.tagName).toBe('BUTTON');
    // type=button so it never submits an enclosing form by accident.
    expect(el).toHaveAttribute('type', 'button');
    el.focus();
    expect(el).toHaveFocus();
  });

  it('takes its accessible name from the wrapping label', () => {
    render(<Fixture />);
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
  });

  it('does not activate when disabled', () => {
    const onCheckedChange = vi.fn();
    render(<Fixture disabled onCheckedChange={onCheckedChange} />);
    const el = screen.getByRole('checkbox');
    expect(el).toBeDisabled();
    fireEvent.click(el);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Checkbox — state attributes', () => {
  /** The three checked attributes, as [present, absent, absent] for a given state. */
  const CHECKED_ATTRIBUTES = ['data-checked', 'data-unchecked', 'data-indeterminate'];

  it.each([
    [false, 'data-unchecked'],
    [true, 'data-checked'],
    ['indeterminate', 'data-indeterminate'],
  ] as const)('emits exactly one checked attribute for %s, on both parts', (state, expected) => {
    render(
      <Checkbox.Root defaultChecked={state} data-testid="root">
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );

    for (const id of ['root', 'indicator']) {
      const el = screen.getByTestId(id);
      for (const attribute of CHECKED_ATTRIBUTES) {
        if (attribute === expected) expect(el).toHaveAttribute(attribute);
        else expect(el).not.toHaveAttribute(attribute);
      }
    }
  });

  it('moves both parts together when the state changes', () => {
    render(
      <Checkbox.Root data-testid="root">
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    fireEvent.click(screen.getByTestId('root'));

    for (const id of ['root', 'indicator']) {
      expect(screen.getByTestId(id)).toHaveAttribute('data-checked');
      expect(screen.getByTestId(id)).not.toHaveAttribute('data-unchecked');
    }
  });

  it('emits data-disabled only when disabled', () => {
    const { rerender } = render(
      <Checkbox.Root data-testid="root">
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-disabled');
    rerender(
      <Checkbox.Root data-testid="root" disabled>
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('root')).toHaveAttribute('data-disabled');
  });
});

describe('Checkbox — activation', () => {
  it.each([
    [false, true],
    [true, false],
    // Indeterminate is a state to resolve, not one to cycle back through.
    ['indeterminate', true],
  ] as const)('goes from %s to %s on click', (from, to) => {
    const onCheckedChange = vi.fn();
    render(<Fixture defaultChecked={from} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(to);
  });

  it('never returns to indeterminate on its own — only the parent can set it', () => {
    render(<Fixture defaultChecked="indeterminate" />);
    const el = screen.getByRole('checkbox');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Checkbox — controlled and uncontrolled', () => {
  it('manages its own state when uncontrolled', () => {
    render(<Fixture defaultChecked />);
    const el = screen.getByRole('checkbox');
    expect(el).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('defers to the parent when controlled, but still reports the intent', () => {
    const onCheckedChange = vi.fn();
    render(<Fixture checked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    // The parent did not update `checked`, so the checkbox must not move on its own.
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('accepts indeterminate from a controlled parent', () => {
    const { rerender } = render(<Fixture checked={false} />);
    rerender(<Fixture checked="indeterminate" />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('Checkbox — forms', () => {
  const input = (container: HTMLElement) =>
    container.querySelector<HTMLInputElement>('input[type="checkbox"]');

  it('submits nothing when unchecked, like a native checkbox', () => {
    const { container } = render(<Fixture name="terms" />);
    expect(input(container)?.checked).toBe(false);
  });

  it('submits nothing when indeterminate — checkedness alone decides', () => {
    const { container } = render(
      <form>
        <Fixture name="terms" defaultChecked="indeterminate" />
      </form>,
    );
    expect(input(container)?.checked).toBe(false);
    expect(submitted(container)).toEqual([]);
  });

  it('submits its value when checked', () => {
    const { container } = render(<Fixture name="terms" defaultChecked />);
    expect(input(container)).toHaveAttribute('name', 'terms');
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
    const { container } = render(<Fixture name="terms" />);
    // `hidden` does both, and leaves the input a real form control that form.elements
    // still lists.
    expect(input(container)).toHaveAttribute('hidden');
  });

  it('submits nothing when disabled, like a native checkbox', () => {
    const { container } = render(
      <form>
        <Fixture name="terms" defaultChecked disabled />
      </form>,
    );
    expect(submitted(container)).toEqual([]);
  });
});

describe('Checkbox — form reset', () => {
  const reset = (container: HTMLElement) =>
    act(async () => container.querySelector('form')?.reset());

  it.each([
    [false, 'false'],
    [true, 'true'],
    // The state a native checkbox cannot restore: `.indeterminate` is a DOM property
    // the platform's reset algorithm never touches.
    ['indeterminate', 'mixed'],
  ] as const)('returns to its initial state (defaultChecked=%s)', async (initial, aria) => {
    const { container } = render(
      <form>
        <Fixture name="terms" defaultChecked={initial} />
      </form>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    await reset(container);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', aria);
  });

  it('keeps what it shows and what it submits in agreement', async () => {
    const { container } = render(
      <form>
        <Fixture name="terms" defaultChecked="indeterminate" />
      </form>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(submitted(container)).toEqual([['terms', 'on']]);

    await reset(container);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    expect(submitted(container)).toEqual([]);
  });

  it('reports the reset, and returns to its initial state without a name too', async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <form>
        <Fixture defaultChecked onCheckedChange={onCheckedChange} />
      </form>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    await reset(container);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('asks a controlled parent, and stays in agreement when the parent declines', async () => {
    const onCheckedChange = vi.fn();
    const { container, rerender } = render(
      <form>
        <Fixture name="terms" checked={false} onCheckedChange={onCheckedChange} />
      </form>,
    );
    rerender(
      <form>
        <Fixture name="terms" checked onCheckedChange={onCheckedChange} />
      </form>,
    );
    await reset(container);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    // The parent did not feed `false` back, so the checkbox stays on — and so does the
    // value it submits.
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    expect(submitted(container)).toEqual([['terms', 'on']]);
  });

  it('ignores a reset that was cancelled', async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <Fixture name="terms" />
      </form>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    await reset(container);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    expect(submitted(container)).toEqual([['terms', 'on']]);
  });
});

describe('Checkbox — composition', () => {
  it('renders the component given to `render`, merging its props onto it', () => {
    function Wrapped(props: Record<string, unknown>) {
      return <button {...props} />;
    }
    render(
      <Checkbox.Root render={<Wrapped />} className="checkbox" data-testid="root">
        <Checkbox.Indicator />
      </Checkbox.Root>,
    );
    const el = screen.getByTestId('root');
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('role', 'checkbox');
    expect(el).toHaveClass('checkbox');
  });

  it('spreads unrecognised props and merges className', () => {
    render(
      <Checkbox.Root className="checkbox" id="terms" aria-describedby="hint">
        <Checkbox.Indicator className="checkbox-indicator" />
      </Checkbox.Root>,
    );
    const el = screen.getByRole('checkbox');
    expect(el).toHaveClass('checkbox');
    expect(el).toHaveAttribute('id', 'terms');
    expect(el).toHaveAttribute('aria-describedby', 'hint');
  });

  it('hides the indicator from assistive technology', () => {
    render(
      <Checkbox.Root>
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('indicator')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the indicator in every state, so CSS has something to transition', () => {
    const { rerender } = render(
      <Checkbox.Root checked={false}>
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
    rerender(
      <Checkbox.Root checked>
        <Checkbox.Indicator data-testid="indicator" />
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
  });

  it('lets the indicator hold whatever mark the consumer supplies', () => {
    render(
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator data-testid="indicator">
          <svg data-testid="mark" />
        </Checkbox.Indicator>
      </Checkbox.Root>,
    );
    expect(screen.getByTestId('mark')).toBeInTheDocument();
  });

  it('tells you when Indicator is used outside Root', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Checkbox.Indicator />)).toThrow(/must be rendered inside <Checkbox.Root>/);
    error.mockRestore();
  });
});

describe('disabled', () => {
  it('uses the native attribute on the default button', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox.Root disabled onCheckedChange={onCheckedChange} aria-label="c" data-testid="c" />,
    );
    const el = screen.getByTestId('c');

    expect(el).toBeDisabled();
    expect(el).toHaveAttribute('data-disabled');
    fireEvent.click(el);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('stays disabled when the render element overrides the attribute', () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Checkbox.Root
        disabled
        name="n"
        render={<button disabled={false} />}
        onCheckedChange={onCheckedChange}
        aria-label="c"
        data-testid="c"
      />,
    );
    const el = screen.getByTestId('c');

    // The render element wins the markup; the component's state still decides behaviour.
    expect(el).not.toBeDisabled();
    fireEvent.click(el);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(el).toHaveAttribute('aria-checked', 'false');
    expect(el).toHaveAttribute('data-disabled');
    expect(container.querySelector('input[name="n"]')).toBeDisabled();
  });

  it('still toggles, and still calls the consumer, when enabled', () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn();
    render(
      <Checkbox.Root
        onCheckedChange={onCheckedChange}
        onClick={onClick}
        aria-label="c"
        data-testid="c"
      />,
    );
    fireEvent.click(screen.getByTestId('c'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('render', () => {
  it('renders whatever the render element produces, without a warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Checkbox.Root render={<div />} aria-label="c" data-testid="c" />);

    expect(screen.getByTestId('c').tagName).toBe('DIV');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
