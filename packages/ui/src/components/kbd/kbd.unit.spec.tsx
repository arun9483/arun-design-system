import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Kbd } from './kbd';

describe('Kbd', () => {
  it('is a styled <kbd>', () => {
    render(<Kbd>Esc</Kbd>);
    const key = screen.getByText('Esc');
    expect(key.tagName).toBe('KBD');
    expect(key).toHaveClass('kbd');
  });
});
