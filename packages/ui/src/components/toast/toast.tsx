import { Toast as Headless } from '@arun-dev/headless/toast';
import type {
  ToastViewportProps,
  ToastRootProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionProps,
  ToastCloseProps,
  ToastObject,
} from '@arun-dev/headless/toast';
import { cn } from '../../lib/cn';

/** A corner of the window, or the middle of its top or bottom edge. */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToastViewportUiProps = ToastViewportProps & {
  /** Accessible name of each toast's close button. */
  closeLabel?: string;
  /**
   * Where toasts show, unless a toast sets its own `position` when added. Defaults to
   * `'bottom-right'`.
   */
  position?: ToastPosition;
};

/** The default rendering of one toast: its title, description, action and a close button. */
function DefaultToast({ toast, closeLabel }: { toast: ToastObject; closeLabel: string }) {
  return (
    <ToastRoot toast={toast}>
      {toast.title != null && <ToastTitle />}
      {toast.description != null && <ToastDescription />}
      {toast.action && (
        <ToastAction onClick={toast.action.onClick}>{toast.action.label}</ToastAction>
      )}
      <ToastClose aria-label={closeLabel} />
    </ToastRoot>
  );
}

/**
 * Where the toasts stack: `position`, a corner by default. Without children it renders each
 * toast itself — title, description, an `action` if given, and a close button; pass a function
 * of the toasts to lay them out yourself with the other parts.
 *
 * A toast added with its own `position` shows there instead, in a stack of its own. The stack
 * stays inside the Viewport's element, so it is still in the Notifications region: F6-style
 * focus, pausing on hover and the live announcements cover it too.
 */
export function ToastViewport({
  className,
  children,
  closeLabel = 'Dismiss',
  position = 'bottom-right',
  ...props
}: ToastViewportUiProps) {
  const renderToasts = (toasts: readonly ToastObject[]) =>
    toasts.map((toast) => <DefaultToast key={toast.id} toast={toast} closeLabel={closeLabel} />);

  return (
    <Headless.Viewport
      {...props}
      className={cn('toast-viewport', `toast-position-${position}`, className)}
    >
      {children ??
        ((toasts) => {
          const stacks = new Map<string, ToastObject[]>();
          for (const toast of toasts) {
            const at = toast.position ?? position;
            stacks.set(at, [...(stacks.get(at) ?? []), toast]);
          }
          return [...stacks].map(([at, list]) =>
            at === position ? (
              renderToasts(list)
            ) : (
              <div key={at} className={`toast-stack toast-position-${at}`}>
                {renderToasts(list)}
              </div>
            ),
          );
        })}
    </Headless.Viewport>
  );
}

export function ToastRoot({ className, ...props }: ToastRootProps) {
  return <Headless.Root {...props} className={cn('toast', className)} />;
}

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return <Headless.Title {...props} className={cn('toast-title', className)} />;
}

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return <Headless.Description {...props} className={cn('toast-description', className)} />;
}

export function ToastAction({ className, ...props }: ToastActionProps) {
  return <Headless.Action {...props} className={cn('toast-action', className)} />;
}

/** The close button; an × unless given children. */
export function ToastClose({ className, children, ...props }: ToastCloseProps) {
  return (
    <Headless.Close {...props} className={cn('toast-close', className)}>
      {children ?? (
        <svg viewBox="0 0 16 16" aria-hidden>
          <path d="m4.5 4.5 7 7m-7 0 7-7" />
        </svg>
      )}
    </Headless.Close>
  );
}
