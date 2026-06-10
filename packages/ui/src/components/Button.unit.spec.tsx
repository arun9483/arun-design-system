import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders as <button> when no href', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
  });

  it('renders as <a> when href provided', () => {
    render(<Button href="https://example.com">Link</Button>);
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('defaults to type=button', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies btn-ghost class by default', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-ghost');
  });

  it('applies btn-primary class when variant is primary', () => {
    render(<Button variant="primary">Click</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary');
  });
});
