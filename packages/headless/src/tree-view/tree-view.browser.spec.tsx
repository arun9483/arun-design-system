import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { TreeView } from './index';
import type { TreeViewRootProps } from './TreeViewRoot';

/** Runs in a real browser: real focus, keys and accessibility tree. */

const focused = () => document.activeElement;
const item = (name: string) => screen.getByRole('treeitem', { name });
const queryItem = (name: string) => screen.queryByRole('treeitem', { name });

function Files(props: TreeViewRootProps) {
  return (
    <>
      <button type="button">Before</button>
      <TreeView.Root aria-label="Files" {...props}>
        <TreeView.Item value="src" label="src">
          <TreeView.Item value="components" label="components">
            <TreeView.Item value="button" label="Button.tsx" />
            <TreeView.Item value="card" label="Card.tsx" />
          </TreeView.Item>
          <TreeView.Item value="index" label="index.ts" />
          <TreeView.Item value="locked" label="locked.ts" disabled />
          <TreeView.Item value="main" label="main.ts" />
        </TreeView.Item>
        <TreeView.Item value="docs" label="docs">
          <TreeView.Item value="intro" label="intro.md" />
        </TreeView.Item>
        <TreeView.Item value="readme" label="README.md" />
      </TreeView.Root>
      <button type="button">After</button>
    </>
  );
}

