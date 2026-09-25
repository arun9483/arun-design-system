import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RadioGroup } from './index';

describe('RadioGroup (styled)', () => {
  it('applies the design-system classes to both parts', () => {
    render(
      <RadioGroup.Root aria-label="g" data-testid="g">
        <RadioGroup.Item value="a" aria-label="A" />
      </RadioGroup.Root>,
    );
    expect(screen.getByTestId('g')).toHaveClass('radio-group');
    expect(screen.getByRole('radio')).toHaveClass('radio');
  });

  it('merges an additional className rather than replacing ours', () => {
    render(
      <RadioGroup.Root aria-label="g" className="row" data-testid="g">
        <RadioGroup.Item value="a" aria-label="A" className="shrink-0" />
      </RadioGroup.Root>,
    );
    expect(screen.getByTestId('g')).toHaveClass('radio-group', 'row');
    expect(screen.getByRole('radio')).toHaveClass('radio', 'shrink-0');
  });

  it('keeps the native input it wraps — the dot is CSS, not an element', () => {
    render(
      <RadioGroup.Root aria-label="g">
        <RadioGroup.Item value="a" aria-label="A" />
      </RadioGroup.Root>,
    );
    const radio = screen.getByRole('radio');
    expect(radio.tagName).toBe('INPUT');
    expect(radio).toHaveAttribute('type', 'radio');
    expect(radio.childElementCount).toBe(0);
  });

  it('keeps the behaviour it wraps — state reaches the DOM for CSS to read', () => {
    render(
      <RadioGroup.Root aria-label="g" defaultValue="a">
        <RadioGroup.Item value="a" aria-label="A" />
        <RadioGroup.Item value="b" aria-label="B" />
      </RadioGroup.Root>,
    );
    const b = screen.getByRole('radio', { name: 'B' });
    expect(b).toHaveAttribute('data-unchecked');
    fireEvent.click(b);
    expect(b).toHaveAttribute('data-checked');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('data-unchecked');
  });
});
