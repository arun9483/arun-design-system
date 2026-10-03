import { OtpInput } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)' };

export default function OtpInputBasics() {
  return (
    <>
      {/* The <label> names the one <input> underneath the boxes. */}
      <div style={field}>
        <label htmlFor="otp-sms">Code from the text message</label>
        <OtpInput id="otp-sms" />
      </div>

      <div style={field}>
        <label htmlFor="otp-backup">Backup code (letters and digits)</label>
        <OtpInput id="otp-backup" length={8} validationType="alphanumeric" />
      </div>

      <div style={field}>
        <label htmlFor="otp-pin">Four-digit PIN</label>
        <OtpInput id="otp-pin" length={4} defaultValue="2468" disabled />
      </div>
    </>
  );
}
