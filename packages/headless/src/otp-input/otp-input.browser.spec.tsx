import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { OtpInput } from './index';
import type { OtpInputRootProps } from './index';

/** Runs in Chromium: real typing, caret, clipboard and forms. */

// The input drawn over the slots, transparent, as a styling layer would.
const css = `
  .otp { position: relative; display: inline-flex; gap: 8px; }
  .otp input { position: absolute; inset: 0; color: transparent; background: transparent; border: 0; }
  .otp div { inline-size: 32px; block-size: 40px; }
`;

function Code({ inputProps, ...props }: OtpInputRootProps & { inputProps?: object }) {
  const length = props.length ?? 6;
  return (
    <>
      <style>{css}</style>
      <OtpInput.Root className="otp" {...props}>
        <OtpInput.Input aria-label="Code" {...inputProps} />
        {Array.from({ length }, (_, i) => (
          <OtpInput.Slot key={i} index={i} data-testid={`slot-${i}`} />
        ))}
      </OtpInput.Root>
    </>
  );
}

const input = () => screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' });
const slot = (i: number) => screen.getByTestId(`slot-${i}`);
const isActive = (i: number) => slot(i).hasAttribute('data-active');
const slotText = () => Array.from({ length: 6 }, (_, i) => slot(i).textContent).join('');

async function paste(text: string) {
  const data = new DataTransfer();
  data.setData('text/plain', text);
  input().dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true }));
  await Promise.resolve();
}

describe('OtpInput (browser)', () => {
  it('is one text input with the attributes autofill and the keypad need', () => {
    render(<Code />);
    const el = input();
    expect(el).toHaveAttribute('autocomplete', 'one-time-code');
    expect(el).toHaveAttribute('inputmode', 'numeric');
    expect(el).toHaveAttribute('maxlength', '6');
    expect(el).toHaveAttribute('pattern', '\\d{6}');
    expect(slot(0)).toHaveAttribute('aria-hidden', 'true');
  });

  it('fills a slot per digit and refuses anything else', async () => {
    const onValueChange = vi.fn();
    render(<Code onValueChange={onValueChange} />);
    await userEvent.click(input());
    await userEvent.keyboard('12a3');
    expect(input()).toHaveValue('123');
    expect(slotText()).toBe('123');
    expect(slot(2)).toHaveAttribute('data-filled');
    expect(slot(3)).not.toHaveAttribute('data-filled');
    expect(onValueChange).toHaveBeenLastCalledWith('123');
    expect(onValueChange).toHaveBeenCalledTimes(3);
  });

  it('marks the slot the caret is on, only while focused', async () => {
    render(<Code defaultValue="12" />);
    await expect.poll(() => isActive(2)).toBe(false);
    // Focus puts the caret at the end of the code, not over the whole of it.
    await userEvent.tab();
    await expect.poll(() => isActive(2)).toBe(true);
    await userEvent.tab();
    await expect.poll(() => isActive(2)).toBe(false);
  });

  it('keeps the caret on one character, so typing replaces it and moves on', async () => {
    render(<Code defaultValue="123456" />);
    input().focus();
    // A full code: the caret covers the last slot, and typing replaces it.
    await expect.poll(() => isActive(5)).toBe(true);
    await userEvent.keyboard('9');
    expect(input()).toHaveValue('123459');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect.poll(() => isActive(3)).toBe(true);
    await userEvent.keyboard('0');
    expect(input()).toHaveValue('123059');
    await expect.poll(() => isActive(4)).toBe(true);
    await userEvent.keyboard('x');
    expect(input()).toHaveValue('123059');
  });

  it('deletes from the end with Backspace', async () => {
    render(<Code defaultValue="1234" />);
    await userEvent.click(input());
    await userEvent.keyboard('{Backspace}{Backspace}');
    expect(input()).toHaveValue('12');
    await expect.poll(() => isActive(2)).toBe(true);
  });

  it('moves the caret to the slot pressed, or the end of the code', async () => {
    render(<Code defaultValue="1234" />);
    const box = input().getBoundingClientRect();
    const at = (i: number) => {
      const r = slot(i).getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: box.height / 2 };
    };
    await userEvent.click(input(), { position: at(1) });
    await expect.poll(() => isActive(1)).toBe(true);
    await userEvent.click(input(), { position: at(5) });
    await expect.poll(() => isActive(4)).toBe(true);
  });

  it('cleans a pasted code, and a whole code replaces the old one', async () => {
    render(<Code defaultValue="999999" />);
    await userEvent.click(input());
    await paste('Code: 123 456');
    expect(input()).toHaveValue('123456');
    expect(slotText()).toBe('123456');
  });

  it('puts a pasted fragment in at the caret', async () => {
    render(<Code defaultValue="12" />);
    await userEvent.click(input());
    await paste('3-4');
    expect(input()).toHaveValue('1234');
  });

  it('keeps letters too with validationType="alphanumeric"', async () => {
    render(<Code validationType="alphanumeric" />);
    expect(input()).toHaveAttribute('inputmode', 'text');
    await userEvent.click(input());
    await userEvent.keyboard('a1-B');
    expect(input()).toHaveValue('a1B');
  });

  it('follows a controlled value, and a parent can refuse a change', async () => {
    function Controlled() {
      const [code, setCode] = useState('1');
      return <Code value={code} onValueChange={(next) => setCode(next.slice(0, 3))} />;
    }
    render(<Controlled />);
    await userEvent.click(input());
    await userEvent.keyboard('2345');
    expect(input()).toHaveValue('123');
    expect(slotText()).toBe('123');
  });

  it('submits with its form, reports a short code invalid, and resets', async () => {
    render(
      <form aria-label="Verify">
        <Code defaultValue="12" inputProps={{ name: 'code', required: true }} />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form');
    expect(form.checkValidity()).toBe(false);
    await userEvent.click(input());
    await userEvent.keyboard('3456');
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get('code')).toBe('123456');
    expect(form).toHaveAttribute('aria-label', 'Verify');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input()).toHaveValue('12');
    expect(slotText()).toBe('12');
  });

  it('is disabled as a whole', () => {
    render(<Code disabled />);
    expect(input()).toBeDisabled();
    expect(slot(0)).toHaveAttribute('data-disabled');
    expect(input().closest('.otp')).toHaveAttribute('data-disabled');
  });

  it('marks the Root complete once every slot is filled', async () => {
    render(<Code length={4} />);
    const root = input().closest('.otp');
    await userEvent.click(input());
    await userEvent.keyboard('123');
    expect(root).not.toHaveAttribute('data-complete');
    await userEvent.keyboard('4');
    expect(root).toHaveAttribute('data-complete');
  });
});
