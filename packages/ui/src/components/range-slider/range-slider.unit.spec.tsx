import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RangeSlider } from './index';

function Price(props: { onValueChange?: (value: readonly [number, number]) => void }) {
  return (
    <RangeSlider.Root
      aria-label="Price"
      className="mt-2"
      max={1000}
      defaultValue={[200, 800]}
      {...props}
    >
      <RangeSlider.StartInput />
      <RangeSlider.EndInput />
    </RangeSlider.Root>
  );
}

describe('RangeSlider (styled)', () => {
  it('applies the design-system classes, merging a className of your own', () => {
    render(<Price />);
    expect(screen.getByRole('group', { name: 'Price' })).toHaveClass('range-slider', 'mt-2');
    for (const input of screen.getAllByRole('slider')) {
      expect(input).toHaveClass('range-slider-input');
    }
  });

  it('keeps the behaviour it wraps', () => {
    const onValueChange = vi.fn();
    render(<Price onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Minimum' }), {
      target: { value: '900' },
    });
    expect(onValueChange).toHaveBeenLastCalledWith([800, 800]);
    // Met past the middle: only the start can move, so it is on top.
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveAttribute('data-raised');
  });
});
