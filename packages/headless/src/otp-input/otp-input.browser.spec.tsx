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

/**
 * Presses slot `i`, as a user would: the press lands on the input drawn over it. The caret
 * lands on `active`, which is `i` unless the code ends before it.
 */
async function pressSlot(i: number, active = i) {
  const box = input().getBoundingClientRect();
  const r = slot(i).getBoundingClientRect();
  await userEvent.click(input(), {
    position: { x: r.left - box.left + r.width / 2, y: box.height / 2 },
  });
  await expect.poll(() => isActive(active)).toBe(true);
}

/** A phone keyboard's deletion: announced by `beforeinput`, with no Backspace keydown. */
function phoneDelete(inputType: 'deleteContentBackward' | 'deleteContentForward') {
  const event = new InputEvent('beforeinput', { inputType, bubbles: true, cancelable: true });
  input().dispatchEvent(event);
  return event.defaultPrevented;
}

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
    // Focus puts the caret after the last digit, the usual place to delete from.
    input().focus();
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

describe('OtpInput deletion: boxes are emptied in place (browser)', () => {
  const root = () => input().closest('.otp');
  const valid = () => input().checkValidity();

  it('Delete on a middle box empties only that box; the next digit fills it', async () => {
    const onValueChange = vi.fn();
    render(<Code defaultValue="123456" onValueChange={onValueChange} />);
    await pressSlot(3);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue('123 56');
    expect(slotText()).toBe('12356');
    expect(slot(3)).not.toHaveAttribute('data-filled');
    expect(slot(4)).toHaveTextContent('5');
    expect(onValueChange).toHaveBeenLastCalledWith('123 56');
    await expect.poll(() => isActive(3)).toBe(true);
    expect(root()).not.toHaveAttribute('data-complete');
    expect(valid()).toBe(false);
    await userEvent.keyboard('8');
    expect(input()).toHaveValue('123856');
    expect(root()).toHaveAttribute('data-complete');
    expect(valid()).toBe(true);
    await expect.poll(() => isActive(4)).toBe(true);
  });

  it('Backspace on a filled middle box empties it in place too, and stays', async () => {
    render(<Code defaultValue="123456" />);
    await pressSlot(2);
    await userEvent.keyboard('{Backspace}');
    expect(input()).toHaveValue('12 456');
    await expect.poll(() => isActive(2)).toBe(true);
  });

  it('Delete on the first box leaves it empty, and the rest in place', async () => {
    render(<Code defaultValue="123456" />);
    await pressSlot(0);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue(' 23456');
    expect(slot(0)).toHaveTextContent('');
    await expect.poll(() => isActive(0)).toBe(true);
    await userEvent.keyboard('9');
    expect(input()).toHaveValue('923456');
  });

  it('Delete on the last box shortens the code, with no gap at the end', async () => {
    const onValueChange = vi.fn();
    render(<Code defaultValue="123456" onValueChange={onValueChange} />);
    await pressSlot(5);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue('12345');
    expect(onValueChange).toHaveBeenLastCalledWith('12345');
    await expect.poll(() => isActive(5)).toBe(true);
  });

  it('Backspace on an empty box moves back and empties the box before it', async () => {
    render(<Code defaultValue="123 56" />);
    await pressSlot(3);
    await userEvent.keyboard('{Backspace}');
    expect(input()).toHaveValue('12  56');
    await expect.poll(() => isActive(2)).toBe(true);
  });

  it('Delete on an empty box does nothing', async () => {
    const onValueChange = vi.fn();
    render(<Code defaultValue="123 56" onValueChange={onValueChange} />);
    await pressSlot(3);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue('123 56');
    expect(onValueChange).not.toHaveBeenCalled();
    await expect.poll(() => isActive(3)).toBe(true);
  });

  it('Backspace on an empty first box does nothing', async () => {
    const onValueChange = vi.fn();
    render(<Code defaultValue=" 23456" onValueChange={onValueChange} />);
    await pressSlot(0);
    await userEvent.keyboard('{Backspace}');
    expect(input()).toHaveValue(' 23456');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('drops gaps left at the end, so emptied trailing boxes are just a shorter code', async () => {
    render(<Code defaultValue="123 56" />);
    await pressSlot(5);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue('123 5');
    await pressSlot(4);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue('123');
    await expect.poll(() => isActive(3)).toBe(true);
  });

  it('Backspace after the last character still deletes backwards, as before', async () => {
    render(<Code defaultValue="1 3" />);
    await pressSlot(4, 3);
    await userEvent.keyboard('{Backspace}');
    expect(input()).toHaveValue('1');
    await expect.poll(() => isActive(1)).toBe(true);
  });

  it('empties every box of a selection, not shifting what follows', async () => {
    render(<Code defaultValue="123456" />);
    await pressSlot(1);
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(input().selectionEnd).toBe(3);
    await userEvent.keyboard('{Delete}');
    expect(input()).toHaveValue('1  456');
  });

  it('clears the whole code once select-all selects it', async () => {
    render(<Code defaultValue="123456" />);
    input().focus();
    await userEvent.keyboard('{ControlOrMeta>}a{/ControlOrMeta}');
    await expect.poll(() => [0, 1, 2, 3, 4, 5].every(isActive)).toBe(true);
    await userEvent.keyboard('{Backspace}');
    expect(input()).toHaveValue('');
  });

  it('puts focus on the first empty box when the code has a gap', async () => {
    render(<Code defaultValue="12 456" />);
    input().focus();
    await expect.poll(() => isActive(2)).toBe(true);
  });

  it('pastes a fragment over the boxes from the caret, filling a gap without shifting', async () => {
    render(<Code defaultValue="1 3456" />);
    await pressSlot(1);
    await paste('2');
    expect(input()).toHaveValue('123456');
    await pressSlot(1);
    await paste('7-8');
    expect(input()).toHaveValue('178456');
  });

  it('empties in place on a phone keyboard, which sends no Backspace key', async () => {
    render(<Code defaultValue="123456" />);
    await pressSlot(3);
    expect(phoneDelete('deleteContentBackward')).toBe(true);
    await expect.poll(() => input().value).toBe('123 56');
    await expect.poll(() => isActive(3)).toBe(true);
    await pressSlot(1);
    expect(phoneDelete('deleteContentForward')).toBe(true);
    await expect.poll(() => input().value).toBe('1 3 56');
  });

  it('submits nothing invalid: a code with a gap fails the form until it is filled', async () => {
    render(
      <form aria-label="Verify">
        <Code defaultValue="123456" inputProps={{ name: 'code', required: true }} />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form');
    await pressSlot(2);
    await userEvent.keyboard('{Delete}');
    expect(form.checkValidity()).toBe(false);
    expect(input().validity.patternMismatch).toBe(true);
    await userEvent.keyboard('3');
    expect(form.checkValidity()).toBe(true);
  });

  it('keeps a gap from a controlled value', async () => {
    function Controlled() {
      const [code, setCode] = useState('123456');
      return (
        <>
          <Code value={code} onValueChange={setCode} />
          <output>{JSON.stringify(code)}</output>
        </>
      );
    }
    render(<Controlled />);
    await pressSlot(4);
    await userEvent.keyboard('{Delete}');
    expect(screen.getByRole('status')).toHaveTextContent('"1234 6"');
    expect(input()).toHaveValue('1234 6');
  });
});

describe('OtpInput onComplete (browser)', () => {
  it('fires once the last box is filled, not before', async () => {
    const onComplete = vi.fn();
    render(<Code onComplete={onComplete} />);
    input().focus();
    await userEvent.keyboard('12345');
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.keyboard('6');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('fires for a whole pasted code', async () => {
    const onComplete = vi.fn();
    render(<Code onComplete={onComplete} />);
    input().focus();
    await paste('123 456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('does not fire while a box is emptied in place, and fires when it is filled', async () => {
    const onComplete = vi.fn();
    render(<Code defaultValue="123456" onComplete={onComplete} />);
    await pressSlot(3);
    await userEvent.keyboard('{Delete}');
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.keyboard('8');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith('123856');
  });

  it('fires again when a digit of a complete code is typed over', async () => {
    const onComplete = vi.fn();
    render(<Code defaultValue="123456" onComplete={onComplete} />);
    await pressSlot(0);
    await userEvent.keyboard('9');
    expect(onComplete).toHaveBeenCalledWith('923456');
  });

  it('does not fire on re-render or on a change that leaves the code short', async () => {
    const onComplete = vi.fn();
    const { rerender } = render(<Code defaultValue="123456" onComplete={onComplete} />);
    rerender(<Code defaultValue="123456" onComplete={onComplete} />);
    input().focus();
    await userEvent.keyboard('{Backspace}');
    expect(input()).toHaveValue('12345');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('respects a shorter length', async () => {
    const onComplete = vi.fn();
    render(<Code length={4} onComplete={onComplete} />);
    input().focus();
    await userEvent.keyboard('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });
});
