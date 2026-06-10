import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>content</Card>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('applies card class', () => {
    render(<Card>content</Card>);
    expect(screen.getByText('content')).toHaveClass('card');
  });

  it('renders as article when as prop is provided', () => {
    render(<Card as="article">content</Card>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('merges additional className', () => {
    render(<Card className="rounded-xl">content</Card>);
    expect(screen.getByText('content')).toHaveClass('card', 'rounded-xl');
  });
});
