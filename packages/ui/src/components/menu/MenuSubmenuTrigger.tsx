import { Menu as Headless } from '@arun-dev/headless/menu';
import type { MenuSubmenuTriggerProps } from '@arun-dev/headless/menu';
import { cn } from '../../lib/cn';

/**
 * An item that opens a submenu, with a chevron at the end pointing where the submenu opens —
 * mirrored in a right-to-left menu by `menu.css`. The label is wrapped in a span that grows to
 * push the chevron to the end: a growing box, not an auto margin, which a `* { margin: 0 }`
 * reset in a later layer — Starlight's, Tailwind's preflight — would undo.
 */
export function MenuSubmenuTrigger({ className, children, ...props }: MenuSubmenuTriggerProps) {
  return (
    <Headless.SubmenuTrigger {...props} className={cn('menu-item', className)}>
      <span className="menu-submenu-label">{children}</span>
      <svg className="menu-submenu-chevron" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M6 3.5 10.5 8 6 12.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Headless.SubmenuTrigger>
  );
}
