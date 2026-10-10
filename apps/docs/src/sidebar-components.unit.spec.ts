import { describe, it, expect } from 'vitest';
import { COMPONENT_GROUPS, componentSidebar } from './sidebar-components.mjs';

// Every component page, by file name, found from the folder rather than listed again here.
const pages = Object.keys(import.meta.glob('./content/docs/components/*.{md,mdx}'))
  .map((path) => path.replace(/^.*\/|\.mdx?$/g, ''))
  .sort();

describe('Components sidebar', () => {
  const grouped = COMPONENT_GROUPS.flatMap((group) => group.pages);

  it('puts every component page in a group', () => {
    expect(pages.filter((page) => !grouped.includes(page))).toEqual([]);
  });

  it('lists no page twice, and none that does not exist', () => {
    expect(grouped.filter((page, i) => grouped.indexOf(page) !== i)).toEqual([]);
    expect(grouped.filter((page) => !pages.includes(page))).toEqual([]);
  });

  it('keeps the pages of each group in A–Z order', () => {
    for (const { items } of componentSidebar()) {
      expect(items).toEqual([...items].sort((a, b) => a.localeCompare(b)));
    }
  });
});
