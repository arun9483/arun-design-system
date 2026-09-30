import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactElement,
  Ref,
} from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuRootContext } from './MenuRootContext';
import { menuDataAttributes } from './menuDataAttributes';

type MenuTriggerOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuTriggerProps = MenuTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenuTriggerOwnProps>;

/**
 * The menu button. A native `<button>`, so a click, Enter and Space open the menu at its
 * first item with no key handling here; Down does the same, and Up opens it at the last.
 * It is what the popup is anchored to, and names it: the popup is `aria-labelledby` it.
 */
export function MenuTrigger({ className, children, render, ...rest }: MenuTriggerProps) {
  const { open, setOpen, focusOnOpenRef, triggerId, popupId, anchorName, triggerRef } =
    useMenuRootContext('Trigger');

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      id: triggerId,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': popupId,
      ...menuDataAttributes({ open }),
      style: { anchorName },
      className,
      children,
      ref: triggerRef,
      onClick() {
        focusOnOpenRef.current = 'first';
        setOpen(!open);
      },
      onKeyDown(event: ReactKeyboardEvent) {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        focusOnOpenRef.current = event.key === 'ArrowUp' ? 'last' : 'first';
        setOpen(true);
      },
    },
    consumerProps: rest as UnknownProps,
  });
}
