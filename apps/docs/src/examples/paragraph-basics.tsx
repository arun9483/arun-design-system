import { Paragraph, Stack } from '@arun-dev/ui';

export default function ParagraphBasics() {
  return (
    <Stack gap="sm">
      <Paragraph>
        Paragraphs stop at a readable line length, around 65 characters, however wide the container.
        Long lines are hard to follow back to the start of the next one, so the width is capped and
        never forced — a narrower column still wins.
      </Paragraph>
      <Paragraph size="sm" color="secondary">
        A smaller, quieter paragraph for supporting text, such as a caption or small print.
      </Paragraph>
    </Stack>
  );
}