describe('TreeView (browser)', () => {
  it('is a tree of treeitems, named by their labels, nested in groups', () => {
    render(<Files defaultExpanded={['src']} />);
    const tree = screen.getByRole('tree', { name: 'Files' });
    expect(tree).not.toHaveAttribute('aria-multiselectable');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('src')).toHaveAttribute('aria-level', '1');
    expect(item('src')).toHaveAttribute('data-expanded');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'false');
    expect(item('docs')).toHaveAttribute('data-collapsed');
    // A leaf neither opens nor closes.
    expect(item('README.md')).not.toHaveAttribute('aria-expanded');
    expect(item('README.md')).not.toHaveAttribute('data-expanded');
    expect(item('README.md')).not.toHaveAttribute('data-collapsed');
    expect(item('index.ts')).toHaveAttribute('aria-level', '2');
    expect(item('index.ts').parentElement).toHaveAttribute('role', 'group');
    expect(item('components')).toHaveAttribute('aria-selected', 'false');
    expect(item('locked.ts')).toHaveAttribute('aria-disabled', 'true');
  });

  it('re-renders without defaults and reports no changed default', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Files />);
    await userEvent.click(screen.getByText('src'));
    expect(error).not.toHaveBeenCalledWith(expect.stringContaining('cannot change the default'));
    error.mockRestore();
  });

  it('renders the children of an open Item only', () => {
    render(<Files />);
    expect(queryItem('index.ts')).toBeNull();
    expect(item('src').querySelector('[role="group"]')).toBeNull();
  });

  it('is one Tab stop, on the first Item, and keeps it where focus last was', async () => {
    render(<Files defaultExpanded={['src']} />);
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(focused()).toBe(item('src'));
    await userEvent.tab();
    expect(focused()).toBe(screen.getByRole('button', { name: 'After' }));
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(item('index.ts'));
    await userEvent.tab();
    await userEvent.tab({ shift: true });
    expect(focused()).toBe(item('index.ts'));
  });

  it('starts the Tab stop at the selected Item when it is shown', async () => {
    render(<Files defaultExpanded={['src']} defaultValue={['main']} />);
    await userEvent.click(screen.getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(focused()).toBe(item('main.ts'));
  });

  it('moves down and up through the Items shown, skipping disabled ones, without wrapping', async () => {
    render(<Files defaultExpanded={['src']} />);
    item('src').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe(item('src'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(item('main.ts'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(focused()).toBe(item('README.md'));
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(focused()).toBe(item('main.ts'));
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe(item('src'));
    await userEvent.keyboard('{End}');
    expect(focused()).toBe(item('README.md'));
  });

  it('opens with Right, then moves into the children; Left closes, then moves to the parent', async () => {
    const onExpandedChange = vi.fn();
    render(<Files onExpandedChange={onExpandedChange} />);
    item('src').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['src']);
    expect(focused()).toBe(item('src'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(item('components'));
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(focused()).toBe(item('Button.tsx'));
    // On a leaf, Right does nothing.
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(item('Button.tsx'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(item('components'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(item('components')).toHaveAttribute('aria-expanded', 'false');
    expect(queryItem('Button.tsx')).toBeNull();
    expect(focused()).toBe(item('components'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe(item('src'));
    // At the top level, closed, Left does nothing.
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(focused()).toBe(item('src'));
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
  });

  it('swaps Left and Right in a right-to-left tree', async () => {
    render(<Files dir="rtl" />);
    item('src').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(focused()).toBe(item('components'));
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe(item('src'));
  });

  it('opens every parent beside the focused Item with *', async () => {
    render(<Files defaultExpanded={['src']} />);
    item('index.ts').focus();
    await userEvent.keyboard('*');
    // Only its siblings: components opens, docs — a level up — stays closed.
    expect(item('components')).toHaveAttribute('aria-expanded', 'true');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'false');
    expect(focused()).toBe(item('index.ts'));
    item('src').focus();
    await userEvent.keyboard('*');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves to the next Item starting with what is typed, among those shown', async () => {
    render(<Files defaultExpanded={['src']} />);
    item('src').focus();
    await userEvent.keyboard('m');
    expect(focused()).toBe(item('main.ts'));
    // Past the timeout, a new search.
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard('r');
    expect(focused()).toBe(item('README.md'));
    await new Promise((resolve) => setTimeout(resolve, 600));
    // A disabled Item is skipped: "l" matches only locked.ts.
    await userEvent.keyboard('l');
    expect(focused()).toBe(item('README.md'));
  });

  it('selects one Item with Enter, Space or a click, and Enter or a click also opens a parent', async () => {
    const onValueChange = vi.fn();
    render(<Files onValueChange={onValueChange} />);
    item('README.md').focus();
    await userEvent.keyboard(' ');
    expect(item('README.md')).toHaveAttribute('aria-selected', 'true');
    expect(item('README.md')).toHaveAttribute('data-selected');
    expect(onValueChange).toHaveBeenLastCalledWith(['readme']);
    // Space does not open a parent.
    item('docs').focus();
    await userEvent.keyboard(' ');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'false');
    expect(item('docs')).toHaveAttribute('aria-selected', 'true');
    expect(item('README.md')).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'true');
    // Selecting the selected Item again keeps it.
    expect(item('docs')).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).toHaveBeenCalledTimes(2);
    await userEvent.click(screen.getByText('src'));
    expect(focused()).toBe(item('src'));
    expect(item('src')).toHaveAttribute('aria-selected', 'true');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByText('src'));
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith(['src']);
  });

  it('a click on a child selects the child alone, not the Item around it', async () => {
    render(<Files defaultExpanded={['src']} />);
    await userEvent.click(screen.getByText('index.ts'));
    expect(item('index.ts')).toHaveAttribute('aria-selected', 'true');
    expect(item('src')).toHaveAttribute('aria-selected', 'false');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
  });

  it('a disabled Item cannot be selected or focused, by a click either', async () => {
    const onValueChange = vi.fn();
    render(<Files defaultExpanded={['src']} onValueChange={onValueChange} />);
    expect(item('locked.ts')).not.toHaveAttribute('tabindex');
    await userEvent.click(screen.getByText('locked.ts'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(focused()).not.toBe(item('src'));
    expect(item('locked.ts')).toHaveAttribute('data-disabled');
  });

  it('with multiple, toggles Items, Shift with an arrow toggles the next, Ctrl+A selects all shown', async () => {
    const onValueChange = vi.fn();
    render(<Files multiple defaultExpanded={['src']} onValueChange={onValueChange} />);
    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    item('index.ts').focus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(focused()).toBe(item('main.ts'));
    expect(onValueChange).toHaveBeenLastCalledWith(['index', 'main']);
    await userEvent.click(screen.getByText('index.ts'));
    expect(onValueChange).toHaveBeenLastCalledWith(['main']);
    await userEvent.keyboard('{Control>}a{/Control}');
    // Every Item shown and enabled: not locked.ts, nor the closed components' children.
    expect(onValueChange).toHaveBeenLastCalledWith([
      'src',
      'components',
      'index',
      'main',
      'docs',
      'readme',
    ]);
  });

  it('without multiple, Ctrl+A and Shift with an arrow select nothing', async () => {
    const onValueChange = vi.fn();
    render(<Files defaultExpanded={['src']} onValueChange={onValueChange} />);
    item('index.ts').focus();
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}{Control>}a{/Control}');
    expect(focused()).toBe(item('main.ts'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('follows a controlled value and expanded', async () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>(['intro']);
      const [expanded, setExpanded] = useState<string[]>(['docs']);
      return (
        <>
          <Files
            value={value}
            onValueChange={setValue}
            expanded={expanded}
            onExpandedChange={setExpanded}
          />
          <output data-testid="state">{`${value} | ${expanded}`}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(item('intro.md')).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByText('src'));
    expect(screen.getByTestId('state')).toHaveTextContent('src | docs,src');
    expect(item('index.ts')).toBeInTheDocument();
  });

  it('keeps a key from a widget inside a label to that widget', async () => {
    const onValueChange = vi.fn();
    render(
      <TreeView.Root aria-label="Files" onValueChange={onValueChange}>
        <TreeView.Item
          value="a"
          label={
            <>
              a <input aria-label="Rename" />
            </>
          }
        />
        <TreeView.Item value="b" label="b" />
      </TreeView.Root>,
    );
    await userEvent.click(screen.getByRole('textbox', { name: 'Rename' }));
    await userEvent.keyboard('b {ArrowDown}');
    expect(focused()).toBe(screen.getByRole('textbox', { name: 'Rename' }));
    expect(screen.getByRole('textbox')).toHaveValue('b ');
  });

  it('names an Item from its label, and matches typeahead on textValue', async () => {
    function Label({ name }: { name: string }) {
      return <span>{name}</span>;
    }
    render(
      <TreeView.Root aria-label="Files">
        <TreeView.Item value="a" label="Alpha" />
        <TreeView.Item value="z" label={<Label name="Zulu" />} textValue="Zulu" />
      </TreeView.Root>,
    );
    item('Alpha').focus();
    await userEvent.keyboard('z');
    expect(focused()).toBe(item('Zulu'));
  });
});
