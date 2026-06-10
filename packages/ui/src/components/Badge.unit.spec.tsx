import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

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

  it('applies difficulty-beginner class', () => {
    render(<Badge variant="difficulty-beginner">Beginner</Badge>);
    expect(screen.getByText('Beginner')).toHaveClass('difficulty-beginner');
  });

  it('applies difficulty-advanced class', () => {
    render(<Badge variant="difficulty-advanced">Advanced</Badge>);
    expect(screen.getByText('Advanced')).toHaveClass('difficulty-advanced');
  });
});
