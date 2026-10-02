import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Field } from './index';
import { Select } from '../select';

describe('Field (ui)', () => {
  it('wraps an Input by default, tied to its label, description and error', () => {
    render(
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" placeholder="you@example.com" />
        <Field.Description>Work email only.</Field.Description>
        <Field.Error>Enter a valid email.</Field.Error>
      </Field.Root>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveClass('input-control');
    expect(input.parentElement).toHaveClass('input');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Work email only. Enter a valid email.');
    expect(screen.getByText('Email')).toHaveClass('field-label');
    expect(screen.getByText('Work email only.')).toHaveClass('field-description');
    expect(screen.getByText('Enter a valid email.')).toHaveClass('field-error');
    expect(input.closest('.field')).not.toBeNull();
  });

  it('takes another control through render', () => {
    render(
      <Field.Root required>
        <Field.Label>Size</Field.Label>
        <Field.Control
          render={
            <Select>
              <option value="">Pick one</option>
              <option value="s">Small</option>
            </Select>
          }
        />
      </Field.Root>,
    );
    expect(screen.getByRole('combobox', { name: 'Size' })).toBeRequired();
  });
});
