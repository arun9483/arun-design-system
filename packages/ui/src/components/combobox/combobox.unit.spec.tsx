import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Combobox } from './index';

const fruits = ['Apple', 'Banana', 'Cherry'];

// Behaviour and placement are @arun-dev/headless's and are tested there, in a real browser.
// These check only what ui adds: the field's structure, class names and labels.
describe('Combobox (ui)', () => {
  it('draws one field around the text, Clear and the chevron', () => {
    render(
      <Combobox.Root items={fruits} defaultValue="Apple">
        <Combobox.Input aria-label="Fruit" className="wide" placeholder="Pick one" />
      </Combobox.Root>,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveClass('combobox-input');
    expect(input).toHaveAttribute('placeholder', 'Pick one');

    const field = input.parentElement;
    expect(field).toHaveClass('combobox', 'wide');
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveClass('combobox-clear');
    expect(screen.getByRole('button', { name: 'Show options' })).toHaveClass('combobox-trigger');
  });

  it('renders a Chip with a remove button per selected item, with multiple', () => {
    render(
      <Combobox.Root items={fruits} multiple defaultValue={['Apple', 'Cherry']}>
        <Combobox.Input aria-label="Fruit" removeLabel={(label) => `Drop ${label}`} />
      </Combobox.Root>,
    );
    const chip = screen.getByText('Apple');
    expect(chip).toHaveClass('chip', 'combobox-chip');
    expect(chip).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('button', { name: 'Drop Cherry' })).toHaveClass('combobox-chip-remove');
  });

  it('styles groups and their labels', () => {
    render(
      <Combobox.Root items={[{ label: 'Citrus', items: ['Lemon', 'Lime'] }]}>
        <Combobox.Input aria-label="Fruit" />
        <Combobox.Popup>
          <Combobox.List>
            {(group: { label: string; items: string[] }) => (
              <Combobox.Group key={group.label} className="wide">
                <Combobox.GroupLabel>{group.label}</Combobox.GroupLabel>
                {group.items.map((item) => (
                  <Combobox.Item key={item} value={item}>
                    {item}
                  </Combobox.Item>
                ))}
              </Combobox.Group>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>,
    );
    const group = screen.getByRole('group', { name: 'Citrus', hidden: true });
    expect(group).toHaveClass('combobox-group', 'wide');
    expect(screen.getByText('Citrus')).toHaveClass('combobox-group-label');
  });

  it('renders no chips without multiple', () => {
    render(
      <Combobox.Root items={fruits} defaultValue="Apple">
        <Combobox.Input aria-label="Fruit" />
      </Combobox.Root>,
    );
    expect(document.querySelector('.combobox-chip')).toBeNull();
  });

  it('styles the popup, list, items and messages, keeping their props', () => {
    render(
      <Combobox.Root items={fruits} defaultValue="Banana">
        <Combobox.Input aria-label="Fruit" />
        <Combobox.Popup data-testid="popup" className="tall">
          <Combobox.Status>3 results</Combobox.Status>
          <Combobox.Empty>No fruit</Combobox.Empty>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item key={item} value={item}>
                {item}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>,
    );
    expect(screen.getByTestId('popup')).toHaveClass('combobox-popup', 'tall');
    expect(screen.getByRole('listbox', { hidden: true })).toHaveClass('combobox-list');
    const banana = screen.getByRole('option', { name: 'Banana', hidden: true });
    expect(banana).toHaveClass('combobox-item');
    expect(banana).toHaveAttribute('data-selected');
    expect(banana.querySelector('.combobox-item-check')).not.toBeNull();
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('combobox-message');
  });
});
