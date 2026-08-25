import { Button } from '@arun-dev/ui';

export default function ButtonAsLink() {
  return (
    <>
      {/* href is the shorthand — renders an <a> with the same styling. */}
      <Button href="https://example.com" target="_blank" rel="noopener noreferrer">
        External link
      </Button>

      {/* render takes any element or component — a router link, for instance. */}
      <Button variant="primary" render={<a href="#button" />}>
        Any element
      </Button>
    </>
  );
}
