import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Slider } from './slider';

describe('Slider', () => {
  it('is a native range input, with its value in the form', () => {
    render(
      <form data-testid="form">
        <label htmlFor="volume">Volume</label>
        <Slider id="volume" name="volume" min={0} max={10} defaultValue={4} />
      </form>,
    );
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveClass('slider');
    const data = new FormData(screen.getByTestId('form') as HTMLFormElement);
    expect(data.get('volume')).toBe('4');
  });
});
