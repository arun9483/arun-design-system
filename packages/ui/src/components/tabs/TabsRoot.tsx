import { Tabs as Headless } from '@arun-dev/headless/tabs';
import type { TabsRootProps as HeadlessTabsRootProps } from '@arun-dev/headless/tabs';
import { cn } from '../../lib/cn';

type TabsRootProps = HeadlessTabsRootProps & {
  /**
   * Which side of the panels the list sits on, along the axis `orientation` sets: `start` is
   * above (horizontal) or before (vertical); `end` is below or after. Logical, so `end` swaps
   * sides in a right-to-left layout.
   */
  position?: 'start' | 'end';
};

/**
 * Styling only: selection, keyboard and ARIA all come from @arun-dev/headless. `position` is
 * layout, which needs no JavaScript (decision 7), so it is a class here and headless never
 * hears of it. The list stays first in the DOM either way.
 */
export function TabsRoot({ position = 'start', className, ...props }: TabsRootProps) {
  return (
    <Headless.Root
      {...props}
      className={cn('tabs', position === 'end' && 'tabs-position-end', className)}
    />
  );
}
