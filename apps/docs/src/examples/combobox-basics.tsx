import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

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
      <Combobox.Root items={countries} name="country">
        <Combobox.Input id="combobox-country" placeholder="Search countries…" />
        <Combobox.Popup>
          <Combobox.Empty>No countries found.</Combobox.Empty>
          <Combobox.List>
            {(country: string) => (
              <Combobox.Item key={country} value={country}>
                {country}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
