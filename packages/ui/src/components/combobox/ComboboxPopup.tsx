import { Combobox as Headless } from '@arun-dev/headless/combobox';
import type { ComboboxPopupProps } from '@arun-dev/headless/combobox';
import { cn } from '../../lib/cn';

/** The box the list opens in, as wide as the field. Placement and behaviour are headless's. */
export function ComboboxPopup({ className, ...props }: ComboboxPopupProps) {
  return <Headless.Popup {...props} className={cn('combobox-popup', className)} />;
}
