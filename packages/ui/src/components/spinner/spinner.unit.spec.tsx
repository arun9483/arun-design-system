import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('is an indeterminate <progress>, named Loading by default', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('progressbar', { name: 'Loading' });
    expect(spinner.tagName).toBe('PROGRESS');
    expect(spinner).not.toHaveAttribute('value');
    expect(spinner).toHaveClass('spinner');
  });

  it('takes a name of your own', () => {
    render(<Spinner aria-label="Saving draft" />);
    expect(screen.getByRole('progressbar', { name: 'Saving draft' })).toBeInTheDocument();
  });
});
