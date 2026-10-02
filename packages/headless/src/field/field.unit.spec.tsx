import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { Field } from './index';

function Email({
  invalid = false,
  description = true,
}: {
  invalid?: boolean;
  description?: boolean;
}) {
  return (
    <Field.Root invalid={invalid} required data-testid="root">
      <Field.Label>Email</Field.Label>
      <Field.Control type="email" />
      {description && <Field.Description>We never share it.</Field.Description>}
      <Field.Error>Enter a valid email.</Field.Error>
    </Field.Root>
  );
}

const control = () => screen.getByRole('textbox', { name: 'Email' });

describe('Field', () => {
  it('names the control with its Label, and describes it with the Description', () => {
    render(<Email />);
    expect(control()).toHaveAccessibleName('Email');
    expect(control()).toHaveAccessibleDescription('We never share it.');
    expect(control()).toBeRequired();
    expect(control()).not.toHaveAttribute('aria-invalid');
  });

  it('shows the Error only while invalid, and adds it to the description', () => {
    const { rerender } = render(<Email />);
    expect(screen.queryByText('Enter a valid email.')).toBeNull();
    rerender(<Email invalid />);
    expect(control()).toHaveAttribute('aria-invalid', 'true');
    expect(control()).toHaveAccessibleDescription('We never share it. Enter a valid email.');
    expect(screen.getByTestId('root')).toHaveAttribute('data-invalid');
  });

  it('names only what is rendered in aria-describedby', () => {
    render(<Email description={false} />);
    expect(control()).not.toHaveAttribute('aria-describedby');
  });

  it('keeps a describedby of your own, after its own', () => {
    render(
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Field.Control aria-describedby="hint" />
        <Field.Description>As on your passport.</Field.Description>
        <span id="hint">Latin letters only.</span>
      </Field.Root>,
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription(
      'As on your passport. Latin letters only.',
    );
  });

  it('puts its state on any control through render', () => {
    function Toggle(props: React.ComponentProps<'button'>) {
      return <button type="button" role="switch" aria-checked="false" {...props} />;
    }
    render(
      <Field.Root disabled invalid>
        <Field.Label>Alerts</Field.Label>
        <Field.Control render={<Toggle />} />
        <Field.Error>Required.</Field.Error>
      </Field.Root>,
    );
    const toggle = screen.getByRole('switch', { name: 'Alerts' });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-invalid', 'true');
    expect(toggle).toHaveAccessibleDescription('Required.');
  });

  it('follows invalid as it changes', () => {
    function Live() {
      const [value, setValue] = useState('');
      return (
        <Field.Root invalid={value.length > 3}>
          <Field.Label>Code</Field.Label>
          <Field.Control value={value} onChange={(e) => setValue(e.target.value)} />
          <Field.Error>Too long.</Field.Error>
        </Field.Root>
      );
    }
    render(<Live />);
    const input = screen.getByRole('textbox', { name: 'Code' });
    expect(input).not.toHaveAccessibleDescription();
    input.focus();
    // Typing through the DOM: four characters make it invalid.
    for (const ch of 'abcd') {
      const next = (input as HTMLInputElement).value + ch;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, next);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    expect(input).toHaveAccessibleDescription('Too long.');
  });

  it('throws outside a Root', () => {
    expect(() => render(<Field.Label>Lost</Field.Label>)).toThrow(/inside <Field.Root>/);
  });
});
