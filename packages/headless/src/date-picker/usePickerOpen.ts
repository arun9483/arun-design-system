'use client';

import { useCallback, useState } from 'react';
import { useControlled } from '../core/useControlled';

/** The Popup's open state, and a count of opens the Calendar restarts on. */
export function usePickerOpen({
  open: openProp,
  defaultOpen,
  onOpenChange,
  onOpen,
  name,
}: {
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
  onOpen: () => void;
  name: string;
}) {
  const [open, setOpenState] = useControlled({
    controlled: openProp,
    default: defaultOpen ?? false,
    name,
    state: 'open',
  });
  const [openCount, setOpenCount] = useState(0);
  const setOpen = useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (next) {
        onOpen();
        setOpenCount((count) => count + 1);
      }
      setOpenState(next);
      onOpenChange?.(next);
    },
    [open, onOpen, setOpenState, onOpenChange],
  );
  return { open, setOpen, openCount };
}
