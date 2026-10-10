import { Button } from '@arun-dev/ui';

export default function ButtonVariants() {
  return (
    <>
      <Button>Ghost</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="danger-ghost">Delete</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
