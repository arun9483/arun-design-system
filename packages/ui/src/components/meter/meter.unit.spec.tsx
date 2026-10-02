import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Meter } from './meter';

describe('Meter', () => {
  it('is a native <meter> with its range', () => {
    render(<Meter aria-label="Disk" value={0.8} low={0.5} high={0.75} optimum={0.2} />);
    const meter = screen.getByRole('meter', { name: 'Disk' });
    expect(meter.tagName).toBe('METER');
    expect(meter).toHaveClass('meter');
    expect(meter).toHaveAttribute('high', '0.75');
  });
});
