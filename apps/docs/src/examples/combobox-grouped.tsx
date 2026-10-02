import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

// Groups are data: any object with an `items` array. The rest is yours to render.
type Region = { label: string; comingSoon?: boolean; items: string[] };

const regions: Region[] = [
  { label: 'Africa', items: ['Egypt', 'Ghana', 'Kenya', 'Nigeria'] },
  { label: 'Americas', items: ['Argentina', 'Brazil', 'Canada', 'México', 'United States'] },
  { label: 'Asia', items: ['India', 'Japan', 'Singapore', 'South Korea'] },
  { label: 'Europe', items: ['France', 'Germany', 'Spain', 'United Kingdom'] },
  // Shown, but every country in it is disabled, as with <optgroup disabled>.
  { label: 'Oceania (coming soon)', comingSoon: true, items: ['Australia', 'New Zealand'] },
];

// Search "an": only the groups with a match stay, each holding only its matches.
export default function ComboboxGrouped() {
  return (
    <div style={field}>
      <label htmlFor="combobox-grouped">Ship to</label>
      <Combobox.Root items={regions} name="country">
        <Combobox.Input id="combobox-grouped" placeholder="Search countries…" />
        <Combobox.Popup>
          <Combobox.Empty>No countries found.</Combobox.Empty>
          <Combobox.List>
            {(region: Region) => (
              <Combobox.Group key={region.label} disabled={region.comingSoon}>
                <Combobox.GroupLabel>{region.label}</Combobox.GroupLabel>
                {region.items.map((country) => (
                  <Combobox.Item key={country} value={country}>
                    {country}
                  </Combobox.Item>
                ))}
              </Combobox.Group>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
