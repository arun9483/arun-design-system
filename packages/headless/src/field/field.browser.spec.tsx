import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { Field } from './index';
import { Checkbox } from '../checkbox';

/** Runs in a real browser: real label presses and the browser's own validation. */

/** Invalid from what the browser reports, as a consumer without a form library would set it. */
function Signup({ onSubmit }: { onSubmit: () => void }) {
  const [invalid, setInvalid] = useState(false);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Field.Root invalid={invalid} required>
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="email"
          onInvalid={() => setInvalid(true)}
          onInput={(event) => setInvalid(!event.currentTarget.validity.valid)}
        />
        <Field.Error>Enter a valid email.</Field.Error>
      </Field.Root>
      <button type="submit">Send</button>
    </form>
  );
}

const control = () => screen.getByRole('textbox', { name: 'Email' });

describe('Field (browser)', () => {
  it('focuses the control from a press on its Label', async () => {
    render(
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" />
      </Field.Root>,
    );
    await userEvent.click(screen.getByText('Email'));
    expect(document.activeElement).toBe(control());
  });

  it('checks a Checkbox control from a press on its Label', async () => {
    render(
      <Field.Root>
        <Field.Label>Subscribe</Field.Label>
        <Field.Control render={<Checkbox.Root />} />
      </Field.Root>,
    );
    await userEvent.click(screen.getByText('Subscribe'));
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeChecked();
  });

  it('shows the Error the browser reported, on the control it focused, until it is valid', async () => {
    const onSubmit = vi.fn();
    render(<Signup onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(control());
    expect(control()).toHaveAttribute('aria-invalid', 'true');
    expect(control()).toHaveAccessibleDescription('Enter a valid email.');
    await userEvent.type(control(), 'ada@example.com');
    expect(control()).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Enter a valid email.')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
