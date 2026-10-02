import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Progress } from './progress';

describe('Progress', () => {
  it('is a native <progress> with its value', () => {
    render(<Progress aria-label="Upload" value={30} max={100} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar.tagName).toBe('PROGRESS');
    expect(bar).toHaveClass('progress');
    expect((bar as HTMLProgressElement).value).toBe(30);
  });

  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Loading" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('value');
  });
});
