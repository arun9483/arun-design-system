'use client';

import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { mergeProps, type ComponentEvent } from '../core/mergeProps';
import { MenuPopup, type MenuPopupProps } from '../menu/MenuPopup';
import { useMenuRootContext } from '../menu/MenuRootContext';
import { useMenubarContext } from './MenubarContext';

export type MenubarPopupProps = MenuPopupProps;

/**
 * A menu of the bar, or a submenu in one: Menu's Popup (decision 29), with the bar's keys in
 * front of its own. In a horizontal bar → and ← move to the next and previous menu and open it
 * — after a SubmenuTrigger's →, and a submenu's ←, which come first. In a vertical bar the menus
 * open to the side (`side="right"` by default), and ← (→ right-to-left) closes one back to its
 * Trigger.
 */
export function MenubarPopup({ side, onKeyDown, ...rest }: MenubarPopupProps) {
  const bar = useMenubarContext('Popup');
  const { parent, triggerRef, setOpen } = useMenuRootContext('Popup');
  // The bar item is the Trigger of the outermost menu.
  let outermost = parent;
  while (outermost?.parent) outermost = outermost.parent;
  const barTriggerRef = outermost ? outermost.triggerRef : triggerRef;

  function onBarKeyDown(event: ComponentEvent<ReactKeyboardEvent<HTMLElement>>) {
    // Already taken: a SubmenuTrigger's →, a submenu's ←, or a key a nested menu handled.
    if (event.defaultPrevented) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (bar.orientation === 'horizontal') {
      const step = event.key === forward ? 1 : event.key === back && !parent ? -1 : 0;
      if (step === 0 || !bar.moveFromMenu(barTriggerRef, step)) return;
    } else {
      if (parent || event.key !== back) return;
      // Back toward the bar: the platform returns focus to the Trigger, the invoker.
      setOpen(false);
    }
    event.preventDefault();
    event.preventComponentHandler();
  }

  const handlers = mergeProps({ onKeyDown: onBarKeyDown }, { onKeyDown });
  return (
    <MenuPopup
      side={side ?? (!parent && bar.orientation === 'vertical' ? 'right' : undefined)}
      {...rest}
      onKeyDown={handlers.onKeyDown as MenuPopupProps['onKeyDown']}
    />
  );
}
