import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from './index';
import type { CheckboxRootProps } from './index';

/** Runs in a real browser: real focus, Tab order, keys and form submission. */

function Terms({
  onSubmit,
  ...props
}: CheckboxRootProps & { onSubmit?: (entries: [string, FormDataEntryValue][]) => void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.([...new FormData(event.currentTarget).entries()]);
      }}
    >
      <button type="button">Before</button>
      <Checkbox.Root id="terms" name="terms" {...props}>
        <Checkbox.Indicator />
      </Checkbox.Root>
      <label htmlFor="terms">Accept the terms</label>
      <button type="submit">Send</button>
    </form>
  );
}

const checkbox = () => screen.getByRole('checkbox', { name: 'Accept the terms' });
const button = (name: string) => screen.getByRole('button', { name });
const focused = () => document.activeElement;

describe('Checkbox (browser)', () => {
  it('is one Tab stop; the form control beside it is not', async () => {
    render(<Terms />);
    button('Before').focus();
    await userEvent.tab();
    expect(focused()).toBe(checkbox());
    await userEvent.tab();
    expect(focused()).toBe(button('Send'));
  });

  it('is left out of the Tab order when disabled', async () => {
    render(<Terms disabled />);
    button('Before').focus();
    await userEvent.tab();
    expect(focused()).toBe(button('Send'));
  });

  it('toggles with Space and Enter, as a native button does, without submitting', async () => {
    const onSubmit = vi.fn();
    render(<Terms onSubmit={onSubmit} />);
    checkbox().focus();
    await userEvent.keyboard(' ');
    expect(checkbox()).toBeChecked();
    await userEvent.keyboard('{Enter}');
    expect(checkbox()).not.toBeChecked();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('toggles from a press on its label', async () => {
    render(<Terms />);
    await userEvent.click(screen.getByText('Accept the terms'));
    expect(checkbox()).toBeChecked();
  });

  it('resolves indeterminate to checked on a press', async () => {
    render(<Terms defaultChecked="indeterminate" />);
    expect(checkbox()).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(checkbox());
    expect(checkbox()).toBeChecked();
  });

  it('submits its value with the form only when checked', async () => {
    const onSubmit = vi.fn();
    render(<Terms value="yes" onSubmit={onSubmit} />);
    await userEvent.click(button('Send'));
    expect(onSubmit).toHaveBeenLastCalledWith([]);
    await userEvent.click(checkbox());
    await userEvent.click(button('Send'));
    expect(onSubmit).toHaveBeenLastCalledWith([['terms', 'yes']]);
  });
});
