import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Link } from './link';

describe('Link', () => {
  it('is an <a href> with the link class', () => {
    render(<Link href="/docs">Docs</Link>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveClass('link');
  });

  it("keeps the styling on a router's link given through render", () => {
    function RouterLink({ children, ...props }: React.ComponentProps<'a'>) {
      return (
        <a data-router="" {...props}>
          {children}
        </a>
      );
    }
    render(
      <Link render={<RouterLink href="/blog" />} className="nav">
        Blog
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Blog' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveClass('link', 'nav');
  });
});
