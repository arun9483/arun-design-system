import type { ComponentPropsWithRef, ReactElement, Ref } from 'react';
import { createContext, useContext } from 'react';
import { useRender } from '../core/useRender';
import type { UnknownProps } from '../core/mergeProps';
import { RovingGroupContext, useRovingGroup } from '../core/rovingGroup';
import type { Orientation } from '../core/rovingFocus';

/** The Toolbar's orientation, for its Separators. */
export const ToolbarContext = createContext<{ orientation: Orientation } | null>(null);

export function useToolbarContext(part: string) {
  const context = useContext(ToolbarContext);
  if (!context) throw new Error(`<Toolbar.${part}> must be rendered inside <Toolbar.Root>.`);
  return context;
}

type ToolbarRootOwnProps = {
  /** Which arrow keys move between items. */
  orientation?: Orientation;
  /** Element to render instead of the default `<div>`. Props and ref are merged onto it. */
  render?: ReactElement;
  /** Ref to the rendered element. Merged with any ref on the `render` element. */
  ref?: Ref<HTMLElement>;
};

export type ToolbarRootProps = ToolbarRootOwnProps &
  Omit<ComponentPropsWithRef<'div'>, keyof ToolbarRootOwnProps>;

/**
 * A row of controls (decision 17): `role="toolbar"`, one Tab stop, and the arrow keys across its
 * Buttons, Links, Inputs and Toggles — a ToggleGroup inside joins in. A text Input keeps the arrow
 * keys for its caret until the caret reaches an end. Name it with `aria-label`.
 */
export function ToolbarRoot({
  orientation = 'horizontal',
  className,
  children,
  render,
  ...rest
}: ToolbarRootProps) {
  const roving = useRovingGroup({ orientation });
  const element = useRender({
    render,
    defaultTagName: 'div',
    props: {
      role: 'toolbar',
      'aria-orientation': orientation,
      'data-orientation': orientation,
      className,
      children,
      onKeyDown: roving.onKeyDown,
    },
    consumerProps: rest as UnknownProps,
  });
  return (
    <ToolbarContext.Provider value={{ orientation }}>
      <RovingGroupContext.Provider value={roving.context}>{element}</RovingGroupContext.Provider>
    </ToolbarContext.Provider>
  );
}
