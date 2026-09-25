import { act, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup } from './index';

/** What the enclosing form would submit, as [name, value] pairs. */
const submitted = (container: HTMLElement) => [
  ...new FormData(container.querySelector('form') ?? undefined).entries(),
];

const radio = (name: string) => screen.getByRole<HTMLInputElement>('radio', { name });

/** Renders the anatomy a consumer would write, with accessible names throughout. */
function Fixture(props: Record<string, unknown> = {}) {
  return (
    <>
      <span id="caption">Plan</span>
      <RadioGroup.Root aria-labelledby="caption" {...props}>
        {/* `htmlFor` is not redundant with the wrapping. A wrapping label alone names the
            radio — it is a real <input> — but jsx-a11y/label-has-associated-control cannot
            see through <RadioGroup.Item> to the input it renders. */}
        <label htmlFor="free">
          <RadioGroup.Item id="free" value="free" />
          Free
        </label>
        <label htmlFor="pro">
          <RadioGroup.Item id="pro" value="pro" />
          Pro
        </label>
        <label htmlFor="team">
          <RadioGroup.Item id="team" value="team" />
          Team
        </label>
      </RadioGroup.Root>
    </>
  );
}

describe('RadioGroup — native radio semantics', () => {
  it('renders each item as a native radio input', () => {
    render(<Fixture />);
    for (const name of ['Free', 'Pro', 'Team']) {
      expect(radio(name).tagName).toBe('INPUT');
      expect(radio(name)).toHaveAttribute('type', 'radio');
    }
  });

  it('exposes the group as a named radiogroup', () => {
    render(<Fixture />);
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
  });

  it('takes each radio’s accessible name from its wrapping label', () => {
    render(<Fixture />);
    expect(radio('Pro')).toBeInTheDocument();
  });

  it('starts with nothing selected, as a native group does', () => {
    render(<Fixture />);
    for (const name of ['Free', 'Pro', 'Team']) expect(radio(name)).not.toBeChecked();
  });

  it('selects one radio at a time', () => {
    render(<Fixture defaultValue="free" />);
    fireEvent.click(radio('Pro'));
    expect(radio('Pro')).toBeChecked();
    expect(radio('Free')).not.toBeChecked();
    expect(radio('Team')).not.toBeChecked();
  });

  it('gives every radio the same name — what the platform groups them by', () => {
    render(<Fixture name="plan" />);
    for (const name of ['Free', 'Pro', 'Team']) expect(radio(name)).toHaveAttribute('name', 'plan');
  });

  it('generates a name when none is given, distinct per group', () => {
    // Arrow keys and one-checked-at-a-time are the platform's, and it only applies them
    // to radios that share a name — two unnamed groups must not merge into one.
    render(
      <>
        <RadioGroup.Root aria-label="a">
          <RadioGroup.Item value="1" aria-label="a1" />
          <RadioGroup.Item value="2" aria-label="a2" />
        </RadioGroup.Root>
        <RadioGroup.Root aria-label="b">
          <RadioGroup.Item value="1" aria-label="b1" />
        </RadioGroup.Root>
      </>,
    );
    const a = radio('a1').name;
    expect(a).not.toBe('');
    expect(radio('a2').name).toBe(a);
    expect(radio('b1').name).not.toBe(a);
  });
});

