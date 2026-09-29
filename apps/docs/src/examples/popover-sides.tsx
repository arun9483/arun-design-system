import { Button, Popover } from '@arun-dev/ui';

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

export default function PopoverSides() {
  return (
    <>
      {SIDES.map((side) => (
        <Popover.Root key={side}>
          <Popover.Trigger render={<Button />}>{side}</Popover.Trigger>
          <Popover.Popup side={side} aria-label={`Opens on the ${side}`}>
            Opens on the {side}, and flips if there is no room.
          </Popover.Popup>
        </Popover.Root>
      ))}
    </>
  );
}
