import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders a native text input inside the box', () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveClass('input-control');
    expect(input.parentElement).toHaveClass('input');
  });

  it('renders the box even without slots', () => {
    const { container } = render(<Input aria-label="Name" />);
    expect(container.firstElementChild).toHaveClass('input');
    expect(container.querySelector('.input-slot')).toBeNull();
  });

  it('puts className on the box, not the input', () => {
    render(<Input aria-label="Name" className="w-64" />);
    const input = screen.getByRole('textbox');
    expect(input.parentElement).toHaveClass('input', 'w-64');
    expect(input).not.toHaveClass('w-64');
  });

  it('spreads every other prop onto the input', () => {
    const onChange = vi.fn();
    render(
      <Input
        aria-label="Email"
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        disabled
        aria-invalid
        data-testid="field"
        onChange={onChange}
      />,
    );
    const input = screen.getByTestId('field');
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards ref to the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Name" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('textbox'));
  });

  it('is uncontrolled by default and calls onChange', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" defaultValue="Ada" onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    expect(input.value).toBe('Ada');
    fireEvent.change(input, { target: { value: 'Grace' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(input.value).toBe('Grace');
  });

  it('places the start and end slots around the input, in order', () => {
    render(
      <Input
        aria-label="Price"
        startSlot={<span>$</span>}
        endSlot={<button type="button">Clear</button>}
      />,
    );
    const box = screen.getByRole('textbox').parentElement as HTMLElement;
    const children = [...box.children];
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveClass('input-slot', 'input-slot-start');
    expect(children[0]).toHaveTextContent('$');
    expect(children[1]).toBe(screen.getByRole('textbox'));
    expect(children[2]).toHaveClass('input-slot', 'input-slot-end');
    expect(children[2]).toContainElement(screen.getByRole('button', { name: 'Clear' }));
  });

  it('renders only the slots it is given', () => {
    render(<Input aria-label="Search" endSlot="kg" />);
    const box = screen.getByRole('textbox').parentElement as HTMLElement;
    expect(box.querySelector('.input-slot-start')).toBeNull();
    expect(box.querySelector('.input-slot-end')).toHaveTextContent('kg');
  });

  it('keeps the box and slots when `render` replaces the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        aria-label="Code"
        ref={ref}
        startSlot="#"
        render={<input data-custom="" inputMode="numeric" />}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Code' });
    expect(input).toHaveAttribute('data-custom');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveClass('input-control');
    expect(ref.current).toBe(input);
    expect(input.parentElement).toHaveClass('input');
    expect(input.previousElementSibling).toHaveTextContent('#');
  });
});