describe('RadioGroup — state attributes', () => {
  it('emits exactly one of data-checked / data-unchecked on every radio', () => {
    render(<Fixture defaultValue="pro" />);
    expect(radio('Pro')).toHaveAttribute('data-checked');
    expect(radio('Pro')).not.toHaveAttribute('data-unchecked');
    for (const name of ['Free', 'Team']) {
      expect(radio(name)).toHaveAttribute('data-unchecked');
      expect(radio(name)).not.toHaveAttribute('data-checked');
    }
  });

  it('moves the attributes with the selection', () => {
    render(<Fixture defaultValue="pro" />);
    fireEvent.click(radio('Team'));
    expect(radio('Team')).toHaveAttribute('data-checked');
    expect(radio('Pro')).toHaveAttribute('data-unchecked');
  });

  it('emits data-disabled on the group and on every radio when the group is disabled', () => {
    render(<Fixture disabled />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled');
    for (const name of ['Free', 'Pro', 'Team'])
      expect(radio(name)).toHaveAttribute('data-disabled');
  });

  it('emits data-disabled only on the radio that is disabled', () => {
    render(
      <RadioGroup.Root aria-label="g">
        <RadioGroup.Item value="a" aria-label="A" disabled />
        <RadioGroup.Item value="b" aria-label="B" />
      </RadioGroup.Root>,
    );
    expect(screen.getByRole('radiogroup')).not.toHaveAttribute('data-disabled');
    expect(radio('A')).toHaveAttribute('data-disabled');
    expect(radio('B')).not.toHaveAttribute('data-disabled');
  });
});

describe('RadioGroup — controlled and uncontrolled', () => {
  it('manages its own value when uncontrolled, and reports each change', () => {
    const onValueChange = vi.fn();
    render(<Fixture defaultValue="free" onValueChange={onValueChange} />);
    fireEvent.click(radio('Team'));
    expect(onValueChange).toHaveBeenCalledWith('team');
    expect(radio('Team')).toBeChecked();
  });

  it('does not report a click on the radio that is already selected', () => {
    // The platform fires no `change` for it, so there is nothing to report.
    const onValueChange = vi.fn();
    render(<Fixture defaultValue="free" onValueChange={onValueChange} />);
    fireEvent.click(radio('Free'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('defers to the parent when controlled, but still reports the intent', () => {
    const onValueChange = vi.fn();
    render(<Fixture value="free" onValueChange={onValueChange} />);
    fireEvent.click(radio('Pro'));
    expect(onValueChange).toHaveBeenCalledWith('pro');
    // The platform checked it; React put it back, because the value did not move.
    expect(radio('Pro')).not.toBeChecked();
    expect(radio('Free')).toBeChecked();
  });

  it('follows the parent', () => {
    const { rerender } = render(<Fixture value="free" />);
    rerender(<Fixture value="team" />);
    expect(radio('Team')).toBeChecked();
    expect(radio('Free')).not.toBeChecked();
  });

  it('takes null as "nothing selected" while staying controlled', () => {
    const { rerender } = render(<Fixture value={null} />);
    for (const name of ['Free', 'Pro', 'Team']) expect(radio(name)).not.toBeChecked();
    rerender(<Fixture value="pro" />);
    expect(radio('Pro')).toBeChecked();
  });
});

describe('RadioGroup — forms', () => {
  it('submits the selected value under the group’s name', () => {
    const { container } = render(
      <form>
        <Fixture name="plan" defaultValue="pro" />
      </form>,
    );
    expect(submitted(container)).toEqual([['plan', 'pro']]);
    fireEvent.click(radio('Team'));
    expect(submitted(container)).toEqual([['plan', 'team']]);
  });

  it('submits nothing when nothing is selected', () => {
    const { container } = render(
      <form>
        <Fixture name="plan" />
      </form>,
    );
    expect(submitted(container)).toEqual([]);
  });

  it('submits nothing when disabled, like a native radio', () => {
    const { container } = render(
      <form>
        <Fixture name="plan" defaultValue="pro" disabled />
      </form>,
    );
    expect(submitted(container)).toEqual([]);
  });

  it('blocks submission until a radio is selected when required', () => {
    const { container } = render(
      <form>
        <Fixture name="plan" required />
      </form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
    expect(form.checkValidity()).toBe(false);
    fireEvent.click(radio('Free'));
    expect(form.checkValidity()).toBe(true);
  });

  it('joins a form it is rendered outside, by id', () => {
    const { container } = render(
      <>
        <form id="billing" />
        <Fixture name="plan" defaultValue="team" form="billing" />
      </>,
    );
    expect(submitted(container)).toEqual([['plan', 'team']]);
  });

  it('is listed in form.elements, as the platform’s own RadioNodeList', () => {
    const { container } = render(
      <form>
        <Fixture name="plan" defaultValue="pro" />
      </form>,
    );
    const list = container.querySelector('form')?.elements.namedItem('plan') as RadioNodeList;
    expect(list.value).toBe('pro');
  });
});

describe('RadioGroup — form reset', () => {
  const reset = (container: HTMLElement) =>
    act(async () => container.querySelector('form')?.reset());

  it('returns to the value it mounted with, and reports it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Fixture name="plan" defaultValue="free" onValueChange={onValueChange} />
      </form>,
    );
    fireEvent.click(radio('Team'));
    await reset(container);
    expect(onValueChange).toHaveBeenLastCalledWith('free');
    expect(radio('Free')).toBeChecked();
    expect(radio('Free')).toHaveAttribute('data-checked');
    expect(radio('Team')).toHaveAttribute('data-unchecked');
  });

  it('returns to nothing selected, reporting null', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Fixture name="plan" onValueChange={onValueChange} />
      </form>,
    );
    fireEvent.click(radio('Pro'));
    await reset(container);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    for (const name of ['Free', 'Pro', 'Team']) expect(radio(name)).not.toBeChecked();
    expect(submitted(container)).toEqual([]);
  });

  it('keeps what it shows and what it submits in agreement', async () => {
    const { container } = render(
      <form>
        <Fixture name="plan" defaultValue="free" />
      </form>,
    );
    fireEvent.click(radio('Pro'));
    expect(submitted(container)).toEqual([['plan', 'pro']]);
    await reset(container);
    expect(submitted(container)).toEqual([['plan', 'free']]);
    expect(radio('Free')).toHaveAttribute('data-checked');
  });

  it('asks a controlled parent, and stays in agreement when the parent declines', async () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <form>
        <Fixture name="plan" value="free" onValueChange={onValueChange} />
      </form>,
    );
    rerender(
      <form>
        <Fixture name="plan" value="team" onValueChange={onValueChange} />
      </form>,
    );
    await reset(container);
    expect(onValueChange).toHaveBeenCalledWith('free');
    // The parent did not feed 'free' back. The platform reset the inputs to it anyway,
    // and the group put them back — so the form still submits what the screen shows.
    expect(radio('Team')).toBeChecked();
    expect(radio('Free')).not.toBeChecked();
    expect(submitted(container)).toEqual([['plan', 'team']]);
  });

  it('ignores a reset that was cancelled', async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <Fixture name="plan" defaultValue="free" />
      </form>,
    );
    fireEvent.click(radio('Pro'));
    await reset(container);
    expect(radio('Pro')).toBeChecked();
    expect(submitted(container)).toEqual([['plan', 'pro']]);
  });

  it('resets a group joined to its form by id', async () => {
    const { container } = render(
      <>
        <form id="billing" />
        <Fixture name="plan" defaultValue="free" form="billing" />
      </>,
    );
    fireEvent.click(radio('Pro'));
    await reset(container);
    expect(radio('Free')).toBeChecked();
  });
});

