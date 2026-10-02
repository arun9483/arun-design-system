import { Avatar as Headless } from '@arun-dev/headless/avatar';
import type {
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
} from '@arun-dev/headless/avatar';
import { cn } from '../../lib/cn';

/** A round picture, sized by `--avatar-size`. */
export function AvatarRoot({ className, ...props }: AvatarRootProps) {
  return <Headless.Root {...props} className={cn('avatar', className)} />;
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <Headless.Image {...props} className={cn('avatar-image', className)} />;
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return <Headless.Fallback {...props} className={cn('avatar-fallback', className)} />;
}
