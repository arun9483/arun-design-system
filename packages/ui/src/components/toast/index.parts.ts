import { Toast as Headless } from '@arun-dev/headless/toast';

// The Provider holds the queue and renders nothing: it passes through.
export const Provider = Headless.Provider;
export {
  ToastViewport as Viewport,
  ToastRoot as Root,
  ToastTitle as Title,
  ToastDescription as Description,
  ToastAction as Action,
  ToastClose as Close,
} from './toast';
