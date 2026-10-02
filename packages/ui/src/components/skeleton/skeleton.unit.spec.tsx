import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive technology, and sized by you', () => {
    render(<Skeleton data-testid="skeleton" style={{ inlineSize: '8rem' }} />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('skeleton');
    expect(skeleton.getAttribute('style')).toContain('inline-size: 8rem');
  });
});
