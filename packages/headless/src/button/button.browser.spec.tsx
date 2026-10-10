import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { Button } from './index';

/** Runs in a real browser: a press and Enter in a field submit the form natively. */

/** A form whose save takes until `finish` is called, as an API call would. */
function Profile({ onSave }: { onSave: (finish: () => void) => void }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        onSave(() => setPending(false));
      }}
    >
      <input aria-label="Name" />
      <Button type="submit" pending={pending}>
        Save
      </Button>
    </form>
  );
}

const save = () => screen.getByRole('button', { name: 'Save' });

describe('Button (browser)', () => {
  it('saves once while pending, from a press or from Enter in a field', async () => {
    let finish = () => {};
    const onSave = vi.fn((done: () => void) => (finish = done));
    render(<Profile onSave={onSave} />);
    await userEvent.click(save());
    expect(save()).toBeDisabled();
    await userEvent.click(save(), { force: true });
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSave).toHaveBeenCalledOnce();
    finish();
    await expect.poll(() => save().hasAttribute('data-pending')).toBe(false);
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSave).toHaveBeenCalledTimes(2);
  });
});
