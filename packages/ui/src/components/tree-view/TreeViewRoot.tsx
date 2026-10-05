import { TreeView as Headless } from '@arun-dev/headless/tree-view';
import type { TreeViewRootProps } from '@arun-dev/headless/tree-view';
import { cn } from '../../lib/cn';

/** The tree. Selection, opening and the keyboard all come from @arun-dev/headless. */
export function TreeViewRoot({ className, ...props }: TreeViewRootProps) {
  return <Headless.Root {...props} className={cn('tree-view', className)} />;
}
