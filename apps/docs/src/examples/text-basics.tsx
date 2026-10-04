import { Paragraph, Text } from '@arun-dev/ui';

export default function TextBasics() {
  return (
    <Paragraph>
      Updated{' '}
      <Text render={<time dateTime="2026-10-04" />} color="muted">
        4 Oct 2026
      </Text>{' '}
      by <Text weight="semibold">Ada</Text>. The build is{' '}
      <Text render={<strong />} color="accent">
        ready to ship
      </Text>
      , with{' '}
      <Text size="sm" color="secondary">
        3 warnings
      </Text>{' '}
      left.
    </Paragraph>
  );
}
