import { Chip, Stack } from '@arun-dev/ui';

export default function ListsBasics() {
  return (
    <Stack gap="md">
      {/* In running text: bullets and numbers are part of the content, so the reset keeps them. */}
      <ul>
        <li>Bullets for items in no particular order</li>
        <li>
          Nested lists indent again
          <ul>
            <li>and change their marker</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Numbers for steps that go in order</li>
        <li>Each item counts up from the last</li>
      </ol>

      {/* As layout: role="list" drops the markers and the indent, and keeps the list announced
          as a list in Safari. */}
      <ul role="list" aria-label="Tags" style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
        <Chip render={<li />}>React</Chip>
        <Chip render={<li />}>CSS</Chip>
        <Chip render={<li />}>Accessibility</Chip>
      </ul>
    </Stack>
  );
}
