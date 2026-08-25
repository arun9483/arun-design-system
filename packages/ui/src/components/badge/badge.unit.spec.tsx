import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Beginner</Badge>);
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('applies chip and badge class by default', () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText('Default');
    expect(el).toHaveClass('chip', 'badge');
  });

  it('renders the element given to `render`', () => {
    render(
      <ul>
        <Badge render={<li />}>Beginner</Badge>
      </ul>,
    );
    const el = screen.getByText('Beginner');
    expect(el.tagName).toBe('LI');
    expect(el).toHaveClass('chip', 'badge');
  });

  it('spreads unrecognised props onto the element', () => {
    render(
      <Badge id="level" data-testid="badge">
        Beginner
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('id', 'level');
  });

  it('applies no tone class for the default neutral tone', () => {
    render(<Badge>Neutral</Badge>);
    const el = screen.getByText('Neutral');
    expect(el).toHaveClass('chip', 'badge');
    expect(el.className).not.toMatch(/badge-/);
  });

  it.each(['success', 'warning', 'error', 'info'] as const)('applies the %s tone class', (tone) => {
    render(<Badge tone={tone}>Label</Badge>);
    expect(screen.getByText('Label')).toHaveClass('chip', 'badge', `badge-${tone}`);
  });
});
