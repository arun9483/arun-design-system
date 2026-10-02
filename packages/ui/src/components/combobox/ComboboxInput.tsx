import type React from 'react';
import { Combobox as Headless } from '@arun-dev/headless/combobox';
import type { ComboboxInputProps as HeadlessInputProps } from '@arun-dev/headless/combobox';
import { Chip } from '../chip';
import { cn } from '../../lib/cn';

type ComboboxInputOwnProps = {
  /** Content before the chips and text, inside the box — a search icon. Mark it `aria-hidden`. */
  startSlot?: React.ReactNode;
  /** Accessible name of the Clear button. */
  clearLabel?: string;
  /** Accessible name of the chevron that opens the list. */
  triggerLabel?: string;
  /** Accessible name of a chip's remove button, from the item's label. */
  removeLabel?: (label: string) => string;
  /**
   * Classes for the box that frames the chips, the text and the buttons — size it, place it.
   * Every other prop goes to the `<input>` itself.
   */
  className?: string;
};

export type ComboboxInputProps = ComboboxInputOwnProps &
  Omit<HeadlessInputProps, keyof ComboboxInputOwnProps>;

/**
 * The whole field, drawn as one box: a chip per selected item with `multiple`, the text, a
 * Clear button while something is selected, and a chevron that opens the list. The box is
 * what the list lines up with.
 *
 * Chips are `Chip`s. Each has a remove button, and Backspace and the arrow keys reach them
 * from the text, as @arun-dev/headless describes. A chip whose Item is `disabled` cannot be
 * removed, and has no remove button.
 */
export function ComboboxInput({
  startSlot,
  clearLabel = 'Clear',
  triggerLabel = 'Show options',
  removeLabel = (label) => `Remove ${label}`,
  className,
  ...rest
}: ComboboxInputProps) {
  return (
    <Headless.InputGroup className={cn('combobox', className)}>
      {startSlot != null && <span className="combobox-slot">{startSlot}</span>}
      <Headless.Value>
        {(value, { itemToString, isItemDisabled }) =>
          Array.isArray(value) &&
          value.map((item) => {
            const label = itemToString(item);
            // Selected and disabled: it stays, so it has no remove button and no hint.
            const locked = isItemDisabled(item);
            return (
              <Headless.Chip
                key={label}
                value={item}
                className="combobox-chip"
                aria-description={locked ? undefined : 'Press Backspace or Delete to remove'}
                render={
                  <Chip>
                    {label}
                    {!locked && (
                      <Headless.ChipRemove
                        className="combobox-chip-remove"
                        aria-label={removeLabel(label)}
                      >
                        <svg viewBox="0 0 16 16" aria-hidden>
                          <path d="m5 5 6 6m-6 0 6-6" />
                        </svg>
                      </Headless.ChipRemove>
                    )}
                  </Chip>
                }
              />
            );
          })
        }
      </Headless.Value>
      <Headless.Input {...rest} className="combobox-input" />
      <Headless.Clear className="combobox-button combobox-clear" aria-label={clearLabel}>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="m4.5 4.5 7 7m-7 0 7-7" />
        </svg>
      </Headless.Clear>
      <Headless.Trigger className="combobox-button combobox-trigger" aria-label={triggerLabel}>
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="m4 6 4 4 4-4" />
        </svg>
      </Headless.Trigger>
    </Headless.InputGroup>
  );
}
