import { Checkbox } from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

/**
 * Children replace both default marks at once, so a custom checkbox supplies its own
 * for every state it wants to show.
 *
 * Which one is visible is a CSS question, not a React one: the Indicator carries the
 * same `data-checked` / `data-indeterminate` as the Root, so the stylesheet decides.
 * That is why nothing here reads the checked state — and why this works the same in an
 * uncontrolled checkbox, where the state is not in the consumer's hands at all.
 */
const MARK_CSS = `
  .demo-mark [data-when] { display: none; }
  .checkbox[data-checked] .demo-mark [data-when='checked'],
  .checkbox[data-indeterminate] .demo-mark [data-when='indeterminate'] { display: block; }
`;

function StarMark() {
  return (
    <Checkbox.Indicator className="demo-mark">
      <span data-when="checked">★</span>
      <span data-when="indeterminate">☆</span>
    </Checkbox.Indicator>
  );
}

export default function CheckboxCustomMark() {
  return (
    <>
      <style>{MARK_CSS}</style>

      <label htmlFor="starred" style={row}>
        <Checkbox.Root id="starred" defaultChecked>
          <StarMark />
        </Checkbox.Root>
        Starred
      </label>

      <label htmlFor="starred-partial" style={row}>
        <Checkbox.Root id="starred-partial" defaultChecked="indeterminate">
          <StarMark />
        </Checkbox.Root>
        Partially starred
      </label>
    </>
  );
}
