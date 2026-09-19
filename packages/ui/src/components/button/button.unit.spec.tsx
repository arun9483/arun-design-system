import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders as <button>', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
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

  it('renders the element given to `render`', () => {
    render(
      <Button render={<span />} data-testid="btn">
        Docs
      </Button>,
    );
    // `type` means nothing on a span, so Button does not put one there.
    const el = screen.getByTestId('btn');
    expect(el.tagName).toBe('SPAN');
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
