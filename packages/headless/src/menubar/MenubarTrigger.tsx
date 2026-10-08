import { useCallback, useLayoutEffect, useMemo } from 'react';
import type {
  ComponentPropsWithRef,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  Ref,
} from 'react';
import { textOf } from '../core/typeahead';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { menuDataAttributes } from '../menu/menuDataAttributes';
import { useMenuRootContext, type MenuFocusOnOpen } from '../menu/MenuRootContext';
import { useMenubarContext } from './MenubarContext';

type MenubarTriggerOwnProps = {
  /** Element to render instead of the default `<button>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type MenubarTriggerProps = MenubarTriggerOwnProps &
  Omit<ComponentPropsWithRef<'button'>, keyof MenubarTriggerOwnProps>;

/**
 * A bar item: the `<button role="menuitem">` that opens its menu, anchors it and names it. Part of
 * the bar's single Tab stop. A click, Enter, Space and ↓ open the menu at its first item, ↑ at its
 * last; on a vertical bar → (← in a right-to-left bar) opens it instead of ↓ and ↑.
 *
 * With the Root's `focusableWhenDisabled`, a disabled Trigger stays reachable and `aria-disabled`,
 * and opens nothing — the consumer's `onClick` included, as a native `disabled` would.
 */
export function MenubarTrigger({
  className,
  children,
  render,
  disabled = false,
  ...rest
}: MenubarTriggerProps) {
  const bar = useMenubarContext('Trigger');
  const {
    open,
    setOpen,
    focusOnOpenRef,
    triggerId,
    popupId,
    anchorName,
    triggerRef,
    navigableItems,
  } = useMenuRootContext('Trigger');

  const show = useCallback(
    (focus: MenuFocusOnOpen) => {
      focusOnOpenRef.current = focus;
      setOpen(true);
    },
    [focusOnOpenRef, setOpen],
  );
  const hide = useCallback(() => setOpen(false), [setOpen]);
  const textValue = textOf(children);
  const entry = useMemo(
    () => ({ ref: triggerRef, disabled, textValue, open, show, hide }),
    [triggerRef, disabled, textValue, open, show, hide],
  );
  const { register } = bar;
  useLayoutEffect(() => register(entry), [register, entry]);

  // Opens the menu with focus on an item — or, already open, moves focus into it.
  const openAt = (focus: 'first' | 'last') => {
    if (!open) {
      show(focus);
      return;
    }
    const item = focus === 'first' ? navigableItems[0] : navigableItems.at(-1);
    item?.ref.current?.focus();
  };

  const ariaDisabled = bar.focusableWhenDisabled && disabled;

  return useRender({
    render,
    defaultTagName: 'button',
    props: {
      type: 'button',
      id: triggerId,
      role: 'menuitem',
      tabIndex: bar.isTabStop(triggerRef) ? 0 : -1,
      disabled: (disabled && !ariaDisabled) || undefined,
      'aria-disabled': ariaDisabled || undefined,
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': popupId,
      ...menuDataAttributes({ open }),
      'data-disabled': disabled ? '' : undefined,
      style: { anchorName },
      className,
      children,
      ref: triggerRef,
      onClick() {
        if (disabled) return;
        focusOnOpenRef.current = 'first';
        setOpen(!open);
      },
      onFocus() {
        bar.setTabStop(triggerRef);
      },
      onPointerEnter(event: ReactPointerEvent) {
        if (event.pointerType === 'mouse') bar.onTriggerPointerEnter(triggerRef);
      },
      onKeyDown(event: ReactKeyboardEvent) {
        if (bar.onTriggerKeyDown(event, triggerRef) || disabled) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const [first, last] =
          bar.orientation === 'vertical'
            ? [rtl ? 'ArrowLeft' : 'ArrowRight', null]
            : ['ArrowDown', 'ArrowUp'];
        if (event.key !== first && event.key !== last) return;
        event.preventDefault();
        openAt(event.key === first ? 'first' : 'last');
      },
    },
    consumerProps: (ariaDisabled ? { ...rest, onClick: undefined } : rest) as UnknownProps,
  });
}