describe('RadioGroup — disabled', () => {
  it('uses the native attribute, and does not move', () => {
    const onValueChange = vi.fn();
    render(<Fixture disabled defaultValue="free" onValueChange={onValueChange} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
    expect(radio('Pro')).toBeDisabled();
    fireEvent.click(radio('Pro'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(radio('Free')).toBeChecked();
  });

  it('disables one radio and leaves the rest of the group alone', () => {
    render(
      <RadioGroup.Root aria-label="g">
        <RadioGroup.Item value="a" aria-label="A" disabled />
        <RadioGroup.Item value="b" aria-label="B" />
      </RadioGroup.Root>,
    );
    expect(radio('A')).toBeDisabled();
    fireEvent.click(radio('B'));
    expect(radio('B')).toBeChecked();
  });

  it('stays disabled when the render element overrides the attribute', () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup.Root aria-label="g" disabled defaultValue="a" onValueChange={onValueChange}>
        <RadioGroup.Item value="a" aria-label="A" />
        <RadioGroup.Item value="b" aria-label="B" render={<input disabled={false} />} />
      </RadioGroup.Root>,
    );
    // The render element wins the markup; the group's state still decides behaviour.
    expect(radio('B')).not.toBeDisabled();
    fireEvent.click(radio('B'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(radio('B')).not.toBeChecked();
    expect(radio('A')).toBeChecked();
    expect(radio('B')).toHaveAttribute('data-disabled');
  });
});

describe('RadioGroup — composition', () => {
  it('renders the element given to `render` for the group — a fieldset, say', () => {
    render(
      <RadioGroup.Root render={<fieldset />} aria-label="g" data-testid="g">
        <RadioGroup.Item value="a" aria-label="A" />
      </RadioGroup.Root>,
    );
    expect(screen.getByTestId('g').tagName).toBe('FIELDSET');
    expect(screen.getByTestId('g')).toHaveAttribute('role', 'radiogroup');
  });

  it('takes the group’s name from a legend when rendered as a fieldset', () => {
    render(
      <RadioGroup.Root render={<fieldset />}>
        <legend>Delivery</legend>
        <RadioGroup.Item value="a" aria-label="A" />
      </RadioGroup.Root>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Delivery' })).toBeInTheDocument();
  });

  it('spreads unrecognised props and merges className on both parts', () => {
    render(
      <RadioGroup.Root className="group" data-testid="g" aria-describedby="hint">
        <RadioGroup.Item value="a" className="radio" id="a" aria-label="A" />
      </RadioGroup.Root>,
    );
    expect(screen.getByTestId('g')).toHaveClass('group');
    expect(screen.getByTestId('g')).toHaveAttribute('aria-describedby', 'hint');
    expect(radio('A')).toHaveClass('radio');
    expect(radio('A')).toHaveAttribute('id', 'a');
  });

  it('calls the consumer’s onChange as well as its own', () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <RadioGroup.Root aria-label="g" onValueChange={onValueChange}>
        <RadioGroup.Item value="a" aria-label="A" onChange={onChange} />
      </RadioGroup.Root>,
    );
    fireEvent.click(radio('A'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('a');
  });

  it('forwards refs to both elements', () => {
    const group = { current: null as HTMLElement | null };
    const item = { current: null as HTMLElement | null };
    render(
      <RadioGroup.Root ref={group} aria-label="g">
        <RadioGroup.Item ref={item} value="a" aria-label="A" />
      </RadioGroup.Root>,
    );
    expect(group.current).toBe(screen.getByRole('radiogroup'));
    expect(item.current).toBe(radio('A'));
  });

  it('tells you when Item is used outside Root', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<RadioGroup.Item value="a" aria-label="A" />)).toThrow(
      '<RadioGroup.Item> must be rendered inside <RadioGroup.Root>.',
    );
    error.mockRestore();
  });
});
