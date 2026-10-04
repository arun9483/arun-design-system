import { Badge, Button, Chip, Stack } from '@arun-dev/ui';

export default function StackBasics() {
  return (
    // A column — the default — with sections a medium gap apart.
    <Stack gap="md" style={{ inlineSize: 'min(100%, 28rem)' }}>
      <Stack gap="3xs">
        <strong>Project settings</strong>
        <span className="text-color-secondary">A column of lines, a small step apart.</span>
      </Stack>

      {/* A row that wraps: chips move to a new line when they run out of room. */}
      <Stack direction="row" gap="2xs" wrap render={<ul role="list" aria-label="Tags" />}>
        {['React', 'TypeScript', 'CSS', 'Accessibility', 'Design tokens'].map((tag) => (
          <Chip key={tag} render={<li />}>
            {tag}
          </Chip>
        ))}
      </Stack>

      {/* A row with its ends pushed apart, lined up down the middle. */}
      <Stack direction="row" justify="between" align="center">
        <Badge tone="success">Saved</Badge>
        <Stack direction="row" gap="2xs">
          <Button>Cancel</Button>
          <Button variant="primary">Publish</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
