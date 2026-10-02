import { render, screen, within } from '@testing-library/react';
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
const form = () => screen.getByTestId('form') as HTMLFormElement;

type Country = { code: string; label: string };
type Continent = { label: string; disabled?: boolean; items: Country[] };

const continents: Continent[] = [
  {
    label: 'Africa',
    items: [
      { code: 'eg', label: 'Egypt' },
      { code: 'ke', label: 'Kenya' },
    ],
  },
  {
    label: 'Asia',
    items: [
      { code: 'in', label: 'India' },
      { code: 'jp', label: 'Japan' },
    ],
  },
  { label: 'Antarctica', disabled: true, items: [{ code: 'aq', label: 'Research station' }] },
  {
    label: 'Europe',
    items: [
      { code: 'fr', label: 'France' },
      { code: 'de', label: 'Germany' },
    ],
  },
];

function Grouped({ onPick }: { onPick?: (code: string | undefined) => void }) {
  return (
    <form data-testid="form">
      <Combobox.Root
        items={continents}
        itemToKey={(c: Country) => c.code}
        name="product"
        // Typed as the item, not the group: `code` exists only on Country.
        onValueChange={(country) => onPick?.(country?.code)}
      >
        <Combobox.Input aria-label="Product" />
        <Combobox.Popup data-testid="popup">
          <Combobox.Empty>No countries</Combobox.Empty>
          <Combobox.List>
            {(group: Continent) => (
              <Combobox.Group key={group.label} disabled={group.disabled}>
                <Combobox.GroupLabel>{group.label}</Combobox.GroupLabel>
                {group.items.map((country) => (
                  <Combobox.Item key={country.code} value={country}>
                    {country.label}
                  </Combobox.Item>
                ))}
              </Combobox.Group>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </form>
  );
}

const groups = () =>
  screen
    .queryAllByRole('group', { hidden: true })
    .map((g) => g.getAttribute('aria-label') ?? g.textContent);
const groupNames = () =>
  screen
    .queryAllByRole('group', { hidden: true })
    .map((g) => document.getElementById(g.getAttribute('aria-labelledby') ?? '')?.textContent);

// Creating an item is a pattern, not an API (decision 14): a "Create" item joins `items` while
// nothing matches exactly, and `onValueChange` swaps it for the real one.
type Label = { id: string; label: string; create?: string };

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

function useCreatable() {
  const [labels, setLabels] = useState<Label[]>([
    { id: 'bug', label: 'bug' },
    { id: 'docs', label: 'documentation' },
  ]);
  const [query, setQuery] = useState('');
  const text = query.trim();
  const exact = labels.some((l) => fold(l.label) === fold(text));
  const items =
    text !== '' && !exact
      ? // Labelled with the text itself, so a pick puts that in the input; shown as "Create".
        [...labels, { id: `create:${text}`, label: text, create: text }]
      : labels;
  function made(item: Label): Label {
    if (item.create === undefined) return item;
    const label = { id: item.create, label: item.create };
    setLabels((current) => [...current, label]);
    return label;
  }
  return { items, setQuery, made };
}

function LabelList() {
  return (
    <Combobox.Popup data-testid="popup">
      <Combobox.List>
        {(item: Label) => (
          <Combobox.Item key={item.id} value={item}>
            {item.create === undefined ? item.label : `Create "${item.create}"`}
          </Combobox.Item>
        )}
      </Combobox.List>
    </Combobox.Popup>
  );
}

function CreatableMultiple() {
  const { items, setQuery, made } = useCreatable();
  const [value, setValue] = useState<Label[]>([]);
  return (
    <form data-testid="form">
      <Combobox.Root
        items={items}
        itemToKey={(l: Label) => l.id}
        multiple
        name="product"
        value={value}
        onValueChange={(next) => setValue(next.map(made))}
        onInputValueChange={setQuery}
      >
        <Combobox.Input aria-label="Product" />
        <LabelList />
      </Combobox.Root>
    </form>
  );
}

function CreatableSingle() {
  const { items, setQuery, made } = useCreatable();
  const [value, setValue] = useState<Label | null>(null);
  return (
    <form data-testid="form">
      <Combobox.Root
        items={items}
        itemToKey={(l: Label) => l.id}
        name="product"
        value={value}
        onValueChange={(next) => setValue(next && made(next))}
        onInputValueChange={setQuery}
      >
        <Combobox.Input aria-label="Product" />
        <LabelList />
      </Combobox.Root>
    </form>
  );
}

describe('Combobox (browser)', () => {
  it('anchors the popup to the input as a native manual popover', () => {
    render(<Basic />);
    const anchor = getComputedStyle(input()).getPropertyValue('anchor-name');
    expect(anchor).toMatch(/^--hl-anchor-/);
    expect(getComputedStyle(popup()).getPropertyValue('position-anchor')).toBe(anchor);
    expect(popup()).toHaveAttribute('popover', 'manual');
  });

  it('anchors to an InputGroup when one wraps the input, and a press on it focuses the input', async () => {
    render(
      <Combobox.Root items={products} itemToKey={(p: Product) => p.id}>
        <Combobox.InputGroup data-testid="group">
          <Combobox.Input aria-label="Product" />
        </Combobox.InputGroup>
        <Combobox.Popup data-testid="popup" />
      </Combobox.Root>,
    );
    const group = screen.getByTestId('group');
    const anchor = getComputedStyle(group).getPropertyValue('anchor-name');
    expect(anchor).toMatch(/^--hl-anchor-/);
    expect(getComputedStyle(input()).getPropertyValue('anchor-name')).toBe('none');
    expect(getComputedStyle(popup()).getPropertyValue('position-anchor')).toBe(anchor);
    await userEvent.click(group, { position: { x: 1, y: 1 } });
    expect(document.activeElement).toBe(input());
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

  describe('groups', () => {
    it('renders each group as a role="group" in the listbox, named by its label', async () => {
      render(<Grouped />);
      await userEvent.click(input());
      expect(groupNames()).toEqual(['Africa', 'Asia', 'Antarctica', 'Europe']);
      const asia = screen.getByRole('group', { name: 'Asia' });
      expect(asia.parentElement).toHaveAttribute('role', 'listbox');
      expect(
        within(asia)
          .getAllByRole('option')
          .map((o) => o.textContent),
      ).toEqual(['India', 'Japan']);
    });

    it('filters inside each group, and leaves out a group with no match', async () => {
      render(<Grouped />);
      await userEvent.type(input(), 'an');
      expect(groupNames()).toEqual(['Asia', 'Europe']);
      expect(options()).toEqual(['Japan', 'France', 'Germany']);
      await userEvent.clear(input());
      await userEvent.type(input(), 'zz');
      expect(groups()).toEqual([]);
      expect(screen.getByText('No countries')).toBeInTheDocument();
    });

    it('runs the arrow keys through every group as one list, past labels and a disabled group', async () => {
      render(<Grouped />);
      await userEvent.click(input());
      const seen: (string | null | undefined)[] = [];
      for (let i = 0; i < 5; i++) {
        await userEvent.keyboard('{ArrowDown}');
        seen.push(highlighted()?.textContent);
      }
      expect(seen).toEqual(['Egypt', 'Kenya', 'India', 'Japan', 'France']);
    });

    it('disables every item in a disabled group, as <optgroup disabled> does', async () => {
      const onPick = vi.fn();
      render(<Grouped onPick={onPick} />);
      await userEvent.click(input());
      expect(screen.getByRole('group', { name: 'Antarctica' })).toHaveAttribute('data-disabled');
      const station = option('Research station');
      expect(station).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(station, { force: true });
      expect(onPick).not.toHaveBeenCalled();
    });

    it('picks and submits an item from a group', async () => {
      const onPick = vi.fn();
      render(<Grouped onPick={onPick} />);
      await userEvent.click(input());
      await userEvent.click(option('Japan'));
      expect(input().value).toBe('Japan');
      expect(onPick).toHaveBeenCalledWith('jp');
      expect(submitted()).toEqual(['jp']);
    });
  });

  describe('creating an item, as a pattern', () => {
    it('offers "Create" while nothing matches exactly, and Enter adds the new item', async () => {
      render(<CreatableMultiple />);
      await userEvent.type(input(), 'urgent');
      expect(options()).toEqual(['Create "urgent"']);
      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(submitted()).toEqual(['urgent']);
      await userEvent.click(input());
      expect(options()).toEqual(['bug', 'documentation', 'urgent']);
    });

    it('hides "Create" when an item matches exactly, ignoring case and accents', async () => {
      render(<CreatableMultiple />);
      await userEvent.type(input(), 'BUG');
      expect(options()).toEqual(['bug']);
    });

    it('works without multiple: the input shows the created label', async () => {
      render(<CreatableSingle />);
      await userEvent.type(input(), 'feature');
      await userEvent.click(option('Create "feature"'));
      expect(input().value).toBe('feature');
      expect(submitted()).toEqual(['feature']);
      await userEvent.click(input());
      expect(options()).toEqual(['bug', 'documentation', 'feature']);
    });
  });

  describe('required', () => {
    it('is required while nothing is selected, and valid once something is', async () => {
      render(<Basic required />);
      expect(input()).toBeRequired();
      expect(input().validity.valueMissing).toBe(true);
      expect(form().checkValidity()).toBe(false);
      await userEvent.click(input());
      await userEvent.click(option('Pen: Fountain'));
      expect(input().required).toBe(false);
      expect(input()).toHaveAttribute('aria-required', 'true');
      expect(form().checkValidity()).toBe(true);
    });

    it("reports text that picked nothing with the browser's own message", async () => {
      render(<Basic required />);
      const message = input().validationMessage;
      expect(message).not.toBe('');
      await userEvent.type(input(), 'zzz');
      expect(input().validity.customError).toBe(true);
      expect(input().validationMessage).toBe(message);
      expect(form().checkValidity()).toBe(false);
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.clear(input());
      await userEvent.type(input(), 'dune');
      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(input().validity.valid).toBe(true);
    });

    it('leaves a message the consumer set alone', async () => {
      render(<Basic required defaultValue={products[0]} />);
      input().setCustomValidity('Not this one');
      await userEvent.click(input());
      await userEvent.click(option('Pen: Fountain'));
      expect(input().validationMessage).toBe('Not this one');
    });

    it('is satisfied by chips with multiple, while the text is empty', async () => {
      render(<Multiple required />);
      expect(form().checkValidity()).toBe(false);
      await userEvent.click(input());
      await userEvent.click(option('Book: Atlas'));
      expect(input().value).toBe('');
      expect(form().checkValidity()).toBe(true);
    });
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
