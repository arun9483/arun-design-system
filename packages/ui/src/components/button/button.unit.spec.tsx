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

  it.each(['danger', 'danger-ghost'] as const)('applies btn-%s for a deletion', (variant) => {
    render(<Button variant={variant}>Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn', `btn-${variant}`);
  });

  it('keeps its label, and so its name, while a Spinner shows it is pending', () => {
    const { rerender } = render(
      <Button type="submit" variant="primary" pending>
        Save
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-pending');
    expect(button.querySelector('.btn-label')).toHaveTextContent('Save');
    // The Spinner is decoration here: the button is named by its label alone.
    expect(button.querySelector('progress.btn-spinner')).toHaveAttribute('aria-hidden', 'true');
    rerender(
      <Button type="submit" variant="primary">
        Save
      </Button>,
    );
    expect(button).toBeEnabled();
    expect(button.querySelector('.btn-spinner')).toBeNull();
    expect(button).toHaveTextContent('Save');
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
