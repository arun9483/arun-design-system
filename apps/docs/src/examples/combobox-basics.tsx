import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

// Not shipping there yet: shown, but it can't be picked and the arrow keys skip it.
const unavailable = new Set(['Brazil']);

const countries = [
  'Argentina',
  'Australia',
  'Brazil',
  'Canada',
  'Côte d’Ivoire',
  'France',
  'Germany',
  'India',
  'Japan',
  'México',
  'United Kingdom',
  'United States',
];

export default function ComboboxBasics() {
  return (
    <div style={field}>
      <label htmlFor="combobox-country">Country</label>
      {/* Pre-selected: the input starts with its label, and the list marks it. */}
      <Combobox.Root items={countries} defaultValue="India" name="country">
        <Combobox.Input id="combobox-country" placeholder="Search countries…" />
        <Combobox.Popup>
          <Combobox.Empty>No countries found.</Combobox.Empty>
          <Combobox.List>
            {(country: string) => (
              <Combobox.Item key={country} value={country} disabled={unavailable.has(country)}>
                {country}
                {unavailable.has(country) && ' (unavailable)'}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
