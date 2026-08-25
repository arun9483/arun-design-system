import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

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

  it('does not put a type attribute on the anchor form', () => {
    render(<Button href="https://example.com">Link</Button>);
    expect(screen.getByRole('link')).not.toHaveAttribute('type');
  });

  it('renders the element given to `render`', () => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Button's children
    const link = <a href="/docs" />;
    render(<Button render={link}>Docs</Button>);
    const el = screen.getByRole('link', { name: 'Docs' });
    expect(el.tagName).toBe('A');
    expect(el).toHaveClass('btn', 'btn-ghost');
    expect(el).not.toHaveAttribute('type');
  });

  it('spreads unrecognised props onto the element', () => {
    render(
      <Button id="save" aria-label="Save document" data-testid="btn">
        Save
      </Button>,
    );
    const el = screen.getByTestId('btn');
    expect(el).toHaveAttribute('id', 'save');
    expect(el).toHaveAttribute('aria-label', 'Save document');
  });

  it('forwards target and rel on the anchor form', () => {
    render(
      <Button href="https://example.com" target="_blank" rel="noopener noreferrer">
        External
      </Button>,
    );
    const el = screen.getByRole('link');
    expect(el).toHaveAttribute('target', '_blank');
    expect(el).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('accepts an explicit type', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('exposes the element through ref', () => {
    const ref: { current: HTMLElement | null } = { current: null };
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });
});
