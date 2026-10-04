import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Text } from './text';

describe('Text', () => {
  it('is a bare <span> by default, taking everything from around it', () => {
    render(<Text>plain</Text>);
    const text = screen.getByText('plain');
    expect(text.tagName).toBe('SPAN');
    expect(text).not.toHaveAttribute('class');
  });

  it('maps size, colour and weight onto the utility classes', () => {
    render(
      <Text size="xs" color="muted" weight="semibold" className="mine">
        meta
      </Text>,
    );
    expect(screen.getByText('meta').className).toBe(
      'text-size-xs text-color-muted font-weight-semibold mine',
    );
  });

  it('renders another element through render', () => {
    render(
      <Text render={<strong />} color="accent">
        Important
      </Text>,
    );
    const text = screen.getByText('Important');
    expect(text.tagName).toBe('STRONG');
    expect(text).toHaveClass('text-color-accent');
  });
});
