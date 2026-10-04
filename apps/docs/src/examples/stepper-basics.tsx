import { useState } from 'react';
import { Button, Link, Stepper, Stack, type StepperStatus } from '@arun-dev/ui';

const steps = ['Cart', 'Shipping', 'Payment', 'Review'];

export default function StepperBasics() {
  // The current step is yours: here a number in state, often the URL.
  const [current, setCurrent] = useState(1);
  const status = (index: number): StepperStatus =>
    index < current ? 'complete' : index === current ? 'current' : 'upcoming';

  return (
    <Stack gap="lg" style={{ inlineSize: '100%' }}>
      <Stepper.Root aria-label="Checkout progress">
        {steps.map((step, index) => (
          <Stepper.Item key={step} status={status(index)}>
            {/* A complete step links back to it — usually its own URL; the others are text. */}
            {index < current ? (
              <Link
                href={`#${step.toLowerCase()}`}
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(index);
                }}
              >
                {step}
              </Link>
            ) : (
              step
            )}
          </Stepper.Item>
        ))}
      </Stepper.Root>
      <Stack direction="row" gap="2xs" justify="between">
        <Button disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={current === steps.length - 1}
          onClick={() => setCurrent(current + 1)}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
