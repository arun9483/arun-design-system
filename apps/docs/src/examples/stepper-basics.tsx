import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button,
  Field,
  Heading,
  Link,
  Paragraph,
  RadioGroup,
  Stack,
  Stepper,
  type StepperStatus,
} from '@arun-dev/ui';

const row = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2xs)' };

/** Each step's title, and what it shows. The content is yours: the Stepper only shows progress. */
const steps: { title: string; content: ReactNode }[] = [
  {
    title: 'Cart',
    content: <Paragraph>2 items: a notebook and a pen. Subtotal $18.00.</Paragraph>,
  },
  {
    title: 'Shipping',
    content: (
      <Field.Root>
        <Field.Label>Delivery address</Field.Label>
        <Field.Control defaultValue="12 Analytical Way, London" />
      </Field.Root>
    ),
  },
  {
    title: 'Payment',
    content: (
      <RadioGroup.Root
        defaultValue="card"
        aria-label="Payment method"
        style={{ display: 'grid', gap: 'var(--space-2xs)' }}
      >
        <label style={row}>
          <RadioGroup.Item value="card" /> Card ending 4242
        </label>
        <label style={row}>
          <RadioGroup.Item value="invoice" /> Pay by invoice
        </label>
      </RadioGroup.Root>
    ),
  },
  {
    title: 'Review',
    content: <Paragraph>2 items to 12 Analytical Way, paid by card. Total $22.50.</Paragraph>,
  },
];

export default function StepperBasics() {
  // The current step is yours: here a number in state, often the URL. steps.length means
  // the order is placed — every step complete, none current.
  const [current, setCurrent] = useState(0);
  const done = current === steps.length;
  const status = (index: number): StepperStatus =>
    index < current ? 'complete' : index === current ? 'current' : 'upcoming';

  // Moving to another step moves focus to its heading, so a screen reader announces it.
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [current]);
  const go = (step: number) => {
    moved.current = true;
    setCurrent(step);
  };

  return (
    <Stack gap="lg" style={{ inlineSize: '100%' }}>
      <Stepper.Root aria-label="Checkout progress">
        {steps.map(({ title }, index) => (
          <Stepper.Item key={title} status={status(index)}>
            {/* A complete step links back to it — usually its own URL — until the order is placed. */}
            {index < current && !done ? (
              <Link
                href={`#${title.toLowerCase()}`}
                onClick={(event) => {
                  event.preventDefault();
                  go(index);
                }}
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </Stepper.Item>
        ))}
      </Stepper.Root>

      {/* The current step's content, below the Stepper. */}
      <Stack gap="sm">
        <Heading level={3} size="lg" ref={heading} tabIndex={-1}>
          {done ? 'Order placed' : steps[current]?.title}
        </Heading>
        {done ? (
          <Paragraph>Thank you. A receipt is on its way.</Paragraph>
        ) : (
          steps[current]?.content
        )}
      </Stack>

      <Stack direction="row" gap="2xs" justify="between">
        {done ? (
          <Button onClick={() => go(0)}>Start over</Button>
        ) : (
          <>
            <Button disabled={current === 0} onClick={() => go(current - 1)}>
              Back
            </Button>
            {/* The last step completes itself: placing the order ticks it too. */}
            <Button variant="primary" onClick={() => go(current + 1)}>
              {current === steps.length - 1 ? 'Place order' : 'Next'}
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}
