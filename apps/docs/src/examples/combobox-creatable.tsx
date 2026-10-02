import { useState } from 'react';
import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '24rem' };

type Label = { id: string; name: string; create?: boolean };

/** Case- and accent-insensitive, as the default filter compares. */
function fold(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

// Type a label that isn't there — "perf" — and pick Create.
export default function ComboboxCreatable() {
  const [labels, setLabels] = useState<Label[]>([
    { id: 'bug', name: 'bug' },
    { id: 'documentation', name: 'documentation' },
    { id: 'enhancement', name: 'enhancement' },
    { id: 'good-first-issue', name: 'good first issue' },
  ]);
  const [value, setValue] = useState<Label[]>([]);
  const [text, setText] = useState('');

  const query = text.trim();
  const exact = labels.some((label) => fold(label.name) === fold(query));
  // The "Create" row is an item, labelled with the text itself.
  const items =
    query !== '' && !exact
      ? [...labels, { id: `create:${query}`, name: query, create: true }]
      : labels;

  function createLabel(name: string): Label {
    const label = { id: fold(name).replace(/\s+/g, '-'), name };
    setLabels((current) => [...current, label]);
    return label;
  }

  return (
    <div style={field}>
      <label htmlFor="combobox-labels">Labels</label>
      <Combobox.Root
        items={items}
        itemToString={labelName}
        itemToKey={labelId}
        multiple
        value={value}
        // Swap the "Create" item for the label it makes.
        onValueChange={(next) =>
          setValue(next.map((label) => (label.create ? createLabel(label.name) : label)))
        }
        onInputValueChange={setText}
        name="labels"
      >
        <Combobox.Input id="combobox-labels" placeholder="Filter or create labels…" />
        <Combobox.Popup>
          <Combobox.List>
            {(label: Label) => (
              <Combobox.Item key={label.id} value={label}>
                {label.create ? `Create new label "${label.name}"` : label.name}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}

function labelName(label: Label) {
  return label.name;
}

function labelId(label: Label) {
  return label.id;
}
