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

export type ToastViewportUiProps = ToastViewportProps & {
  /** Accessible name of each toast's close button. */
  closeLabel?: string;
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
 * The corner the toasts stack in. Without children it renders each toast itself — title,
 * description, an `action` if given, and a close button; pass a function of the toasts to lay
 * them out yourself with the other parts.
 */
export function ToastViewport({
  className,
  children,
  closeLabel = 'Dismiss',
  ...props
}: ToastViewportUiProps) {
  return (
    <Headless.Viewport {...props} className={cn('toast-viewport', className)}>
      {children ??
        ((toasts) =>
          toasts.map((toast) => (
            <DefaultToast key={toast.id} toast={toast} closeLabel={closeLabel} />
          )))}
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
