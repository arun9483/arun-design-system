/**
 * Compile-time guard for the hand-written tables in props.ts.
 *
 * Every documented prop name must exist on the component's exported props type, so a
 * rename in the library fails `pnpm typecheck` here instead of quietly leaving the
 * documentation wrong. It asserts names, not descriptions — prose still needs a human.
 */
import type {
  BadgeProps,
  ButtonProps,
  CardProps,
  ChipProps,
  InputProps,
  OtpInputProps,
  TextareaProps,
  SelectProps,
} from '@arun-dev/ui';
import type { CheckboxIndicatorProps, CheckboxRootProps } from '@arun-dev/headless/checkbox';
import type { RadioGroupItemProps, RadioGroupRootProps } from '@arun-dev/headless/radio-group';
import type { SwitchRootProps, SwitchThumbProps } from '@arun-dev/headless/switch';
import type {
  DialogCloseProps,
  DialogPopupProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
} from '@arun-dev/headless/dialog';
import type {
  PopoverCloseProps,
  PopoverPopupProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from '@arun-dev/headless/popover';
import type {
  ComboboxGroupProps,
  ComboboxItemProps,
  ComboboxListProps,
  ComboboxPopupProps,
  ComboboxRootProps,
} from '@arun-dev/headless/combobox';
import type {
  MenuCheckboxItemProps,
  MenuItemProps,
  MenuPopupProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuRootProps,
  MenuSubmenuRootProps,
  MenuSubmenuTriggerProps,
  MenuTriggerProps,
} from '@arun-dev/headless/menu';
import type {
  TooltipPopupProps,
  TooltipRootProps,
  TooltipTriggerProps,
} from '@arun-dev/headless/tooltip';
import type { ComponentProps } from 'react';
import type {
  ComboboxInputProps,
  AccordionItemProps,
  AccordionRootProps,
  AlertRootProps,
  BreadcrumbRootProps,
  KbdProps,
  LinkProps,
  PaginationProps,
  TableHeadProps,
  TableRootProps,
  SkeletonProps,
  SpinnerProps,
  ToastViewportProps,
  MeterProps,
  ProgressProps,
  SeparatorProps,
  StackProps,
  HeadingProps,
  ParagraphProps,
  TextProps,
  GridProps,
  SliderProps,
  Tabs,
} from '@arun-dev/ui';
import type { FieldControlProps, FieldRootProps } from '@arun-dev/headless/field';
import type { DrawerPopupProps } from '@arun-dev/headless/drawer';
import type { ToastProviderProps } from '@arun-dev/headless/toast';
import type { ToggleProps } from '@arun-dev/headless/toggle';
import type { ToggleGroupProps } from '@arun-dev/headless/toggle-group';
import type { ToolbarRootProps } from '@arun-dev/headless/toolbar';
import type { AvatarFallbackProps } from '@arun-dev/headless/avatar';
import type { TabsListProps, TabsPanelProps, TabsTabProps } from '@arun-dev/headless/tabs';
import type { COMMON, PROPS } from './props';

type Documented<Key extends keyof typeof PROPS> = (typeof PROPS)[Key][number]['name'];

/** A prose row standing for the catch-all spread, not a prop name. */
type PseudoProp = '…rest';

/** Fails to compile if `Names` contains anything that is not a prop of `Props`. */
type OnlyRealProps<Names extends string, Props> = Exclude<
  Names,
  (keyof Props & string) | PseudoProp
>;

type Unknown =
  | OnlyRealProps<Documented<'Button'> | (typeof COMMON)[number]['name'], ButtonProps>
  | OnlyRealProps<Documented<'Card'>, CardProps>
  | OnlyRealProps<Documented<'Link'>, LinkProps>
  | OnlyRealProps<Documented<'Breadcrumb.Root'>, BreadcrumbRootProps>
  | OnlyRealProps<Documented<'Pagination'>, PaginationProps>
  | OnlyRealProps<Documented<'Table.Root'>, TableRootProps>
  | OnlyRealProps<Documented<'Table.Head'>, TableHeadProps>
  | OnlyRealProps<Documented<'Kbd'>, KbdProps>
  | OnlyRealProps<Documented<'Toggle'>, ToggleProps>
  | OnlyRealProps<Documented<'ToggleGroup'>, ToggleGroupProps>
  | OnlyRealProps<Documented<'Toolbar.Root'>, ToolbarRootProps>
  | OnlyRealProps<Documented<'Avatar.Fallback'>, AvatarFallbackProps>
  | OnlyRealProps<Documented<'Accordion.Root'>, AccordionRootProps>
  | OnlyRealProps<Documented<'Accordion.Item'>, AccordionItemProps>
  | OnlyRealProps<Documented<'Alert.Root'>, AlertRootProps>
  | OnlyRealProps<Documented<'Spinner'>, SpinnerProps>
  | OnlyRealProps<Documented<'Skeleton'>, SkeletonProps>
  | OnlyRealProps<Documented<'Toast.Provider'>, ToastProviderProps>
  | OnlyRealProps<Documented<'Toast.Viewport'>, ToastViewportProps>
  | OnlyRealProps<Documented<'Separator'>, SeparatorProps>
  | OnlyRealProps<Documented<'Stack'>, StackProps>
  | OnlyRealProps<Documented<'Heading'>, HeadingProps>
  | OnlyRealProps<Documented<'Paragraph'>, ParagraphProps>
  | OnlyRealProps<Documented<'Text'>, TextProps>
  | OnlyRealProps<Documented<'Grid'>, GridProps>
  | OnlyRealProps<Documented<'Progress'>, ProgressProps>
  | OnlyRealProps<Documented<'Meter'>, MeterProps>
  | OnlyRealProps<Documented<'Slider'>, SliderProps>
  | OnlyRealProps<Documented<'Field.Root'>, FieldRootProps>
  | OnlyRealProps<Documented<'Field.Control'>, FieldControlProps>
  | OnlyRealProps<Documented<'Chip'>, ChipProps>
  | OnlyRealProps<Documented<'Badge'>, BadgeProps>
  | OnlyRealProps<Documented<'Input'> | (typeof COMMON)[number]['name'], InputProps>
  | OnlyRealProps<Documented<'OtpInput'>, OtpInputProps>
  | OnlyRealProps<Documented<'Textarea'>, TextareaProps>
  | OnlyRealProps<Documented<'Select'> | (typeof COMMON)[number]['name'], SelectProps>
  | OnlyRealProps<Documented<'Checkbox.Root'>, CheckboxRootProps>
  | OnlyRealProps<Documented<'Checkbox.Indicator'>, CheckboxIndicatorProps>
  | OnlyRealProps<Documented<'RadioGroup.Root'>, RadioGroupRootProps>
  | OnlyRealProps<Documented<'RadioGroup.Item'>, RadioGroupItemProps>
  | OnlyRealProps<Documented<'Switch.Root'>, SwitchRootProps>
  | OnlyRealProps<Documented<'Switch.Thumb'>, SwitchThumbProps>
  | OnlyRealProps<Documented<'Dialog.Root'>, DialogRootProps>
  | OnlyRealProps<Documented<'Dialog.Popup'>, DialogPopupProps>
  | OnlyRealProps<Documented<'Dialog.Trigger'>, DialogTriggerProps>
  | OnlyRealProps<Documented<'Dialog.Title'>, DialogTitleProps>
  | OnlyRealProps<Documented<'Dialog.Close'>, DialogCloseProps>
  | OnlyRealProps<Documented<'Drawer.Popup'>, DrawerPopupProps>
  | OnlyRealProps<Documented<'Popover.Root'>, PopoverRootProps>
  | OnlyRealProps<Documented<'Popover.Popup'>, PopoverPopupProps>
  | OnlyRealProps<Documented<'Popover.Trigger'>, PopoverTriggerProps>
  | OnlyRealProps<Documented<'Popover.Close'>, PopoverCloseProps>
  | OnlyRealProps<Documented<'Combobox.Root'>, ComboboxRootProps<unknown, boolean>>
  | OnlyRealProps<
      Documented<'Combobox.Input'> | (typeof COMMON)[number]['name'],
      ComboboxInputProps
    >
  | OnlyRealProps<Documented<'Combobox.Popup'>, ComboboxPopupProps>
  | OnlyRealProps<Documented<'Combobox.List'>, ComboboxListProps>
  | OnlyRealProps<Documented<'Combobox.Item'>, ComboboxItemProps>
  | OnlyRealProps<Documented<'Combobox.Group'>, ComboboxGroupProps>
  | OnlyRealProps<Documented<'Menu.Root'>, MenuRootProps>
  | OnlyRealProps<Documented<'Menu.Popup'>, MenuPopupProps>
  | OnlyRealProps<Documented<'Menu.Trigger'>, MenuTriggerProps>
  | OnlyRealProps<Documented<'Menu.Item'>, MenuItemProps>
  | OnlyRealProps<Documented<'Menu.CheckboxItem'>, MenuCheckboxItemProps>
  | OnlyRealProps<Documented<'Menu.RadioGroup'>, MenuRadioGroupProps>
  | OnlyRealProps<Documented<'Menu.RadioItem'>, MenuRadioItemProps>
  | OnlyRealProps<Documented<'Menu.SubmenuRoot'>, MenuSubmenuRootProps>
  | OnlyRealProps<Documented<'Menu.SubmenuTrigger'>, MenuSubmenuTriggerProps>
  | OnlyRealProps<Documented<'Tooltip.Root'>, TooltipRootProps>
  | OnlyRealProps<Documented<'Tooltip.Popup'>, TooltipPopupProps>
  | OnlyRealProps<Documented<'Tooltip.Trigger'>, TooltipTriggerProps>
  | OnlyRealProps<Documented<'Tabs.Root'>, ComponentProps<typeof Tabs.Root>>
  | OnlyRealProps<Documented<'Tabs.List'>, TabsListProps>
  | OnlyRealProps<Documented<'Tabs.Tab'>, TabsTabProps>
  | OnlyRealProps<Documented<'Tabs.Panel'>, TabsPanelProps>;

/**
 * `never` means every documented name resolves. Anything else is the name that does
 * not, and it appears in the error message.
 */
export type DocumentedPropsAllExist = Unknown extends never ? true : Unknown;
const _check: DocumentedPropsAllExist = true;
void _check;
