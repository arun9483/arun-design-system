import { useMenuRootValue, type MenuRootProps } from '../menu/MenuRoot';
import { MenuRootContext } from '../menu/MenuRootContext';
import { useMenubarContext } from './MenubarContext';

export type MenubarMenuProps = MenuRootProps;

/**
 * One menu of the bar: its state, shared with its Trigger, Popup and items, as a Menu's Root
 * shares it. Renders no element of its own.
 */
export function MenubarMenu({ children, ...props }: MenubarMenuProps) {
  useMenubarContext('Menu');
  const context = useMenuRootValue('Menubar.Menu', props, null);
  return <MenuRootContext.Provider value={context}>{children}</MenuRootContext.Provider>;
}
