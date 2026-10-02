import { Toolbar as Headless } from '@arun-dev/headless/toolbar';
import type {
  ToolbarRootProps,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarInputProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
} from '@arun-dev/headless/toolbar';
import { cn } from '../../lib/cn';

export function ToolbarRoot({ className, ...props }: ToolbarRootProps) {
  return <Headless.Root {...props} className={cn('toolbar', className)} />;
}

export function ToolbarButton({ className, ...props }: ToolbarButtonProps) {
  return <Headless.Button {...props} className={cn('toolbar-button', className)} />;
}

export function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  return <Headless.Link {...props} className={cn('toolbar-link', className)} />;
}

export function ToolbarInput({ className, ...props }: ToolbarInputProps) {
  return <Headless.Input {...props} className={cn('toolbar-input', className)} />;
}

export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <Headless.Group {...props} className={cn('toolbar-group', className)} />;
}

export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return <Headless.Separator {...props} className={cn('toolbar-separator', className)} />;
}
