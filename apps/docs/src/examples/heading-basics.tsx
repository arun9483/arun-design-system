import { Heading, Paragraph, Stack } from '@arun-dev/ui';

export default function HeadingBasics() {
  return (
    <Stack gap="md">
      {/* Each level at its own size: the default. */}
      <Stack gap="2xs">
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <Heading key={level} level={level}>
            Heading level {level}
          </Heading>
        ))}
      </Stack>

      {/* A card's title is an h3 in this page's outline, but should not look like a section. */}
      <Stack gap="3xs">
        <Heading level={3} size="lg">
          Starter plan
        </Heading>
        <Paragraph color="secondary">The level follows the outline; size sets the look.</Paragraph>
      </Stack>
    </Stack>
  );
}
