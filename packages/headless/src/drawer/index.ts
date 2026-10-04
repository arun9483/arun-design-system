export * as Drawer from './index.parts';
// Root, Trigger, Title and Close are Dialog's parts; their props types stay Dialog's, so they
// are not re-exported under a second name here (decision 6). Derive them with
// ComponentProps<typeof Drawer.Root>.
export type { DrawerPopupProps, DrawerSide } from './DrawerPopup';
