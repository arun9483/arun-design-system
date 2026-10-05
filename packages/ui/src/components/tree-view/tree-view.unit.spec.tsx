import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TreeView } from './index';

// Selection, opening and the keyboard are @arun-dev/headless's and are tested there, in a real
// browser. These check only what ui adds.
describe('TreeView (ui)', () => {
  it('styles the tree and its Items, keeping their own class names', () => {
    render(
      <TreeView.Root aria-label="Files" className="wide" defaultExpanded={['src']}>
        <TreeView.Item value="src" label="src" className="folder">
          <TreeView.Item value="index" label="index.ts" />
        </TreeView.Item>
      </TreeView.Root>,
    );
    expect(screen.getByRole('tree')).toHaveClass('tree-view', 'wide');
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveClass('tree-view-item', 'folder');
    expect(screen.getByRole('treeitem', { name: 'index.ts' })).toHaveClass('tree-view-item');
  });

  it('draws a hidden chevron before every label, leaving the name to the label', () => {
    render(
      <TreeView.Root aria-label="Files">
        <TreeView.Item value="readme" label="README.md" />
      </TreeView.Root>,
    );
    const item = screen.getByRole('treeitem', { name: 'README.md' });
    const chevron = item.querySelector('.tree-view-chevron');
    expect(chevron).toHaveAttribute('aria-hidden');
    expect(item.firstElementChild?.firstElementChild).toBe(chevron);
  });
});
