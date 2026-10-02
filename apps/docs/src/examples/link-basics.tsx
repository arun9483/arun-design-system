import { Link } from '@arun-dev/ui';
import { docsUrl } from '@/lib/url';

export default function LinkBasics() {
  return (
    <p style={{ margin: 0, maxInlineSize: '32rem' }}>
      {/* docsUrl adds the site's base path, as a router's link would. */}
      Read the <Link href={docsUrl('/getting-started/installation/')}>installation guide</Link>,
      then pick a brand in{' '}
      <Link href={docsUrl('/getting-started/theming/')}>Theming and brands</Link>. Sources are on{' '}
      <Link href="https://github.com/arun9483/arun-design-system" target="_blank" rel="noreferrer">
        GitHub (opens in a new tab)
      </Link>
      .
    </p>
  );
}
