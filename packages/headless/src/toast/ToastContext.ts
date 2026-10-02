import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/** `'high'` is announced at once (`role="alert"`); `'low'`, the default, when the reader is idle. */
export type ToastPriority = 'low' | 'high';

/** What `add` takes. Everything is optional but something to show. */
export type ToastOptions<Data = unknown> = {
  /** Reuse an id to replace a toast of the same id. Generated otherwise. */
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Your kind of toast — `"success"`, `"error"` — emitted as `data-type` for styling. */
  type?: string;
  /** Milliseconds before it closes on its own. `0` keeps it until closed. Defaults to the Provider's. */
  timeout?: number;
  priority?: ToastPriority;
  /** A button on the toast, for the ui's default rendering. The headless `Action` part is yours to place. */
  action?: { label: ReactNode; onClick: () => void };
  /** Called once it closes, however it closed. */
  onClose?: () => void;
  /** Anything else your rendering needs. */
  data?: Data;
};

export type ToastObject<Data = unknown> = ToastOptions<Data> & {
  id: string;
  timeout: number;
  priority: ToastPriority;
};

export type ToastManager = {
  /** The toasts to render: the newest `limit`, oldest first. */
  toasts: readonly ToastObject[];
  /** Shows a toast and returns its id. */
  add: <Data = unknown>(options: ToastOptions<Data>) => string;
  /** Changes a shown toast — its text after a save finishes, say. A new `timeout` restarts it. */
  update: <Data = unknown>(id: string, patch: Partial<ToastOptions<Data>>) => void;
  /** Closes a toast. */
  close: (id: string) => void;
};

export type ToastContextValue = ToastManager & {
  /** Timers stop while the pointer or focus is in the Viewport, or the page is hidden. */
  paused: boolean;
  setPointerInside: (inside: boolean) => void;
  setFocusInside: (inside: boolean) => void;
  viewportRef: { current: HTMLElement | null };
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext(part: string): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error(`${part} must be used inside <Toast.Provider>.`);
  }
  return context;
}

/** Shows and closes toasts from anywhere under the Provider. */
export function useToastManager(): ToastManager {
  const { toasts, add, update, close } = useToastContext('useToastManager()');
  return { toasts, add, update, close };
}

/** The toast a part belongs to. */
export const ToastRootContext = createContext<ToastObject | null>(null);

export function useToastRootContext(part: string): ToastObject {
  const toast = useContext(ToastRootContext);
  if (toast === null) {
    throw new Error(`<Toast.${part}> must be rendered inside <Toast.Root>.`);
  }
  return toast;
}
