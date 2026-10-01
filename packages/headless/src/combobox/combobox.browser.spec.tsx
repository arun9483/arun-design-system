import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { Combobox } from './index';
import { Dialog } from '../dialog';
import { Popover } from '../popover';
import type { ComboboxRootProps } from './ComboboxRoot';

/** Runs in Chromium: jsdom has no popover API, light dismiss, anchoring or real focus. */

type Product = { id: string; label: string; disabled?: boolean };

const products: Product[] = [
  { id: 'b1', label: 'Book: Atlas' },
  { id: 'b2', label: 'Book: Bestiary' },
  { id: 'b3', label: 'Book: Café stories', disabled: true },
  { id: 'b4', label: 'Book: Dune' },
  { id: 'p1', label: 'Pen: Ballpoint' },
  { id: 'p2', label: 'Pen: Fountain' },
];

type Props<M extends boolean> = Omit<ComboboxRootProps<Product, M>, 'items'> & {
  items?: Product[];
};

function Basic({ items = products, ...props }: Props<false>) {
  return (
    <>
      <button type="button">Before</button>
      <form data-testid="form">
        <Combobox.Root items={items} itemToKey={(p: Product) => p.id} name="product" {...props}>
          <Combobox.Input aria-label="Product" />
          <Combobox.Clear aria-label="Clear" />
          <Combobox.Trigger aria-label="Show products" />
          <Combobox.Popup data-testid="popup">
            <Combobox.Empty>No products</Combobox.Empty>
            <Combobox.List>
              {(item: Product) => (
                <Combobox.Item key={item.id} value={item} disabled={item.disabled}>
                  {item.label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </form>
      <button type="button">After</button>
    </>
  );
}

function Multiple(props: Omit<Props<true>, 'multiple' | 'value' | 'onValueChange'>) {
  const [value, setValue] = useState<Product[]>([]);
  return (
    <>
      <button type="button">Before</button>
      <form data-testid="form">
        <Combobox.Root
          items={products}
          itemToKey={(p: Product) => p.id}
          name="product"
          multiple
          value={value}
          onValueChange={setValue}
          {...props}
        >
          {value.map((item) => (
            <Combobox.Chip key={item.id} value={item} data-testid={`chip-${item.id}`}>
              {item.label}
              <Combobox.ChipRemove aria-label={`Remove ${item.label}`} />
            </Combobox.Chip>
          ))}
          <Combobox.Input aria-label="Product" />
          <Combobox.Clear aria-label="Clear" />
          <Combobox.Popup data-testid="popup">
            <Combobox.List>
              {(item: Product) => (
                <Combobox.Item key={item.id} value={item} disabled={item.disabled}>
                  {item.label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </form>
      <button type="button">After</button>
    </>
  );
}

const input = () => screen.getByRole('combobox', { name: 'Product' }) as HTMLInputElement;
const popup = () => screen.getByTestId('popup');
const isOpen = () => popup().matches(':popover-open');
const option = (name: string) => screen.getByRole('option', { name, hidden: true });
const options = () => screen.queryAllByRole('option', { hidden: true }).map((o) => o.textContent);
const highlighted = () =>
  document.getElementById(input().getAttribute('aria-activedescendant') ?? '');
const submitted = () =>
  new FormData(screen.getByTestId('form') as HTMLFormElement).getAll('product');

describe('Combobox (browser)', () => {
  it('anchors the popup to the input as a native manual popover', () => {
    render(<Basic />);
    const anchor = getComputedStyle(input()).getPropertyValue('anchor-name');
    expect(anchor).toMatch(/^--hl-anchor-/);
    expect(getComputedStyle(popup()).getPropertyValue('position-anchor')).toBe(anchor);
    expect(popup()).toHaveAttribute('popover', 'manual');
  });

  it('opens and filters as you type, ignoring case and accents', async () => {
    render(<Basic />);
    await userEvent.type(input(), 'cafe');
    expect(isOpen()).toBe(true);
    expect(options()).toEqual(['Book: Café stories']);
  });

  it('opens on Down at the first item, moves skipping disabled ones, and picks with Enter', async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);
    input().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(isOpen()).toBe(true);
    expect(highlighted()).toBe(option('Book: Atlas'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(highlighted()).toBe(option('Book: Dune'));
    expect(option('Book: Dune')).toHaveAttribute('data-highlighted');
    await userEvent.keyboard('{Enter}');
    expect(isOpen()).toBe(false);
    expect(input().value).toBe('Book: Dune');
    expect(onValueChange).toHaveBeenLastCalledWith(products[3], { reason: 'item-press' });
    expect(submitted()).toEqual(['b4']);
  });

  it('opens without a highlight on Alt+Down', async () => {
    render(<Basic />);
    input().focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(isOpen()).toBe(true);
    expect(input()).not.toHaveAttribute('aria-activedescendant');
  });

  it('shows every item while the input still holds the selected label', async () => {
    render(<Basic defaultValue={products[0]} />);
    expect(input().value).toBe('Book: Atlas');
    await userEvent.click(input());
    expect(isOpen()).toBe(true);
    expect(options()).toHaveLength(products.length);
    expect(option('Book: Atlas')).toHaveAttribute('aria-selected', 'true');
  });

  it('stays open on a press of the input, and closes on a press outside, restoring the label', async () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultValue={products[0]} onOpenChange={onOpenChange} />);
    await userEvent.click(input());
    await userEvent.type(input(), 'x');
    await userEvent.click(input());
    expect(isOpen()).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'outside-press' });
    expect(input().value).toBe('Book: Atlas');
  });

  it('closes on Esc, restoring the label', async () => {
    const onOpenChange = vi.fn();
    render(<Basic defaultValue={products[0]} onOpenChange={onOpenChange} />);
    await userEvent.type(input(), 'ze');
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'escape' });
    expect(input().value).toBe('Book: Atlas');
  });

  it('clears a single selection when the input is emptied', async () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue={products[0]} onValueChange={onValueChange} />);
    await userEvent.clear(input());
    expect(onValueChange).toHaveBeenLastCalledWith(null, { reason: 'input' });
    expect(submitted()).toEqual(['']);
  });

  it('toggles from the Trigger, without a light-dismiss reopen, keeping focus in the input', async () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Show products' });
    await userEvent.click(trigger);
    expect(isOpen()).toBe(true);
    expect(document.activeElement).toBe(input());
    await userEvent.click(trigger);
    expect(isOpen()).toBe(false);
  });

  it('Clear empties the text and the selection, and is visible only with a selection', async () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue={products[1]} onValueChange={onValueChange} />);
    const clear = screen.getByRole('button', { name: 'Clear' });
    expect(clear).toHaveAttribute('data-visible');
    await userEvent.click(clear);
    expect(input().value).toBe('');
    expect(onValueChange).toHaveBeenLastCalledWith(null, { reason: 'clear' });
    expect(clear).not.toHaveAttribute('data-visible');
    expect(document.activeElement).toBe(input());
  });

  it('closes on Tab, restoring the label', async () => {
    render(<Basic defaultValue={products[0]} />);
    await userEvent.type(input(), 'z');
    await userEvent.tab();
    expect(isOpen()).toBe(false);
    expect(input().value).toBe('Book: Atlas');
  });

  it('shows Empty when nothing matches', async () => {
    render(<Basic />);
    await userEvent.type(input(), 'stapler');
    expect(options()).toEqual([]);
    expect(screen.getByText('No products')).toBeVisible();
  });

  it('reports the highlighted item with its index', async () => {
    const onItemHighlighted = vi.fn();
    render(<Basic onItemHighlighted={onItemHighlighted} />);
    input().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onItemHighlighted).toHaveBeenLastCalledWith(products[5], {
      index: 5,
      reason: 'keyboard',
    });
    await userEvent.hover(option('Book: Atlas'));
    expect(onItemHighlighted).toHaveBeenLastCalledWith(products[0], {
      index: 0,
      reason: 'pointer',
    });
  });

  it('takes a filter over the whole list, so it can rank', async () => {
    const byLength = (items: readonly Product[], query: string) =>
      items
        .filter((p) => p.label.toLowerCase().includes(query))
        .sort((a, b) => b.label.length - a.label.length);
    render(<Basic filter={byLength} />);
    await userEvent.type(input(), 'pen');
    expect(options()).toEqual(['Pen: Ballpoint', 'Pen: Fountain']);
  });

  it('shows items as given with filter={null}', async () => {
    render(<Basic filter={null} />);
    await userEvent.type(input(), 'zzz');
    expect(options()).toHaveLength(products.length);
  });

  it('returns to the mounted selection on form reset', async () => {
    render(<Basic defaultValue={products[0]} />);
    await userEvent.click(input());
    await userEvent.click(option('Pen: Fountain'));
    expect(submitted()).toEqual(['p2']);
    (screen.getByTestId('form') as HTMLFormElement).reset();
    await vi.waitFor(() => expect(input().value).toBe('Book: Atlas'));
    expect(submitted()).toEqual(['b1']);
  });

  describe('multiple', () => {
    it('keeps picks across searches: books, then pens', async () => {
      render(<Multiple />);
      await userEvent.type(input(), 'book');
      await userEvent.click(option('Book: Atlas'));
      // A pick clears the query and closes the list, as Base UI's does.
      expect(input().value).toBe('');
      expect(isOpen()).toBe(false);
      await userEvent.type(input(), 'pen');
      await userEvent.click(option('Pen: Fountain'));
      expect(submitted()).toEqual(['b1', 'p2']);
      expect(screen.getByTestId('chip-b1')).toBeInTheDocument();
    });

    it('toggles a selected item off from the list', async () => {
      render(<Multiple />);
      await userEvent.click(input());
      await userEvent.click(option('Book: Atlas'));
      await userEvent.click(input());
      expect(option('Book: Atlas')).toHaveAttribute('aria-selected', 'true');
      await userEvent.click(option('Book: Atlas'));
      expect(submitted()).toEqual([]);
    });

    it('removes the last item with Backspace in an empty input', async () => {
      render(<Multiple />);
      await userEvent.click(input());
      await userEvent.click(option('Book: Atlas'));
      await userEvent.click(input());
      await userEvent.click(option('Pen: Ballpoint'));
      await userEvent.keyboard('{Backspace}');
      expect(submitted()).toEqual(['b1']);
    });

    it('moves into the chips with Left, and removes one with Delete', async () => {
      render(<Multiple />);
      await userEvent.click(input());
      await userEvent.click(option('Book: Atlas'));
      await userEvent.click(input());
      await userEvent.click(option('Pen: Ballpoint'));
      await userEvent.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(screen.getByTestId('chip-p1'));
      await userEvent.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(screen.getByTestId('chip-b1'));
      await userEvent.keyboard('{Delete}');
      expect(submitted()).toEqual(['p1']);
      expect(document.activeElement).toBe(screen.getByTestId('chip-p1'));
      await userEvent.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(input());
    });

    it('removes an item from its ChipRemove', async () => {
      render(<Multiple />);
      await userEvent.click(input());
      await userEvent.click(option('Book: Atlas'));
      await userEvent.click(screen.getByRole('button', { name: 'Remove Book: Atlas' }));
      expect(submitted()).toEqual([]);
      expect(document.activeElement).toBe(input());
    });

    it('Clear empties the whole selection', async () => {
      render(<Multiple />);
      await userEvent.click(input());
      await userEvent.click(option('Book: Atlas'));
      await userEvent.click(input());
      await userEvent.click(option('Pen: Ballpoint'));
      await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
      expect(submitted()).toEqual([]);
    });
  });

  it('picks inside an open Popover without light-dismissing it', async () => {
    render(
      <Popover.Root defaultOpen>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Popup data-testid="filters" aria-label="Filters">
          <Basic />
        </Popover.Popup>
      </Popover.Root>,
    );
    await userEvent.click(input());
    await userEvent.click(option('Pen: Fountain'));
    expect(input().value).toBe('Pen: Fountain');
    expect(screen.getByTestId('filters').matches(':popover-open')).toBe(true);
  });

  it('closes on Esc inside a modal Dialog, leaving the Dialog open', async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Popup data-testid="dialog" aria-label="Order">
          <Basic />
        </Dialog.Popup>
      </Dialog.Root>,
    );
    await userEvent.click(input());
    expect(isOpen()).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect((screen.getByTestId('dialog') as HTMLDialogElement).open).toBe(true);
  });

  it('asks for more when the end of the list scrolls into view, but not while loading', async () => {
    function Paged() {
      const [items, setItems] = useState(products.slice(0, 2));
      const [loading, setLoading] = useState(false);
      return (
        <Basic
          items={items}
          loading={loading}
          onLoadMore={() => {
            setLoading(true);
            setTimeout(() => {
              setItems((current) => products.slice(0, current.length + 2));
              setLoading(false);
            }, 20);
          }}
        />
      );
    }
    render(<Paged />);
    await userEvent.click(input());
    // Each page leaves the sentinel in view, so pages keep coming until the list is full.
    await vi.waitFor(() => expect(options()).toHaveLength(products.length));
  });
});
