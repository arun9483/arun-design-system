import { useState } from 'react';
import { Stack, Text, TreeView } from '@arun-dev/ui';

export default function TreeViewMultiple() {
  const [value, setValue] = useState<string[]>(['repo:read', 'issues:write']);

  return (
    <Stack gap="sm" style={{ inlineSize: '100%', maxInlineSize: '20rem' }}>
      <TreeView.Root
        aria-label="Token permissions"
        multiple
        value={value}
        onValueChange={setValue}
        defaultExpanded={['repo', 'issues']}
      >
        {/* Selecting a parent selects that Item only: the tree does not cascade to children. */}
        <TreeView.Item value="repo" label="Repository">
          <TreeView.Item value="repo:read" label="Read code" />
          <TreeView.Item value="repo:write" label="Push code" />
        </TreeView.Item>
        <TreeView.Item value="issues" label="Issues">
          <TreeView.Item value="issues:read" label="Read issues" />
          <TreeView.Item value="issues:write" label="Open and close issues" />
        </TreeView.Item>
        <TreeView.Item value="admin" label="Administration">
          <TreeView.Item value="admin:billing" label="Billing" />
          <TreeView.Item value="admin:members" label="Members" />
        </TreeView.Item>
      </TreeView.Root>
      <Text size="sm" color="secondary" aria-live="polite">
        {value.length} selected{value.length > 0 ? `: ${value.join(', ')}` : ''}
      </Text>
    </Stack>
  );
}
