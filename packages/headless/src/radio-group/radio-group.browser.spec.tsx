import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { RadioGroup } from './index';
import type { RadioGroupRootProps } from './index';

/** Runs in a real browser: the platform's own radio keys, Tab order and validation. */

function Plan({
  onSubmit,
  disabledItem,
  ...props
}: RadioGroupRootProps & {
  onSubmit?: (entries: [string, FormDataEntryValue][]) => void;
  disabledItem?: string;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.([...new FormData(event.currentTarget).entries()]);
      }}
    >
      <button type="button">Before</button>
      <span id="caption">Plan</span>
      <RadioGroup.Root aria-labelledby="caption" name="plan" {...props}>
        {['free', 'pro', 'team'].map((value) => (
          <label key={value} htmlFor={value}>
            <RadioGroup.Item id={value} value={value} disabled={value === disabledItem} />
            {value}
          </label>
        ))}
      </RadioGroup.Root>
      <button type="submit">Send</button>
    </form>
  );
}

const radio = (name: string) => screen.getByRole<HTMLInputElement>('radio', { name });
const button = (name: string) => screen.getByRole('button', { name });
const focused = () => document.activeElement;

describe('RadioGroup (browser)', () => {
  it('is one Tab stop, entering at the selected radio', async () => {
    render(<Plan defaultValue="pro" />);
    button('Before').focus();
    await userEvent.tab();
    expect(focused()).toBe(radio('pro'));
    await userEvent.tab();
    expect(focused()).toBe(button('Send'));
  });

  // Whether the ends wrap is the engine's: Chromium and Firefox wrap, WebKit does not.
  it('moves and selects with the arrow keys, and reports each change', async () => {
    const onValueChange = vi.fn();
    render(<Plan defaultValue="free" onValueChange={onValueChange} />);
    radio('free').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(radio('pro'));
    expect(radio('pro')).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(radio('team'));
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe(radio('pro'));
    expect(radio('pro')).toBeChecked();
    expect(onValueChange.mock.calls).toEqual([['pro'], ['team'], ['pro']]);
  });

  it('skips a disabled radio with the arrow keys', async () => {
    render(<Plan defaultValue="free" disabledItem="pro" />);
    radio('free').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe(radio('team'));
    expect(radio('team')).toBeChecked();
  });

  it('selects from a press on a label', async () => {
    const onValueChange = vi.fn();
    render(<Plan onValueChange={onValueChange} />);
    await userEvent.click(screen.getByText('team'));
    expect(radio('team')).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('team');
  });

  it('refuses to submit while required and empty, focusing the group', async () => {
    const onSubmit = vi.fn();
    render(<Plan required onSubmit={onSubmit} />);
    await userEvent.click(button('Send'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(focused()).toBe(radio('free'));
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.click(button('Send'));
    expect(onSubmit).toHaveBeenLastCalledWith([['plan', 'pro']]);
  });
});
