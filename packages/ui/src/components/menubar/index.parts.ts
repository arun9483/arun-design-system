import { Menubar as Headless } from '@arun-dev/headless/menubar';

export { MenubarRoot as Root, MenubarTrigger as Trigger, MenubarPopup as Popup } from './menubar';
// Menu and SubmenuRoot render no element: they pass through.
export const Menu = Headless.Menu;
export const SubmenuRoot = Headless.SubmenuRoot;
// A menu's contents look the same in a bar: Menu's styled parts.
export { MenuItem as Item } from '../menu/MenuItem';
export { MenuCheckboxItem as CheckboxItem } from '../menu/MenuCheckboxItem';
export { MenuRadioItem as RadioItem } from '../menu/MenuRadioItem';
export { MenuItemIndicator as ItemIndicator } from '../menu/MenuItemIndicator';
export {
  MenuGroup as Group,
  MenuRadioGroup as RadioGroup,
  MenuGroupLabel as GroupLabel,
} from '../menu/MenuGroup';
export { MenuSubmenuTrigger as SubmenuTrigger } from '../menu/MenuSubmenuTrigger';
