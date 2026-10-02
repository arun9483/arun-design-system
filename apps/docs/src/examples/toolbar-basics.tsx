import { Toggle, ToggleGroup, Toolbar } from '@arun-dev/ui';
import { docsUrl } from '@/lib/url';

// One Tab stop: Tab in, then the arrow keys across everything, the ToggleGroup included.
export default function ToolbarBasics() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <ToggleGroup aria-label="Style" multiple>
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
      </ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Button>Undo</Toolbar.Button>
      <Toolbar.Button disabled>Redo</Toolbar.Button>
      <Toolbar.Separator />
      <Toolbar.Input aria-label="Font size" defaultValue="14" />
      <Toolbar.Link href={docsUrl('/components/kbd/')}>Shortcuts</Toolbar.Link>
    </Toolbar.Root>
  );
}
