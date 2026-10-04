import { Stack, Stepper, Text } from '@arun-dev/ui';

export default function StepperVertical() {
  return (
    <Stepper.Root aria-label="Workspace setup" orientation="vertical">
      <Stepper.Item status="complete">Create an account</Stepper.Item>
      <Stepper.Item status="current">
        {/* A label can hold more than a title: here a line of detail under it. */}
        <Stack gap="3xs">
          <span>Invite your team</span>
          <Text size="xs" color="muted" weight="normal">
            Optional — you can do this later.
          </Text>
        </Stack>
      </Stepper.Item>
      <Stepper.Item>Connect a repository</Stepper.Item>
      <Stepper.Item>Deploy</Stepper.Item>
    </Stepper.Root>
  );
}
