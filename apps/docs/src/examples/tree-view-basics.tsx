import { useState } from 'react';
import { Stack, Text, TreeView } from '@arun-dev/ui';

export default function TreeViewBasics() {
  // The selection is a list of values, even with one selected: the same shape as `multiple`.
  const [value, setValue] = useState<string[]>(['src/main.ts']);

  return (
    <Stack gap="sm" style={{ inlineSize: '100%', maxInlineSize: '20rem' }}>
      <TreeView.Root
        aria-label="Project files"
        value={value}
        onValueChange={setValue}
        defaultExpanded={['src']}
      >
        {/* Values are paths here: unique in the tree, and useful once selected. */}
        <TreeView.Item value="src" label="src">
          <TreeView.Item value="src/components" label="components">
            <TreeView.Item value="src/components/Button.tsx" label="Button.tsx" />
            <TreeView.Item value="src/components/Card.tsx" label="Card.tsx" />
          </TreeView.Item>
          <TreeView.Item value="src/main.ts" label="main.ts" />
          <TreeView.Item value="src/env.d.ts" label="env.d.ts" disabled />
        </TreeView.Item>
        <TreeView.Item value="docs" label="docs">
          <TreeView.Item value="docs/intro.md" label="intro.md" />
          <TreeView.Item value="docs/setup.md" label="setup.md" />
        </TreeView.Item>
        <TreeView.Item value="package.json" label="package.json" />
        <TreeView.Item value="README.md" label="README.md" />
      </TreeView.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        Selected: {value[0] ?? 'nothing'}
      </Text>
    </Stack>
  );
}
