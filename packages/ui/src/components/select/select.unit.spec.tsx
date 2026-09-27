import { createRef, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './select';

const FRUIT = (
  <>
    <option value="">Choose a fruit…</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <optgroup label="Citrus">
      <option value="lime">Lime</option>
    </optgroup>
  </>
);

describe('Select', () => {
  it('renders a native select inside the box, with its options', () => {
    render(<Select aria-label="Fruit">{FRUIT}</Select>);
    const select = screen.getByRole('combobox', { name: 'Fruit' });
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveClass('select-control');
    expect(select.parentElement).toHaveClass('select');
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('group', { name: 'Citrus' })).toBeInTheDocument();
  });

  it('draws a decorative chevron after the select', () => {
    render(<Select aria-label="Fruit">{FRUIT}</Select>);
    const icon = screen.getByRole('combobox').nextElementSibling;
    expect(icon?.tagName.toLowerCase()).toBe('svg');
    expect(icon).toHaveClass('select-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('puts className on the box, not the select', () => {
    render(
      <Select aria-label="Fruit" className="w-64">
        {FRUIT}
      </Select>,
    );
    const select = screen.getByRole('combobox');
    expect(select.parentElement).toHaveClass('select', 'w-64');
    expect(select).not.toHaveClass('w-64');
  });

  it('spreads every other prop onto the select', () => {
    render(
      <Select
        aria-label="Fruit"
        id="fruit"
        name="fruit"
        required
        disabled
        aria-invalid
        data-testid="field"
      >
        {FRUIT}
      </Select>,
    );
    const select = screen.getByTestId('field');
    expect(select).toHaveAttribute('id', 'fruit');
    expect(select).toHaveAttribute('name', 'fruit');
    expect(select).toBeRequired();
    expect(select).toBeDisabled();
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards ref to the select', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="Fruit" ref={ref}>
        {FRUIT}
      </Select>,
    );
    expect(ref.current).toBe(screen.getByRole('combobox'));
  });

  it('is uncontrolled by default and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Fruit" defaultValue="apple" onChange={onChange}>
        {FRUIT}
      </Select>,
    );
    const select = screen.getByRole<HTMLSelectElement>('combobox');
    expect(select.value).toBe('apple');
    fireEvent.change(select, { target: { value: 'lime' } });
    expect(onChange).toHaveBeenCalledOnce();
    expect(select.value).toBe('lime');
  });

  it('is controlled by value and onChange', () => {
    function Controlled() {
      const [fruit, setFruit] = useState('banana');
      return (
        <>
          <Select aria-label="Fruit" value={fruit} onChange={(e) => setFruit(e.target.value)}>
            {FRUIT}
          </Select>
          <button type="button" onClick={() => setFruit('')}>
            Reset
          </button>
          <output>{fruit}</output>
        </>
      );
    }
    render(<Controlled />);
    const select = screen.getByRole<HTMLSelectElement>('combobox');
    expect(select.value).toBe('banana');

    fireEvent.change(select, { target: { value: 'apple' } });
    expect(screen.getByRole('status')).toHaveTextContent('apple');

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(select.value).toBe('');
  });

  it('supports multiple selection, as a list box', () => {
    render(
      <Select aria-label="Fruit" multiple defaultValue={['apple', 'lime']}>
        {FRUIT}
      </Select>,
    );
    const select = screen.getByRole<HTMLSelectElement>('listbox');
    expect([...select.selectedOptions].map((o) => o.value)).toEqual(['apple', 'lime']);
  });

  it('keeps the box and chevron when `render` replaces the select', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="Fruit" ref={ref} render={<select data-custom="" />}>
        {FRUIT}
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Fruit' });
    expect(select).toHaveAttribute('data-custom');
    expect(select).toHaveClass('select-control');
    expect(ref.current).toBe(select);
    expect(select.parentElement).toHaveClass('select');
    expect(select.nextElementSibling).toHaveClass('select-icon');
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });
});
