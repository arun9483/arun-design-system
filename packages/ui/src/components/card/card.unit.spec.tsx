import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './card';

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

  it('spreads unrecognised props onto the element', () => {
    // Card previously destructured only {as, lift, className, children}, so an
    // aria-label on a <Card as="nav"> was silently dropped.
    render(
      <Card as="nav" aria-label="Table of contents">
        content
      </Card>,
    );
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument();
  });

  it('renders the element given to `render`', () => {
    render(<Card render={<section />}>content</Card>);
    const el = screen.getByText('content');
    expect(el.tagName).toBe('SECTION');
    expect(el).toHaveClass('card');
  });

  it('adds card-lift when lift is set', () => {
    render(<Card lift>content</Card>);
    expect(screen.getByText('content')).toHaveClass('card', 'card-lift');
  });

  it('exposes the element through ref', () => {
    const ref: { current: HTMLElement | null } = { current: null };
    render(<Card ref={ref}>content</Card>);
    expect(ref.current).toBe(screen.getByText('content'));
  });
});
