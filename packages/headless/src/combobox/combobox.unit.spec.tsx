import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Combobox, defaultFilter } from './index';
import type { ComboboxRootProps } from './ComboboxRoot';

const fruits = ['Apple', 'Banana', 'Cherry', 'Crème brûlée'];

function Basic(props: Omit<ComboboxRootProps<string>, 'items'> & { items?: string[] }) {
  return (
    <Combobox.Root items={fruits} {...props}>
      <Combobox.Input aria-label="Fruit" />
      <Combobox.Trigger aria-label="Show fruits" />
      <Combobox.Clear aria-label="Clear" />
      <Combobox.Popup>
        <Combobox.Status>{props.loading ? 'Loading' : ''}</Combobox.Status>
        <Combobox.Empty>No fruit</Combobox.Empty>
        <Combobox.List>
          {(item: string) => (
            <Combobox.Item key={item} value={item}>
              {item}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}

const input = () => screen.getByRole('combobox', { name: 'Fruit' }) as HTMLInputElement;
const options = () => screen.queryAllByRole('option', { hidden: true }).map((o) => o.textContent);

// jsdom has no popover API, so these cover the markup and the state; the browser spec covers
// opening, closing, focus and keys.
describe('Combobox', () => {
  it('renders the ARIA combobox pattern, wired by id', () => {
    render(<Basic />);
    const listbox = screen.getByRole('listbox', { hidden: true });
    expect(input()).toHaveAttribute('aria-controls', listbox.id);
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveAttribute('aria-autocomplete', 'list');
    expect(input()).toHaveAttribute('autocomplete', 'off');

    const trigger = screen.getByRole('button', { name: 'Show fruits' });
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('tabindex', '-1');
    expect(trigger).toHaveAttribute('aria-controls', listbox.id);

    const option = screen.getByRole('option', { name: 'Apple', hidden: true });
    expect(option).toHaveAttribute('aria-selected', 'false');
    expect(option.id).not.toBe('');
  });

  it('filters as the input changes, and reports the text', () => {
    const onInputValueChange = vi.fn();
    render(<Basic onInputValueChange={onInputValueChange} />);
    fireEvent.change(input(), { target: { value: 'an' } });
    expect(options()).toEqual(['Banana']);
    expect(onInputValueChange).toHaveBeenCalledWith('an', { reason: 'input' });
    expect(input()).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks the selected item, and shows its label', () => {
    render(<Basic defaultValue="Cherry" />);
    expect(input().value).toBe('Cherry');
    expect(screen.getByRole('option', { name: 'Cherry', hidden: true })).toHaveAttribute(
      'data-selected',
    );
  });

  it('picks with a click, reporting why', () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('option', { name: 'Banana', hidden: true }));
    expect(onValueChange).toHaveBeenCalledWith('Banana', { reason: 'item-press' });
    expect(input().value).toBe('Banana');
  });

  it('follows a controlled value with the input', () => {
    const { rerender } = render(<Basic value="Apple" onValueChange={() => {}} />);
    expect(input().value).toBe('Apple');
    rerender(<Basic value="Banana" onValueChange={() => {}} />);
    expect(input().value).toBe('Banana');
  });

  it('keeps a defaultInputValue over the selected label at mount', () => {
    render(<Basic defaultValue="Apple" defaultInputValue="Ap" />);
    expect(input().value).toBe('Ap');
  });

  it('submits each selected key from hidden inputs', () => {
    const { container } = render(
      <Combobox.Root items={fruits} multiple name="fruit" defaultValue={['Apple', 'Cherry']}>
        <Combobox.Input aria-label="Fruit" />
      </Combobox.Root>,
    );
    const hidden = [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')];
    expect(hidden.map((i) => [i.name, i.value])).toEqual([
      ['fruit', 'Apple'],
      ['fruit', 'Cherry'],
    ]);
  });

  it('submits an empty value with no single selection', () => {
    const { container } = render(<Basic name="fruit" />);
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]');
    expect(hidden?.value).toBe('');
  });

  it('marks Clear visible only while something is selected', () => {
    const { rerender } = render(<Basic value={null} onValueChange={() => {}} />);
    const clear = screen.getByRole('button', { name: 'Clear' });
    expect(clear).not.toHaveAttribute('data-visible');
    rerender(<Basic value="Apple" onValueChange={() => {}} />);
    expect(clear).toHaveAttribute('data-visible');
  });

  it('is aria-busy while loading, and hides Empty', () => {
    render(<Basic items={[]} loading />);
    expect(screen.getByRole('listbox', { hidden: true })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('No fruit')).toBeNull();
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent('Loading');
  });

  it('shows Empty when the filter leaves nothing', () => {
    render(<Basic />);
    fireEvent.change(input(), { target: { value: 'kiwi' } });
    expect(screen.getByText('No fruit')).toBeInTheDocument();
  });

  it('marks a disabled item, and does not pick it', () => {
    const onValueChange = vi.fn();
    render(
      <Combobox.Root items={fruits} onValueChange={onValueChange}>
        <Combobox.Input aria-label="Fruit" />
        <Combobox.Popup>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item key={item} value={item} disabled={item === 'Apple'}>
                {item}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>,
    );
    const apple = screen.getByRole('option', { name: 'Apple', hidden: true });
    expect(apple).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(apple);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('throws a part outside its Root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Combobox.Input />)).toThrow(
      '<Combobox.Input> must be rendered inside <Combobox.Root>.',
    );
  });
});

describe('defaultFilter', () => {
  const label = (s: string) => s;

  it('keeps every item for an empty query', () => {
    expect(defaultFilter(fruits, '  ', label)).toEqual(fruits);
  });

  it('matches anywhere in the label, ignoring case and accents', () => {
    expect(defaultFilter(fruits, 'RRY', label)).toEqual(['Cherry']);
    expect(defaultFilter(fruits, 'creme brulee', label)).toEqual(['Crème brûlée']);
  });

  it('keeps the original order', () => {
    expect(defaultFilter(['ab', 'ba', 'a'], 'a', label)).toEqual(['ab', 'ba', 'a']);
  });
});
