import { Select } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

export default function SelectMultiple() {
  return (
    <div style={field}>
      <label htmlFor="select-toppings">Toppings</label>
      {/* multiple turns the select into a list box: no chevron, options shown in place. */}
      <Select
        id="select-toppings"
        multiple
        size={5}
        defaultValue={['basil', 'olives']}
        aria-describedby="select-toppings-hint"
      >
        <option value="basil">Basil</option>
        <option value="mushroom">Mushroom</option>
        <option value="olives">Olives</option>
        <option value="onion">Onion</option>
        <option value="pepper">Pepper</option>
        <option value="pineapple">Pineapple</option>
      </Select>
      <small id="select-toppings-hint" style={{ color: 'var(--color-text-muted)' }}>
        Hold Ctrl or ⌘ to pick more than one.
      </small>
    </div>
  );
}
