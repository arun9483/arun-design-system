'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastObject, ToastOptions } from './ToastContext';

export type ToastProviderProps = {
  /** How many show at once. The rest wait, their timers stopped, and show as others close. */
  limit?: number;
  /** Milliseconds a toast stays, unless it sets its own. `0` keeps toasts until closed. */
  timeout?: number;
  children?: ReactNode;
};

/**
 * Holds the toasts (decision 16). Put it near the root, with one `Toast.Viewport` inside, and
 * call `useToastManager()` anywhere below to show one.
 */
export function ToastProvider({ limit = 3, timeout = 5000, children }: ToastProviderProps) {
  const [all, setAll] = useState<ToastObject[]>([]);
  const prefix = useId();
  const counter = useRef(0);
  // onClose of each toast, called once when it leaves.
  const closedRef = useRef(new Set<string>());

  const add = useCallback(
    <Data,>(options: ToastOptions<Data>) => {
      const id = options.id ?? `${prefix}-${++counter.current}`;
      const toast: ToastObject = {
        ...(options as ToastOptions),
        id,
        timeout: options.timeout ?? timeout,
        priority: options.priority ?? 'low',
      };
      closedRef.current.delete(id);
      setAll((current) => [...current.filter((t) => t.id !== id), toast]);
      return id;
    },
    [prefix, timeout],
  );

  const update = useCallback(<Data,>(id: string, patch: Partial<ToastOptions<Data>>) => {
    setAll((current) =>
      current.map((t) => (t.id === id ? ({ ...t, ...patch, id } as ToastObject) : t)),
    );
  }, []);

  const close = useCallback((id: string) => {
    setAll((current) => {
      const toast = current.find((t) => t.id === id);
      if (toast && !closedRef.current.has(id)) {
        closedRef.current.add(id);
        queueMicrotask(() => toast.onClose?.());
      }
      return current.filter((t) => t.id !== id);
    });
  }, []);

  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.visibilityState === 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const viewportRef = useRef<HTMLElement | null>(null);
  const toasts = useMemo(() => all.slice(-limit), [all, limit]);

  const context = useMemo(
    () => ({
      toasts,
      add,
      update,
      close,
      paused: pointerInside || focusInside || pageHidden,
      setPointerInside,
      setFocusInside,
      viewportRef,
    }),
    [toasts, add, update, close, pointerInside, focusInside, pageHidden],
  );

  return <ToastContext.Provider value={context}>{children}</ToastContext.Provider>;
}
