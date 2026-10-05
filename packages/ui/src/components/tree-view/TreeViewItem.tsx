import { TreeView as Headless } from '@arun-dev/headless/tree-view';
import type { TreeViewItemProps } from '@arun-dev/headless/tree-view';
import { cn } from '../../lib/cn';

/**
 * One node, with a chevron before its label. Every Item draws one, hidden on a leaf, so the
 * labels of leaves and parents line up. It is aria-hidden: `aria-expanded` says the same.
 */
export function TreeViewItem({ className, label, ...props }: TreeViewItemProps) {
  return (
    <Headless.Item
      {...props}
      label={
        <>
          <svg className="tree-view-chevron" viewBox="0 0 16 16" aria-hidden>
            <path d="m6 4 4 4-4 4" />
          </svg>
          {label}
        </>
      }
      className={cn('tree-view-item', className)}
    />
  );
}
