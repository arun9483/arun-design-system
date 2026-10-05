/**
 * On an Item. Selected is a mutually exclusive pair, as on a Tab. Expanded is a pair only on a
 * parent Item: a leaf has neither, so `[data-expanded], [data-collapsed]` finds the parents.
 */
export function treeViewItemDataAttributes({
  selected,
  expanded,
  parentItem,
  disabled,
}: {
  selected: boolean;
  expanded: boolean;
  parentItem: boolean;
  disabled: boolean;
}) {
  return {
    'data-selected': selected ? '' : undefined,
    'data-unselected': selected ? undefined : '',
    'data-expanded': parentItem && expanded ? '' : undefined,
    'data-collapsed': parentItem && !expanded ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
  };
}
