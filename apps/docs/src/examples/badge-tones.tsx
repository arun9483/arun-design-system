import { Badge } from '@arun-dev/ui';

export default function BadgeTones() {
  return (
    <>
      <Badge>neutral</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="warning">warning</Badge>
      <Badge tone="error">error</Badge>
      <Badge tone="info">info</Badge>
    </>
  );
}
