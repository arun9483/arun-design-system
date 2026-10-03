import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { OtpInput } from './index';
import { Field } from '../field';

describe('OtpInput (ui)', () => {
  it('draws one box per character over a single input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<OtpInput aria-label="Code" length={4} defaultValue="12" className="mine" ref={ref} />);
    const input = screen.getByRole('textbox', { name: 'Code' });
    expect(ref.current).toBe(input);
    expect(input).toHaveClass('otp-input-control');
    const root = input.parentElement;
    expect(root).toHaveClass('otp-input', 'mine');
    const slots = root?.querySelectorAll('.otp-input-slot') ?? [];
    expect(slots).toHaveLength(4);
    expect([...slots].map((slot) => slot.textContent)).toEqual(['1', '2', '', '']);
  });

  it('defaults to six boxes', () => {
    render(<OtpInput aria-label="Code" />);
    expect(document.querySelectorAll('.otp-input-slot')).toHaveLength(6);
  });

  it('takes a Field: label, description, invalid and disabled reach the right places', () => {
    render(
      <Field.Root invalid disabled>
        <Field.Label>Verification code</Field.Label>
        <Field.Control render={<OtpInput />} />
        <Field.Description>Sent to your phone.</Field.Description>
        <Field.Error>That code has expired.</Field.Error>
      </Field.Root>,
    );
    const input = screen.getByRole('textbox', { name: 'Verification code' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Sent to your phone. That code has expired.');
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveAttribute('data-disabled');
  });
});
