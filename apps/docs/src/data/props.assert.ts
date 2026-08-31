/**
 * Compile-time guard for the hand-written tables in props.ts.
 *
 * Every documented prop name must exist on the component's exported props type, so a
 * rename in the library fails `pnpm typecheck` here instead of quietly leaving the
 * documentation wrong. It asserts names, not descriptions — prose still needs a human.
 */
import type { BadgeProps, ButtonProps, CardProps, ChipProps } from '@arun-dev/ui';
import type { SwitchRootProps } from '@arun-dev/headless/switch';
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
  | OnlyRealProps<Documented<'Chip'>, ChipProps>
  | OnlyRealProps<Documented<'Badge'>, BadgeProps>
  | OnlyRealProps<Documented<'Switch.Root'>, SwitchRootProps>;

/**
 * `never` means every documented name resolves. Anything else is the name that does
 * not, and it appears in the error message.
 */
export type DocumentedPropsAllExist = Unknown extends never ? true : Unknown;
const _check: DocumentedPropsAllExist = true;
void _check;
