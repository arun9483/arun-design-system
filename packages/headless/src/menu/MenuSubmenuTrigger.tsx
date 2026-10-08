import { useCallback, useEffect, useRef } from 'react';
import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
} from 'react';
import { graceArea } from '../core/pointerIntent';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { useMenuRootContext, type MenuFocusOnOpen } from './MenuRootContext';
import { menuDataAttributes } from './menuDataAttributes';
import { useMenuItem } from './useMenuItem';
import { useLatest } from '../core/useLatest';

/** How long the pointer rests on a SubmenuTrigger before its submenu opens. */
export const SUBMENU_OPEN_DELAY = 100;
/** How long the pointer may take to cross the grace area toward an open submenu. */
export const SUBMENU_GRACE_PERIOD = 300;

type MenuSubmenuTriggerOwnProps = {
  /**
   * Cannot open its submenu. Skipped by the arrow keys, unless the Root sets
   * `focusableWhenDisabled`.
   */
  disabled?: boolean;
  /** The text typeahead matches in the parent menu. Defaults to the text in `children`. */
  textValue?: string;
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenuSubmenuTriggerProps = MenuSubmenuTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenuSubmenuTriggerOwnProps>;

/**
 * The item that opens a submenu: a `menuitem` of the parent menu with `aria-haspopup="menu"`,
 * which the submenu is anchored to and named by. It registers with the parent, so the parent's
 * arrow keys and typeahead reach it.
 *
 * Enter, Space and → (← in a right-to-left menu) open the submenu at its first item. Resting the
 * pointer on it opens it without moving focus; moving to another item of the parent closes it,
 * unless the pointer is crossing toward the submenu.
 */
export function MenuSubmenuTrigger({
  disabled = false,
  textValue,
  onClick,
  className,
  children,
  render,
  ...rest
}: MenuSubmenuTriggerProps) {
  const submenu = useMenuRootContext('SubmenuTrigger');
  const { parent } = submenu;
  if (parent === null) {
    throw new Error('<Menu.SubmenuTrigger> must be rendered inside <Menu.SubmenuRoot>.');
  }
  const { itemProps, itemRef } = useMenuItem(
    'SubmenuTrigger',
    { disabled, textValue, children },
    parent,
  );
  const { openSubmenuRef, graceRef } = parent;
  const { open, setOpen, focusOnOpenRef, navigableItems, triggerRef, popupRef } = submenu;

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const openAt = (focus: MenuFocusOnOpen) => {
    if (disabled) return;
    focusOnOpenRef.current = focus;
    if (!open) setOpen(true);
    // Already open, from the pointer: the keyboard moves into it.
    else if (focus === 'first') navigableItems[0]?.ref.current?.focus();
  };

  // The timer calls the latest, so it reads this render's state, not the one that set it.
  const openAtRef = useLatest(openAt);

  // The element is both the parent's item and the submenu's anchor and invoker.
  const ref = useCallback(
    (element: HTMLElement | null) => {
      itemRef.current = element;
      triggerRef.current = element;
    },
    [itemRef, triggerRef],
  );

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      ...itemProps,
      id: submenu.triggerId,
      role: 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': submenu.popupId,
      ...menuDataAttributes({ open }),
      style: { anchorName: submenu.anchorName },
      className,
      children,
      ref,
      onClick(event: ReactMouseEvent) {
        // `detail` is 0 for Enter and Space: the keyboard moves into the submenu, a click does not.
        openAt(event.detail === 0 ? 'first' : 'none');
      },
      onKeyDown(event: ReactKeyboardEvent) {
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        if (event.key !== (rtl ? 'ArrowLeft' : 'ArrowRight')) return;
        event.preventDefault();
        openAt('first');
      },
      onPointerMove(event: ReactPointerEvent) {
        if (event.pointerType !== 'mouse' || disabled) return;
        // A sibling's submenu closes as this one is reached.
        const sibling = openSubmenuRef.current;
        if (sibling && sibling.triggerRef !== triggerRef) sibling.close();
        if (open || timerRef.current !== undefined) return;
        timerRef.current = setTimeout(() => {
          timerRef.current = undefined;
          openAtRef.current('none');
        }, SUBMENU_OPEN_DELAY);
      },
      onPointerLeave(event: ReactPointerEvent) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
        const popup = popupRef.current;
        if (!open || !popup) return;
        graceRef.current = {
          area: graceArea({ x: event.clientX, y: event.clientY }, popup.getBoundingClientRect()),
          until: performance.now() + SUBMENU_GRACE_PERIOD,
        };
      },
    },
    consumerProps: (disabled ? rest : { ...rest, onClick }) as UnknownProps,
  });
}
