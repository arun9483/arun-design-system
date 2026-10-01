import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

const commands = [
  'Open file',
  'Open recent',
  'Save file',
  'Save all',
  'Close editor',
  'Toggle sidebar',
  'Format document',
  'Find in files',
  'Go to line',
  'Go to symbol',
];

/**
 * A small fuzzy match: the query's letters appear in order, not necessarily together. Items
 * whose letters sit closer together rank first — so "fd" puts "Find in files" above
 * "Format document". Swap in a library such as match-sorter or Fuse.js the same way.
 */
function fuzzy(items: readonly string[], query: string, itemToString: (item: string) => string) {
  const needle = query.toLowerCase().replace(/\s/g, '');
  if (needle === '') return [...items];

  const scored: { item: string; score: number }[] = [];
  for (const item of items) {
    const label = itemToString(item).toLowerCase();
    let at = -1;
    let gaps = 0;
    for (const char of needle) {
      const next = label.indexOf(char, at + 1);
      if (next === -1) {
        at = -2;
        break;
      }
      if (at >= 0) gaps += next - at - 1;
      at = next;
    }
    if (at !== -2) scored.push({ item, score: gaps });
  }
  return scored.sort((a, b) => a.score - b.score).map((s) => s.item);
}

export default function ComboboxFuzzy() {
  return (
    <div style={field}>
      <label htmlFor="combobox-command">Command</label>
      <Combobox.Root items={commands} filter={fuzzy}>
        <Combobox.Input id="combobox-command" placeholder="Try “gts” or “fd”" />
        <Combobox.Popup>
          <Combobox.Empty>No matching commands.</Combobox.Empty>
          <Combobox.List>
            {(command: string) => (
              <Combobox.Item key={command} value={command}>
                {command}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
