import { Link } from '@arun-dev/ui';

export default function LinkBasics() {
  return (
    <p style={{ margin: 0, maxInlineSize: '32rem' }}>
      Read the <Link href="#installation">installation guide</Link>, then pick a brand in{' '}
      <Link href="#theming">Theming and brands</Link>. Sources are on{' '}
      <Link href="https://github.com/arun9483/arun-design-system" target="_blank" rel="noreferrer">
        GitHub (opens in a new tab)
      </Link>
      .
    </p>
  );
}
