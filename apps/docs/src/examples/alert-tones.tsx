import { Alert } from '@arun-dev/ui';

const icon = (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
  </svg>
);

const tones = [
  { tone: 'neutral', title: 'Scheduled maintenance', text: 'Sunday 02:00–03:00 UTC.' },
  { tone: 'info', title: 'New in 4.16', text: 'Field, Link and Slider landed.' },
  { tone: 'success', title: 'Saved', text: 'Your changes are live.' },
  { tone: 'warning', title: 'Storage almost full', text: 'You have used 92% of your plan.' },
  { tone: 'error', title: 'Payment failed', text: 'Check the card details and try again.' },
] as const;

export default function AlertTones() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--space-sm)',
        inlineSize: '28rem',
        maxInlineSize: '100%',
      }}
    >
      {tones.map(({ tone, title, text }) => (
        <Alert.Root key={tone} tone={tone} icon={icon}>
          <Alert.Title>{title}</Alert.Title>
          <Alert.Description>{text}</Alert.Description>
        </Alert.Root>
      ))}
    </div>
  );
}
